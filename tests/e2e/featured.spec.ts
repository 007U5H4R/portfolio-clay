/**
 * featured.spec.ts (technical-plan.md §B S12.02–S12.04) — the FeaturedWork home section.
 *
 * Covers the TKT-12 gates:
 *   @EVAL-002 — hop 1 of the recruiter path: home featured card → its case study (each of the 3).
 *   @EVAL-011 — the three featured cards are live controls: every card href resolves 200.
 *   @EVAL-015 — View-Transition names present on card + header; the EXE-5 plain-navigation fallback
 *               (no startViewTransition) lands on the same end state; reduced motion removes the rise.
 *
 * Plus the S12.02 layout gate: exactly 3 cards in DOM order TeachSpark → RailCite → Nuptis → Velora,
 * equal heights at 1440 (±1px), with the one `large` card visibly wider than the two mediums (the
 * brief's "not three identical rectangles" / EXE-6 hero-balance requirement).
 */
import { test, expect } from "./fixtures";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

const FEATURED = [
  { slug: "teachspark", name: "TeachSpark", size: "large" },
  { slug: "railcite", name: "RailCite", size: "medium" },
  { slug: "velora", name: "Nuptis → Velora", size: "medium" },
] as const;

const cards = (page: import("@playwright/test").Page) =>
  page.locator('#work-featured a[href^="/work/"]');

// ---------------------------------------------------------------------------
// S12.02 — exactly 3 cards, correct DOM order, correct names (every width).
// ---------------------------------------------------------------------------
test("@EVAL-002 featured section lists the 3 case studies in rank order", {
  tag: "@EVAL-002",
}, async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  const links = cards(page);
  await expect(links).toHaveCount(3);
  for (let i = 0; i < FEATURED.length; i++) {
    await expect(links.nth(i)).toHaveAttribute("href", `/work/${FEATURED[i]!.slug}`);
    await expect(links.nth(i).getByRole("heading", { level: 3 })).toHaveText(FEATURED[i]!.name);
  }
});

// ---------------------------------------------------------------------------
// EVAL-002 hop 1 + EVAL-015 fallback — each card navigates to its case study; with
// startViewTransition removed (EXE-5 fallback) and reduced motion, the end state is identical.
// ---------------------------------------------------------------------------
test("@EVAL-002 @EVAL-015 each featured card navigates to its case study (VT fallback)", {
  tag: ["@EVAL-002", "@EVAL-015"],
}, async ({ page, noViewTransitions, withReducedMotion }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "navigation verified at 390 and 1440");
  await noViewTransitions(page);
  await withReducedMotion(page);

  for (const { slug, name } of FEATURED) {
    await page.goto("/", { waitUntil: "load" });
    const hasVT = await page.evaluate(() => typeof document.startViewTransition === "function");
    expect(hasVT, "startViewTransition must be absent so the EXE-5 fallback path runs").toBeFalsy();

    await page.locator(`#work-featured a[href="/work/${slug}"]`).click();
    await page.waitForURL(`**/work/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
  }
});

// ---------------------------------------------------------------------------
// EVAL-015 — View-Transition names are wired on both the card and its case-study header.
// ---------------------------------------------------------------------------
test("@EVAL-015 featured cards carry the project/icon View-Transition names", {
  tag: "@EVAL-015",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "VT-name presence checked once at w1440");
  await page.goto("/", { waitUntil: "load" });
  for (const { slug } of FEATURED) {
    await expect(page.locator(`#work-featured [style*="project-${slug}"]`)).toBeVisible();
    await expect(page.locator(`#work-featured [style*="icon-${slug}"]`)).toBeVisible();
  }
});

// ---------------------------------------------------------------------------
// EVAL-011 — the featured cards are live controls: every href resolves 200 (no dead links).
// ---------------------------------------------------------------------------
test("@EVAL-011 every featured card href resolves 200", { tag: "@EVAL-011" }, async ({ page }) => {
  test.skip(width(page) !== 1440, "link-resolution check runs once at w1440");
  await page.goto("/", { waitUntil: "load" });
  for (const { slug } of FEATURED) {
    const res = await page.request.get(`/work/${slug}`);
    expect(res.status(), `/work/${slug} must be 200`).toBe(200);
  }
});

// ---------------------------------------------------------------------------
// S12.02 layout gate — equal heights at 1440 (±1px), large card wider than the mediums
// (EXE-6: editorial row, "not three identical rectangles").
// ---------------------------------------------------------------------------
test("featured row is equal-height with one wider (large) card at 1440", async ({ page }) => {
  test.skip(width(page) !== 1440, "editorial row geometry measured at w1440 (lg layout)");
  await page.goto("/", { waitUntil: "load" });
  const boxes = await cards(page).evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { w: r.width, h: r.height };
    }),
  );
  expect(boxes).toHaveLength(3);

  const heights = boxes.map((b) => b.h);
  const maxH = Math.max(...heights);
  const minH = Math.min(...heights);
  expect(maxH - minH, `card heights must be equal (±1px): ${heights.join(", ")}`).toBeLessThanOrEqual(1);

  const [large, mediumA, mediumB] = boxes;
  expect(
    large!.w,
    `large card (${large!.w}px) must be visibly wider than the medium cards (${mediumA!.w}, ${mediumB!.w})`,
  ).toBeGreaterThan(mediumA!.w + 40);
  expect(large!.w).toBeGreaterThan(mediumB!.w + 40);
  expect(
    Math.abs(mediumA!.w - mediumB!.w),
    "the two medium cards should share a width",
  ).toBeLessThanOrEqual(1);
});

// ---------------------------------------------------------------------------
// EVAL-015 — reduced motion removes the card hover rise (transform stays put).
// ---------------------------------------------------------------------------
test("@EVAL-015 reduced motion removes the featured card hover rise", {
  tag: "@EVAL-015",
}, async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 1440, "hover physics checked at w1440 (fine pointer)");
  await withReducedMotion(page);
  await page.goto("/", { waitUntil: "load" });

  const card = page.locator('#work-featured a[href="/work/railcite"]');
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
