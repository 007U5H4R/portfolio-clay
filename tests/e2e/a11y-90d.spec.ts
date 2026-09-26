/**
 * a11y-90d.spec.ts (TKT-90d · docs/a11y-pass.md A11Y-1…4) — regression tests for the accessibility
 * findings of the TKT-90c pass.
 *
 *   A11Y-1 — `Reveal` content is in the accessibility tree ON LOAD, before any scroll: the six How I
 *            think h3s on `/` and the four product-journey h3s on `/about` resolve via `getByRole`
 *            (which skips `visibility:hidden` / `aria-hidden` content) while their Reveal has not
 *            fired yet; focus entering a Reveal marks it revealed.
 *   A11Y-2 — the decorative "●" kind-badge dot is not in the accessible text (`/about`).
 *   A11Y-3 — the insight artifact's decorative opening-quote glyph is not in the accessible text.
 *   A11Y-4 — the decision artifact reads "Why: <reason>" with a real space.
 *
 * A11Y-2/3 self-check the detector: after asserting the glyph is absent, the test restores the old
 * plain `content` and asserts the same snapshot now DOES contain it — so a snapshot engine that
 * ignored pseudo-element content could never make these pass vacuously.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const width = (page: Page) => page.viewportSize()?.width ?? 0;

const STAGES = ["Problem", "Insight", "Bet", "Build", "Evaluate", "Impact"] as const;

/** Case-study artifacts render in the Deep dive view (the Overview is the default). */
async function openDeepDive(page: Page, slug: string): Promise<void> {
  const res = await page.goto(`/work/${slug}`, { waitUntil: "load" });
  expect(res?.status(), `/work/${slug} must be 200`).toBe(200);
  await page.getByRole("radio", { name: "Deep dive" }).click();
  await expect(page.locator("section#deep")).toBeAttached();
}

test.describe("A11Y-1 Reveal content is in the accessibility tree on load", () => {
  test("/ How I think: the six stage h3s have accessible names before scrolling", async ({ page }) => {
    test.skip(width(page) !== 390 && width(page) !== 1440, "runs at the two boundary widths");
    await page.goto("/", { waitUntil: "load" });
    const section = page.locator("section#how-i-think");
    // Prove this is the pre-reveal state: the TKT-110 choreography is armed, every card still rolled.
    await expect(section.locator("[data-journey-stage]").last()).toHaveAttribute("data-roll", "rolled");
    for (const stage of STAGES) {
      await expect(section.getByRole("heading", { level: 3, name: stage, exact: true })).toHaveCount(1);
    }
    expect(await section.getByRole("listitem").count()).toBe(6);
    const tree = await section.locator("ol").ariaSnapshot();
    for (const stage of STAGES) expect(tree).toContain(`heading "${stage}" [level=3]`);
  });

  test("/about product journey: the four stage h3s have accessible names before scrolling", async ({ page }) => {
    test.skip(width(page) !== 390 && width(page) !== 1440, "runs at the two boundary widths");
    await page.goto("/about", { waitUntil: "load" });
    const journey = page.locator("section#journey");
    await expect(journey.locator(".reveal").last()).not.toHaveAttribute("data-revealed", "");
    const headings = journey.getByRole("list").first().getByRole("heading", { level: 3 });
    await expect(headings).toHaveCount(4);
    for (const name of await headings.allInnerTexts()) expect(name.trim().length).toBeGreaterThan(0);
    const tree = await journey.getByRole("list").first().ariaSnapshot();
    expect(tree.match(/- listitem:/g)?.length ?? 0).toBe(4);
    expect(tree.match(/heading "[^"]+" \[level=3\]/g)?.length ?? 0).toBe(4);
  });

  test("focus entering a rolled stage card reveals it (/, TKT-110)", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at w1440");
    await page.goto("/", { waitUntil: "load" });
    const stage = page.locator("section#how-i-think [data-journey-stage]").last();
    await expect(stage).toHaveAttribute("data-roll", "rolled");
    await stage.locator("a[href]").first().focus();
    await expect(stage).toHaveAttribute("data-roll", "settled");
    await expect(stage).toHaveCSS("opacity", "1");
    await expect(stage).toHaveCSS("clip-path", "none");
  });
});

test("A11Y-2 the kind-badge dot is not read aloud (/about)", async ({ page }) => {
  test.skip(width(page) !== 1440, "runs once at w1440");
  await page.goto("/about", { waitUntil: "load" });
  const badge = page.locator(".aimp-kind").first();
  await expect(badge).toBeAttached();
  expect(await badge.ariaSnapshot()).not.toContain("●");
  // Detector self-check: the pre-fix plain `content` IS picked up by the snapshot.
  await page.addStyleTag({ content: '.aimp-kind::before { content: "●" !important; }' });
  expect(await badge.ariaSnapshot()).toContain("●");
});

test("A11Y-3 the insight opening-quote glyph is not read aloud (/work/teachspark)", async ({ page }) => {
  test.skip(width(page) !== 1440, "runs once at w1440");
  await openDeepDive(page, "teachspark");
  const figure = page.locator("figure.artifact-insight, .artifact-insight").first();
  await expect(figure).toBeAttached();
  // The glyph surfaced as a bare `text: “` node ahead of the blockquote; the quote's own
  // punctuation inside the blockquote is content and stays.
  const bareGlyph = /^\s*- text: "?“"?\s*$/m;
  const fixed = await figure.ariaSnapshot();
  await page.addStyleTag({ content: '.artifact-insight::before { content: "“" !important; }' });
  const plain = await figure.ariaSnapshot();
  expect(fixed).not.toMatch(bareGlyph);
  expect(plain).toMatch(bareGlyph);
});

test("A11Y-4 the decision 'Why:' label is followed by a real space (/work/teachspark)", async ({ page }) => {
  test.skip(width(page) !== 1440, "runs once at w1440");
  await openDeepDive(page, "teachspark");
  const why = page.locator(".dec-why");
  expect(await why.count()).toBeGreaterThan(0);
  for (const text of await why.allTextContents()) expect(text).toMatch(/^Why: \S/);
});
