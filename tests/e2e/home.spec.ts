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
import { resumeAction, site } from "@/lib/site";
// The manifest directly (not `lib/illustrations.ts`, whose static JPEG imports Playwright cannot load).
import { ILLUSTRATIONS } from "@/content/media/illustrations/manifest";

const HERO_POSTER_ALT = ILLUSTRATIONS.find((e) => e.id === "hero-desk")!.alt;

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
// S14.02 — mobile reading order at 390: headline → CTAs → hero poster → projects → How-I-Think →
// Ask → band headline (M-009 order, Design.md §7.1). Since TSK-37 the illustrated hero (Design.md §5.1) puts the copy first
// and the scene second below 1024 so the copy is above the fold; the poster is the manifest
// `hero-desk` illustration (its alt comes from the manifest, §6.1). boundingBox().y strictly
// increasing.
// ---------------------------------------------------------------------------
test("@EVAL-008 mobile visual order is monotonic top-to-bottom at 390", async ({ page }) => {
  test.skip(width(page) !== 390, "mobile reading order checked at w390");
  await page.goto("/", { waitUntil: "load" });

  const ordered = [
    page.locator("h1"),
    page.getByRole("link", { name: "View my work →" }),
    page.getByAltText(HERO_POSTER_ALT),
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
