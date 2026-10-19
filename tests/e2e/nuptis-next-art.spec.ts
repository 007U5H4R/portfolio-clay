/**
 * nuptis-next-art.spec.ts (TASK-275) — the Nuptis next-project band shows the Bhakti Vilas artwork,
 * one WebP per theme, crisp at 2x, with the link unchanged; other studies' bands carry no art.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const setTheme = (page: Page, theme: "light" | "dark") =>
  page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
const band = (page: Page) => page.locator('section[aria-label="Next project"]');

for (const theme of ["light", "dark"] as const) {
  test(`nuptis next band · ${theme}: correct art, link unchanged, ≥2x natural width`, async ({ page }) => {
    await page.goto("/work/nuptis", { waitUntil: "load" });
    await setTheme(page, theme);
    await band(page).scrollIntoViewIfNeeded();
    const img = band(page).locator(`img.cs-next-art-${theme}`);
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("src", new RegExp(`bhakti-next-${theme}\\.webp$`));
    await expect(band(page).locator(`img.cs-next-art-${theme === "light" ? "dark" : "light"}`)).toBeHidden();
    await expect(band(page).locator("a")).toHaveAttribute("href", "/work/bhakti-vilas");
    await expect(band(page).locator("h2")).toContainText("Bhakti Vilas");
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
    const m = await img.evaluate((el: HTMLImageElement) => ({ natural: el.naturalWidth, shown: el.getBoundingClientRect().width }));
    expect(m.natural).toBeGreaterThanOrEqual(m.shown * 2);
  });
}

test("other case studies' next bands have no artwork", async ({ page }) => {
  await page.goto("/work/teachspark", { waitUntil: "load" });
  await expect(band(page).locator(".cs-next-art")).toHaveCount(0);
});
