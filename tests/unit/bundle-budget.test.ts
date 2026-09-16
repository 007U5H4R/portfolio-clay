/**
 * bundle-budget.test.ts (technical-plan.md §B S11.02, EVAL-005) — fixture test for the first-load
 * JS budget script. Builds a throwaway `.next` layout (a prerendered HTML file referencing two
 * static chunks) under a git-ignored temp dir and runs `scripts/bundle-budget.ts` against it, so
 * the gzip-sum + budget logic is verified without a real Next build.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { gzipSync } from "node:zlib";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();
const SCRIPT = resolve(ROOT, "scripts/bundle-budget.ts");

// Deterministic but INCOMPRESSIBLE chunk bodies (seeded LCG → random-looking base36) so gzip does
// not shrink them to a few bytes — the budget arithmetic below needs a realistic gz size (tens of kB).
function pseudoRandom(seed: number, length: number): string {
  let s = seed >>> 0;
  let out = "";
  for (let i = 0; i < length; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    out += (s % 36).toString(36);
  }
  return out;
}
const CHUNK_A = pseudoRandom(1, 90_000) + "\n// chunk-a\n";
const CHUNK_B = pseudoRandom(2, 45_000) + "\n// chunk-b\n";
const expectedGzipBytes = gzipSync(Buffer.from(CHUNK_A), { level: 9 }).length + gzipSync(Buffer.from(CHUNK_B), { level: 9 }).length;
const expectedGzipKb = Number((expectedGzipBytes / 1024).toFixed(1));

let fixtureDir: string;

function run(args: string[]): { status: number; stdout: string } {
  const r = spawnSync("pnpm", ["exec", "tsx", SCRIPT, ...args], {
    cwd: fixtureDir,
    encoding: "utf8",
  });
  return { status: r.status ?? -1, stdout: r.stdout ?? "" };
}

beforeAll(() => {
  fixtureDir = mkdtempSync(resolve(ROOT, ".eval", "bundle-fixture-"));
  const appDir = resolve(fixtureDir, ".next/server/app");
  const staticDir = resolve(fixtureDir, ".next/static/chunks");
  mkdirSync(appDir, { recursive: true });
  mkdirSync(staticDir, { recursive: true });
  writeFileSync(resolve(staticDir, "a.js"), CHUNK_A);
  writeFileSync(resolve(staticDir, "b.js"), CHUNK_B);
  writeFileSync(
    resolve(appDir, "index.html"),
    `<!doctype html><html><head>
       <link rel="modulepreload" href="/_next/static/chunks/b.js"/>
     </head><body>
       <script src="/_next/static/chunks/a.js"></script>
       <script src="/_next/static/chunks/a.js"></script>
     </body></html>`,
  );
});

afterAll(() => {
  if (fixtureDir) rmSync(fixtureDir, { recursive: true, force: true });
});

describe("bundle-budget", () => {
  it("sums the gzip size of every unique first-load chunk referenced by the route HTML", () => {
    const { status, stdout } = run(["--route", "/", "--json"]);
    expect(status).toBe(0); // --json always exits 0 (the orchestrator gates)
    const parsed = JSON.parse(stdout.trim());
    expect(parsed.ok).toBe(true);
    expect(parsed.chunkCount).toBe(2); // the duplicate a.js reference is de-duped
    expect(parsed.firstLoadJsGzipBytes).toBe(expectedGzipBytes);
    expect(parsed.firstLoadJsGzipKb).toBe(expectedGzipKb);
  });

  it("exits 0 in human mode when under budget", () => {
    const { status, stdout } = run(["--route", "/", "--budget", "180"]);
    expect(status).toBe(0);
    expect(stdout).toContain("first-load JS (/) =");
    expect(stdout).toContain("(budget 180)");
  });

  it("exits 1 in human mode when over budget (threshold never lowered to pass)", () => {
    const tiny = Math.max(1, Math.floor(expectedGzipKb) - 1);
    const { status } = run(["--route", "/", "--budget", String(tiny)]);
    expect(status).toBe(1);
  });

  it("reports overBudget=true in JSON without failing the process", () => {
    const { status, stdout } = run(["--route", "/", "--budget", "1", "--json"]);
    expect(status).toBe(0);
    expect(JSON.parse(stdout.trim()).overBudget).toBe(true);
  });
});
