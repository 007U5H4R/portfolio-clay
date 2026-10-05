/**
 * TASK-130 · case-study screenshots at 1440 and 390 (full page), for the before/after record in
 * docs/screenshots/m-009/task-130/<label>/. Needs a running server: `pnpm start -p <port>`.
 *   tsx scripts/case-study-art/shoot.ts <label> [baseUrl] [slug,slug]
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { ALL_PROJECT_SLUGS } from "../../lib/anchors";

const [label = "after", base = "http://127.0.0.1:3130", only] = process.argv.slice(2);
const slugs = only ? only.split(",") : [...ALL_PROJECT_SLUGS];
const out = resolve("docs/screenshots/m-009/task-130", label);
mkdirSync(out, { recursive: true });

async function main() {
const browser = await chromium.launch();
for (const width of [1440, 390]) {
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  for (const slug of slugs) {
    await page.goto(`${base}/work/${slug}`, { waitUntil: "networkidle" });
    // Scroll through once so lazy images and one-time viewport motion settle before the capture.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${slug}-${width}.jpg`, fullPage: true, type: "jpeg", quality: 70 });
    console.log(`${label}/${slug}-${width}.jpg`);
  }
  await context.close();
}
await browser.close();
}

void main();
