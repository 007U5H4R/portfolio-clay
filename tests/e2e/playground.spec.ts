/**
 * playground.spec.ts (TKT-44, M-006) — the `/playground` hero + 4-tile grid.
 *
 * Runs in all four viewport projects (w390/w768/w1024/w1440, playwright.config.ts):
 *   AC1 — 4 tiles, copy from CONTENT_INVENTORY §6, NEVER Slag City / Mock Interview / Game.
 *   AC2 — each tile is an external link (`target=_blank rel=noopener`), accessible name includes
 *         "opens in new tab", ≥44×44, visible focus ring.
 *   AC3 — (covered by the global EVAL-011 crawler sweep once `/playground` is in
 *         tests/e2e/routes.json's `static` list — see eval-011-dead-controls.spec.ts) the 4 live
 *         URLs resolve HEAD 200-399. This file adds its own direct check of the same 4 URLs so the
 *         result is legible without cross-referencing the crawler's JSON report.
 *   AC4 — axe clean; no overflow at 390/768/1024/1440.
 *   a11y scar guard (post-TKT-43) — every tile title is reachable as a level-2 heading, with no
 *         skipped heading level (h1 → h2, no h3 in between).
 * Plus the screenshot pack (TDD gate item 7).
 */
import { test, expect } from "./fixtures";
import { cinematicPortfolio, dinoArcadePwa, pratyasa, tegaki } from "@/data/projects";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

// Fixed order + tone, mirrors components/playground/PlaygroundGrid.tsx's ENTRIES exactly.
const TILES = [
  { project: pratyasa, tone: "butter" },
  { project: tegaki, tone: "peach" },
  { project: dinoArcadePwa, tone: "blush" },
  { project: cinematicPortfolio, tone: "mint" },
] as const;

// Playwright's `toContainText` string form is case-INsensitive, so a bare "Game" would false-
// positive against dino-arcade-pwa's own legitimate lowercase "no game data ships or uploads"
// tagline — a case-sensitive whole-word regex avoids that collision. "ROM/BIOS" (the excluded
// detail as a compound phrase) does not collide with dino-arcade-pwa's own legitimate "BYO-ROM"
// framing (CONTENT_INVENTORY §6: BYO-ROM is the real product's load-bearing description;
// "ROM/BIOS files" is the excluded Game project's internal detail, never this one's).
const FORBIDDEN_PATTERNS: (string | RegExp)[] = ["Slag City", "Mock Interview", /\bGame\b/, "ROM/BIOS"];

// ---------------------------------------------------------------------------
// PlaygroundHero — h1 verbatim.
// ---------------------------------------------------------------------------
test("PlaygroundHero renders the verbatim headline", async ({ page }) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  await page.goto("/playground", { waitUntil: "load" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Small experiments. Big questions.",
  );
});

// ---------------------------------------------------------------------------
// PlaygroundGrid — exactly 4 tiles, §6 copy, no excluded-project text anywhere on the page.
// ---------------------------------------------------------------------------
test("PlaygroundGrid renders exactly the 4 sanctioned tiles with their live URL + tagline, no excluded projects", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "content/count is viewport-independent; checked once at w1440");
  await page.goto("/playground", { waitUntil: "load" });

  const main = page.locator("#main");
  const tiles = main.locator("ul > li > a");
  await expect(tiles).toHaveCount(4);

  for (const { project } of TILES) {
    expect(project.links.live, `${project.slug} must carry a links.live URL`).toBeTruthy();
    const tile = main.locator(`a[href="${project.links.live}"]`);
    await expect(tile).toBeVisible();
    await expect(tile).toContainText(project.name);
    await expect(tile).toContainText(project.tagline);
  }

  for (const bad of FORBIDDEN_PATTERNS) {
    await expect(main).not.toContainText(bad);
  }
});

// ---------------------------------------------------------------------------
// External-link a11y: target/rel, accessible name includes "opens in new tab", ≥44×44.
// ---------------------------------------------------------------------------
test("every tile is a real external link: target=_blank, rel=noopener, accessible name includes 'opens in new tab'", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "link attributes are viewport-independent; checked once at w1440");
  await page.goto("/playground", { waitUntil: "load" });

  // Scoped to #main: cinematic-portfolio's live URL is also linked elsewhere on the page (the
  // Footer's "Previous portfolio" ExternalLink reuses the same href) — unscoped, the two would
  // collide under Playwright's strict-mode single-element resolution.
  const main = page.locator("#main");
  for (const { project } of TILES) {
    const tile = main.locator(`a[href="${project.links.live}"]`);
    await expect(tile).toHaveAttribute("target", "_blank");
    const rel = await tile.getAttribute("rel");
    expect(rel, `${project.slug} tile rel must include noopener`).toContain("noopener");
    await expect(tile).toHaveAccessibleName(/opens in new tab/i);

    const box = await tile.boundingBox();
    expect(box?.width ?? 0, `${project.slug} tile width`).toBeGreaterThanOrEqual(44);
    expect(box?.height ?? 0, `${project.slug} tile height`).toBeGreaterThanOrEqual(44);
  }
});

test("min-target sweep (≥44×44) and visible focus ring", async ({ page, minTargets, keyboardOnly }) => {
  await page.goto("/playground", { waitUntil: "load" });
  await minTargets(page);
  if (width(page) === 1440) {
    await keyboardOnly(page, { tabs: 8 });
  }
});

// ---------------------------------------------------------------------------
// a11y regression guard (TKT-43 scar): tile titles must be real, reachable level-2 headings, not
// just h3-styled spans — and the outline must go h1 -> h2 with nothing skipped in between.
// ---------------------------------------------------------------------------
test("every tile title is reachable as a level-2 heading, with no skipped heading level", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "heading structure is viewport-independent; checked once at w1440");
  await page.goto("/playground", { waitUntil: "load" });

  const main = page.locator("#main");
  await expect(main.getByRole("heading", { level: 1 })).toHaveText(
    "Small experiments. Big questions.",
  );

  const tileHeadings = main.getByRole("heading", { level: 2 });
  await expect(tileHeadings).toHaveCount(4);
  for (const { project } of TILES) {
    await expect(tileHeadings.filter({ hasText: project.name })).toHaveCount(1);
  }

  // No h3 (or deeper) anywhere on the page — h1 -> h2 is the whole outline here.
  await expect(main.getByRole("heading", { level: 3 })).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// AC3 — the 4 live URLs resolve (HEAD 200-399). Direct check alongside the global EVAL-011
// crawler sweep (which now also covers /playground via tests/e2e/routes.json).
// ---------------------------------------------------------------------------
test(
  "@EVAL-011 the 4 live experiment URLs resolve (HEAD 200-399)",
  { tag: "@EVAL-011" },
  async ({ page }) => {
    test.skip(width(page) !== 1440, "external resolution checked once at w1440");
    for (const { project } of TILES) {
      const url = project.links.live!;
      const res = await page.request.head(url).catch(() => page.request.get(url));
      expect(
        res.status(),
        `${project.slug} live URL ${url} must resolve HEAD/GET 200-399`,
      ).toBeGreaterThanOrEqual(200);
      expect(res.status()).toBeLessThan(400);
    }
  },
);

// ---------------------------------------------------------------------------
// No-overflow (all 4 widths) + responsive screenshot pack.
// ---------------------------------------------------------------------------
test("/playground · no-overflow + screenshot", async ({ page, noOverflow }) => {
  await page.goto("/playground", { waitUntil: "load" });
  await noOverflow(page);
  await page.screenshot({
    path: `docs/screenshots/playground/playground-${width(page)}.png`,
    fullPage: true,
    animations: "disabled",
  });
});

// ---------------------------------------------------------------------------
// axe wcag2.1 AA at 390 & 1440.
// ---------------------------------------------------------------------------
test("/playground · axe wcag2.1 AA", { tag: "@EVAL-006" }, async ({ page, axe }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "axe runs at 390 and 1440");
  await page.goto("/playground", { waitUntil: "load" });
  await axe(page);
});
