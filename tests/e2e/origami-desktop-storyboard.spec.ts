/**
 * origami-desktop-storyboard.spec.ts (TASK-365) — split out of origami-desktop.spec.ts because
 * this one test needs tracing off and Playwright's `trace` fixture is worker-scoped: it can only
 * be overridden via `test.use()` at a spec file's true top level (outside every `describe()`), or
 * in playwright.config.ts — never inside a describe block, nested or not. Giving it its own file
 * keeps that override from touching any other origami-desktop test's tracing.
 *
 * Playwright's trace capture (config default: retain-on-failure) snapshots the DOM on an interval,
 * and on this host that snapshotting itself was the main source of flakiness here: a retest with
 * tracing off dropped the failure rate from 6/8 to 2/8 under identical load (TASK-365 flaky-test
 * scar).
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

test.use({ trace: "off" });

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const splash = (page: Page) => page.locator(".od");

async function optIn(page: Page) {
  await page.addInitScript(() => ((window as { __hsOrigamiDesktopIntro?: boolean }).__hsOrigamiDesktopIntro = true));
}

async function open(page: Page, w = 1440, h = 900) {
  await optIn(page);
  await page.setViewportSize({ width: w, height: h });
  await page.goto("/", { waitUntil: "domcontentloaded" });
}

test.describe("Origami Desktop splash storyboard timing (TASK-365, trace disabled)", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(width(page) !== 1440, "drives its own viewports; runs once");
  });

  test("plays the storyboard: plane, monogram reveal and name, then the homepage", async ({ page }) => {
    await open(page);
    const plane = page.locator(".od .od-plane");
    await expect(plane).toBeVisible();
    const opacity = (sel: string) => page.locator(sel).evaluate((el) => Number(getComputedStyle(el).opacity));
    await expect.poll(() => opacity(".od .od-logo"), { timeout: 2_000 }).toBeGreaterThan(0.95);
    // .od-name finishes at ready + 1550ms, and ready itself can be delayed up to the
    // 1000ms failsafe under load — give this poll enough margin for that worst case
    // instead of racing it against a tight window (TASK-365 flaky-test scar).
    await expect.poll(() => opacity(".od .od-name"), { timeout: 3_000 }).toBeGreaterThan(0.95);
    // The plane flies left to right and exits off the right edge by ready + 1600ms, well
    // before the splash unmounts at ready + 3000ms. Tolerate the splash having already
    // unmounted by now (which implies the plane already exited) instead of a single
    // evaluate() that hangs for the full test timeout if `.od-plane` is no longer attached
    // (TASK-365 flaky-test scar).
    await expect
      .poll(async () => {
        if ((await splash(page).count()) === 0) return true;
        const left = await plane.evaluate((el) => el.getBoundingClientRect().left).catch(() => null);
        return left !== null && left >= page.viewportSize()!.width - 1;
      }, { timeout: 2_500 })
      .toBe(true);
    await expect(splash(page)).toHaveCount(0, { timeout: 3_000 });
  });
});
