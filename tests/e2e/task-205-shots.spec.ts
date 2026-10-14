/**
 * task-205-shots.spec.ts (TASK-205, mobile redesign) — visual QA: every main route, light + dark, viewport-top and full-page,
 * plus the More sheet open (phones). Writes docs/screenshots/m-013/task-205/<SHOTS_TAG|after>/. Opt-in: skipped unless T205_SHOTS=1.
 * Run with --project=w390 --project=w768 (add w1440 for the desktop regression set).
 */
import { mkdirSync } from "node:fs";
import { test } from "./fixtures";
import { THEME_KEY } from "@/lib/theme";

const OUT = `docs/screenshots/m-013/task-205/${process.env.SHOTS_TAG ?? "after"}`;
const ROUTES: Array<[string, string]> = [
  ["home", "/"],
  ["portfolio", "/projects"],
  ["project", "/work/railcite"],
  ["experience", "/work"],
  ["about", "/about"],
  ["certifications", "/certifications"],
  ["lab", "/lab"],
];

test.describe("TASK-205 screenshots", () => {
  test.skip(!process.env.T205_SHOTS, "opt-in: T205_SHOTS=1");
  test.setTimeout(240_000);
  for (const theme of ["light", "dark"] as const) {
    test(`shots ${theme}`, async ({ page }) => {
      mkdirSync(OUT, { recursive: true });
      const w = page.viewportSize()!.width;
      await page.addInitScript(([k, t]) => window.localStorage.setItem(k, t), [THEME_KEY, theme] as const);
      for (const [name, route] of ROUTES) {
        const res = await page.goto(route, { waitUntil: "load" });
        if (!res || res.status() >= 400) continue;
        await page.waitForTimeout(name === "lab" ? 6000 : 1200);
        await page.screenshot({ path: `${OUT}/${name}-${theme}-${w}-top.png` });
        if (name === "lab") continue;
        // Scroll through once so one-shot reveals have fired, then capture the whole page.
        const h = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < h; y += 600) {
          await page.evaluate((top) => window.scrollTo(0, top), y);
          await page.waitForTimeout(250);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(600);
        await page.screenshot({ path: `${OUT}/${name}-${theme}-${w}-full.png`, fullPage: true });
      }
      if (w === 390) {
        // the 375 px phone (iPhone SE/mini class): first screen of every route, plus a no-horizontal-scroll check
        await page.setViewportSize({ width: 375, height: 667 });
        for (const [name, route] of ROUTES) {
          await page.goto(route, { waitUntil: "load" });
          await page.waitForTimeout(name === "lab" ? 6000 : 1200);
          await page.screenshot({ path: `${OUT}/${name}-${theme}-375-top.png` });
          const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          if (over > 0) throw new Error(`${route} scrolls horizontally by ${over}px at 375`);
        }
        await page.setViewportSize({ width: 390, height: 844 });
      }
      if (w < 640) {
        await page.goto("/", { waitUntil: "load" });
        const more = page.getByRole("button", { name: "More" });
        if (await more.isVisible()) {
          await more.click();
          await page.waitForTimeout(500);
          await page.screenshot({ path: `${OUT}/more-menu-${theme}-${w}.png` });
          await page.keyboard.press("Escape");
        }
      }
      // Ask Tushky (the existing panel, opened from the header) at every width.
      await page.goto("/", { waitUntil: "load" });
      await page.locator("header").getByRole("button", { name: "Ask AI" }).click();
      await page.waitForTimeout(900);
      await page.screenshot({ path: `${OUT}/ask-${theme}-${w}.png` });
    });
  }
});
