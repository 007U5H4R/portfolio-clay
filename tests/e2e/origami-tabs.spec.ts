/**
 * origami-tabs.spec.ts (TASK-265) — the phone origami background on every dock tab, mounted once from the root layout.
 * Phone only (w390): Home, Xp, Portfolio, About, Certs render the layer in light and dark; it stays one node across a
 * client navigation; case studies / contact and the /projects product detail view do not show it; every background
 * animation stops under reduced motion; no horizontal overflow; the layer never takes taps. ≥ 640 hides it entirely.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const ROUTES = ["/", "/work", "/projects", "/about", "/certifications"];
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const layer = (page: Page) => page.getByTestId("projects-bg");
const visible = (page: Page) =>
  page.evaluate(() => {
    const el = document.querySelector('[data-testid="projects-bg"]');
    return !!el && getComputedStyle(el).display !== "none";
  });
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);

test.describe("origami background on every dock tab (TASK-265)", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`each dock tab renders the layer, never overflows, never takes taps (${theme})`, async ({ page }) => {
      test.skip(width(page) !== 390, "phone only; runs once");
      for (const path of ROUTES) {
        await page.goto(path, { waitUntil: "load" });
        await setTheme(page, theme);
        await expect(layer(page)).toHaveCount(1);
        expect(await visible(page), path).toBe(true);
        expect(await page.evaluate(() => getComputedStyle(document.querySelector(".ob-root")!).pointerEvents)).toBe("none");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        const img = await page.evaluate(() => getComputedStyle(document.querySelector(".ob-facet")!).backgroundImage);
        expect(img).toContain(`${theme}-facet`);
      }
    });
  }

  test("the same layer node survives a client navigation between tabs", async ({ page }) => {
    test.skip(width(page) !== 390, "phone only; runs once");
    await page.goto("/", { waitUntil: "load" });
    await page.locator('[data-testid="projects-bg"]').waitFor({ state: "attached" }); // the layer mounts after hydration
    await page.evaluate(() => ((document.querySelector('[data-testid="projects-bg"]') as HTMLElement & { __keep?: boolean }).__keep = true));
    await page.locator('nav[aria-label="Primary mobile"]').getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about$/);
    expect(await page.evaluate(() => (document.querySelector('[data-testid="projects-bg"]') as (HTMLElement & { __keep?: boolean }) | null)?.__keep)).toBe(true);
  });

  test("case studies and contact keep the plain paper", async ({ page }) => {
    test.skip(width(page) !== 390, "phone only; runs once");
    for (const path of ["/work/teachspark", "/contact"]) {
      await page.goto(path, { waitUntil: "load" });
      await expect(layer(page), path).toHaveCount(0);
    }
  });

  test("the /projects product detail view has no background; the list does", async ({ page }) => {
    test.skip(width(page) !== 390, "phone only; runs once");
    await page.goto("/projects", { waitUntil: "load" });
    await page.waitForFunction(() => Object.keys(document.querySelector(".pf-showcase")!).some((k) => k.startsWith("__react")));
    expect(await visible(page)).toBe(true);
    await page.locator(".pf-m-card").first().click();
    await expect(page.locator(".pf-showcase")).toHaveAttribute("data-view", "detail");
    expect(await visible(page)).toBe(false);
    await page.goBack();
    await expect(page.locator(".pf-showcase")).toHaveAttribute("data-view", "list");
    expect(await visible(page)).toBe(true);
  });

  test("every background animation stops under reduced motion on a non-projects tab", async ({ page }) => {
    test.skip(width(page) !== 390, "phone only; runs once");
    await page.goto("/about", { waitUntil: "load" });
    const running = () => page.evaluate(() => document.getAnimations().filter((a) => (a.effect as KeyframeEffect | null)?.target?.closest?.(".ob-root")).length);
    await expect.poll(running).toBeGreaterThan(0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(running).toBe(0);
  });

  test("at 640 and up the layer is not displayed", async ({ page }) => {
    test.skip(width(page) < 640, "desktop / tablet only");
    for (const path of ROUTES) {
      await page.goto(path, { waitUntil: "load" });
      expect(await visible(page), path).toBe(false);
    }
  });
});
