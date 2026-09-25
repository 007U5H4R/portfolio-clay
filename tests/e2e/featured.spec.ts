/**
 * featured.spec.ts (TKT-75 · TC-147; technical-plan.md §F3 S75.02) — the paper Featured Work section.
 *
 *   @EVAL-002 — hop 1 of the recruiter path: each featured card → its case study.
 *   @EVAL-011 — the three cards are live controls: every href resolves 200.
 *   @EVAL-015 — `project-{slug}` VT name on each card; with startViewTransition removed (EXE-5
 *               fallback) + reduced motion, navigation lands on the same end state.
 *   @EVAL-018 — `section#work-featured` carries exactly 4 decorations (torn · quote annotation ·
 *               flow sketch · sticky — Design.md §3.3, Dev-03) at 390 and 1440; ≤ 2 fasteners/card.
 *   Layout (Design.md §7.1): > 1024 two columns with the TeachSpark card spanning both rows; ≤ 1024
 *   two columns with it spanning both columns; ≤ 640 one column; no horizontal overflow.
 *   Hover (TC-147 step 5): the card's `transform` changes on hover; under reduced motion only its
 *   `box-shadow` changes.
 */
import type { Locator, Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const width = (page: Page) => page.viewportSize()?.width ?? 0;

const FEATURED = [
  { slug: "teachspark", name: "TeachSpark" },
  { slug: "railcite", name: "RailCite" },
  { slug: "velora", name: "Nuptis → Velora" },
] as const;

const SECTION = "section#work-featured";
const links = (page: Page) => page.locator(`${SECTION} a[href^="/work/"]`);
const sheets = (page: Page) => page.locator(`${SECTION} [data-paper="card"]`);

type Box = { x: number; y: number; w: number; h: number };
const boxes = (loc: Locator) =>
  loc.evaluateAll((els) =>
    els.map((el) => {
      // Un-rotated layout box: offset geometry ignores the paper tilt.
      const e = el as HTMLElement;
      const r = e.getBoundingClientRect();
      return { x: r.left + r.width / 2 - e.offsetWidth / 2, y: e.offsetTop, w: e.offsetWidth, h: e.offsetHeight };
    }),
  ) as Promise<Box[]>;

// ---------------------------------------------------------------------------
// 3 cards, rank order, one link each (aria-label = name, href = /work/<slug>).
// ---------------------------------------------------------------------------
test("@EVAL-002 featured section lists the 3 case studies in rank order", {
  tag: "@EVAL-002",
}, async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  await expect(links(page)).toHaveCount(3);
  await expect(sheets(page)).toHaveCount(3);
  for (let i = 0; i < FEATURED.length; i++) {
    const { slug, name } = FEATURED[i]!;
    const link = links(page).nth(i);
    await expect(link).toHaveAttribute("href", `/work/${slug}`);
    await expect(link).toHaveAttribute("aria-label", name);
    await expect(link.locator("h3")).toHaveText(name);
    await expect(sheets(page).nth(i).locator("a")).toHaveCount(1);
  }
});

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

    await page.locator(`${SECTION} a[href="/work/${slug}"]`).click();
    await page.waitForURL(`**/work/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
  }
});

test("@EVAL-015 featured cards carry the project View-Transition name", {
  tag: "@EVAL-015",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "VT-name presence checked once at w1440");
  await page.goto("/", { waitUntil: "load" });
  for (const { slug } of FEATURED) {
    await expect(page.locator(`${SECTION} a[style*="project-${slug}"]`)).toBeVisible();
  }
});

test("@EVAL-011 every featured card href resolves 200", { tag: "@EVAL-011" }, async ({ page }) => {
  test.skip(width(page) !== 1440, "link-resolution check runs once at w1440");
  await page.goto("/", { waitUntil: "load" });
  for (const { slug } of FEATURED) {
    const res = await page.request.get(`/work/${slug}`);
    expect(res.status(), `/work/${slug} must be 200`).toBe(200);
  }
});

// ---------------------------------------------------------------------------
// EVAL-018 — section unit count 4 (390 + 1440); fasteners ≤ 2 per card (every width).
// ---------------------------------------------------------------------------
test("@EVAL-018 featured section carries exactly 4 decorations and ≤ 2 fasteners per card", {
  tag: "@EVAL-018",
}, async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  const decor = await page
    .locator(`${SECTION} [data-decor]`)
    .evaluateAll((els) => els.map((el) => el.getAttribute("data-decor")).sort());
  expect(decor).toEqual(["annotation", "sketch", "sticky", "torn"]);
  // No nested <section> steals a decoration from the unit.
  await expect(page.locator(`${SECTION} section`)).toHaveCount(0);
  const fasteners = await sheets(page).evaluateAll((els) => els.map((el) => el.querySelectorAll("[data-fastener]").length));
  expect(fasteners).toHaveLength(3);
  for (const n of fasteners) expect(n).toBeLessThanOrEqual(2);
});

// ---------------------------------------------------------------------------
// Layout (Design.md §7.1) + no overflow.
// ---------------------------------------------------------------------------
test("featured grid: large card spans per breakpoint, no horizontal overflow", async ({ page, noOverflow }) => {
  await page.goto("/", { waitUntil: "load" });
  await noOverflow(page);
  const [large, a, b] = await boxes(sheets(page));
  expect(large && a && b, "3 cards laid out").toBeTruthy();
  const w = width(page);

  if (w > 1024) {
    // Two columns: large left spanning both rows; RailCite over Velora on the right.
    expect(large!.w).toBeGreaterThan(a!.w);
    expect(Math.abs(a!.x - b!.x)).toBeLessThanOrEqual(1);
    expect(a!.x).toBeGreaterThan(large!.x + large!.w);
    expect(b!.y).toBeGreaterThan(a!.y);
    expect(large!.h).toBeGreaterThanOrEqual(a!.h + b!.h);
  } else if (w > 640) {
    // Two columns: large spans both on top; RailCite and Velora side by side beneath.
    expect(Math.abs(large!.w - (a!.w + b!.w))).toBeLessThanOrEqual(40);
    expect(a!.y).toBeGreaterThan(large!.y + large!.h - 1);
    expect(Math.abs(a!.y - b!.y)).toBeLessThanOrEqual(1);
    expect(b!.x).toBeGreaterThan(a!.x + a!.w);
  } else {
    // One column, full width, stacked.
    expect(Math.abs(large!.w - a!.w)).toBeLessThanOrEqual(1);
    expect(Math.abs(a!.w - b!.w)).toBeLessThanOrEqual(1);
    expect(a!.y).toBeGreaterThan(large!.y);
    expect(b!.y).toBeGreaterThan(a!.y);
  }
});

// ---------------------------------------------------------------------------
// TC-147 step 5 — hover lifts (transform) at 1440; reduced motion: shadow only.
// ---------------------------------------------------------------------------
const hoverStyles = async (page: Page, slug: string) => {
  const link = page.locator(`${SECTION} a[href="/work/${slug}"]`);
  // The link is the Sheet's direct child (ProjectCard anatomy) — its parent is the card.
  const sheet = link.locator("..");
  await link.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const read = () => sheet.evaluate((el) => ({ t: getComputedStyle(el).transform, s: getComputedStyle(el).boxShadow }));
  const before = await read();
  await link.hover();
  await page.waitForTimeout(350);
  const after = await read();
  return { before, after };
};

test("@EVAL-010 featured card hover lifts; reduced motion changes the shadow only", {
  tag: "@EVAL-010",
}, async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 1440, "hover physics checked at w1440 (fine pointer)");
  await page.goto("/", { waitUntil: "load" });
  const normal = await hoverStyles(page, "railcite");
  expect(normal.after.t, "hover must change transform").not.toBe(normal.before.t);
  expect(normal.after.s).not.toBe(normal.before.s);

  await withReducedMotion(page);
  await page.goto("/", { waitUntil: "load" });
  const reduced = await hoverStyles(page, "railcite");
  expect(reduced.after.t, "no lift under reduced motion").toBe(reduced.before.t);
  expect(reduced.after.s, "shadow still swaps under reduced motion").not.toBe(reduced.before.s);
});
