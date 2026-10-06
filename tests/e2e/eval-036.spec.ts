/**
 * eval-036.spec.ts (`@EVAL-036`, evaluation-plan §10, M-011 P6 / TASK-161) — runtime half of "no continuous expensive
 * animation" (the static keyframe scan is tests/unit/eval-036.test.ts): the footer ocean's infinite loops run only while the
 * strip is on screen (OceanGate), are paused when the footer is covered (the Gummy Lab marks it `inert`; checked through the
 * same attribute so the test does not wait for the lab's WebGL boot — EVAL-030 owns that), and nothing in the ocean carries
 * a filter. Idle decoration causes no long task. Runs at 390 and 1440.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

test.skip(({ viewport }) => ![390, 1440].includes(viewport!.width), "EVAL-036 runs at 390 and 1440");

const oceanAnimations = (page: Page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => (a.effect as KeyframeEffect | null)?.target?.closest?.("[data-band-ocean]"))
      .map((a) => ({ name: (a as CSSAnimation).animationName, state: a.playState, infinite: a.effect?.getComputedTiming().iterations === Infinity })),
  );

test.describe("@EVAL-036 footer ocean", () => {
  test("loops are paused while the footer is off-screen and run when it is on screen", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(500);
    const off = await oceanAnimations(page);
    expect(off.length, "the ocean has animations").toBeGreaterThan(0);
    expect(off.filter((a) => a.infinite && a.state === "running"), "infinite loops running off-screen").toEqual([]);

    await page.locator("[data-band-ocean]").scrollIntoViewIfNeeded();
    await expect.poll(async () => (await oceanAnimations(page)).filter((a) => a.infinite && a.state === "running").length, { timeout: 5000 }).toBeGreaterThanOrEqual(3);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect.poll(async () => (await oceanAnimations(page)).filter((a) => a.infinite && a.state === "running").length, { timeout: 5000 }).toBe(0);
  });

  test("loops pause when the footer is covered (inert) even though it is on screen", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.locator("[data-band-ocean]").scrollIntoViewIfNeeded();
    await expect.poll(async () => (await oceanAnimations(page)).filter((a) => a.infinite && a.state === "running").length, { timeout: 5000 }).toBeGreaterThanOrEqual(3);
    await page.evaluate(() => document.querySelector("footer")!.setAttribute("inert", ""));
    await expect.poll(async () => (await oceanAnimations(page)).filter((a) => a.infinite && a.state === "running").length, { timeout: 5000 }).toBe(0);
    await page.evaluate(() => document.querySelector("footer")!.removeAttribute("inert"));
    await expect.poll(async () => (await oceanAnimations(page)).filter((a) => a.infinite && a.state === "running").length, { timeout: 5000 }).toBeGreaterThanOrEqual(3);
  });

  test("no element in the ocean carries a filter", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const filtered = await page.evaluate(() =>
      [...document.querySelectorAll("[data-band-ocean], [data-band-ocean] *")].filter((el) => getComputedStyle(el).filter !== "none").map((el) => String(el.className)),
    );
    expect(filtered).toEqual([]);
  });

  test("an idle home page causes no long task from decoration over 3 s", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __long: number }).__long = 0;
      try {
        new PerformanceObserver((l) => {
          (window as unknown as { __long: number }).__long += l.getEntries().length;
        }).observe({ type: "longtask", buffered: false });
      } catch {
        /* longtask unsupported */
      }
    });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.evaluate(() => ((window as unknown as { __long: number }).__long = 0));
    await page.waitForTimeout(3000);
    expect(await page.evaluate(() => (window as unknown as { __long: number }).__long)).toBe(0);
  });
});
