/**
 * artifacts.spec.ts (TKT-20; extended TKT-83) — the /dev/artifacts board QA gate PLUS the case-study
 * deep-dive contract on the real routes (TC-159 flat zones · TC-160 board EVAL-018 · TC-161 ChapterNav
 * · TC-162 Show the thinking).
 *
 * The `@artifacts` board tests are the QA-only route gate (routes.json `dev`): the board only exists in
 * an ALLOW_DEV_ROUTES build, so a plain run SKIPs them on the 404 — never fails. Everything tagged
 * `@EVAL-018` / `@EVAL-007` / `@EVAL-010` / `@EVAL-006` runs on `/work/<slug>` against the production
 * build like every other eval spec.
 *
 * Deep-dive state: the chapters live behind `OverviewToggle` (default "30-sec"), so every check here
 * first selects "Deep dive" — the EVAL-018 collector (`tests/e2e/eval-018-lib.ts`) is then run on the
 * page and read per unit: `section#deep` 0 · every `section.chapter` 0 · `section#show-the-thinking` 2
 * (Design.md §3.3), and `[data-flat] [data-decor]` is empty everywhere (§3.2 rule 4).
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { collectDecorations, RULE_LIMITS } from "./eval-018-lib";

const PATH = "/dev/artifacts";
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const isEdge = (page: Page) => width(page) === 390 || width(page) === 1440;


async function gotoDev(page: Page): Promise<void> {
  const resp = await page.goto(PATH, { waitUntil: "load" });
  test.skip(
    (resp?.status() ?? 404) === 404,
    "/dev/artifacts 404s without ALLOW_DEV_ROUTES=1 — run the QA job to exercise it",
  );
}

/** Open `/work/<slug>` and switch the overview to "Deep dive" so the chapters are in the DOM. */

async function collect(page: Page) {
  return page.evaluate(collectDecorations, RULE_LIMITS);
}

// ---------------------------------------------------------------------------------------------------
// /dev/artifacts board (TKT-20 gate, TC-160 step 2)
// ---------------------------------------------------------------------------------------------------
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
  test.skip(!isEdge(page), "axe runs at 390 and 1440");
  await gotoDev(page);
  await axe(page);
});

test("artifacts board · EVAL-018 collector: 0 violations, 0 decorations, all 8 forms on paper (TC-160)", {
  tag: "@artifacts",
}, async ({ page }) => {
  test.skip(!isEdge(page), "EVAL-018 is measured at 390 and 1440");
  await gotoDev(page);
  await page.evaluate(() => document.fonts.ready);
  const result = await collect(page);
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
  const board = result.units.find((u) => u.unit === "section#board-artifacts");
  expect(board?.count, "the board carries no decoration").toBe(0);
  const forms = await page.locator("#board-artifacts [data-paper]").evaluateAll((els) =>
    els.map((el) => Array.from(el.classList).find((c) => c.startsWith("artifact-") && c !== "artifact-eyebrow")),
  );
  for (const form of ["artifact-insight", "artifact-hyp", "artifact-metric", "artifact-dec", "artifact-eval", "artifact-exp", "artifact-proto", "artifact-doc"]) {
    expect(forms, `${form} is on the board`).toContain(form);
  }
});

// TASK-130: the case-study deep dive (chapter Prose flat zones, ChapterNav, Show the thinking) was
// retired with the §7.3 template (Design.md Dev-128). The artifact forms above still render on this
// board; the one-pager contract lives in case-study-system.spec.ts, and decorations on every case
// study are swept by eval-018.spec.ts.
