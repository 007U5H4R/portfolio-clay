/**
 * EVAL-027 (cursor half, S29/EV10, TASK-142): no Paper Trail cursor bytes in the first-load set of
 * `/` or of any other route. Runs `scripts/bundle-budget.ts --forbid` over the REAL `.next` build and
 * also greps each prerendered HTML (inlined CSS/RSC payload). SKIPs visibly with no build — never a
 * vacuous pass. A planted-marker fixture proves the scan can fail. (The 3D-stack markers join this
 * file's list with TASK-143.)
 */
import { afterAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

const ROOT = process.cwd();
const SCRIPT = resolve(ROOT, "scripts/bundle-budget.ts");
const APP_DIR = resolve(ROOT, ".next/server/app");
const built = existsSync(resolve(APP_DIR, "index.html"));

/** Strings that exist only in the lazily loaded cursor chunk / stylesheet. */
const CURSOR_MARKERS = ["data-paper-cursor", "paperCursor", "portfolio-cursor", "cursor-trail-item", "has-custom-cursor", "/cursor/trail/"];

function budget(cwd: string, route: string) {
  const r = spawnSync("pnpm", ["exec", "tsx", SCRIPT, "--route", route, "--json", "--forbid", CURSOR_MARKERS.join(",")], { cwd, encoding: "utf8" });
  return JSON.parse((r.stdout ?? "").trim());
}

function htmlRoutes(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = resolve(dir, e.name);
    if (e.isDirectory()) return htmlRoutes(p);
    return e.name.endsWith(".html") ? [p] : [];
  });
}

const SPAWN_TIMEOUT = 120_000;

describe.skipIf(!built)("EVAL-027 · cursor isolation on the real build", () => {
  it("home first-load set has 0 cursor bytes", () => {
    const parsed = budget(ROOT, "/");
    expect(parsed.ok).toBe(true);
    expect(parsed.forbiddenHits).toEqual([]);
    expect(parsed.overBudget).toBe(false);
  }, SPAWN_TIMEOUT);

  it("no prerendered route's HTML or first-load chunks carry a cursor marker", () => {
    const files = htmlRoutes(APP_DIR).filter((f) => !/\/lab(\.html|\/)/.test(f));
    expect(files.length).toBeGreaterThan(5);
    for (const file of files) {
      const html = readFileSync(file, "utf8");
      for (const marker of CURSOR_MARKERS) expect(html.includes(marker), `${relative(ROOT, file)} contains "${marker}"`).toBe(false);
      const route = "/" + relative(APP_DIR, file).replace(/\.html$/, "").replace(/^index$/, "");
      const parsed = budget(ROOT, route);
      if (parsed.ok) expect(parsed.forbiddenHits, route).toEqual([]);
    }
  }, SPAWN_TIMEOUT);

  it("the cursor module exists as its own chunk (the scan is not vacuous)", () => {
    const dir = resolve(ROOT, ".next/static/chunks");
    const hit = readdirSync(dir).some((f) => f.endsWith(".js") && readFileSync(resolve(dir, f), "utf8").includes("cursor-trail-item"));
    expect(hit).toBe(true);
  });
});

describe("EVAL-027 · planted-marker fixture", () => {
  let dir = "";
  afterAll(() => dir && rmSync(dir, { recursive: true, force: true }));
  it("--forbid exits non-zero and names the chunk when a marker is planted", () => {
    mkdirSync(resolve(ROOT, ".eval"), { recursive: true });
    dir = mkdtempSync(resolve(ROOT, ".eval", "eval027-fixture-"));
    mkdirSync(resolve(dir, ".next/server/app"), { recursive: true });
    mkdirSync(resolve(dir, ".next/static/chunks"), { recursive: true });
    writeFileSync(resolve(dir, ".next/static/chunks/a.js"), `console.log("clean");`);
    writeFileSync(resolve(dir, ".next/static/chunks/b.js"), `el.dataset.paperCursor="x";const c="cursor-trail-item";`);
    writeFileSync(resolve(dir, ".next/server/app/index.html"), `<script src="/_next/static/chunks/a.js"></script><script src="/_next/static/chunks/b.js"></script>`);
    const parsed = budget(dir, "/");
    expect(parsed.forbiddenHits.map((h: { file: string }) => h.file)).toEqual(["static/chunks/b.js", "static/chunks/b.js"]);
    const human = spawnSync("pnpm", ["exec", "tsx", SCRIPT, "--forbid", "cursor-trail-item"], { cwd: dir, encoding: "utf8" });
    expect(human.status).toBe(1);
  }, SPAWN_TIMEOUT);
});
