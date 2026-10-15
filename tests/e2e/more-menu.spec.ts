/**
 * more-menu.spec.ts (TASK-205) — the phone-only "More" sheet: grouped destinations that reuse existing routes, closes on Esc /
 * backdrop / navigation with focus returned to the button, opens the real Ask Tushky panel, and never shows at ≥ 640.
 */
import { test, expect } from "./fixtures";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

test.describe("More menu (TASK-205)", () => {
  test("≥ 640 the More button is not shown", async ({ page }) => {
    test.skip(width(page) < 640, "desktop/tablet only");
    await page.goto("/", { waitUntil: "load" });
    await expect(page.getByRole("button", { name: "More" })).toBeHidden();
  });

  test("opens grouped destinations, reuses existing routes, closes with Esc and returns focus", async ({ page, noOverflow }) => {
    test.skip(width(page) >= 640, "phone tier only");
    await page.goto("/", { waitUntil: "load" });
    const more = page.getByRole("button", { name: "More" });
    await expect(more).toHaveAttribute("aria-expanded", "false");
    await more.click();
    const sheet = page.locator("dialog.more-menu");
    await expect(sheet).toBeVisible();
    await expect(more).toHaveAttribute("aria-expanded", "true");
    for (const group of ["Portfolio", "Explore", "Connect"]) {
      await expect(sheet.getByRole("heading", { name: group })).toBeVisible();
    }
    const hrefs = await sheet.locator("a[href^='/']").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    for (const href of ["/", "/work", "/projects", "/about", "/certifications", "/thinking", "/lab", "/contact"]) {
      expect(hrefs, href).toContain(href);
    }
    const rows = await sheet.locator(".more-row").evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
    for (const h of rows) expect(h).toBeGreaterThanOrEqual(44);
    await noOverflow(page);
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
    await expect(more).toBeFocused();
  });

  test("a destination navigates and closes the sheet; Ask Tushky opens the panel", async ({ page }) => {
    test.skip(width(page) >= 640, "phone tier only");
    await page.goto("/", { waitUntil: "load" });
    await page.getByRole("button", { name: "More" }).click();
    await page.locator("dialog.more-menu").getByRole("link", { name: "Experience" }).click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(page.locator("dialog.more-menu")).toHaveCount(0);
    await page.getByRole("button", { name: "More" }).click();
    await page.locator("dialog.more-menu").getByRole("button", { name: /Ask Tushky/ }).click();
    await expect(page.locator("dialog.more-menu")).toHaveCount(0);
    await expect(page.locator(".ask-panel[data-open]")).toBeVisible();
  });
});
