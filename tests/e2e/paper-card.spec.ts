/**
 * paper-card.spec.ts — TASK-303: with PAPER_CARD_ENABLED (and the vertical carousel) the desktop product card is an origami paper card:
 * one thin terracotta outline, surface-less folded-paper arrows (>= 44 px hit boxes, "Previous project" / "Next project"), the product's
 * own poster at its own aspect ratio, pills and description straight from the data. The phone card is untouched (TASK-303 is desktop only).
 * Image checks wait for `complete && naturalWidth > 0`, then `decode()`.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { PAPER_CARD_ENABLED } from "@/components/portfolio/paper-card-flag";
import { VERTICAL_CAROUSEL_ENABLED } from "@/components/portfolio/vertical-carousel-flag";
import { portfolioEntries } from "@/data/portfolio";
import { projects } from "@/data/projects";
import { isListed } from "@/lib/portfolio";

const PERSONAL = projects.filter(isListed);
const SAMPLE = [PERSONAL[0]!, PERSONAL[5]!, PERSONAL[7]!];

test.beforeEach(({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) !== 1440, "viewport is set inside the tests; run once");
});

async function open(page: Page, vw: number, vh: number, slug: string, theme: "light" | "dark") {
  await page.setViewportSize({ width: vw, height: vh });
  await page.goto(`/projects?product=${slug}`, { waitUntil: "load" });
  await page.waitForFunction(() => {
    const tab = document.querySelector('[role="tab"]');
    return !!tab && Object.keys(tab).some((k) => k.startsWith("__react"));
  });
  await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
  await page.locator(".pf-info").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
}

for (const theme of ["light", "dark"] as const) {
  for (const project of SAMPLE) {
    test(`TASK-303: ${project.slug} paper card, ${theme}`, async ({ page }) => {
      test.skip(!PAPER_CARD_ENABLED || !VERTICAL_CAROUSEL_ENABLED, "paper card flag is off");
      test.setTimeout(90_000);
      const entry = portfolioEntries.find((e) => e.slug === project.slug)!;
      await open(page, 1440, 900, project.slug, theme);
      const card = page.locator(".pf-info.pf-paper");
      await expect(card).toHaveCount(1);

      // one continuous outline: a single uniform border on the sheet, no pseudo-layer outlines
      const outline = await card.evaluate((el) => {
        const cs = getComputedStyle(el);
        return {
          widths: [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth],
          colors: new Set([cs.borderTopColor, cs.borderRightColor, cs.borderBottomColor, cs.borderLeftColor]).size,
          before: getComputedStyle(el, "::before").content,
          after: getComputedStyle(el, "::after").content,
        };
      });
      expect(new Set(outline.widths).size).toBe(1);
      expect(parseFloat(outline.widths[0]!)).toBeGreaterThan(0.9);
      expect(parseFloat(outline.widths[0]!)).toBeLessThan(2.6);
      expect(outline.colors).toBe(1);
      expect(["none", "normal"]).toContain(outline.before);
      expect(["none", "normal"]).toContain(outline.after);

      // arrows: labelled, surface-less, >= 44 px, and they change product
      for (const [key, name] of [["prev", "Previous project"], ["next", "Next project"]] as const) {
        const arrow = card.locator(`.pf-info-arrow[data-nav-key="${key}"]`);
        await expect(arrow).toHaveAccessibleName(name);
        const look = await arrow.evaluate((el) => {
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return { bg: cs.backgroundColor, img: cs.backgroundImage, shadow: cs.boxShadow, w: r.width, h: r.height, facets: el.querySelectorAll("svg polygon").length, ariaHidden: el.querySelector(".oa")?.getAttribute("aria-hidden") };
        });
        expect(look.bg).toBe("rgba(0, 0, 0, 0)");
        expect(look.img).toBe("none");
        expect(look.shadow).toBe("none");
        expect(look.w).toBeGreaterThanOrEqual(44);
        expect(look.h).toBeGreaterThanOrEqual(44);
        expect(look.facets).toBe(3);
        expect(look.ariaHidden).toBe("true");
      }
      const i = PERSONAL.findIndex((p) => p.slug === project.slug);
      await card.locator('.pf-info-arrow[data-nav-key="next"]').click();
      await expect(page.getByRole("tabpanel")).toHaveAttribute("data-active-product", PERSONAL[(i + 1) % PERSONAL.length]!.slug);
      await page.locator(".pf-info .pf-info-arrow[data-nav-key='prev']").click();
      await expect(page.getByRole("tabpanel")).toHaveAttribute("data-active-product", project.slug);

      // poster: the product's own cover, unchanged aspect ratio
      const poster = page.locator(".pf-info.pf-paper .pf-info-poster");
      await expect(poster).toHaveAttribute("data-poster", `/media/illustrations/covers/cover-${project.slug}.webp`);
      const img = poster.locator("img");
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(async (el: HTMLImageElement) => {
        const until = Date.now() + 15_000;
        while (!(el.complete && el.naturalWidth > 0) && Date.now() < until) await new Promise((r) => setTimeout(r, 100));
        await el.decode();
      });
      const ratio = await img.evaluate((el: HTMLImageElement) => {
        const r = el.getBoundingClientRect();
        return { shown: r.width / r.height, natural: el.naturalWidth / el.naturalHeight };
      });
      expect(Math.abs(ratio.shown / ratio.natural - 1)).toBeLessThan(0.01);

      // pills + description are the project's own data
      const pills = await card.locator(".pf-pc-pills li").allTextContents();
      expect(pills).toEqual([entry.code, ...entry.meta.split(" · ")]);
      await expect(card.locator(".pf-info-desc")).toHaveText(project.tagline);
      await expect(card.locator(".pf-info-desc")).toBeVisible(); // 1440x900 has the room (a short card gives it up)

      // nothing spills sideways
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440);
    });
  }
}

test("TASK-303: the phone card is unchanged (desktop-only redesign)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/projects?product=${PERSONAL[0]!.slug}`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  await expect(page.locator(".pf-paper")).toHaveCount(0);
  await expect(page.locator(".pf-pc-pills")).toHaveCount(0);
  await expect(page.locator(".oa")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
