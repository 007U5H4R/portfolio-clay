/**
 * eval-015.spec.ts (technical-plan.md §B S09.02, `@EVAL-015`) — graceful degradation:
 *   • View Transitions absent → card→case-study navigation lands on the identical end state
 *     (EXE-5 plain-navigation fallback).
 *   • JavaScript disabled → all content and navigation links are present and readable in the
 *     static HTML, in reading order.
 * Both live now for home → /work/teachspark. The missing-hero-image placeholder path is fixme'd
 * until the media component ships (TKT-18/19).
 */
import { test, expect } from "./fixtures";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;
const BASE_URL = process.env.PW_BASE_URL ?? "http://127.0.0.1:3000";

test("@EVAL-015 VT off: card → case study lands on the identical end state", { tag: "@EVAL-015" }, async ({
  page,
  noViewTransitions,
  withReducedMotion,
}) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "runs at 390 and 1440 (EVAL-015)");
  await noViewTransitions(page);
  await withReducedMotion(page);
  await page.goto("/", { waitUntil: "load" });

  const hasVT = await page.evaluate(() => typeof document.startViewTransition === "function");
  expect(hasVT, "startViewTransition must be absent so the EXE-5 fallback runs").toBeFalsy();

  await page.locator('a[href="/work/teachspark"]').first().click();
  await page.waitForURL("**/work/teachspark");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("TeachSpark");
});

test("@EVAL-015 JS off: static HTML carries content and navigation links", { tag: "@EVAL-015" }, async ({
  page,
  browser,
}) => {
  test.skip(width(page) !== 1440, "no-JS static check runs once at w1440");
  void page;
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: BASE_URL,
    viewport: { width: 1440, height: 900 },
  });
  try {
    const p = await context.newPage();
    await p.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      p.locator('nav[aria-label="Primary"] a', { hasText: "Work" }).first(),
    ).toHaveCount(1);
    await expect(p.getByRole("heading", { level: 1 })).toContainText("AI-native products");

    await p.goto("/work/teachspark", { waitUntil: "domcontentloaded" });
    await expect(p.getByRole("heading", { level: 1 })).toHaveText("TeachSpark");
  } finally {
    await context.close();
  }
});

// Missing-hero-image → labelled placeholder (never a broken <img>) — the media component is TKT-18/19.
test.fixme("@EVAL-015 missing hero image renders a labelled placeholder (TKT-18/19)", {
  tag: "@EVAL-015",
}, async () => {});
