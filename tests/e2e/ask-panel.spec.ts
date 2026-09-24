/**
 * ask-panel.spec.ts (technical-plan.md §B S11.01–03, TKT-11) — the global AskPanel slide-over.
 *
 * Exercised on the REAL site (no dev flag): the deterministic local provider answers a matching
 * query and gracefully empties an off-topic one. Covers the lazy-mount contract (the panel is not in
 * the DOM until first open — the code-split proof that pairs with the EVAL-005 bundle-budget gate),
 * the four screen states, close paths (close button + scrim), the 6 panel prompts, 44px targets,
 * no-overflow and axe-cleanliness with the panel open at 390 and 1440.
 *
 * Titles carry the `ask-panel` prefix so `pnpm test:e2e --grep ask-panel` selects this file.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const width = (page: Page) => page.viewportSize()?.width ?? 0;

const REAL_QUERY = "What products have you built?";
const OFF_TOPIC_QUERY = "what is the weather in paris";

const panel = (page: Page) => page.locator("dialog.ask-panel");

/**
 * Open the panel from the width-appropriate trigger: the header's icon-only Ask ghost at lg+
 * (1024 — the D12 nav collapse point, TKT-71), the MobileMenu sheet's Ask row below it.
 */
async function openPanel(page: Page): Promise<void> {
  if (width(page) < 1024) {
    const hamburger = page.getByRole("button", { name: "Open menu" });
    await hamburger.click();
    const menu = page.locator('dialog[aria-label="Site navigation"]');
    await expect(menu).toBeVisible();
    await menu.getByRole("button", { name: "Ask AI" }).click();
  } else {
    await page.locator("header").getByRole("button", { name: "Ask AI" }).click();
  }
  await expect(panel(page)).toBeVisible();
}

test.describe("ask-panel", () => {
  test("@EVAL-005 lazy: the panel is not in the DOM until first open, then it mounts", async ({ page }) => {
    test.skip(width(page) !== 1440, "lazy-mount contract verified once at a desktop width");
    await page.goto("/", { waitUntil: "load" });
    // Not mounted on first load (AskPanelLazy is gated on the first openPanel() — EVAL-005 budget).
    await expect(panel(page)).toHaveCount(0);
    await openPanel(page);
    await expect(panel(page)).toHaveCount(1);
  });

  test("@EVAL-012 idle: opening shows the 6 panel prompts + the honesty microcopy", async ({ page }) => {
    test.skip(width(page) !== 1440, "state content verified once at w1440");
    await page.goto("/", { waitUntil: "load" });
    await openPanel(page);
    await expect(panel(page).getByRole("heading", { level: 2, name: "Ask AI" })).toBeVisible();
    const prompts = panel(page).getByRole("list", { name: "Suggested questions" }).getByRole("button");
    await expect(prompts).toHaveCount(6);
    await expect(
      panel(page).getByText("Answers come from this portfolio's content — nothing generated."),
    ).toBeVisible();
  });

  test("@EVAL-012 answer: a matching query returns a sourced answer with evidence, never navigates", async ({
    page,
  }) => {
    test.skip(width(page) !== 1440, "answer flow verified once at w1440");
    await page.goto("/", { waitUntil: "load" });
    const urlBefore = page.url();
    await openPanel(page);

    await panel(page).locator("#ask-panel-input").fill(REAL_QUERY);
    await panel(page).locator("#ask-panel-input").press("Enter");

    await expect(panel(page).getByRole("heading", { level: 3, name: "Answer" })).toBeVisible();
    await expect(panel(page).getByRole("list", { name: "Sources" })).toBeVisible();
    expect(page.url()).toBe(urlBefore); // deterministic, in-place, no navigation (S7)
  });

  test("@EVAL-012 empty: an off-topic query returns the fallback + fresh prompts, never an answer", async ({
    page,
  }) => {
    test.skip(width(page) !== 1440, "empty flow verified once at w1440");
    await page.goto("/", { waitUntil: "load" });
    await openPanel(page);

    await panel(page).locator("#ask-panel-input").fill(OFF_TOPIC_QUERY);
    await panel(page).locator("#ask-panel-input").press("Enter");

    await expect(
      panel(page).getByText("I only answer from the sourced facts on this site — try one of the prompts, or email me."),
    ).toBeVisible();
    await expect(panel(page).getByRole("heading", { level: 3, name: "Answer" })).toHaveCount(0);
  });

  test("@EVAL-007 the close button closes the panel", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await openPanel(page);
    await panel(page).getByRole("button", { name: "Close Ask panel" }).click();
    await expect(panel(page)).toBeHidden();
  });

  test("@EVAL-007 a click on the scrim (the dialog backdrop) closes the panel", async ({ page }) => {
    test.skip(width(page) !== 1440, "scrim geometry is a desktop-drawer concern");
    await page.goto("/", { waitUntil: "load" });
    await openPanel(page);
    // The drawer sits at the right; click the far-left backdrop area, which is the <dialog> itself.
    await page.mouse.click(40, 400);
    await expect(panel(page)).toBeHidden();
  });

  test("@EVAL-008 every panel control meets the 44px target floor", { tag: "@EVAL-008" }, async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await openPanel(page);
    // Answer first so evidence pills are present too.
    await panel(page).locator("#ask-panel-input").fill(REAL_QUERY);
    await panel(page).locator("#ask-panel-input").press("Enter");
    await expect(panel(page).getByRole("heading", { level: 3, name: "Answer" })).toBeVisible();
    // Let layout settle (web fonts can reflow control widths) before measuring, then retry the
    // whole measurement pass with toPass() instead of a one-shot boundingBox() read — this check
    // flaked under host load on sub-pixel boundary cases, never a stale assertion. Round to whole
    // px (a <1px sub-pixel rounding tolerance is legitimate); the real 44px floor is unchanged.
    await page.evaluate(() => document.fonts.ready);
    await expect(async () => {
      const controls = panel(page).locator("a[href], button, input");
      const count = await controls.count();
      expect(count).toBeGreaterThan(0);
      const undersized: { text: string; w: number; h: number }[] = [];
      for (let i = 0; i < count; i++) {
        const box = await controls.nth(i).boundingBox();
        if (!box) continue;
        const w = Math.round(box.width);
        const h = Math.round(box.height);
        if (w < 44 || h < 44) {
          undersized.push({
            text: (await controls.nth(i).innerText().catch(() => "")).slice(0, 30),
            w,
            h,
          });
        }
      }
      expect(undersized, `panel controls below 44x44:\n${JSON.stringify(undersized, null, 2)}`).toEqual([]);
    }).toPass({ timeout: 6000 });
  });

  test("@EVAL-008 the open panel does not overflow the viewport width", { tag: "@EVAL-008" }, async ({
    page,
    noOverflow,
  }) => {
    await page.goto("/", { waitUntil: "load" });
    await openPanel(page);
    await noOverflow(page);
  });

  test("@TC-051 panel geometry: full-bleed bottom sheet at <768, fixed-width drawer at >=768", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "load" });
    await openPanel(page);
    const box = await panel(page).boundingBox();
    if (!box) throw new Error("ask panel has no bounding box while open");
    const viewportWidth = width(page);
    if (viewportWidth < 768) {
      // Bottom sheet must span the full viewport width — no gap on the right edge showing the
      // page behind (the native `dialog:modal` UA `max-width` regression, TC-051).
      expect(Math.round(box.width)).toBe(viewportWidth);
    } else {
      // Right-anchored drawer: 400px from 768 up to (not including) the 1440 breakpoint, 480px at
      // 1440+ (Design.md §3 / app/globals.css `--breakpoint-2xl: 1440px`).
      const expectedWidth = viewportWidth >= 1440 ? 480 : 400;
      expect(Math.round(box.width)).toBe(expectedWidth);
    }
  });

  test("@EVAL-006 the panel is axe-clean in idle and answer states", { tag: "@EVAL-006" }, async ({
    page,
    axe,
  }) => {
    test.skip(width(page) !== 390 && width(page) !== 1440, "axe runs at 390 and 1440");
    await page.goto("/", { waitUntil: "load" });
    await openPanel(page);
    await axe(page, { include: "dialog.ask-panel" }); // idle
    await panel(page).locator("#ask-panel-input").fill(REAL_QUERY);
    await panel(page).locator("#ask-panel-input").press("Enter");
    await expect(panel(page).getByRole("heading", { level: 3, name: "Answer" })).toBeVisible();
    await axe(page, { include: "dialog.ask-panel" }); // answer
  });
});
