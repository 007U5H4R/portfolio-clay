/**
 * lenis.spec.ts (TKT-94, decision EXE-16, Design.md §11 Dev-22) — Lenis smooth scroll is mounted only
 * for a fine pointer without reduced motion (native elsewhere), and it never breaks hash anchors, the
 * skip link, keyboard scrolling or the MobileMenu dialog.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const htmlHasLenis = (page: Page) => page.evaluate(() => document.documentElement.classList.contains("lenis"));

async function gotoWithLenis(page: Page, path = "/") {
  await page.goto(path, { waitUntil: "load" });
  await expect(page.locator("html.lenis")).toHaveCount(1);
}

test.describe("Lenis guard modes", () => {
  test("w1440 default: <html> carries the lenis class", async ({ page }) => {
    test.skip(width(page) !== 1440, "desktop fine-pointer mode");
    await gotoWithLenis(page);
  });

  test("reduced motion: no lenis class (native scroll)", async ({ page }) => {
    test.skip(width(page) !== 1440, "fine pointer + reduced motion");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(500); // Lenis is a dynamic import — give it time to (not) appear
    expect(await htmlHasLenis(page)).toBe(false);
  });

  test("w390 touch: no lenis class (native momentum)", async ({ page }) => {
    test.skip(width(page) !== 390, "touch / coarse pointer mode");
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(500);
    expect(await htmlHasLenis(page)).toBe(false);
  });
});

test.describe("Lenis-mounted behaviour (w1440)", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(width(page) !== 1440, "Lenis is mounted at the desktop fine-pointer project");
  });

  test('hero "Ask my portfolio" lands #ask in view under the header, focus inside it', async ({ page }) => {
    await gotoWithLenis(page);
    await page.getByRole("link", { name: "Ask my portfolio" }).first().click();
    await expect(page).toHaveURL(/#ask$/);
    const header = await page.locator("header[data-site-header]").boundingBox();
    await expect
      .poll(async () => Math.round((await page.locator("#ask").boundingBox())!.y), { timeout: 5_000 })
      .toBe(Math.round(header!.y + header!.height));
    const focusInside = await page.evaluate(() => {
      const ask = document.getElementById("ask");
      return !!ask && !!document.activeElement && ask.contains(document.activeElement);
    });
    expect(focusInside, "focus must move into #ask").toBe(true);
  });

  test("Tab to the skip link + Enter moves focus to main", async ({ page }) => {
    await gotoWithLenis(page);
    await page.keyboard.press("Tab");
    await expect(page.locator('a[href="#main"]')).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main")).toBeFocused();
  });

  test("keyboard PageDown and Space scroll the page", async ({ page }) => {
    await gotoWithLenis(page);
    await page.locator("main#main").click({ position: { x: 5, y: 5 } }); // focus the document, not a control
    await page.keyboard.press("PageDown");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
    const afterPageDown = await page.evaluate(() => window.scrollY);
    await page.keyboard.press("Space");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(afterPageDown + 200);
  });

  test("MobileMenu at a 900 px desktop viewport stops Lenis; closing restores scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 900 });
    await gotoWithLenis(page);
    await page.locator("button.header-menu-btn").click();
    await expect(page.locator("dialog.menu-sheet")).toHaveAttribute("open", "");
    await expect(page.locator("html.lenis-stopped")).toHaveCount(1);
    await page.mouse.move(450, 800);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => window.scrollY), "page must not scroll behind the open sheet").toBe(0);

    await page.keyboard.press("Escape");
    await expect(page.locator("dialog.menu-sheet")).not.toHaveAttribute("open", "");
    await expect(page.locator("html.lenis-stopped")).toHaveCount(0);
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  });
});
