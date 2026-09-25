/**
 * sweep.spec.ts (`@EVAL-006 @EVAL-008 @EVAL-018`, technical-plan.md §F3 "TKT-85" S85.01/S85.02, TC-165)
 * — the Phase B gate sweep.
 *
 * Routes: `/work`, all 11 `/work/<slug>` (`ALL_PROJECT_SLUGS`), `/thinking`, all 5
 * `/thinking/<slug>` (`data/writing.ts`) = 18 routes, measured at w390 and w1440 (FANOUT-D row 85;
 * w768 / w1024 skip with the reason). Per route and width, one test asserts:
 *   - HTTP 200;
 *   - EVAL-008: no horizontal overflow, every visible control ≥ 44×44 (the fixtures' allowlist only);
 *   - EVAL-006: axe WCAG 2.1 AA — 0 critical/serious;
 *   - EVAL-018: `collectDecorations` → 0 violations (the parked list must not name a Phase B route;
 *     it is `[]`), per-unit counts pushed as a `sweep-eval-018` annotation;
 *   - console clean (the `consoleErrors` fixture: no app console errors / page errors).
 * The page is scrolled through once before measuring so every `Reveal` leaf has flipped to its
 * resting state (axe must measure resting colours, and the screenshot must not freeze pre-reveal
 * opacity 0), then a full-page screenshot is written to
 * `docs/screenshots/m-009/phase-b/<route>/<width>.png`. Every slug with a deep dive is swept a
 * second time with "Deep dive" open (chapters, artifacts, ChapterNav mounted) →
 * `phase-b/work/<slug>/deep-<width>.png`; thin slugs skip that state with the reason.
 *
 * Pairs (S85.02, EVAL-022 evidence for Stage 8): the case-study mockup
 * (`docs/redesign-mockups/m-009/case-study.html`) beside one rich (`teachspark`) and one thin
 * (`tegaki`) case study, at 1440 and 390 → `docs/screenshots/m-009/pairs/case-study-<slug>-<w>.png`
 * (mockup left, route right — plus the route with "Deep dive" open for the rich slug — every column
 * scaled to the same width). Evidence only — no assertion
 * beyond "both sides rendered"; differences are recorded by hand in docs/reports/TKT-85.md.
 */
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { ALL_PROJECT_SLUGS } from "@/lib/anchors";
import { writing } from "@/data/writing";
import { applyParked, collectDecorations, RULE_LIMITS, type ParkedEntry } from "./eval-018-lib";

const MEASURED_WIDTHS = [390, 1440];
const SHOT_ROOT = "docs/screenshots/m-009";

export const SWEEP_ROUTES: readonly string[] = [
  "/work",
  ...ALL_PROJECT_SLUGS.map((slug) => `/work/${slug}`),
  "/thinking",
  ...writing.map((essay) => `/thinking/${essay.slug}`),
];

const PARKED: ParkedEntry[] = JSON.parse(
  readFileSync(resolve(process.cwd(), "tests/e2e/eval-018-parked.json"), "utf8"),
) as ParkedEntry[];

const width = (page: Page) => page.viewportSize()?.width ?? 0;

function skipUnmeasuredWidth(page: Page): void {
  test.skip(!MEASURED_WIDTHS.includes(width(page)), "the Phase B sweep is measured at w390 and w1440 (FANOUT-D row 85)");
}

/** Scroll the whole page once so every IntersectionObserver-driven `Reveal` settles, then return to the top. */
async function settle(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y <= max; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  // Reveal transitions are ≤ 400 ms (Design.md §8); let them rest before axe / the screenshot.
  await page.waitForTimeout(600);
}

function shotPath(route: string, w: number): string {
  return `${SHOT_ROOT}/phase-b${route}/${w}.png`;
}

type Fx = {
  axe: (page: Page) => Promise<void>;
  noOverflow: (page: Page) => Promise<void>;
  minTargets: (page: Page) => Promise<void>;
};

/** The shared per-state assertions: EVAL-008, EVAL-006, EVAL-018 (+ annotation) and the screenshot. */
async function sweepChecks(page: Page, fx: Fx, route: string, label: string, shot: string): Promise<void> {
  await settle(page);
  await fx.noOverflow(page);
  await fx.minTargets(page);
  await fx.axe(page);

  const result = await page.evaluate(collectDecorations, RULE_LIMITS);
  const outcome = applyParked(route, result.violations, PARKED);
  test.info().annotations.push({
    type: "sweep-eval-018",
    description: JSON.stringify({
      route: label,
      width: width(page),
      units: result.units.map((u) => ({ unit: u.unit, count: u.count, decor: u.decor })),
    }),
  });
  const table = result.units.map((u) => `${u.unit.padEnd(44)} ${String(u.count).padStart(2)}  ${u.decor.join(",")}`).join("\n");
  expect(outcome.parked, `${label} is a Phase B route — nothing may be parked on it`).toEqual([]);
  expect(
    outcome.unparked,
    `${label} @ ${width(page)} — EVAL-018 hits:\n` +
      outcome.unparked.map((v) => `  [${v.rule}] ${v.unit}: ${v.detail}`).join("\n") +
      `\nper-unit counts:\n${table}`,
  ).toEqual([]);

  mkdirSync(dirname(shot), { recursive: true });
  await page.screenshot({ path: shot, fullPage: true, animations: "disabled" });
}

for (const route of SWEEP_ROUTES) {
  test(
    `@EVAL-006 @EVAL-008 @EVAL-018 sweep ${route} · 200, no overflow, 44px targets, axe, decoration budget, console clean`,
    { tag: ["@EVAL-006", "@EVAL-008", "@EVAL-018"] },
    async ({ page, axe, noOverflow, minTargets, consoleErrors }) => {
      skipUnmeasuredWidth(page);
      void consoleErrors; // opt-in: any console error / page error fails this test at teardown
      test.setTimeout(90_000);

      const resp = await page.goto(route, { waitUntil: "load" });
      expect(resp?.status(), `${route} must be a live route`).toBe(200);
      await sweepChecks(page, { axe, noOverflow, minTargets }, route, route, shotPath(route, width(page)));
    },
  );
}

// The case study opens on the 30-sec view; the chapters, artifacts and ChapterNav only mount once
// "Deep dive" is chosen — sweep that state too for every slug that has one (thin slugs skip).
for (const slug of ALL_PROJECT_SLUGS) {
  const route = `/work/${slug}`;
  test(
    `@EVAL-006 @EVAL-008 @EVAL-018 sweep ${route} (deep dive open) · no overflow, 44px targets, axe, decoration budget, console clean`,
    { tag: ["@EVAL-006", "@EVAL-008", "@EVAL-018"] },
    async ({ page, axe, noOverflow, minTargets, consoleErrors }) => {
      skipUnmeasuredWidth(page);
      void consoleErrors;
      test.setTimeout(90_000);

      const resp = await page.goto(route, { waitUntil: "load" });
      expect(resp?.status(), `${route} must be a live route`).toBe(200);
      const deep = page.locator('button[role="radio"][data-view="deep"]');
      test.skip((await deep.count()) === 0, `${slug} is a thin case study — no deep dive to open`);
      await deep.click();
      await expect(deep).toHaveAttribute("aria-checked", "true");
      await page.locator("#deep").waitFor({ state: "attached" });
      await sweepChecks(page, { axe, noOverflow, minTargets }, route, `${route} (deep)`, `${SHOT_ROOT}/phase-b${route}/deep-${width(page)}.png`);
    },
  );
}

// ------------------------------------------------------------------------------------ mockup pairs

const PAIR_SLUGS = [
  { slug: "teachspark", kind: "rich" },
  { slug: "tegaki", kind: "thin" },
] as const;
const MOCKUP = pathToFileURL(resolve(process.cwd(), "docs/redesign-mockups/m-009/case-study.html")).href;

async function fullPagePng(page: Page, url: string, isMockup: boolean, openDeep = false): Promise<Buffer> {
  await page.goto(url, { waitUntil: "load" });
  if (openDeep) {
    await page.locator('button[role="radio"][data-view="deep"]').click();
    await page.locator("#deep").waitFor({ state: "attached" });
  }
  if (!isMockup) await settle(page);
  else await page.evaluate(() => document.fonts.ready);
  return page.screenshot({ fullPage: true, animations: "disabled" });
}

for (const { slug, kind } of PAIR_SLUGS) {
  test(`pair · case-study mockup beside /work/${slug} (${kind}) — Stage 8 evidence`, async ({ page, browser }) => {
    skipUnmeasuredWidth(page);
    test.setTimeout(120_000);
    const w = width(page);

    // The mockups carry no `<meta name="viewport">`, so the w390 project's mobile emulation would
    // lay them out at 980 px (a shrunken desktop). Render the mockup in a non-mobile context at the
    // same width so its own @media rules apply — a fair 390 comparison.
    const mockCtx = await browser.newContext({ viewport: { width: w, height: 900 }, isMobile: false, hasTouch: false });
    const mockPng = await fullPagePng(await mockCtx.newPage(), MOCKUP, true);
    await mockCtx.close();
    const routePng = await fullPagePng(page, `/work/${slug}`, false);
    // The mockup draws the chapters under the toggle, so the rich pair adds the route with "Deep
    // dive" open as a third column; the thin slug has no deep dive (labelled "Deep dive coming").
    const deepPng = kind === "rich" ? await fullPagePng(page, `/work/${slug}`, false, true) : null;

    // Compose side by side in a scratch page; each column is scaled to ≤ 720 px so a 1440 pair
    // stays under Chromium's 16 384 px screenshot bound.
    const col = Math.min(w, 720);
    const cols: [string, Buffer][] = [
      [`mockup · case-study.html @ ${w}`, mockPng],
      [`route · /work/${slug} (${kind}, default 30-sec) @ ${w}`, routePng],
      ...(deepPng ? ([[`route · /work/${slug} (deep dive open) @ ${w}`, deepPng]] as [string, Buffer][]) : []),
    ];
    const ctx = await browser.newContext({ viewport: { width: (col + 16) * cols.length + 16, height: 800 }, isMobile: false, hasTouch: false });
    const composer = await ctx.newPage();
    const img = (buf: Buffer) => `data:image/png;base64,${buf.toString("base64")}`;
    await composer.setContent(`<!doctype html><html><head><meta name="viewport" content="width=device-width"></head><body style="margin:0;background:#ddd;font:600 14px system-ui">
      <div style="display:flex;gap:16px;padding:16px;align-items:flex-start">
        ${cols
          .map(([cap, buf]) => `<figure style="margin:0;width:${col}px"><figcaption style="padding:0 0 8px">${cap}</figcaption><img style="width:${col}px;display:block" src="${img(buf)}"></figure>`)
          .join("")}
      </div></body></html>`);
    await composer.waitForFunction(() => Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0));
    const path = `${SHOT_ROOT}/pairs/case-study-${slug}-${w}.png`;
    mkdirSync(dirname(path), { recursive: true });
    await composer.screenshot({ path, fullPage: true });
    await ctx.close();

    expect(mockPng.length, "mockup rendered").toBeGreaterThan(10_000);
    expect(routePng.length, "route rendered").toBeGreaterThan(10_000);
  });
}
