/**
 * lenis-route-reset.spec.ts (TASK-270) — clicking an internal link while Lenis is still easing used to open the
 * next page part-way down (audit: /work -> /projects settled at y=2400). The new page must open at the top.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

async function wheelThenNavigate(page: Page, from: string, to: string) {
  await page.goto(from, { waitUntil: "load" });
  await expect(page.locator("html.lenis")).toHaveCount(1);
  await page.waitForTimeout(1_000);
  await page.mouse.move(700, 450);
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(30);
  }
  // Still easing: the click lands mid-flight.
  await page.waitForTimeout(250);
  await page.locator(`header a[href="${to}"]`).first().evaluate((a) => (a as HTMLElement).click());
  await page.waitForURL(`**${to}`);
  await page.waitForTimeout(1_200);
}

test.describe("Lenis route change opens at the top (TASK-270, w1440)", () => {
  test.beforeEach(async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) !== 1440, "Lenis is mounted at the desktop fine-pointer project");
  });

  const routes: [string, string][] = [
    ["/work", "/projects"],
    ["/about", "/certifications"],
  ];
  for (const [from, to] of routes) {
    test(`${from} -> ${to} mid-ease lands at scrollY 0`, async ({ page }) => {
      await wheelThenNavigate(page, from, to);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });
  }
});
