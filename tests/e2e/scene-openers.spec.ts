/**
 * TKT-103 → TKT-107 (Tushar 2026-09-26: "make the images of all the tabs same height and width similiar
 * to Home tab"; Design.md §11 Dev-40 → Dev-95). Every page scene is a 21:9 outpaint (3168×1344, the home
 * banner's ratio) and every opener uses the home banner's box:
 *  - ≥ 768: the whole scene at full width — box height = width ÷ `--scene-ar` (± 2 px) and the canvas
 *    equals the box on all four edges (nothing cropped, nothing letterboxed) — TKT-103's rule, now ≥ 768;
 *  - < 768: the home banner's 4:3 box (h = w × 0.75 ± 2 px); the canvas covers it and the scene's focal
 *    point (the subject, `OPENER_FOCAL_X`) is inside it;
 *  - at 768 / 1024 / 1440 / 1920 every opener's box height equals the home banner box's (± 2 px).
 * Measured at scroll 0.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import { writing } from "@/data/writing";
import { OPENER_FOCAL_X } from "@/components/paper/scene-opener-frames";

const TOLERANCE_PX = 2;
const HOME_RATIO = 3168 / 1344;
const OPENERS = [
  { route: "/projects", id: "scene-work" } /* TKT-101 moved the scene-work opener to /projects */,
  { route: "/work/teachspark", id: "scene-casestudy" },
  { route: "/thinking", id: "scene-thinking" },
  { route: `/thinking/${writing[0]!.slug}`, id: "scene-thinking" },
  { route: "/about", id: "scene-about" },
  { route: "/playground", id: "scene-playground" },
  { route: "/contact", id: "scene-contact" },
] as const;

type Rect = { x: number; y: number; w: number; h: number };

async function measure(page: Page, box: string, canvas: string) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  return page.evaluate(
    ([boxSel, canvasSel]) => {
      const banner = document.querySelector(boxSel!) as HTMLElement | null;
      const cv = document.querySelector(canvasSel!);
      if (!banner || !cv) return null;
      const [w, h] = getComputedStyle(banner).getPropertyValue("--scene-ar").split("/").map(Number);
      const b = banner.getBoundingClientRect();
      const c = cv.getBoundingClientRect();
      return {
        ratio: w! / h!,
        box: { x: b.x, y: b.y, w: b.width, h: b.height },
        canvas: { x: c.x, y: c.y, w: c.width, h: c.height },
      };
    },
    [box, canvas],
  );
}

const edges = (box: Rect, canvas: Rect) => ({
  left: canvas.x - box.x,
  top: canvas.y - box.y,
  right: canvas.x + canvas.w - (box.x + box.w),
  bottom: canvas.y + canvas.h - (box.y + box.h),
});

for (const { route, id } of OPENERS) {
  test(`TKT-107 ${route} opener is the home banner's box (21:9 whole scene ≥ 768, 4:3 focal crop < 768)`, async ({ page }) => {
    await page.goto(route, { waitUntil: "load" });
    const m = await measure(page, ".scene-opener .scene-banner", ".scene-opener .scene-banner-canvas");
    expect(m, `${route} renders a scene opener`).not.toBeNull();
    const { ratio, box, canvas } = m!;
    expect(Math.abs(ratio - HOME_RATIO), `${id} is a 21:9 outpaint (--scene-ar ${ratio.toFixed(4)})`).toBeLessThan(0.001);
    const wide = (page.viewportSize()?.width ?? 0) >= 768;

    if (wide) {
      expect(Math.abs(box.h - box.w / ratio), `box ${box.w.toFixed(1)}×${box.h.toFixed(1)} vs whole scene ${(box.w / ratio).toFixed(1)} tall`).toBeLessThanOrEqual(TOLERANCE_PX);
      for (const [edge, delta] of Object.entries(edges(box, canvas))) {
        expect(Math.abs(delta), `${route}: canvas ${edge} edge not cropped (Δ ${delta.toFixed(2)} px)`).toBeLessThanOrEqual(TOLERANCE_PX);
      }
    } else {
      expect(Math.abs(box.h - box.w * 0.75), `box ${box.w.toFixed(1)}×${box.h.toFixed(1)} is 4:3`).toBeLessThanOrEqual(TOLERANCE_PX);
      const e = edges(box, canvas);
      expect(e.left, "canvas covers the box (left)").toBeLessThanOrEqual(0.5);
      expect(e.top, "canvas covers the box (top)").toBeLessThanOrEqual(0.5);
      expect(e.right, "canvas covers the box (right)").toBeGreaterThanOrEqual(-0.5);
      expect(e.bottom, "canvas covers the box (bottom)").toBeGreaterThanOrEqual(-0.5);
      const focal = canvas.x + OPENER_FOCAL_X[id] * canvas.w;
      expect(focal, `${id} focal point inside the box`).toBeGreaterThan(box.x + box.w * 0.25);
      expect(focal, `${id} focal point inside the box`).toBeLessThan(box.x + box.w * 0.75);
      // The narrow rendition covers the part of the canvas the box shows (no blank strip at either side).
      const img = await page.locator(".scene-opener .scene-banner-img").boundingBox();
      expect(img!.x).toBeLessThanOrEqual(box.x + 0.5);
      expect(img!.x + img!.width).toBeGreaterThanOrEqual(box.x + box.w - 0.5);
    }
  });
}

test("TKT-107 every opener's box is the home banner's height at 768 / 1024 / 1440 / 1920", async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 1440, "one sweep over the four widths is enough (it sets its own viewports)");
  test.setTimeout(180_000);
  // The boxes are sized by CSS alone (`--scene-ar` + container width), not by the images, so this sweep
  // answers `/_next/image` from the browser. Hopping 32 pages fast otherwise aborts cold optimisations
  // mid-flight, and under `next start` an aborted cold key can then hang every later request for it
  // (seen as never-resolving `hero-banner` w=1920 / scene w=1024 requests in the traces) — poisoning
  // this and later specs.
  await page.route("**/_next/image**", (route) =>
    route.fulfill({ status: 200, contentType: "image/gif", body: Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64") }),
  );
  for (const width of [768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "load" });
    const home = await measure(page, ".hero-banner .scene-banner", ".hero-banner .scene-banner-canvas");
    expect(home, "home renders its banner").not.toBeNull();
    for (const { route } of OPENERS) {
      await page.goto(route, { waitUntil: "load" });
      const m = await measure(page, ".scene-opener .scene-banner", ".scene-opener .scene-banner-canvas");
      expect(m, `${route} renders a scene opener`).not.toBeNull();
      expect(Math.abs(m!.box.h - home!.box.h), `${width}px ${route}: opener ${m!.box.h.toFixed(1)} vs home ${home!.box.h.toFixed(1)}`).toBeLessThanOrEqual(TOLERANCE_PX);
      expect(Math.abs(m!.box.w - home!.box.w), `${width}px ${route}: same full-bleed width`).toBeLessThanOrEqual(TOLERANCE_PX);
    }
  }
});
