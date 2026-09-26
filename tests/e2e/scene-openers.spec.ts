/**
 * TKT-103 (Tushar 2026-09-26: "in all the tabs, I want the full image, dont crop it out or zoom out";
 * Design.md §11 Dev-40) — every page scene opener shows its whole scene at full width, at every project
 * width: the banner box is the scene's ratio (height = width ÷ `--scene-ar`, ± 2 px) and the canvas
 * equals the box on all four edges (nothing cropped, nothing letterboxed). Measured at scroll 0.
 */
import { test, expect } from "./fixtures";
import { writing } from "@/data/writing";

const TOLERANCE_PX = 2;
const ROUTES = [
  "/projects",
  "/work/teachspark",
  "/thinking",
  `/thinking/${writing[0]!.slug}`,
  "/about",
  "/playground",
  "/contact",
] as const;

for (const route of ROUTES) {
  test(`TKT-103 ${route} opener shows the whole scene, uncropped`, async ({ page }) => {
    await page.goto(route, { waitUntil: "load" });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    const m = await page.evaluate(() => {
      const banner = document.querySelector(".scene-opener .scene-banner") as HTMLElement | null;
      const canvas = document.querySelector(".scene-opener .scene-banner-canvas");
      if (!banner || !canvas) return null;
      const [w, h] = getComputedStyle(banner).getPropertyValue("--scene-ar").split("/").map(Number);
      const b = banner.getBoundingClientRect();
      const c = canvas.getBoundingClientRect();
      return { ratio: w! / h!, box: { x: b.x, y: b.y, w: b.width, h: b.height }, canvas: { x: c.x, y: c.y, w: c.width, h: c.height } };
    });
    expect(m, `${route} renders a scene opener`).not.toBeNull();
    const { ratio, box, canvas } = m!;
    expect(Math.abs(box.h - box.w / ratio), `box ${box.w.toFixed(1)}×${box.h.toFixed(1)} vs whole scene ${(box.w / ratio).toFixed(1)} tall`).toBeLessThanOrEqual(TOLERANCE_PX);
    for (const [edge, delta] of Object.entries({
      left: canvas.x - box.x,
      top: canvas.y - box.y,
      right: canvas.x + canvas.w - (box.x + box.w),
      bottom: canvas.y + canvas.h - (box.y + box.h),
    })) {
      expect(Math.abs(delta), `${route}: canvas ${edge} edge not cropped (Δ ${delta.toFixed(2)} px)`).toBeLessThanOrEqual(TOLERANCE_PX);
    }
  });
}
