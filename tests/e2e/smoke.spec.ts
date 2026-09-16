/**
 * smoke.spec.ts (technical-plan.md §B S09.01) — the fast fixture smoke gate. Proves the two
 * fixtures finalised in S09.01 work against the real build:
 *   • keyboardOnly — every tab stop in the header wears the 3px accent focus ring (EVAL-007)
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

test("keyboard focus ring is the 3px accent on the first tab stops", { tag: "@smoke" }, async ({
  page,
  keyboardOnly,
}) => {
  test.skip(width(page) !== 1440, "keyboard focus-ring smoke runs once at w1440");
  await page.goto("/", { waitUntil: "load" });
  // Skip link → header logo → primary nav links: all opt into the shared .focus-ring.
  await keyboardOnly(page, { tabs: 4 });
});
