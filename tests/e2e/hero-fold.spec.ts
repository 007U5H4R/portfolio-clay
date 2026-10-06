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

// Tushar 2026-10-05 (Design.md §11 Dev-132): his intro video sits right after the eyebrow line at every
// width, so on phones the h1, hand line and CTAs move below the first screen. The first viewport keeps the
// header name, the eyebrow title, the banner desk and the video; the rest is at most one scroll away.
test("@EVAL-001 w390: name, title, desk and the intro video sit in the first viewport; h1 + CTAs one scroll away", async ({ page }) => {
  test.skip(width(page) !== 390, "the first-viewport rule applies < 768 only (TKT-96, Dev-39)");
  await page.goto("/", { waitUntil: "load" });
  const vh = page.viewportSize()!.height;
  const elements = {
    name: page.locator("header .header-name"),
    title: page.getByText(hero.eyebrow.text, { exact: true }),
    // The banner img is inside a cover-cropped canvas that may overflow its box; the visible desk is the box.
    desk: page.locator(".hero-banner [data-paper-scene]"),
    video: page.locator(".hero-intro").getByRole("button", { name: `Play ${hero.introVideo.title}` }),
  };
  for (const [label, locator] of Object.entries(elements)) {
    await expect(locator, label).toBeVisible();
    const box = (await locator.boundingBox())!;
    expect(box.y, `${label} top inside the first viewport`).toBeGreaterThanOrEqual(0);
    // Text and the Play button must be wholly above the fold; the banner only needs to be on screen.
    const bottom = label === "desk" ? box.y : box.y + box.height;
    expect(bottom, `${label} (${Math.round(box.y)}–${Math.round(box.y + box.height)}) within ${vh}px`).toBeLessThanOrEqual(vh);
  }
  await expect(page.locator(".hero-hand-sub")).toBeVisible();
  await expect(page.locator("h1#hero-h")).toContainText("AI-native products");
  await expectCopyWithinOneScroll(page);
});

test("@EVAL-001 ≥ 768: the banner shows the whole scene and the h1 + CTAs are one scroll away", async ({ page }) => {
  test.skip(width(page) < 768, "the whole-scene rule applies ≥ 768 (TKT-96, Dev-39)");
  await page.goto("/", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("img", { name: HERO_BANNER_ALT })).toBeVisible();
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
  { route: "/", paper: ".hero-sheet", image: ".hero-banner [data-paper-scene]", animated: ".hero-banner" },
  { route: "/projects", paper: ".scene-opener-torn", image: ".scene-opener [data-paper-scene]", animated: ".scene-opener [data-paper-scene]" },
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
 * Polaroid placement (TKT-111, Dev-80 — Tushar 2026-09-26: "move polaroids to blank canvases behind"; re-registered to the
 * layered hero by M-011 P1, EXE-51). Each polaroid lies inside its blank paper's box (measured on the layered `bg`, in its
 * 2400×1029 art units) and none overlaps the character's face or the book titles. The art sits in the scene frame as
 * `object-fit: cover` boxes inset by the scene's shared bleed (30 px) centred on focal x 0.49, so an art point (u, v) lands at
 * x = −b + (W + 2b − 2400·s)·0.49 + u·s, y = −b + v·s with s = (H + 2b) / 1029 (W × H the frame). Measured at rest (scroll 0) on the
 * rendered (rotated) rects. < 768 the frame is the 4:3 crop: only papers ≥ 80 % inside it carry a polaroid, the large cream sheet
 * does not, and the postmark stays clear of the face and of every visible polaroid.
 */
test("hero polaroids sit on the banner's blank papers, clear of the face and the book titles", async ({ page }) => {
  const BLEED = 30;
  const FX = 0.49;
  const box = (x0: number, x1: number, y0: number, y1: number) => ({ x0, x1, y0, y1 });
  const papers = [
    { name: "tall cream sheet", ...box(574, 878, 42, 456) },
    { name: "yellow note", ...box(1542, 1774, 46, 254) },
    { name: "large cream sheet", ...box(1784, 2066, 72, 360) },
  ];
  const keepClear = [
    { name: "character's face", ...box(1062, 1248, 168, 480) },
    { name: "book titles", ...box(300, 636, 612, 840) },
  ];
  const tol = 6;
  const widths = width(page) === 1440 ? [1024, 1440, 1920] : width(page) === 390 ? [390, 414] : [width(page)];
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto("/", { waitUntil: "load" });
    await scrollToY(page, 0);
    const { frame, all, stamp } = await page.evaluate(() => {
      const r = (el: Element) => {
        const q = el.getBoundingClientRect();
        return { l: q.left, r: q.right, t: q.top, b: q.bottom };
      };
      return {
        frame: r(document.querySelector(".hero-banner [data-paper-scene]")!),
        stamp: r(document.querySelector(".hero-stamp")!),
        all: [...document.querySelectorAll(".hero-polaroid")].map((el) => ({ shown: getComputedStyle(el).display !== "none", ...r(el) })),
      };
    });
    const W = frame.r - frame.l;
    const H = frame.b - frame.t;
    const s = (H + 2 * BLEED) / 1029;
    const ox = -BLEED + (W + 2 * BLEED - 2400 * s) * FX;
    const px = (u: number) => frame.l + ox + u * s;
    const py = (v: number) => frame.t - BLEED + v * s;
    const inPx = (z: { x0: number; x1: number; y0: number; y1: number }) => ({ l: px(z.x0), r: px(z.x1), t: py(z.y0), b: py(z.y1) });
    expect(all, `w${w}: one polaroid per blank paper`).toHaveLength(papers.length);
    // A paper carries a visible polaroid iff ≥ 80 % of its width is inside the frame (always, ≥ 768).
    const expectedShown = papers.map((pp) => {
      const q = inPx(pp);
      return (Math.min(q.r, frame.r) - Math.max(q.l, frame.l)) / (q.r - q.l) >= 0.8;
    });
    expect(all.map((p) => p.shown), `w${w}: visible polaroids`).toEqual(expectedShown);
    if (w < 768) {
      const face = inPx(keepClear[0]!);
      const onFace = stamp.l < face.r && stamp.r > face.l && stamp.t < face.b && stamp.b > face.t;
      expect(onFace, `w${w}: the postmark stays clear of the character's face`).toBe(false);
      expect(expectedShown, `w${w}: the large cream sheet is mostly outside the 4:3 crop`).toEqual([true, true, false]);
    }
    all.forEach((p, i) => {
      if (!p.shown) return;
      const paper = inPx(papers[i]!);
      const at = `w${w}: polaroid ${i + 1} [${p.l.toFixed(0)}–${p.r.toFixed(0)} × ${p.t.toFixed(0)}–${p.b.toFixed(0)}]`;
      expect(p.l, `${at} starts inside the ${papers[i]!.name}`).toBeGreaterThanOrEqual(paper.l - tol);
      expect(p.r, `${at} ends inside the ${papers[i]!.name}`).toBeLessThanOrEqual(paper.r + tol);
      expect(p.t, `${at} tops inside the ${papers[i]!.name}`).toBeGreaterThanOrEqual(paper.t - tol);
      expect(p.b, `${at} bottoms inside the ${papers[i]!.name}`).toBeLessThanOrEqual(paper.b + tol);
      expect(p.l >= frame.l - tol && p.r <= frame.r + tol, `${at} stays inside the frame`).toBe(true);
      for (const zone of keepClear) {
        const z = inPx(zone);
        expect(p.l < z.r && p.r > z.l && p.t < z.b && p.b > z.t, `${at} overlaps the ${zone.name}`).toBe(false);
      }
      // < 768 the postmark is shrunk and moved clear of every visible polaroid (TKT-111 r3).
      if (w < 768) expect(p.l < stamp.r && p.r > stamp.l && p.t < stamp.b && p.b > stamp.t, `${at} overlaps the postmark`).toBe(false);
    });
  }
});

/**
 * TKT-108 (Tushar 2026-09-26, Design.md §11 Dev-50) · the copy block matches his reference: the h1 reads
 * the data sentence and breaks at the reference's three lines ≥ 768; the hand line, the "Ask Tushky"
 * caption and the decorative Tushky sticker render; the Caveat margin notes show ≥ 1024 only; no
 * horizontal overflow at any project width.
 */
test("TKT-108 hero copy block: three-line h1 ≥ 768, hand line, Ask Tushky caption + sticker, margin notes ≥ 1024", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const h1 = page.locator("h1#hero-h");
  await expect(h1).toHaveText(`${hero.headline.before}${hero.headline.highlight}${hero.headline.after}`.trim());
  const lines = await h1.evaluate((el) => {
    const lh = Number.parseFloat(getComputedStyle(el).lineHeight);
    return Math.round(el.getBoundingClientRect().height / lh);
  });
  if (width(page) >= 768) expect(lines, "h1 lines ≥ 768").toBe(3);
  await expect(page.locator(".hero-hand-sub")).toHaveText(hero.handLine.text);
  await expect(page.getByText("My AI portfolio assistant", { exact: true })).toBeVisible();
  const sticker = page.locator(".hero-tushky img");
  await expect(sticker).toHaveAttribute("alt", "");
  expect(await sticker.evaluate((el) => el.closest('[aria-hidden="true"]') !== null)).toBe(true);
  const notes = page.locator(".hero-margin-note");
  await expect(notes).toHaveCount(2);
  for (const note of await notes.all()) {
    if (width(page) >= 1024) await expect(note).toBeVisible();
    else await expect(note).toBeHidden();
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "no horizontal page overflow").toBeLessThanOrEqual(0);
});
