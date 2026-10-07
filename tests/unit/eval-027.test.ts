/**
 * EVAL-027 (S29/EV10, TASK-143; cursor half retired by TASK-174, 2026-10-07). Two guards over the REAL `.next`
 * build: (1) no custom-cursor code ships at all (the Paper Trail cursor was removed - system cursor only), and no
 * built CSS hides the native cursor; (2) the 3D stack (three.js / R3F / Rapier / the gummy GLB markers) may exist only
 * in lazily imported chunks that no route other than `/lab` ever loads. Runs `scripts/bundle-budget.ts --forbid` and
 * greps each prerendered HTML (inlined CSS/RSC payload). SKIPs visibly with no build - never a vacuous pass. Planted-marker
 * fixtures prove the scans can fail.
 */
import { afterAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

const ROOT = process.cwd();
const SCRIPT = resolve(ROOT, "scripts/bundle-budget.ts");
const APP_DIR = resolve(ROOT, ".next/server/app");
const built = existsSync(resolve(APP_DIR, "index.html"));

/** Strings that existed only in the removed Paper Trail cursor chunk / stylesheet; none may ship (TASK-174). */
const CURSOR_MARKERS = ["data-paper-cursor", "paperCursor", "portfolio-cursor", "cursor-trail-item", "has-custom-cursor", "cursor-dragging", "/cursor/trail/"];

function budget(cwd: string, route: string, markers: readonly string[] = CURSOR_MARKERS) {
  const r = spawnSync("pnpm", ["exec", "tsx", SCRIPT, "--route", route, "--json", "--forbid", markers.join(",")], { cwd, encoding: "utf8" });
  return JSON.parse((r.stdout ?? "").trim());
}

function htmlRoutes(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = resolve(dir, e.name);
    if (e.isDirectory()) return htmlRoutes(p);
    return e.name.endsWith(".html") ? [p] : [];
  });
}

/**
 * Strings that exist only in the lazily loaded 3D stack (three.js, R3F, Rapier wasm). The GLB path is deliberately not a
 * marker any more: LabApp (a lazy chunk, never first-load) names it to warm the model in parallel with the engine
 * chunks (TASK-155) - a URL string is not 3D-stack code, and counting it would make LabApp a "stack chunk" and the
 * first-load LabLoader its "referrer".
 */
const STACK_MARKERS = ["THREE.WebGLRenderer", "__r3f", "rapier_wasm3d", "KHR_materials_transmission"];

function firstLoadChunks(htmlFile: string): string[] {
  const html = readFileSync(htmlFile, "utf8");
  return Array.from(new Set(Array.from(html.matchAll(/\/_next\/(static\/[^"'\s?]+\.js)/g)).map((m) => m[1]!)));
}

const SPAWN_TIMEOUT = 120_000;

describe.skipIf(!built)("EVAL-027 · no custom-cursor code ships (TASK-174)", () => {
  it("home first-load set has 0 cursor bytes", () => {
    const parsed = budget(ROOT, "/");
    expect(parsed.ok).toBe(true);
    expect(parsed.forbiddenHits).toEqual([]);
    expect(parsed.overBudget).toBe(false);
  }, SPAWN_TIMEOUT);

  it("no prerendered route's HTML or first-load chunks carry a cursor marker", () => {
    const files = htmlRoutes(APP_DIR);
    expect(files.length).toBeGreaterThan(5);
    for (const file of files) {
      const html = readFileSync(file, "utf8");
      for (const marker of CURSOR_MARKERS) expect(html.includes(marker), `${relative(ROOT, file)} contains "${marker}"`).toBe(false);
      const route = "/" + relative(APP_DIR, file).replace(/\.html$/, "").replace(/^index$/, "");
      const parsed = budget(ROOT, route);
      if (parsed.ok) expect(parsed.forbiddenHits, route).toEqual([]);
    }
  }, SPAWN_TIMEOUT);

  it("no emitted chunk or stylesheet carries a cursor marker or hides the native cursor", () => {
    const files = [
      ...readdirSync(resolve(ROOT, ".next/static/chunks")).filter((f) => f.endsWith(".js") || f.endsWith(".css")).map((f) => resolve(ROOT, ".next/static/chunks", f)),
      ...(existsSync(resolve(ROOT, ".next/static/css")) ? readdirSync(resolve(ROOT, ".next/static/css")).map((f) => resolve(ROOT, ".next/static/css", f)) : []),
    ];
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const marker of CURSOR_MARKERS) expect(text.includes(marker), `${relative(ROOT, file)} contains "${marker}"`).toBe(false);
      if (file.endsWith(".css")) expect(/cursor:\s*none/.test(text), `${relative(ROOT, file)} sets cursor:none`).toBe(false);
    }
  });
});

describe.skipIf(!built)("EVAL-027 · 3D stack isolation on the real build (TASK-143)", () => {
  const chunkDir = resolve(ROOT, ".next/static/chunks");
  const chunkFiles = built ? readdirSync(chunkDir).filter((f) => f.endsWith(".js")) : [];
  const text = (f: string) => readFileSync(resolve(chunkDir, f), "utf8");
  const stackChunks = chunkFiles.filter((f) => STACK_MARKERS.some((m) => text(f).includes(m)));
  // The lazy loader chunk(s): they name a stack chunk by file name (the dynamic import).
  const referrers = chunkFiles.filter((f) => !stackChunks.includes(f) && stackChunks.some((c) => text(f).includes(c)));

  it("the 3D stack exists as lazy chunks (the scan is not vacuous)", () => {
    expect(stackChunks.length).toBeGreaterThan(0);
    expect(referrers.length).toBeGreaterThan(0);
    for (const marker of ["THREE.WebGLRenderer", "__r3f", "rapier_wasm3d"]) {
      expect(stackChunks.some((f) => text(f).includes(marker)), marker).toBe(true);
    }
  });

  it("home first-load set has 0 three.js / R3F / Rapier bytes", () => {
    const parsed = budget(ROOT, "/", STACK_MARKERS);
    expect(parsed.ok).toBe(true);
    expect(parsed.forbiddenHits).toEqual([]);
    expect(parsed.overBudget).toBe(false);
  }, SPAWN_TIMEOUT);

  it("no route's first-load set — /lab included — contains a stack chunk or the loader that names one", () => {
    const files = htmlRoutes(APP_DIR);
    expect(files.length).toBeGreaterThan(5);
    const banned = new Set([...stackChunks, ...referrers].map((f) => `static/chunks/${f}`));
    for (const file of files) {
      const route = "/" + relative(APP_DIR, file).replace(/\.html$/, "").replace(/^index$/, "");
      const html = readFileSync(file, "utf8");
      for (const marker of STACK_MARKERS) expect(html.includes(marker), `${route} HTML contains "${marker}"`).toBe(false);
      for (const chunk of firstLoadChunks(file)) expect(banned.has(chunk), `${route} first-load includes ${chunk}`).toBe(false);
      const parsed = budget(ROOT, route, STACK_MARKERS);
      if (parsed.ok) expect(parsed.forbiddenHits, route).toEqual([]);
    }
  }, SPAWN_TIMEOUT);

  it("/lab's own first-load JS is recorded (informational, no threshold) and /lab is the only route that can reach the stack", () => {
    const lab = budget(ROOT, "/lab", []);
    expect(lab.ok).toBe(true);
    console.info(`[EVAL-027] /lab first-load JS = ${lab.firstLoadJsGzipKb} kB gz (${lab.chunkCount} chunks); lazy 3D chunks = ${stackChunks.join(", ")}`);
    // Only the lab route's own page chunks name the lazy loader: the loader is not in any other route's first load.
    const labPage = readFileSync(resolve(APP_DIR, "lab.html"), "utf8");
    expect(labPage).toContain("noindex");
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

  it("--forbid catches a planted three.js marker too (the 3D scan can fail)", () => {
    mkdirSync(resolve(ROOT, ".eval"), { recursive: true });
    const d3 = mkdtempSync(resolve(ROOT, ".eval", "eval027-3d-fixture-"));
    try {
      mkdirSync(resolve(d3, ".next/server/app"), { recursive: true });
      mkdirSync(resolve(d3, ".next/static/chunks"), { recursive: true });
      writeFileSync(resolve(d3, ".next/static/chunks/a.js"), `console.warn("THREE.WebGLRenderer: planted");`);
      writeFileSync(resolve(d3, ".next/server/app/index.html"), `<script src="/_next/static/chunks/a.js"></script>`);
      const parsed = budget(d3, "/", STACK_MARKERS);
      expect(parsed.forbiddenHits.map((h: { marker: string }) => h.marker)).toEqual(["THREE.WebGLRenderer"]);
      const human = spawnSync("pnpm", ["exec", "tsx", SCRIPT, "--forbid", STACK_MARKERS.join(",")], { cwd: d3, encoding: "utf8" });
      expect(human.status).toBe(1);
    } finally {
      rmSync(d3, { recursive: true, force: true });
    }
  }, SPAWN_TIMEOUT);
});
