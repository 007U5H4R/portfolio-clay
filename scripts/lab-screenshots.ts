/**
 * lab-screenshots.ts (TASK-143.5) — captures `/lab` (intro, play, game over) in light and dark at 390
 * and 1440 into docs/screenshots/m-010/t2c/. Needs a running production build
 * (`pnpm build && pnpm start`) and a Chromium with WebGL (the SwiftShader flags are passed below).
 *   PLAYWRIGHT_BROWSERS_PATH=… pnpm tsx scripts/lab-screenshots.ts [baseUrl]
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
const OUT = resolve(process.cwd(), "docs/screenshots/m-010/t2c");

interface Handle {
  rt: { bearBody: { current: { setTranslation(p: { x: number; y: number; z: number }, w: boolean): void; setLinvel(v: { x: number; y: number; z: number }, w: boolean): void } | null }; engine: { action(k: string, id: number): void; activate(t: string): void } };
}
type Win = { __gummyLab: Handle };

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"] });
  for (const theme of ["light", "dark"] as const) {
    for (const width of [390, 1440] as const) {
      const height = width === 390 ? 844 : 900;
      const mobile = width === 390;
      const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: theme, hasTouch: mobile, isMobile: mobile, deviceScaleFactor: 1 });
      await ctx.addInitScript((t) => localStorage.setItem("portfolio-theme", t), theme);
      const page = await ctx.newPage();
      const name = (shot: string) => resolve(OUT, `lab-${shot}-${theme}-${width}.png`);
      await page.goto(`${BASE}/lab?debug`);
      await page.waitForSelector("[data-lab-state='INTRO']", { timeout: 60_000 });
      await page.waitForTimeout(4000);
      await page.screenshot({ path: name("intro") });

      await page.locator("[data-lab-play]").click();
      await page.waitForSelector("[data-lab-state='PLAYING']", { timeout: 60_000 });
      await page.waitForTimeout(3000);
      // a lively moment: bear mid-air, a combo building, a power-up running
      await page.evaluate(() => {
        const { rt } = (window as unknown as Win).__gummyLab;
        const rb = rt.bearBody.current!;
        rb.setTranslation({ x: 0.4, y: 1.6, z: 0 }, true);
        rb.setLinvel({ x: 0.5, y: 3, z: 0 }, true);
        [1, 2, 3, 4].forEach((i) => rt.engine.action("ring", i));
        rt.engine.activate("GOLDEN");
      });
      await page.waitForTimeout(1200);
      await page.screenshot({ path: name("play") });

      await page.evaluate(() => {
        const rb = (window as unknown as Win).__gummyLab.rt.bearBody.current!;
        rb.setTranslation({ x: 0, y: -4.9, z: 0 }, true);
        rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      });
      await page.waitForSelector("[data-lab-state='RESULTS']", { timeout: 90_000 });
      await page.waitForTimeout(9000);
      await page.screenshot({ path: name("gameover") });
      await ctx.close();
      console.log(`captured ${theme} ${width}`);
    }
  }
  await browser.close();
}

void main();
