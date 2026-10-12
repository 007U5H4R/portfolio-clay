/**
 * what-i-bring.spec.ts — TASK-187: the Experience page "What I Bring" ambiguity-to-impact journey (section#skills).
 * Runs in all four viewport projects (w390 / w768 / w1024 / w1440). Desktop-only behaviour (the one-landscape layout,
 * fine-pointer hover and parallax) is skipped below 1100 px, where the section is the vertical tap-to-expand trail.
 */
import { expect, test } from "./fixtures";

const FORBIDDEN = /langchain|planview|confluence|\bmiro\b|\bOKRs?\b/i;

test.describe("@TASK-187 What I Bring journey", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/work");
    await page.locator("section#skills").scrollIntoViewIfNeeded();
  });

  test("renders the seven stages, in order, with the statement", async ({ page }) => {
    const stages = page.locator("section#skills ol.wib-stages > li");
    await expect(stages).toHaveCount(7);
    await expect(stages.locator(".wib-title")).toHaveText(["Ambiguity", "Discovery", "Product", "AI + GenAI", "Technology", "Execution", "Impact"]);
    await expect(page.locator("section#skills h2")).toHaveText("What I Bring");
    await expect(page.locator("section#skills .wib-statement")).toHaveText("I turn ambiguous problems into shipped products.");
  });

  test("no horizontal overflow at this width, and every stage control is a 44 px target", async ({ page, noOverflow }) => {
    await noOverflow(page);
    for (const card of await page.locator(".wib-card").all()) {
      const box = await card.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("shows no tool the data does not support", async ({ page }) => {
    // open every stage in turn so the detail text is also checked on pages where it is collapsed
    const text = await page.locator("section#skills").evaluate((el) => el.textContent ?? "");
    expect(text).not.toMatch(FORBIDDEN);
    expect(text).toContain("Azure DevOps");
    expect(text).toContain("self-reported");
  });

  test("keyboard focus shows a visible ring and opens the stage detail", async ({ page }) => {
    const card = page.locator(".wib-stage[data-stage='ai-genai'] .wib-card");
    await card.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(card).toBeFocused();
    const ring = await card.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
    });
    expect(ring.style).toBe("solid");
    expect(ring.width).toBeGreaterThanOrEqual(2);
    await expect(card).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#wib-panel-ai-genai")).toBeVisible();
    await expect(page.locator("#wib-panel-ai-genai")).toContainText("I turn AI capability into useful products.");
    await expect(page.locator("#wib-panel-ai-genai")).toContainText("TeachSpark");
  });

  test("desktop: the detail panel is never empty, stage 01 is selected on load; mobile starts collapsed", async ({ page, viewport }) => {
    const first = page.locator(".wib-stage[data-stage='ambiguity']");
    if (viewport!.width >= 1100) {
      await expect(first.locator(".wib-card")).toHaveAttribute("aria-expanded", "true");
      await expect(page.locator("#wib-panel-ambiguity")).toBeVisible();
      await expect(page.locator("#wib-panel-ambiguity")).toContainText("I ask the right questions.");
      await expect(page.locator(".wib-hint")).toBeVisible();
      expect(await page.locator(".wib-panel:visible").count()).toBe(1);
    } else {
      await expect(page.locator(".wib-panel:visible")).toHaveCount(0);
      await expect(first.locator(".wib-card")).toHaveAttribute("aria-expanded", "false");
    }
  });

  test("a tap or Enter expands a stage and everything is reachable without hover", async ({ page, viewport }) => {
    const card = page.locator(".wib-stage[data-stage='impact'] .wib-card");
    await card.click();
    const panel = page.locator("#wib-panel-impact");
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("12");
    await expect(panel).toContainText("features in 11 months");
    await expect(panel).toContainText("30%");
    await expect(panel).toContainText("self-reported");
    if (viewport!.width < 1100) {
      await card.click();
      await expect(card).toHaveAttribute("aria-expanded", "false");
    } else {
      // desktop keeps the last selection shown
      await card.click();
      await expect(panel).toBeVisible();
    }
  });

  test("reduced motion: no layer movement and no card lift", async ({ page, withReducedMotion }) => {
    await withReducedMotion(page);
    const card = page.locator(".wib-stage[data-stage='technology'] .wib-card");
    await card.click();
    await page.waitForTimeout(150);
    const moved = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".wib-layer")).some((el) => {
        const s = getComputedStyle(el);
        return !["none", "matrix(1, 0, 0, 1, 0, 0)"].includes(s.transform) || (s.translate !== "none" && s.translate !== "0px" && s.translate !== "0px 0px");
      }),
    );
    expect(moved).toBe(false);
    const lift = await card.evaluate((el) => getComputedStyle(el).translate);
    expect(["none", "0px", "0px 0px"]).toContain(lift);
  });

  test("desktop: hover opens a stage, the others recede but stay visible, parallax stays within 6 px", async ({ page, viewport }) => {
    test.skip(viewport!.width < 1100, "the landscape layout and fine-pointer hover are desktop-only");
    const stage = page.locator(".wib-stage[data-stage='discovery']");
    await stage.locator(".wib-card").hover();
    await expect(page.locator("#wib-panel-discovery")).toBeVisible();
    await expect(page.locator("#wib-panel-discovery")).toContainText("I find clarity in complexity.");
    await expect(page.locator("#wib-panel-ambiguity")).toBeHidden();
    const other = await page.locator(".wib-stage[data-stage='product'] .wib-card").evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(other)).toBeGreaterThan(0.5);
    const art = await stage.locator(".wib-art").boundingBox();
    await page.mouse.move(art!.x + art!.width - 2, art!.y + 2);
    await page.mouse.move(art!.x + art!.width - 1, art!.y + 3);
    await page.waitForTimeout(250);
    const px = await stage.locator(".wib-layer").evaluateAll((els) =>
      els.map((el) => {
        const t = getComputedStyle(el).translate.split(" ").map((v) => Math.abs(parseFloat(v)) || 0);
        return Math.max(...t);
      }),
    );
    for (const v of px) expect(v).toBeLessThanOrEqual(6.05);
    // leaving the journey keeps the last-selected stage shown (no collapse back to empty)
    await page.mouse.move(2, 2);
    await expect(stage.locator(".wib-card")).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#wib-panel-discovery")).toBeVisible();
  });
});
