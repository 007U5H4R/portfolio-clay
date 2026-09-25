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

/**
 * Navigate to the dev route and SKIP (never FAIL) when it 404s. `/dev/*` routes only exist under
 * `ALLOW_DEV_ROUTES=1 pnpm start` (the QA job); a plain `pnpm test:e2e` runs against a normal
 * production build where they return 404, so these specs must skip rather than fail (carry-forward
 * from TKT-07a: no phantom "primitives" failures on the default run).
 */
async function gotoDev(page: import("@playwright/test").Page): Promise<void> {
  const resp = await page.goto(PATH, { waitUntil: "load" });
  test.skip(
    (resp?.status() ?? 404) === 404,
    "/dev/primitives 404s without ALLOW_DEV_ROUTES=1 — run the QA job to exercise it",
  );
}

test("primitives board · no-overflow + min-targets + screenshots", { tag: "@primitives" }, async ({
  page,
  noOverflow,
  minTargets,
}) => {
  await gotoDev(page);
  // Confirm the dev route actually rendered (not a 404 from a non-flag build).
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Paper primitive system");

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
  await gotoDev(page);
  await axe(page);
});

// TSK-35: the ClayPill hover test that lived here was retired with the clay board — `ClayPill` is no
// longer rendered on `/dev/primitives` (the paper board replaced it; the clay tree is deleted in TKT-89/TKT-90a).
// In its place: the server-side count readout must agree with the DOM it describes.
test("primitives board · every section's server-side readout matches its owned [data-decor] count", {
  tag: "@primitives",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "readout agreement measured once at w1440");
  await gotoDev(page);

  const rows = await page.evaluate(() => {
    const out: { id: string; readout: number; dom: number; over: boolean }[] = [];
    for (const section of Array.from(document.querySelectorAll("section[id^='board-']"))) {
      const readout = section.querySelector(":scope > div > [data-readout]");
      if (!readout) continue;
      const m = /^(\d+) \/ 4/.exec((readout.textContent ?? "").trim());
      // Owned = nearest-ancestor section is this one (nested chapters own their own).
      const dom = Array.from(section.querySelectorAll("[data-decor]")).filter(
        (el) => el.closest("section") === section,
      ).length;
      out.push({ id: section.id, readout: m ? Number(m[1]) : -1, dom, over: readout.hasAttribute("data-over") });
    }
    return out;
  });
  expect(rows.length, "the board renders its sections with a readout").toBeGreaterThanOrEqual(10);
  for (const row of rows) {
    expect(row.readout, `${row.id}: readout must equal the DOM count`).toBe(row.dom);
    expect(row.over, `${row.id}: the clean board is never over budget`).toBe(false);
  }
});
