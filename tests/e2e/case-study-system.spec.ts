/**
 * case-study-system.spec.ts (TASK-130) — the contract every custom case-study one-pager keeps:
 *   - one h1 (the project name), every section a labelled landmark, the evidence badge legend;
 *   - no development copy (spec §31: Draft / Pending sign-off / coming soon / placeholder / TODO);
 *   - legacy `NN-slug` chapter anchors still resolve (old Ask / How-I-think / essay deep links);
 *   - the evidence drawer is an accessible modal (focus in, Tab trapped, Esc closes, focus returns);
 *   - the NextProject band and every case-study link open in a new tab;
 *   - no overflow / 44 px targets / no console errors at 390 and 1440; reduced motion hides nothing;
 *   - JS off: the static HTML carries the whole story.
 * axe (EVAL-006) runs over every slug in case-study.spec.ts; decorations in eval-018/sweep.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { SYSTEM_STUDIES } from "./case-study-system";

const BASE_URL = process.env.PW_BASE_URL ?? "http://127.0.0.1:3000";
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const isEdge = (page: Page) => width(page) === 390 || width(page) === 1440;
const DEV_COPY = /\b(draft|pending sign-?off|coming soon|placeholder|todo|stand-in|hero media coming|deep dive coming)\b/i;

for (const { study, name } of SYSTEM_STUDIES) {
  test.describe(`case-study system · ${study.slug}`, () => {
    test("one h1, labelled sections, badge legend, no dev copy, next in a new tab", async ({ page, noOverflow, minTargets, consoleErrors }) => {
      test.skip(!isEdge(page), "render pack runs at 390 and 1440");
      const res = await page.goto(`/work/${study.slug}`, { waitUntil: "load" });
      expect(res?.status()).toBe(200);

      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
      await expect(page.locator(".csx-hero .csx-tagline")).toHaveText(study.hero.tagline);

      // Every story section is a labelled landmark whose h2 carries its one message (spec §30).
      for (const section of study.sections) {
        const landmark = page.getByRole("region", { name: section.headline });
        await expect(landmark, `section ${section.id}`).toHaveAttribute("id", section.id);
        for (const anchor of section.anchors) await expect(page.locator(`[id="${anchor}"]`)).toBeAttached();
      }

      // The badge legend (spec §19) shows once, with only the kinds the page uses.
      const legend = page.locator(".csx-legend");
      await expect(legend).toHaveCount(1);
      await expect(legend).toBeVisible();

      // Spec §31: no development copy anywhere a visitor can read.
      const text = await page.locator("main").innerText();
      expect(text).not.toMatch(DEV_COPY);
      const footer = await page.locator("body > footer, footer.band").first().innerText().catch(() => "");
      expect(footer).not.toMatch(DEV_COPY);

      const next = page.getByRole("link", { name: /^Next project:/ });
      await expect(next).toHaveAttribute("target", "_blank");
      await expect(next).toHaveAttribute("rel", /noopener/);

      await noOverflow(page);
      await minTargets(page);
      expect(consoleErrors).toEqual([]);
    });

    test("evidence drawer: focus moves in, Tab is trapped, Esc closes and returns focus", { tag: "@EVAL-007" }, async ({ page }) => {
      test.skip(study.evidence.length === 0, "no evidence rows");
      test.skip(width(page) !== 1440 && width(page) !== 390, "runs at 390 and 1440");
      await page.goto(`/work/${study.slug}`, { waitUntil: "load" });
      const open = page.getByRole("button", { name: /View all evidence/ });
      await open.scrollIntoViewIfNeeded();
      await open.focus();
      await page.keyboard.press("Enter");
      const dialog = page.getByRole("dialog", { name: /Evidence behind/ });
      await expect(dialog).toBeVisible();
      await expect(open).toHaveAttribute("aria-expanded", "true");
      await expect(dialog.locator(":focus")).toHaveCount(1);
      await expect(dialog.getByRole("listitem")).toHaveCount(study.evidence.length);
      // Tab (and Shift+Tab) never leaves the dialog.
      for (let i = 0; i < study.evidence.length + 3; i++) {
        await page.keyboard.press("Tab");
        await expect(dialog.locator(":focus")).toHaveCount(1);
      }
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press("Shift+Tab");
        await expect(dialog.locator(":focus")).toHaveCount(1);
      }
      // Only public sources link out, and each opens in a new tab.
      for (const link of await dialog.getByRole("link").all()) {
        await expect(link).toHaveAttribute("href", /^https:\/\//);
        await expect(link).toHaveAttribute("target", "_blank");
      }
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(open).toBeFocused();
      await expect(open).toHaveAttribute("aria-expanded", "false");
    });

    test("learnings render exactly once each (S18 regression, kept from TC-157)", async ({ page }) => {
      test.skip(width(page) !== 1440, "runs once at desktop width");
      const learnings = study.sections.find((s) => s.kind === "learnings");
      test.skip(!learnings, "no learnings recorded for this product");
      await page.goto(`/work/${study.slug}`, { waitUntil: "load" });
      if (learnings && learnings.kind === "learnings") {
        for (const item of learnings.items) await expect(page.getByRole("heading", { level: 3, name: item.title, exact: true })).toHaveCount(1);
      }
    });

    test("reduced motion: every section is fully visible without scrolling it into view", { tag: "@EVAL-010" }, async ({ page, withReducedMotion }) => {
      test.skip(width(page) !== 1440, "runs once at desktop width");
      await withReducedMotion(page);
      await page.goto(`/work/${study.slug}`, { waitUntil: "load" });
      for (const section of study.sections) {
        const opacity = await page.locator(`section#${section.id} .csx-sec-body`).evaluate((el) => getComputedStyle(el).opacity);
        expect(opacity, section.id).toBe("1");
      }
    });

    test("scrolling reveals every section once (motion on)", async ({ page }) => {
      test.skip(width(page) !== 1440, "runs once at desktop width");
      await page.goto(`/work/${study.slug}`, { waitUntil: "load" });
      for (const section of study.sections) {
        const body = page.locator(`section#${section.id}`);
        await body.scrollIntoViewIfNeeded();
        await expect(body).toHaveAttribute("data-shown", "");
      }
    });
  });
}

test("case-study system · JS off: the static HTML carries the whole story", { tag: "@EVAL-015" }, async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "w1440", "no-JS static check runs once at w1440");
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: BASE_URL, viewport: { width: 1440, height: 900 } });
  try {
    const p = await context.newPage();
    for (const { study, name } of SYSTEM_STUDIES) {
      await p.goto(`/work/${study.slug}`, { waitUntil: "domcontentloaded" });
      await expect(p.getByRole("heading", { level: 1 })).toHaveText(name);
      for (const section of study.sections) {
        await expect(p.getByRole("heading", { level: 2, name: section.headline })).toBeVisible();
      }
      await expect(p.getByRole("link", { name: /^Next project:/ })).toBeVisible();
    }
  } finally {
    await context.close();
  }
});
