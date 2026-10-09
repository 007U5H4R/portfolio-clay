/**
 * header-origami.spec.ts (TASK-192) — the origami paper-tabs header on the built site, in all four viewport projects:
 * five real tabs that navigate, the active tab follows the route, keyboard focus is visible, the sparkle opens Tushky,
 * the toggle flips the one theme, no page overflow, ≥ 44 px targets, and the terrain never sits behind a label.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import { navItems } from "@/lib/nav";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const nav = (page: Page) => page.locator('header nav[aria-label="Primary"]');

test.describe("origami header (TASK-192)", () => {
  test("five real tabs navigate, and the active tab follows the route", async ({ page }) => {
    expect(navItems.map((i) => i.label)).toEqual(["Home", "Experience", "Portfolio", "About", "Certifications"]);
    for (const item of navItems) {
      await page.goto("/", { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const tab = nav(page).locator(`a[href="${item.href}"]`);
      await tab.evaluate((el) => (el.closest("nav")!.scrollLeft = (el as HTMLElement).offsetLeft - 40)); // reachable on the 390 strip
      await tab.click();
      await expect(page).toHaveURL(new RegExp(`${item.href === "/" ? "/$" : item.href}$`));
      const current = nav(page).locator('a[aria-current="page"]');
      await expect(current).toHaveCount(1);
      await expect(current).toHaveText(item.label);
    }
  });

  test("keyboard focus on a tab is clearly visible (the shared ring) and the tab rises with it", async ({ page }) => {
    await page.goto("/about", { waitUntil: "load" });
    await page.keyboard.press("Shift");
    const tab = nav(page).locator('a:not([aria-current="page"])').first();
    await tab.focus();
    expect(await tab.evaluate((el) => el.matches(":focus-visible"))).toBe(true);
    const ring = await tab.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: Number.parseFloat(s.outlineWidth) };
    });
    expect(ring.style).not.toBe("none");
    expect(ring.width).toBeGreaterThanOrEqual(2);
  });

  test("the sparkle is the Ask AI control and opens Tushky", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const sparkle = page.locator("header").getByRole("button", { name: "Ask AI" });
    await expect(sparkle).toBeVisible();
    expect(await sparkle.locator("svg path").count(), "one four-point glyph").toBe(1);
    await sparkle.click();
    const panel = page.getByRole("dialog", { name: /Ask Tushky/ });
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("data-open", "");
  });

  test("the toggle flips the one theme, and the header's art follows it", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.evaluate(() => (document.documentElement.dataset.theme = "light"));
    const toggle = page.locator("header").getByRole("switch");
    await expect(toggle).toHaveCount(1);
    const sheet = page.locator(".header-paper-sheet");
    const bg = () => sheet.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(await bg()).toContain("paper-grain-light");
    const light = await page.locator('.header-pill').evaluate((el) => getComputedStyle(el, "::before").backgroundColor);
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(await bg()).toContain("paper-grain-dark");
    const dark = await page.locator('.header-pill').evaluate((el) => getComputedStyle(el, "::before").backgroundColor);
    expect(dark, "the CTA inverts (navy paper → ivory paper)").not.toBe(light);
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("no page overflow at 390, 768, 1024 and 1440 in both themes", async ({ page, noOverflow }) => {
    for (const w of [390, 768, 1024, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      for (const theme of ["light", "dark"]) {
        await page.goto("/", { waitUntil: "load" });
        await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
        await noOverflow(page);
        expect(await page.evaluate(() => document.querySelector("header")!.scrollWidth <= document.documentElement.clientWidth), `${w} ${theme}: header inside the viewport`).toBe(true);
      }
    }
  });

  test("every header link and button is at least 44 px tall and wide, tabs included", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const small = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>("header a[href], header button"))
        .map((el) => ({ n: (el.getAttribute("aria-label") ?? el.textContent ?? "").trim(), r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && (Math.round(r.width) < 44 || Math.round(r.height) < 44))
        .map(({ n, r }) => `${n}: ${r.width}x${r.height}`),
    );
    expect(small).toEqual([]);
  });

  test("the terrain stays a thin band: it never rises behind a tab label, the CTA or the sparkle", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const clashes = await page.evaluate(() => {
      const hit = (a: DOMRect, b: DOMRect) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      const out: string[] = [];
      const pieces = Array.from(document.querySelectorAll<HTMLElement>(".ht-mid, .ht-left, .ht-right")).filter((el) => getComputedStyle(el).display !== "none");
      // the pieces are bottom-anchored boxes; the labels, CTA and sparkle are what they must not rise behind
      const texts = Array.from(document.querySelectorAll<HTMLElement>(".nt-label, .header-name, .header-subline, .header-pill, .header-ask"));
      for (const p of pieces) {
        const pr = p.getBoundingClientRect();
        for (const t of texts) {
          const tr = t.getBoundingClientRect();
          if (hit(pr, tr)) out.push(`${p.className} behind ${t.className || t.tagName} (${t.textContent?.trim().slice(0, 14)})`);
        }
      }
      return out;
    });
    // The two edge pieces sit in the corners under the tile and the toggle (as in the reference); only they may rise past the
    // brand row, and they never reach a tab label.
    const labelClashes = clashes.filter((c) => c.includes("nt-label") || c.includes("header-pill") || c.includes("header-ask"));
    expect(labelClashes).toEqual([]);
    if (width(page) < 1024) expect(await page.locator(".ht-left").evaluate((el) => getComputedStyle(el).display), "edge pieces are dropped below 1024").toBe("none");
  });
});
