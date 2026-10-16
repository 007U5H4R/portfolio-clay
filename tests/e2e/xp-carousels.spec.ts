/**
 * xp-carousels.spec.ts (TASK-230) — /work (Experience) on phones: Work Experience, Education and "What I Bring" are
 * one-card-per-screen swipe carousels with the Home liquid-worm pagination (TASK-228). Drives its own viewports (runs once,
 * from w390). Per carousel, at 320-430 in light and dark: one card visible; a swipe advances it; one marker per real slide;
 * the active marker follows the swipe; a marker tap moves there; header, section heading and dock do not move; the
 * pagination clears the dock and has 44 px targets; no page overflow, no clipped title; the logos are larger than the old
 * 44 px node; the What I Bring map module is out of layout. Reduced motion: a marker tap jumps. At 1440 / 1024 nothing changed.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import { experience } from "../../data/experience";
import { education } from "../../data/credentials";
import { wibStages } from "../../data/what-i-bring";

const WIDTHS = [320, 360, 375, 390, 412, 430];
const CAROUSELS = [
  { id: "work-experience", track: ".ct-list", title: ".ct-name", head: ".ct-head", count: experience.length, noun: "work experience", logos: true },
  { id: "education", track: ".ct-list", title: ".ct-name", head: ".ct-head", count: education.length, noun: "education", logos: true },
  { id: "skills", track: ".wibj-panels", title: ".wibj-title", head: ".wib-head", count: wibStages.length, noun: "stage", logos: false },
] as const;
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
const activeIndex = (page: Page, id: string) =>
  page.locator(`#${id} .hs-dot`).evaluateAll((els) => els.findIndex((e) => e.getAttribute("aria-current") === "true"));

async function load(page: Page, w: number, theme: "light" | "dark") {
  await page.setViewportSize({ width: w, height: 760 });
  await page.goto("/work", { waitUntil: "load" });
  await setTheme(page, theme);
  await page.evaluate(() => document.fonts.ready);
}

test.describe("xp carousels (TASK-230)", () => {
  for (const theme of ["light", "dark"] as const) {
    for (const w of WIDTHS) {
      test(`@${w} ${theme}: one card per screen, swipe + marker sync, stable framing, larger logos, no map`, async ({ page }) => {
        test.skip(width(page) !== 390, "drives its own viewports; runs once");
        test.setTimeout(120_000);
        await load(page, w, theme);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `@${w} ${theme} no page overflow`).toBe(true);

        // the What I Bring map module is out of layout on phones
        for (const sel of [".wibj-frame", ".wibj-map", ".wibj-pin", ".wibj-trackwrap", ".wibj-track", ".wibj-tab"]) {
          const shown = await page.locator(sel).evaluateAll((els) => els.filter((e) => (e as HTMLElement).getClientRects().length > 0).length);
          expect(shown, `@${w} ${theme} ${sel} absent from layout`).toBe(0);
        }

        for (const { id, track, title, head, count, noun, logos } of CAROUSELS) {
          const row = page.locator(`#${id} .hs-carousel > ${track}`);
          await row.scrollIntoViewIfNeeded();
          const tag = `${id} @${w} ${theme}`;
          const n = await row.evaluate((el) => el.children.length);
          expect(n, `${tag} slides = data`).toBe(count);
          const dots = page.locator(`#${id} .hs-dot`);
          await expect(dots, `${tag} markers`).toHaveCount(n);
          await expect(dots.first()).toHaveAttribute("aria-label", `Go to ${noun} 1 of ${n}`);
          expect(await activeIndex(page, id)).toBe(0);

          const vis = await row.evaluate((el) => {
            const box = el.getBoundingClientRect();
            return [...el.children].map((c) => {
              const r = c.getBoundingClientRect();
              return Math.max(0, Math.min(r.right, box.right) - Math.max(r.left, box.left)) > 8;
            });
          });
          expect(vis.filter(Boolean).length, `${tag} one card visible`).toBe(1);

          // no clipped title on the visible card, and it sits inside the viewport
          const t = await row.locator(`> :nth-child(1) ${title}`).first().evaluate((el) => {
            const r = el.getBoundingClientRect();
            return { clipped: el.scrollWidth > el.clientWidth + 1, left: r.left, right: r.right };
          });
          expect(t.clipped, `${tag} title not clipped`).toBe(false);
          expect(t.left).toBeGreaterThanOrEqual(0);
          expect(t.right).toBeLessThanOrEqual(w);

          if (logos) {
            // before TASK-230 the logo was a 44 px node with an image at most 32 px tall
            for (let i = 0; i < n; i++) {
              const m = await row.locator(`> :nth-child(${i + 1})`).evaluate((li) => {
                const tile = li.querySelector(".ct-logo")!.getBoundingClientRect();
                const img = li.querySelector(".ct-logo-img")?.getBoundingClientRect();
                return { tileW: tile.width, tileH: tile.height, imgMax: img ? Math.max(img.width, img.height) : 0 };
              });
              expect(m.tileH, `${tag} #${i} logo tile height`).toBeGreaterThanOrEqual(88);
              expect(m.tileW, `${tag} #${i} logo tile width`).toBeGreaterThanOrEqual(88);
              expect(m.imgMax, `${tag} #${i} logo image`).toBeGreaterThanOrEqual(56);
            }
          }

          const frame = () =>
            page.evaluate(
              ([sid, h]) => {
                const r = (s: string) => document.querySelector(s)?.getBoundingClientRect().left;
                return { header: r(".site-header"), head: r(`#${sid} ${h}`), dock: r('nav[aria-label="Primary mobile"]') };
              },
              [id, head] as const,
            );
          const before = await frame();

          // swipe: scroll by one card
          await row.evaluate((el) => {
            const [a, b] = [el.children[0] as HTMLElement, el.children[1] as HTMLElement];
            el.scrollTo({ left: b.offsetLeft - a.offsetLeft, behavior: "instant" });
          });
          await expect.poll(() => activeIndex(page, id), { message: `${tag} marker follows swipe` }).toBe(1);
          expect(await frame(), `${tag} framing does not move`).toEqual(before);

          // the pagination clears the dock and has 44 px targets
          await dots.first().evaluate((el) => el.scrollIntoView({ block: "center" }));
          const geo = await page.evaluate((sid) => {
            const d = document.querySelector(`#${sid} .hs-dots`)!.getBoundingClientRect();
            const dock = document.querySelector('nav[aria-label="Primary mobile"]')!.getBoundingClientRect();
            const dot = document.querySelector(`#${sid} .hs-dot`)!.getBoundingClientRect();
            return { bottom: d.bottom, dockTop: dock.top, dw: dot.width, dh: dot.height };
          }, id);
          expect(geo.bottom, `${tag} pagination clears the dock`).toBeLessThanOrEqual(geo.dockTop);
          expect(geo.dw, `${tag} marker target width`).toBeGreaterThanOrEqual(44);
          expect(geo.dh, `${tag} marker target height`).toBeGreaterThanOrEqual(44);

          // tap the last marker, then the first
          await dots.first().evaluate((el) => el.scrollIntoView({ block: "center" }));
          await dots.nth(n - 1).click();
          await expect.poll(() => activeIndex(page, id), { message: `${tag} marker tap`, timeout: 5000 }).toBe(n - 1);
          await expect.poll(() => row.evaluate((el) => Math.round(el.scrollLeft)), { timeout: 5000 }).toBeGreaterThan(0);
          await dots.first().evaluate((el) => el.scrollIntoView({ block: "center" }));
          await dots.first().click();
          await expect.poll(() => activeIndex(page, id), { timeout: 5000 }).toBe(0);
        }

        // What I Bring: prev / next (kept) move the same carousel, and the markers follow
        const next = page.getByRole("button", { name: "Next stage" });
        await next.scrollIntoViewIfNeeded();
        await next.click();
        await expect.poll(() => activeIndex(page, "skills"), { message: `next button @${w} ${theme}`, timeout: 5000 }).toBe(1);
        await page.getByRole("button", { name: "Previous stage" }).click();
        await expect.poll(() => activeIndex(page, "skills"), { timeout: 5000 }).toBe(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `@${w} ${theme} no overflow after`).toBe(true);
      });
    }
  }

  test("reduced motion: a marker tap jumps and the pill does not stretch", async ({ page: host, browser }) => {
    test.skip(width(host) !== 390, "drives its own viewports; runs once");
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 760 } });
    const page = await ctx.newPage();
    await page.goto("/work", { waitUntil: "load" });
    for (const { id, count } of CAROUSELS) {
      const dots = page.locator(`#${id} .hs-dot`);
      await dots.first().scrollIntoViewIfNeeded();
      await dots.nth(count - 1).click();
      await expect.poll(() => activeIndex(page, id), { timeout: 1500 }).toBe(count - 1);
      const w = await page.locator(`#${id} .hs-dots-pill`).evaluate((el) => parseFloat((el as HTMLElement).style.width));
      expect(w, `${id} pill rests at its dot size`).toBeLessThanOrEqual(25);
    }
    await ctx.close();
  });

  for (const w of [1440, 1024]) {
    test(`${w}: nothing changed — no carousel, no pagination, the map and the stage track are present`, async ({ page }) => {
      test.skip(width(page) !== 390, "drives its own viewports; runs once");
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/work", { waitUntil: "load" });
      await expect(page.locator(".hs-dots")).toHaveCount(3);
      for (const el of await page.locator(".hs-dots").all()) await expect(el).toBeHidden();
      await expect(page.locator(".wibj-frame")).toBeVisible();
      await expect(page.locator(".wibj-pin").first()).toBeVisible();
      await expect(page.locator(".wibj-trackwrap")).toBeVisible();
      for (const id of ["work-experience", "education"]) {
        const o = await page.locator(`#${id} .ct-list`).evaluate((el) => ({ overflow: getComputedStyle(el).overflowX, sw: el.scrollWidth, cw: el.clientWidth }));
        expect(o.overflow).toBe("visible");
        expect(o.sw).toBeLessThanOrEqual(o.cw + 1);
      }
      const shown = await page.locator(".wibj-panel").evaluateAll((els) => els.filter((e) => getComputedStyle(e).display !== "none").length);
      expect(shown).toBe(1);
    });
  }
});
