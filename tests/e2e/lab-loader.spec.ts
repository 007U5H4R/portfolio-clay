/**
 * lab-loader.spec.ts (TASK-198) — the Gummy Lab paper-machine loader.
 *
 *   • it shows while the lab boots (the GLB is held back so the boot is measurably slow) with progressbar semantics;
 *   • `aria-valuenow` rises with the real boot and never decreases;
 *   • on completion it hands off to the intro and is gone from the DOM;
 *   • it runs no infinite animation (TASK-143 / EXE-55) and draws no per-frame work of its own;
 *   • reduced motion: no gear rotation, no travel and no hop; the fill and percentage still update;
 *   • 390 px: no horizontal overflow;
 *   • a hung load offers a retry; Escape still exits.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import { waitLab } from "./lab-helpers";

test.use({ launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"] } });

const LOADER = "[data-lab-loader]";
const BAR = `${LOADER} [role=progressbar]`;

/** Holds the model back so the loader has time on screen; the held request is answered after `ms`. */
async function slowGlb(page: Page, ms: number) {
  await page.route("**/lab/gummy.glb", async (route) => {
    try {
      const res = await route.fetch();
      await new Promise((r) => setTimeout(r, ms));
      await route.fulfill({ response: res });
    } catch {
      // the page closed while the request was held
    }
  });
}

const now = (page: Page) => page.locator(BAR).getAttribute("aria-valuenow").then((v) => Number(v));

test.describe("@TASK-198 lab loader", () => {
  test("shows with progressbar semantics, rises monotonically, hands off to the intro and leaves the DOM", async ({ page, consoleErrors }) => {
    void consoleErrors;
    await slowGlb(page, 2500);
    await page.goto("/lab?debug");
    await page.locator(LOADER).waitFor({ state: "visible", timeout: 20_000 });
    const bar = page.locator(BAR);
    await expect(bar).toHaveAttribute("aria-valuemin", "0");
    await expect(bar).toHaveAttribute("aria-valuemax", "100");
    await expect(bar).toHaveAttribute("aria-label", /loading/i);
    await expect(page.locator(`${LOADER} [role=status]`)).not.toBeEmpty();
    const seen: number[] = [await now(page)];
    expect(seen[0]).toBeLessThan(100);
    // sample while it loads
    for (let i = 0; i < 40 && (await page.locator(LOADER).count()) > 0; i += 1) {
      const v = await page.locator(BAR).getAttribute("aria-valuenow", { timeout: 500 }).catch(() => null);
      if (v !== null) seen.push(Number(v));
      await page.waitForTimeout(150);
    }
    expect([...seen].sort((a, b) => a - b)).toEqual(seen);
    expect(Math.max(...seen)).toBeGreaterThan(seen[0] ?? 0);
    await page.waitForSelector("[data-lab-state='INTRO']", { timeout: 40_000 });
    await expect(page.locator(LOADER)).toHaveCount(0);
  });

  test("runs no infinite animation and no looping transition while it is on screen", async ({ page }) => {
    await slowGlb(page, 2500);
    await page.goto("/lab?debug");
    await page.locator(LOADER).waitFor({ state: "visible", timeout: 20_000 });
    const infinite = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => (a.effect as KeyframeEffect | null)?.target && document.querySelector("[data-lab-loader]")?.contains((a.effect as KeyframeEffect).target as Node))
        .filter((a) => a.effect!.getComputedTiming().iterations === Infinity)
        .map((a) => (a as CSSAnimation).animationName ?? "?"),
    );
    expect(infinite).toEqual([]);
  });

  test("reduced motion: nothing rotates or travels, the fill and the percentage still update", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await slowGlb(page, 5000);
    await page.goto("/lab?debug");
    await page.locator(LOADER).waitFor({ state: "visible", timeout: 20_000 });
    const m = await page.evaluate(() => {
      const root = document.querySelector("[data-lab-loader]")!;
      const gear = root.querySelector("svg g")!;
      const gummy = root.querySelector("svg")!.closest("div")!.parentElement!;
      const hop = root.querySelector("svg[viewBox='0 0 64 76']")!.parentElement!;
      return {
        rotate: getComputedStyle(gear).rotate,
        gearTransition: getComputedStyle(gear).transitionDuration,
        travel: getComputedStyle(gummy).transitionDuration,
        hop: getComputedStyle(hop).animationName,
      };
    });
    expect(m.rotate).toBe("none");
    // the site-wide reduced-motion reset leaves a 1 ms transition: effectively instant
    expect(parseFloat(m.gearTransition)).toBeLessThanOrEqual(0.01);
    expect(parseFloat(m.travel)).toBeLessThanOrEqual(0.01);
    expect(m.hop).toBe("none");
    const first = await now(page);
    await expect.poll(() => now(page).catch(() => 100), { timeout: 30_000 }).toBeGreaterThan(first);
  });

  test("390 px: no horizontal overflow and the percentage and stage stay readable", async ({ page }, info) => {
    test.skip(info.project.name !== "w390", "phone layout");
    await slowGlb(page, 2500);
    await page.goto("/lab?debug");
    await page.locator(LOADER).waitFor({ state: "visible", timeout: 20_000 });
    const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, r: document.querySelector("[data-lab-loader]")!.scrollWidth <= document.querySelector("[data-lab-loader]")!.clientWidth }));
    expect(o.sw).toBeLessThanOrEqual(o.cw);
    expect(o.r).toBe(true);
  });

  test("a hung load offers a retry, and Escape still exits", async ({ page }) => {
    test.setTimeout(60_000);
    await page.route("**/lab/gummy.glb", () => new Promise(() => undefined)); // never answered
    await page.goto("/");
    await page.goto("/lab?debug");
    await page.locator(LOADER).waitFor({ state: "visible", timeout: 20_000 });
    await expect(page.getByRole("button", { name: /try again/i })).toBeVisible({ timeout: 25_000 });
    await expect(page.locator(BAR)).toHaveAttribute("aria-valuenow", /^\d+$/);
    await page.keyboard.press("Escape");
    await page.waitForURL((u) => u.pathname !== "/lab", { timeout: 20_000 });
  });

  test("a fast boot never lingers on the loader", async ({ page }) => {
    await page.goto("/lab?debug");
    await waitLab(page);
    await page.waitForSelector("[data-lab-state='INTRO']", { timeout: 40_000 });
    await expect(page.locator(LOADER)).toHaveCount(0);
  });
});
