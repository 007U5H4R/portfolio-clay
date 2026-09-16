/**
 * bundle-budget.ts (technical-plan.md §A9 / §B S07.06, EVAL-005) — first-load JS budget for `/`.
 *
 * Minimal, bundler-agnostic first version (the fuller manifest-summing budget lands at S11.02).
 * The plan assumed webpack's `app-build-manifest.json`, but Next 16.3.5 builds with Turbopack,
 * which does not emit that file. So instead of trusting a bundler-specific manifest, we read the
 * route's ACTUAL prerendered HTML (`.next/server/app/<route>.html`) — the source of truth for what
 * the browser downloads on first load — collect every `/_next/static/**.js` it references
 * (script src + modulepreload), gzip each chunk from `.next/static`, and sum. That is exactly the
 * first-load JS payload for that route, however the bundler chose to split it.
 *
 * Usage:
 *   tsx scripts/bundle-budget.ts [--route /] [--budget 180] [--json]
 * Human mode prints `first-load JS (/) = NN.N kB gz (budget 180)` and exits 1 when over budget.
 * `--json` prints a machine-readable object and always exits 0 (the eval orchestrator gates).
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = process.cwd();
const NEXT_DIR = resolve(ROOT, ".next");
const BUDGET_KB_DEFAULT = 180;

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i === -1 ? undefined : process.argv[i + 1];
}

const route = arg("--route") ?? "/";
const budgetKb = Number(arg("--budget") ?? BUDGET_KB_DEFAULT);
const asJson = process.argv.includes("--json");

/** Map a route path to its prerendered HTML file under `.next/server/app`. */
function htmlFileForRoute(r: string): string {
  const clean = r.replace(/^\/+|\/+$/g, "");
  const name = clean === "" ? "index" : clean;
  return resolve(NEXT_DIR, "server/app", `${name}.html`);
}

function fail(message: string): never {
  if (asJson) {
    process.stdout.write(JSON.stringify({ ok: false, error: message }) + "\n");
    process.exit(0);
  }
  console.error(`bundle-budget: ${message}`);
  process.exit(1);
}

const htmlPath = htmlFileForRoute(route);
if (!existsSync(htmlPath)) {
  fail(`prerendered HTML not found for route "${route}" at ${htmlPath} — run \`pnpm build\` first`);
}

const html = readFileSync(htmlPath, "utf8");
const refs = Array.from(html.matchAll(/\/_next\/(static\/[^"'\s?]+\.js)/g)).map((m) => m[1]!);
const uniqueRefs = Array.from(new Set(refs));

if (uniqueRefs.length === 0) {
  fail(`no /_next/static/*.js chunks referenced by ${htmlPath}`);
}

let totalGzip = 0;
let totalRaw = 0;
const chunks: { file: string; rawBytes: number; gzipBytes: number }[] = [];
for (const rel of uniqueRefs) {
  const filePath = resolve(NEXT_DIR, rel);
  if (!existsSync(filePath)) {
    // A referenced chunk missing from disk means the build is inconsistent — surface it.
    fail(`chunk referenced by HTML is missing on disk: ${filePath}`);
  }
  const buf = readFileSync(filePath);
  const raw = statSync(filePath).size;
  const gz = gzipSync(buf, { level: 9 }).length;
  totalRaw += raw;
  totalGzip += gz;
  chunks.push({ file: rel, rawBytes: raw, gzipBytes: gz });
}

const gzipKb = totalGzip / 1024;
const rawKb = totalRaw / 1024;
const overBudget = gzipKb > budgetKb;

if (asJson) {
  process.stdout.write(
    JSON.stringify({
      ok: true,
      route,
      chunkCount: uniqueRefs.length,
      firstLoadJsGzipBytes: totalGzip,
      firstLoadJsGzipKb: Number(gzipKb.toFixed(1)),
      firstLoadJsRawKb: Number(rawKb.toFixed(1)),
      budgetKb,
      overBudget,
      chunks,
    }) + "\n",
  );
  process.exit(0);
}

console.log(
  `first-load JS (${route}) = ${gzipKb.toFixed(1)} kB gz (budget ${budgetKb}) — ${uniqueRefs.length} chunks, ${rawKb.toFixed(1)} kB raw`,
);
process.exit(overBudget ? 1 : 0);
