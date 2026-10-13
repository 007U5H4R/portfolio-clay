/**
 * The layered Featured Work art (TASK-202; supersedes the M-012 P2 SVG collage test). Each card is three transparent
 * raster layers (back · mid · front) in WebP + AVIF; the data, the files, the manifest and the CSS signature rules must agree.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { featuredLayers, featuredLayerSrc } from "@/data/featured-layers";
import { ILLUSTRATIONS } from "@/content/media/illustrations/manifest";

const PUBLIC = join(process.cwd(), "public");
const SLUGS = ["railcite", "slag-city", "campfire-board"];
const names = (slug: string) => featuredLayers[slug]!.groups.flatMap((g) => g.items.map((i) => i.name));

describe("featured layers: data", () => {
  it("lists the three cards, each with back, mid and front layers in back-to-front depth order (bg 2 · art 4 · fg 6)", () => {
    expect(Object.keys(featuredLayers).sort()).toEqual([...SLUGS].sort());
    for (const slug of SLUGS) {
      const data = featuredLayers[slug]!;
      expect(names(slug), slug).toEqual(["back", "mid", "front"]);
      expect(data.groups.map((g) => g.depth), slug).toEqual(["bg", "art", "fg"]);
    }
  });
});

describe("featured layers: files", () => {
  for (const slug of SLUGS) {
    for (const name of ["back", "mid", "front"]) {
      it(`${slug}/${name}: WebP + AVIF exist, carry alpha, match the bleed canvas and stay ≤ 100 kB`, async () => {
        const data = featuredLayers[slug]!;
        const w = data.w + 2 * data.bleed;
        const h = data.h + data.bleed;
        for (const ext of ["webp", "avif"] as const) {
          const path = join(PUBLIC, featuredLayerSrc(slug, name, ext).replace(/^\//, ""));
          expect(existsSync(path), path).toBe(true);
          expect(statSync(path).size, path).toBeLessThanOrEqual(100_000);
          const meta = await sharp(path).metadata();
          expect([meta.width, meta.height], path).toEqual([w, h]);
          expect(meta.hasAlpha, `${path} is transparent`).toBe(true);
        }
        // the bleed strip is fully transparent (a moving layer never shows a seam)
        const { data: px, info } = await sharp(join(PUBLIC, featuredLayerSrc(slug, name).replace(/^\//, ""))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        const alphaAt = (x: number, y: number) => px[(y * info.width + x) * info.channels + 3]!;
        for (let y = 0; y < info.height; y += 7) expect(alphaAt(0, y), `${slug}/${name} left bleed`).toBe(0);
        for (let x = 0; x < info.width; x += 7) expect(alphaAt(x, info.height - 1), `${slug}/${name} bottom bleed`).toBe(0);
      });
    }
  }

  it("the back layer of each card is its manifest entry (alt text, size incl. bleed); mid and front are never in the manifest", () => {
    for (const slug of SLUGS) {
      const data = featuredLayers[slug]!;
      const entry = ILLUSTRATIONS.find((e) => e.id === `featured-${slug}`)!;
      expect(entry.publicSrc).toBe(featuredLayerSrc(slug, "back"));
      expect([entry.width, entry.height]).toEqual([data.w + 2 * data.bleed, data.h + data.bleed]);
      for (const name of ["mid", "front"]) {
        expect(ILLUSTRATIONS.some((e) => e.publicSrc === featuredLayerSrc(slug, name)), `${slug}/${name}`).toBe(false);
      }
    }
  });
});

describe("featured layers: signatures", () => {
  it("every card has two signature layers and no signature token is shared between cards", () => {
    const perCard = SLUGS.map((slug) => featuredLayers[slug]!.groups.flatMap((g) => g.items.flatMap((i) => i.sig?.split(" ") ?? [])));
    for (const tokens of perCard) expect(tokens.length).toBe(2);
    const all = perCard.flatMap((t) => [...new Set(t)]);
    expect(new Set(all).size).toBe(all.length);
  });

  it("the CSS targets exactly the signature tokens the data uses (hover and focus twins)", () => {
    const css = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");
    const block = css.slice(css.indexOf("/* === TASK-186 / P2 ==="), css.indexOf("/* === end TASK-186 / P2 === */"));
    const targeted = new Set([...block.matchAll(/\[data-sig~="([^"]+)"\]/g)].map((m) => m[1]!));
    const used = new Set(Object.values(featuredLayers).flatMap((d) => d.groups.flatMap((g) => g.items.flatMap((i) => i.sig?.split(" ") ?? []))));
    expect([...targeted].sort()).toEqual([...used].sort());
    for (const t of used) {
      expect(block.includes(`.fw-lift:hover [data-sig~="${t}"]`), `hover rule for ${t}`).toBe(true);
      expect(block.includes(`.fw-lift:has(:focus-visible) [data-sig~="${t}"]`), `focus twin for ${t}`).toBe(true);
    }
  });
});
