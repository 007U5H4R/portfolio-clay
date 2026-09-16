/**
 * primitives.spec.ts (S04.08) — the /dev/primitives board QA gate for TKT-04.
 *
 * Deliberately tagged `@primitives` (NOT `@EVAL-006/008/010`): the /dev board is a QA-only route
 * (TSK-09 routes.json) that only exists in an ALLOW_DEV_ROUTES build, so it must not be pulled into
 * the eval harness's site-route EVAL grep — the board is folded into EVAL-006 formally at TKT-07.
 * Here it enforces the same substance (axe clean, no overflow, 44px targets, real hover states)
 * against the board itself. Run with: `pnpm test:e2e --grep primitives` on an ALLOW_DEV_ROUTES build.
 */
import { test, expect } from "./fixtures";

const PATH = "/dev/primitives";
const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

test("primitives board · no-overflow + min-targets + screenshots", { tag: "@primitives" }, async ({
  page,
  noOverflow,
  minTargets,
}) => {
  await page.goto(PATH, { waitUntil: "load" });
  // Confirm the dev route actually rendered (not a 404 from a non-flag build).
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Clay primitive system");

  await noOverflow(page);
  await minTargets(page);

  const w = width(page);
  if (w === 390 || w === 1440) {
    await page.screenshot({
      path: `docs/screenshots/primitives/${w}.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
});

test("primitives board · axe wcag2.1 AA", { tag: "@primitives" }, async ({ page, axe }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "axe runs at 390 and 1440");
  await page.goto(PATH, { waitUntil: "load" });
  await axe(page);
});

test("primitives board · filter pill changes bg on hover; tag pill does not", {
  tag: "@primitives",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "hover behaviour measured once at w1440 (fine pointer)");
  await page.goto(PATH, { waitUntil: "load" });

  const bg = (loc: import("@playwright/test").Locator) =>
    loc.evaluate((el) => getComputedStyle(el).backgroundColor);

  const filter = page.getByTestId("pill-filter");
  const tag = page.getByTestId("pill-tag");
  await expect(filter).toBeVisible();
  await expect(tag).toBeVisible();

  const filterRest = await bg(filter);
  await filter.hover();
  await expect
    .poll(async () => bg(filter), { message: "filter pill bg must change on hover" })
    .not.toBe(filterRest);

  const tagRest = await bg(tag);
  await tag.hover();
  // Static tag must never change on hover (Law of Similarity).
  await page.waitForTimeout(150);
  expect(await bg(tag), "static tag bg must be identical on hover").toBe(tagRest);
});
