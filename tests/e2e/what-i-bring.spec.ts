/**
 * what-i-bring.spec.ts — TASK-216: the Experience page "What I Bring" journey (section#skills): one paper-cut landscape,
 * seven stage markers, a stage panel and a seven-stage track, all driven by one selection. Runs in all four viewport projects
 * (w390 / w768 / w1024 / w1440). The side-by-side layout starts at 960 px.
 */
import { expect, test } from "./fixtures";

const FORBIDDEN = /langchain|planview|confluence|\bmiro\b|\bOKRs?\b/i;
const TITLES = ["Ambiguity", "Discovery", "Product", "AI + GenAI", "Technology", "Execution", "Impact"];
const ids = ["ambiguity", "discovery", "product", "ai-genai", "technology", "execution", "impact"];

test.describe("@TASK-216 What I Bring journey", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/work");
    await page.locator("section#skills").scrollIntoViewIfNeeded();
  });

  const panel = (page: import("@playwright/test").Page, id: string) => page.locator(`#wib-panel-${id}`);

  test("seven tabs in order, stage 01 selected on load, one visible panel, the statement", async ({ page }) => {
    const tabs = page.locator("section#skills [role='tab']");
    await expect(tabs).toHaveCount(7);
    await expect(tabs.locator(".wibj-tab-name")).toHaveText(TITLES);
    await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("section#skills h2")).toHaveText("What I Bring");
    await expect(page.locator("section#skills .wib-statement")).toHaveText("I turn ambiguous problems into shipped products.");
    await expect(page.locator("[role='tabpanel']:visible")).toHaveCount(1);
    await expect(panel(page, "ambiguity")).toContainText("I ask the right questions.");
    await expect(panel(page, "ambiguity")).toContainText("01 / 07");
  });

  test("no horizontal overflow, and every stage control (tabs, markers, prev / next) is a 44 px target", async ({ page, noOverflow }) => {
    await noOverflow(page);
    for (const sel of ["[role='tab']", ".wibj-pin", ".wibj-step"]) {
      for (const el of await page.locator(sel).all()) {
        const box = await el.boundingBox();
        expect(box, sel).not.toBeNull();
        expect(box!.width, sel).toBeGreaterThanOrEqual(43.5);
        expect(box!.height, sel).toBeGreaterThanOrEqual(43.5);
      }
    }
  });

  test("a marker, a track tab and prev / next all update the panel and stay in sync", async ({ page }) => {
    await page.locator(".wibj-pin[data-n='4']").click();
    await expect(panel(page, "ai-genai")).toBeVisible();
    await expect(panel(page, "ai-genai")).toContainText("I turn AI capability into useful products.");
    await expect(panel(page, "ai-genai")).toContainText("RailCite");
    await expect(page.locator("#wib-tab-ai-genai")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".wibj-pin[data-n='4']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[role='tabpanel']:visible")).toHaveCount(1);

    await page.locator("#wib-tab-impact").click();
    await expect(panel(page, "impact")).toBeVisible();
    await expect(panel(page, "impact")).toContainText("12");
    await expect(panel(page, "impact")).toContainText("features in 11 months");
    await expect(panel(page, "impact")).toContainText("30%");
    await expect(panel(page, "impact")).toContainText("self-reported");
    await expect(panel(page, "impact")).toContainText("07 / 07");
    await expect(page.locator(".wibj-pin[data-n='7']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".wibj-pin[aria-pressed='true']")).toHaveCount(1);

    await page.getByRole("button", { name: "Previous stage" }).click();
    await expect(page.locator("#wib-tab-execution")).toHaveAttribute("aria-selected", "true");
    await expect(panel(page, "execution")).toBeVisible();
    await page.getByRole("button", { name: "Next stage" }).click();
    await page.getByRole("button", { name: "Next stage" }).click(); // wraps 07 -> 01
    await expect(page.locator("#wib-tab-ambiguity")).toHaveAttribute("aria-selected", "true");
    await expect(page).toHaveURL(/\/work$/);
    await expect(page.locator("[role='status']")).toContainText("Stage 1 of 7: Ambiguity");
  });

  test("keyboard: arrows, Home and End move the selection and focus along the track, with a visible ring", async ({ page }) => {
    await page.keyboard.press("Shift");
    const first = page.locator("#wib-tab-ambiguity");
    await first.focus();
    await expect(first).toBeFocused();
    const ring = await first.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
    });
    expect(ring.style).toBe("solid");
    expect(ring.width).toBeGreaterThanOrEqual(2);
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#wib-tab-discovery")).toBeFocused();
    await expect(page.locator("#wib-tab-discovery")).toHaveAttribute("aria-selected", "true");
    await expect(panel(page, "discovery")).toContainText("I find clarity in complexity.");
    await page.keyboard.press("End");
    await expect(page.locator("#wib-tab-impact")).toBeFocused();
    await expect(panel(page, "impact")).toBeVisible();
    await page.keyboard.press("ArrowRight"); // wraps
    await expect(page.locator("#wib-tab-ambiguity")).toBeFocused();
    await page.keyboard.press("Home");
    await expect(page.locator("#wib-tab-ambiguity")).toHaveAttribute("aria-selected", "true");
    // roving tabindex: exactly one tab is a tab stop
    expect(await page.locator("[role='tab'][tabindex='0']").count()).toBe(1);
  });

  test("every stage's content is in its panel (capabilities, tools) and shows no tool the data does not support", async ({ page }) => {
    for (const id of ids) {
      await page.locator(`#wib-tab-${id}`).click();
      await expect(panel(page, id)).toBeVisible();
      await expect(panel(page, id).locator(".wib-caps li").first()).toBeVisible();
      await expect(panel(page, id).locator(".wibj-art img")).toBeVisible();
      // the illustration is never cropped: its box keeps the art's own 880:663 ratio on every stage (TASK-216 follow-up)
      const art = await panel(page, id).locator(".wibj-art").boundingBox();
      expect(art, id).not.toBeNull();
      expect(Math.abs(art!.width / art!.height - 880 / 663), id).toBeLessThan(0.03);
    }
    const text = await page.locator("section#skills").evaluate((el) => el.textContent ?? "");
    expect(text).not.toMatch(FORBIDDEN);
    expect(text).toContain("Azure DevOps");
    expect(text).toContain("self-reported");
  });

  test("the landscape fits its frame and the selected marker is inside it", async ({ page, viewport }) => {
    await page.locator("#wib-tab-impact").click();
    await page.waitForTimeout(450);
    const frame = await page.locator(".wibj-frame").boundingBox();
    const pin = await page.locator(".wibj-pin[data-on] .wibj-pin-num").boundingBox();
    expect(pin!.x).toBeGreaterThanOrEqual(frame!.x - 1);
    expect(pin!.x + pin!.width).toBeLessThanOrEqual(frame!.x + frame!.width + 1);
    if (viewport!.width < 960) {
      // the crop is panned to the stage: the pin is near the middle of the frame
      expect(Math.abs(pin!.x + pin!.width / 2 - (frame!.x + frame!.width / 2))).toBeLessThan(frame!.width * 0.45);
    }
  });

  test("wide desktop: the landscape column and the panel end together for every stage (no gap over 60 px)", async ({ page, viewport }) => {
    test.skip(viewport!.width < 1280, "side-by-side layout only from 1280");
    for (const id of ids) {
      await page.locator(`#wib-tab-${id}`).click();
      const gap = await page.evaluate(() => {
        const card = document.querySelector(".wibj-card")!.getBoundingClientRect();
        const left = document.querySelector(".wibj-hint-l")!.getBoundingClientRect();
        return Math.abs(card.bottom - left.bottom);
      });
      expect(gap, id).toBeLessThanOrEqual(60);
    }
  });

  test("mobile: the track scrolls inside its own box, not the page", async ({ page, viewport }) => {
    test.skip(viewport!.width >= 960, "the track is a grid on desktop");
    const track = page.locator(".wibj-track");
    expect(await track.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    await page.locator("#wib-tab-impact").click();
    await page.waitForTimeout(500);
    expect(await track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("reduced motion: no transitions on the panel, markers or map", async ({ page, withReducedMotion }) => {
    await withReducedMotion(page);
    await page.locator("#wib-tab-technology").click();
    const durations = await page.evaluate(() =>
      [".wibj-panel", ".wibj-pin", ".wibj-map", ".wibj-tab"].map((sel) => {
        const el = document.querySelector(sel)!;
        return getComputedStyle(el).transitionDuration.split(",").every((d) => parseFloat(d) === 0);
      }),
    );
    expect(durations).toEqual([true, true, true, true]);
  });

  test("dark theme shows the dark landscape only", async ({ page }) => {
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
    await expect(page.locator(".wibj-land-dark")).toBeVisible();
    await expect(page.locator(".wibj-land-light")).toBeHidden();
  });
});
