/**
 * case-study.spec.ts (TKT-19 → TASK-130, `pnpm test:e2e --grep 'case-study'`) — the route-level gate
 * every case study shares. TASK-130 replaced the §7.3 template (30-sec / Deep dive tabs, chapters,
 * Show the thinking) with the one-pager system (Design.md Dev-128); its per-page contract — one h1,
 * labelled sections, badge legend, no dev copy, evidence drawer, motion, JS-off — lives in
 * case-study-system.spec.ts. This file keeps what is route-wide: axe on every slug (EVAL-006), the
 * card → study hop (now a new tab, Dev-129) and the next-project band.
 */
import { test, expect } from "./fixtures";
import { SYSTEM_STUDIES } from "./case-study-system";

const BASE_URL = process.env.PW_BASE_URL ?? "http://127.0.0.1:3000";
const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;
const isEdge = (page: import("@playwright/test").Page) => width(page) === 390 || width(page) === 1440;
void BASE_URL;

// ---------------------------------------------------------------------------
// Every slug: axe wcag2.1 AA at 390 & 1440
// ---------------------------------------------------------------------------
for (const { study } of SYSTEM_STUDIES) {
  test(`case-study · ${study.slug} is axe-clean`, { tag: "@EVAL-006" }, async ({ page, axe }) => {
    test.skip(!isEdge(page), "axe runs at 390 and 1440");
    await page.goto(`/work/${study.slug}`, { waitUntil: "load" });
    await axe(page);
  });
}

// ---------------------------------------------------------------------------
// View-Transition fallback: /projects card → case study lands on the identical end state (EXE-5; the
// index moved from /work to /projects in TKT-101 — the study itself stays at /work/<slug>).
// ---------------------------------------------------------------------------
test("case-study · VT off: /projects card navigates to the study with identical end state", {
  tag: "@EVAL-015",
}, async ({ page, noViewTransitions, withReducedMotion }) => {
  test.skip(!isEdge(page), "VT fallback verified at 390 and 1440");
  await noViewTransitions(page);
  await withReducedMotion(page);
  // TASK-116: the Portfolio panel links only the selected product's study — deep-link RailCite first.
  await page.goto("/projects?product=railcite", { waitUntil: "load" });

  const hasVT = await page.evaluate(() => typeof document.startViewTransition === "function");
  expect(hasVT, "startViewTransition must be absent so the EXE-5 fallback runs").toBeFalsy();

  await expect(page.getByRole("tabpanel")).toHaveAttribute("data-active-product", "railcite");
  // TASK-130: the case study opens in a new tab; the new page lands on the same end state.
  const card = page.locator('a[href="/work/railcite"]').first();
  await expect(card).toHaveAttribute("target", "_blank");
  const [study] = await Promise.all([page.waitForEvent("popup"), card.click()]);
  await study.waitForLoadState("load");
  expect(new URL(study.url()).pathname).toBe("/work/railcite");
  await expect(study.getByRole("heading", { level: 1 })).toHaveText("RailCite");
  await expect(study.locator('[style*="project-railcite"]')).toBeVisible();
  await study.close();
});

// ---------------------------------------------------------------------------
// TKT-81 next band (kept through TASK-130): the whole navy section is one link with a kraft focus
// ring; it now opens the next study in a new tab.
// ---------------------------------------------------------------------------
test("case-study · TKT-81 next band: the whole section is one link with a kraft focus ring", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "runs once at desktop width");
  await page.goto("/work/teachspark", { waitUntil: "load" });
  const band = page.locator('section[aria-label="Next project"]');
  await expect(band.locator("a")).toHaveCount(1);
  const link = band.locator("a");
  await expect(link).toHaveAttribute("href", "/work/railcite");
  await expect(link).toHaveAttribute("target", "_blank"); // TASK-130 (Dev-129)
  await expect(link.locator("h2")).toContainText("RailCite");
  // Keyboard focus (not a click) so :focus-visible applies.
  await link.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(link).toBeFocused();
  const ring = await link.evaluate((el) => {
    const s = getComputedStyle(el);
    const probe = document.createElement("span");
    probe.style.color = "var(--color-kraft)";
    document.body.appendChild(probe);
    const kraft = getComputedStyle(probe).color;
    probe.remove();
    return { w: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor, kraft };
  });
  expect(ring.w).toBe("2px");
  expect(ring.style).toBe("solid");
  expect(ring.color).toBe(ring.kraft);
});
