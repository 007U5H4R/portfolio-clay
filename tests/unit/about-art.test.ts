import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ABOUT_ART } from "@/components/about/about-art";
import { chapterScenes } from "@/scripts/about-art/chapters";
import { heroPieces } from "@/scripts/about-art/hero";
import { horizon } from "@/scripts/about-art/horizon";
import { researchArtifacts } from "@/scripts/about-art/research";

/**
 * TASK-136 — the `/about` art: hand-authored cut-paper SVGs in `public/about/`, built by
 * `scripts/about-art/build.ts`. Each shipped file is exactly what its source renders (a rebuild is
 * byte-identical), ≤ 40 kB, self-contained (no script, no external reference, no raster), sized to the
 * registry's width/height, and text-free except the four book spines the spec asks for.
 */
const DIR = join(process.cwd(), "public", "about");
const SOURCES = [...heroPieces, ...chapterScenes, ...researchArtifacts, horizon];

describe("/about art (TASK-136)", () => {
  it("ships exactly the registered pieces, one source each", () => {
    const files = readdirSync(DIR).filter((f) => f.endsWith(".svg")).sort();
    expect(files).toEqual(Object.keys(ABOUT_ART).map((id) => `${id}.svg`).sort());
    expect(SOURCES.map((s) => s.slug).sort()).toEqual(Object.keys(ABOUT_ART).sort());
    expect(readdirSync(DIR).filter((f) => !f.endsWith(".svg"))).toEqual([]);
  });

  for (const source of SOURCES) {
    it(`${source.slug}.svg is the committed build of its source, ≤ 40 kB, self-contained, sized to the registry`, () => {
      const svg = readFileSync(join(DIR, `${source.slug}.svg`), "utf8");
      expect(svg).toBe(source.render());
      expect(Buffer.byteLength(svg)).toBeLessThanOrEqual(40_000);
      const art = ABOUT_ART[source.slug as keyof typeof ABOUT_ART];
      expect(svg.startsWith(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${art.width} ${art.height}" width="${art.width}" height="${art.height}">`)).toBe(true);
      expect(svg).not.toMatch(/<script|<image|<foreignObject|href="(?!#)|url\((?!#)/);
    });
  }

  it("the only lettering is the four book spines: AI · Systems · Products · Impact (spec §4)", () => {
    for (const source of SOURCES) {
      const texts = [...source.render().matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
      expect(texts, source.slug).toEqual(source.slug === "books-stack" ? ["AI", "Systems", "Products", "Impact"] : []);
    }
  });
});
