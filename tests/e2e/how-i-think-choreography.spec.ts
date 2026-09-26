/**
 * how-i-think-choreography.spec.ts (TKT-110 · Tushar's spec 2026-09-26; `@EVAL-010 @EVAL-008
 * @EVAL-006`) — the home "How I think" paper-unrolling sequence on the real production build.
 *
 * A MutationObserver installed before any page script records every `data-journey-state`,
 * `data-roll` and `data-draw` change with `performance.now()`, so the order / timing assertions
 * read what actually happened in the page rather than the implementation's own bookkeeping.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

type Entry = { t: number; attr: string; value: string | null; stage: string | null; segment: string | null };

declare global {
  interface Window {
    __jrLog?: Entry[];
  }
}

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const board = (page: Page) => page.locator("section#how-i-think [data-journey]");
const stages = (page: Page) => board(page).locator("[data-journey-stage]");

async function recordJourney(page: Page) {
  await page.addInitScript(() => {
    window.__jrLog = [];
    new MutationObserver((muts) => {
      for (const m of muts) {
        const el = m.target as Element;
        window.__jrLog!.push({
          t: performance.now(),
          attr: m.attributeName!,
          value: el.getAttribute(m.attributeName!),
          stage: el.getAttribute("data-journey-stage"),
          segment: el.getAttribute("data-journey-segment"),
        });
      }
    }).observe(document, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-journey-state", "data-roll", "data-draw"],
    });
  });
}

const log = (page: Page) => page.evaluate(() => window.__jrLog ?? []);
const first = (entries: Entry[], pred: (e: Entry) => boolean) => entries.find(pred)?.t ?? NaN;

/** Load `/` with the board below the fold and wait until the pre-state is armed. */
async function openArmed(page: Page) {
  await page.goto("/", { waitUntil: "load" });
  await expect(board(page)).toHaveAttribute("data-journey-state", "idle");
  await expect(board(page)).toHaveAttribute("data-journey-armed", "");
}

async function playToEnd(page: Page) {
  await board(page).scrollIntoViewIfNeeded();
  await expect(board(page)).toHaveAttribute("data-journey-state", "complete", { timeout: 15_000 });
}

test.describe("How I think choreography (TKT-110)", () => {
  test("@EVAL-010 six cards unroll strictly one after another, each path segment drawn before/with its card, 6.5–8.5 s", {
    tag: "@EVAL-010",
  }, async ({ page }) => {
    test.skip(width(page) !== 1440, "desktop timeline measured at w1440");
    await recordJourney(page);
    await openArmed(page);

    // Pre-state: every card rolled, content still in the accessibility tree.
    await expect(stages(page)).toHaveCount(6);
    for (let i = 0; i < 6; i++) await expect(stages(page).nth(i)).toHaveAttribute("data-roll", "rolled");
    await expect(board(page).getByRole("heading", { level: 3 })).toHaveCount(6);

    await playToEnd(page);
    const entries = await log(page);
    const roll = (i: number, v: string) => first(entries, (e) => e.attr === "data-roll" && e.stage === String(i) && e.value === v);
    const draw = (i: number) => first(entries, (e) => e.attr === "data-draw" && e.segment === String(i) && e.value === "drawing");
    const state = (v: string) => first(entries, (e) => e.attr === "data-journey-state" && e.value === v);

    for (let i = 0; i < 6; i++) {
      expect(roll(i, "rolling"), `card ${i + 1} rolled`).not.toBeNaN();
      expect(roll(i, "settled"), `card ${i + 1} settled`).toBeGreaterThan(roll(i, "rolling"));
      if (i > 0) expect(roll(i, "rolling"), `card ${i + 1} waits for card ${i} to settle`).toBeGreaterThanOrEqual(roll(i - 1, "settled"));
      // the segment into this card starts drawing before the card unrolls, after the previous one settled
      expect(draw(i), `segment ${i} draws before card ${i + 1}`).toBeLessThan(roll(i, "rolling"));
      if (i > 0) expect(draw(i)).toBeGreaterThanOrEqual(roll(i - 1, "settled"));
    }
    expect(draw(6), "the tail segment draws after Impact").toBeGreaterThan(roll(5, "rolling"));

    const total = state("complete") - state("backgroundReveal");
    expect(total).toBeGreaterThanOrEqual(6500);
    expect(total).toBeLessThanOrEqual(8500);

    // Final composition: no clip, no transform leftovers, content opaque.
    const final = await stages(page).evaluateAll((els) =>
      els.map((el) => {
        const cs = getComputedStyle(el);
        const pill = el.querySelector("a[href]")!;
        return { clip: cs.clipPath, transform: cs.transform, opacity: cs.opacity, pill: getComputedStyle(pill).opacity };
      }),
    );
    for (const f of final) expect(f).toEqual({ clip: "none", transform: "none", opacity: "1", pill: "1" });
  });

  test("the journey path sits above the cards; the radial reveal grows from the board's centre", async ({ page }) => {
    test.skip(width(page) !== 1440, "path exists ≥ 1025; checked at w1440");
    await openArmed(page);
    const z = await board(page).evaluate((root) => {
      const zi = (sel: string) => Number(getComputedStyle(root.querySelector(sel)!).zIndex);
      return { path: zi('svg[data-sketch="journey"]'), cards: zi("ol"), radial: zi("[data-journey-radial]") };
    });
    expect(z.path).toBeGreaterThan(z.cards);
    expect(z.cards).toBeGreaterThan(z.radial);

    // Idle: the backdrop is a zero-radius circle at 50% 50% of a box that IS the board's box.
    const idle = await board(page).evaluate((root) => {
      const radial = root.querySelector<HTMLElement>("[data-journey-radial]")!;
      const a = root.getBoundingClientRect();
      const b = radial.getBoundingClientRect();
      return { clip: getComputedStyle(radial).clipPath, dx: a.x + a.width / 2 - (b.x + b.width / 2), dy: a.y + a.height / 2 - (b.y + b.height / 2) };
    });
    expect(idle.clip).toMatch(/^circle\(0(px|%) at 50% 50%\)$/);
    expect(Math.abs(idle.dx)).toBeLessThanOrEqual(1);
    expect(Math.abs(idle.dy)).toBeLessThanOrEqual(1);

    // Mid-reveal: a non-zero circle, still centred.
    await board(page).scrollIntoViewIfNeeded();
    await expect(board(page)).not.toHaveAttribute("data-journey-state", "idle");
    await page.waitForTimeout(400);
    const mid = await board(page).locator("[data-journey-radial]").evaluate((el) => getComputedStyle(el).clipPath);
    expect(mid).toMatch(/^circle\([\d.]+(px|%) at 50% 50%\)$/);
    expect(mid).not.toMatch(/^circle\(0(px|%)/);

    // The path segments exist (lead-in + 5 joins + tail) and end fully drawn.
    await expect(board(page).locator("[data-journey-segment]")).toHaveCount(7);
    await expect(board(page)).toHaveAttribute("data-journey-state", "complete", { timeout: 15_000 });
    const offsets = await board(page)
      .locator("[data-journey-segment]")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).strokeDashoffset));
    expect(offsets.every((o) => parseFloat(o) === 0)).toBe(true);
  });

  test("runs once: scrolling away and back never replays; the page scrolls freely during the sequence", async ({ page }) => {
    test.skip(width(page) !== 1440, "checked at w1440");
    await recordJourney(page);
    await openArmed(page);
    await board(page).scrollIntoViewIfNeeded();
    await expect(board(page)).toHaveAttribute("data-journey-state", /Reveal$|^pathTo/);

    // No scroll lock mid-sequence.
    const locked = await page.evaluate(() =>
      [document.documentElement, document.body].some((el) => ["hidden", "clip"].includes(getComputedStyle(el).overflowY)),
    );
    expect(locked).toBe(false);
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 100);
    await expect(board(page)).toHaveAttribute("data-journey-state", "complete", { timeout: 15_000 });

    const rollsBefore = (await log(page)).filter((e) => e.attr === "data-roll").length;
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await board(page).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await expect(board(page)).toHaveAttribute("data-journey-state", "complete");
    expect((await log(page)).filter((e) => e.attr === "data-roll").length).toBe(rollsBefore);
    await expect(board(page)).not.toHaveAttribute("data-journey-armed", "");
  });

  test("@EVAL-010 reduced motion: everything final at once — no pre-state, no animation", {
    tag: "@EVAL-010",
  }, async ({ page, withReducedMotion }) => {
    test.skip(width(page) !== 1440 && width(page) !== 390, "checked at w390 and w1440");
    await withReducedMotion(page);
    await page.goto("/", { waitUntil: "load" });
    await expect(board(page)).toHaveAttribute("data-journey-state", "complete");
    await expect(board(page)).not.toHaveAttribute("data-journey-armed", "");
    const state = await board(page).evaluate((root) => ({
      radial: getComputedStyle(root.querySelector("[data-journey-radial]")!).clipPath,
      cards: Array.from(root.querySelectorAll("[data-journey-stage]")).map((el) => ({
        clip: getComputedStyle(el).clipPath,
        anim: getComputedStyle(el).animationName,
        content: getComputedStyle(el.querySelector("h3")!).opacity,
      })),
    }));
    expect(state.radial).toBe("none");
    for (const c of state.cards) expect(c).toEqual({ clip: "none", anim: "none", content: "1" });
  });

  test("keyboard focus reaching a card before its turn shows the whole board at once", async ({ page }) => {
    test.skip(width(page) !== 1440 && width(page) !== 390, "checked at w390 and w1440");
    await openArmed(page);
    const pill = stages(page).nth(3).locator("a[href]");
    await pill.focus();
    await expect(board(page)).toHaveAttribute("data-journey-state", "complete");
    await expect(stages(page).nth(3)).toHaveCSS("clip-path", "none");
    await expect(stages(page).nth(3)).toHaveCSS("opacity", "1");
    await expect(pill).toHaveCSS("opacity", "1");
    await expect(pill).toBeFocused();
  });

  test("@EVAL-008 no horizontal overflow before, during and after the sequence", {
    tag: "@EVAL-008",
  }, async ({ page, noOverflow }) => {
    test.skip(![390, 768, 1440].includes(width(page)), "checked at w390, w768 and w1440");
    await openArmed(page);
    await noOverflow(page);
    await board(page).scrollIntoViewIfNeeded();
    await expect(board(page)).not.toHaveAttribute("data-journey-state", "idle");
    await noOverflow(page);
    // Narrow widths reveal card by card as each is reached: walk the column.
    const n = await stages(page).count();
    for (let i = 0; i < n; i++) await stages(page).nth(i).scrollIntoViewIfNeeded();
    await expect(board(page)).toHaveAttribute("data-journey-state", "complete", { timeout: 20_000 });
    await noOverflow(page);
  });

  test("narrow widths: cards still unroll in order as the reader reaches them", async ({ page }) => {
    test.skip(width(page) !== 390, "stacked column checked at w390");
    await recordJourney(page);
    await openArmed(page);
    // Only the first cards are reached: later ones wait, rolled.
    await stages(page).first().scrollIntoViewIfNeeded();
    await expect(stages(page).first()).toHaveAttribute("data-roll", "settled", { timeout: 5_000 });
    await expect(stages(page).last()).toHaveAttribute("data-roll", "rolled");
    for (let i = 1; i < 6; i++) await stages(page).nth(i).scrollIntoViewIfNeeded();
    await expect(board(page)).toHaveAttribute("data-journey-state", "complete", { timeout: 15_000 });
    const entries = await log(page);
    const order = entries.filter((e) => e.attr === "data-roll" && e.value === "rolling").map((e) => e.stage);
    expect(order).toEqual(["0", "1", "2", "3", "4", "5"]);
  });
});
