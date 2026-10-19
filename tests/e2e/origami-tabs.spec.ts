/**
 * origami-tabs.spec.ts (TASK-265, inverted by TASK-277) — the phone origami background is switched off on every tab
 * (ORIGAMI_BG_ENABLED = false in components/portfolio/ProjectsMobileBackground.tsx). While the switch is off, no layer
 * (`[data-testid="projects-bg"]` / `.ob-root`) may be in the DOM on any dock tab, in either theme, nothing may overflow
 * sideways, and the /projects detail view stays clean. Flip the switch back to true and restore the TASK-265 version of
 * this spec (git history) to bring the layer back.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const ROUTES = ["/", "/work", "/projects", "/about", "/certifications"];
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);

test.describe("origami background is off on every tab (TASK-277)", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`no layer on any dock tab and no horizontal overflow (${theme})`, async ({ page }) => {
      test.skip(width(page) !== 390, "phone only; runs once");
      for (const path of ROUTES) {
        await page.goto(path, { waitUntil: "load" });
        await setTheme(page, theme);
        await page.waitForTimeout(300); // the layer, when enabled, mounts after hydration
        await expect(page.getByTestId("projects-bg"), path).toHaveCount(0);
        await expect(page.locator(".ob-root"), path).toHaveCount(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), path).toBe(true);
      }
    });
  }

  test("no layer after a client navigation or on the /projects detail view", async ({ page }) => {
    test.skip(width(page) !== 390, "phone only; runs once");
    await page.goto("/", { waitUntil: "load" });
    await page.locator('nav[aria-label="Primary mobile"]').getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator(".ob-root")).toHaveCount(0);
    await page.goto("/projects", { waitUntil: "load" });
    await page.locator(".pf-m-card").first().click();
    await expect(page.locator(".pf-showcase")).toHaveAttribute("data-view", "detail");
    await expect(page.locator(".ob-root")).toHaveCount(0);
  });

  test("at 640 and up there is no layer either", async ({ page }) => {
    test.skip(width(page) < 640, "desktop / tablet only");
    for (const path of ROUTES) {
      await page.goto(path, { waitUntil: "load" });
      await expect(page.locator(".ob-root"), path).toHaveCount(0);
    }
  });
});
