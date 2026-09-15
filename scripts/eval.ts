/**
 * eval.ts — minimal `pnpm eval` orchestrator, schema v1 (technical-plan.md §A16 / §B S07.05).
 *
 * The tracer-bullet runner. It builds (unless --skip-build), runs the automated layers that exist
 * on the tracer — Playwright (EVAL-006/008/010/015), Lighthouse CI mobile+desktop (EVAL-004),
 * bundle budget (EVAL-005) — maps every EVAL id in evals/eval-cases.json to a status, records real
 * provenance, and writes evals/results/<label>.json WITHOUT ever overwriting an existing file.
 *
 * Status mapping (tracer):
 *   PASS/FAIL  EVAL-006, 008, 010, 015 (Playwright, tagged)
 *   measured   EVAL-004, 005 (Lighthouse + bundle) — informational on the tracer (thresholds
 *              are enforced from TKT-07/S11.01; a FAIL here never gates the baseline)
 *   MANUAL     EVAL-001, 003, 009, 017 (human / inspector review)
 *   SKIP       EVAL-002, 007, 011, 012, 013, 014, 016 (layers not built until TKT-07/TKT-09)
 *
 * Flags: --label <name> · --only EVAL-0xx[,…] · --skip-build · --informational
 * Exit: non-zero on any FAIL among `critical` cases unless --informational (tracer only) or a
 * runner error (3). The full runner (regressions, --baseline diff, security, vitest) lands at S12.01.
 *
 * E-DRIVE: Playwright + LHCI child processes inherit PLAYWRIGHT_BROWSERS_PATH / TMPDIR from
 * .env.tooling (merged into their env below), so no browser or temp file touches the internal disk.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import * as os from "node:os";

const ROOT = process.cwd();
const RESULTS_DIR = resolve(ROOT, "evals/results");
const EVAL_CASES_PATH = resolve(ROOT, "evals/eval-cases.json");
const PW_JSON = resolve(ROOT, ".eval/playwright.json");
const BASE_URL = "http://127.0.0.1:3000";
const VIEWPORTS = [390, 768, 1024, 1440];
const THRESHOLDS = {
  lighthouse: [90, 95, 95, 95] as const, // performance, accessibility, best-practices, seo
  lcpMs: 2500,
  cls: 0.05,
  jsKb: 180,
  axe: "0 critical/serious",
};

// EVAL id → tracer disposition (see header).
const PLAYWRIGHT_CASES = ["EVAL-006", "EVAL-008", "EVAL-010", "EVAL-015"];
const MANUAL_CASES = ["EVAL-001", "EVAL-003", "EVAL-009", "EVAL-017"];
const NOT_BUILT_CASES = ["EVAL-002", "EVAL-007", "EVAL-011", "EVAL-012", "EVAL-013", "EVAL-014", "EVAL-016"];

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
  informational?: boolean;
  measured?: unknown;
  threshold?: unknown;
  details: string;
  artifacts?: string[];
}

// --------------------------------------------------------------------------- flags
function flagValue(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
}
const label = flagValue("--label") ?? "";
const only = (flagValue("--only") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const skipBuild = process.argv.includes("--skip-build");
const informational = process.argv.includes("--informational");

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

/** Parse the committed, secret-free .env.tooling into an env object for child processes. */
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
const CHILD_ENV = { ...process.env, ...loadEnvTooling() };

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
  for (const child of (node.suites ?? []) as { specs?: PwSpec[]; suites?: unknown[] }[]) {
    collectSpecs(child, acc);
  }
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
  if (failing.length > 0) {
    return { status: "FAIL", details: `${failing.length} failing: ${failing.slice(0, 5).join("; ")}` };
  }
  if (ran === 0) return { status: "SKIP", details: "all tagged specs skipped" };
  return { status: "PASS", details: `${tagged.length} specs, ${ran} runs across ${[...projects].sort().join("/")}` };
}

// --------------------------------------------------------------------------- Lighthouse layer
interface LhManifestEntry {
  url: string;
  isRepresentativeRun: boolean;
  summary: { performance: number; accessibility: number; "best-practices": number; seo: number };
  jsonPath: string;
}
function readLighthouse(formFactor: "mobile" | "desktop"): {
  scores: number[] | null;
  lcpMs: number | null;
  cls: number | null;
  artifact: string;
} {
  const dir = resolve(ROOT, ".lighthouseci", formFactor);
  const manifestPath = resolve(dir, "manifest.json");
  if (!existsSync(manifestPath)) return { scores: null, lcpMs: null, cls: null, artifact: dir };
  const manifest = readJSON<LhManifestEntry[]>(manifestPath);
  if (manifest.length === 0) return { scores: null, lcpMs: null, cls: null, artifact: dir };
  const rep = manifest.find((m) => m.isRepresentativeRun) ?? manifest[0]!;
  const scores = [
    Math.round(rep.summary.performance * 100),
    Math.round(rep.summary.accessibility * 100),
    Math.round(rep.summary["best-practices"] * 100),
    Math.round(rep.summary.seo * 100),
  ];
  // Median LCP/CLS across all runs (read every lhr in the dir).
  const lcps: number[] = [];
  const clss: number[] = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".report.json"))) {
    try {
      const lhr = readJSON<{ audits: Record<string, { numericValue?: number }> }>(resolve(dir, file));
      const lcp = lhr.audits["largest-contentful-paint"]?.numericValue;
      const cls = lhr.audits["cumulative-layout-shift"]?.numericValue;
      if (typeof lcp === "number") lcps.push(lcp);
      if (typeof cls === "number") clss.push(cls);
    } catch {
      /* skip unreadable report */
    }
  }
  return {
    scores,
    lcpMs: lcps.length ? Math.round(median(lcps)) : null,
    cls: clss.length ? Number(median(clss).toFixed(4)) : null,
    artifact: dir,
  };
}

// --------------------------------------------------------------------------- main
function main(): void {
  const started = Date.now();
  if (!existsSync(EVAL_CASES_PATH)) die(3, `eval-cases.json not found at ${EVAL_CASES_PATH}`);
  const evalCasesRaw = readFileSync(EVAL_CASES_PATH, "utf8");
  const evalCases = (JSON.parse(evalCasesRaw) as { cases: EvalCaseDef[] }).cases;
  const evalCasesSha256 = createHash("sha256").update(evalCasesRaw).digest("hex");

  const onlySet = new Set(only);
  const wants = (id: string) => onlySet.size === 0 || onlySet.has(id);

  // 1) Build.
  if (!skipBuild) {
    console.log("[eval] building (pnpm build)…");
    const code = runInherit("pnpm", ["build"]);
    if (code !== 0) die(3, "pnpm build failed");
  } else {
    console.log("[eval] --skip-build: using existing .next");
  }

  // 2) Playwright (EVAL-006/008/010/015).
  const runsPlaywright = PLAYWRIGHT_CASES.some(wants);
  let specs: PwSpec[] = [];
  if (runsPlaywright) {
    console.log("[eval] running Playwright…");
    const pwArgs = ["exec", "playwright", "test"];
    if (onlySet.size > 0) {
      const grep = PLAYWRIGHT_CASES.filter(wants)
        .map((id) => `@${id}`)
        .join("|");
      if (grep) pwArgs.push("--grep", grep);
    }
    runInherit("pnpm", pwArgs); // failures are captured from the JSON, not the exit code
    if (!existsSync(PW_JSON)) die(3, `Playwright JSON not written at ${PW_JSON}`);
    specs = collectSpecs(readJSON(PW_JSON));
  }

  // 3) Lighthouse (EVAL-004) + bundle (EVAL-005).
  const runsLighthouse = wants("EVAL-004") || wants("EVAL-005");
  let mobile = { scores: null as number[] | null, lcpMs: null as number | null, cls: null as number | null, artifact: "" };
  let desktop = { scores: null as number[] | null, lcpMs: null as number | null, cls: null as number | null, artifact: "" };
  if (runsLighthouse) {
    console.log("[eval] running Lighthouse CI (mobile)…");
    runInherit("pnpm", ["exec", "lhci", "autorun", "--config", "lighthouserc.mobile.json"]);
    console.log("[eval] running Lighthouse CI (desktop)…");
    runInherit("pnpm", ["exec", "lhci", "autorun", "--config", "lighthouserc.desktop.json"]);
    mobile = readLighthouse("mobile");
    desktop = readLighthouse("desktop");
  }
  let jsKb: number | null = null;
  if (wants("EVAL-005")) {
    const out = spawnSync("pnpm", ["exec", "tsx", "scripts/bundle-budget.ts", "--route", "/", "--json"], {
      cwd: ROOT,
      env: CHILD_ENV,
      encoding: "utf8",
    });
    try {
      const parsed = JSON.parse((out.stdout ?? "").trim());
      if (parsed.ok) jsKb = parsed.firstLoadJsGzipKb as number;
    } catch {
      /* leave jsKb null → measured incomplete */
    }
  }

  // 4) Assemble cases.
  const cases: ResultCase[] = [];
  for (const def of evalCases) {
    const base = { id: def.id, priority: def.priority, category: def.category };
    if (!wants(def.id)) {
      cases.push({ ...base, status: "SKIP", details: "excluded by --only" });
      continue;
    }
    if (PLAYWRIGHT_CASES.includes(def.id)) {
      const r = playwrightStatus(specs, def.id);
      cases.push({ ...base, status: r.status, details: r.details, artifacts: [".eval/playwright.json"] });
    } else if (def.id === "EVAL-004") {
      const pass =
        mobile.scores !== null &&
        desktop.scores !== null &&
        mobile.scores.every((v, i) => v >= THRESHOLDS.lighthouse[i]!) &&
        desktop.scores.every((v, i) => v >= THRESHOLDS.lighthouse[i]!);
      cases.push({
        ...base,
        status: mobile.scores && desktop.scores ? (pass ? "PASS" : "FAIL") : "SKIP",
        informational: true,
        measured: { "/": { mobile: mobile.scores, desktop: desktop.scores } },
        threshold: THRESHOLDS.lighthouse,
        details: `informational on tracer (thresholds enforced from TKT-07); mobile=${JSON.stringify(mobile.scores)} desktop=${JSON.stringify(desktop.scores)}`,
        artifacts: [mobile.artifact, desktop.artifact],
      });
    } else if (def.id === "EVAL-005") {
      const jsOk = jsKb !== null && jsKb <= THRESHOLDS.jsKb;
      const lcpOk = mobile.lcpMs !== null && mobile.lcpMs <= THRESHOLDS.lcpMs;
      const clsOk = mobile.cls !== null && mobile.cls < THRESHOLDS.cls;
      const complete = jsKb !== null && mobile.lcpMs !== null && mobile.cls !== null;
      cases.push({
        ...base,
        status: complete ? (jsOk && lcpOk && clsOk ? "PASS" : "FAIL") : "SKIP",
        informational: true,
        measured: { jsKbGzip: jsKb, lcpMs: mobile.lcpMs, cls: mobile.cls },
        threshold: { jsKbGzip: THRESHOLDS.jsKb, lcpMs: THRESHOLDS.lcpMs, cls: THRESHOLDS.cls },
        details: `informational on tracer; first-load JS ${jsKb} kB gz, LCP(mobile) ${mobile.lcpMs} ms, CLS(mobile) ${mobile.cls}`,
        artifacts: [mobile.artifact],
      });
    } else if (MANUAL_CASES.includes(def.id)) {
      cases.push({
        ...base,
        status: "MANUAL",
        details: "human / inspector review — see evals/results/gate-tracer evidence + TKT-02 gate",
      });
    } else if (NOT_BUILT_CASES.includes(def.id)) {
      cases.push({ ...base, status: "SKIP", details: "not built yet" });
    } else {
      cases.push({ ...base, status: "SKIP", details: "not built yet" });
    }
  }

  // 5) Totals + gating.
  const totals = {
    cases: cases.length,
    passed: cases.filter((c) => c.status === "PASS").length,
    failed: cases.filter((c) => c.status === "FAIL").length,
    skipped: cases.filter((c) => c.status === "SKIP").length,
    manual: cases.filter((c) => c.status === "MANUAL").length,
  };
  const criticalFailures = cases
    .filter((c) => c.priority === "critical" && c.status === "FAIL" && !c.informational)
    .map((c) => c.id);

  // 6) Provenance.
  const version = readJSON<{ version: string }>(resolve(ROOT, "package.json")).version;
  const commit = trySh("git", ["rev-parse", "HEAD"]);
  const branch = trySh("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
  const dirty = trySh("git", ["status", "--porcelain"]).length > 0;
  const shortSha = commit.slice(0, 7);
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
    regressions: [] as unknown[], // baseline diff lands at S12.01
    improvements: [] as unknown[],
    runtimeMs: Date.now() - started,
    baseline: "evals/results/baseline-v1.json",
  };

  // 7) Write, never overwriting.
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
  console.log(
    `[eval] totals: ${totals.passed} pass · ${totals.failed} fail · ${totals.skipped} skip · ${totals.manual} manual (of ${totals.cases})`,
  );
  for (const c of cases.filter((x) => x.status === "FAIL")) {
    console.log(`[eval]   FAIL ${c.id}${c.informational ? " (informational)" : ""}: ${c.details}`);
  }

  if (!informational && criticalFailures.length > 0) {
    die(1, `critical FAIL: ${criticalFailures.join(", ")}`);
  }
  process.exit(0);
}

main();
