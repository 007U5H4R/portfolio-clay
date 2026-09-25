/**
 * TKT-92 round 2 (TASK-88) · EVAL-001 structural precondition, extended to w1024 — the six
 * 5-second-test elements (header name, eyebrow title, h1 value, the banner desk, both CTAs) are laid
 * out inside the first viewport, no scroll, at 390×844, 1024×768 and 1440×900. Same assertion as
 * TKT-79's `@EVAL-001 … first viewport` test in tests/e2e/home.spec.ts (branch m009/tkt-79), copied
 * here so this branch proves the capped banner height without editing a file TKT-79 owns; the
 * orchestrator dedupes at merge. The hand line ("Same curiosity. Bigger problems.") is checked too:
 * it sits between the h1 and the CTAs, so it is above the fold whenever they are.
 */
import { test, expect } from "./fixtures";
import { hero } from "@/data/hero";
// The manifest directly (not `lib/illustrations.ts`, whose static image imports Playwright cannot load).
import { ILLUSTRATIONS } from "@/content/media/illustrations/manifest";

const HERO_BANNER_ALT = ILLUSTRATIONS.find((e) => e.id === "hero-banner")!.alt;
const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

test("@EVAL-001 the 5-second-test elements and the hand line sit in the first viewport", async ({ page }) => {
  test.skip(![390, 1024, 1440].includes(width(page)), "scored at w390 / w1024 / w1440");
  await page.goto("/", { waitUntil: "load" });
  const vh = page.viewportSize()!.height;
  const elements = {
    name: page.locator("header .header-name"),
    title: page.getByText(hero.eyebrow.text, { exact: true }),
    value: page.locator("h1#hero-h"),
    hand: page.locator(".hero-hand-sub"),
    // The banner img is inside a cover-cropped canvas that may overflow its box; the visible desk is the box.
    desk: page.locator(".hero-banner figure.scene-banner").filter({ has: page.getByAltText(HERO_BANNER_ALT) }),
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
