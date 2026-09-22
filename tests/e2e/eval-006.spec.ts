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
import { test } from "./fixtures";
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
