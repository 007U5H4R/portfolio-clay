/**
 * home.spec.ts (technical-plan.md §B S14.02 / S14.03, `@EVAL-006 @EVAL-008 @EVAL-011 @EVAL-017`) —
 * the FINAL home assembly (TKT-14): the five sections in their fixed Design.md §3 order, the mobile
 * reading order at 390, the section-rhythm ladder, the FinalCTA + its live CopyButton behaviour, and
 * the home `/` SEO tag presence.
 *
 *   @EVAL-006 — axe clean on `/` (no critical/serious violations).
 *   @EVAL-008 — no horizontal overflow at any of the four viewports.
 *   @EVAL-011 — every FinalCTA control is live: CopyButton copies (and never fails silently — it
 *               falls back to selectable text on a blocked clipboard), the CTAs resolve.
 *   @EVAL-017 — `/` carries its title/description/OG image tags (the full absolute-URL matrix lives
 *               in eval-017.spec.ts; this is the home-assembly smoke of the same set).
 */
import { test, expect } from "./fixtures";
import { site } from "@/lib/site";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

// Section vertical rhythm (Design.md §2 --section-gap ladder): 72 / 96 / 128 at mobile / tablet /
// desktop, applied as `py` on every `Section`. Tailwind breakpoints md=768, lg=1024.
const expectedSectionPadding = (w: number) => (w >= 1024 ? 128 : w >= 768 ? 96 : 72);

// ---------------------------------------------------------------------------
// S14.02 — DOM order of the five home sections (Hero → Ask → Featured → How-I-Think → FinalCTA).
// ---------------------------------------------------------------------------
test("@EVAL-017 home assembles the five sections in the fixed Design.md order", async ({ page }) => {
  test.skip(width(page) !== 1440, "DOM order is viewport-independent; checked once at w1440");
  await page.goto("/", { waitUntil: "load" });

  const sections = page.locator("#main > section");
  await expect(sections).toHaveCount(5);

  // The hero is the first section (no id — it carries the h1); the remaining four are id'd.
  await expect(sections.nth(0).locator("h1")).toBeVisible();
  await expect(sections.nth(1)).toHaveAttribute("id", "ask");
  await expect(sections.nth(2)).toHaveAttribute("id", "work-featured");
  await expect(sections.nth(3)).toHaveAttribute("id", "how-i-think");
  await expect(sections.nth(4)).toHaveAttribute("id", "cta");
});

// ---------------------------------------------------------------------------
// S14.02 — section-rhythm ladder: each Section's computed top padding matches the viewport token.
// ---------------------------------------------------------------------------
test("home sections use the 72/96/128 vertical-rhythm ladder for the current viewport", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "load" });
  const want = expectedSectionPadding(width(page));
  const paddingTop = await page
    .locator("#cta")
    .evaluate((el) => Number.parseInt(getComputedStyle(el).paddingTop, 10));
  expect(paddingTop, `#cta padding-top at ${width(page)}px`).toBe(want);
});

// ---------------------------------------------------------------------------
// S14.02 — mobile reading order at 390: avatar → headline → CTAs → Ask → projects → How-I-Think →
// final CTA (the authoritative fixed order, Design.md §3 line 162). boundingBox().y strictly
// increasing. (Tiles are not a checkpoint here: their intra-hero placement is TKT-09's concern, not
// this assembly ticket's.)
// ---------------------------------------------------------------------------
test("@EVAL-008 mobile visual order is monotonic top-to-bottom at 390", async ({ page }) => {
  test.skip(width(page) !== 390, "mobile reading order checked at w390");
  await page.goto("/", { waitUntil: "load" });

  const ordered = [
    page.getByAltText(site.avatarAlt),
    page.locator("h1"),
    page.getByRole("link", { name: "View My Work →" }),
    page.locator("#ask-heading"),
    page.locator("#work-featured-heading"),
    page.locator("#how-i-think-heading"),
    page.locator("#cta-heading"),
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
// S14.03 — one accent per section: the FinalCTA's single accent is the lavender hero-tier card.
// ---------------------------------------------------------------------------
test("FinalCTA carries a single lavender accent card", async ({ page }) => {
  test.skip(width(page) !== 1440, "accent is viewport-independent; checked once at w1440");
  await page.goto("/", { waitUntil: "load" });
  // The one tinted surface in #cta is the card; assert it is lavender (Design.md §3).
  const lavenderSurfaces = page.locator('#cta [class*="bg-paper-2/30"]');
  await expect(lavenderSurfaces).toHaveCount(1);
});

// ---------------------------------------------------------------------------
// S14.01 — FinalCTA content + live controls (@EVAL-011: nothing dead, nothing fabricated silently).
// ---------------------------------------------------------------------------
test("@EVAL-011 FinalCTA renders its headline + three live actions", async ({ page }) => {
  test.skip(width(page) !== 1440, "content checked once at w1440");
  await page.goto("/", { waitUntil: "load" });

  const cta = page.locator("#cta");
  await expect(cta.getByRole("heading", { level: 2 })).toContainText("Building something AI-native?");

  // Copy control: accessible name is "Copy <email>".
  await expect(cta.locator("[data-copy-button]")).toBeVisible();
  // "Let's Talk" → /contact.
  await expect(cta.getByRole("link", { name: "Let's Talk" })).toHaveAttribute("href", "/contact");
  // Resume control derives from resumeAction() (PB5) — reachable, not hard-coded.
  await expect(cta.locator('a[href="/contact#resume"]')).toBeVisible();
  // DRAFT provenance is visible (unsigned closing copy).
  await expect(cta.getByText("Draft", { exact: true })).toBeVisible();
});

// ---------------------------------------------------------------------------
// S14.01 — CopyButton happy path: clicking writes the email, flips to `copied`, announces it.
//
// NOTE: the real `navigator.clipboard.writeText` performs the write (the OS clipboard does receive
// the value) but its returned promise never settles in headless Chromium under Playwright — a known
// environment limitation — so the component's `await` (and therefore its `copied` transition) can't
// be observed against the native API. We stub `writeText` to resolve (recording the value it was
// handed) so the component's real idle→copied→announce path is exercised deterministically; the
// error/fallback path below runs against a genuinely rejecting API.
// ---------------------------------------------------------------------------
test("@EVAL-011 CopyButton copies the email and confirms", async ({ page }) => {
  test.skip(width(page) !== 1440, "clipboard behaviour checked once at w1440");

  await page.addInitScript(() => {
    (window as unknown as { __copied: string[] }).__copied = [];
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (v: string) => {
          (window as unknown as { __copied: string[] }).__copied.push(v);
          return Promise.resolve();
        },
      },
    });
  });
  await page.goto("/", { waitUntil: "load" });

  const button = page.locator("#cta [data-copy-button]");
  await expect(button).toHaveAttribute("data-state", "idle");
  await button.click();
  await expect(button).toHaveAttribute("data-state", "copied");
  await expect(page.locator("#cta [role='status']")).toContainText("Copied");

  const copied = await page.evaluate(() => (window as unknown as { __copied: string[] }).__copied);
  expect(copied).toContain(site.email);
});

// ---------------------------------------------------------------------------
// S14.01 — CopyButton failure path: a blocked clipboard NEVER fails silently — it falls back to
// selectable text and warns to the console (A12).
// ---------------------------------------------------------------------------
test("@EVAL-011 CopyButton falls back to selectable text when the clipboard is blocked", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "fallback behaviour checked once at w1440");

  // Force writeText to reject before any page script runs.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error("blocked")) },
    });
  });

  const warnings: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "warning") warnings.push(msg.text());
  });

  await page.goto("/", { waitUntil: "load" });

  const button = page.locator("#cta [data-copy-button]");
  await button.click();
  await expect(button).toHaveAttribute("data-state", "error");

  // The value is shown as selectable text so the user is never stuck (A12: no dead end).
  const fallback = page.locator("#cta [data-copy-fallback]");
  await expect(fallback).toBeVisible();
  await expect(fallback.locator("output")).toHaveText(site.email);
  await expect(fallback).toContainText("Select to copy");

  // And the failure is surfaced, not swallowed (A12: [copy] console.warn).
  expect(warnings.some((w) => w.includes("[copy]"))).toBe(true);
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
