/**
 * hero-fold.spec.ts — the home hero's first-viewport rule and the paper-over-image parallax.
 *
 * TKT-92 round 2 (TASK-88) made EVAL-001's structural precondition (the six 5-second-test elements —
 * header name, eyebrow title, h1 value, the banner desk, both CTAs — plus the hand line, laid out inside
 * the first viewport, no scroll) hold at 390, 1024 and 1440 by capping the banner height. TKT-96
 * (Tushar direction 2026-09-26, Design.md §11 Dev-39) replaced that rule at ≥ 768: the banner shows the
 * whole scene (no cap, nothing cropped — the sleeping dog included) and the h1 + CTAs are reached by
 * scrolling at most one viewport. The first-viewport rule is kept only < 768 (the w390 project).
 *
 * Parallax (TKT-96): as the page scrolls, the image layer moves at half speed and the paper sheet (torn
 * edge leading) slides up over it — on `/` (`.hero-sheet` over `.hero-banner`) and on the page openers
 * (`.scene-opener-torn` over `.scene-banner`). Under `prefers-reduced-motion: reduce` no animation or
 * translate is applied: the layers scroll together.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import { hero } from "@/data/hero";
// The manifest directly (not `lib/illustrations.ts`, whose static image imports Playwright cannot load).
import { ILLUSTRATIONS } from "@/content/media/illustrations/manifest";
import { expectCopyWithinOneScroll, expectWholeScene, scrollToY } from "./hero-scene";

const HERO_BANNER_ALT = ILLUSTRATIONS.find((e) => e.id === "hero-banner")!.alt;
const width = (page: Page) => page.viewportSize()?.width ?? 0;

test("@EVAL-001 w390: the 5-second-test elements and the hand line sit in the first viewport", async ({ page }) => {
  test.skip(width(page) !== 390, "the first-viewport rule applies < 768 only (TKT-96, Dev-39)");
  await page.goto("/", { waitUntil: "load" });
  const vh = page.viewportSize()!.height;
  const elements = {
    name: page.locator("header .header-name"),
    title: page.getByText(hero.eyebrow.text, { exact: true }),
    value: page.locator("h1#hero-h"),
    hand: page.locator(".hero-hand-sub"),
    // The banner img is inside a cover-cropped canvas that may overflow its box; the visible desk is the box.
    desk: page.locator(".hero-banner figure.scene-banner").filter({ has: page.getByAltText(HERO_BANNER_ALT) }),
    work: page.getByRole("link", { name: "View my work →" }),
    ask: page.locator(".hero-cta-row").getByRole("link", { name: "Ask my portfolio" }),
  };
  for (const [label, locator] of Object.entries(elements)) {
    await expect(locator, label).toBeVisible();
    const box = (await locator.boundingBox())!;
    expect(box.y, `${label} top inside the first viewport`).toBeGreaterThanOrEqual(0);
    // Text and CTAs must be wholly above the fold; the banner only needs to be on screen.
    const bottom = label === "desk" ? box.y : box.y + box.height;
    expect(bottom, `${label} (${Math.round(box.y)}–${Math.round(box.y + box.height)}) within ${vh}px`).toBeLessThanOrEqual(vh);
  }
  await expect(elements.value).toContainText("AI-native products");
});

test("@EVAL-001 ≥ 768: the banner shows the whole scene and the h1 + CTAs are one scroll away", async ({ page }) => {
  test.skip(width(page) < 768, "the whole-scene rule applies ≥ 768 (TKT-96, Dev-39)");
  await page.goto("/", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByAltText(HERO_BANNER_ALT)).toBeVisible();
  await expectWholeScene(page);
  // A 1920 desktop too (the projects stop at 1440): the box has no max-height cap any more.
  if (width(page) === 1440) {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expectWholeScene(page);
    await page.setViewportSize({ width: 1440, height: 900 });
  }
  await expectCopyWithinOneScroll(page);
});

/** Top of the paper edge minus top of the image layer, in viewport px (shrinks when paper rides over image). */
async function paperOverImage(page: Page, paperSel: string, imageSel: string): Promise<number> {
  return page.evaluate(
    ({ paperSel, imageSel }) => document.querySelector(paperSel)!.getBoundingClientRect().top - document.querySelector(imageSel)!.getBoundingClientRect().top,
    { paperSel, imageSel },
  );
}

const LAYERS = [
  { route: "/", paper: ".hero-sheet", image: ".hero-banner .scene-banner", animated: ".hero-banner" },
  { route: "/work", paper: ".scene-opener-torn", image: ".scene-opener .scene-banner", animated: ".scene-opener .scene-banner" },
] as const;

for (const { route, paper, image, animated } of LAYERS) {
  test(`TKT-96 parallax on ${route}: after 200 px of scroll the paper has moved up over the image`, async ({ page }) => {
    test.skip(width(page) !== 1440, "parallax measured at w1440");
    await page.goto(route, { waitUntil: "load" });
    await scrollToY(page, 0);
    const before = await paperOverImage(page, paper, image);
    await scrollToY(page, 200);
    const after = await paperOverImage(page, paper, image);
    test.info().annotations.push({ type: "tkt-96", description: `${route}: paper−image ${before.toFixed(1)} → ${after.toFixed(1)} px after 200 px` });
    // Image at half speed: the paper gains ≈ 100 px on it (not 0, as with plain scroll).
    expect(before - after, `paper rides ${(before - after).toFixed(1)} px over the image`).toBeGreaterThanOrEqual(80);
    expect(before - after).toBeLessThanOrEqual(120);
    expect(await page.locator(animated).evaluate((el) => getComputedStyle(el).animationName)).toBe("scene-parallax");
  });

  test(`TKT-96 reduced motion on ${route}: no parallax animation or translate — plain scroll`, async ({ page, withReducedMotion }) => {
    test.skip(width(page) !== 1440, "parallax measured at w1440");
    await withReducedMotion(page);
    await page.goto(route, { waitUntil: "load" });
    const style = await page.locator(animated).evaluate((el) => {
      const cs = getComputedStyle(el);
      return { animation: cs.animationName, translate: cs.translate, transform: cs.transform, position: cs.position, running: el.getAnimations().length };
    });
    expect(style).toEqual({ animation: "none", translate: "none", transform: "none", position: "relative", running: 0 });
    await scrollToY(page, 0);
    const before = await paperOverImage(page, paper, image);
    await scrollToY(page, 200);
    const after = await paperOverImage(page, paper, image);
    expect(Math.abs(before - after), "the layers scroll together").toBeLessThanOrEqual(1);
  });
}

/**
 * TKT-92r3 (TASK-88) · font-swap CLS scar. Lighthouse desktop `/` CLS was 0.054 (gate 0.05) because the
 * h1 wrapped to 3 lines under next/font's `Fraunces Fallback` and 2 under Fraunces (and the eyebrow to
 * 3 vs 2 lines at 412). The eyebrow's and h1's boxes must be the same whether the woff2 files never
 * arrive (the fallback frame) or have loaded (the swapped frame) — every project width. The loaded run
 * also proves the h1 still renders in Fraunces, guarding the literal family name in the TKT-92r3 CSS.
 */
test("TKT-92r3 hero eyebrow + h1 keep their boxes across the font swap", async ({ browser, page }) => {
  const viewport = page.viewportSize()!;
  const boxes = async (blockFonts: boolean) => {
    const { baseURL, isMobile, hasTouch, deviceScaleFactor, userAgent } = test.info().project.use;
    const device = Object.fromEntries(
      Object.entries({ baseURL, isMobile, hasTouch, deviceScaleFactor, userAgent }).filter(([, v]) => v !== undefined),
    );
    const context = await browser.newContext({ ...device, viewport });
    const p = await context.newPage();
    if (blockFonts) await p.route(/\.woff2(\?|$)/, (route) => route.abort());
    await p.goto("/", { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    const out = await p.evaluate(() => {
      const box = (sel: string) => {
        const r = document.querySelector(sel)!.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      };
      const h1 = document.querySelector("#hero-h")!;
      const size = getComputedStyle(h1).fontSize;
      return { eyebrow: box(".hero-eyebrow"), h1: box("#hero-h"), fraunces: document.fonts.check(`500 ${size} Fraunces`) };
    });
    await context.close();
    return out;
  };
  const fallback = await boxes(true);
  const loaded = await boxes(false);
  expect(loaded.fraunces, "loaded h1 font is Fraunces").toBe(true);
  for (const key of ["eyebrow", "h1"] as const) {
    for (const dim of ["x", "y", "w", "h"] as const) {
      expect(Math.abs(fallback[key][dim] - loaded[key][dim]), `${key}.${dim} fallback ${fallback[key][dim]} vs loaded ${loaded[key][dim]}`).toBeLessThanOrEqual(1);
    }
  }
});

/**
 * Polaroid placement (TKT-111, Dev-80 — Tushar 2026-09-26: "move polaroids to blank canvases behind").
 * Replaces the TKT-98 corkboard guard: the corkboard is clean since TKT-105, so the rule is now that each
 * polaroid lies inside its blank paper's box (measured on hero-banner.webp, in 3168×1344 canvas px, ± a
 * small margin for the tilt), and none overlaps the character's face or the book titles. Measured at
 * rest (scroll 0) on the rendered (rotated) rects, as fractions of the banner canvas (`.scene-banner-canvas`
 * — the box itself ≥ 768, the 4:3 crop's full-scene canvas < 768). < 768 (Tushar 2026-09-26: "yes show
 * polaroids there too") only the papers ≥ 80 % inside the crop carry one: the large cream sheet is ≈ 18 %
 * inside, so its polaroid must be hidden, and every visible polaroid must also lie inside the crop box.
 */
test("hero polaroids sit on the banner's blank papers, clear of the face and the book titles", async ({ page }) => {
  const W = 3168;
  const H = 1344;
  const box = (x0: number, x1: number, y0: number, y1: number) => ({ l: x0 / W, r: x1 / W, t: y0 / H, b: y1 / H });
  const papers = [
    { name: "tall cream sheet", ...box(765, 1165, 60, 665) },
    { name: "yellow note", ...box(2058, 2368, 58, 335) },
    { name: "large cream sheet", ...box(2382, 2745, 100, 495) },
  ];
  const keepClear = [
    { name: "character's face", ...box(1400, 1730, 170, 610) },
    { name: "book titles", ...box(430, 910, 940, 1260) },
  ];
  const tol = { x: 4 / W, y: 8 / H };
  const widths = width(page) === 1440 ? [1024, 1440, 1920] : width(page) === 390 ? [390, 414] : [width(page)];
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto("/", { waitUntil: "load" });
    await scrollToY(page, 0);
    const { all, crop } = await page.evaluate(() => {
      const canvas = document.querySelector(".hero-banner .scene-banner-canvas")!.getBoundingClientRect();
      const box = document.querySelector(".hero-banner .scene-banner")!.getBoundingClientRect();
      const frac = (r: DOMRect) => ({
        l: (r.left - canvas.left) / canvas.width,
        r: (r.right - canvas.left) / canvas.width,
        t: (r.top - canvas.top) / canvas.height,
        b: (r.bottom - canvas.top) / canvas.height,
      });
      return {
        crop: frac(box),
        all: [...document.querySelectorAll(".hero-polaroid")].map((el) => ({
          shown: getComputedStyle(el).display !== "none",
          ...frac(el.getBoundingClientRect()),
        })),
      };
    });
    expect(all, `w${w}: one polaroid per blank paper`).toHaveLength(papers.length);
    // A paper carries a visible polaroid iff ≥ 80 % of its width is inside the crop (always, ≥ 768).
    const expectedShown = papers.map((pp) => (Math.min(pp.r, crop.r) - Math.max(pp.l, crop.l)) / (pp.r - pp.l) >= 0.8);
    expect(all.map((p) => p.shown), `w${w}: visible polaroids (crop ${(crop.l * 100).toFixed(1)}–${(crop.r * 100).toFixed(1)} %)`).toEqual(expectedShown);
    if (w < 768) expect(expectedShown, `w${w}: the large cream sheet is mostly outside the 4:3 crop`).toEqual([true, true, false]);
    all.forEach((p, i) => {
      if (!p.shown) return;
      const paper = papers[i]!;
      const at = `w${w}: polaroid ${i + 1} [${(p.l * 100).toFixed(1)}–${(p.r * 100).toFixed(1)} % × ${(p.t * 100).toFixed(1)}–${(p.b * 100).toFixed(1)} %]`;
      expect(p.l, `${at} starts inside the ${paper.name}`).toBeGreaterThanOrEqual(paper.l - tol.x);
      expect(p.r, `${at} ends inside the ${paper.name}`).toBeLessThanOrEqual(paper.r + tol.x);
      expect(p.t, `${at} tops inside the ${paper.name}`).toBeGreaterThanOrEqual(paper.t - tol.y);
      expect(p.b, `${at} bottoms inside the ${paper.name}`).toBeLessThanOrEqual(paper.b + tol.y);
      expect(p.l >= crop.l - tol.x && p.r <= crop.r + tol.x, `${at} stays inside the crop`).toBe(true);
      for (const zone of keepClear) {
        const overlaps = p.l < zone.r && p.r > zone.l && p.t < zone.b && p.b > zone.t;
        expect(overlaps, `${at} overlaps the ${zone.name}`).toBe(false);
      }
    });
  }
});
