/**
 * TASK-110 regression (Tushar 2026-09-27: "the text are overlapping during parallax scrolling").
 *
 * TKT-106 makes the section ABOVE every torn sheet lag while the sheet keeps page speed, so the sheet
 * slides up over it. That only works when the sheet paints above the lagging section. `/playground`'s
 * opener copy (`.pg-opener`, z-index 2) sat above the bench sheet (z-index 1), so the lagging title
 * "Big questions." was drawn over the sheet's "Experiments" heading. `/about`'s impact sheet (z 2)
 * sat above the experience sheet (z 1) the same way.
 *
 * Invariant checked on every public route: for each torn sheet (a section whose first child is the
 * `TornEdge`, `[data-decor="torn"]`), its z-index is ≥ its previous sibling's (auto = 0; a tie is fine
 * because the later sibling paints on top).
 */
import { expect, test } from "./fixtures";
import { STATIC_ROUTES } from "@/app/sitemap";
import { projects } from "@/data/projects";
import { writing } from "@/data/writing";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;
const ROUTES = [
  ...STATIC_ROUTES,
  ...projects.filter((p) => p.category !== "professional").map((p) => `/work/${p.slug}`),
  ...writing.map((essay) => `/thinking/${essay.slug}`),
];

for (const route of ROUTES) {
  test(`parallax · every torn sheet paints above the section it slides over · ${route}`, async ({ page }) => {
    test.skip(width(page) !== 1440, "stacking is width-independent; checked once at w1440");
    const res = await page.goto(route, { waitUntil: "load" });
    expect(res?.status(), `${route} must be 200`).toBe(200);
    const inverted = await page.evaluate(() => {
      const z = (el: Element) => {
        const v = getComputedStyle(el).zIndex;
        return v === "auto" ? 0 : Number(v);
      };
      const name = (el: Element) =>
        `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}.${String(el.className).split(" ")[0]}`;
      const out: string[] = [];
      for (const torn of document.querySelectorAll('[data-decor="torn"]:first-child')) {
        const sheet = torn.parentElement;
        const prev = sheet?.previousElementSibling;
        if (!sheet || !prev) continue;
        if (z(sheet) < z(prev)) out.push(`${name(prev)} (z ${z(prev)}) above sheet ${name(sheet)} (z ${z(sheet)})`);
      }
      return out;
    });
    expect(inverted, "a lagging section must never paint over the torn sheet that slides over it").toEqual([]);
  });
}
