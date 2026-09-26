import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ILLUSTRATIONS } from "@/content/media/illustrations/manifest";
import { NARROW_VISIBLE_SPAN, OPENER_FOCAL_X, OPENER_SCENE_H, OPENER_SCENE_W, narrowBoxLeft, openerNarrow } from "@/components/paper/scene-opener-frames";

/**
 * TKT-107 (Design.md §11 Dev-48): every opener scene is the home banner's 3168×1344, and each scene's
 * < 768 narrow rendition covers exactly the region the 4:3 box shows at its focal point — the crop on
 * disk, the `narrow` prop and the box are derived from one table, so this pins them together.
 */
const ROOT = process.cwd();

/** Width × height of a WebP (VP8 / VP8L / VP8X header). */
function webpSize(buf: Buffer): { width: number; height: number } {
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8X") return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
  if (chunk === "VP8L") {
    const b = buf.readUInt32LE(21);
    return { width: 1 + (b & 0x3fff), height: 1 + ((b >> 14) & 0x3fff) };
  }
  return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
}

describe("TKT-107 scene opener frames", () => {
  const ids = Object.keys(OPENER_FOCAL_X) as (keyof typeof OPENER_FOCAL_X)[];

  it("covers the six scenes, each a 3168×1344 manifest entry (the home banner's size)", () => {
    expect(ids.sort()).toEqual(["scene-about", "scene-casestudy", "scene-contact", "scene-playground", "scene-thinking", "scene-work"]);
    const banner = ILLUSTRATIONS.find((e) => e.id === "hero-banner")!;
    for (const id of ids) {
      const entry = ILLUSTRATIONS.find((e) => e.id === id)!;
      expect([entry.width, entry.height], id).toEqual([banner.width, banner.height]);
      expect([entry.width, entry.height], id).toEqual([OPENER_SCENE_W, OPENER_SCENE_H]);
    }
  });

  it("each focal point is centred in the < 768 box (not clamped against a scene edge)", () => {
    for (const id of ids) {
      const left = narrowBoxLeft(OPENER_FOCAL_X[id]);
      expect(left + NARROW_VISIBLE_SPAN / 2, id).toBeCloseTo(OPENER_FOCAL_X[id], 6);
    }
  });

  it("each narrow rendition exists at its declared size and spans the box's region", () => {
    for (const id of ids) {
      const narrow = openerNarrow(id);
      const file = join(ROOT, "public", narrow.src);
      expect(existsSync(file), `${narrow.src} missing`).toBe(true);
      expect(webpSize(readFileSync(file)), narrow.src).toEqual({ width: narrow.width, height: narrow.height });
      const boxLeft = narrowBoxLeft(OPENER_FOCAL_X[id]);
      expect(narrow.left, id).toBeLessThanOrEqual(boxLeft);
      expect(narrow.left + narrow.span, id).toBeGreaterThanOrEqual(boxLeft + NARROW_VISIBLE_SPAN);
      expect(narrow.left + narrow.span, id).toBeLessThanOrEqual(1 + 1e-9);
    }
  });
});
