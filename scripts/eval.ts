/**
 * eval.ts — the `pnpm eval` orchestrator, schema v1 (technical-plan.md §A16 / §B S12.01).
 *
 * Runs every automated evaluation layer, maps each result to its EVAL id, records real provenance,
 * diffs against a baseline, and writes evals/results/<label>.json WITHOUT ever overwriting a file.
 *
 * Layers (each gated by --only):
 *   Vitest      → EVAL-012 (Ask provider suite, TKT-09), EVAL-017 (SEO tag unit)
 *   Playwright  → EVAL-002, 006, 007, 008, 010, 011, 014, 017 (tags on served HTML)
 *   Lighthouse  → EVAL-004 (median category scores /route/form-factor), EVAL-005 (LCP/CLS + JS budget)
 *   Content gate→ EVAL-013 (validate-content + forbidden-strings + fixture proof)
 *   Security    → EVAL-016 (forbidden-strings --bundle + pnpm audit + TP9 headers when --base-url)
 *   Manual      → EVAL-001, 003, 009, and the EVAL-017 inspector sub-result (recorded, not executed)
 *
 * Flags:
 *   --label <name>      output basename (evals/results/<name>.json); default eval-run-<version>-<sha>
 *   --only EVAL-0xx,…   run only these ids (others SKIP "excluded by --only")
 *   --baseline <file>   baseline to diff against (default evals/results/baseline-v1.json)
 *   --base-url <url>    evaluate a deployed origin: skips build/local server, adds the header check
 *   --skip-build        reuse the existing .next instead of rebuilding
 *   --help              print this flag list and exit
 *
 * Exit codes: 0 clean · 1 critical FAIL · 2 regression (no critical FAIL) · 3 runner error.
 *
 * E-DRIVE: child processes inherit PLAYWRIGHT_BROWSERS_PATH / TMPDIR from .env.tooling (merged into
 * CHILD_ENV below), so no browser/temp file touches the internal disk (the `eval` npm script also
 * wraps this in `dotenv -e .env.tooling`).
 */
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import * as os from "node:os";
import { checkHeaders } from "./security-headers";

const ROOT = process.cwd();
const RESULTS_DIR = resolve(ROOT, "evals/results");
const EVAL_CASES_PATH = resolve(ROOT, "evals/eval-cases.json");
const PW_JSON = resolve(ROOT, ".eval/playwright.json");
const VITEST_JSON = resolve(ROOT, ".eval/vitest.json");

const VIEWPORTS = [390, 768, 1024, 1440];
const THRESHOLDS = {
  lighthouse: [90, 95, 95, 95] as const, // performance, accessibility, best-practices, seo
  lcpMs: 2500,
  cls: 0.05,
  jsKb: 180,
  axe: "0 critical/serious",
};
// Regression sensitivity (A16): a Lighthouse median dropping >3 pts, or first-load JS growing >10 kB.
const LH_REGRESSION_PTS = 3;
const JS_REGRESSION_KB = 10;

const PLAYWRIGHT_CASES = ["EVAL-002", "EVAL-006", "EVAL-007", "EVAL-008", "EVAL-010", "EVAL-011", "EVAL-014", "EVAL-015", "EVAL-017"];
const VITEST_CASES = ["EVAL-012", "EVAL-017"];
const MANUAL_CASES = ["EVAL-001", "EVAL-003", "EVAL-009"];
const METRIC_CASES = ["EVAL-004", "EVAL-005"]; // diffed by metric, not status-flip

type Status = "PASS" | "FAIL" | "SKIP" | "MANUAL";

interface EvalCaseDef {
  id: string;
  priority: string;
  category: string;
}
interface ResultCase {
  id: string;
  status: Status;
  priority: string;
  category: string;
  /**
   * Informational cases are recorded truthfully (real measured values, thresholds unchanged) but do
   * NOT gate the run. Local Lighthouse performance (EVAL-004/005) is informational because Chromium
   * here runs under software rendering (swiftshader, no GPU), so its perf/LCP scores are an
   * environment artifact, not a real regression — the real perf gate is production + TKT-49 (A14/F5/EV2).
   */
  informational?: boolean;
  envCaveat?: string;
  measured?: unknown;
  threshold?: unknown;
  details: string;
  artifacts?: string[];
}
interface DiffEntry {
  id: string;
  kind: "status" | "lighthouse" | "bundle";
  detail: string;
}

// --------------------------------------------------------------------------- flags
function flagValue(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
}
const HELP = `pnpm eval — evaluation orchestrator (technical-plan.md §A16)

Flags:
  --label <name>     output basename under evals/results/ (default eval-run-<version>-<sha>)
  --only EVAL-0xx,…  run only these EVAL ids (comma-separated); others are SKIP
  --baseline <file>  baseline JSON to diff against (default evals/results/baseline-v1.json)
  --base-url <url>   evaluate a deployed origin (skips build + local server; adds the TP9 header check)
  --skip-build       reuse the existing .next build instead of rebuilding
  --reuse            assemble the run from the layer artifacts already on disk (.eval/*.json,
                     .lighthouseci/*) without re-executing vitest/playwright/lighthouse — for a
                     memory-constrained host where Lighthouse's Chrome would OOM. Implies --skip-build.
  --help             print this help and exit

Exit codes: 0 clean · 1 critical FAIL · 2 regression · 3 runner error.`;

if (process.argv.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

const label = flagValue("--label") ?? "";
const only = (flagValue("--only") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const baselineFlag = flagValue("--baseline");
const baseUrlFlag = flagValue("--base-url");
const reuse = process.argv.includes("--reuse");
const skipBuild = process.argv.includes("--skip-build") || !!baseUrlFlag || reuse;
const BASE_URL = baseUrlFlag ?? "http://127.0.0.1:3000";

// --------------------------------------------------------------------------- helpers
function sh(cmd: string, args: string[]): string {
  return execFileSync(cmd, args, { cwd: ROOT, encoding: "utf8" }).trim();
}
function trySh(cmd: string, args: string[]): string {
  try {
    return sh(cmd, args);
  } catch {
    return "";
  }
}
function readJSON<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}
function median(nums: number[]): number {
  if (nums.length === 0) return NaN;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

function loadEnvTooling(): Record<string, string> {
  const out: Record<string, string> = {};
  const p = resolve(ROOT, ".env.tooling");
  if (!existsSync(p)) return out;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return out;
}
// The ambient environment wins over `.env.tooling`, matching the `dotenv -e .env.tooling` wrapper's
// own non-override semantics (dotenv-cli never overwrites a var already set). Locally the wrapper has
// already injected these before this process starts, so both orders agree; on CI the runner exports
// real Linux TMPDIR / PLAYWRIGHT_BROWSERS_PATH (the E-Drive paths in .env.tooling do not exist there,
// so letting the file win made the internal `pnpm build` fail with ENOENT on `/Volumes`).
const CHILD_ENV: NodeJS.ProcessEnv = { ...loadEnvTooling(), ...process.env };
if (baseUrlFlag) CHILD_ENV.PW_BASE_URL = baseUrlFlag;

function runInherit(cmd: string, args: string[]): number {
  const r = spawnSync(cmd, args, { cwd: ROOT, env: CHILD_ENV, stdio: "inherit" });
  return r.status ?? 1;
}
function die(code: number, message: string): never {
  console.error(`\n[eval] ERROR: ${message}`);
  process.exit(code);
}
function nextVersionFromLockfile(): string {
  try {
    const lock = readFileSync(resolve(ROOT, "pnpm-lock.yaml"), "utf8");
    const m = lock.match(/next@(\d+\.\d+\.\d+)/);
    if (m) return m[1]!;
  } catch {
    /* fall through */
  }
  try {
    return readJSON<{ version: string }>(resolve(ROOT, "node_modules/next/package.json")).version;
  } catch {
    return "unknown";
  }
}

// --------------------------------------------------------------------------- Playwright layer
interface PwTest {
  projectName: string;
  status: string; // expected | unexpected | flaky | skipped
}
interface PwSpec {
  title: string;
  tags: string[];
  tests: PwTest[];
}
function collectSpecs(node: { specs?: PwSpec[]; suites?: unknown[] }, acc: PwSpec[] = []): PwSpec[] {
  for (const s of node.specs ?? []) acc.push(s);
  for (const child of (node.suites ?? []) as { specs?: PwSpec[]; suites?: unknown[] }[]) collectSpecs(child, acc);
  return acc;
}
function playwrightStatus(specs: PwSpec[], evalId: string): { status: Status; details: string } {
  const tagged = specs.filter((s) => (s.tags ?? []).includes(evalId));
  if (tagged.length === 0) return { status: "SKIP", details: "no tagged specs found" };
  const failing: string[] = [];
  const projects = new Set<string>();
  let ran = 0;
  for (const sp of tagged) {
    for (const t of sp.tests) {
      projects.add(t.projectName);
      if (t.status === "skipped") continue;
      ran++;
      if (t.status === "unexpected") failing.push(`${sp.title} [${t.projectName}]`);
    }
  }
  if (failing.length > 0) return { status: "FAIL", details: `${failing.length} failing: ${failing.slice(0, 5).join("; ")}` };
  if (ran === 0) return { status: "SKIP", details: "all tagged specs skipped (fixme/deferred)" };
  return { status: "PASS", details: `${tagged.length} specs, ${ran} runs across ${[...projects].sort().join("/")}` };
}

// --------------------------------------------------------------------------- Vitest layer
interface VitestFile {
  name: string;
  status: string; // passed | failed
}
function vitestFiles(): VitestFile[] {
  if (!existsSync(VITEST_JSON)) return [];
  try {
    const j = readJSON<{ testResults: VitestFile[] }>(VITEST_JSON);
    return j.testResults ?? [];
  } catch {
    return [];
  }
}
/** "pass" | "fail" | "absent" for the first test file whose path includes `substr`. */
function vitestFileStatus(files: VitestFile[], substr: string): "pass" | "fail" | "absent" {
  const f = files.find((x) => x.name.includes(substr));
  if (!f) return "absent";
  return f.status === "passed" ? "pass" : "fail";
}

// --------------------------------------------------------------------------- Lighthouse layer
interface LhManifestEntry {
  url: string;
  isRepresentativeRun: boolean;
  summary: { performance: number; accessibility: number; "best-practices": number; seo: number };
  jsonPath: string;
}
interface RouteScore {
  scores: number[];
  lcpMs: number | null;
  cls: number | null;
}
function readLighthouse(formFactor: "mobile" | "desktop"): { byRoute: Record<string, RouteScore>; artifact: string } {
  const dir = resolve(ROOT, ".lighthouseci", formFactor);
  const manifestPath = resolve(dir, "manifest.json");
  const byRoute: Record<string, RouteScore> = {};
  if (!existsSync(manifestPath)) return { byRoute, artifact: dir };
  const manifest = readJSON<LhManifestEntry[]>(manifestPath);
  const groups = new Map<string, LhManifestEntry[]>();
  for (const m of manifest) {
    let path = m.url;
    try {
      path = new URL(m.url).pathname;
    } catch {
      /* keep raw */
    }
    const g = groups.get(path) ?? [];
    g.push(m);
    groups.set(path, g);
  }
  for (const [path, entries] of groups) {
    const rep = entries.find((e) => e.isRepresentativeRun) ?? entries[0]!;
    const scores = [
      Math.round(rep.summary.performance * 100),
      Math.round(rep.summary.accessibility * 100),
      Math.round(rep.summary["best-practices"] * 100),
      Math.round(rep.summary.seo * 100),
    ];
    const lcps: number[] = [];
    const clss: number[] = [];
    for (const e of entries) {
      try {
        const lhr = readJSON<{ audits: Record<string, { numericValue?: number }> }>(resolve(ROOT, e.jsonPath));
        const lcp = lhr.audits["largest-contentful-paint"]?.numericValue;
        const cls = lhr.audits["cumulative-layout-shift"]?.numericValue;
        if (typeof lcp === "number") lcps.push(lcp);
        if (typeof cls === "number") clss.push(cls);
      } catch {
        /* skip unreadable */
      }
    }
    byRoute[path] = {
      scores,
      lcpMs: lcps.length ? Math.round(median(lcps)) : null,
      cls: clss.length ? Number(median(clss).toFixed(4)) : null,
    };
  }
  return { byRoute, artifact: dir };
}

type LhPair = { mobile: ReturnType<typeof readLighthouse>; desktop: ReturnType<typeof readLighthouse> };
function runLighthousePair(): LhPair {
  console.log("[eval] running Lighthouse CI (mobile)…");
  runInherit("pnpm", ["exec", "lhci", "autorun", "--config", "lighthouserc.mobile.json"]);
  console.log("[eval] running Lighthouse CI (desktop)…");
  runInherit("pnpm", ["exec", "lhci", "autorun", "--config", "lighthouserc.desktop.json"]);
  return { mobile: readLighthouse("mobile"), desktop: readLighthouse("desktop") };
}

// --------------------------------------------------------------------------- content gate (EVAL-013)
function evaluateContentGate(): { status: Status; details: string; artifacts: string[] } {
  const problems: string[] = [];
  const vc = spawnSync("pnpm", ["exec", "tsx", "scripts/validate-content.ts"], { cwd: ROOT, env: CHILD_ENV, encoding: "utf8" });
  if ((vc.status ?? 1) !== 0) problems.push(`validate-content exit ${vc.status}`);

  const fbArgs = ["exec", "tsx", "scripts/forbidden-strings.ts"];
  if (existsSync(resolve(ROOT, ".next"))) fbArgs.push("--bundle");
  const fb = spawnSync("pnpm", fbArgs, { cwd: ROOT, env: CHILD_ENV, encoding: "utf8" });
  if ((fb.status ?? 1) !== 0) problems.push(`forbidden-strings exit ${fb.status}`);
  const fbSummary = (fb.stdout ?? "").trim().split("\n").filter((l) => l.includes("hits in")).pop() ?? "forbidden-strings clean";

  const proofPath = resolve(RESULTS_DIR, "content-gate-proof.txt");
  if (!existsSync(proofPath)) {
    problems.push("content-gate-proof.txt missing");
  } else {
    const proof = readFileSync(proofPath, "utf8");
    const issueLines = (proof.match(/ → .+?:/g) ?? []).length;
    if (!/exit=[^0]/.test(proof)) problems.push("proof does not show a non-zero build exit");
    if (issueLines < 3) problems.push(`proof has ${issueLines} issue lines (<3)`);
  }
  if (problems.length > 0) return { status: "FAIL", details: problems.join("; "), artifacts: ["evals/results/content-gate-proof.txt"] };
  return {
    status: "PASS",
    details: `validate-content OK · ${fbSummary} · fixture proof present (non-zero build, 3 issues)`,
    artifacts: ["evals/results/content-gate-proof.txt"],
  };
}

// --------------------------------------------------------------------------- security (EVAL-016)
async function evaluateSecurity(): Promise<{ status: Status; details: string }> {
  const problems: string[] = [];
  const notes: string[] = [];

  const fb = spawnSync("pnpm", ["exec", "tsx", "scripts/forbidden-strings.ts", "--bundle"], { cwd: ROOT, env: CHILD_ENV, encoding: "utf8" });
  if ((fb.status ?? 1) !== 0) problems.push("forbidden-strings --bundle found hits");
  else notes.push("0 forbidden/PII strings");

  // Use the EXIT CODE of `pnpm audit --audit-level high` as the source of truth: it honours the
  // deliberate accepted-risk list in pnpm-workspace.yaml (`auditConfig.ignoreGhsas` — dev-only,
  // unpatchable LHCI transitive advisories) and exits non-zero only on a NON-ignored high/critical.
  // (The `--json` metadata counts still tally the ignored advisories, so parsing them double-counts
  // accepted risk and produces a false FAIL — see docs/reports/TKT-07b.md.)
  const audit = spawnSync("pnpm", ["audit", "--audit-level", "high"], { cwd: ROOT, env: CHILD_ENV, encoding: "utf8" });
  if ((audit.status ?? 0) !== 0) problems.push("pnpm audit: non-ignored high/critical vulnerability");
  else notes.push("0 high/critical deps (audit-level high; ignoreGhsas accepted-risks respected)");

  if (baseUrlFlag) {
    const hc = await checkHeaders(baseUrlFlag);
    if (hc.error) problems.push(`header check error: ${hc.error}`);
    else if (!hc.ok) problems.push(`missing headers: ${hc.missing.join(", ")}`);
    else notes.push("all TP9 headers present");
  } else {
    notes.push("headers SKIP (needs --base-url; TP9 headers exist only on a deployment, TKT-50)");
  }

  if (problems.length > 0) return { status: "FAIL", details: problems.join("; ") };
  return { status: "PASS", details: notes.join(" · ") };
}

// --------------------------------------------------------------------------- baseline diff
function diffAgainstBaseline(
  cases: ResultCase[],
  baseline: { cases: EvalCaseDef & ResultCase[] } | null,
): { regressions: DiffEntry[]; improvements: DiffEntry[] } {
  const regressions: DiffEntry[] = [];
  const improvements: DiffEntry[] = [];
  if (!baseline || !Array.isArray((baseline as unknown as { cases: ResultCase[] }).cases)) {
    return { regressions, improvements };
  }
  const blCases = (baseline as unknown as { cases: ResultCase[] }).cases;
  const byId = new Map(blCases.map((c) => [c.id, c]));

  for (const cur of cases) {
    const bl = byId.get(cur.id);
    if (!bl) continue;

    if (!METRIC_CASES.includes(cur.id)) {
      if (bl.status === "PASS" && cur.status === "FAIL") {
        regressions.push({ id: cur.id, kind: "status", detail: `PASS → FAIL: ${cur.details}` });
      } else if (bl.status === "FAIL" && cur.status === "PASS") {
        improvements.push({ id: cur.id, kind: "status", detail: "FAIL → PASS" });
      }
      continue;
    }

    if (cur.id === "EVAL-004") {
      const curM = (cur.measured ?? {}) as Record<string, { mobile?: number[]; desktop?: number[] }>;
      const blM = (bl.measured ?? {}) as Record<string, { mobile?: number[]; desktop?: number[] }>;
      for (const route of Object.keys(blM)) {
        for (const ff of ["mobile", "desktop"] as const) {
          const b = blM[route]?.[ff];
          const c = curM[route]?.[ff];
          if (!b || !c) continue;
          for (let i = 0; i < Math.min(b.length, c.length); i++) {
            const drop = b[i]! - c[i]!;
            if (drop > LH_REGRESSION_PTS) {
              regressions.push({ id: cur.id, kind: "lighthouse", detail: `${route} ${ff}[${i}] ${b[i]}→${c[i]} (−${drop})` });
            } else if (c[i]! - b[i]! > LH_REGRESSION_PTS) {
              improvements.push({ id: cur.id, kind: "lighthouse", detail: `${route} ${ff}[${i}] ${b[i]}→${c[i]} (+${c[i]! - b[i]!})` });
            }
          }
        }
      }
    }

    if (cur.id === "EVAL-005") {
      const curJs = (cur.measured as { jsKbGzip?: number } | undefined)?.jsKbGzip ?? null;
      const blJs = (bl.measured as { jsKbGzip?: number } | undefined)?.jsKbGzip ?? null;
      if (curJs !== null && blJs !== null) {
        if (curJs - blJs > JS_REGRESSION_KB) {
          regressions.push({ id: cur.id, kind: "bundle", detail: `first-load JS ${blJs}→${curJs} kB gz (+${(curJs - blJs).toFixed(1)})` });
        } else if (blJs - curJs > JS_REGRESSION_KB) {
          improvements.push({ id: cur.id, kind: "bundle", detail: `first-load JS ${blJs}→${curJs} kB gz (−${(blJs - curJs).toFixed(1)})` });
        }
      }
    }
  }
  return { regressions, improvements };
}

// --------------------------------------------------------------------------- main
async function main(): Promise<void> {
  const started = Date.now();
  if (!existsSync(EVAL_CASES_PATH)) die(3, `eval-cases.json not found at ${EVAL_CASES_PATH}`);
  const evalCasesRaw = readFileSync(EVAL_CASES_PATH, "utf8");
  const evalCases = (JSON.parse(evalCasesRaw) as { cases: EvalCaseDef[] }).cases;
  const evalCasesSha256 = createHash("sha256").update(evalCasesRaw).digest("hex");
  const knownIds = new Set(evalCases.map((c) => c.id));

  // Validate --only ids up-front (unknown id → runner error 3).
  const unknown = only.filter((id) => !knownIds.has(id));
  if (unknown.length > 0) die(3, `unknown EVAL id(s) in --only: ${unknown.join(", ")}`);

  const onlySet = new Set(only);
  const wants = (id: string) => onlySet.size === 0 || onlySet.has(id);

  // 1) Build.
  if (!skipBuild) {
    console.log("[eval] building (pnpm build)…");
    if (runInherit("pnpm", ["build"]) !== 0) die(3, "pnpm build failed");
  } else {
    console.log(baseUrlFlag ? `[eval] --base-url ${baseUrlFlag}: skipping build + local server` : "[eval] --skip-build: using existing .next");
  }

  // 2) Vitest (EVAL-012, 017 unit).
  const runsVitest = VITEST_CASES.some(wants);
  let vf: VitestFile[] = [];
  if (runsVitest) {
    if (reuse) {
      console.log("[eval] --reuse: reading existing .eval/vitest.json");
      if (!existsSync(VITEST_JSON)) die(3, `--reuse but no ${VITEST_JSON}`);
    } else {
      console.log("[eval] running Vitest…");
      runInherit("pnpm", ["exec", "vitest", "run"]);
    }
    vf = vitestFiles();
  }

  // 3) Playwright.
  const runsPlaywright = PLAYWRIGHT_CASES.some(wants);
  let specs: PwSpec[] = [];
  if (runsPlaywright) {
    if (reuse) {
      console.log("[eval] --reuse: reading existing .eval/playwright.json");
    } else {
      console.log("[eval] running Playwright…");
      const pwArgs = ["exec", "playwright", "test"];
      if (onlySet.size > 0) {
        const grep = PLAYWRIGHT_CASES.filter(wants).map((id) => `@${id}`).join("|");
        if (grep) pwArgs.push("--grep", grep);
      }
      runInherit("pnpm", pwArgs); // failures captured from JSON, not exit code
    }
    if (!existsSync(PW_JSON)) die(3, `Playwright JSON not found at ${PW_JSON}${reuse ? " (--reuse needs a prior run)" : ""}`);
    specs = collectSpecs(readJSON(PW_JSON));
  }

  const baselinePath = resolve(RESULTS_DIR, baselineFlag ?? "baseline-v1.json");
  const baseline = existsSync(baselinePath) ? readJSON<{ cases: EvalCaseDef & ResultCase[] }>(baselinePath) : null;

  // 4) Lighthouse (EVAL-004) + bundle (EVAL-005). A single pass — the scores are INFORMATIONAL
  // locally (see below): Chromium runs under swiftshader (no GPU), so perf/LCP are an environment
  // artifact, not a real regression. Real values are still recorded; the real perf gate is
  // production + TKT-49 (A14/F5/EV2). No flake-rerun: perf never gates locally, so a rerun would
  // only double a memory-heavy step to chase an unreliable number.
  const runsLighthouse = wants("EVAL-004") || wants("EVAL-005");
  let mobile = { byRoute: {} as Record<string, RouteScore>, artifact: "" };
  let desktop = { byRoute: {} as Record<string, RouteScore>, artifact: "" };
  let lighthouseSkippedReason = "";
  if (runsLighthouse) {
    if (baseUrlFlag) {
      lighthouseSkippedReason = "base-url mode: run `pnpm exec lhci autorun` against the preview per docs/eval.md";
      console.log(`[eval] Lighthouse SKIP — ${lighthouseSkippedReason}`);
    } else if (reuse) {
      console.log("[eval] --reuse: reading existing .lighthouseci/{mobile,desktop} manifests");
      mobile = readLighthouse("mobile");
      desktop = readLighthouse("desktop");
    } else {
      const pair = runLighthousePair();
      mobile = pair.mobile;
      desktop = pair.desktop;
    }
  }
  let jsKb: number | null = null;
  if (wants("EVAL-005") && !baseUrlFlag) {
    const out = spawnSync("pnpm", ["exec", "tsx", "scripts/bundle-budget.ts", "--route", "/", "--json"], { cwd: ROOT, env: CHILD_ENV, encoding: "utf8" });
    try {
      const parsed = JSON.parse((out.stdout ?? "").trim());
      if (parsed.ok) jsKb = parsed.firstLoadJsGzipKb as number;
    } catch {
      /* jsKb stays null */
    }
  }

  // 5) Content gate + security (async).
  const contentGate = wants("EVAL-013") ? evaluateContentGate() : null;
  const security = wants("EVAL-016") ? await evaluateSecurity() : null;

  // 6) Assemble cases.
  const homeMobile = mobile.byRoute["/"];
  const cases: ResultCase[] = [];
  for (const def of evalCases) {
    const base = { id: def.id, priority: def.priority, category: def.category };
    if (!wants(def.id)) {
      cases.push({ ...base, status: "SKIP", details: "excluded by --only" });
      continue;
    }

    if (def.id === "EVAL-004") {
      const routes = new Set([...Object.keys(mobile.byRoute), ...Object.keys(desktop.byRoute)]);
      const measured: Record<string, { mobile: number[] | null; desktop: number[] | null }> = {};
      let allPass = routes.size > 0;
      for (const r of routes) {
        const m = mobile.byRoute[r]?.scores ?? null;
        const d = desktop.byRoute[r]?.scores ?? null;
        measured[r] = { mobile: m, desktop: d };
        for (const s of [m, d]) {
          if (!s) {
            allPass = false;
            continue;
          }
          if (!s.every((v, i) => v >= THRESHOLDS.lighthouse[i]!)) allPass = false;
        }
      }
      cases.push({
        ...base,
        status: lighthouseSkippedReason ? "SKIP" : routes.size === 0 ? "SKIP" : allPass ? "PASS" : "FAIL",
        informational: true,
        envCaveat:
          "Local Chromium runs under swiftshader (software rendering, no GPU); perf scores are an environment artifact, informational only — real perf gate is production + TKT-49 (A14/F5/EV2). Thresholds unchanged.",
        measured,
        threshold: THRESHOLDS.lighthouse,
        details:
          lighthouseSkippedReason ||
          (routes.size === 0 ? "no Lighthouse output" : `${routes.size} routes × mobile+desktop, median of 3 (informational — swiftshader)`),
        artifacts: [mobile.artifact, desktop.artifact].filter(Boolean),
      });
    } else if (def.id === "EVAL-005") {
      const lcp = homeMobile?.lcpMs ?? null;
      const cls = homeMobile?.cls ?? null;
      const jsOk = jsKb !== null && jsKb <= THRESHOLDS.jsKb;
      const lcpOk = lcp !== null && lcp <= THRESHOLDS.lcpMs;
      const clsOk = cls !== null && cls < THRESHOLDS.cls;
      const complete = jsKb !== null && lcp !== null && cls !== null;
      cases.push({
        ...base,
        status: lighthouseSkippedReason ? "SKIP" : complete ? (jsOk && lcpOk && clsOk ? "PASS" : "FAIL") : "SKIP",
        informational: true,
        envCaveat:
          "first-load JS budget is deterministic and REAL (over-budget → TKT-14/49 perf levers, F5/A14/EV2); LCP is swiftshader-affected (informational). Non-gating locally; thresholds unchanged.",
        measured: { jsKbGzip: jsKb, lcpMs: lcp, cls },
        threshold: { jsKbGzip: THRESHOLDS.jsKb, lcpMs: THRESHOLDS.lcpMs, cls: THRESHOLDS.cls },
        details: lighthouseSkippedReason || `first-load JS ${jsKb} kB gz (budget ${THRESHOLDS.jsKb}), LCP(mobile) ${lcp} ms, CLS(mobile) ${cls}`,
        artifacts: [mobile.artifact].filter(Boolean),
      });
    } else if (def.id === "EVAL-013") {
      const r = contentGate!;
      cases.push({ ...base, status: r.status, details: r.details, artifacts: r.artifacts });
    } else if (def.id === "EVAL-016") {
      const r = security!;
      cases.push({ ...base, status: r.status, details: r.details });
    } else if (def.id === "EVAL-012") {
      const st = vitestFileStatus(vf, "eval-012");
      cases.push({
        ...base,
        status: st === "absent" ? "SKIP" : st === "pass" ? "PASS" : "FAIL",
        details: st === "absent" ? "provider suite not built yet (TKT-09)" : `vitest eval-012 ${st}`,
        artifacts: [".eval/vitest.json"],
      });
    } else if (def.id === "EVAL-017") {
      const unit = vitestFileStatus(vf, "seo");
      const spec = playwrightStatus(specs, "EVAL-017");
      let status: Status;
      if (unit === "fail" || spec.status === "FAIL") status = "FAIL";
      else if ((unit === "pass" || unit === "absent") && spec.status === "PASS") status = "PASS";
      else if (unit === "pass" && spec.status === "SKIP") status = "PASS";
      else status = "SKIP";
      cases.push({
        ...base,
        status,
        details: `tags: seo unit ${unit}, eval-017 spec ${spec.status.toLowerCase()} (${spec.details}); inspector rendering MANUAL (TKT-51)`,
        artifacts: [".eval/vitest.json", ".eval/playwright.json"],
      });
    } else if (PLAYWRIGHT_CASES.includes(def.id)) {
      const r = playwrightStatus(specs, def.id);
      cases.push({ ...base, status: r.status, details: r.details, artifacts: [".eval/playwright.json"] });
    } else if (MANUAL_CASES.includes(def.id)) {
      cases.push({ ...base, status: "MANUAL", details: "human / inspector review — see evals/results/gate-tracer + test-cases.md traceability" });
    } else {
      cases.push({ ...base, status: "SKIP", details: "no runner mapping" });
    }
  }

  // 7) Totals, baseline diff, gating.
  const totals = {
    cases: cases.length,
    passed: cases.filter((c) => c.status === "PASS").length,
    failed: cases.filter((c) => c.status === "FAIL").length,
    skipped: cases.filter((c) => c.status === "SKIP").length,
    manual: cases.filter((c) => c.status === "MANUAL").length,
  };
  // Informational cases (local Lighthouse under swiftshader) are recorded truthfully but never gate.
  const informationalIds = new Set(cases.filter((c) => c.informational).map((c) => c.id));
  const criticalFailures = cases
    .filter((c) => c.priority === "critical" && c.status === "FAIL" && !c.informational)
    .map((c) => c.id);

  // Stage 9 scar (QA-007): an `unexpected` Playwright result in an UNTAGGED spec never reached any
  // EVAL id, so this run exited 0 with `criticalFailures: []` while the suite had 5 real, deterministic
  // failures (deep-dive overflow at w390 in case-study.spec.ts) — and the M-007 gate's QA-005 before
  // that. The Playwright suite IS the gate: ANY failing test now fails the run, closed, and the
  // failing titles are persisted so a report can never quietly omit them.
  const playwrightUnexpected = specs.flatMap((sp) =>
    sp.tests.filter((t) => t.status === "unexpected").map((t) => `${sp.title} [${t.projectName}]`),
  );
  if (playwrightUnexpected.length > 0) {
    criticalFailures.push(
      `PLAYWRIGHT-SUITE (${playwrightUnexpected.length} failing: ${playwrightUnexpected.slice(0, 5).join("; ")})`,
    );
  }

  const { regressions, improvements } = diffAgainstBaseline(cases, baseline);
  // Regressions on informational cases (perf under swiftshader) are recorded but do not gate.
  const gatingRegressions = regressions.filter((r) => !informationalIds.has(r.id));

  // 8) Provenance.
  const version = readJSON<{ version: string }>(resolve(ROOT, "package.json")).version;
  const commit = trySh("git", ["rev-parse", "HEAD"]);
  const branch = trySh("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
  const dirty = trySh("git", ["status", "--porcelain"]).length > 0;
  const shortSha = commit.slice(0, 7) || "nogit";
  const runId = `eval-run-${version}-${shortSha}`;
  const provenance = {
    version,
    commit,
    branch,
    dirty,
    node: process.version,
    pnpm: trySh("pnpm", ["-v"]),
    next: nextVersionFromLockfile(),
    os: `${os.platform()} ${os.release()}`,
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    evalCasesSha256,
    config: {
      viewports: VIEWPORTS,
      lighthouseRuns: 3,
      thresholds: {
        lighthouse: THRESHOLDS.lighthouse,
        lcpMs: THRESHOLDS.lcpMs,
        cls: THRESHOLDS.cls,
        jsKb: THRESHOLDS.jsKb,
        axe: THRESHOLDS.axe,
      },
    },
  };

  const result = {
    schemaVersion: 1,
    runId,
    label: label || runId,
    provenance,
    totals,
    cases,
    criticalFailures,
    /** Every failing Playwright test, tagged or not — never silently omitted (Stage-9 QA-007 scar). */
    playwrightUnexpected,
    regressions,
    improvements,
    runtimeMs: Date.now() - started,
    baseline: baseline ? `evals/results/${baselineFlag ?? "baseline-v1.json"}` : null,
  };

  // 9) Write, never overwriting.
  mkdirSync(RESULTS_DIR, { recursive: true });
  const baseName = label || runId;
  let outPath = resolve(RESULTS_DIR, `${baseName}.json`);
  let n = 2;
  while (existsSync(outPath)) {
    outPath = resolve(RESULTS_DIR, `${baseName}-${n}.json`);
    n++;
  }
  writeFileSync(outPath, JSON.stringify(result, null, 2) + "\n", "utf8");

  console.log(`\n[eval] wrote ${outPath}`);
  console.log(`[eval] totals: ${totals.passed} pass · ${totals.failed} fail · ${totals.skipped} skip · ${totals.manual} manual (of ${totals.cases})`);
  for (const c of cases.filter((x) => x.status === "FAIL")) {
    console.log(`[eval]   FAIL ${c.id} (${c.priority})${c.informational ? " [informational]" : ""}: ${c.details}`);
  }
  if (regressions.length) for (const r of regressions) console.log(`[eval]   REGRESSION ${r.id} (${r.kind})${informationalIds.has(r.id) ? " [informational]" : ""}: ${r.detail}`);
  if (improvements.length) for (const im of improvements) console.log(`[eval]   improvement ${im.id} (${im.kind}): ${im.detail}`);

  if (criticalFailures.length > 0) die(1, `critical FAIL: ${criticalFailures.join(", ")}`);
  if (gatingRegressions.length > 0) die(2, `regression vs baseline: ${gatingRegressions.map((r) => r.id).join(", ")}`);
  process.exit(0);
}

void main();
