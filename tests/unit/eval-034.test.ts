import { describe, expect, it } from "vitest";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { bleedPx, DEPTHS, LAYERED_SCENES, maxShiftPx, mobileFile, type LayeredScene } from "@/content/media/illustrations/layers";

/**
 * EVAL-034 — layered asset integrity (M-011, S31/S32, Design.md §14.5). Over the layer manifest, the files on
 * disk and the provenance README: same layers in both themes, §32 names, an opaque `bg` and transparent-where-empty
 * non-empty other layers, shared pixel size, declared depth on the elevation scale, bleed ≥ max shift, byte caps,
 * one README row per layer file (model, job id, source composite, light twin).
 */
const DIR = join(process.cwd(), "public", "media", "paper-world");
const KB = 1024;
const CAPS = { desktopLayerKb: 240, desktopSceneKb: 520, mobileSceneKb: 300 };
const MIN_TRANSPARENT_PCT = 15;
const MIN_OPAQUE_PCT = 2;
const LAYER_NAMES = ["bg", "distant", "mid", "subject", "fg", "details"];

const bytes = (scene: string, file: string) => statSync(join(DIR, scene, file)).size;
const path = (scene: string, file: string) => join(DIR, scene, file);

async function alphaStats(file: string) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let min = 255;
  let zero = 0;
  let full = 0;
  const px = info.width * info.height;
  for (let i = 3; i < data.length; i += 4) {
    const a = data[i]!;
    if (a < min) min = a;
    if (a === 0) zero++;
    if (a === 255) full++;
  }
  return { min, transparentPct: (zero / px) * 100, opaquePct: (full / px) * 100, width: info.width, height: info.height };
}

const README = readFileSync(join(DIR, "README.md"), "utf8");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
/** README rows: `| scene/base[-mobile].webp | scene | layer | depth | theme | model | job | source | twin |`. */
const ROWS = README.split("\n")
  .filter((l) => l.startsWith("| ") && l.includes(".webp"))
  .map((l) => l.split("|").slice(1, -1).map((c) => c.trim()));

/** Scene-level rows (P2 rollout, EXE-51): `| scene-x | bg .05, mid .22 (light + dark) | source | credits | task |` — job ids live in the local masters. */
const SCENE_ROWS = README.split("\n")
  .filter((l) => /^\| scene-[a-z]+ \|/.test(l))
  .map((l) => l.split("|").slice(1, -1).map((c) => c.trim()));

describe("EVAL-034 layered asset integrity", () => {
  it("has at least one layered scene", () => {
    expect(LAYERED_SCENES.length).toBeGreaterThan(0);
  });

  for (const scene of LAYERED_SCENES as readonly LayeredScene[]) {
    describe(scene.id, () => {
      const nonBg = scene.layers.filter((l) => l.layer !== "bg");

      it("has 3–5 layers, one bg, unique layer names, depth on the elevation scale, light and dark twins", () => {
        expect(scene.layers.length).toBeGreaterThanOrEqual(3);
        expect(scene.layers.length).toBeLessThanOrEqual(5);
        expect(scene.layers.filter((l) => l.layer === "bg")).toHaveLength(1);
        expect(new Set(scene.layers.map((l) => l.layer)).size).toBe(scene.layers.length);
        for (const l of scene.layers) {
          expect(LAYER_NAMES).toContain(l.layer);
          expect(DEPTHS as readonly number[]).toContain(l.depth);
          expect(l.file).toMatch(new RegExp(`^${scene.id}-${l.layer}\\.webp$`));
          expect(l.darkFile).toBe(`${scene.id}-${l.layer}-dark.webp`);
        }
      });

      it("ships every layer in both themes at both sizes, and declares a bleed covering its max shift", () => {
        for (const l of scene.layers) {
          for (const f of [l.file, l.darkFile, mobileFile(l.file), mobileFile(l.darkFile)]) expect(() => statSync(path(scene.id, f)), f).not.toThrow();
          expect(bleedPx(l.layer, l.depth)).toBeGreaterThanOrEqual(maxShiftPx(l.layer, l.depth));
        }
      });

      it("keeps the byte caps (desktop layer, desktop scene per theme, mobile scene per theme)", () => {
        for (const l of scene.layers) {
          expect(bytes(scene.id, l.file), l.file).toBeLessThanOrEqual(CAPS.desktopLayerKb * KB);
          expect(bytes(scene.id, l.darkFile), l.darkFile).toBeLessThanOrEqual(CAPS.desktopLayerKb * KB);
        }
        const sum = (pick: (l: (typeof scene.layers)[number]) => string) => scene.layers.reduce((n, l) => n + bytes(scene.id, pick(l)), 0);
        expect(sum((l) => l.file)).toBeLessThanOrEqual(CAPS.desktopSceneKb * KB);
        expect(sum((l) => l.darkFile)).toBeLessThanOrEqual(CAPS.desktopSceneKb * KB);
        expect(sum((l) => mobileFile(l.file))).toBeLessThanOrEqual(CAPS.mobileSceneKb * KB);
        expect(sum((l) => mobileFile(l.darkFile))).toBeLessThanOrEqual(CAPS.mobileSceneKb * KB);
      });

      it("shares pixel dimensions across layers and themes, desktop and mobile separately", async () => {
        for (const [pick, w, h] of [
          [(f: string) => f, scene.width, scene.height],
          [mobileFile, scene.mobileWidth, scene.mobileHeight],
        ] as const) {
          for (const l of scene.layers) {
            for (const f of [l.file, l.darkFile]) {
              const m = await sharp(path(scene.id, pick(f))).metadata();
              expect([m.width, m.height], pick(f)).toEqual([w, h]);
            }
          }
        }
      });

      it("keeps bg opaque and every other layer transparent where empty and non-empty", async () => {
        for (const f of scene.layers.filter((l) => l.layer === "bg").flatMap((l) => [l.file, l.darkFile, mobileFile(l.file), mobileFile(l.darkFile)])) {
          expect((await alphaStats(path(scene.id, f))).min, f).toBe(255);
        }
        for (const f of nonBg.flatMap((l) => [l.file, l.darkFile, mobileFile(l.file), mobileFile(l.darkFile)])) {
          const s = await alphaStats(path(scene.id, f));
          expect(s.transparentPct, `${f} transparent %`).toBeGreaterThanOrEqual(MIN_TRANSPARENT_PCT);
          expect(s.opaquePct, `${f} opaque %`).toBeGreaterThanOrEqual(MIN_OPAQUE_PCT);
        }
      });

      it("has a complete provenance row for every layer file (model, job id, source composite, light twin)", () => {
        const sceneRow = SCENE_ROWS.find((r) => r[0] === scene.id);
        if (sceneRow) {
          const [, layers, source, credits] = sceneRow;
          for (const l of scene.layers) expect(layers, `${scene.id} row lists ${l.layer}`).toContain(`${l.layer} ${l.depth.toFixed(2).replace(/^0/, "")}`);
          expect(layers).toContain("light + dark");
          expect(source).toBeTruthy();
          expect(Number.parseFloat(credits!)).toBeGreaterThan(0);
          return;
        }
        for (const l of scene.layers) {
          for (const [file, theme] of [[l.file, "light"], [l.darkFile, "dark"]] as const) {
            const base = file.replace(/\.webp$/, "");
            const row = ROWS.find((r) => r[0] === `${scene.id}/${base}[-mobile].webp`);
            expect(row, `README row for ${file}`).toBeDefined();
            const [, rowScene, rowLayer, rowDepth, rowTheme, model, job, source, twin] = row!;
            expect([rowScene, rowLayer, rowTheme]).toEqual([scene.id, l.layer, theme]);
            expect(Number(rowDepth)).toBe(l.depth);
            expect(model).toBeTruthy();
            expect(job).toMatch(UUID);
            expect(source).toBeTruthy();
            expect(twin).toBe(theme === "dark" ? l.file.replace(/\.webp$/, "") : "—");
          }
        }
      });
    });
  }
});
