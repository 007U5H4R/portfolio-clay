/**
 * not-found.spec.ts (TKT-46, M-006) — `app/not-found.tsx`, the site-wide 404.
 *
 * Runs in all four viewport projects (w390/w768/w1024/w1440, playwright.config.ts).
 *   AC1 — `/nope` (an unknown path) responds with a real HTTP 404 AND renders this page's own h1
 *         (not a framework error page / blank body).
 *   AC2 — the three ways-back links (`/`, `/work`, `/contact`) exist and resolve 200.
 *   AC3 — axe clean + no horizontal overflow @390/1440 (the harness's standard two-width sweep,
 *         same convention as contact.spec.ts/about.spec.ts).
 * Plus: header + footer are present (inherited from the root layout, not duplicated here), and the
 * TDD-gate screenshot pack @390/1440.
 */
import { test, expect } from "./fixtures";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

// ---------------------------------------------------------------------------
// AC1 — unknown path returns a real HTTP 404 and renders the page.
// ---------------------------------------------------------------------------
test("an unknown path responds 404 and renders the not-found page", async ({ page }) => {
  const response = await page.goto("/nope", { waitUntil: "load" });
  expect(response?.status(), "an unknown path must respond with a real HTTP 404").toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page wandered off.");
});

// ---------------------------------------------------------------------------
// Header + footer are inherited from the root layout, not duplicated on this page.
// ---------------------------------------------------------------------------
test("header and footer chrome are present on the 404 page", async ({ page }) => {
  test.skip(width(page) !== 1440, "chrome presence is viewport-independent; checked once at w1440");
  await page.goto("/nope", { waitUntil: "load" });

  await expect(page.locator("header")).toBeVisible();
  // .first(): the desktop nav and the (closed, off-canvas) MobileMenu dialog nav share the same
  // aria-label (eval-015.spec.ts uses the identical .first() pattern) — this only asserts primary
  // nav chrome exists, not which instance.
  await expect(page.locator("nav[aria-label='Primary']").first()).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
});

// ---------------------------------------------------------------------------
// AC2 — the three ways-back links exist (scoped to <main>, since Header/Footer carry their own
// "/", "/work", "/contact" links) and resolve 200.
// ---------------------------------------------------------------------------
test("the three ways-back links exist in the page content and resolve", async ({ page }) => {
  test.skip(width(page) !== 1440, "link resolution is viewport-independent; checked once at w1440");
  await page.goto("/nope", { waitUntil: "load" });

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
// AC3 — axe clean + no overflow @390/1440.
// ---------------------------------------------------------------------------
test("@EVAL-006 axe clean on the 404 page", async ({ page, axe }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "axe sweep runs at 390 and 1440");
  await page.goto("/nope", { waitUntil: "load" });
  await axe(page);
});

test("@EVAL-008 no horizontal overflow on the 404 page", async ({ page, noOverflow }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "overflow sweep runs at 390 and 1440");
  await page.goto("/nope", { waitUntil: "load" });
  await noOverflow(page);
});

// ---------------------------------------------------------------------------
// Screenshot pack (TDD gate item 7) — 390/1440 only, per the brief.
// ---------------------------------------------------------------------------
test("screenshot pack", async ({ page }) => {
  const w = width(page);
  test.skip(w !== 390 && w !== 1440, "screenshots captured at 390 and 1440 only");
  await page.goto("/nope", { waitUntil: "load" });
  await page.screenshot({
    path: `docs/screenshots/not-found/${w}.png`,
    fullPage: true,
    animations: "disabled",
  });
});
