/**
 * tracer.spec.ts (technical-plan.md §B S07.03) — the M-001 tracer end-to-end gate.
 *
 * Runs in all four viewport projects (w390 / w768 / w1024 / w1440) against the production build.
 * Covers the automated tracer eval cases and folds in every Playwright check deferred by
 * TSK-02/04/05/06:
 *   @EVAL-008 — responsive screenshot pack (8 files) + noOverflow + minTargets (both routes)
 *   @EVAL-006 — axe (wcag2.1 AA) at 390 & 1440 on both routes + on the open MobileMenu
 *   @EVAL-010 — reduced-motion: card hover does not translate, header transition collapses
 *   @EVAL-015 — View-Transition fallback (EXE-5 plain navigation, identical end state) + no-JS
 *               static HTML content
 * plus hero frame ladder (S05.02), tile offsets (S05.03), header compaction (S04.03),
 * NavPill (S04.04), MobileMenu focus-trap/Esc (S04.05), SkipLink (S04.02),
 * AskAIButton tab-order (S04.06), resume placeholder + /resume.pdf 404 (E-13).
 */
import { test, expect } from "./fixtures";
// The manifest directly, not `lib/illustrations.ts` — that module statically imports the scene
// JPEGs for `next/image`, which Playwright's TypeScript transform cannot load.
import { ILLUSTRATIONS } from "@/content/media/illustrations/manifest";

const BASE_URL = process.env.PW_BASE_URL ?? "http://127.0.0.1:3000";
const HERO_DESK_ALT = ILLUSTRATIONS.find((entry) => entry.id === "hero-desk")!.alt;

const ROUTES = [
  { path: "/", label: "home" },
  { path: "/work/teachspark", label: "case" },
] as const;

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

// ---------------------------------------------------------------------------
// EVAL-008 — responsive screenshot pack + no-overflow + min-targets (all widths, both routes)
// ---------------------------------------------------------------------------
for (const route of ROUTES) {
  test(`${route.label} · responsive pack + no-overflow + min-targets`, { tag: "@EVAL-008" }, async ({
    page,
    noOverflow,
    minTargets,
  }) => {
    await page.goto(route.path, { waitUntil: "load" });
    await page.screenshot({
      path: `docs/screenshots/tracer/${route.label}-${width(page)}.png`,
      fullPage: true,
      animations: "disabled",
    });
    await noOverflow(page);
    await minTargets(page);
  });
}

// ---------------------------------------------------------------------------
// EVAL-006 — axe at 390 & 1440 on both routes
// ---------------------------------------------------------------------------
for (const route of ROUTES) {
  test(`${route.label} · axe wcag2.1 AA`, { tag: "@EVAL-006" }, async ({ page, axe }) => {
    test.skip(width(page) !== 390 && width(page) !== 1440, "axe runs at 390 and 1440 (EVAL-006)");
    await page.goto(route.path, { waitUntil: "load" });
    await axe(page);
  });
}

// ---------------------------------------------------------------------------
// S14/D10 (TSK-37/TSK-38) — the paper hero's poster image is visible, alt-sourced from the
// manifest, and responsive (positive width at every project width). Design-fidelity check (not an
// EVAL-008 overflow/target criterion), so intentionally untagged. Replaces the old M-008
// avatar-scene cap-ladder assertion (deleted with the hero motion system at TSK-38).
// ---------------------------------------------------------------------------
test("hero poster illustration is visible, alt-sourced from the manifest, and responsive", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "load" });
  const w = width(page);
  const img = page.getByRole("img", { name: HERO_DESK_ALT });
  await expect(img).toBeVisible();
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready);
  await img.scrollIntoViewIfNeeded();
  await expect(async () => {
    const box = await img.boundingBox();
    expect(box, "hero poster must be laid out").toBeTruthy();
    expect(box!.width, `hero poster width at ${w} must be positive`).toBeGreaterThan(0);
  }).toPass({ timeout: 6000 });
});

// ---------------------------------------------------------------------------
// S14/D10 (TSK-37) — the paper hero's two CTAs are present with the correct targets. Replaces the
// old M-008 proof-tile offset-ladder assertion (the tile stack was deleted at TSK-38).
// ---------------------------------------------------------------------------
test("hero CTAs are present and target /work and #ask", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  const primary = page.getByRole("link", { name: "View my work →" });
  await expect(primary).toBeVisible();
  await expect(primary).toHaveAttribute("href", "/work");

  const secondary = page.getByRole("link", { name: "Ask my portfolio" });
  await expect(secondary).toBeVisible();
  await expect(secondary).toHaveAttribute("href", "#ask");
});

// ---------------------------------------------------------------------------
// EVAL-010 — reduced motion: card hover does not translate; header transition collapses
// ---------------------------------------------------------------------------
test("reduced motion collapses card hover lift and header transition", { tag: "@EVAL-010" }, async ({
  page,
  withReducedMotion,
}) => {
  test.skip(width(page) !== 1440, "reduced-motion hover check runs at w1440 (fine pointer)");
  await withReducedMotion(page);
  await page.goto("/", { waitUntil: "load" });

  const card = page.locator('a[href="/work/teachspark"]');
  await card.scrollIntoViewIfNeeded();
  const before = await card.boundingBox();
  await card.hover();
  await page.waitForTimeout(300);
  const after = await card.boundingBox();
  expect(before && after, "card must be laid out").toBeTruthy();
  expect(
    Math.abs(after!.y - before!.y),
    "card must not lift (transform-animate) under reduced motion",
  ).toBeLessThan(1);

  const transitionProperty = await page
    .locator("header")
    .first()
    .evaluate((el) => getComputedStyle(el).transitionProperty);
  expect(transitionProperty, "header transition must collapse to none under reduced motion").toBe(
    "none",
  );
});

// ---------------------------------------------------------------------------
// EVAL-015 — View-Transition fallback: plain navigation, identical end state
// ---------------------------------------------------------------------------
test("VT fallback navigates card -> case study with identical end state", { tag: "@EVAL-015" }, async ({
  page,
  noViewTransitions,
  withReducedMotion,
}) => {
  await noViewTransitions(page);
  await withReducedMotion(page);
  await page.goto("/", { waitUntil: "load" });

  const hasVT = await page.evaluate(() => typeof document.startViewTransition === "function");
  expect(hasVT, "startViewTransition must be absent so the EXE-5 fallback path runs").toBeFalsy();

  await page.locator('a[href="/work/teachspark"]').click();
  await page.waitForURL("**/work/teachspark");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("TeachSpark");
  // Case-study header media is present (the ClayFrame VT target + its placeholder media).
  await expect(page.locator('[style*="project-teachspark"]')).toBeVisible();
  await expect(page.getByText("Hero media coming")).toBeVisible();
});

// ---------------------------------------------------------------------------
// EVAL-015 — F6 regression: client-side nav must not trip a header-compaction update loop.
//
// At w768 the case-study page's scroll range (41px) straddled the old single 24px compaction
// threshold: compacting shrank the sticky header 28px, which clamped scrollY back under the
// threshold, which un-compacted it — an infinite render loop (React #185 "Maximum update depth
// exceeded"), rendered as Next's default error page instead of the case study. Only reproduced in
// the production build, at w768, under reduced motion. The fix is hysteresis on useScrollY
// (lib/motion.ts) — see docs/reports/F6-debug.md. This asserts the navigation raises NO page error
// and lands on the real case study, at every width, so the loop cannot silently return.
// ---------------------------------------------------------------------------
test("F6: card -> case study nav does not trip a render loop (React #185)", { tag: "@EVAL-015" }, async ({
  page,
  noViewTransitions,
  withReducedMotion,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  await noViewTransitions(page);
  await withReducedMotion(page);
  await page.goto("/", { waitUntil: "load" });

  await page.locator('a[href="/work/teachspark"]').click();
  await page.waitForURL("**/work/teachspark");

  // The real case study renders (not Next's "This page couldn't load" error boundary)...
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("TeachSpark");
  // ...and no update-depth / render loop was thrown during the navigation.
  const loopErrors = pageErrors.filter(
    (m) => m.includes("Maximum update depth") || m.includes("#185"),
  );
  expect(loopErrors, `render-loop errors during nav:\n${JSON.stringify(pageErrors, null, 2)}`).toEqual(
    [],
  );
});

// ---------------------------------------------------------------------------
// EVAL-015 — static HTML content survives with JavaScript disabled
// ---------------------------------------------------------------------------
test("static HTML carries content and navigation with JS disabled", { tag: "@EVAL-015" }, async ({
  page,
  browser,
}) => {
  test.skip(width(page) !== 1440, "no-JS static check runs once at w1440");
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: BASE_URL,
    viewport: { width: 1440, height: 900 },
  });
  try {
    const p = await context.newPage();
    await p.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      p.locator('nav[aria-label="Primary"] a', { hasText: "Work" }).first(),
    ).toHaveCount(1);
    await expect(p.getByRole("heading", { level: 1 })).toContainText("AI-native products");

    await p.goto("/work/teachspark", { waitUntil: "domcontentloaded" });
    await expect(p.getByRole("heading", { level: 1 })).toHaveText("TeachSpark");
  } finally {
    await context.close();
  }
});

// ---------------------------------------------------------------------------
// S04.03 — header compaction 96 -> 68 with backdrop blur
// ---------------------------------------------------------------------------
test("header compacts 96 -> 68 with a backdrop blur on scroll", async ({ page }) => {
  test.skip(width(page) !== 1440, "compaction geometry measured at w1440");
  await page.goto("/", { waitUntil: "load" });
  const header = page.locator("header").first();

  const restBox = await header.boundingBox();
  expect(restBox!.height, `rest height ${restBox!.height} should be ~96`).toBeGreaterThanOrEqual(94);
  expect(restBox!.height).toBeLessThanOrEqual(98);
  const restFilter = await header.evaluate((el) => {
    const s = getComputedStyle(el);
    return s.getPropertyValue("backdrop-filter") || s.getPropertyValue("-webkit-backdrop-filter");
  });
  expect(["none", ""], `rest backdrop-filter was "${restFilter}"`).toContain(restFilter);

  // Scroll past the threshold; retry until the client `useScrollY` listener has hydrated and the
  // 250 ms compaction transition has settled (avoids a fixed sleep racing hydration).
  await page.evaluate(() => window.scrollTo(0, 240));
  await expect(async () => {
    await page.evaluate(() => window.scrollTo(0, 240));
    const compactBox = await header.boundingBox();
    expect(
      compactBox!.height,
      `compact height ${compactBox!.height} should be ~68`,
    ).toBeGreaterThanOrEqual(66);
    expect(compactBox!.height).toBeLessThanOrEqual(70);
    const compactFilter = await header.evaluate((el) => {
      const s = getComputedStyle(el);
      return s.getPropertyValue("backdrop-filter") || s.getPropertyValue("-webkit-backdrop-filter");
    });
    expect(compactFilter, `compact backdrop-filter was "${compactFilter}"`).toContain("blur(12px)");
  }).toPass({ timeout: 6000 });
});

// ---------------------------------------------------------------------------
// S04.04 — NavPill sits behind the active nav link
// ---------------------------------------------------------------------------
test("active nav link is marked current and shows the NavPill", async ({ page }) => {
  test.skip(width(page) < 1024, "primary nav is visible at md+ (measured at desktop widths)");
  await page.goto("/", { waitUntil: "load" });
  const active = page.locator('nav[aria-label="Primary"] a[aria-current="page"]');
  await expect(active).toHaveText("Home");
  await expect(active.locator('span[aria-hidden="true"]').first()).toBeVisible();
});

// ---------------------------------------------------------------------------
// S04.05 — MobileMenu: opens, traps focus, Esc closes & restores focus, axe clean
// ---------------------------------------------------------------------------
test("mobile menu opens, traps focus, closes on Esc and restores focus (axe clean)", {
  tag: "@EVAL-006",
}, async ({ page, axe }) => {
  test.skip(width(page) !== 390, "mobile menu is the w390 navigation");
  await page.goto("/", { waitUntil: "load" });

  const toggle = page.locator('button[aria-label="Open menu"]');
  await expect(toggle).toBeVisible();

  const dialog = page.locator('dialog[aria-label="Site navigation"]');
  // Retry the click until it registers — the onClick handler only exists after hydration.
  await expect(async () => {
    await toggle.click();
    await expect(dialog).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 6000 });

  await axe(page);

  const focusInside = await page.evaluate(() => {
    const d = document.querySelector('dialog[aria-label="Site navigation"]');
    return !!(d && document.activeElement && d.contains(document.activeElement));
  });
  expect(focusInside, "focus must move inside the modal dialog").toBeTruthy();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.locator('button[aria-label="Open menu"]')).toBeFocused();
});

// ---------------------------------------------------------------------------
// S04.02 — SkipLink is the first tab stop and jumps to #main
// ---------------------------------------------------------------------------
test("skip link is the first tab stop and targets #main", async ({ page }) => {
  test.skip(width(page) !== 1440, "keyboard skip-link check runs at w1440");
  await page.goto("/", { waitUntil: "load" });
  await page.keyboard.press("Tab");
  const skip = page.locator('a[href="#main"]');
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

// ---------------------------------------------------------------------------
// S11.01 — AskAIButton is a live control that opens the AskPanel (TKT-11 wired the real Ask;
// the M-001 tracer's aria-disabled "coming in this build" state was removed here).
// ---------------------------------------------------------------------------
test("Ask AI control is live, focusable, and opens the AskPanel", async ({ page }) => {
  test.skip(width(page) !== 1440, "Ask AI button is desktop-only (hidden on mobile)");
  await page.goto("/", { waitUntil: "load" });
  // Scope to the visible desktop control (the closed MobileMenu <dialog> holds a hidden duplicate).
  const ask = page.locator("header button").filter({ hasText: "Ask AI" }).filter({ visible: true }).first();
  await expect(ask).toBeVisible();
  await expect(ask).not.toHaveAttribute("aria-disabled", "true");
  await ask.focus();
  await expect(ask).toBeFocused();
  await ask.click();
  await expect(page.locator("dialog.ask-panel")).toBeVisible();
});

// ---------------------------------------------------------------------------
// E-13 — resume placeholder resolves to /contact#resume; /resume.pdf is 404
// ---------------------------------------------------------------------------
test("resume placeholder points at /contact#resume and /resume.pdf is 404", async ({ page }) => {
  test.skip(width(page) !== 1440, "runs once at w1440");
  await page.goto("/", { waitUntil: "load" });
  // Hero resume CTA is the first /contact#resume link in <main> (the FinalCTA carries a second one
  // since TKT-14, and the MobileMenu's closed <dialog> holds a hidden duplicate) — scope to the hero.
  const resume = page
    .locator('main a[href="/contact#resume"]', { hasText: "Resume — updating" })
    .first();
  await expect(resume).toBeVisible();
  const res = await page.request.get("/resume.pdf");
  expect(res.status(), "/resume.pdf must 404 while resumeAvailable=false").toBe(404);
});
