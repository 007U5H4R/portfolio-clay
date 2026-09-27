/**
 * header-tabs.spec.ts (TASK-112, Tushar 2026-09-27: "I dont want hamburger menu, I want tabs should be
 * there in top nav bar."; Design.md §4.1, §11 Dev-97) — the primary nav is a row of tabs at every
 * width. ≥ 1440 one header row (unchanged); below 1440 a second row whose tab strip scrolls
 * horizontally, with the active tab scrolled into view and a paper fade while more tabs lie beyond.
 * Runs in all four viewport projects.
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
  test("no menu button or menu dialog; pill and Ask are in the header", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const header = page.locator("header[data-site-header]");
    await expect(header.getByRole("button", { name: /menu/i })).toHaveCount(0);
    await expect(header.locator("[aria-controls]")).toHaveCount(0);
    await expect(page.locator("dialog")).toHaveCount(0);
    await expect(header.getByRole("link", { name: /Let's connect/ })).toBeVisible();
    await expect(header.getByRole("link", { name: /Let's connect/ })).toHaveAttribute("href", "/contact");
    await expect(header.getByRole("button", { name: "Ask AI" })).toBeVisible();
  });

  test("every nav tab is visible or reachable by scrolling the strip, ≥ 44 px tall, ≥ 16 px apart", async ({ page }) => {
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

  test("the active tab has aria-current and is scrolled into view on load at 390 (/certifications)", async ({ page }) => {
    test.skip(width(page) !== 390, "the strip overflows at 390");
    await page.goto("/certifications", { waitUntil: "load" });
    const active = strip(page).locator('a[aria-current="page"]');
    await expect(active).toHaveCount(1);
    await expect(active).toHaveAttribute("href", "/certifications");
    await expect.poll(() => inStrip(page, "/certifications")).toBe(true);
    expect(await strip(page).evaluate((el) => el.scrollLeft), "the strip scrolled, not the page").toBeGreaterThan(0);
    expect(await page.evaluate(() => window.scrollY), "no vertical page scroll from the reveal").toBe(0);
    // Scrolled to the end, so no "more tabs" fade.
    await expect(page.locator(".header-tabs")).not.toHaveAttribute("data-more", "");
  });

  test("at 390 the right-edge fade shows while tabs lie beyond and clears at the end", async ({ page }) => {
    test.skip(width(page) !== 390, "the strip overflows at 390");
    await page.goto("/", { waitUntil: "load" });
    const wrap = page.locator(".header-tabs");
    await expect(wrap).toHaveAttribute("data-more", "");
    const fade = await wrap.evaluate((el) => getComputedStyle(el, "::after").opacity);
    expect(fade).toBe("1");
    await strip(page).evaluate((el) => (el.scrollLeft = el.scrollWidth));
    await expect(wrap).not.toHaveAttribute("data-more", "");
  });

  test("the page never scrolls horizontally", async ({ page, noOverflow }) => {
    for (const route of ["/", "/certifications", "/work"]) {
      await page.goto(route, { waitUntil: "load" });
      await noOverflow(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    }
  });

  test("header height: ≤ 112 px below 1440 (two rows), the single ~72 px row at ≥ 1440", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const h = (await page.locator("header[data-site-header]").boundingBox())!.height;
    test.info().annotations.push({ type: "header-height", description: `${width(page)}: ${h}px` });
    if (width(page) < 1440) expect(h).toBeLessThanOrEqual(112);
    else {
      expect(h).toBeGreaterThanOrEqual(70);
      expect(h).toBeLessThanOrEqual(74);
    }
  });
});
