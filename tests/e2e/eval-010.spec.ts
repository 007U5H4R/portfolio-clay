/**
 * eval-010.spec.ts (technical-plan.md §B S09.02, `@EVAL-010`) — prefers-reduced-motion honoured:
 * transform/position animations collapse to opacity-only or instant, and the page stays usable.
 * Live now for the two motion sources that exist on the built routes — the compacting header and
 * the card hover-lift. Ask expand/panel, StoryCard and parallax are fixme'd until their tickets
 * (TKT-10/13/16). ShowTheThinking's reduced-motion behaviour is real now, in thinking.spec.ts
 * (TKT-21).
 */
import { test, expect } from "./fixtures";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

test("@EVAL-010 reduced motion: header transition collapses and card hover does not lift", {
  tag: "@EVAL-010",
}, async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 1440, "hover/compaction reduced-motion check runs at w1440 (fine pointer)");
  await withReducedMotion(page);
  await page.goto("/", { waitUntil: "load" });

  // Header transition-property collapses to none under reduced motion.
  const transitionProperty = await page
    .locator("header")
    .first()
    .evaluate((el) => getComputedStyle(el).transitionProperty);
  expect(transitionProperty, "header transition must collapse to none under reduced motion").toBe(
    "none",
  );

  // Card hover must not translate (transform-animate) under reduced motion.
  const card = page.locator('a[href="/work/teachspark"]').first();
  await card.scrollIntoViewIfNeeded();
  const before = await card.boundingBox();
  await card.hover();
  await page.waitForTimeout(300);
  const after = await card.boundingBox();
  expect(before && after, "card must be laid out").toBeTruthy();
  expect(
    Math.abs(after!.y - before!.y),
    "card must not lift under reduced motion",
  ).toBeLessThan(1);
});

// Ask expand/panel + StoryCard + parallax reduced-motion checks arrive with their components
// (TKT-10/13/16). ShowTheThinking's is real now — see thinking.spec.ts (TKT-21).
test.fixme("@EVAL-010 reduced motion: Ask / story / parallax collapse (TKT-10/13/16)", {
  tag: "@EVAL-010",
}, async () => {});
