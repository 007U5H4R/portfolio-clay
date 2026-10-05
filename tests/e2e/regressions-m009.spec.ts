/**
 * regressions-m009.spec.ts (TKT-90b, TASK-85) — one regression test per bug fixed from the TKT-85 sweep
 * and the TKT-83 open flake. Each test reproduced its bug on the pre-fix build (see docs/reports/TKT-90-90b.md).
 *
 *  1. `/projects` (was `/work`, TKT-101) filter tabs: at 390 the tab row was a hidden-scrollbar scroller that clipped "Experiments"
 *     mid-word with no affordance. TASK-116 replaced the tabs with the Portfolio carousel; the guard now
 *     checks that intentional scroller keeps its scrollbar, arrows and count.
 *  2. `ChapterNav` scroll-spy: an empty trigger band kept the last active chapter, so scrolling back to
 *     the top of the page left "08" current instead of "01".
 *  3. Chapter link → no scroll: Lenis clamped the jump to a `limit` cached before the deep dive grew the
 *     page (250 ms debounced ResizeObserver), so a quick click went nowhere.
 */
import { test, expect } from "./fixtures";


// ---------------------------------------------------------------------------------------------------
// 1 · /projects carousel — visible scroll affordances, ≥ 44 px targets, no page overflow (every width)
// ---------------------------------------------------------------------------------------------------
test("regression · the /projects horizontal row is never a hidden, affordance-free scroller (TKT-85 finding 14)", async ({ page, noOverflow }) => {
  // TKT-85 finding 14 was a hidden-scrollbar tab row that clipped a label with no affordance. TASK-116
  // replaced the filter tabs with the Portfolio carousel — an INTENTIONAL horizontal scroller — so the
  // same bug class is guarded here: the track keeps a visible scrollbar, visible ≥ 44 px prev/next
  // buttons and an "n / N" count, every cover is a ≥ 44 px target, and the page itself never overflows.
  await page.goto("/projects", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const track = page.getByRole("tablist", { name: "Select a product" });
  const m = await track.evaluate((row) => ({
    scrollbar: getComputedStyle(row).scrollbarWidth,
    tabs: Array.from(row.querySelectorAll<HTMLElement>('[role="tab"]')).map((tab) => ({ w: tab.offsetWidth, h: tab.offsetHeight })),
  }));
  expect(m.scrollbar, "the carousel scrollbar is never hidden").not.toBe("none");
  for (const tab of m.tabs) {
    expect(tab.w).toBeGreaterThanOrEqual(44);
    expect(tab.h).toBeGreaterThanOrEqual(44);
  }
  for (const name of ["Previous product", "Next product"]) {
    const box = (await page.getByRole("button", { name }).boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await expect(page.locator(".pf-count")).toHaveText(/^1 \/ \d+$/);
  await noOverflow(page);
});

// TASK-130: the ChapterNav regressions (TKT-85 finding 5, TKT-83 Lenis flake) retired with the
// §7.3 template; the one-pager navigator is plain in-page anchors (case-study-system.spec.ts).
