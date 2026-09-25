/**
 * not-found.spec.ts (TSK-47, TKT-88, M-009 — TC-171) — `app/not-found.tsx`, the site-wide 404.
 *
 * Runs in all four viewport projects (w390/w768/w1024/w1440, playwright.config.ts).
 *   Step 1 — an unknown path (`/definitely-missing`) responds with a real HTTP 404 AND renders
 *            this page's own h1 (not a framework error page / blank body); the three ways-back
 *            links (`/`, `/work`, `/contact`) exist in the page content.
 *   Step 2 — the section's decoration count is exactly 1 (the reused `tools` sketch), and exactly
 *            one `<footer>` renders (the global `BandFooter`, inherited from the root layout).
 *   Step 3 — axe clean at 390 and 1440.
 *   Step 4 — no illustration `<img>` (no new illustration spend, Design.md §12.4) and no
 *            horizontal overflow at 390.
 */
import { test, expect } from "./fixtures";

const PATH = "/definitely-missing";
const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

// ---------------------------------------------------------------------------
// Step 1 — unknown path returns a real HTTP 404, renders the page, and carries the three CTAs.
// ---------------------------------------------------------------------------
test("an unknown path responds 404 and renders the not-found page with its three CTAs", async ({ page }) => {
  const response = await page.goto(PATH, { waitUntil: "load" });
  expect(response?.status(), "an unknown path must respond with a real HTTP 404").toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page wandered off.");

  test.skip(width(page) !== 1440, "link resolution is viewport-independent; checked once at w1440");
  const main = page.locator("main");
  await expect(main.locator('a[href="/"]')).toHaveCount(1);
  await expect(main.locator('a[href="/work"]')).toHaveCount(1);
  await expect(main.locator('a[href="/contact"]')).toHaveCount(1);

  for (const path of ["/", "/work", "/contact"]) {
    const res = await page.request.get(path);
    expect(res.status(), `${path} must resolve 200`).toBe(200);
  }
});

// ---------------------------------------------------------------------------
// Header + footer are inherited from the root layout, not duplicated on this page.
// ---------------------------------------------------------------------------
test("header and footer chrome are present on the 404 page", async ({ page }) => {
  test.skip(width(page) !== 1440, "chrome presence is viewport-independent; checked once at w1440");
  await page.goto(PATH, { waitUntil: "load" });

  await expect(page.locator("header")).toBeVisible();
  // .first(): the desktop nav and the (closed, off-canvas) MobileMenu dialog nav share the same
  // aria-label — this only asserts primary nav chrome exists, not which instance.
  await expect(page.locator("nav[aria-label='Primary']").first()).toBeVisible();
});

// ---------------------------------------------------------------------------
// Step 2 — exactly one counted decoration (the reused `tools` sketch) and exactly one footer.
// ---------------------------------------------------------------------------
test("@EVAL-018 the section's only decoration is the reused tools sketch; exactly one footer renders", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "decoration/footer count is viewport-independent; checked once at w1440");
  await page.goto(PATH, { waitUntil: "load" });

  const main = page.locator("main");
  const decor = main.locator("[data-decor]");
  await expect(decor).toHaveCount(1);
  await expect(decor).toHaveAttribute("data-decor", "sketch");
  await expect(decor).toHaveAttribute("data-sketch", "tools");

  await expect(page.locator("footer")).toHaveCount(1);
});

// ---------------------------------------------------------------------------
// Step 3 — axe clean @390/1440.
// ---------------------------------------------------------------------------
test("@EVAL-006 axe clean on the 404 page", async ({ page, axe }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "axe sweep runs at 390 and 1440");
  await page.goto(PATH, { waitUntil: "load" });
  await axe(page);
});

// ---------------------------------------------------------------------------
// Step 4 — no illustration `<img>`, no overflow @390.
// ---------------------------------------------------------------------------
test("no illustration image renders on the 404 page", async ({ page }) => {
  test.skip(width(page) !== 1440, "markup shape is viewport-independent; checked once at w1440");
  await page.goto(PATH, { waitUntil: "load" });
  await expect(page.locator("main img")).toHaveCount(0);
});

test("@EVAL-008 no horizontal overflow on the 404 page", async ({ page, noOverflow }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "overflow sweep runs at 390 and 1440");
  await page.goto(PATH, { waitUntil: "load" });
  await noOverflow(page);
});

// ---------------------------------------------------------------------------
// Screenshot pack (TDD gate item 7) — 390/1440 only, per the brief.
// ---------------------------------------------------------------------------
test("screenshot pack", async ({ page }) => {
  const w = width(page);
  test.skip(w !== 390 && w !== 1440, "screenshots captured at 390 and 1440 only");
  await page.goto(PATH, { waitUntil: "load" });
  await page.screenshot({
    path: `docs/screenshots/not-found/${w}.png`,
    fullPage: true,
    animations: "disabled",
  });
});
