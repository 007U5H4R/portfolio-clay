/**
 * cursor-screenshots.ts (TASK-142.5) — 1440 screenshots of the Paper Trail cursor and trail into
 * docs/screenshots/m-010/t2b/. Needs a running production server: `pnpm start -p 3100`, then
 * `BASE=http://127.0.0.1:3100 pnpm tsx scripts/cursor-screenshots.ts` (set PW_CHROMIUM for a custom binary).
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://127.0.0.1:3100";
const OUT = "docs/screenshots/m-010/t2b";
mkdirSync(OUT, { recursive: true });

async function main() {
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  for (const theme of ["light", "dark"] as const) {
    await page.goto(BASE + "/");
    await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
    await page.waitForSelector('[data-paper-cursor="cursor"]', { state: "attached" });
    await page.mouse.move(700, 520);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/cursor-default-${theme}.png` });

    // The paper trail: a left-button drag across the hero, captured mid-flight (nodes at full size).
    await page.mouse.move(120, 560);
    await page.mouse.down();
    for (let i = 0; i <= 28; i++) await page.mouse.move(120 + i * 42, 560 + Math.sin(i / 3) * 90);
    await page.waitForTimeout(260);
    await page.screenshot({ path: `${OUT}/trail-${theme}.png` });
    await page.mouse.up();
    await page.waitForTimeout(1400);
  }

  // Semantic label chips.
  await page.goto(BASE + "/");
  await page.waitForSelector('[data-paper-cursor="cursor"]', { state: "attached" });
  const ask = page.locator("header").getByRole("button", { name: "Ask AI" });
  await ask.hover();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/label-woof.png`, clip: { x: 900, y: 0, width: 540, height: 160 } });
  const link = page.locator('main a[href^="/"]').first();
  await link.scrollIntoViewIfNeeded();
  await link.hover();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/label-link.png` });

  await browser.close();
  console.log("screenshots written to", OUT);
}

void main();
