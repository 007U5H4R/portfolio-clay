/**
 * smoke.spec.ts (technical-plan.md §B S09.01) — the fast fixture smoke gate. Proves the two
 * fixtures finalised in S09.01 work against the real build:
 *   • keyboardOnly — every tab stop in the header wears the 2px rust focus ring (EVAL-007)
 *   • consoleErrors — the home page loads with zero console.error / uncaught page errors (A12)
 * Tagged @smoke so `pnpm test:e2e --grep @smoke` runs just these.
 */
import { test, expect } from "./fixtures";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

test("home loads with no console errors", { tag: "@smoke" }, async ({ page, consoleErrors }) => {
  test.skip(width(page) !== 1440, "console-error smoke runs once at w1440");
  await page.goto("/", { waitUntil: "load" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // consoleErrors is asserted empty at fixture teardown.
  void consoleErrors;
});

test("keyboard focus ring is the 2px rust on the first tab stops", { tag: "@smoke" }, async ({
  page,
  keyboardOnly,
}) => {
  test.skip(width(page) !== 1440, "keyboard focus-ring smoke runs once at w1440");
  await page.goto("/", { waitUntil: "load" });
  // Skip link → header logo → primary nav links: all opt into the shared .focus-ring.
  await keyboardOnly(page, { tabs: 4 });
});

// TSK-31 / S69.06 (TC-124, S13): the three families are self-hosted by next/font — loading `/` issues
// zero requests to Google Fonts (the TP9 CSP `font-src 'self'` would block one anyway), and the page
// h1 renders in Fraunces with the variable `opsz` axis set (Design.md §2.2).
test("fonts are self-hosted and the h1 is Fraunces with opsz", { tag: "@smoke" }, async ({ page }) => {
  test.skip(width(page) !== 1440, "font smoke runs once at w1440");
  const googleFontRequests: string[] = [];
  page.on("request", (request) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(new URL(request.url()).host)) {
      googleFontRequests.push(request.url());
    }
  });
  await page.goto("/", { waitUntil: "load" });
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toBeVisible();
  const { fontFamily, fontVariationSettings } = await h1.evaluate((el) => {
    const style = getComputedStyle(el);
    return { fontFamily: style.fontFamily, fontVariationSettings: style.fontVariationSettings };
  });
  expect(fontFamily).toContain("Fraunces");
  expect(fontVariationSettings).toContain('"opsz"');
  expect(googleFontRequests).toEqual([]);
});
