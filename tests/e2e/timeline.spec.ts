/**
 * timeline.spec.ts (TKT-41, technical-plan.md §B TKT-41) — the ExperienceTimeline on `/about`: the
 * primary gate for this ticket. Covers the two novel-interaction contracts EVAL-007/EVAL-010 name
 * for this component, plus the deep link, one-open-at-a-time, responsive orientation, overflow, and
 * the "not recorded" honesty marker.
 *
 * Each viewport project (w390/w768/w1024/w1440) runs this whole file once; viewport-independent
 * checks (keyboard, deep link, axe, reduced motion) run once at a chosen width via a `width()` skip,
 * matching about.spec.ts / eval-006/007/010.
 *
 *   @EVAL-007 — full keyboard path: Enter/Space open, Esc closes + returns focus, arrows rove.
 *   @EVAL-010 — reduced motion: card height snaps (transition none), node dot has no hover-scale.
 *   @EVAL-008 — no horizontal overflow at 390/768/1024/1440; every control ≥44×44 with a card open.
 *   @EVAL-006 — axe WCAG2.1AA clean at 390 and 1440, including with a StoryCard open.
 */
import { test, expect } from "./fixtures";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

const node = (page: import("@playwright/test").Page, id: string) =>
  page.locator(`#experience button[aria-controls="experience-${id}"]`);
const card = (page: import("@playwright/test").Page, id: string) =>
  page.locator(`#experience-${id} [data-story-card]`);
const openCount = (page: import("@playwright/test").Page) =>
  page.locator('#experience button[aria-expanded="true"]').count();

// ---------------------------------------------------------------------------
// Content — four roles, honesty markers (AC 1).
// ---------------------------------------------------------------------------
test("four nodes render; 'Scale: not recorded' shows where missing, AmEx shows its real scale", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  await page.goto("/about", { waitUntil: "load" });

  const nodes = page.locator("#experience button[data-node-index]");
  await expect(nodes).toHaveCount(4);
  await expect(node(page, "godrej")).toBeVisible();
  await expect(node(page, "amex")).toBeVisible();

  // Godrej/Quantiphi/Shellkode carry the literal "not recorded" marker, never hidden.
  for (const id of ["godrej", "quantiphi", "shellkode"]) {
    await node(page, id).click();
    await expect(card(page, id)).toContainText("not recorded");
    await node(page, id).click(); // close
  }

  // AmEx quantifies its scale — the one role the résumé actually measures.
  await node(page, "amex").click();
  await expect(card(page, "amex")).toContainText("35+ capabilities, 180+ user stories");
  // Its outcomes keep the verbatim "(self-reported)" text (no double-printed badge — see report).
  await expect(card(page, "amex")).toContainText("(self-reported)");
});

// ---------------------------------------------------------------------------
// @EVAL-007 — Enter/Space open, exactly one open at a time (AC 2, AC 3).
// ---------------------------------------------------------------------------
test("@EVAL-007 keyboard: Enter and Space open the focused node; exactly one card open at a time", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "keyboard path is viewport-independent; run once at w1440");
  await page.goto("/about", { waitUntil: "load" });

  await node(page, "godrej").focus();
  await expect(node(page, "godrej")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(card(page, "godrej")).toBeVisible();
  await expect(node(page, "godrej")).toHaveAttribute("aria-expanded", "true");
  expect(await openCount(page)).toBe(1);

  // Opening another closes the first (single-open reducer).
  await node(page, "amex").focus();
  await page.keyboard.press(" ");
  await expect(card(page, "amex")).toBeVisible();
  await expect(node(page, "godrej")).toHaveAttribute("aria-expanded", "false");
  expect(await openCount(page)).toBe(1);

  // Enter on the open node toggles it closed.
  await node(page, "amex").focus();
  await page.keyboard.press("Enter");
  await expect(card(page, "amex")).toBeHidden();
  expect(await openCount(page)).toBe(0);
});

// ---------------------------------------------------------------------------
// @EVAL-007 — Esc closes and returns focus to the owning node (AC 2).
// ---------------------------------------------------------------------------
test("@EVAL-007 keyboard: Esc closes the card and returns focus to its node", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "keyboard path is viewport-independent; run once at w1440");
  await page.goto("/about", { waitUntil: "load" });

  await node(page, "quantiphi").focus();
  await page.keyboard.press("Enter");
  await expect(card(page, "quantiphi")).toBeVisible();

  // Move focus into the card (Tab reaches the close button), then Esc.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Escape");
  await expect(card(page, "quantiphi")).toBeHidden();
  await expect(node(page, "quantiphi")).toBeFocused();
});

// ---------------------------------------------------------------------------
// @EVAL-007 — arrow keys rove focus between nodes (AC 2).
// ---------------------------------------------------------------------------
test("@EVAL-007 keyboard: arrow keys move focus between nodes (wrapping)", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "keyboard path is viewport-independent; run once at w1440");
  await page.goto("/about", { waitUntil: "load" });

  await node(page, "godrej").focus();
  await page.keyboard.press("ArrowRight");
  await expect(node(page, "quantiphi")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(node(page, "shellkode")).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(node(page, "quantiphi")).toBeFocused();
  // Wrap: Left from the first node lands on the last (ArrowDown also moves forward).
  await node(page, "godrej").focus();
  await page.keyboard.press("ArrowLeft");
  await expect(node(page, "amex")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(node(page, "godrej")).toBeFocused();
});

// ---------------------------------------------------------------------------
// Deep link — /about#experience-amex opens that card on load (AC 2).
// ---------------------------------------------------------------------------
test("deep link /about#experience-amex opens the AmEx card on load, others closed", async ({ page }) => {
  test.skip(width(page) !== 1440 && width(page) !== 390, "deep-link behaviour checked at one desktop + one mobile width");
  await page.goto("/about#experience-amex", { waitUntil: "load" });

  await expect(card(page, "amex")).toBeVisible();
  await expect(node(page, "amex")).toHaveAttribute("aria-expanded", "true");
  expect(await openCount(page)).toBe(1);
  await expect(node(page, "godrej")).toHaveAttribute("aria-expanded", "false");
});

test("the bare #experience section anchor still resolves to the section", async ({ page }) => {
  test.skip(width(page) !== 1440, "anchor existence is viewport-independent");
  await page.goto("/about#experience", { waitUntil: "load" });
  await expect(page.locator("section#experience")).toBeVisible();
  // No card auto-opens for the section anchor.
  expect(await openCount(page)).toBe(0);
});

// ---------------------------------------------------------------------------
// @EVAL-010 — reduced motion: card snaps (no grid-rows transition), dot has no hover-scale.
// ---------------------------------------------------------------------------
test("@EVAL-010 reduced motion: StoryCard height snaps and the node dot does not scale on hover", {
  tag: "@EVAL-010",
}, async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 1440, "reduced-motion behaviour is viewport-independent; run once at w1440");
  await withReducedMotion(page);
  await page.goto("/about", { waitUntil: "load" });

  // The disclosure wrapper collapses its transition to none under reduced motion (instant snap).
  const wrapperTransition = await page
    .locator("#experience-amex")
    .evaluate((el) => getComputedStyle(el).transitionProperty);
  expect(wrapperTransition, "StoryCard grid-rows transition must be none under reduced motion").toBe("none");

  // The node dot must not scale (transform-animate) on hover under reduced motion.
  const dot = node(page, "godrej").locator("[data-timeline-dot]");
  const before = await dot.boundingBox();
  await node(page, "godrej").hover();
  await page.waitForTimeout(250);
  const after = await dot.boundingBox();
  expect(before && after, "dot must be laid out").toBeTruthy();
  expect(Math.abs((after!.width) - (before!.width)), "dot must not scale under reduced motion").toBeLessThan(1);
});

// ---------------------------------------------------------------------------
// @EVAL-008 — orientation + no overflow + 44×44 with a card open (AC 4).
// ---------------------------------------------------------------------------
test("@EVAL-008 vertical <1024 / horizontal ≥1024, no overflow and ≥44×44 with a card open", {
  tag: "@EVAL-008",
}, async ({ page, noOverflow, minTargets }) => {
  await page.goto("/about", { waitUntil: "load" });

  const first = await node(page, "godrej").boundingBox();
  const second = await node(page, "quantiphi").boundingBox();
  expect(first && second, "nodes must be laid out").toBeTruthy();
  if (width(page) >= 1024) {
    // Horizontal: nodes share a row (same y), advancing in x.
    expect(second!.x).toBeGreaterThan(first!.x);
    expect(Math.abs(second!.y - first!.y)).toBeLessThan(24);
  } else {
    // Vertical: nodes stack (advancing y).
    expect(second!.y).toBeGreaterThan(first!.y);
  }

  // Open a card, then assert no overflow and every control still clears 44×44.
  await node(page, "amex").click();
  await expect(card(page, "amex")).toBeVisible();
  await noOverflow(page);
  await minTargets(page);

  if ([390, 768, 1024, 1440].includes(width(page))) {
    await page.screenshot({
      path: `docs/screenshots/about/${width(page)}-experience-open.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
});

// ---------------------------------------------------------------------------
// @EVAL-006 — axe clean at 390 and 1440, with a StoryCard open.
// ---------------------------------------------------------------------------
test("@EVAL-006 /about axe WCAG2.1AA clean with a StoryCard open", { tag: "@EVAL-006" }, async ({
  page,
  axe,
}) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "axe runs at 390 and 1440 (EVAL-006)");
  await page.goto("/about", { waitUntil: "load" });
  await node(page, "amex").click();
  await expect(card(page, "amex")).toBeVisible();
  await axe(page);
});
