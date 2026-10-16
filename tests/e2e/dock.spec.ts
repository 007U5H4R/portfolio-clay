/**
 * dock.spec.ts (TASK-224) — the phone-only bottom navigation dock: six items (Home, Experience, Portfolio, About,
 * Certifications, Ask Tushky) in one row, no horizontal overflow, no clipped labels, aria-current per route, content reachable
 * above the dock, the Ask item opens the existing Ask drawer, and tablet / desktop have no dock at all.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const DOCK = 'nav[aria-label="Primary mobile"]';
const LABELS = ["Home", "Xp", "Portfolio", "About", "Certs", "Tushky"];
const WIDTHS = [320, 360, 375, 390, 412, 430];
const ROUTES: { path: string; current: string | null }[] = [
  { path: "/", current: "Home" },
  { path: "/work", current: "Xp" },
  { path: "/work/teachspark", current: "Portfolio" },
  { path: "/projects", current: "Portfolio" },
  { path: "/about", current: "About" },
  { path: "/certifications", current: "Certs" },
  { path: "/contact", current: null },
];
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);

test.describe("mobile dock (TASK-224)", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`six items fit in one row without overflow or clipped labels at every phone width (${theme})`, async ({ page }) => {
      test.skip(width(page) !== 390, "drives its own viewports; runs once");
      for (const w of WIDTHS) {
        await page.setViewportSize({ width: w, height: 760 });
        await page.goto("/", { waitUntil: "load" });
        await setTheme(page, theme);
        await page.evaluate(() => document.fonts.ready);
        const dock = page.locator(DOCK);
        await expect(dock, `dock at ${w}`).toBeVisible();
        const items = dock.locator(".md-item");
        await expect(items).toHaveCount(6);
        const m = await dock.evaluate((el) => {
          const dockBox = el.getBoundingClientRect();
          const cells = [...el.querySelectorAll<HTMLElement>(".md-cell")].map((c) => c.getBoundingClientRect());
          const labels = [...el.querySelectorAll<HTMLElement>(".md-label")].map((l) => {
            const r = document.createRange();
            r.selectNodeContents(l);
            const text = r.getBoundingClientRect();
            return { text: l.textContent, scroll: l.scrollWidth, client: l.clientWidth, textW: text.width, h: l.getBoundingClientRect().height, font: parseFloat(getComputedStyle(l).fontSize) };
          });
          return {
            left: dockBox.left,
            right: dockBox.right,
            rows: new Set(cells.map((c) => Math.round(c.top))).size,
            widths: cells.map((c) => c.width),
            labels,
            docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          };
        });
        expect(m.docOverflow, `page overflow at ${w}`).toBe(0);
        expect(m.left).toBeGreaterThanOrEqual(0);
        expect(m.right).toBeLessThanOrEqual(w);
        expect(m.rows, `one row at ${w}`).toBe(1);
        const avg = m.widths.reduce((a, b) => a + b, 0) / 6;
        for (const cw of m.widths) expect(Math.abs(cw - avg), `equal columns at ${w}`).toBeLessThanOrEqual(1);
        for (const l of m.labels) {
          expect(l.scroll, `${l.text} not clipped at ${w}`).toBeLessThanOrEqual(l.client);
          expect(l.textW, `${l.text} text fits its column at ${w} (${l.font}px)`).toBeLessThanOrEqual(l.client + 0.5);
          expect(l.h, `${l.text} single line at ${w}`).toBeLessThan(l.font * 1.6);
          expect(l.font, `${l.text} label stays readable at ${w}`).toBeGreaterThanOrEqual(10);
        }
        const names = await items.evaluateAll((els) => els.map((e) => e.textContent?.trim()));
        expect(names).toEqual(LABELS);
        // every item is a ≥ 44 px tap target
        const boxes = await items.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON() as DOMRect));
        for (const b of boxes) {
          expect(b.width).toBeGreaterThanOrEqual(44);
          expect(b.height).toBeGreaterThanOrEqual(44);
        }
      }
    });
  }

  test("aria-current marks the right item per route; Portfolio owns project detail pages", async ({ page }) => {
    test.skip(width(page) >= 640, "phone tier only");
    for (const r of ROUTES) {
      await page.goto(r.path, { waitUntil: "load" });
      const current = page.locator(`${DOCK} [aria-current="page"]`);
      if (r.current === null) await expect(current, r.path).toHaveCount(0);
      else {
        await expect(current, r.path).toHaveCount(1);
        await expect(current, r.path).toHaveText(r.current);
      }
    }
  });

  test("links go to the existing routes", async ({ page }) => {
    test.skip(width(page) >= 640, "phone tier only");
    await page.goto("/", { waitUntil: "load" });
    const hrefs = await page.locator(`${DOCK} a`).evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(hrefs).toEqual(["/", "/work", "/projects", "/about", "/certifications"]);
    await page.locator(`${DOCK} a[href="/certifications"]`).click();
    await expect(page).toHaveURL(/\/certifications$/);
  });

  test("Ask Tushky opens the existing drawer and focus returns to the dock item", async ({ page }) => {
    test.skip(width(page) >= 640, "phone tier only");
    await page.goto("/about", { waitUntil: "load" });
    const ask = page.locator(DOCK).getByRole("button", { name: "Ask Tushky" });
    await ask.click();
    const panel = page.locator("dialog.ask-panel");
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("data-open", "");
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(ask).toBeFocused();
  });

  test("the dock never hides the last content: the footer scrolls fully above it", async ({ page }) => {
    test.skip(width(page) >= 640, "phone tier only");
    for (const path of ["/", "/about", "/certifications"]) {
      await page.goto(path, { waitUntil: "load" });
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(300);
      const { footBottom, dockTop } = await page.evaluate(() => {
        const bar = document.querySelector(".band-bar") ?? document.querySelector("footer");
        const dock = document.querySelector("[data-mobile-dock]")!;
        return { footBottom: bar!.getBoundingClientRect().bottom, dockTop: dock.getBoundingClientRect().top };
      });
      expect(footBottom, `${path}: last footer row above the dock`).toBeLessThanOrEqual(dockTop);
    }
  });

  test("keyboard: every item is focusable and shows a visible focus ring in both themes", async ({ page }) => {
    test.skip(width(page) >= 640, "phone tier only");
    await page.goto("/", { waitUntil: "load" });
    for (const theme of ["light", "dark"] as const) {
      await setTheme(page, theme);
      const items = page.locator(`${DOCK} .md-item`);
      for (let i = 0; i < 6; i++) {
        await items.nth(i).focus();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
        await expect(items.nth(i)).toBeFocused();
        const ring = await items.nth(i).evaluate((el) => {
          const s = getComputedStyle(el);
          return { style: s.outlineStyle, w: parseFloat(s.outlineWidth) };
        });
        expect(ring.style).not.toBe("none");
        expect(ring.w).toBeGreaterThanOrEqual(2);
      }
    }
  });

  test("the dock is a real glass layer (backdrop blur) and still renders under reduced motion", async ({ page }) => {
    test.skip(width(page) >= 640, "phone tier only");
    await page.goto("/", { waitUntil: "load" });
    const blur = await page.locator(DOCK).evaluate((el) => getComputedStyle(el).backdropFilter);
    expect(blur).toContain("blur");
    // Tushar 2026-10-16: a 0.78 fill read as an opaque toolbar. The fill must stay see-through in both themes.
    for (const theme of ["light", "dark"] as const) {
      await setTheme(page, theme);
      const alpha = await page.locator(DOCK).evaluate((el) => {
        const m = getComputedStyle(el).backgroundColor.match(/rgba?\(([^)]+)\)/);
        const parts = m?.[1] ? m[1].split(",").map((x) => Number.parseFloat(x)) : [];
        return parts.length === 4 ? (parts[3] ?? 1) : 1;
      });
      expect(alpha, `dock fill alpha (${theme})`).toBeLessThanOrEqual(0.6);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(DOCK)).toBeVisible();
  });

  test("tablet and desktop have no dock (display none) and keep the header tabs", async ({ page }) => {
    test.skip(width(page) < 640, "wide tiers only");
    await page.goto("/", { waitUntil: "load" });
    await expect(page.locator(DOCK)).toBeHidden();
    expect(await page.locator(DOCK).evaluate((el) => getComputedStyle(el).display)).toBe("none");
    await expect(page.locator('header nav[aria-label="Primary"]')).toBeVisible();
    await expect(page.locator("header").getByRole("button", { name: "Ask AI" })).toBeVisible();
  });
});
