/**
 * hero-scene.ts (TKT-96, Tushar direction 2026-09-26, Design.md §11 Dev-39) — the ≥ 768 home-hero rule
 * shared by hero-fold.spec.ts and home.spec.ts: the banner shows the whole 3168×1344 scene (box height
 * = width × 1344/3168 ± 2 px, the canvas equals the box — nothing cropped), and the h1 + both CTAs are
 * reached by scrolling at most one viewport. Not a spec file (no `.spec`), so Playwright only runs it
 * through its importers.
 */
import { expect, type Page } from "@playwright/test";
import { BANNER_SIZE } from "@/components/hero/registration";

export const SCENE_TOLERANCE_PX = 2;

type Rect = { x: number; y: number; width: number; height: number };

/** The home banner box and canvas at the current scroll position. */
export async function bannerRects(page: Page): Promise<{ box: Rect; canvas: Rect }> {
  return page.evaluate(() => {
    const rect = (sel: string) => {
      const el = document.querySelector(sel);
      if (!el) throw new Error(`missing ${sel}`);
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    return { box: rect(".hero-banner .scene-banner"), canvas: rect(".hero-banner .scene-banner-canvas") };
  });
}

/** ≥ 768: the whole scene — box at the scene's ratio, canvas == box on all four edges. Call at scroll 0. */
export async function expectWholeScene(page: Page): Promise<void> {
  const { box, canvas } = await bannerRects(page);
  const expected = (box.width * BANNER_SIZE.height) / BANNER_SIZE.width;
  expect(Math.abs(box.height - expected), `banner box ${box.width.toFixed(1)}×${box.height.toFixed(1)} vs whole scene ${expected.toFixed(1)} tall`).toBeLessThanOrEqual(SCENE_TOLERANCE_PX);
  for (const [edge, delta] of Object.entries({
    left: canvas.x - box.x,
    top: canvas.y - box.y,
    right: canvas.x + canvas.width - (box.x + box.width),
    bottom: canvas.y + canvas.height - (box.y + box.height),
  })) {
    expect(Math.abs(delta), `canvas ${edge} edge is not cropped (Δ ${delta.toFixed(2)} px)`).toBeLessThanOrEqual(SCENE_TOLERANCE_PX);
  }
}

/** Instant scroll (Lenis scrolls natively underneath) and let two frames settle the scroll timeline. */
export async function scrollToY(page: Page, y: number): Promise<void> {
  await page.evaluate(async (top) => {
    window.scrollTo({ top, behavior: "instant" });
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, y);
}

/** ≥ 768: scrolling ≤ one viewport brings the h1 and both CTAs wholly into view (below the sticky header). */
export async function expectCopyWithinOneScroll(page: Page): Promise<void> {
  const vh = page.viewportSize()!.height;
  const doc = await page.evaluate(() => {
    const top = (sel: string) => {
      const r = document.querySelector(sel)!.getBoundingClientRect();
      return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY };
    };
    return { h1: top("h1#hero-h"), cta: top(".hero-cta-row"), header: document.querySelector("header")!.getBoundingClientRect().height };
  });
  const needed = Math.max(0, Math.ceil(doc.cta.bottom - vh));
  expect(needed, `scroll needed to reveal the CTAs (${needed}px) is at most one viewport (${vh}px)`).toBeLessThanOrEqual(vh);
  await scrollToY(page, needed);
  const h1 = (await page.locator("h1#hero-h").boundingBox())!;
  const cta = (await page.locator(".hero-cta-row").boundingBox())!;
  expect(h1.y, "h1 top clears the sticky header after the scroll").toBeGreaterThanOrEqual(doc.header - 1);
  expect(cta.y + cta.height, "CTA row bottom inside the viewport after the scroll").toBeLessThanOrEqual(vh + 1);
  await expect(page.getByRole("link", { name: "View my work →" })).toBeInViewport({ ratio: 1 });
  await expect(page.locator(".hero-cta-row").getByRole("link", { name: "Ask my portfolio" })).toBeInViewport({ ratio: 1 });
}
