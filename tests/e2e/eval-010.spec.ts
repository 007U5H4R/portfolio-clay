/**
 * eval-010.spec.ts (technical-plan.md §B S09.02, `@EVAL-010`) — prefers-reduced-motion honoured:
 * transform/position animations collapse to opacity-only or instant, and the page stays usable.
 * The header-collapse check and a generic no-transform-animation DOM sweep run on every public
 * route; the card hover-lift check stays scoped to `/` (the only route the hover card exists on).
 * Ask expand/panel, StoryCard and parallax component-specific checks are fixme'd until their
 * tickets (TKT-10/13/16). ShowTheThinking's reduced-motion behaviour is real now, in
 * thinking.spec.ts (TKT-21).
 *
 * TKT-48 (QA precedent: TKT-47's EVAL-008 fix): the header-collapse check previously ran on `/`
 * only, so a route whose header transition failed to collapse (e.g. a page-specific override)
 * would have gone undetected. The route list is DERIVED from the same sources `app/sitemap.ts` /
 * the TKT-47-fixed eval-008.spec.ts build theirs — never hard-coded. Same thresholds (transition
 * collapses to `none`; no element still transform/position-animates), only the iteration is
 * broader (no EV2 weakening).
 */
import { test, expect } from "./fixtures";
import { STATIC_ROUTES } from "@/app/sitemap";
import { projects } from "@/data/projects";
import { writing } from "@/data/writing";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

// Full public-route sweep set (TKT-48) — see eval-006/008 for the identical derivation.
const CASE_STUDY_ROUTES = projects
  .filter((project) => project.category === "personal")
  .map((project) => `/work/${project.slug}`);
const ESSAY_ROUTES = writing.map((essay) => `/thinking/${essay.slug}`);
const PUBLIC_ROUTES = [...STATIC_ROUTES, ...CASE_STUDY_ROUTES, ...ESSAY_ROUTES];

for (const route of PUBLIC_ROUTES) {
  test(`@EVAL-010 reduced motion: header transition collapses · ${route}`, {
    tag: "@EVAL-010",
  }, async ({ page, withReducedMotion }) => {
    test.skip(width(page) !== 1440, "compaction reduced-motion check runs at w1440 (fine pointer)");
    await withReducedMotion(page);
    await page.goto(route, { waitUntil: "load" });

    // Header transition-property collapses to none under reduced motion.
    const transitionProperty = await page
      .locator("header")
      .first()
      .evaluate((el) => getComputedStyle(el).transitionProperty);
    expect(transitionProperty, "header transition must collapse to none under reduced motion").toBe(
      "none",
    );
  });
}

// Generic DOM sweep (mirrors eval-008's per-route offender scan): no element may still carry a
// non-instant transition/animation whose property list includes `transform` (or `all`, which
// implicitly includes it) once reduced motion is on — the global `app/globals.css` rule forces
// every transition/animation duration to 1ms, so anything still measuring above that has either
// bypassed the rule (inline `!important`, JS/WAAPI-driven motion) or is a new CSS rule that forgot
// to inherit it.
const DURATION_FLOOR_MS = 1.5; // 1ms forced floor + sub-ms rounding tolerance

for (const route of PUBLIC_ROUTES) {
  test(`@EVAL-010 reduced motion: no transform/position animation survives · ${route}`, {
    tag: "@EVAL-010",
  }, async ({ page, withReducedMotion }) => {
    test.skip(width(page) !== 1440, "generic reduced-motion sweep runs once per route at w1440");
    await withReducedMotion(page);
    await page.goto(route, { waitUntil: "load" });

    const offenders = await page.evaluate((floorMs) => {
      const toMs = (raw: string) => {
        const v = parseFloat(raw);
        if (!Number.isFinite(v)) return 0;
        return raw.trim().endsWith("ms") ? v : v * 1000;
      };
      const out: { tag: string; cls: string; kind: string; durationMs: number }[] = [];
      document.querySelectorAll("*").forEach((el) => {
        const style = getComputedStyle(el);

        const props = style.transitionProperty.split(",").map((s) => s.trim());
        const durations = style.transitionDuration.split(",").map((s) => s.trim());
        props.forEach((prop, i) => {
          if (prop !== "transform" && prop !== "all" && prop !== "top" && prop !== "left") return;
          const ms = toMs(durations[i % durations.length] ?? durations[0] ?? "0s");
          if (ms > floorMs) {
            out.push({ tag: el.tagName.toLowerCase(), cls: (el as HTMLElement).className?.toString().slice(0, 60) ?? "", kind: `transition:${prop}`, durationMs: ms });
          }
        });

        if (style.animationName !== "none") {
          const animDurations = style.animationDuration.split(",").map((s) => s.trim());
          const ms = toMs(animDurations[0] ?? "0s");
          if (ms > floorMs) {
            out.push({ tag: el.tagName.toLowerCase(), cls: (el as HTMLElement).className?.toString().slice(0, 60) ?? "", kind: `animation:${style.animationName}`, durationMs: ms });
          }
        }
      });
      return out;
    }, DURATION_FLOOR_MS);

    expect(
      offenders,
      `transform/position animation still active under reduced motion:\n${JSON.stringify(offenders, null, 2)}`,
    ).toEqual([]);
  });
}

test("@EVAL-010 reduced motion: card hover does not lift (/)", {
  tag: "@EVAL-010",
}, async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 1440, "hover reduced-motion check runs at w1440 (fine pointer)");
  await withReducedMotion(page);
  await page.goto("/", { waitUntil: "load" });

  // Card hover must not translate (transform-animate) under reduced motion.
  const card = page.locator('a[href="/work/teachspark"]').first();
  await card.scrollIntoViewIfNeeded();
  const before = await card.boundingBox();
  await card.hover();
  await page.waitForTimeout(300);
  const after = await card.boundingBox();
  expect(before && after, "card must be laid out").toBeTruthy();
  expect(
    Math.abs(after!.y - before!.y),
    "card must not lift under reduced motion",
  ).toBeLessThan(1);
});

// Ask expand/panel + StoryCard + parallax reduced-motion checks arrive with their components
// (TKT-10/13/16). ShowTheThinking's is real now — see thinking.spec.ts (TKT-21).
test.fixme("@EVAL-010 reduced motion: Ask / story / parallax collapse (TKT-10/13/16)", {
  tag: "@EVAL-010",
}, async () => {});
