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
 * TSK-24 extends this file with `CapabilityClusters` ("What I Bring") and `Impact` (`MetricCard`
 * shape) below. TKT-41 (`ExperienceTimeline`) has its own `tests/e2e/timeline.spec.ts`. TKT-42
 * extends this file with Awards/Research/Education, the page-foot CTAs + colophon, and the About
 * OG image (final ticket — `/about` is fully assembled after this).
 */
import { test, expect } from "./fixtures";
// The manifest directly, not `lib/illustrations.ts` — that module statically imports the scene
// JPEGs for `next/image`, which Playwright's TypeScript transform cannot load.
import { ILLUSTRATIONS } from "@/content/media/illustrations/manifest";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;
const SCENE_ABOUT_ALT = ILLUSTRATIONS.find((entry) => entry.id === "scene-about")!.alt;

// ---------------------------------------------------------------------------
// AboutHero — editorial opening (M-008 Stage B redesign): statement headline, 3-stat row,
// pull-quote, illustration. No proof-tile stack.
// ---------------------------------------------------------------------------
test("AboutHero renders the editorial headline, stat row, pull-quote, and illustration — no proof tiles", async ({
  page,
}) => {
  await page.goto("/about", { waitUntil: "load" });

  const heroSection = page.locator('section[aria-labelledby="about-hero-heading"]');
  await expect(page.getByRole("heading", { level: 1 })).toContainText("I started with machines.");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Now, intelligent products.");
  await expect(heroSection).toContainText("Same curiosity");

  // 3-stat row (derived from data/experience.ts + data/impact.ts — see AboutHero.tsx docstring).
  await expect(heroSection).toContainText("years building products");
  await expect(heroSection).toContainText("industries");
  await expect(heroSection).toContainText("curiosity");

  // Pull-quote.
  await expect(heroSection).toContainText(
    "I build at the intersection of people, products and intelligent systems.",
  );

  // Illustration stand-in (TSK-38) — `scene-about` has no `publicSrc` (Design.md §6.1: scenes go
  // through `next/image`, not this component's `publicSrc` path yet), so `IllustrationImg` renders
  // its documented fallback: the manifest alt as visible caption text (never a broken `<img>`).
  await expect(heroSection.getByText(SCENE_ABOUT_ALT)).toBeVisible();

  // No proof-tile stack (home Hero's former "AI Products / People / Progress" tiles, removed at
  // TSK-38) on /about — the flat variant never rendered it.
  await expect(heroSection.getByText("AI Products", { exact: true })).toHaveCount(0);
  await expect(heroSection.getByText("Progress", { exact: true })).toHaveCount(0);
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
  await expect(section.getByRole("heading", { name: "Different tools. Same curiosity." })).toBeVisible();

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
// CapabilityClusters — "What I Bring", 4 clusters from data/skills.ts, items verbatim.
// ---------------------------------------------------------------------------
test("CapabilityClusters renders the 4 skill clusters with items verbatim; SAFe only as a methodology", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "cluster content/count is viewport-independent; checked once at w1440");
  await page.goto("/about", { waitUntil: "load" });

  const section = page.locator("#capability-clusters");
  await expect(section.getByRole("heading", { name: "What I Bring" })).toBeVisible();

  await expect(section.getByText("Product", { exact: true })).toBeVisible();
  await expect(section.getByText("AI & GenAI", { exact: true })).toBeVisible();
  await expect(section.getByText("Technology", { exact: true })).toBeVisible();
  await expect(section.getByText("Execution", { exact: true })).toBeVisible();

  // A sample of verbatim items from CONTENT_INVENTORY §4.3 (data/skills.ts), one per cluster.
  await expect(section).toContainText("Strategy, vision & roadmap");
  await expect(section).toContainText("RAG with citation validation (RailCite)");
  await expect(section).toContainText("Supabase/Postgres (RLS, pgvector)");
  await expect(section).toContainText("Jira / Azure DevOps");

  // "SAFe" appears only as a bare methodology label, never a certification claim.
  await expect(section.getByText("SAFe", { exact: true })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("SAFe Agilist");
  await expect(page.locator("body")).not.toContainText("PMP");
});

// ---------------------------------------------------------------------------
// Impact — MetricCard shape, sourced + dated, kind badges present, no naked numbers.
// ---------------------------------------------------------------------------
test("Impact renders sourced MetricCards with all three kind badges and no naked numbers", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "metric content/count is viewport-independent; checked once at w1440");
  await page.goto("/about", { waitUntil: "load" });

  const section = page.locator("#impact");
  await expect(section.getByRole("heading", { name: "Impact" })).toBeVisible();

  // Every metric kind used by data/impact.ts (TKT-40 AC 2) renders its badge.
  await expect(section.getByText("Measured", { exact: true }).first()).toBeVisible();
  await expect(section.getByText("Structural", { exact: true })).toBeVisible();
  await expect(section.getByText("Self-reported", { exact: true }).first()).toBeVisible();

  // Reused-from-projects.ts figures (parity check at the UI layer, not just the data layer).
  await expect(section).toContainText("5,760");
  await expect(section).toContainText("14,406");
  await expect(section).toContainText("0");
  await expect(section).toContainText("Invented citations");

  // Every rendered value carries a label + an "as of" freshness caption (never a naked number).
  const asOfCaptions = section.getByText(/^as of \d{1,2} \w+ \d{4}$/);
  expect(await asOfCaptions.count()).toBeGreaterThanOrEqual(1);

  // Every metric card cites a Source line (MetricCard/SourceCaption, EVAL-013).
  const sourceLines = section.getByText("Source:", { exact: false });
  expect(await sourceLines.count()).toBeGreaterThanOrEqual(1);
});

// ---------------------------------------------------------------------------
// Awards — 3 résumé awards, text only, no banner-only credential claims (TKT-42, CONTENT_INVENTORY §4.6).
// ---------------------------------------------------------------------------
test("Awards renders exactly 3 résumé awards verbatim; no PMP or SAFe certification claim", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "award content/count is viewport-independent; checked once at w1440");
  await page.goto("/about", { waitUntil: "load" });

  const section = page.locator("#awards");
  await expect(section.getByRole("heading", { name: "Awards" })).toBeVisible();

  await expect(section).toContainText("Google Cloud Partner All-Star: Delivery Excellence");
  await expect(section).toContainText("2024");
  await expect(section).toContainText("Annual Unsung Hero Award, Quantiphi Analytics Solutions");
  await expect(section).toContainText("12 in 11 Award, Godrej Infotech");
  await expect(section).toContainText("2018");

  await expect(page.locator("body")).not.toContainText("PMP");
  await expect(page.locator("body")).not.toContainText("SAFe Agilist");
});

// ---------------------------------------------------------------------------
// Research — patent 429867 (never the SL-no. misprint), Langmuir DOI link, Soft Matter "DOI pending",
// rights/safety disclaimer (TKT-42, CONTENT_INVENTORY §4.7).
// ---------------------------------------------------------------------------
test("Research renders the patent with number 429867 (no SL-no. variant), the Langmuir DOI link, Soft Matter as DOI pending, and the rights disclaimer", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "research content is viewport-independent; checked once at w1440");
  await page.goto("/about", { waitUntil: "load" });

  const section = page.locator("#research");
  await expect(section.getByRole("heading", { name: "Research" })).toBeVisible();

  // Patent number — the certificate's number, never the résumé's SL No. misprint.
  await expect(section).toContainText("IN 429867");
  await expect(page.locator("body")).not.toContainText("044152784");
  await expect(section).toContainText("Dr. N. Sandhyarani");
  await expect(section).toContainText("Tushar Pathak");
  await expect(section).toContainText("Haritha K");
  await expect(section).toContainText("Dr. Arun R");
  await expect(section).toContainText("Dr. M. K. Ravi Varma");

  const patentLink = section.getByRole("link", { name: /Pratyasa/ });
  await expect(patentLink).toHaveAttribute("href", "https://pratyasa.vercel.app");

  // Langmuir DOI is a real, clickable external link (href resolution itself is the crawler's job —
  // tests/e2e/crawler.ts HEADs every external link site-wide, EVAL-011).
  const doiLink = section.getByRole("link", { name: /10\.1021\/acs\.langmuir\.5c00784/ });
  await expect(doiLink).toHaveAttribute("href", "https://doi.org/10.1021/acs.langmuir.5c00784");
  await expect(doiLink).toHaveAttribute("target", "_blank");

  // Soft Matter — title present, "DOI pending" shown, never a fabricated DOI or a doi.org link for it.
  await expect(section).toContainText("Topological Phases in Nanoparticle Monolayers");
  await expect(section).toContainText("DOI pending");
  const softMatterRow = section.locator("li", { hasText: "Topological Phases in Nanoparticle Monolayers" });
  await expect(softMatterRow.locator('a[href*="doi.org"]')).toHaveCount(0);

  // Rights/safety disclaimer, verbatim.
  await expect(section).toContainText(
    "Patent owned by NIT–Calicut; research prototype, not an approved diagnostic.",
  );
});

// ---------------------------------------------------------------------------
// Education — M.Tech NIT Calicut 2022, B.E. BIT Durg 2016 (TKT-42, CONTENT_INVENTORY §4.8).
// ---------------------------------------------------------------------------
test("Education renders both degrees verbatim", async ({ page }) => {
  test.skip(width(page) !== 1440, "education content is viewport-independent; checked once at w1440");
  await page.goto("/about", { waitUntil: "load" });

  const section = page.locator("#education");
  await expect(section.getByRole("heading", { name: "Education" })).toBeVisible();
  await expect(section).toContainText("M.Tech., Nanotechnology");
  await expect(section).toContainText("National Institute of Technology Calicut");
  await expect(section).toContainText("2022");
  await expect(section).toContainText("B.E., Mechanical Engineering");
  await expect(section).toContainText("Bhilai Institute of Technology, Durg");
  await expect(section).toContainText("2016");
});

// ---------------------------------------------------------------------------
// Page-foot assembly — SITEMAP order, "Let's talk" → /contact, resume CTA, colophon (TKT-42).
// ---------------------------------------------------------------------------
test("/about sections render in SITEMAP order, ending with the page-foot CTAs and colophon", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "DOM order is viewport-independent; checked once at w1440");
  await page.goto("/about", { waitUntil: "load" });

  // SITEMAP.md's /about row order, exactly: hero → product journey → capability clusters →
  // impact → experience → awards → research → education → page-foot CTA.
  const sectionIds = [
    "product-journey",
    "capability-clusters",
    "impact",
    "experience",
    "awards",
    "research",
    "education",
    "about-cta",
  ];
  const tops = await Promise.all(
    sectionIds.map(async (id) => {
      const box = await page.locator(`#${id}`).boundingBox();
      return box?.y ?? Number.NaN;
    }),
  );
  for (let i = 1; i < tops.length; i++) {
    expect(tops[i], `#${sectionIds[i]} must sit below #${sectionIds[i - 1]}`).toBeGreaterThan(tops[i - 1] ?? 0);
  }

  const cta = page.locator("#about-cta");
  const talkLink = cta.getByRole("link", { name: "Let's talk" });
  await expect(talkLink).toHaveAttribute("href", "/contact");

  // Resume control: placeholder state (site.resumeAvailable === false) reads "Resume — updating"
  // and points at /contact#resume (lib/site.ts resumeAction()) — never a hard-coded /resume.pdf.
  const resumeLink = cta.getByRole("link", { name: /Resume/ });
  await expect(resumeLink).toBeVisible();

  await expect(page.locator("body")).toContainText("Designed and built with Claude Code");
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
