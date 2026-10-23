/**
 * carousel-autoplay.spec.ts (TASK-169) — the phone carousels advance on their own until the visitor interacts.
 * Automated browsers keep autoplay off unless `window.__hsCarouselAutoplay = true` is set before load, so every other
 * carousel spec stays timer-free; this spec opts in. Drives its own viewports (runs once, from w390):
 *   - phone: an on-screen row advances one card after the dwell, and wraps from the last card back to the first;
 *   - any touch inside the row stops it for good;
 *   - reduced motion: never advances;
 *   - desktop: no carousel, nothing rotates.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const activeIndex = (page: Page, id: string) =>
  page.locator(`#${id} .hs-dot`).evaluateAll((els) => els.findIndex((e) => e.getAttribute("aria-current") === "true"));

async function load(page: Page, w: number) {
  await page.addInitScript(() => ((window as { __hsCarouselAutoplay?: boolean }).__hsCarouselAutoplay = true));
  await page.setViewportSize({ width: w, height: 760 });
  await page.goto("/", { waitUntil: "load" });
  await page.locator("#credentials").scrollIntoViewIfNeeded();
}

test.describe("carousel autoplay (TASK-169)", () => {
  test("advances one card per dwell and wraps to the first", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    test.setTimeout(60_000);
    await load(page, 390);
    await expect(page.locator("#credentials .hs-carousel")).toHaveAttribute("data-autoplay", "");
    expect(await activeIndex(page, "credentials")).toBe(0);
    await expect.poll(() => activeIndex(page, "credentials"), { timeout: 7_000 }).toBe(1);
    // jump to the last card without a user event, then the next tick wraps to the first
    const n = await page.locator("#credentials .hs-dot").count();
    await page.locator("#credentials .hs-carousel > ul").evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: "auto" }));
    await expect.poll(() => activeIndex(page, "credentials")).toBe(n - 1);
    await expect.poll(() => activeIndex(page, "credentials"), { timeout: 7_000 }).toBe(0);
  });

  test("a touch inside the row stops it for good", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    test.setTimeout(30_000);
    await load(page, 390);
    const root = page.locator("#credentials .hs-carousel");
    await expect(root).toHaveAttribute("data-autoplay", "");
    await root.locator("> ul").dispatchEvent("pointerdown");
    await expect(root).not.toHaveAttribute("data-autoplay");
    await page.waitForTimeout(5_000);
    expect(await activeIndex(page, "credentials")).toBe(0);
    await expect(root.locator("[role=status]")).toHaveAttribute("aria-live", "polite");
  });

  test("never advances under reduced motion", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    test.setTimeout(30_000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await load(page, 390);
    await expect(page.locator("#credentials .hs-carousel")).not.toHaveAttribute("data-autoplay");
    await page.waitForTimeout(5_000);
    expect(await activeIndex(page, "credentials")).toBe(0);
  });

  test("desktop has nothing rotating", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    await load(page, 1440);
    await page.waitForTimeout(1_000);
    await expect(page.locator(".hs-carousel[data-autoplay]")).toHaveCount(0);
  });
});
