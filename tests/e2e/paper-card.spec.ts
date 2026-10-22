/**
 * paper-card.spec.ts — TASK-303: with PAPER_CARD_ENABLED (and the vertical carousel) the desktop product card is an origami paper card:
 * one thin terracotta outline, surface-less folded-paper arrows (>= 44 px hit boxes, "Previous project" / "Next project"), the product's
 * own poster at its own aspect ratio, pills and description straight from the data. The phone card is untouched (TASK-303 is desktop only).
 * Image checks wait for `complete && naturalWidth > 0`, then `decode()`.
 */
import type { Locator, Page } from "@playwright/test";
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

      // TASK-334: the selector is the one navigation control - the card has no arrows, index or pager (not merely hidden)
      await expect(card.locator(".pf-info-nav, .pf-info-pager, .pf-info-arrow, .pf-info-dot, .pf-info-count")).toHaveCount(0);
      const i = PERSONAL.findIndex((p) => p.slug === project.slug);
      await page.locator('.pf-carousel[data-paper-selector] [role="tab"][data-product]').nth((i + 1) % PERSONAL.length).click();
      await expect(page.getByRole("tabpanel")).toHaveAttribute("data-active-product", PERSONAL[(i + 1) % PERSONAL.length]!.slug);
      await page.locator('.pf-carousel[data-paper-selector] .pf-arrow[data-dir="prev"]').click();
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
      // TASK-354: 1440x900 is a tight card - the two-line wording shows and the three-line one is display:none
      await expect(card.locator(".pf-info-desc:visible")).toHaveCount(1);
      await expect(card.locator(".pf-info-desc:visible")).toHaveText(entry.cardLine ?? project.tagline);
      await expect(card.locator(".pf-info-desc:visible")).toHaveAttribute("title", project.tagline);
      // TASK-303 r2: the description uses two lines above the CTA, and the actions stay inside the card
      const fit = await descFit(card);
      if ((entry.cardLine ?? project.tagline).length > 70) expect(fit.lines).toBe(2);
      expect(fit.clipped, "the description shows in full — shorten its cardLine if this fails").toBeLessThanOrEqual(1);
      expect(fit.descBottom).toBeLessThanOrEqual(fit.ctaTop);
      expect(fit.ctaBottom).toBeLessThanOrEqual(fit.cardBottom);

      // nothing spills sideways
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440);
    });
  }
}

/** The visible description's line count, clipping and position against the CTA and the card's bottom. */
async function descFit(card: Locator) {
  return card.evaluate((el) => {
    const d = [...el.querySelectorAll<HTMLElement>(".pf-info-desc")].find((e) => getComputedStyle(e).display !== "none")!;
    const r = d.getBoundingClientRect();
    const lh = parseFloat(getComputedStyle(d).lineHeight);
    const cta = el.querySelector(".pf-action-set")!.getBoundingClientRect();
    return { variant: d.dataset.variant, lines: Math.round(r.height / lh), clipped: d.scrollHeight - d.clientHeight, descBottom: r.bottom, ctaTop: cta.top, ctaBottom: cta.bottom, cardBottom: el.getBoundingClientRect().bottom };
  });
}

// TASK-303 r2 (Tushar 2026-10-20): every product's description shows in full at 1440x900 - none ends in an ellipsis.
// TASK-354 (Tushar 2026-10-22): the card picks two or three lines by the space it has. A tight card (1280x800, 1440x900) keeps the
// short wording; a roomy one (1536x864, 1920x1080) shows the long wording on three lines. Nothing is cut off at either.
// nuptis and campfire-board wrap their short wording onto a third line at 1440x900, inside that tier's three-line clamp (as before).
const THREE_LINES_AT_1440 = ["nuptis", "campfire-board"];
const TIGHT: Array<[number, number]> = [[1280, 800], [1440, 900]];
const ROOMY: Array<[number, number]> = [[1536, 864], [1920, 1080]];

test("TASK-354: tight cards show the short wording, roomy cards the long wording on three lines; nothing is cut off", async ({ page }) => {
  test.skip(!PAPER_CARD_ENABLED || !VERTICAL_CAROUSEL_ENABLED, "paper card flag is off");
  test.setTimeout(360_000);
  const problems: string[] = [];
  for (const [vw, vh] of [...TIGHT, ...ROOMY]) {
    const roomy = ROOMY.some(([w]) => w === vw);
    for (const project of PERSONAL) {
      const entry = portfolioEntries.find((e) => e.slug === project.slug)!;
      await open(page, vw, vh, project.slug, "light");
      const card = page.locator(".pf-info.pf-paper");
      const at = `${project.slug} @${vw}x${vh}`;
      const fit = await descFit(card);
      const shortText = entry.cardLine ?? project.tagline;
      const longText = entry.cardLineLong ?? entry.cardLine ?? project.tagline;
      if (fit.clipped > 1) problems.push(`${at}: cut off (+${fit.clipped}px)`);
      if (fit.descBottom > fit.ctaTop) problems.push(`${at}: description runs into the CTA`);
      if (fit.ctaBottom > fit.cardBottom) problems.push(`${at}: CTA leaves the card`);
      if (roomy) {
        if (fit.variant !== "long") problems.push(`${at}: expected the long wording`);
        if (fit.lines !== 3) problems.push(`${at}: long wording on ${fit.lines} lines, expected 3`);
        await expect(card.locator(".pf-info-desc:visible")).toHaveText(longText);
        // the third line costs nothing: the CTA and the poster sit exactly where the short wording leaves them
        const moved = await card.evaluate((el) => {
          const ds = [...el.querySelectorAll<HTMLElement>(".pf-info-desc")];
          const shown = ds.map((d) => d.style.display);
          const probe = () => ({ cta: el.querySelector(".pf-action-set")!.getBoundingClientRect().top, poster: el.querySelector(".pf-info-poster")!.getBoundingClientRect().height });
          const long = probe();
          ds.forEach((d) => (d.style.display = d.dataset.variant === "short" ? "-webkit-box" : "none"));
          const short = probe();
          ds.forEach((d, i) => (d.style.display = shown[i]!));
          return { cta: Math.abs(long.cta - short.cta), poster: Math.abs(long.poster - short.poster) };
        });
        if (moved.cta > 0.5) problems.push(`${at}: CTA moves ${moved.cta.toFixed(1)}px with the long wording`);
        if (moved.poster > 0.5) problems.push(`${at}: poster resizes with the long wording`);
      } else {
        if (fit.variant !== "short") problems.push(`${at}: expected the short wording`);
        const want = vw === 1440 && THREE_LINES_AT_1440.includes(project.slug) ? 3 : vw === 1440 && shortText.length > 70 ? 2 : null;
        if (want !== null && fit.lines !== want) problems.push(`${at}: short wording on ${fit.lines} lines, expected ${want}`);
        await expect(card.locator(".pf-info-desc:visible")).toHaveText(shortText);
      }
      // exactly one description reaches assistive technology: the hidden wording is display:none, not just invisible
      const aria = await card.ariaSnapshot();
      const [shown, hidden] = fit.variant === "long" ? [longText, shortText] : [shortText, longText];
      if (!aria.includes(shown)) problems.push(`${at}: the visible wording is missing from the accessibility tree`);
      if (hidden !== shown && aria.includes(hidden)) problems.push(`${at}: the hidden wording is exposed to assistive technology`);
    }
  }
  expect(problems, "see TASK-354 in app/styles/projects.css (pcard height tiers) and cardLine / cardLineLong in data/portfolio.ts").toEqual([]);
});

test("TASK-303: the phone card is unchanged (desktop-only redesign)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/projects?product=${PERSONAL[0]!.slug}`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  await expect(page.locator(".pf-paper")).toHaveCount(0);
  await expect(page.locator(".pf-pc-pills")).toHaveCount(0);
  await expect(page.locator(".oa")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
