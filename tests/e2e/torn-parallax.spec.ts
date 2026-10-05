/**
 * torn-parallax.spec.ts — TKT-106 (TASK-103, Tushar 2026-09-26: "for all paper cutout create a parallax
 * effect in scrolling"). At every torn section boundary the section below (its first child is the
 * `TornEdge`, `[data-decor="torn"]`) slides up over the section above, torn edge leading, while the
 * content above drifts at 0.5× page speed up to a 200 px overlap (CSS scroll-driven `torn-lag`,
 * app/globals.css TKT-106 block; Design.md §11 Dev-96).
 *
 * Measured as "paper over paper": the distance from the lagging element's bottom to the tear's top is
 * constant under plain scroll; with the effect it shrinks as the tear travels up the viewport. Under
 * `prefers-reduced-motion: reduce` nothing animates or translates.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import { scrollToY } from "./hero-scene";

const width = (page: Page) => page.viewportSize()?.width ?? 0;

/** The lagging element for a torn sheet: its previous sibling, or `main`'s last child for the band footer. */
const CASES = [
  { route: "/", sheet: "#work-featured", label: "home Featured Work tear" },
  { route: "/about", sheet: "footer.band", label: "/about band footer tear" },
  // TASK-113: the rebuilt /contact section is `main`'s last child — it lags under the band's tear.
  { route: "/contact", sheet: "footer.band", label: "/contact band footer tear" },
] as const;

type Geometry = { gap: number; tearTop: number; lagAnimation: string; lagTranslate: string; sheetDocTop: number };

async function geometry(page: Page, sheetSel: string): Promise<Geometry> {
  return page.evaluate((sel) => {
    const sheet = document.querySelector<HTMLElement>(sel)!;
    const tear = sheet.querySelector<SVGElement>(':scope > [data-decor="torn"]:first-child')!;
    const prev = sheet.previousElementSibling!;
    const lag = prev.tagName === "MAIN" ? prev.lastElementChild! : prev;
    const tearTop = tear.getBoundingClientRect().top;
    const cs = getComputedStyle(lag);
    return {
      gap: tearTop - lag.getBoundingClientRect().bottom,
      tearTop,
      lagAnimation: cs.animationName,
      lagTranslate: cs.translate,
      sheetDocTop: tearTop + window.scrollY,
    };
  }, sheetSel);
}

for (const { route, sheet, label } of CASES) {
  test(`TKT-106 paper over paper: ${label} — the section above lags as the tear rises`, async ({ page }) => {
    test.skip(width(page) !== 1440, "measured at w1440");
    await page.goto(route, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const vh = page.viewportSize()!.height;
    const { sheetDocTop } = await geometry(page, sheet);

    // Tear just below the viewport: the lag has not started (plain-scroll baseline).
    await scrollToY(page, sheetDocTop - vh - 60);
    const before = await geometry(page, sheet);
    // Tear mid-viewport.
    await scrollToY(page, sheetDocTop - vh / 2);
    const after = await geometry(page, sheet);
    test.info().annotations.push({
      type: "tkt-106",
      description: `${label}: gap ${before.gap.toFixed(1)} → ${after.gap.toFixed(1)} px (tear at ${after.tearTop.toFixed(0)} px)`,
    });

    expect(after.tearTop, "tear is mid-viewport").toBeGreaterThan(vh * 0.3);
    expect(after.tearTop).toBeLessThan(vh * 0.7);
    expect(after.lagAnimation).toBe("torn-lag");
    expect(before.gap - after.gap, "the sheet has slid up over the lagging section").toBeGreaterThanOrEqual(20);
    // A slow drift capped at the 200 px overlap (Tushar 2026-09-26, Design.md §11 Dev-96).
    expect(before.gap - after.gap).toBeLessThanOrEqual(205);
  });

  test(`TKT-106 reduced motion: ${label} — no animation or translate, plain scroll`, async ({ page, withReducedMotion }) => {
    test.skip(width(page) !== 1440, "measured at w1440");
    await withReducedMotion(page);
    await page.goto(route, { waitUntil: "load" });
    const vh = page.viewportSize()!.height;
    const { sheetDocTop } = await geometry(page, sheet);
    await scrollToY(page, sheetDocTop - vh - 60);
    const before = await geometry(page, sheet);
    await scrollToY(page, sheetDocTop - vh / 2);
    const after = await geometry(page, sheet);
    expect(after.lagAnimation).toBe("none");
    expect(after.lagTranslate).toBe("none");
    expect(Math.abs(before.gap - after.gap), "the sections scroll together").toBeLessThanOrEqual(1);
    const animated = await page.evaluate(
      () => [...document.querySelectorAll("*")].filter((el) => getComputedStyle(el).animationName.includes("torn-lag")).length,
    );
    expect(animated).toBe(0);
  });
}

// Scar: the generic "previous sibling of a torn section" rule once matched `<main>` itself (the band
// footer's previous sibling), translating the whole page body — a doubled band overlap and a 0.9 px
// shift of in-page anchor landings (lenis.spec `#ask`). Only `main`'s last child may lag.
test("TKT-106 main itself never lags; only its last child does", async ({ page }) => {
  test.skip(width(page) !== 1440, "measured at w1440");
  for (const route of ["/", "/about"]) {
    await page.goto(route, { waitUntil: "load" });
    const names = await page.evaluate(() => ({
      main: getComputedStyle(document.querySelector("main")!).animationName,
      last: getComputedStyle(document.querySelector("main")!.lastElementChild!).animationName,
    }));
    expect(names, route).toEqual({ main: "none", last: "torn-lag" });
  }
});

// Tushar 2026-10-05: the intro video now closes the hero, so the control nearest the Featured Work sheet
// is its Play button. The CTA row sits ≈ 700 px above the tear, out of the 200 px slide-over zone.
test("TKT-106 a keyboard-focused hero control (the intro video's Play) is never hidden under the Featured Work sheet", async ({ page }) => {
  test.skip(width(page) !== 1440, "measured at w1440");
  await page.goto("/", { waitUntil: "load" });
  const vh = page.viewportSize()!.height;
  const play = page.locator(".hero-intro").getByRole("button", { name: /^Play / });
  // At the top of the page the tear is far below the viewport, so the hero is unlagged.
  const playDocY = await play.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.top + r.height / 2 + window.scrollY;
  });
  await page.keyboard.press("Tab"); // keyboard modality, so the programmatic focus below is :focus-visible
  // The Play button's resting centre at 30 % of the viewport: the tear has risen into view, the hero lags.
  await scrollToY(page, playDocY - vh * 0.3);
  const lagY = await page.locator(".hero").evaluate((el) => parseFloat(getComputedStyle(el).translate.split(" ")[1] ?? "0"));
  expect(lagY, "the hero is lagging at this scroll").toBeGreaterThan(0);
  await play.evaluate((el) => (el as HTMLElement).focus({ preventScroll: true }));
  await expect(play).toBeFocused();
  await expect.poll(() => page.locator(".hero").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  const topmostIsPlay = await play.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!hit && el.contains(hit);
  });
  expect(topmostIsPlay, "the focused Play button is the topmost element at its centre").toBe(true);
});

for (const route of ["/", "/about"]) {
  test(`TKT-106 no horizontal overflow on ${route} while the torn parallax runs`, async ({ page }) => {
    test.skip(width(page) !== 390 && width(page) !== 1440, "checked at 390 and 1440");
    await page.goto(route, { waitUntil: "load" });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const vh = page.viewportSize()!.height;
    for (let y = 0; y < height; y += Math.round(vh / 2)) {
      await scrollToY(page, y);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `no horizontal overflow at scrollY ${y}`).toBeLessThanOrEqual(0);
    }
  });
}
