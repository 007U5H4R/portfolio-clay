/**
 * phone-menu.spec.ts (TASK-232) — the phone drawer behind the header kebab: slides in from the left and back out to the left (× / Esc /
 * backdrop), focus returns to the kebab, exact group + row order, Product thinking / Gummy Lab absent (routes still 200), Ask Tushky
 * opens the Ask drawer, LinkedIn is external, aria-current, >= 44 px rows, no overflow, reduced motion, no focused text input.
 * Phone widths are driven here (runs once, under the w390 project); >= 640 the kebab and drawer must not exist.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { resumeAction, site } from "../../lib/site";

const WIDTHS = [320, 360, 375, 390, 412, 430];
const ROWS = ["Home", "Experience", "Portfolio", "Ask Tushky", "About", "Certifications", "Let's connect", "LinkedIn", "GitHub", "Resume"];
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
const SHEET = "dialog.more-menu .more-sheet";

/** Click the kebab and record the sheet's left edge on every frame for `ms`. */
const openAndSample = (page: Page, ms = 600) =>
  page.evaluate(async (ms) => {
    const lefts: number[] = [];
    (document.querySelector(".header-more") as HTMLButtonElement).click();
    const t0 = performance.now();
    while (performance.now() - t0 < ms) {
      const el = document.querySelector(".more-menu .more-sheet");
      if (el) lefts.push(Math.round(el.getBoundingClientRect().left * 10) / 10);
      await new Promise((r) => requestAnimationFrame(r));
    }
    return lefts;
  }, ms);

/** Run `trigger` in the page and record the sheet's left edge until the dialog unmounts (or 1.2 s). */
const closeAndSample = async (page: Page, how: "x" | "esc" | "backdrop") => {
  const w = width(page);
  const sampler = page.evaluate(async () => {
    const lefts: number[] = [];
    const t0 = performance.now();
    while (performance.now() - t0 < 1200) {
      const el = document.querySelector(".more-menu .more-sheet");
      if (!el) break;
      lefts.push(Math.round(el.getBoundingClientRect().left * 10) / 10);
      await new Promise((r) => requestAnimationFrame(r));
    }
    return lefts;
  });
  if (how === "x") await page.getByRole("button", { name: "Close menu" }).click();
  else if (how === "esc") await page.keyboard.press("Escape");
  else await page.mouse.click(w - 6, 400);
  return sampler;
};

test.describe("phone menu drawer (TASK-232)", () => {
  test("< 640 only: the kebab and drawer do not exist at tablet/desktop widths", async ({ page }) => {
    test.skip(width(page) < 640, "desktop/tablet only");
    await page.goto("/", { waitUntil: "load" });
    await expect(page.getByRole("button", { name: "More", exact: true })).toBeHidden();
    await expect(page.locator("dialog.more-menu")).toHaveCount(0);
  });

  for (const theme of ["light", "dark"] as const) {
    test(`structure, rows, a11y and no overflow at every phone width (${theme})`, async ({ page }) => {
      test.skip(width(page) !== 390, "drives its own viewports; runs once");
      for (const w of WIDTHS) {
        await page.setViewportSize({ width: w, height: 760 });
        await page.goto("/work", { waitUntil: "load" });
        await setTheme(page, theme);
        const kebab = page.getByRole("button", { name: "More", exact: true });
        await expect(kebab).toHaveAttribute("aria-expanded", "false");
        await kebab.click();
        const dlg = page.locator("dialog.more-menu");
        await expect(dlg, `open at ${w}`).toBeVisible();
        await expect(kebab).toHaveAttribute("aria-expanded", "true");
        await expect(page.locator(SHEET)).toBeVisible();
        await page.waitForTimeout(450); // let the slide settle

        // exact groups and rows
        await expect(dlg.getByRole("heading", { level: 2 })).toHaveText(["Portfolio", "Connect"]);
        const labels = await dlg.locator(".more-name").allTextContents();
        expect(labels, `row order at ${w}`).toEqual(ROWS);
        await expect(dlg.getByText("Questions about my work")).toBeVisible();
        await expect(dlg.getByText("Product thinking")).toHaveCount(0);
        await expect(dlg.getByText("Gummy Lab")).toHaveCount(0);
        await expect(dlg.getByRole("heading", { name: "Explore" })).toHaveCount(0);
        expect(await dlg.locator("a[href='/thinking'], a[href='/lab']").count()).toBe(0);

        // geometry: drawer from the left edge, 70-82% wide, rows >= 44 px, nothing clipped, no overflow
        const g = await page.evaluate(() => {
          const sheet = document.querySelector(".more-menu .more-sheet") as HTMLElement;
          const sr = sheet.getBoundingClientRect();
          const rows = [...document.querySelectorAll<HTMLElement>(".more-menu .more-row")].map((r) => {
            const b = r.getBoundingClientRect();
            return { h: b.height, l: b.left, r: b.right, sw: r.scrollWidth - r.clientWidth };
          });
          return {
            left: sr.left,
            w: sr.width,
            rows,
            sheetOverflow: sheet.scrollWidth - sheet.clientWidth,
            doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            active: document.activeElement?.tagName,
          };
        });
        expect(g.left).toBeCloseTo(0, 0);
        expect(g.w / w).toBeGreaterThanOrEqual(0.7);
        expect(g.w / w).toBeLessThanOrEqual(0.83);
        expect(g.rows).toHaveLength(10);
        for (const r of g.rows) {
          expect(r.h, `row height at ${w}`).toBeGreaterThanOrEqual(44);
          expect(r.l).toBeGreaterThanOrEqual(0);
          expect(r.r).toBeLessThanOrEqual(g.w);
          expect(r.sw).toBeLessThanOrEqual(0);
        }
        expect(g.sheetOverflow).toBeLessThanOrEqual(0);
        expect(g.doc).toBeLessThanOrEqual(0);
        // never an auto-focused text input (TASK-231 lesson)
        expect(["INPUT", "TEXTAREA"]).not.toContain(g.active);

        // semantics: current route, external LinkedIn
        await expect(dlg.locator("[aria-current='page']")).toHaveCount(1);
        await expect(dlg.getByRole("link", { name: "Experience" })).toHaveAttribute("aria-current", "page");
        const li = dlg.getByRole("link", { name: /LinkedIn/ });
        await expect(li).toHaveAttribute("target", "_blank");
        expect(await li.getAttribute("rel")).toContain("noopener");
        await expect(li.locator("svg").first()).toBeAttached();
        // TASK-302: GitHub and Resume follow LinkedIn, same destinations as the footer, new tab, noopener, sr-only hint
        for (const [name, href] of [["GitHub", site.github], ["Resume", resumeAction().href]] as const) {
          const a = dlg.getByRole("link", { name: new RegExp(name) });
          await expect(a).toHaveAttribute("href", href);
          await expect(a).toHaveAttribute("target", "_blank");
          expect(await a.getAttribute("rel")).toContain("noopener");
          await expect(a.locator("svg").first()).toBeAttached();
          await expect(a.locator(".sr-only")).toHaveText("(opens in a new tab)");
        }
        await expect(dlg.getByRole("link", { name: /Let's connect/ })).toHaveAttribute("href", "/contact");
        await expect(dlg.getByRole("button", { name: /Ask Tushky/ })).toBeVisible();

        // TASK-302: frosted glass rows (computed backdrop-filter blur) and a clean axe pass on the open menu
        const filters = await page.evaluate(() =>
          [...document.querySelectorAll(".more-menu .more-row")].map((r) => getComputedStyle(r).backdropFilter),
        );
        expect(filters).toHaveLength(10);
        for (const f of filters) expect(f, `backdrop-filter at ${w}`).toContain("blur");
        const axe = await new AxeBuilder({ page }).include("dialog.more-menu").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`), `axe at ${w}`).toEqual([]);

        await page.keyboard.press("Escape");
        await expect(dlg).toHaveCount(0);
        await expect(kebab).toBeFocused();
      }
    });
  }

  test("slides in from the left; closes back to the left via ×, Esc and the backdrop; focus returns to the kebab", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    await page.setViewportSize({ width: 375, height: 760 });
    await page.goto("/", { waitUntil: "load" });
    const kebab = page.getByRole("button", { name: "More", exact: true });
    const lefts = await openAndSample(page);
    expect(lefts.length).toBeGreaterThan(5);
    expect(Math.min(...lefts), "starts off-screen left").toBeLessThan(-40);
    expect(lefts.at(-1)).toBeCloseTo(0, 0);
    for (let i = 1; i < lefts.length; i++) expect(lefts[i]!).toBeGreaterThanOrEqual(lefts[i - 1]! - 0.5); // moves rightwards only
    // first button inside the drawer holds focus (the close ×), never a text field
    await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();
    // the page behind is inert: Tab only ever lands inside the drawer (or leaves the document for browser chrome, i.e. body)
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => document.activeElement === document.body || !!document.activeElement?.closest("dialog.more-menu"))).toBe(true);
    }
    for (const how of ["x", "esc", "backdrop"] as const) {
      if (how !== "x") {
        await kebab.click();
        await expect(page.locator(SHEET)).toBeVisible();
        await page.waitForTimeout(450);
      }
      const out = await closeAndSample(page, how);
      expect(out.length, `${how} exit frames`).toBeGreaterThan(2);
      expect(out.at(-1), `${how} ends left of the viewport`).toBeLessThan(-20);
      await expect(page.locator("dialog.more-menu")).toHaveCount(0);
      await expect(kebab).toBeFocused();
      await expect(kebab).toHaveAttribute("aria-expanded", "false");
    }
  });

  test("scroll is locked behind the drawer", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    await page.goto("/about", { waitUntil: "load" });
    await page.evaluate(() => window.scrollTo(0, 300));
    const before = await page.evaluate(() => window.scrollY);
    await page.getByRole("button", { name: "More", exact: true }).click();
    await expect(page.locator(SHEET)).toBeVisible();
    await page.mouse.move(370, 400);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => window.scrollY)).toBe(before);
  });

  test("a destination navigates and closes; the Product thinking and Gummy Lab routes still work", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    await page.goto("/", { waitUntil: "load" });
    await page.getByRole("button", { name: "More", exact: true }).click();
    await page.locator("dialog.more-menu").getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator("dialog.more-menu")).toHaveCount(0);
    for (const route of ["/thinking", "/lab"]) {
      const res = await page.request.get(route);
      expect(res.status(), route).toBe(200);
    }
  });

  test("Ask Tushky opens the Ask drawer (no navigation)", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    await page.goto("/work", { waitUntil: "load" });
    await page.getByRole("button", { name: "More", exact: true }).click();
    await page.locator("dialog.more-menu").getByRole("button", { name: /Ask Tushky/ }).click();
    await expect(page.locator("dialog.more-menu")).toHaveCount(0);
    await expect(page.locator(".ask-panel[data-open]")).toBeVisible();
    await expect(page).toHaveURL(/\/work$/);
  });

  test("reduced motion: no slide, appears and disappears in place", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "load" });
    const lefts = await openAndSample(page, 300);
    expect(lefts.length).toBeGreaterThan(2);
    for (const l of lefts) expect(l).toBeCloseTo(0, 0);
    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(page.locator("dialog.more-menu")).toHaveCount(0, { timeout: 150 });
    await expect(page.getByRole("button", { name: "More", exact: true })).toBeFocused();
  });

  test("short phone (320 x 568): every row is reachable by scrolling the drawer, the close button stays visible", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/", { waitUntil: "load" });
    await page.getByRole("button", { name: "More", exact: true }).click();
    await page.waitForTimeout(450);
    await expect(page.getByRole("button", { name: "Close menu" })).toBeInViewport();
    const last = page.locator("dialog.more-menu").getByRole("link", { name: /Resume/ });
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeInViewport();
  });
});
