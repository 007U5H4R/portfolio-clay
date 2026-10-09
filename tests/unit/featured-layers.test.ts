/**
 * The layered Featured Work art (M-012 P2, TASK-181.2; EVAL-043 unit half). The stack of layers must BE the rest pose of
 * the original single collage, every layer file must follow the collage contract, and the CSS must target exactly the
 * signature parts the data names.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { featuredCollages } from "../../scripts/portfolio-art/featured";
import { BLEED } from "../../scripts/portfolio-art/collage";
import { featuredLayers, featuredLayerSrc } from "@/data/featured-layers";
import { ILLUSTRATIONS } from "@/content/media/illustrations/manifest";

const PUBLIC = join(process.cwd(), "public");

/** sha256 of the three single-file collages as shipped before the split (TASK-133, a4c64e0^). Never edited to pass. */
const ORIGINAL_SHA: Record<string, string> = {
  railcite: "37d20e8a48c72842312e7afe85f5bdf0b516c5b14feb5cd4559d62365966f48a",
  "slag-city": "8fa48f3571f1dd3330c01e1b197b30b98dfc9b24251d6669e721c733e3950852",
  "campfire-board": "48bdca44d29f3ad145ce34d01757b997f2ab545d7d2827fcc6c89080d8781238",
};
const sha = (text: string) => createHash("sha256").update(text).digest("hex");

describe("featured layers: the rest pose is the original collage", () => {
  for (const collage of featuredCollages) {
    it(`${collage.slug}: the stacked non-extra parts render byte-identical to the original single SVG`, () => {
      expect(sha(collage.render())).toBe(ORIGINAL_SHA[collage.slug]);
    });
  }
});

describe("featured layers: files and data", () => {
  it("data/featured-layers.ts lists exactly the generator's parts, in order, with the same extra flags and depths", () => {
    for (const collage of featuredCollages) {
      const data = featuredLayers[collage.slug]!;
      expect(data, collage.slug).toBeDefined();
      expect([data.w, data.h, data.bleed]).toEqual([collage.w, collage.h, BLEED]);
      const items = data.groups.flatMap((g) => g.items.map((item) => ({ ...item, depth: g.depth })));
      expect(items.map((i) => [i.name, i.depth, Boolean(i.extra)])).toEqual(collage.parts.map((p) => [p.name, p.depth, Boolean(p.extra)]));
      // groups are in back-to-front depth order and never repeat
      expect(data.groups.map((g) => g.depth)).toEqual(["bg", "art", "fg", "top"].filter((d) => data.groups.some((g) => g.depth === d)));
    }
  });

  it("every layer file exists, is a self-contained text-free transparent SVG ≤ 40 kB with the bleed canvas", () => {
    for (const collage of featuredCollages) {
      for (const { file, svg } of collage.layers()) {
        const path = join(PUBLIC, "media", "illustrations", "featured", file);
        expect(existsSync(path), file).toBe(true);
        expect(readFileSync(path, "utf8"), `${file} is stale: run pnpm exec tsx scripts/portfolio-art/build.ts featured`).toBe(svg);
        expect(Buffer.byteLength(svg), file).toBeLessThanOrEqual(40_000);
        const w = collage.w + 2 * BLEED;
        const h = collage.h + BLEED;
        expect(svg.startsWith(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`), file).toBe(true);
        expect(svg, `${file} draws text`).not.toMatch(/<text|<tspan|<foreignObject/);
        expect(svg, `${file} is not self-contained`).not.toMatch(/<image|<script|<style|href="(?!#)|url\((?!#)/);
        // transparent: no full-canvas background rect
        expect(svg, `${file} paints a background`).not.toMatch(new RegExp(`<rect[^>]*width="${w}"[^>]*height="${h}"`));
      }
    }
  });

  it("the first layer of each card is its manifest entry (alt text and size include the bleed); the others are never in the manifest", () => {
    for (const collage of featuredCollages) {
      const entry = ILLUSTRATIONS.find((e) => e.id === `featured-${collage.slug}`)!;
      expect(entry.publicSrc).toBe(featuredLayerSrc(collage.slug, "back"));
      expect([entry.width, entry.height]).toEqual([collage.w + 2 * BLEED, collage.h + BLEED]);
      for (const part of collage.parts.slice(1)) {
        expect(ILLUSTRATIONS.some((e) => e.publicSrc === featuredLayerSrc(collage.slug, part.name)), part.name).toBe(false);
      }
    }
  });

  it("signature extras exist only as overlays: every `extra` part carries a signature, and each card's signature tokens are distinct", () => {
    const perCard: Record<string, Set<string>> = {};
    for (const [slug, data] of Object.entries(featuredLayers)) {
      const tokens = new Set<string>();
      for (const group of data.groups) {
        for (const item of group.items) {
          if (item.extra) expect(item.sig, `${slug}/${item.name}`).toBeDefined();
          item.sig?.split(" ").forEach((t) => tokens.add(t));
        }
      }
      perCard[slug] = tokens;
    }
    // CampFire's CSS sparks share the card's token set (rendered by FeaturedWork, not part of the art)
    perCard["campfire-board"]!.add("spark");
    const all = Object.values(perCard).flatMap((t) => [...t]);
    // the card-level families are distinct: no two cards share a signature token
    expect(new Set(all).size).toBe(all.length);
  });

  it("the CSS targets exactly the signature tokens the data (and the sparks) use", () => {
    const css = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");
    const block = css.slice(css.indexOf("/* === TASK-186 / P2 ==="), css.indexOf("/* === end TASK-186 / P2 === */"));
    const targeted = new Set([...block.matchAll(/\[data-sig(?:~|)="([^"]+)"\]/g)].flatMap((m) => m[1]!.split(" ")));
    const used = new Set(Object.values(featuredLayers).flatMap((d) => d.groups.flatMap((g) => g.items.flatMap((i) => i.sig?.split(" ") ?? []))));
    for (const t of ["spark", "spark0", "spark1", "spark2"]) used.add(t);
    // `note`, `puff` and `spark` are family tokens (their members note0..3, puff1..3, spark0..2 carry the rules)
    const isFamily = (t: string) => [...used].some((u) => u !== t && u.replace(/\d$/, "") === t);
    for (const t of used) if (!isFamily(t)) expect(targeted.has(t), `no CSS rule for data-sig token "${t}"`).toBe(true);
    for (const t of targeted) expect(used.has(t), `CSS targets unknown data-sig token "${t}"`).toBe(true);
  });
});
