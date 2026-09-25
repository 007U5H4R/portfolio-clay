/**
 * regressions-m009.spec.ts (TKT-90b, TASK-85) — one regression test per bug fixed from the TKT-85 sweep
 * and the TKT-83 open flake. Each test reproduced its bug on the pre-fix build (see docs/reports/TKT-90-90b.md).
 *
 *  1. `/work` filter tabs: at 390 the tab row was a hidden-scrollbar scroller that clipped "Experiments"
 *     mid-word with no affordance. Now every tab is fully inside the row (it wraps), ≥ 44 px, no overflow.
 *  2. `ChapterNav` scroll-spy: an empty trigger band kept the last active chapter, so scrolling back to
 *     the top of the page left "08" current instead of "01".
 *  3. Chapter link → no scroll: Lenis clamped the jump to a `limit` cached before the deep dive grew the
 *     page (250 ms debounced ResizeObserver), so a quick click went nowhere.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const NAV = 'nav[aria-label="Chapters"]';

// ---------------------------------------------------------------------------------------------------
// 1 · /work filter tabs — no clipped label, ≥ 44 px targets, no overflow (every width)
// ---------------------------------------------------------------------------------------------------
test("regression · /work filter tabs are never clipped (TKT-85 finding 14)", async ({ page, noOverflow }) => {
  await page.goto("/work", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const list = page.getByRole("tablist", { name: "Filter projects" });
  await expect(list.getByRole("tab")).toHaveCount(5);

  const boxes = await list.evaluate((row) => {
    const r = row.getBoundingClientRect();
    return {
      row: { left: r.left, right: r.right, scrollW: row.scrollWidth, clientW: row.clientWidth },
      tabs: Array.from(row.querySelectorAll<HTMLElement>('[role="tab"]')).map((tab) => {
        const t = tab.getBoundingClientRect();
        return { label: tab.textContent?.trim(), left: t.left, right: t.right, w: t.width, h: t.height };
      }),
    };
  });
  // The row itself does not scroll — nothing is hidden behind an invisible scrollbar.
  expect(boxes.row.scrollW, "tab row must not scroll horizontally").toBeLessThanOrEqual(boxes.row.clientW + 1);
  for (const tab of boxes.tabs) {
    // Fully inside the row (a clipped "Exp…" sits past the row's right edge).
    expect(tab.left, `${tab.label} left edge`).toBeGreaterThanOrEqual(boxes.row.left - 1);
    expect(tab.right, `${tab.label} right edge`).toBeLessThanOrEqual(boxes.row.right + 1);
    expect(tab.w, `${tab.label} width`).toBeGreaterThanOrEqual(44);
    expect(tab.h, `${tab.label} height`).toBeGreaterThanOrEqual(44);
  }
  await noOverflow(page);
  if (width(page) === 390) {
    await list.screenshot({ path: "docs/screenshots/m-009/tkt-90b/work-tabs-390.png" });
  }
});

// ---------------------------------------------------------------------------------------------------
// Case-study deep dive helpers (≥ 1024 only — the ChapterNav is not in the DOM below)
// ---------------------------------------------------------------------------------------------------
async function openDeepDive(page: Page): Promise<void> {
  const res = await page.goto("/work/teachspark", { waitUntil: "load" });
  expect(res?.status()).toBe(200);
  // Lenis is a dynamic import after hydration — the bugs below live on the Lenis path.
  await expect(page.locator("html.lenis")).toHaveCount(1);
  await page.getByRole("radio", { name: "Deep dive" }).click();
  await expect(page.locator(NAV)).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

// ---------------------------------------------------------------------------------------------------
// 2 · ChapterNav — after reading to the last chapter and jumping back to the top, "01" is current
// ---------------------------------------------------------------------------------------------------
test("regression · ChapterNav marks 01 after scrolling back to the top (TKT-85 finding 5)", async ({ page }) => {
  test.skip(width(page) < 1024, "the chapter nav exists only at ≥ 1024");
  await openDeepDive(page);
  const links = page.locator(`${NAV} a`);
  const count = await links.count();
  const last = links.nth(count - 1);

  // Read down to the last chapter: put its top inside the trigger band (just under the header) with a
  // plain scroll — Lenis follows native scroll — so this test doesn't depend on the click path (bug 3).
  const lastId = (await last.getAttribute("href"))!.slice(1);
  await page.evaluate((id) => {
    const el = document.getElementById(id)!;
    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 150, behavior: "instant" });
  }, lastId);
  await expect(last).toHaveAttribute("aria-current", "location", { timeout: 5000 });

  // Back to the top of the page in one jump (Home key / scroll-to-top), then let the observer settle.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(0);
  await expect(links.first()).toHaveAttribute("aria-current", "location", { timeout: 5000 });
  await expect(page.locator(`${NAV} a[aria-current]`)).toHaveCount(1);
});

// ---------------------------------------------------------------------------------------------------
// 3 · Chapter link clicked right after the deep dive grows the page still scrolls to the chapter
// ---------------------------------------------------------------------------------------------------
test("regression · chapter link scrolls even while Lenis's size cache is stale (TKT-83 w1024 flake)", async ({ page }) => {
  test.skip(width(page) < 1024, "the chapter nav exists only at ≥ 1024");
  await page.goto("/work/teachspark", { waitUntil: "load" });
  await expect(page.locator("html.lenis")).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready);

  // Open the deep dive and click the LAST chapter link in the same task burst — well inside Lenis's
  // 250 ms resize debounce, so its cached scroll limit is still the short 30-sec page's. Deterministic
  // form of the intermittent flake (there, lazy images/fonts kept restarting the debounce).
  const targetId = await page.evaluate(async (nav) => {
    const radio = Array.from(document.querySelectorAll<HTMLElement>('[role="radio"]')).find((el) =>
      el.textContent?.includes("Deep dive"),
    );
    if (!radio) throw new Error("Deep dive radio not found");
    radio.click();
    const link = await new Promise<HTMLAnchorElement>((resolve, reject) => {
      const t0 = performance.now();
      const tick = () => {
        const links = document.querySelectorAll<HTMLAnchorElement>(`${nav} a`);
        if (links.length > 0) resolve(links[links.length - 1]!);
        else if (performance.now() - t0 > 2000) reject(new Error("ChapterNav never mounted"));
        else requestAnimationFrame(tick);
      };
      tick();
    });
    link.click();
    return link.getAttribute("href")!.slice(1);
  }, NAV);

  await expect(page).toHaveURL(new RegExp(`#${targetId}$`));
  const target = page.locator(`[id="${targetId}"]`);
  await expect
    .poll(async () => target.evaluate((el) => Math.round(el.getBoundingClientRect().top)), { timeout: 5000 })
    .toBeLessThanOrEqual(200);
  await expect
    .poll(async () => target.evaluate((el) => Math.round(el.getBoundingClientRect().top)), { timeout: 5000 })
    .toBeGreaterThanOrEqual(72);
});
