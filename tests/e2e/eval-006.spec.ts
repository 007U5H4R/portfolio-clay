/**
 * eval-006.spec.ts (technical-plan.md §B S09.02, `@EVAL-006`) — axe-core WCAG 2.1 AA sweep over
 * every route in routes.json at 390 and 1440 (0 critical/serious). Live now for the four public
 * routes; the QA-only /dev/primitives board is added when ALLOW_DEV_ROUTES is set (its own start
 * command). Open MobileMenu / AskPanel axe states are covered where those components exist
 * (MobileMenu in tracer.spec; AskPanel arrives at TKT-10 and is fixme'd below).
 *
 * Each test title carries the literal `@EVAL-0xx` token so it surfaces in `playwright test --list`.
 * The `{ tag }` option is kept as well, so `--grep @EVAL-006` and the JSON-reporter tag mapping
 * (scripts/eval.ts) both keep working.
 */
import { test } from "./fixtures";
import { STATIC_ROUTES, DEV_ROUTES } from "./routes";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

const ROUTES = [...STATIC_ROUTES, ...(process.env.ALLOW_DEV_ROUTES ? DEV_ROUTES : [])];

for (const route of ROUTES) {
  test(`@EVAL-006 axe WCAG2.1AA clean · ${route}`, { tag: "@EVAL-006" }, async ({ page, axe }) => {
    test.skip(width(page) !== 390 && width(page) !== 1440, "axe runs at 390 and 1440 (EVAL-006)");
    await page.goto(route, { waitUntil: "load" });
    await axe(page);
  });
}

// AskPanel open-state axe — the panel is built at TKT-10; until then there is nothing to open.
test.fixme("@EVAL-006 axe clean with the AskPanel open (TKT-10)", { tag: "@EVAL-006" }, async () => {});
