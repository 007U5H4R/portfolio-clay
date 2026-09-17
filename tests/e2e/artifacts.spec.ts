/**
 * artifacts.spec.ts (TKT-20) — the /dev/artifacts board QA gate.
 *
 * Like primitives.spec.ts, this is tagged `@artifacts` (NOT `@EVAL-006/008`): the /dev board is a
 * QA-only route (routes.json `dev`) that only exists in an ALLOW_DEV_ROUTES build, so it must not
 * be pulled into the eval harness's site-route sweep. It enforces the same substance — axe clean,
 * no horizontal overflow, 44px targets — against the artifact board itself (AC 4), and captures the
 * 390/1440 review screenshots (the §C Phase-4 "one artifact board reviewed" evidence).
 *
 * Run with: `ALLOW_DEV_ROUTES=1 pnpm build && ALLOW_DEV_ROUTES=1 pnpm start` then
 * `pnpm test:e2e --grep @artifacts` (the QA job). A plain run skips it on the 404.
 */
import { test, expect } from "./fixtures";

const PATH = "/dev/artifacts";
const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

async function gotoDev(page: import("@playwright/test").Page): Promise<void> {
  const resp = await page.goto(PATH, { waitUntil: "load" });
  test.skip(
    (resp?.status() ?? 404) === 404,
    "/dev/artifacts 404s without ALLOW_DEV_ROUTES=1 — run the QA job to exercise it",
  );
}

test("artifacts board · no-overflow + min-targets + screenshots", { tag: "@artifacts" }, async ({
  page,
  noOverflow,
  minTargets,
}) => {
  await gotoDev(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Case-study artifacts");

  await noOverflow(page);
  await minTargets(page);

  const w = width(page);
  if (w === 390 || w === 1440) {
    await page.screenshot({
      path: `docs/screenshots/artifacts/${w}.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
});

test("artifacts board · axe wcag2.1 AA", { tag: "@artifacts" }, async ({ page, axe }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "axe runs at 390 and 1440");
  await gotoDev(page);
  await axe(page);
});
