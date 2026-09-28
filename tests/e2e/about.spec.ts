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
// AboutHero — TASK-117 (Tushar's About hero spec 2026-09-28, which superseded the TKT-86 hero): h1
// narrative, no draft labels, derived stats card, pinned philosophy note, polaroid, Venn notebook;
// the scene is TKT-95's opener above (Dev-24) — one scene <img>, never inside the hero.
// ---------------------------------------------------------------------------
test("AboutHero renders the spec copy, the stats card, the quote note, the polaroid and the Venn; the scene renders once, in the opener", async ({
  page,
}) => {
  await page.goto("/about", { waitUntil: "load" });

  const heroSection = page.locator('section[aria-labelledby="about-hero-heading"]');
  await expect(heroSection.locator(".ahero-eyebrow")).toHaveText(/About\s+Senior Product Manager/);
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toContainText("I started with machines.");
  await expect(h1).toContainText("Then systems. Then people.");
  await expect(h1).toContainText("Now, intelligent products.");
  // Spec §4: the culminating line is terracotta (rust), the first two navy.
  const [nowColour, lineColour] = await Promise.all([
    h1.locator(".ahero-now").evaluate((el) => getComputedStyle(el).color),
    h1.locator(".ahero-line").first().evaluate((el) => getComputedStyle(el).color),
  ]);
  expect(nowColour).not.toBe(lineColour);

  // Stats card (derived from data/experience.ts + data/impact.ts — see about-hero-data.ts).
  const stats = heroSection.getByRole("list", { name: "Three quick facts" });
  await expect(stats.getByRole("listitem")).toHaveCount(3);
  await expect(stats.getByRole("listitem").nth(0)).toContainText("10+");
  await expect(stats.getByRole("listitem").nth(0)).toContainText("years building products");
  await expect(stats.getByRole("listitem").nth(1)).toContainText("3");
  await expect(stats.getByRole("listitem").nth(1)).toContainText("industries — physical → cloud → AI");
  await expect(stats.getByRole("listitem").nth(2)).toContainText("∞");
  await expect(stats.getByRole("listitem").nth(2)).toContainText("curiosity");
  await expect(heroSection).toContainText("counted from 2016 — the “+” is because the American Express role is still open");

  // Pull-quote on the pinned note, with its (sr-only) source.
  const quote = heroSection.locator('[data-paper="index"] blockquote[data-hand="quote"]');
  await expect(quote).toContainText("I build at the intersection of people, products and intelligent systems.");

  // Polaroid (manifest `polaroid-sunrise`) + its caption; the Venn is a labelled figure.
  const polaroid = heroSection.locator('figure[data-illustration="polaroid-sunrise"]');
  await expect(polaroid.locator("img")).toHaveAttribute("alt", /^Illustration of a watercolour sunrise/);
  await expect(polaroid.locator("figcaption")).toHaveText("Bigger problems. Brighter mornings.");
  await expect(heroSection.getByRole("img", { name: /Venn diagram: People, Products and Intelligent Systems/ })).toHaveCount(1);
  for (const item of ["Better tools", "More capable people", "A more thoughtful future"]) {
    await expect(heroSection.locator("ul.sr-only")).toContainText(item);
  }

  // TKT-95 (EXE-18) + Dev-24: `scene-about` renders exactly once, as the opener's <img> with the
  // manifest alt — never inside the hero section, never as caption text. The hero holds exactly two
  // images: the polaroid and the decorative sprig (alt="").
  await expect(heroSection.locator("img")).toHaveCount(2);
  await expect(heroSection.locator('[data-decor="collage"] img')).toHaveAttribute("alt", "");
  await expect(heroSection.getByText(SCENE_ABOUT_ALT)).toHaveCount(0);
  await expect(page.locator(`main img[alt="${SCENE_ABOUT_ALT}"]`)).toHaveCount(1);
  await expect(page.locator('[data-opener="scene-about"] img')).toHaveAttribute("alt", SCENE_ABOUT_ALT);

  // No proof-tile stack (home Hero's former "AI Products / People / Progress" tiles, removed at TSK-38).
  await expect(heroSection.getByText("AI Products", { exact: true })).toHaveCount(0);
  await expect(heroSection.getByText("Progress", { exact: true })).toHaveCount(0);
});

test("TASK-117: the hero shows no draft label (spec §5) — other sections keep theirs", async ({ page }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "markup is width-independent; checked at 390 and 1440");
  await page.goto("/about", { waitUntil: "load" });
  const heroSection = page.locator('section[aria-labelledby="about-hero-heading"]');
  await expect(heroSection.locator(".draft-tag")).toHaveCount(0);
  await expect(heroSection.getByText(/draft|pending sign-off/i)).toHaveCount(0);
  await expect(page.locator("#journey .draft-tag")).toHaveCount(1); // untouched outside the hero
});

test("Dev-10: the DRAFT subline is aria-hidden — in the DOM, not in the accessibility tree", async ({ page }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "a11y-tree check runs at 390 and 1440");
  await page.goto("/about", { waitUntil: "load" });

  const heroSection = page.locator('section[aria-labelledby="about-hero-heading"]');
  const sub = heroSection.locator('[data-decor="annotation"]', { hasText: "Same curiosity → bigger problems." });
  await expect(sub).toHaveCount(1);
  await expect(sub).toHaveAttribute("aria-hidden", "true");
  await expect(sub).toBeVisible();
  // Not exposed to assistive tech: the accessible snapshot of the hero never contains the line.
  const snapshot = await heroSection.ariaSnapshot();
  expect(snapshot).not.toContain("Same curiosity");
  expect(snapshot).toContain("I started with machines.");
});

test("AboutHero layout: stats 3-up at every width; ≥ 900 two columns (collage right), < 900 one column in spec §24 order", async ({
  page,
}) => {
  await page.goto("/about", { waitUntil: "load" });
  const items = page.getByRole("list", { name: "Three quick facts" }).getByRole("listitem");
  const [a, b, c] = await Promise.all([0, 1, 2].map((i) => items.nth(i).boundingBox()));
  expect(a && b && c).toBeTruthy();
  expect(Math.abs(a!.y - c!.y), "three stats in one row").toBeLessThan(a!.height / 2);

  const box = async (sel: string) => (await page.locator(sel).first().boundingBox())!;
  const stats = await box(".ahero-stats");
  const quote = await box(".ahero-quote");
  const polaroid = await box(".ahero-polaroid");
  const notebook = await box(".ahero-notebook");
  const personal = await box(".ahero-personal");
  const h1 = await box(".ahero-h1");
  if (width(page) < 900) {
    // eyebrow → h1 → subline → stats → quote → polaroid → notebook → personal note
    expect(stats.y, "stats under the h1").toBeGreaterThan(h1.y + h1.height - 1);
    expect(quote.y, "quote stacks below the stats card").toBeGreaterThan(stats.y + stats.height - 1);
    expect(polaroid.y, "polaroid below the quote").toBeGreaterThan(quote.y);
    expect(notebook.y, "notebook not above the polaroid").toBeGreaterThanOrEqual(polaroid.y - 40);
    expect(personal.y, "personal note last").toBeGreaterThan(Math.max(notebook.y + notebook.height, polaroid.y + polaroid.height) - 1);
  } else {
    expect(quote.x, "quote sits beside the stats card").toBeGreaterThan(stats.x + stats.width - 1);
    expect(personal.y, "personal note under the stats card").toBeGreaterThan(stats.y + stats.height - 1);
  }
});

test("TASK-117: no horizontal overflow and no overlapping text in the hero", async ({ page }) => {
  await page.goto("/about", { waitUntil: "load" });
  const hero = page.locator('section[aria-labelledby="about-hero-heading"]');
  await hero.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1400); // entrance done
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "no horizontal page scroll").toBeLessThanOrEqual(0);

  // Text blocks never intersect each other (rotated paper may overlap paper, never text over text).
  const overlaps = await hero.evaluate((section) => {
    const sel = ".ahero-eyebrow, .ahero-h1, .ahero-sub, .ahero-stat-list, .ahero-how, .ahero-personal, .ahero-quote blockquote, .ahero-polaroid-cap, .ahero-venn, .ahero-checklist, .ahero-still";
    const els = Array.from(section.querySelectorAll(sel));
    const rects = els.map((el) => ({ el: el.className.toString() || el.tagName, r: el.getBoundingClientRect() }));
    const out: string[] = [];
    for (let i = 0; i < rects.length; i++)
      for (let j = i + 1; j < rects.length; j++) {
        const p = rects[i]!.r;
        const q = rects[j]!.r;
        const ix = Math.min(p.right, q.right) - Math.max(p.left, q.left);
        const iy = Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top);
        if (ix > 2 && iy > 2) out.push(`${rects[i]!.el} × ${rects[j]!.el}`);
      }
    return out;
  });
  expect(overlaps).toEqual([]);
});

test("@EVAL-010 TASK-117 reduced motion: every hero piece is shown at once, nothing transitions", {
  tag: "@EVAL-010",
}, async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "checked at 390 and 1440");
  await withReducedMotion(page);
  await page.goto("/about", { waitUntil: "load" });
  const pieces = page.locator('section[aria-labelledby="about-hero-heading"] [data-enter]');
  expect(await pieces.count()).toBeGreaterThanOrEqual(9);
  const states = await pieces.evaluateAll((els) =>
    els.map((el) => {
      const cs = getComputedStyle(el);
      return { enter: el.getAttribute("data-enter"), opacity: cs.opacity, translate: cs.translate, duration: cs.transitionDuration };
    }),
  );
  for (const s of states) {
    expect(s.opacity, `${s.enter} visible`).toBe("1");
    expect(s.translate, `${s.enter} not offset`).toBe("none");
    // the global reduced-motion guard may leave a ≤ 10 ms token duration — never a visible transition
    expect(s.duration.split(",").every((d) => parseFloat(d) <= 0.01), `${s.enter} has no transition`).toBe(true);
  }
});

test("TASK-117 entrance: with motion allowed the hero pieces settle visible once in view", async ({ page }) => {
  test.skip(width(page) !== 1440, "entrance timing is width-independent; checked at 1440");
  await page.goto("/about", { waitUntil: "load" });
  const grid = page.locator(".ahero-grid");
  await grid.scrollIntoViewIfNeeded();
  await expect(grid).toHaveAttribute("data-in", "");
  await page.waitForTimeout(1300);
  const opacities = await grid.locator("[data-enter]").evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
  expect(opacities.every((o) => o === "1")).toBe(true);
});

// ---------------------------------------------------------------------------
// ProductJourney — 4 stages, reveal-only, no click interaction, gap note omitted.
// ---------------------------------------------------------------------------
test("ProductJourney renders exactly 4 stages with no click interaction and no gap note", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "stage content/count is viewport-independent; checked once at w1440");
  await page.goto("/about", { waitUntil: "load" });

  const section = page.locator("#journey");
  await expect(section.getByRole("heading", { name: "Different tools. Same curiosity." })).toBeVisible();

  const stages = section.locator("ol > li");
  await expect(stages).toHaveCount(4);
  // TKT-86: pinned paper year cards, and the Fraunces closing line with its DraftTag.
  await expect(section.locator('ol > li [data-paper="card"] [data-fastener="pin"]')).toHaveCount(4);
  await expect(section.locator(".aj-close")).toContainText("The tools changed. The curiosity didn't.");
  await expect(section.locator(".aj-close .draft-tag")).toHaveCount(1);
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

  // TKT-86 (TC-166 step 4): eight pinned index cards, each with value · label · context · kind badge
  // (Inter, never Caveat — Dev-04) · asOf · Source.
  const cards = section.locator('[data-paper="index"]');
  await expect(cards).toHaveCount(8);
  for (let i = 0; i < 8; i++) {
    const card = cards.nth(i);
    for (const part of [".aimp-value", ".aimp-label", ".aimp-ctx", ".aimp-kind"]) {
      await expect(card.locator(part)).toHaveCount(1);
    }
    await expect(card).toContainText(/as of \d{1,2} \w+ \d{4}/);
    await expect(card).toContainText("Source:");
    const badgeFont = await card.locator(".aimp-kind").evaluate((el) => getComputedStyle(el).fontFamily);
    expect(badgeFont).not.toMatch(/caveat/i);
  }
  await expect(section.getByRole("heading", { name: "From my résumé" })).toBeVisible();
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
    "journey",
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
// TKT-100 — the journey collage (Tushar direction 2026-09-26, Design.md §11 Dev-42): one aria-hidden
// collage object, content stays in the a11y tree, the range kickers sit on solid highlighter strips,
// no horizontal overflow at any width, doodles only where the 4-up grid gives them a card foot.
// ---------------------------------------------------------------------------
test("TKT-100 journey collage: one hidden decoration, content exposed, no overflow", async ({ page }) => {
  await page.goto("/about", { waitUntil: "load" });
  const section = page.locator("#journey");
  const collage = section.locator('[data-decor="collage"]');
  await expect(collage).toHaveCount(1);
  await expect(collage).toHaveAttribute("aria-hidden", "true");
  await expect(collage.locator("[data-decor]")).toHaveCount(0);
  await expect(collage.locator("img:not([alt=''])")).toHaveCount(0);

  // content paper, not decoration: heading, lead, the four cards and the closing line stay exposed
  await expect(section.getByRole("heading", { level: 2 })).toHaveText("Different tools. Same curiosity.");
  await expect(section.getByRole("heading", { level: 3 })).toHaveCount(4);
  await expect(section.getByText("The tools changed. The curiosity didn't.")).toBeVisible();

  // highlighter strips: a solid tinted background on the micro-label itself (EVAL-008 resolves against it)
  const ranges = section.locator(".aj-range[data-micro-label]");
  await expect(ranges).toHaveCount(4);
  const bgs = await ranges.evaluateAll((els) => els.map((el) => getComputedStyle(el).backgroundColor));
  for (const bg of bgs) expect(bg, "range strip must have an opaque tint").not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);

  // doodles (and their Caveat notes) only at ≥ 1025, where the cards sit 4-up
  const doodles = collage.locator(".ajc-doodle");
  await expect(doodles).toHaveCount(4);
  const shown = await doodles.evaluateAll((els) => els.filter((el) => getComputedStyle(el).display !== "none").length);
  expect(shown).toBe(width(page) >= 1025 ? 4 : 0);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "no horizontal page scroll").toBeLessThanOrEqual(0);
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

  const firstStage = page.locator("#journey ol > li").first().locator(".reveal");
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
