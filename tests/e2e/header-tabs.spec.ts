/**
 * header-tabs.spec.ts (TASK-112, Tushar 2026-09-27: "I dont want hamburger menu, I want tabs should be
 * there in top nav bar."; Design.md §4.1, §11 Dev-97) — the primary nav is a row of tabs at every
 * width. ≥ 1440 one header row (unchanged); below 1440 a second row whose tab strip scrolls
 * horizontally, with the active tab scrolled into view and a paper fade while more tabs lie beyond.
 * Runs in all four viewport projects. TASK-224: below 640 the strip is gone (the bottom dock carries the destinations), so the
 * strip cases skip there and the phone header is asserted separately.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import { navItems } from "@/lib/nav";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const strip = (page: Page) => page.locator('header nav[aria-label="Primary"]');

/** Whether an element's box lies fully inside the strip's visible box. */
const inStrip = (page: Page, href: string) =>
  strip(page)
    .locator(`a[href="${href}"]`)
    .evaluate((el) => {
      const t = el.getBoundingClientRect();
      const s = el.closest("nav")!.getBoundingClientRect();
      return t.left >= s.left - 0.5 && t.right <= s.right + 0.5;
    });

test.describe("header tabs (TASK-112)", () => {
  test("≥ 640: no menu button or menu dialog; pill and Ask are in the header", async ({ page }) => {
    test.skip(width(page) < 640, "the phone tier has the More menu (TASK-205)");
    await page.goto("/", { waitUntil: "load" });
    const header = page.locator("header[data-site-header]");
    await expect(header.getByRole("button", { name: /more|menu/i })).toHaveCount(0);
    await expect(header.locator("[aria-controls]")).toHaveCount(0);
    await expect(page.locator("dialog")).toHaveCount(0);
    await expect(header.getByRole("link", { name: /Let's connect/ })).toBeVisible();
    await expect(header.getByRole("link", { name: /Let's connect/ })).toHaveAttribute("href", "/contact");
    await expect(header.getByRole("button", { name: "Ask AI" })).toBeVisible();
  });

  test("< 640 (TASK-205, TASK-224): the compact header has More (left), the brand lockup (centred) and theme (right); Ask moved to the dock", async ({ page }) => {
    test.skip(width(page) >= 640, "phone tier only");
    await page.goto("/", { waitUntil: "load" });
    const header = page.locator("header[data-site-header]");
    await expect(header.getByRole("button", { name: "More" })).toBeVisible();
    await expect(header.getByRole("switch")).toBeVisible();
    await expect(header.getByRole("button", { name: "Ask AI" })).toBeHidden();
    await expect(header.getByRole("link", { name: /Let's connect/ })).toBeHidden();
    // The tab strip is removed from the layout, not hidden behind the header.
    await expect(header.locator("nav[aria-label='Primary']")).toBeHidden();
    // Brand lockup centred on the viewport (equal 1fr side columns), kebab left of it, toggle right of it.
    const box = async (sel: string) => (await header.locator(sel).first().boundingBox())!;
    const brand = await box(".header-brand");
    const more = await box(".header-more");
    const toggle = await box(".theme-toggle");
    const vw = width(page);
    expect(Math.abs(brand.x + brand.width / 2 - vw / 2), "lockup centred").toBeLessThanOrEqual(1);
    expect(more.x + more.width).toBeLessThanOrEqual(brand.x);
    expect(toggle.x).toBeGreaterThanOrEqual(brand.x + brand.width);
    expect(Math.abs(brand.y + brand.height / 2 - (more.y + more.height / 2)), "one line").toBeLessThanOrEqual(2);
  });

  test("every nav tab is visible or reachable by scrolling the strip, ≥ 44 px tall, ≥ 16 px apart", async ({ page }) => {
    test.skip(width(page) < 640, "phones: the strip is replaced by the bottom dock (TASK-224, dock.spec.ts)");
    await page.goto("/", { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const links = strip(page).locator("a");
    await expect(links).toHaveCount(navItems.length);
    for (const item of navItems) {
      const tab = strip(page).locator(`a[href="${item.href}"]`);
      await expect(tab).toBeVisible();
      await expect(tab).toHaveText(item.label);
      // Reachable: scrolling the strip brings it fully into view (a no-op where the strip fits).
      await tab.evaluate((el) => {
        const s = el.closest("nav")!;
        s.scrollLeft = (el as HTMLElement).offsetLeft - s.clientWidth / 2;
      });
      await expect.poll(() => inStrip(page, item.href), { message: `${item.label} reachable` }).toBe(true);
    }
    const boxes = await links.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON() as DOMRect));
    for (const b of boxes) expect(b.height).toBeGreaterThanOrEqual(44);
    for (let i = 1; i < boxes.length; i++) {
      expect(boxes[i]!.left - boxes[i - 1]!.right, "gap between adjacent tabs").toBeGreaterThanOrEqual(16);
    }
  });

  test("the page never scrolls horizontally", async ({ page, noOverflow }) => {
    for (const route of ["/", "/certifications", "/work"]) {
      await page.goto(route, { waitUntil: "load" });
      await noOverflow(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    }
  });

  test("header height (TASK-192): one fixed sheet per tier — ~69 px phone (< 640, TASK-224: no tab strip), ~119 px phablet, ~137 px two-row tablet, ~124 px one row at ≥ 1280", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const h = (await page.locator("header[data-site-header]").boundingBox())!.height;
    test.info().annotations.push({ type: "header-height", description: `${width(page)}: ${h}px` });
    const expected = width(page) < 640 ? 69 : width(page) < 768 ? 119 : width(page) < 1280 ? 137 : 124;
    expect(Math.abs(h - expected), `header ${h}px at ${width(page)} vs --header-h ${expected}`).toBeLessThanOrEqual(2);
  });
});
