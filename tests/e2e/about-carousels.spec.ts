/**
 * about-carousels.spec.ts (TASK-234) — phone-only one-card-per-screen carousels on /about for three sections, each with
 * its own independent liquid-worm pagination (the shared MobileCarousel, TASK-228): Three Chapters (`#chapters`),
 * the research artifacts (`#research-values`) and In their words (`#testimonials`). Drives its own viewports (runs once, from w390):
 *   - phone widths 320-430, light + dark: one card visible, a swipe (scroll by one card) advances it, one marker per real
 *     card, the active marker follows the swipe, a marker tap moves the carousel, the header, heading and dock do not move
 *     horizontally, the pagination clears the dock, no page overflow, no clipped title, every control >= 44 x 44;
 *   - the three indices are independent (and independent of the Recognition awards carousel);
 *   - DOI and publication links are present, point at their DOIs and are clickable (not covered by the dock);
 *   - reduced motion: the worm does not stretch and a marker tap jumps;
 *   - 1440 / 1024 / 768: no carousel is active and no pagination is rendered (the grids keep their columns).
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import { papers } from "@/data/credentials";
import { testimonials } from "@/data/testimonials";
import { CHAPTERS, RESEARCH_ARTIFACTS } from "@/components/about/about-content";

const WIDTHS = [320, 360, 375, 390, 412, 430];
const SECTIONS = [
  { id: "chapters", heading: "chapters-heading", noun: "chapter", count: CHAPTERS.length, title: ".chx-name" },
  { id: "research-values", heading: "research-heading", noun: "research card", count: RESEARCH_ARTIFACTS.length, title: ".rvx-title" },
  { id: "testimonials", heading: "testimonials-heading", noun: "recommendation", count: testimonials.filter((t) => t.publicOnLinkedIn).length, title: ".tsx-quote p" },
] as const;
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
const activeIndex = (page: Page, id: string) =>
  page.locator(`#${id} .hs-dot`).evaluateAll((els) => els.findIndex((e) => e.getAttribute("aria-current") === "true"));
const scroller = (page: Page, id: string) => page.locator(`#${id} .hs-carousel > :is(ul, ol)`);

async function load(page: Page, w: number, theme: "light" | "dark") {
  await page.setViewportSize({ width: w, height: 760 });
  await page.goto("/about", { waitUntil: "load" });
  await setTheme(page, theme);
  await page.evaluate(() => document.fonts.ready);
}

test.describe("about carousels (TASK-234)", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`one card per screen, swipe + marker sync, stable framing, no overflow or clipping at every phone width (${theme})`, async ({ page }) => {
      test.skip(width(page) !== 390, "drives its own viewports; runs once");
      test.setTimeout(180_000);
      for (const w of WIDTHS) {
        await load(page, w, theme);
        for (const { id, heading, noun, count, title } of SECTIONS) {
          const list = scroller(page, id);
          await list.scrollIntoViewIfNeeded();
          const n = await list.locator("> li").count();
          const tag = `${id} @${w} ${theme}`;
          expect(n, `${tag} item count matches the data`).toBe(count);
          const dots = page.locator(`#${id} .hs-dot`);
          await expect(dots, `${tag} markers`).toHaveCount(n);
          await expect(dots.first()).toHaveAttribute("aria-label", `Go to ${noun} 1 of ${n}`);
          expect(await activeIndex(page, id)).toBe(0);

          const vis = await list.evaluate((el) => {
            const box = el.getBoundingClientRect();
            return [...el.children].map((c) => {
              const r = c.getBoundingClientRect();
              return Math.max(0, Math.min(r.right, box.right) - Math.max(r.left, box.left)) > 24;
            });
          });
          expect(vis.filter(Boolean).length, `${tag} one card visible`).toBe(1);

          const frame = () =>
            page.evaluate((hid) => {
              const r = (s: string) => document.querySelector(s)?.getBoundingClientRect().left;
              return { header: r(".site-header"), head: r(`#${hid}`), dock: r('nav[aria-label="Primary mobile"]') };
            }, heading);
          const before = await frame();

          await list.evaluate((el) => {
            const [a, b] = [el.children[0] as HTMLElement, el.children[1] as HTMLElement];
            el.scrollTo({ left: b.offsetLeft - a.offsetLeft, behavior: "instant" });
          });
          await expect.poll(() => activeIndex(page, id), { message: `${tag} marker follows swipe` }).toBe(1);
          expect(await frame(), `${tag} framing does not move`).toEqual(before);

          await dots.nth(n - 1).click();
          await expect.poll(() => activeIndex(page, id), { message: `${tag} marker tap`, timeout: 5000 }).toBe(n - 1);
          await expect.poll(() => list.evaluate((el) => Math.round(el.scrollLeft)), { timeout: 5000 }).toBeGreaterThan(0);
          await dots.first().click();
          await expect.poll(() => activeIndex(page, id), { timeout: 5000 }).toBe(0);

          await page.locator(`#${id} .hs-dots`).evaluate((el) => el.scrollIntoView({ block: "center" }));
          const m = await page.evaluate(
            ({ sid, sel }) => {
              const dots = document.querySelector(`#${sid} .hs-dots`)!.getBoundingClientRect();
              const dock = document.querySelector('nav[aria-label="Primary mobile"]')!.getBoundingClientRect();
              const li = document.querySelector(`#${sid} .hs-carousel > :is(ul, ol) > li`)!.getBoundingClientRect();
              const name = document.querySelector(`#${sid} ${sel}`) as HTMLElement;
              const nr = name.getBoundingClientRect();
              const btns = [...document.querySelectorAll(`#${sid} .hs-dot`)].map((e) => e.getBoundingClientRect()).map((r) => Math.min(r.width, r.height));
              return {
                dotsBottom: dots.bottom,
                dockTop: dock.top,
                dotsLeft: dots.left,
                dotsRight: dots.right,
                nameClip: name.scrollWidth - name.clientWidth,
                nameIn: nr.left >= li.left - 1 && nr.right <= li.right + 1,
                minTarget: Math.min(...btns),
                overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
              };
            },
            { sid: id, sel: title },
          );
          expect(m.dotsBottom, `${tag} pagination above dock`).toBeLessThanOrEqual(m.dockTop);
          expect(m.dotsLeft).toBeGreaterThanOrEqual(0);
          expect(m.dotsRight).toBeLessThanOrEqual(w);
          expect(m.nameClip, `${tag} title not clipped`).toBeLessThanOrEqual(1);
          expect(m.nameIn, `${tag} title inside its card`).toBe(true);
          expect(m.minTarget, `${tag} marker targets >= 44`).toBeGreaterThanOrEqual(44);
          expect(m.overflow, `${tag} page overflow`).toBe(0);
        }
      }
    });
  }

  test("the three carousels keep independent indices (and leave the awards carousel alone)", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    await load(page, 390, "light");
    await page.locator("#research-values .hs-dot").nth(2).click();
    await expect.poll(() => activeIndex(page, "research-values")).toBe(2);
    expect(await activeIndex(page, "chapters")).toBe(0);
    expect(await activeIndex(page, "testimonials")).toBe(0);
    await page.locator("#testimonials .hs-dot").nth(1).click();
    await expect.poll(() => activeIndex(page, "testimonials")).toBe(1);
    await page.locator("#chapters .hs-dot").nth(2).click();
    await expect.poll(() => activeIndex(page, "chapters")).toBe(2);
    expect(await activeIndex(page, "research-values")).toBe(2);
    expect(await activeIndex(page, "testimonials")).toBe(1);
    expect(await activeIndex(page, "recognition")).toBe(0);
  });

  test("DOI and publication links are still present and clickable; the quotes and chapters keep their full text", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    await load(page, 390, "light");
    // every paper's DOI is linked (nanotechnology card once, publications card once more) and nothing is invented
    const hrefs = await page.locator("#research-values a.rvx-doi").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    const want = [papers.find((p) => p.id === "langmuir-2025")!, ...papers].map((p) => p.doiHref);
    expect(hrefs).toEqual(want);
    expect(await page.locator("#research-values a.rvx-patent-link").count()).toBe(1);
    // each link is reachable: slide to its card, then it is hit-testable (not under the dock)
    const links = page.locator("#research-values .hs-carousel a");
    const total = await links.count();
    for (let i = 0; i < total; i++) {
      const link = links.nth(i);
      const slide = await link.evaluate((el) => [...el.closest("ul")!.children].indexOf(el.closest("li")!));
      await page.locator("#research-values .hs-dot").nth(slide).click();
      await expect.poll(() => activeIndex(page, "research-values")).toBe(slide);
      await link.evaluate((el) => el.scrollIntoView({ block: "center" }));
      const box = (await link.boundingBox())!;
      expect(box.height, `link ${i} height`).toBeGreaterThan(10);
      const hit = await link.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const top = document.elementFromPoint(r.left + Math.min(12, r.width / 2), r.top + r.height / 2);
        return !!top && (el === top || el.contains(top));
      });
      expect(hit, `link ${i} is hit-testable`).toBe(true);
    }
    // quotes and attribution are whole (never truncated to fit a card)
    for (const t of testimonials.filter((x) => x.publicOnLinkedIn)) {
      const card = page.locator(`#testimonials [data-testimonial="${t.id}"]`);
      await expect(card.locator("blockquote")).toHaveText(t.excerpt.join(" … "));
      await expect(card.locator(".tsx-name")).toHaveText(t.name);
      await expect(card.locator(".tsx-role")).toHaveText(t.role);
    }
    for (const c of CHAPTERS) {
      const card = page.locator(`#chapters [data-chapter="${c.id}"]`);
      await expect(card.locator(".chx-text")).toHaveText(c.body);
      expect(await card.locator(".chx-tags li").count()).toBe(c.tags.length);
    }
  });

  test("reduced motion: no worm stretch, a marker tap jumps, nothing is left hidden", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await load(page, 390, "light");
    for (const { id } of SECTIONS) {
      await page.locator(`#${id} .hs-dots`).scrollIntoViewIfNeeded();
      const pill = page.locator(`#${id} .hs-dots-pill`);
      const w0 = await pill.evaluate((el) => el.getBoundingClientRect().width);
      await page.locator(`#${id} .hs-dot`).nth(2).click();
      await expect.poll(() => activeIndex(page, id), { timeout: 2000 }).toBe(2);
      expect(await pill.evaluate((el) => el.getBoundingClientRect().width)).toBeCloseTo(w0, 0);
      expect(w0).toBeCloseTo(24, 0);
      const opacities = await page.locator(`#${id} .hs-carousel .reveal`).evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity));
      expect(opacities.every((o) => o === "1"), `${id} slides visible`).toBe(true);
    }
  });

  for (const w of [1440, 1024, 768]) {
    test(`at ${w} the three sections render as before: no carousel active, no pagination`, async ({ page }) => {
      test.skip(width(page) !== 390, "drives its own viewports; runs once");
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/about", { waitUntil: "load" });
      for (const { id } of SECTIONS) {
        const m = await page.evaluate((sid) => {
          const wrap = document.querySelector(`#${sid} .hs-carousel`) as HTMLElement;
          const list = wrap.querySelector(":scope > :is(ul, ol)") as HTMLElement;
          const cs = getComputedStyle(list);
          return {
            wrap: getComputedStyle(wrap).display,
            list: cs.display,
            overflowX: cs.overflowX,
            snap: cs.scrollSnapType,
            cols: cs.gridTemplateColumns.split(" ").length,
            dots: [...wrap.querySelectorAll(".hs-dots")].every((d) => getComputedStyle(d).display === "none"),
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          };
        }, id);
        expect(m.wrap).toBe("contents");
        expect(m.list).toBe("grid");
        expect(m.overflowX).toBe("visible");
        expect(m.snap).toBe("none");
        expect(m.dots).toBe(true);
        expect(m.overflow, `${id} page overflow at ${w}`).toBe(0);
        const cols = id === "testimonials" ? (w >= 900 ? 3 : 1) : w >= 1024 ? 3 : 2;
        expect(m.cols, `${id} columns at ${w}`).toBe(id === "research-values" && w < 1024 ? 2 : cols);
      }
    });
  }
});
