/**
 * how-i-think.spec.ts (TKT-76 · TC-148; Design.md §7.1, §3.3, §3.4; `@EVAL-003 @EVAL-007 @EVAL-010
 * @EVAL-011 @EVAL-013 @EVAL-018`) — the home "How I think" section as six static pinned stage cards
 * over the journey-curve sketch. Rewritten for M-009: the M-008 expand / arrow-key disclosure tests
 * are gone with the behaviour (the quote is always visible; the link pills are the only controls).
 *
 *   @EVAL-013 — six stages in order, each with its sourced quote + cite visible without interaction.
 *   @EVAL-011 — every pill is a live link that resolves 200 to a case-study chapter anchor.
 *   @EVAL-018 — section count 2 (torn + journey sketch) at w1440, 1 at w390 (sketch not in the DOM);
 *               every Caveat element in the section carries a `data-hand` exemption.
 *   @EVAL-007 — keyboard: Tab from the heading lands only on the six pills, in order, then leaves.
 *   @EVAL-010 — cards reveal with a 70 ms stagger; reduced motion makes the reveal instant.
 *   @EVAL-003 — layout: 6 columns at 1440, 1 column at 390; no overflow; axe clean.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const width = (page: Page) => page.viewportSize()?.width ?? 0;

const STAGES = ["Problem", "Insight", "Bet", "Build", "Evaluate", "Impact"] as const;

const section = (page: Page) => page.locator("section#how-i-think");
const cards = (page: Page) => section(page).locator('article[data-paper="card"]');
const pills = (page: Page) => section(page).locator("a[href]");

/** Scroll each stage into view so every `Reveal` fires (cards stack tall at 390). */
async function revealAll(page: Page) {
  const reveals = section(page).locator(".reveal");
  await expect(reveals).toHaveCount(6);
  for (let i = 0; i < 6; i++) {
    await reveals.nth(i).scrollIntoViewIfNeeded();
    await expect(reveals.nth(i)).toHaveAttribute("data-revealed", "");
  }
  // Let the 500 ms fade (+ up to 350 ms stagger) settle, so axe never measures a half-blended colour.
  await expect
    .poll(() => reveals.evaluateAll((els) => els.every((el) => getComputedStyle(el).opacity === "1")))
    .toBe(true);
}

test("@EVAL-013 six stage cards in order, each quote and cite visible without interaction", {
  tag: "@EVAL-013",
}, async ({ page }) => {
  test.skip(width(page) !== 1440 && width(page) !== 390, "content checked at w390 and w1440");
  await page.goto("/", { waitUntil: "load" });
  await revealAll(page);

  await expect(cards(page)).toHaveCount(6);
  for (let i = 0; i < STAGES.length; i++) {
    const card = cards(page).nth(i);
    await expect(card.locator("h3")).toHaveText(STAGES[i]!);
    await expect(card.locator('[data-hand="label"]')).toHaveText(String(i + 1).padStart(2, "0"));
    await expect(card.locator('blockquote[data-hand="quote"]')).toBeVisible();
    await expect(card.locator("cite")).toBeVisible();
    await expect(card.locator('[data-paper="tag"]')).toHaveCount(1);
  }
  await expect(section(page).locator("button, [aria-expanded]")).toHaveCount(0);
});

test("@EVAL-011 every pill links to a case-study chapter anchor that resolves 200", {
  tag: "@EVAL-011",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "link resolution checked once at w1440");
  await page.goto("/", { waitUntil: "load" });

  await expect(pills(page)).toHaveCount(6);
  for (let i = 0; i < 6; i++) {
    const pill = pills(page).nth(i);
    await expect(pill).toContainText("See how I tested this in ");
    const href = await pill.getAttribute("href");
    expect(href, "pill must link to a /work/<slug>#NN-chapter anchor").toMatch(/^\/work\/[a-z0-9-]+#\d{2}-[a-z-]+$/);
    const res = await page.request.get(href!);
    expect(res.status(), `${href} must resolve 200`).toBe(200);
  }
});

test("@EVAL-018 decoration count 2 at w1440 / 1 at w390; Caveat only under data-hand", {
  tag: "@EVAL-018",
}, async ({ page }) => {
  test.skip(width(page) !== 1440 && width(page) !== 390, "EVAL-018 measures w390 and w1440");
  await page.goto("/", { waitUntil: "load" });
  await revealAll(page);

  const decor = section(page).locator("[data-decor]");
  if (width(page) === 1440) {
    // MediaGate mounts the sketch after hydration (TP14).
    await expect(section(page).locator('svg[data-decor="sketch"][data-sketch="journey"]')).toHaveCount(1);
    await expect(decor).toHaveCount(2);
  } else {
    await expect(section(page).locator('[data-decor="torn"]')).toHaveCount(1);
    await expect(decor).toHaveCount(1);
    await expect(section(page).locator("svg.sketch")).toHaveCount(0);
  }

  const offenders = await section(page).evaluate((root) => {
    const bad: string[] = [];
    for (const el of Array.from(root.querySelectorAll<HTMLElement>("*"))) {
      if (!/caveat/i.test(getComputedStyle(el).fontFamily)) continue;
      if (el.closest("[data-hand], [data-decor], [aria-hidden='true']")) continue;
      if (!el.textContent?.trim()) continue;
      bad.push(`${el.tagName.toLowerCase()}.${el.className}`);
    }
    return bad;
  });
  expect(offenders, "every Caveat element must sit under a data-hand exemption").toEqual([]);
});

test("@EVAL-007 keyboard: Tab from the heading lands only on the six pills, then leaves the section", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "keyboard path run once at w1440");
  await page.goto("/", { waitUntil: "load" });
  await revealAll(page);

  // Clicking the heading sets the sequential-focus starting point inside the section.
  await page.locator("#how-i-think-heading").click();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    const href = await pills(page).nth(i).getAttribute("href");
    await expect(page.locator(":focus")).toHaveAttribute("href", href!);
    const inCard = await page.evaluate(() => Boolean(document.activeElement?.closest('#how-i-think [data-paper="card"]')));
    expect(inCard, `Tab ${i + 1} must land on a stage-card pill`).toBe(true);
  }
  await page.keyboard.press("Tab");
  const stillInside = await page.evaluate(() => Boolean(document.activeElement?.closest("#how-i-think")));
  expect(stillInside, "the seventh Tab leaves the section (no other focus stops)").toBe(false);
});

test("@EVAL-010 cards reveal on a 70 ms stagger; reduced motion is instant", {
  tag: "@EVAL-010",
}, async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 1440, "motion checked at w1440");
  await page.goto("/", { waitUntil: "load" });
  const delays = await section(page)
    .locator(".reveal")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).transitionDelay.split(",")[0]!.trim()));
  expect(delays).toEqual(["0s", "0.07s", "0.14s", "0.21s", "0.28s", "0.35s"]);

  await withReducedMotion(page);
  await page.reload({ waitUntil: "load" });
  const timing = await section(page)
    .locator(".reveal")
    .evaluateAll((els) =>
      els.map((el) => {
        const cs = getComputedStyle(el);
        return { property: cs.transitionProperty, delay: cs.transitionDelay, duration: cs.transitionDuration };
      }),
    );
  for (const t of timing) {
    expect(t.property).toBe("opacity");
    expect(t.delay).toBe("0s");
    expect(parseFloat(t.duration)).toBeLessThanOrEqual(0.001);
  }
});

test("@EVAL-003 columns: 6 at w1440, 1 at w390; no overflow; axe clean", {
  tag: "@EVAL-003",
}, async ({ page, noOverflow, axe }) => {
  test.skip(width(page) !== 1440 && width(page) !== 390, "layout checked at w390 and w1440");
  await page.goto("/", { waitUntil: "load" });
  await revealAll(page);

  const lefts = await cards(page).evaluateAll((els) =>
    Array.from(new Set(els.map((el) => Math.round(el.closest("li")!.getBoundingClientRect().left)))),
  );
  expect(lefts).toHaveLength(width(page) === 1440 ? 6 : 1);

  await noOverflow(page);
  await axe(page, { include: "#how-i-think" });
});
