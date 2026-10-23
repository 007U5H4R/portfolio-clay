/**
 * origami-bloom.spec.ts (TASK-360) — the phone welcome splash. Automated browsers never see it unless the
 * test sets `window.__hsOrigamiIntro = true` before load (lib/origami-bloom.ts), so every other spec
 * stays splash-free; this spec opts in. Drives its own viewports (runs once, from w390):
 *   - plays on a first phone visit and ends on its own, leaving the homepage usable;
 *   - Skip and Escape end it early;
 *   - once per session: no replay on reload or on client navigation back to /;
 *   - the CTA lands on #selected-work;
 *   - reduced motion: static frame, no animation, then gone;
 *   - desktop, and automation without the opt-in: never shown;
 *   - no horizontal overflow at 320; no console errors;
 *   - the page underneath is inert while the splash plays;
 *   - a slow chunk keeps the cover up (no homepage flash) and a client navigation away mid-load ends
 *     the intro; an aborted chunk falls back to the homepage.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const splash = (page: Page) => page.locator(".ob");
const introAttr = (page: Page) => page.evaluate(() => document.documentElement.dataset.intro ?? null);

async function optIn(page: Page) {
  await page.addInitScript(() => ((window as { __hsOrigamiIntro?: boolean }).__hsOrigamiIntro = true));
}

/** The splash chunk is the only JS chunk carrying the Skip label. */
async function holdSplashChunk(page: Page, how: { delayMs: number } | "abort") {
  await page.route(/\/_next\/static\/chunks\/.*\.js/, async (route) => {
    const res = await route.fetch();
    const body = await res.text();
    if (!body.includes("Skip intro")) return route.fulfill({ response: res, body });
    if (how === "abort") return route.abort();
    await new Promise((r) => setTimeout(r, how.delayMs));
    return route.fulfill({ response: res, body });
  });
}

const pageInert = (page: Page) => page.evaluate(() => !!document.querySelector("main")?.closest("[inert]"));
const canScroll = (page: Page) =>
  page.evaluate(async () => {
    window.scrollTo(0, 400);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    return window.scrollY > 0 && getComputedStyle(document.documentElement).overflow !== "hidden";
  });
const coverShown = (page: Page) => page.evaluate(() => getComputedStyle(document.body, "::after").content !== "none");

async function open(page: Page, w = 390, h = 844) {
  await optIn(page);
  await page.setViewportSize({ width: w, height: h });
  await page.goto("/", { waitUntil: "domcontentloaded" });
}

test.describe("Origami Bloom phone splash (TASK-360)", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
  });

  test("plays on a first phone visit, ends on its own and leaves the page scrollable", async ({ page, consoleErrors }) => {
    void consoleErrors;
    await open(page);
    await expect(splash(page)).toBeVisible();
    await expect(splash(page)).toHaveAttribute("data-mode", "play");
    await expect(page.getByRole("region", { name: /Welcome to Tushar Pathak/ })).toBeVisible();
    expect(await pageInert(page)).toBe(true);
    await expect(splash(page)).toHaveCount(0, { timeout: 6_000 });
    expect(await pageInert(page)).toBe(false);
    expect(await introAttr(page)).toBeNull();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe("hidden");
    expect(await page.evaluate(() => sessionStorage.getItem("hs-origami-intro"))).toBe("1");
  });

  test("Skip ends it early and Escape does too", async ({ page }) => {
    await open(page);
    await page.getByRole("button", { name: /skip intro/i }).click();
    await expect(splash(page)).toHaveCount(0, { timeout: 1_000 });
    expect(await introAttr(page)).toBeNull();

    await page.evaluate(() => sessionStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(splash(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(splash(page)).toHaveCount(0, { timeout: 1_000 });
  });

  test("plays once per session: not on reload, not on client navigation back home", async ({ page }) => {
    await open(page);
    await expect(splash(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(splash(page)).toHaveCount(0);

    await page.reload({ waitUntil: "load" });
    expect(await introAttr(page)).toBeNull();
    await expect(splash(page)).toHaveCount(0);

    await page.goto("/about", { waitUntil: "load" });
    await page.evaluate(() => {
      const a = document.querySelector<HTMLAnchorElement>('a[href="/"]');
      a?.click();
    });
    await page.waitForURL((u) => u.pathname === "/");
    await page.waitForTimeout(500);
    await expect(splash(page)).toHaveCount(0);
  });

  test("the CTA unfolds at the invite beat and takes the visitor to Selected Work", async ({ page }) => {
    await open(page);
    // play mode: hidden until the 2.6 s invite beat, then shown (the 3.1 s handoff follows right after)
    await expect(page.locator(".ob .ob-cta")).toBeHidden();
    await expect(page.locator(".ob .ob-cta")).toBeVisible({ timeout: 4_000 });
    await expect(splash(page)).toHaveCount(0, { timeout: 4_000 });

    // the tap itself, on the reduced-motion frame that holds still for 1.5 s (deterministic)
    await page.evaluate(() => sessionStorage.clear());
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator(".ob").getByRole("link", { name: /explore my work/i }).click();
    await expect(splash(page)).toHaveCount(0, { timeout: 1_000 });
    await expect
      .poll(() => page.locator("#selected-work").evaluate((el) => Math.round(el.getBoundingClientRect().top)), { timeout: 4_000 })
      .toBeLessThan(200);
    await expect(page.locator("#selected-work")).toBeFocused();
  });

  test("reduced motion shows the static frame without animation, then clears", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page);
    await expect(splash(page)).toHaveAttribute("data-mode", "static");
    await expect(page.locator(".ob-world")).toHaveCount(0);
    const animated = await page.evaluate(() =>
      document.getAnimations().filter((a) => (a.effect as KeyframeEffect | null)?.target instanceof Element && ((a.effect as KeyframeEffect).target as Element).closest(".ob")).length,
    );
    expect(animated).toBe(0);
    await expect(splash(page)).toHaveCount(0, { timeout: 3_000 });
  });

  test("never on desktop, even with the opt-in", async ({ page }) => {
    await open(page, 1440, 900);
    await page.waitForTimeout(800);
    expect(await introAttr(page)).toBeNull();
    await expect(splash(page)).toHaveCount(0);
  });

  test("never for automation without the opt-in", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(800);
    expect(await introAttr(page)).toBeNull();
    await expect(splash(page)).toHaveCount(0);
  });

  test("no horizontal overflow at 320", async ({ page, noOverflow }) => {
    await open(page, 320, 568);
    await expect(splash(page)).toBeVisible();
    await page.waitForTimeout(2_000);
    await noOverflow(page);
    // the world push scales art past the edges on purpose; the overlay clips it
    expect(await splash(page).evaluate((el) => getComputedStyle(el).overflowX)).toMatch(/hidden|clip/);
  });

  test("a slow splash chunk keeps the cover up until the splash mounts (no homepage flash)", async ({ page }) => {
    await holdSplashChunk(page, { delayMs: 450 });
    await open(page);
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.introClaimed ?? null)).toBe("1");
    await expect(splash(page)).toHaveCount(0);
    expect(await coverShown(page)).toBe(true);
    await expect(splash(page)).toBeVisible({ timeout: 3_000 });
    expect(await coverShown(page)).toBe(false);
  });

  test("navigating away while the chunk loads ends the intro and leaves the page scrollable", async ({ page }) => {
    await holdSplashChunk(page, { delayMs: 3_000 });
    await open(page);
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.introClaimed ?? null)).toBe("1");
    await page.evaluate(() => document.querySelector<HTMLAnchorElement>('a[href="/about"]')?.click());
    await page.waitForURL((u) => u.pathname === "/about");
    await page.waitForTimeout(1_500);
    expect(await page.evaluate(() => Object.keys(document.documentElement.dataset).filter((k) => k.startsWith("intro")))).toEqual([]);
    await expect(splash(page)).toHaveCount(0);
    expect(await canScroll(page)).toBe(true);
  });

  test("an aborted splash chunk falls back to the homepage", async ({ page }) => {
    await holdSplashChunk(page, "abort");
    await open(page);
    await expect.poll(() => introAttr(page), { timeout: 3_000 }).toBeNull();
    await expect(splash(page)).toHaveCount(0);
    expect(await coverShown(page)).toBe(false);
    expect(await canScroll(page)).toBe(true);
  });
});
