/**
 * eval-018.spec.ts (`@EVAL-018`, technical-plan.md §F2 / S70.10; Design.md §3.2; decisions D6, TP12)
 * — the decoration budget, measured on every route at w390 and w1440.
 *
 * Routes = `routes.json` static + every `/work/<slug>` (`ALL_PROJECT_SLUGS`) + every
 * `/thinking/<slug>` (`data/writing.ts`) + `/definitely-missing` (the 404 page) + `/dev/primitives`
 * (skips, never fails, when the dev route 404s on a plain build — `ALLOW_DEV_ROUTES=1 pnpm build`
 * exercises it). Only the w390 / w1440 projects run; w768 / w1024 skip with the reason (the case's
 * `viewport` is ["390","1440"]).
 *
 * Per route: `collectDecorations` (tests/e2e/eval-018-lib.ts) runs in the page and returns the
 * per-unit table + violations; the table is pushed into `test.info().annotations` (type `eval-018`)
 * so `.eval/playwright.json` carries the real counts (`pnpm eval` summarises them in `details`).
 *
 * Parked hits (TP12): `eval-018-parked.json` = `[{ route, unit, rule, reason, ticket }]`. A hit
 * matching an entry is reported PARKED (annotation) and does not fail the test; an unmatched hit
 * fails; an entry that matches nothing fails too (stale-park guard). `/` and `/dev/primitives` never
 * carry entries. The file must be `[]` by TKT-90 (TC-175).
 *
 * The positive control (`violating fixture fails all four rules`) is deliberately **untagged**
 * (TC-127): it proves the collector on `/dev/primitives?violate=1` without ever counting as an
 * EVAL-018 case failure.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { STATIC_ROUTES } from "./routes";
import { ALL_PROJECT_SLUGS } from "@/lib/anchors";
import { writing } from "@/data/writing";
import {
  applyParked,
  collectDecorations,
  NEVER_PARKED,
  RULE_LIMITS,
  RULES,
  type CollectResult,
  type ParkedEntry,
  type Rule,
} from "./eval-018-lib";

const MEASURED_WIDTHS = [390, 1440];
const DEV_BOARD = "/dev/primitives";
const MISSING = "/definitely-missing";

/** Every route the case sweeps (S70.10). Deduped — routes.json already lists /work/teachspark. */
export const EVAL_018_ROUTES: readonly string[] = [
  ...new Set([
    ...STATIC_ROUTES,
    ...ALL_PROJECT_SLUGS.map((slug) => `/work/${slug}`),
    ...writing.map((essay) => `/thinking/${essay.slug}`),
    MISSING,
    DEV_BOARD,
  ]),
];

const PARKED: ParkedEntry[] = JSON.parse(
  readFileSync(resolve(process.cwd(), "tests/e2e/eval-018-parked.json"), "utf8"),
) as ParkedEntry[];

const width = (page: Page) => page.viewportSize()?.width ?? 0;

/** Navigate; skip (never fail) only when the dev board 404s on a non-flag build. The 404 route is expected to 404. */
async function gotoRoute(page: Page, route: string): Promise<void> {
  const resp = await page.goto(route, { waitUntil: "load" });
  const status = resp?.status() ?? 0;
  if (route === DEV_BOARD || route.startsWith(`${DEV_BOARD}?`)) {
    test.skip(status === 404, `${DEV_BOARD} 404s without ALLOW_DEV_ROUTES=1 — run the QA job to exercise it`);
  } else if (route === MISSING) {
    expect(status, `${route} must render the 404 page`).toBe(404);
  } else {
    expect(status, `${route} must be a live route`).toBe(200);
  }
  await page.evaluate(() => document.fonts.ready);
}

async function collect(page: Page): Promise<CollectResult> {
  return page.evaluate(collectDecorations, RULE_LIMITS);
}

function skipUnmeasuredWidth(page: Page): void {
  test.skip(!MEASURED_WIDTHS.includes(width(page)), "EVAL-018 is measured at w390 and w1440 only (eval-cases.json viewport)");
}

for (const route of EVAL_018_ROUTES) {
  test(`@EVAL-018 ${route} · decoration budget, Caveat, flat zones, hidden text decorations`, { tag: "@EVAL-018" }, async ({ page }) => {
    skipUnmeasuredWidth(page);
    await gotoRoute(page, route);

    const result = await collect(page);
    const outcome = applyParked(route, result.violations, PARKED);

    test.info().annotations.push({
      type: "eval-018",
      description: JSON.stringify({
        route,
        width: width(page),
        units: result.units,
        violations: result.violations,
        parked: outcome.parked.map(({ violation, entry }) => ({ ...violation, reason: entry.reason, ticket: entry.ticket })),
        stale: outcome.stale,
      }),
    });
    for (const { violation, entry } of outcome.parked) {
      test.info().annotations.push({
        type: "PARKED",
        description: `${route} · ${violation.unit} · ${violation.rule} → ${entry.ticket} (${entry.reason})`,
      });
    }

    // A parked entry for a route that never carries one is itself a violation of TP12.
    if (NEVER_PARKED.includes(route)) {
      expect(PARKED.filter((e) => e.route === route), `${route} never carries parked entries (TP12)`).toEqual([]);
    }

    const table = result.units.map((u) => `${u.unit.padEnd(44)} ${String(u.count).padStart(2)}  ${u.decor.join(",")}`).join("\n");
    expect(
      outcome.unparked,
      `${route} @ ${width(page)} — ${outcome.unparked.length} unparked EVAL-018 hit(s):\n` +
        outcome.unparked.map((v) => `  [${v.rule}] ${v.unit}: ${v.detail}`).join("\n") +
        `\nper-unit counts:\n${table}`,
    ).toEqual([]);
    expect(
      outcome.stale,
      `${route} @ ${width(page)} — stale parked entries (matched nothing; remove them):\n` +
        outcome.stale.map((e) => `  [${e.rule}] ${e.unit} (${e.ticket})`).join("\n"),
    ).toEqual([]);
  });
}

test("@EVAL-018 parked list is well-formed: known routes, known rules, never / or /dev/primitives", { tag: "@EVAL-018" }, async ({ page }) => {
  test.skip(width(page) !== 1440, "checked once at w1440");
  const ruleSet = new Set<string>(RULES);
  const problems: string[] = [];
  for (const e of PARKED) {
    if (!EVAL_018_ROUTES.includes(e.route)) problems.push(`unknown route ${e.route} (stale park)`);
    if (NEVER_PARKED.includes(e.route)) problems.push(`${e.route} never carries parked entries (TP12)`);
    if (!ruleSet.has(e.rule)) problems.push(`unknown rule "${e.rule}" for ${e.route} ${e.unit}`);
    if (!e.reason || !/^TKT-\d+$/.test(e.ticket)) problems.push(`${e.route} ${e.unit}: reason and a TKT- ticket are required`);
  }
  expect(problems, `eval-018-parked.json problems:\n${problems.join("\n")}`).toEqual([]);
});

// ---------------------------------------------------------------------------- positive control
// Untagged on purpose (TC-127): proves the collector trips every rule on the raw-markup fixture, and
// never counts as an EVAL-018 case failure.

test("violating fixture fails all four rules (positive control, /dev/primitives?violate=1)", async ({ page }) => {
  skipUnmeasuredWidth(page);
  await gotoRoute(page, `${DEV_BOARD}?violate=1`);
  // The fixture is client-rendered off `useSearchParams` (keeps the route static, TP1) — wait for it.
  await page.locator('[data-fixture="violate"]').waitFor({ state: "attached" });

  const result = await collect(page);
  const byRule = (rule: Rule) => result.violations.filter((v) => v.rule === rule && v.unit === "section#fixture-violate");

  test.info().annotations.push({ type: "eval-018-control", description: JSON.stringify(result) });

  for (const rule of RULES) {
    expect(byRule(rule).length, `fixture must trip the "${rule}" rule at least once; got:\n${JSON.stringify(result.violations, null, 2)}`).toBeGreaterThanOrEqual(1);
  }
  // §3.4 placement (fix 1): the label outside any data-paper and the quote without a cite are caveat hits.
  const caveatDetails = byRule("caveat").map((v) => v.detail);
  expect(caveatDetails.some((d) => d.includes("no [data-paper] ancestor")), `label outside data-paper must fail:\n${caveatDetails.join("\n")}`).toBe(true);
  expect(caveatDetails.some((d) => d.includes("quote has no cite")), `quote without cite must fail:\n${caveatDetails.join("\n")}`).toBe(true);
  expect(byRule("caveat").length, "bare paragraph + label + quote = 3 caveat hits").toBe(3);
  // Every hit lands on the fixture section only: the rest of the board stays clean.
  const elsewhere = result.violations.filter((v) => v.unit !== "section#fixture-violate");
  expect(elsewhere, "the fixture must not leak violations into other units").toEqual([]);
});

test("nearest-ancestor ownership: a nested chapter owns its decoration; a quote inside a flat zone is allowed (TC-127 steps 3–4)", async ({ page }) => {
  skipUnmeasuredWidth(page);
  await gotoRoute(page, DEV_BOARD);
  const result = await collect(page);
  const outer = result.units.find((u) => u.unit === "section#board-deepdive");
  const inner = result.units.find((u) => u.unit === "section#board-chapter");
  expect(outer, "outer deep-dive section must be a unit").toBeDefined();
  expect(inner, "nested chapter section must be a unit").toBeDefined();
  expect(outer!.count, "outer section must not re-count the chapter's decoration").toBe(0);
  expect(inner!.count).toBe(1);
  expect(inner!.flatViolations, "a data-hand=quote blockquote inside [data-flat] is content, not decoration").toBe(0);
  expect(inner!.caveatViolations).toBe(0);
});
