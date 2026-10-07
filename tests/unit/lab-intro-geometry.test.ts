import { describe, expect, it } from "vitest";
import { BEAR_BOX_FRACTION, introBox, introFraming, isPortraitIntro, stageAnchorPx } from "@/components/lab/intro-geometry";

/** TASK-168 — the intro art is one cover-fitted registered box; the live gummy must land on its stage anchor. */
describe("intro geometry", () => {
  it("cover-fits the 16:9 art on desktop and centres it", () => {
    const b = introBox(1440, 900);
    expect(b.portrait).toBe(false);
    expect(b.h).toBe(900);
    expect(b.w).toBeCloseTo(1600, 3);
    expect(b.left).toBeCloseTo(-80, 3);
    const wide = introBox(1920, 700);
    expect(wide.w).toBe(1920);
    expect(wide.h).toBeCloseTo(1080, 3);
  });

  it("switches to the 4:5 mobile crop on a portrait phone only", () => {
    expect(isPortraitIntro(390, 844)).toBe(true);
    expect(isPortraitIntro(844, 390)).toBe(false);
    expect(isPortraitIntro(1024, 1366)).toBe(false);
    const b = introBox(390, 844);
    expect(b.portrait).toBe(true);
    expect(b.h).toBe(844);
    expect(b.w).toBeCloseTo(675.2, 3);
  });

  it("puts the stage anchor at 50% x and 67% of the art height", () => {
    const d = stageAnchorPx(1440, 900);
    expect(d.x).toBeCloseTo(720, 3);
    expect(d.y).toBeCloseTo((905 / 1350) * 900, 3);
    const m = stageAnchorPx(390, 844);
    expect(m.x).toBeCloseTo(195, 3);
    expect(m.y).toBeCloseTo((905 / 1350) * 844, 3);
  });

  it("frames the camera so the bear is ~30% of the art height with its feet on the anchor", () => {
    const canvas = { top: 170 - 12, height: 553 + 24 };
    const f = introFraming(1440, 900, canvas);
    const feetPx = canvas.top + f.feetFraction * canvas.height;
    expect(feetPx).toBeCloseTo(stageAnchorPx(1440, 900).y, 0);
    const bearPx = (1.92 / f.visibleHeight) * canvas.height;
    expect(bearPx / 900).toBeCloseTo(BEAR_BOX_FRACTION, 1);
  });

  it("clamps absurd canvases to a usable range", () => {
    const f = introFraming(300, 300, { top: 0, height: 4 });
    expect(f.visibleHeight).toBeGreaterThanOrEqual(3);
    expect(f.feetFraction).toBeLessThanOrEqual(0.95);
  });
});
