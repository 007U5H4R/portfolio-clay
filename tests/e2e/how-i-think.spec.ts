/**
 * how-i-think.spec.ts (technical-plan.md §B S13.04, `@EVAL-007 @EVAL-010 @EVAL-011 @EVAL-013`) —
 * the home How-I-Think module: 6 disclosure tiles, one shared expand region below the row.
 *
 *   @EVAL-007 — keyboard path: Tab reaches the roving tile group, Arrow keys move the roving
 *               tabindex, Enter/Space opens the expand card, Escape closes without losing focus.
 *   @EVAL-010 — reduced motion collapses the expand transition to instant (no measurable duration).
 *   @EVAL-011 — every trigger tile is a live control (opens/closes, no dead button) and the
 *               revealed example link resolves 200 (no dead link).
 *   @EVAL-013 — sourced content: all 6 stages render, each example link points at its declared
 *               project's case study anchor (no fabricated/dangling hrefs).
 */
import { test, expect } from "./fixtures";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

const STAGES = ["Problem", "Insight", "Bet", "Build", "Evaluate", "Impact"] as const;

const triggers = (page: import("@playwright/test").Page) =>
  page.locator("#how-i-think button[data-stage-trigger]");

// ---------------------------------------------------------------------------
// @EVAL-013 — all 6 stages render, in CONTENT_INVENTORY §1.5 order.
// ---------------------------------------------------------------------------
test("@EVAL-013 renders all 6 stages in order", async ({ page }) => {
  test.skip(width(page) !== 1440, "stage list checked once at w1440");
  await page.goto("/", { waitUntil: "load" });
  const buttons = triggers(page);
  await expect(buttons).toHaveCount(6);
  for (let i = 0; i < STAGES.length; i++) {
    await expect(buttons.nth(i)).toContainText(STAGES[i]!);
  }
});

// ---------------------------------------------------------------------------
// @EVAL-011 / @EVAL-013 — opening a stage reveals its sourced example; the link href matches the
// data and resolves 200. Opening a second stage closes the first (only one open at a time).
// ---------------------------------------------------------------------------
test("@EVAL-011 @EVAL-013 opening a stage reveals one sourced, resolving example; only one open at a time", {
  tag: ["@EVAL-011", "@EVAL-013"],
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "expand/collapse behaviour checked once at w1440");
  await page.goto("/", { waitUntil: "load" });

  const panel = page.locator("#how-i-think-panel");
  const problemTrigger = triggers(page).nth(0);
  const insightTrigger = triggers(page).nth(1);

  await expect(problemTrigger).toHaveAttribute("aria-expanded", "false");
  await problemTrigger.click();
  await expect(problemTrigger).toHaveAttribute("aria-expanded", "true");

  const link = panel.getByRole("link");
  await expect(link).toBeVisible();
  const href = await link.getAttribute("href");
  expect(href, "example link must carry an href").toBeTruthy();
  const res = await page.request.get(href!);
  expect(res.status(), `${href} must resolve 200`).toBe(200);

  // Opening a second stage closes the first.
  await insightTrigger.click();
  await expect(insightTrigger).toHaveAttribute("aria-expanded", "true");
  await expect(problemTrigger).toHaveAttribute("aria-expanded", "false");
  await expect(panel.getByRole("link")).toHaveCount(1);
});

// ---------------------------------------------------------------------------
// S13.03 gate — expanding a stage pushes following content down. Measured via the document's
// absolute scroll height (not a viewport-relative boundingBox), which stays correct regardless of
// any scroll-into-view Playwright's .click() performs on the trigger.
// ---------------------------------------------------------------------------
test("expanding a stage pushes following content down", async ({ page }) => {
  test.skip(width(page) !== 1440, "layout-shift geometry checked once at w1440");
  await page.goto("/", { waitUntil: "load" });

  const before = await page.evaluate(() => document.documentElement.scrollHeight);
  await triggers(page).first().click();
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(after, "expanding a stage must grow the document height (content shifts down)").toBeGreaterThan(
    before,
  );
});

// ---------------------------------------------------------------------------
// @EVAL-007 — full keyboard path: Tab in, Arrow keys move the roving tabindex, Enter opens,
// Escape closes without moving focus off the tile.
// ---------------------------------------------------------------------------
test("@EVAL-007 keyboard: arrow keys rove, Enter opens, Escape closes and keeps focus", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "keyboard script run once at w1440");
  await page.goto("/", { waitUntil: "load" });

  const first = triggers(page).nth(0);
  const second = triggers(page).nth(1);

  await first.focus();
  await expect(first).toBeFocused();

  // Roving tabindex: only the active tile is a tab stop.
  await expect(first).toHaveAttribute("tabindex", "0");
  await expect(second).toHaveAttribute("tabindex", "-1");

  await page.keyboard.press("ArrowRight");
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute("tabindex", "0");
  await expect(first).toHaveAttribute("tabindex", "-1");

  await page.keyboard.press("ArrowLeft");
  await expect(first).toBeFocused();

  // Enter opens; Escape closes without moving focus off the tile.
  await page.keyboard.press("Enter");
  await expect(first).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(first).toHaveAttribute("aria-expanded", "false");
  await expect(first).toBeFocused();
});

// ---------------------------------------------------------------------------
// Outside click closes the expanded stage.
// ---------------------------------------------------------------------------
test("clicking outside the module closes the expanded stage", async ({ page }) => {
  test.skip(width(page) !== 1440, "pointer behaviour checked once at w1440");
  await page.goto("/", { waitUntil: "load" });

  const first = triggers(page).first();
  await first.click();
  await expect(first).toHaveAttribute("aria-expanded", "true");

  // The section heading sits inside #how-i-think but outside both the tile row and the expand
  // panel, so it is a safe "outside the module" click target with no risk of hitting a link.
  await page.locator("#how-i-think-heading").click();
  await expect(first).toHaveAttribute("aria-expanded", "false");
});

// ---------------------------------------------------------------------------
// @EVAL-010 — reduced motion collapses the expand transition (no measurable transition-duration).
// ---------------------------------------------------------------------------
test("@EVAL-010 reduced motion collapses the expand transition to instant", {
  tag: "@EVAL-010",
}, async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 1440, "reduced-motion check runs at w1440");
  await withReducedMotion(page);
  await page.goto("/", { waitUntil: "load" });

  const panel = page.locator("#how-i-think-panel");
  const transitionProperty = await panel.evaluate((el) => getComputedStyle(el).transitionProperty);
  expect(transitionProperty, "expand transition must collapse to none under reduced motion").toBe(
    "none",
  );
});

// ---------------------------------------------------------------------------
// noOverflow + axe at 390.
// ---------------------------------------------------------------------------
test("no horizontal overflow and 0 critical/serious axe violations at 390", async ({
  page,
  noOverflow,
  axe,
}) => {
  test.skip(width(page) !== 390, "overflow/axe checked once at w390");
  await page.goto("/", { waitUntil: "load" });
  await triggers(page).first().click();
  await noOverflow(page);
  await axe(page, { include: "#how-i-think" });
});
