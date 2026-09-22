/**
 * about.spec.ts (TSK-23, TKT-40, M-006) — `/about`'s first two sections: `AboutHero` (flat hero
 * variant) and `ProductJourney` (decorative reduced-scale connector line, 4 stages, reveal-only).
 *
 * Each viewport project (w390/w768/w1024/w1440, playwright.config.ts) runs this whole file once,
 * so a plain `noOverflow`/`minTargets` assertion below already covers all four widths without an
 * explicit width loop — same pattern eval-008.spec.ts uses. `axe` and the reduced-motion checks are
 * viewport-independent, so they run once each at 390 and 1440 via a `width()` skip, matching
 * eval-006.spec.ts / eval-010.spec.ts.
 *
 *   @EVAL-008 — no horizontal overflow at 390/768/1024/1440; every control ≥44×44.
 *   @EVAL-006 — axe WCAG2.1AA clean at 390 and 1440.
 *   @EVAL-010 — reduced motion: ProductJourney's `Reveal` stages collapse to opacity-only, no
 *               transform (the header/card-hover reduced-motion checks already live in
 *               eval-010.spec.ts; this is ProductJourney's own, new with this ticket).
 *
 * TSK-24 (capability clusters + Impact), TKT-41 (`ExperienceTimeline`) and TKT-42 (Awards/Research/
 * Education + About OG) extend `/about` later — this file only exercises what TSK-23 ships.
 */
import { test, expect } from "./fixtures";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

// ---------------------------------------------------------------------------
// AboutHero — flat hero variant: headline, bio, avatar. No FloatingTiles, no Annotation.
// ---------------------------------------------------------------------------
test("AboutHero renders the flat headline, bio, and avatar — no floating tiles", async ({ page }) => {
  await page.goto("/about", { waitUntil: "load" });

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Senior Product Manager. Product Thinker · AI Builder · Problem Solver.",
  );

  // The bio paragraph traces to CONTENT_INVENTORY §4.1 and omits "AI Product Manager" (brief AC1).
  const heroSection = page.locator('section[aria-labelledby="about-hero-heading"]');
  const bio = heroSection.locator("p").first();
  await expect(bio).toContainText("7+ years");
  await expect(bio).toContainText("cloud-native, AI, and data-driven products across GCP and AWS");
  await expect(page.locator("body")).not.toContainText("AI Product Manager");

  // Avatar reused from the home Hero (same alt text, single source of truth in lib/site.ts).
  await expect(page.getByRole("img", { name: "Clay illustration of Tushar Pathak at a laptop" })).toBeVisible();

  // No FloatingTiles (home Hero's "AI Products / People / Progress" 3-tile proof stack) on /about —
  // the flat variant omits it entirely (AboutHero.tsx does not import FloatingTiles).
  await expect(heroSection.getByText("AI Products", { exact: true })).toHaveCount(0);
  await expect(heroSection.getByText("Progress", { exact: true })).toHaveCount(0);
});

test("AboutHero's bio measure stays within the ≤600px cap", async ({ page }) => {
  test.skip(width(page) !== 1440, "measure cap is a max-width, checked once at the widest viewport");
  await page.goto("/about", { waitUntil: "load" });
  const heroSection = page.locator('section[aria-labelledby="about-hero-heading"]');
  const bio = heroSection.locator("p").first();
  const box = await bio.boundingBox();
  expect(box?.width ?? 0, "AboutHero bio paragraph width").toBeLessThanOrEqual(600);
});

// ---------------------------------------------------------------------------
// ProductJourney — 4 stages, reveal-only, no click interaction, gap note omitted.
// ---------------------------------------------------------------------------
test("ProductJourney renders exactly 4 stages with no click interaction and no gap note", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "stage content/count is viewport-independent; checked once at w1440");
  await page.goto("/about", { waitUntil: "load" });

  const section = page.locator("#product-journey");
  await expect(section.getByRole("heading", { name: "The product journey" })).toBeVisible();

  const stages = section.locator("ol > li");
  await expect(stages).toHaveCount(4);
  await expect(stages.nth(0)).toContainText("Physical / enterprise");
  await expect(stages.nth(1)).toContainText("Cloud & data");
  await expect(stages.nth(2)).toContainText("AI-enabled");
  await expect(stages.nth(3)).toContainText("AI-native");

  // Reveal-only: no click handlers, no StoryCard, no hash — that is TKT-41's ExperienceTimeline.
  await expect(section.locator("button")).toHaveCount(0);
  await expect(section.locator("a")).toHaveCount(0);
  await expect(page).not.toHaveURL(/#/);

  // M-006 default: the 2019–2022 gap note is omitted pending Tushar's framing (Design.md TKT-40 AC 3).
  await expect(section).not.toContainText("2019");
  await expect(section).not.toContainText("NIT Calicut");
});

// ---------------------------------------------------------------------------
// @EVAL-008 — no overflow / min targets at the current project's viewport (390/768/1024/1440).
// ---------------------------------------------------------------------------
test("@EVAL-008 /about has no horizontal overflow and every control clears 44×44", {
  tag: "@EVAL-008",
}, async ({ page, noOverflow, minTargets }) => {
  await page.goto("/about", { waitUntil: "load" });
  await noOverflow(page);
  await minTargets(page);

  if (width(page) === 390 || width(page) === 768 || width(page) === 1024 || width(page) === 1440) {
    // ProductJourney's stages are `Reveal` leaves (IntersectionObserver, fires once on first
    // intersection then disconnects) — a blind fullPage screenshot right after `goto` would freeze
    // them at their pre-reveal opacity:0 state, since the observer never sees them intersect a
    // viewport that was never scrolled. Scroll the whole page through once first so every stage's
    // `data-revealed` flips permanently, then reset to the top before the actual capture.
    await page.evaluate(async () => {
      const step = window.innerHeight;
      const max = document.documentElement.scrollHeight;
      for (let y = 0; y <= max; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(200);

    await page.screenshot({
      path: `docs/screenshots/about/${width(page)}.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
});

// ---------------------------------------------------------------------------
// @EVAL-006 — axe WCAG2.1AA clean at 390 and 1440.
// ---------------------------------------------------------------------------
test("@EVAL-006 /about axe WCAG2.1AA clean", { tag: "@EVAL-006" }, async ({ page, axe }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "axe runs at 390 and 1440 (EVAL-006)");
  await page.goto("/about", { waitUntil: "load" });
  await axe(page);
});

// ---------------------------------------------------------------------------
// @EVAL-010 — reduced motion: ProductJourney's Reveal stages collapse to opacity-only.
// ---------------------------------------------------------------------------
test("@EVAL-010 reduced motion: ProductJourney stages collapse to opacity-only, no transform", {
  tag: "@EVAL-010",
}, async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 1440, "reduced-motion CSS behaviour is viewport-independent; checked once");
  await withReducedMotion(page);
  await page.goto("/about", { waitUntil: "load" });

  const firstStage = page.locator("#product-journey ol > li").first().locator(".reveal");
  const transitionProperty = await firstStage.evaluate((el) => getComputedStyle(el).transitionProperty);
  expect(
    transitionProperty,
    "ProductJourney's Reveal must collapse its transition list to opacity-only under reduced motion",
  ).toBe("opacity");

  // The connector line and stage position must not move under reduced motion either.
  const before = await firstStage.boundingBox();
  await page.waitForTimeout(300);
  const after = await firstStage.boundingBox();
  expect(before && after, "stage must be laid out").toBeTruthy();
  expect(Math.abs((after?.y ?? 0) - (before?.y ?? 0)), "stage must not transform/move").toBeLessThan(1);
});
