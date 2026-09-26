/**
 * home.spec.ts (technical-plan.md §B S14.02 / S14.03, `@EVAL-006 @EVAL-008 @EVAL-011 @EVAL-017`) —
 * the home assembly: the four sections in their fixed order (S16/TKT-72: the old closing-CTA section is
 * gone — the band footer closes every route), the mobile reading order at 390, the section-rhythm
 * ladder, the band's controls on `/`, and the home `/` SEO tag presence.
 *
 *   @EVAL-006 — axe clean on `/` (no critical/serious violations).
 *   @EVAL-008 — no horizontal overflow at any of the four viewports.
 *   @EVAL-011 — every band control on `/` is live (email → /contact, LinkedIn, GitHub, résumé). The
 *               CopyButton copy/fallback paths are covered on /contact (contact.spec.ts).
 *   @EVAL-017 — `/` carries its title/description/OG image tags (the full absolute-URL matrix lives
 *               in eval-017.spec.ts; this is the home-assembly smoke of the same set).
 */
import { test, expect } from "./fixtures";
import { collectDecorations, RULE_LIMITS } from "./eval-018-lib";
import { hero } from "@/data/hero";
import { resumeAction, site } from "@/lib/site";
// The manifest directly (not `lib/illustrations.ts`, whose static JPEG imports Playwright cannot load).
import { ILLUSTRATIONS } from "@/content/media/illustrations/manifest";
import { expectCopyWithinOneScroll, expectWholeScene } from "./hero-scene";

// TKT-93: the hero's SSR image is the full-bleed banner (`hero-banner`), above the copy at every width.
const HERO_BANNER_ALT = ILLUSTRATIONS.find((e) => e.id === "hero-banner")!.alt;

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

// Section vertical rhythm (Design.md §2 --section-gap ladder): 72 / 96 / 128 at mobile / tablet /
// desktop, applied as `py` on every `Section`. Tailwind breakpoints md=768, lg=1024.
const expectedSectionPadding = (w: number) => (w >= 1024 ? 128 : w >= 768 ? 96 : 72);

// ---------------------------------------------------------------------------
// S14.02 / S16 — DOM order of the four home sections (M-009 Design.md §7.1, TKT-74 S74.01:
// Hero → Featured → How-I-Think → Ask); the band footer (outside <main>) is the closing CTA, so there
// is no `#cta` section any more (TKT-72).
// ---------------------------------------------------------------------------
test("@EVAL-017 home assembles its four sections in order, then the band footer", async ({ page }) => {
  test.skip(width(page) !== 1440, "DOM order is viewport-independent; checked once at w1440");
  await page.goto("/", { waitUntil: "load" });

  const sections = page.locator("#main > section");
  await expect(sections).toHaveCount(4);

  // The hero is the first section (no id — it carries the h1); the remaining three are id'd.
  await expect(sections.nth(0).locator("h1")).toBeVisible();
  await expect(sections.nth(1)).toHaveAttribute("id", "work-featured");
  await expect(sections.nth(2)).toHaveAttribute("id", "how-i-think");
  await expect(sections.nth(3)).toHaveAttribute("id", "ask");
  await expect(page.locator("#cta")).toHaveCount(0);
  await expect(page.locator("footer.band")).toHaveCount(1);
});

// ---------------------------------------------------------------------------
// S14.02 — section-rhythm ladder: each Section's computed top padding matches the viewport token.
// (Measured on `#ask`, a `Section` primitive, since the `#cta` Section is gone — TKT-72.)
// ---------------------------------------------------------------------------
test("home sections use the 72/96/128 vertical-rhythm ladder for the current viewport", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "load" });
  const want = expectedSectionPadding(width(page));
  const paddingTop = await page
    .locator("#ask")
    .evaluate((el) => Number.parseInt(getComputedStyle(el).paddingTop, 10));
  expect(paddingTop, `#ask padding-top at ${width(page)}px`).toBe(want);
});

// ---------------------------------------------------------------------------
// S14.02 — mobile reading order at 390: hero banner → headline → CTAs → projects → How-I-Think →
// Ask → band headline (M-009 order, Design.md §7.1). Since TKT-93 (Dev-21) the hero is a full-bleed
// banner under the header with the copy block centred below it at every width; the banner is the
// manifest `hero-banner` illustration (its alt comes from the manifest, §6.1). boundingBox().y
// strictly increasing.
// ---------------------------------------------------------------------------
test("@EVAL-008 mobile visual order is monotonic top-to-bottom at 390", async ({ page }) => {
  test.skip(width(page) !== 390, "mobile reading order checked at w390");
  await page.goto("/", { waitUntil: "load" });

  const ordered = [
    page.getByAltText(HERO_BANNER_ALT),
    page.locator("h1"),
    page.getByRole("link", { name: "View my work →" }),
    page.locator("#work-featured-heading"),
    page.locator("#how-i-think-heading"),
    page.locator("#ask-heading"),
    page.locator("#band-h"),
  ];

  let previousY = -1;
  for (const locator of ordered) {
    const box = await locator.boundingBox();
    expect(box, "each ordered element must be laid out").not.toBeNull();
    expect(box!.y, `element y (${box!.y}) must be below the previous (${previousY})`).toBeGreaterThan(
      previousY,
    );
    previousY = box!.y;
  }
});

// ---------------------------------------------------------------------------
// TKT-72 AC 3 / AC 4 (TC-134, TC-136) — the band's controls on `/` are live and derived from their
// single sources: email → /contact, LinkedIn, GitHub (S5: shown while a public repo link exists),
// résumé from resumeAction() (PB5 placeholder), the DRAFT hiring line visible.
// ---------------------------------------------------------------------------
test("@EVAL-011 band footer renders its headline + live contact controls", async ({ page }) => {
  test.skip(width(page) !== 1440, "content checked once at w1440");
  await page.goto("/", { waitUntil: "load" });

  const band = page.locator("footer.band");
  await expect(band.locator("h2#band-h")).toHaveText(/^Let.s build\s*something people can use\.$/);
  await expect(band.getByRole("link", { name: site.email })).toHaveAttribute("href", "/contact");
  await expect(band.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", site.linkedin);
  await expect(band.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", site.github);
  const resume = resumeAction();
  await expect(band.getByRole("link", { name: resume.label })).toHaveAttribute("href", resume.href);
  await expect(band.getByText("Draft — pending sign-off")).toBeVisible();

  for (const path of ["/contact", resume.href.split("#")[0]!]) {
    const res = await page.request.get(path);
    expect(res.status(), `${path} must resolve 200`).toBe(200);
  }
  for (const name of ["LinkedIn", "GitHub"]) {
    const link = band.getByRole("link", { name });
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  }
});

// ---------------------------------------------------------------------------
// @EVAL-006 / @EVAL-008 — the assembled home page is axe-clean and never scrolls horizontally.
// ---------------------------------------------------------------------------
test("@EVAL-006 @EVAL-008 assembled home is accessible with no horizontal overflow", async ({
  page,
  axe,
  noOverflow,
}) => {
  await page.goto("/", { waitUntil: "load" });
  await noOverflow(page);
  await axe(page);
  // TC-136 / TC-137: axe again with the band in view (contrast is computed on what is rendered).
  await page.locator("footer.band").scrollIntoViewIfNeeded();
  await noOverflow(page);
  await axe(page, { include: "footer.band" });
});

// ---------------------------------------------------------------------------
// @EVAL-017 — home `/` carries its core SEO/OG tags (full absolute-URL matrix: eval-017.spec.ts).
// ---------------------------------------------------------------------------
test("@EVAL-017 home carries title, description and an OG image", async ({ page }) => {
  test.skip(width(page) !== 1440, "tag content is viewport-independent; checked once at w1440");
  await page.goto("/", { waitUntil: "load" });
  await expect(page).toHaveTitle(/Tushar Pathak/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /^https:\/\//);
});

// ---------------------------------------------------------------------------
// TKT-79 · TC-151 step 1 — fills alternate paper / paper-2 down the page, and every section below the
// hero opens with its torn edge as the first child (Design.md §7.1). The hero's copy block sits on
// `paper` under the banner's torn edge, so Featured (paper-2) → How-I-think (paper) → Ask (paper-2).
// ---------------------------------------------------------------------------
test("TC-151 home sections alternate paper / paper-2 and open with a torn edge", async ({ page }) => {
  test.skip(width(page) !== 1440, "fills + DOM structure are viewport-independent; checked once at w1440");
  await page.goto("/", { waitUntil: "load" });

  // Resolve the two tokens to the browser's computed colour string so the comparison round-trips.
  const tokens = await page.evaluate(() => {
    const probe = document.createElement("div");
    document.body.appendChild(probe);
    const read = (v: string) => {
      probe.style.backgroundColor = `var(${v})`;
      return getComputedStyle(probe).backgroundColor;
    };
    const out = { paper: read("--color-paper"), paper2: read("--color-paper-2") };
    probe.remove();
    return out;
  });
  expect(tokens.paper).not.toBe(tokens.paper2);

  const expected: [string, string][] = [
    ["#work-featured", tokens.paper2],
    ["#how-i-think", tokens.paper],
    ["#ask", tokens.paper2],
  ];
  for (const [selector, bg] of expected) {
    const section = page.locator(selector);
    // The fill lives on the section or its body wrapper (`.featured-body`, `.ask-section-body`), or
    // as a gradient stop on the section (`.hit` overlaps Featured by 44px, transparent above it).
    const fills = await section.evaluate((el) =>
      [el, ...Array.from(el.children)].flatMap((node) => {
        const cs = getComputedStyle(node);
        return [cs.backgroundColor, cs.backgroundImage];
      }),
    );
    expect(
      fills.some((f) => f === bg || f.includes(bg)),
      `${selector} is filled with ${bg} (saw ${JSON.stringify(fills)})`,
    ).toBe(true);
    const firstIsTorn = await section.evaluate((el) => el.firstElementChild?.getAttribute("data-decor") === "torn");
    expect(firstIsTorn, `${selector} first child is the torn edge`).toBe(true);
  }
});

// ---------------------------------------------------------------------------
// TKT-79 AC 1 · TC-151 step 2 — EVAL-018 per-unit decoration counts on `/` at both widths.
// Plan AC said hero 3; the hero shipped with 4 counted objects after the EXE-15 banner change
// (torn · h1 underline · hand-sub · postmark — components/hero/Hero.tsx, Design §11 Dev-21), still
// inside the ≤ 4 budget. Exact counts are asserted so any drift is a deliberate edit here.
// ---------------------------------------------------------------------------
test("@EVAL-018 home per-section decoration counts match the design of record", async ({ page }) => {
  test.skip(![390, 1440].includes(width(page)), "EVAL-018 is measured at w390 and w1440");
  await page.goto("/", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const result = await page.evaluate(collectDecorations, RULE_LIMITS);
  const counts = Object.fromEntries(result.units.map((r) => [r.unit, r.count]));
  // At 390 two objects are removed from the DOM by design: the header subline annotation
  // (`MediaGate min={640}`, components/navigation/Header.tsx) and How-I-think's journey path
  // sketch (desktop-only). Measured counts, both inside the ≤ 4 budget. TKT-99 (Design.md §11 Dev-41)
  // added How-I-think's one collage backdrop object: 3 at w1440, 2 at w390.
  const mobile = width(page) === 390;
  expect(counts).toEqual({
    header: mobile ? 0 : 1,
    'section[aria-labelledby="hero-h"]': 4,
    "section#work-featured": 4,
    "section#how-i-think": mobile ? 2 : 3,
    "section#ask": 2,
    footer: 1,
  });
  expect(result.violations).toEqual([]);
});

// ---------------------------------------------------------------------------
// TKT-79 AC 3 · TC-151 step 4 — EVAL-001 structural precondition: the six 5-second-test elements are
// laid out inside the first viewport (no scroll) — name (header wordmark), title (eyebrow "Senior
// Product Manager · …"), value (h1 "AI-native products"), the illustrated desk (hero banner — "actually
// builds"), and the two ways in ("View my work →", "Ask my portfolio"). TKT-96 (Tushar 2026-09-26,
// Design.md §11 Dev-39): that first-viewport rule now holds at w390 only; at w1440 the banner shows the
// whole scene and the h1 + CTAs are one scroll away (tests/e2e/hero-scene.ts, shared with hero-fold).
// Scoring the comprehension itself is manual (evals/results/eval-001-m009-home.md).
// ---------------------------------------------------------------------------
test("@EVAL-001 the six 5-second-test elements sit in the first viewport (w390) / the whole scene then the copy (w1440)", async ({ page }) => {
  test.skip(![390, 1440].includes(width(page)), "EVAL-001 is scored at w390 and w1440");
  await page.goto("/", { waitUntil: "load" });
  if (width(page) === 1440) {
    await expect(page.getByAltText(HERO_BANNER_ALT)).toBeVisible();
    await expectWholeScene(page);
    await expectCopyWithinOneScroll(page);
    await expect(page.locator("h1#hero-h")).toContainText("AI-native products");
    return;
  }
  const vh = page.viewportSize()!.height;
  const elements = {
    name: page.locator("header .header-name"),
    title: page.getByText(hero.eyebrow.text, { exact: true }),
    value: page.locator("h1#hero-h"),
    desk: page.getByAltText(HERO_BANNER_ALT),
    work: page.getByRole("link", { name: "View my work →" }),
    ask: page.locator(".hero-cta-row").getByRole("link", { name: "Ask my portfolio" }),
  };
  for (const [label, locator] of Object.entries(elements)) {
    await expect(locator, label).toBeVisible();
    const box = (await locator.boundingBox())!;
    expect(box.y, `${label} top inside the first viewport`).toBeGreaterThanOrEqual(0);
    // Text and CTAs must be wholly above the fold; the banner only needs to be on screen.
    const bottom = label === "desk" ? box.y : box.y + box.height;
    expect(bottom, `${label} (${Math.round(box.y)}–${Math.round(box.y + box.height)}) within ${vh}px`).toBeLessThanOrEqual(vh);
  }
  await expect(elements.value).toContainText("AI-native products");
});
