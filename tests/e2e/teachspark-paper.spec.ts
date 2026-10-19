/**
 * teachspark-paper.spec.ts (TASK-263) — the TeachSpark paper-classroom layout (components/case-study/teachspark):
 *   - the seven numbered panels + hero + next band exist, in order, and the navigator targets all resolve;
 *   - every number on the page comes from the record: hero proofs (value, label, badge, date) and funnel steps;
 *   - light and dark both render the same layout (the matching art rendition is the visible one), no overflow;
 *   - a navigator jump never lands a panel heading under the sticky header + navigator;
 *   - the demo is poster-first: no iframe until Play, then the privacy-enhanced embed;
 *   - the shared template is untouched for other studies (they keep the `.csx` root).
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { getCaseStudy } from "@/data/case-studies";
import { formatAsOf } from "@/lib/format";

const study = getCaseStudy("teachspark")!;
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);

test.describe("teachspark paper layout", () => {
  test("structure: hero, seven numbered panels, next band; legacy anchors still resolve", async ({ page, noOverflow, consoleErrors }) => {
    await page.goto("/work/teachspark", { waitUntil: "load" });
    await expect(page.locator("article.tsp")).toHaveCount(1);
    await expect(page.locator("article.csx")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Less time preparing.");
    const chips = await page.locator(".tsp-panel .tsp-chip-n").allTextContents();
    expect(chips).toEqual(["01", "02", "03", "04", "05", "06", "07"]);
    for (const id of ["whatsapp-experience", "product-demo", "decisions", "system", "activation", "learnings", "explore"]) {
      await expect(page.locator(`section#${id}.tsp-panel`), id).toHaveCount(1);
    }
    for (const section of study.sections) for (const anchor of section.anchors) await expect(page.locator(`[id="${anchor}"]`)).toBeAttached();
    // every navigator link points at a real element
    for (const href of await page.locator(".tsp-nav-link").evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
      await expect(page.locator(`[id="${href!.slice(1)}"]`), String(href)).toHaveCount(1);
    }
    await expect(page.locator('section[aria-label="Next project"] a')).toHaveCount(1);
    await noOverflow(page);
    expect(consoleErrors).toEqual([]);
  });

  test("numbers come from the record: hero proofs and the activation funnel", async ({ page }) => {
    await page.goto("/work/teachspark", { waitUntil: "load" });
    const tiles = page.locator(".tsp-metric");
    await expect(tiles).toHaveCount(study.hero.proofs.length);
    for (const [i, proof] of study.hero.proofs.entries()) {
      const tile = tiles.nth(i);
      await expect(tile.locator(".tsp-metric-value")).toHaveText(proof.value);
      await expect(tile.locator(".tsp-metric-label")).toHaveText(proof.label);
      await expect(tile.locator(".csx-badge")).toContainText(proof.kind === "measured" ? "Measured" : "Self-reported");
      if (proof.asOf) await expect(tile.locator(".tsp-metric-date")).toHaveText(formatAsOf(proof.asOf));
    }
    const outcome = study.sections.find((s) => s.kind === "outcome");
    if (outcome?.kind !== "outcome" || !outcome.funnel) throw new Error("teachspark record lost its funnel");
    const steps = page.locator(".tsp-funnel-step");
    await expect(steps).toHaveCount(outcome.funnel.steps.length);
    for (const [i, step] of outcome.funnel.steps.entries()) {
      await expect(steps.nth(i).locator(".tsp-funnel-label")).toHaveText(step.label);
      await expect(steps.nth(i).locator(".tsp-funnel-value")).toContainText(String(step.value));
    }
    // the honest gaps stay visible next to the funnel
    for (const gap of outcome.gaps) await expect(page.locator(".tsp-gaps")).toContainText(gap);
  });

  for (const theme of ["light", "dark"] as const) {
    test(`${theme} theme renders the same layout with the matching art`, async ({ page, noOverflow }) => {
      await page.goto("/work/teachspark", { waitUntil: "load" });
      await setTheme(page, theme);
      const other = theme === "light" ? "dark" : "light";
      await expect(page.locator(`.tsp-hero-scene img[data-theme-art="${theme}"]`)).toBeVisible();
      await expect(page.locator(`.tsp-hero-scene img[data-theme-art="${other}"]`)).toBeHidden();
      await expect(page.locator(".tsp-hero-phone img")).toBeVisible();
      await page.locator("#system").scrollIntoViewIfNeeded();
      await expect(page.locator(`.tsp-arch-art img[data-theme-art="${theme}"]`)).toBeVisible();
      await noOverflow(page);
    });
  }

  test("axe-clean in dark as well (the shared case-study spec runs light)", async ({ page, axe }) => {
    await page.goto("/work/teachspark", { waitUntil: "load" });
    await setTheme(page, "dark");
    await axe(page);
  });

  test("navigator jump keeps the panel heading clear of the sticky header and navigator", async ({ page }) => {
    test.skip(width(page) < 768, "the jump offset is checked at tablet and desktop");
    await page.goto("/work/teachspark", { waitUntil: "load" });
    await page.getByRole("link", { name: "Decisions", exact: true }).click();
    await page.waitForTimeout(700);
    const { headTop, covered } = await page.evaluate(() => {
      const h = document.querySelector("#decisions-h")!.getBoundingClientRect();
      const nav = document.querySelector(".tsp-nav")!.getBoundingClientRect();
      return { headTop: h.top, covered: h.top < nav.bottom };
    });
    expect(covered, `heading top ${headTop}`).toBe(false);
  });

  test("demo video is poster-first, then the privacy-enhanced embed", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.goto("/work/teachspark", { waitUntil: "load" });
    await page.locator("#product-demo").scrollIntoViewIfNeeded();
    await expect(page.locator("#product-demo iframe")).toHaveCount(0);
    await page.locator("#product-demo").getByRole("button", { name: /^Play / }).click();
    await expect(page.locator("#product-demo iframe")).toHaveAttribute("src", /^https:\/\/www\.youtube-nocookie\.com\/embed\//);
  });

  test("keyboard focus is visible on the hero actions and tiles", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.goto("/work/teachspark", { waitUntil: "load" });
    await page.locator(".tsp-btn-primary").focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    const outline = await page.locator(".tsp-btn-primary").evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).toBe("solid");
  });

  test("another case study keeps its own layout (Urja stays on the shared template)", async ({ page }) => {
    test.skip(width(page) !== 1440, "runs once at desktop width");
    await page.goto("/work/urja", { waitUntil: "load" });
    await expect(page.locator("article.csx").first()).toBeAttached();
    await expect(page.locator(".tsp")).toHaveCount(0);
    await expect(page.locator(".rcp")).toHaveCount(0);
  });
});
