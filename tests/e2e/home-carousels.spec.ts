/**
 * home-carousels.spec.ts (TASK-228) — phone-only one-card-per-screen carousels on Home (Credentials, Selected work,
 * Awards & Recognition) with the synchronized liquid-worm pagination. Drives its own viewports (runs once, from w390):
 *   - phone widths 320-430, light + dark: one card visible, a swipe (scroll by one card) advances it, one marker per
 *     real slide, the active marker (aria-current) follows the swipe, tapping a marker moves there, the header, section
 *     heading and dock do not move horizontally, the pagination clears the dock, no page overflow, no clipped title;
 *   - reduced motion: the worm does not stretch and a marker tap jumps;
 *   - 1440 / 1024: the sections keep their grid, no carousel is active, no pagination is rendered.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const WIDTHS = [320, 360, 375, 390, 412, 430];
const SECTIONS = [
  { id: "credentials", noun: "credential" },
  { id: "selected-work", noun: "project" },
  { id: "awards", noun: "award" },
] as const;
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
const activeIndex = (page: Page, id: string) =>
  page.locator(`#${id} .hs-dot`).evaluateAll((els) => els.findIndex((e) => e.getAttribute("aria-current") === "true"));

async function load(page: Page, w: number, theme: "light" | "dark") {
  await page.setViewportSize({ width: w, height: 760 });
  await page.goto("/", { waitUntil: "load" });
  await setTheme(page, theme);
  await page.evaluate(() => document.fonts.ready);
}

test.describe("home carousels (TASK-228)", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`one card per screen, swipe + marker sync, stable framing, no overflow or clipping at every phone width (${theme})`, async ({ page }) => {
      test.skip(width(page) !== 390, "drives its own viewports; runs once");
      test.setTimeout(120_000);
      for (const w of WIDTHS) {
        await load(page, w, theme);
        for (const { id, noun } of SECTIONS) {
          const ul = page.locator(`#${id} .hs-carousel > ul`);
          await ul.scrollIntoViewIfNeeded();
          const n = await ul.locator("> li").count();
          const tag = `${id} @${w} ${theme}`;
          // pagination count equals the data count, labels carry the real count
          const dots = page.locator(`#${id} .hs-dot`);
          await expect(dots, `${tag} markers`).toHaveCount(n);
          await expect(dots.first()).toHaveAttribute("aria-label", `Go to ${noun} 1 of ${n}`);
          expect(await activeIndex(page, id)).toBe(0);

          // exactly one card in view
          const vis = await ul.evaluate((el) => {
            const box = el.getBoundingClientRect();
            return [...el.children].map((c) => {
              const r = c.getBoundingClientRect();
              return Math.max(0, Math.min(r.right, box.right) - Math.max(r.left, box.left)) > 8;
            });
          });
          expect(vis.filter(Boolean).length, `${tag} one card visible`).toBe(1);

          const frame = async () =>
            page.evaluate((sid) => {
              const r = (s: string) => document.querySelector(s)?.getBoundingClientRect().left;
              return { header: r(".site-header"), head: r(`#${sid} .hs-head`), dock: r('nav[aria-label="Primary mobile"]') };
            }, id);
          const before = await frame();

          // swipe: scroll by one card
          await ul.evaluate((el) => {
            const [a, b] = [el.children[0] as HTMLElement, el.children[1] as HTMLElement];
            el.scrollTo({ left: b.offsetLeft - a.offsetLeft, behavior: "instant" });
          });
          await expect.poll(() => activeIndex(page, id), { message: `${tag} marker follows swipe` }).toBe(1);
          expect(await frame(), `${tag} framing does not move`).toEqual(before);

          // tap the last marker
          await dots.nth(n - 1).click();
          await expect.poll(() => activeIndex(page, id), { message: `${tag} marker tap`, timeout: 5000 }).toBe(n - 1);
          await expect.poll(() => ul.evaluate((el) => Math.round(el.scrollLeft)), { timeout: 5000 }).toBeGreaterThan(0);
          // and back to the first
          await dots.first().click();
          await expect.poll(() => activeIndex(page, id), { timeout: 5000 }).toBe(0);

          // the pagination clears the dock; the title is not clipped
          await page.locator(`#${id} .hs-dots`).evaluate((el) => el.scrollIntoView({ block: "center" }));
          const m = await page.evaluate((sid) => {
            const dots = document.querySelector(`#${sid} .hs-dots`)!.getBoundingClientRect();
            const dock = document.querySelector('nav[aria-label="Primary mobile"]')!.getBoundingClientRect();
            const li = document.querySelector(`#${sid} .hs-carousel > ul > li`)!.getBoundingClientRect();
            const name = document.querySelector(`#${sid} .hs-name, #${sid} .hs-award-name`) as HTMLElement;
            const nr = name.getBoundingClientRect();
            return {
              dotsBottom: dots.bottom,
              dockTop: dock.top,
              dotsLeft: dots.left,
              dotsRight: dots.right,
              nameClip: name.scrollWidth - name.clientWidth,
              nameIn: nr.left >= li.left - 1 && nr.right <= li.right + 1,
              overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            };
          }, id);
          expect(m.dotsBottom, `${tag} pagination above dock`).toBeLessThanOrEqual(m.dockTop);
          expect(m.dotsLeft).toBeGreaterThanOrEqual(0);
          expect(m.dotsRight).toBeLessThanOrEqual(w);
          expect(m.nameClip, `${tag} title not clipped`).toBeLessThanOrEqual(1);
          expect(m.nameIn, `${tag} title inside its card`).toBe(true);
          expect(m.overflow, `${tag} page overflow`).toBe(0);
        }
      }
    });
  }

  test("every existing card link survives and the carousels keep independent indices", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    await load(page, 390, "light");
    expect(await page.locator("#credentials .hs-li a, #selected-work .hs-li a").count()).toBe(7);
    expect(await page.locator("#selected-work a.hs-all").getAttribute("href")).toBe("/projects");
    await page.locator("#selected-work .hs-dot").nth(2).click();
    await expect.poll(() => activeIndex(page, "selected-work")).toBe(2);
    expect(await activeIndex(page, "credentials")).toBe(0);
    expect(await activeIndex(page, "awards")).toBe(0);
  });

  test("reduced motion: no worm stretch, a marker tap jumps", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await load(page, 390, "light");
    const dots = page.locator("#awards .hs-dot");
    await page.locator("#awards .hs-dots").scrollIntoViewIfNeeded();
    const pill = page.locator("#awards .hs-dots-pill");
    const w0 = await pill.evaluate((el) => el.getBoundingClientRect().width);
    await dots.nth(3).click();
    await expect.poll(() => activeIndex(page, "awards"), { timeout: 2000 }).toBe(3);
    // the pill never changes width (no stretch) at rest or after the jump
    expect(await pill.evaluate((el) => el.getBoundingClientRect().width)).toBeCloseTo(w0, 0);
    expect(w0).toBeCloseTo(24, 0);
  });

  for (const w of [1440, 1024]) {
    test(`at ${w} the three sections render as before: no carousel active, no pagination`, async ({ page }) => {
      test.skip(width(page) !== 390, "drives its own viewports; runs once");
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/", { waitUntil: "load" });
      for (const { id } of SECTIONS) {
        const m = await page.evaluate((sid) => {
          const wrap = document.querySelector(`#${sid} .hs-carousel`) as HTMLElement;
          const ul = wrap.querySelector(":scope > ul") as HTMLElement;
          const cs = getComputedStyle(ul);
          return {
            wrap: getComputedStyle(wrap).display,
            ul: cs.display,
            overflowX: cs.overflowX,
            snap: cs.scrollSnapType,
            cols: cs.gridTemplateColumns.split(" ").length,
            dots: [...wrap.querySelectorAll(".hs-dots")].every((d) => getComputedStyle(d).display === "none"),
            scrolls: ul.scrollWidth > ul.clientWidth,
          };
        }, id);
        expect(m.wrap).toBe("contents");
        expect(m.ul).toBe("grid");
        expect(m.overflowX).toBe("visible");
        expect(m.snap).toBe("none");
        expect(m.dots).toBe(true);
        expect(m.scrolls).toBe(false);
        expect(m.cols, `${id} columns at ${w}`).toBe(id === "selected-work" ? 3 : 4);
      }
    });
  }
});
