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
