/**
 * featured.spec.ts (TASK-133 — Tushar's Featured Work spec 2026-09-29; supersedes the TKT-75 / TC-147
 * three-card grid) — the home editorial showcase of RailCite · Slag City · Campfire Board.
 *
 *   @EVAL-002 — hop 1 of the recruiter path: each Explore → the Portfolio page with THAT product
 *               selected (`/projects?product=<id>`, same tab, spec §12–§14): the active tab, the
 *               tabpanel, the sheet heading and the stage poster all show it. An unknown `?product=`
 *               falls back to the default (first) product.
 *   @EVAL-011 — the three Explore links are live controls: each href resolves 200.
 *   @EVAL-018 — `section#work-featured` carries exactly 1 decoration (its torn edge — Design.md §3.3,
 *               Dev-127) at 390 and 1440; ≤ 2 fasteners per card.
 *   Layout (spec §3, §16–§18; Design.md §7.1): ≥ 1100 RailCite left (~60 %) spanning both rows, Slag
 *   City top-right, Campfire Board bottom-right, the section ≈ 700–850 px; 700–1099 RailCite full width
 *   over the two side cards; < 700 one column in order. Never horizontal overflow; every CTA fully
 *   inside its card and the viewport.
 *   Hover (spec §15): the CTA lifts 1 px and its arrow steps 3 px right; under reduced motion neither
 *   moves.
 */
import type { Locator, Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { projects } from "@/data/projects";

const width = (page: Page) => page.viewportSize()?.width ?? 0;

const FEATURED = [
  { slug: "railcite", name: "RailCite", cta: "Explore case study" },
  { slug: "slag-city", name: "Slag City", cta: "Explore" },
  { slug: "campfire-board", name: "Campfire Board", cta: "Explore" },
] as const;
const DEFAULT_PRODUCT = projects.find((p) => p.category === "personal")!;

const SECTION = "section#work-featured";
const cards = (page: Page) => page.locator(`${SECTION} article[data-paper="card"]`);
/** The Explore link's accessible name begins with its visible text (WCAG 2.5.3), then product + destination. */
const exploreName = (name: string) => {
  const cta = FEATURED.find((f) => f.name === name)!.cta;
  return cta === "Explore" ? `Explore ${name} in Portfolio` : `${cta}: ${name} in Portfolio`;
};
const explore = (page: Page, name: string) => page.getByRole("link", { name: exploreName(name), exact: true });

type Box = { x: number; y: number; w: number; h: number };
/** Un-rotated layout boxes (offset geometry ignores the paper tilt and the reveal translate). */
const boxes = (loc: Locator) =>
  loc.evaluateAll((els) =>
    els.map((el) => {
      const e = el as HTMLElement;
      let x = 0;
      let y = 0;
      for (let n: HTMLElement | null = e; n; n = n.offsetParent as HTMLElement | null) {
        x += n.offsetLeft;
        y += n.offsetTop;
      }
      return { x, y, w: e.offsetWidth, h: e.offsetHeight };
    }),
  ) as Promise<Box[]>;

// ---------------------------------------------------------------------------
// Content: exactly three cards, the spec's copy, one real link each.
// ---------------------------------------------------------------------------
test("@EVAL-002 featured shows exactly RailCite, Slag City, Campfire Board — one same-tab Explore each", {
  tag: "@EVAL-002",
}, async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  const section = page.locator(SECTION);
  await expect(section.locator("h2")).toHaveText("Real problems. Real products.");
  await expect(cards(page)).toHaveCount(3);
  await expect(cards(page).locator("h3")).toHaveText(FEATURED.map((f) => f.name));
  await expect(section).not.toContainText("TeachSpark");
  await expect(section).not.toContainText("Velora");
  await expect(section.locator('a[href^="/work/"]')).toHaveCount(0);
  for (let i = 0; i < FEATURED.length; i++) {
    const { slug, name, cta } = FEATURED[i]!;
    await expect(cards(page).nth(i).locator("a")).toHaveCount(1);
    const link = explore(page, name);
    await expect(link).toHaveAttribute("href", `/projects?product=${slug}`);
    await expect(link).not.toHaveAttribute("target", /.*/);
    await expect(link).toHaveText(cta);
    await expect(link).toHaveAccessibleName(new RegExp(`^${cta}`)); // label in name
  }
});

test("@EVAL-002 each Explore opens the Portfolio page with that product selected (same tab)", {
  tag: "@EVAL-002",
}, async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "navigation verified at 390 and 1440");
  // The TKT-106 scroll-driven lag lands a frame after Playwright's scroll-into-view, so its computed
  // click point can chase the still-settling section. Reduced motion drops that decorative lag (as the
  // TKT-75 version of this test did); the next test checks each CTA is clickable at rest with full motion.
  await withReducedMotion(page);
  for (const { slug, name } of FEATURED) {
    await page.goto("/", { waitUntil: "load" });
    const pagesBefore = page.context().pages().length;
    await explore(page, name).click();
    await page.waitForURL(`**/projects?product=${slug}`);
    expect(page.context().pages().length, "no new tab").toBe(pagesBefore);
    await expect(page).toHaveURL(new RegExp(`/projects\\?product=${slug}$`)); // the query is preserved
    await expect(page.getByRole("tabpanel")).toHaveAttribute("data-active-product", slug);
    await expect(page.locator(`[role="tab"][data-product="${slug}"]`)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#pf-product-name")).toHaveText(name);
    // the stage shows the product's own pitch poster (its cover art)
    await expect(page.locator(`#pf-stage-screen img[src*="cover-${slug}"]`).first()).toBeAttached();
  }
});

test("every Explore CTA is on top at rest with full motion (not under the next sheet's torn edge)", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  for (const { name } of FEATURED) {
    const link = explore(page, name);
    await link.scrollIntoViewIfNeeded();
    await page.waitForTimeout(700); // the scroll-driven lag + one-shot entrance settle
    const onTop = await link.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!hit && el.contains(hit);
    });
    expect(onTop, `${name} CTA is hit-testable`).toBe(true);
  }
});

test("@EVAL-002 an unknown ?product= falls back to the default product", { tag: "@EVAL-002" }, async ({ page }) => {
  test.skip(width(page) !== 1440, "fallback checked once at w1440");
  await page.goto("/projects?product=not-a-product", { waitUntil: "load" });
  await expect(page.getByRole("tabpanel")).toHaveAttribute("data-active-product", DEFAULT_PRODUCT.slug);
  await expect(page.locator(`[role="tab"][data-product="${DEFAULT_PRODUCT.slug}"]`)).toHaveAttribute("aria-selected", "true");
});

test("@EVAL-011 every Explore href resolves 200", { tag: "@EVAL-011" }, async ({ page }) => {
  test.skip(width(page) !== 1440, "link-resolution check runs once at w1440");
  for (const { slug } of FEATURED) {
    const res = await page.request.get(`/projects?product=${slug}`);
    expect(res.status(), `/projects?product=${slug} must be 200`).toBe(200);
  }
});

// ---------------------------------------------------------------------------
// EVAL-018 — the section's one decoration (390 + 1440); fasteners ≤ 2 per card (every width).
// ---------------------------------------------------------------------------
test("@EVAL-018 featured section carries exactly 1 decoration (torn) and ≤ 2 fasteners per card", {
  tag: "@EVAL-018",
}, async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  const decor = await page.locator(`${SECTION} [data-decor]`).evaluateAll((els) => els.map((el) => el.getAttribute("data-decor")));
  expect(decor).toEqual(["torn"]);
  await expect(page.locator(`${SECTION} section`)).toHaveCount(0);
  const fasteners = await cards(page).evaluateAll((els) => els.map((el) => el.querySelectorAll("[data-fastener]").length));
  expect(fasteners).toHaveLength(3);
  for (const n of fasteners) expect(n).toBeLessThanOrEqual(2);
});

// ---------------------------------------------------------------------------
// Layout (spec §3, §16–§18) + no overflow + no cropped CTA.
// ---------------------------------------------------------------------------
test("featured layout: RailCite anchor + right column per breakpoint, compact, no overflow, CTAs uncropped", async ({ page, noOverflow }) => {
  await page.goto("/", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await noOverflow(page);
  const [rail, slag, camp] = await boxes(cards(page));
  expect(rail && slag && camp, "3 cards laid out").toBeTruthy();
  const w = width(page);

  if (w >= 1100) {
    // RailCite left (~58–62 % of the row), Slag City top-right, Campfire Board below it.
    const share = rail!.w / (slag!.x + slag!.w - rail!.x);
    expect(share).toBeGreaterThan(0.55);
    expect(share).toBeLessThan(0.65);
    expect(slag!.x).toBeGreaterThan(rail!.x + rail!.w);
    expect(Math.abs(slag!.x - camp!.x)).toBeLessThanOrEqual(1);
    expect(camp!.y).toBeGreaterThan(slag!.y + slag!.h - 1);
    expect(Math.abs(slag!.h - camp!.h)).toBeLessThanOrEqual(24); // equal or near-equal
    expect(rail!.h).toBeGreaterThanOrEqual(slag!.h + camp!.h);
    // compact: ≈ 700–850 px including the heading (the section box, torn edge included)
    const section = (await boxes(page.locator(SECTION)))[0]!;
    expect(section.h).toBeLessThanOrEqual(900);
  } else if (w >= 700) {
    // RailCite full width on top; Slag City + Campfire Board side by side beneath.
    expect(Math.abs(rail!.w - (slag!.w + camp!.w))).toBeLessThanOrEqual(40);
    expect(slag!.y).toBeGreaterThan(rail!.y + rail!.h - 1);
    expect(Math.abs(slag!.y - camp!.y)).toBeLessThanOrEqual(1);
    expect(camp!.x).toBeGreaterThan(slag!.x + slag!.w);
  } else {
    // One column, stacked in order, equal widths.
    expect(Math.abs(rail!.w - slag!.w)).toBeLessThanOrEqual(1);
    expect(Math.abs(slag!.w - camp!.w)).toBeLessThanOrEqual(1);
    expect(slag!.y).toBeGreaterThan(rail!.y + rail!.h - 1);
    expect(camp!.y).toBeGreaterThan(slag!.y + slag!.h - 1);
  }

  // every CTA sits fully inside its card and inside the viewport width
  for (let i = 0; i < FEATURED.length; i++) {
    const link = explore(page, FEATURED[i]!.name);
    await link.scrollIntoViewIfNeeded();
    const [cta] = await boxes(link);
    const [card] = await boxes(cards(page).nth(i));
    expect(cta!.x).toBeGreaterThanOrEqual(card!.x);
    expect(cta!.x + cta!.w).toBeLessThanOrEqual(card!.x + card!.w);
    expect(cta!.y + cta!.h).toBeLessThanOrEqual(card!.y + card!.h);
    expect(cta!.x + cta!.w).toBeLessThanOrEqual(w);
    expect(cta!.h).toBeGreaterThanOrEqual(44); // touch target
  }
});

// ---------------------------------------------------------------------------
// CTA hover (spec §15) at 1440; reduced motion: nothing moves.
// ---------------------------------------------------------------------------
const hoverStyles = async (page: Page, name: string) => {
  const link = explore(page, name);
  await link.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700); // the one-shot entrance settles
  await page.mouse.move(0, 0);
  const read = () =>
    link.evaluate((el) => ({
      t: getComputedStyle(el).translate,
      a: getComputedStyle(el.querySelector(".fw-cta-arrow")!).translate,
      f: getComputedStyle(el).filter,
    }));
  const before = await read();
  await link.hover();
  await page.waitForTimeout(300);
  const after = await read();
  return { before, after };
};

test("@EVAL-010 Explore hover lifts 1 px and steps the arrow 3 px; reduced motion moves nothing", {
  tag: "@EVAL-010",
}, async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 1440, "hover checked at w1440 (fine pointer)");
  await page.goto("/", { waitUntil: "load" });
  const normal = await hoverStyles(page, "RailCite");
  expect(normal.after.t).toBe("0px -1px");
  expect(normal.after.a).toBe("3px");
  expect(normal.after.f, "stronger shadow on hover").not.toBe(normal.before.f);

  await withReducedMotion(page);
  await page.goto("/", { waitUntil: "load" });
  const reduced = await hoverStyles(page, "RailCite");
  expect(reduced.after.t).toBe(reduced.before.t);
  expect(reduced.after.a).toBe(reduced.before.a);
});

// ---------------------------------------------------------------------------
// Spec §25 — one-time entrance; reduced motion shows everything at once.
// ---------------------------------------------------------------------------
test("featured entrance runs once on viewport entry; reduced motion shows the cards at once", async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 1440, "motion checked at w1440");
  await page.goto("/", { waitUntil: "load" });
  const slots = page.locator(`${SECTION} .fw-slot`);
  await page.locator(SECTION).scrollIntoViewIfNeeded();
  await expect(slots.nth(0)).toHaveAttribute("data-revealed", "");
  await expect(slots.nth(2)).toHaveAttribute("data-revealed", "");
  // scrolled away and back: it stays revealed (no replay, no loop)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator(SECTION).scrollIntoViewIfNeeded();
  await expect(slots.nth(1)).toHaveAttribute("data-revealed", "");
  await expect(slots.nth(1)).toHaveCSS("opacity", "1");

  await withReducedMotion(page);
  await page.goto("/", { waitUntil: "load" });
  for (let i = 0; i < 3; i++) {
    await expect(slots.nth(i)).toHaveCSS("opacity", "1");
    await expect(slots.nth(i)).toHaveCSS("transform", "none");
  }
});
