/**
 * eval-006.spec.ts (technical-plan.md §B S09.02, `@EVAL-006`) — axe-core WCAG 2.1 AA sweep over
 * every public route at 390 and 1440 (0 critical/serious); the QA-only `/dev/*` boards are added
 * when ALLOW_DEV_ROUTES is set (its own start command). Open MobileMenu / AskPanel axe states are
 * covered where those components exist (MobileMenu in tracer.spec; AskPanel arrives at TKT-10 and
 * is fixme'd below).
 *
 * TKT-48 (QA precedent: TKT-47's EVAL-008 fix): the route list is DERIVED from the same sources
 * `app/sitemap.ts` composes (`STATIC_ROUTES` + personal `projects` + `writing`), never the stale
 * `tests/e2e/routes.json` static list — that file only carried 7 routes (one hard-coded case study,
 * no essays), so this sweep was silently skipping 15 of 22 public routes (10 case studies + 5
 * essays never got an axe pass). Same 0-critical/serious threshold, only the iteration is broader
 * (no EV2 weakening).
 *
 * Each test title carries the literal `@EVAL-0xx` token so it surfaces in `playwright test --list`.
 * The `{ tag }` option is kept as well, so `--grep @EVAL-006` and the JSON-reporter tag mapping
 * (scripts/eval.ts) both keep working.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";
import { DEV_ROUTES } from "./routes";
import { STATIC_ROUTES } from "@/app/sitemap";
import { projects } from "@/data/projects";
import { writing } from "@/data/writing";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

// Full public-route sweep set (TKT-48), derived the same way `app/sitemap.ts` / the TKT-47-fixed
// eval-008.spec.ts build theirs — never hard-coded, so a new case study or essay is swept
// automatically instead of silently going unchecked.
const CASE_STUDY_ROUTES = projects
  .filter((project) => project.category === "personal")
  .map((project) => `/work/${project.slug}`);
const ESSAY_ROUTES = writing.map((essay) => `/thinking/${essay.slug}`);
const PUBLIC_ROUTES = [...STATIC_ROUTES, ...CASE_STUDY_ROUTES, ...ESSAY_ROUTES];
const ROUTES = [...PUBLIC_ROUTES, ...(process.env.ALLOW_DEV_ROUTES ? DEV_ROUTES : [])];

for (const route of ROUTES) {
  test(`@EVAL-006 axe WCAG2.1AA clean · ${route}`, { tag: "@EVAL-006" }, async ({ page, axe }) => {
    test.skip(width(page) !== 390 && width(page) !== 1440, "axe runs at 390 and 1440 (EVAL-006)");
    await page.goto(route, { waitUntil: "load" });
    await axe(page);
  });
}

// AskPanel open-state axe — the panel is built at TKT-10; until then there is nothing to open.
test.fixme("@EVAL-006 axe clean with the AskPanel open (TKT-10)", { tag: "@EVAL-006" }, async () => {});

// Case-study slugs whose page renders an OverviewToggle ("30-sec" | "Deep dive"): the chapter
// sections (Chapter.tsx h2, DecisionCard.tsx h3 — QA-003's fix) do not exist in the DOM at all
// until "Deep dive" is selected (TC-076). A heading-order check against the default 30-sec view
// would trivially pass regardless of the fix, so this guard is meaningless without opening it first.
const DEEP_DIVE_SLUGS = new Set(
  projects.filter((p) => p.category === "personal" && p.overview.deepDive).map((p) => p.slug),
);

// CF-3 (M-007 carry-forward, QA-003 regression guard): axe's `wcag2a`/`wcag2aa`/`wcag21aa` tags do
// NOT include `heading-order` (it is tagged `best-practice`), so nothing above would have caught
// TKT-48's QA-003 defect (every case-study deep-dive view skipped h1 → h3, no h2) if it ever comes
// back. Run as its own axe pass (`withRules`, not `withTags` — the two are mutually exclusive on one
// AxeBuilder instance) over the same full route sweep, once per route at 1440 (heading order is a
// document-structure check, not a per-viewport one) — opening the deep-dive view first on the slugs
// that have one. Kept as an additive, separate pass — deliberately not folded into the shared `axe`
// fixture in fixtures.ts, which many other spec files reuse (including partial `include:` scoped
// checks where a subtree not starting at h1 would be a false positive) — this keeps the regression
// guard scoped to exactly what QA-003 touched.
for (const route of PUBLIC_ROUTES) {
  test(`@EVAL-006 axe heading-order clean (QA-003 regression guard) · ${route}`, { tag: "@EVAL-006" }, async ({ page }) => {
    test.skip(width(page) !== 1440, "heading-order is a document-structure check — run once per route");
    // QA-004 (TKT-48 follow-up): `/work` previously skipped h1→h3 (page h1 followed directly by the
    // ProjectCard h3s, no intervening h2). Fixed by adding an sr-only "Personal builds" h2 heading
    // the personal-builds region in app/work/page.tsx, so this route is now enforced like every
    // other. (Was a tracked `test.fixme` from the CF-3 batch; see docs/reports/carry-forwards.md.)
    await page.goto(route, { waitUntil: "load" });
    const slug = route.startsWith("/work/") ? route.slice("/work/".length) : undefined;
    if (slug && DEEP_DIVE_SLUGS.has(slug)) {
      await page.getByRole("radio", { name: "Deep dive" }).click();
      await expect(page.locator('nav[aria-label="Chapters"]')).toBeVisible();
    }
    const results = await new AxeBuilder({ page }).withRules(["heading-order"]).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}
