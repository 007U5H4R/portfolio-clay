/**
 * M-011 style-gate screenshots (EVAL-038): a page's first scene at rest and at the ±max pointer shift, light + dark,
 * 1440 and 390 wide. Usage: `pnpm exec tsx scripts/m011-shots.ts <outDir> [path=/] [baseUrl]` (a running `pnpm start`).
 */
import { chromium } from "@playwright/test";

const [outDir = "m011-shots", path = "/", base = "http://127.0.0.1:3000"] = process.argv.slice(2);
const exe = process.env.PW_EXE;
async function main() {
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const slug = path === "/" ? "home" : path.replace(/\W+/g, "-").replace(/^-|-$/g, "");
  for (const [w, h] of [[1440, 900], [390, 844]] as const) {
    for (const theme of ["light", "dark"] as const) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 768, isMobile: w < 768, reducedMotion: "no-preference" });
      await ctx.addInitScript((t) => localStorage.setItem("portfolio-theme", t), theme);
      const page = await ctx.newPage();
      await page.goto(base + path, { waitUntil: "networkidle" });
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
      await page.waitForTimeout(600);
      const shot = async (tag: string) => page.screenshot({ path: `${outDir}/${slug}-${w}-${theme}-${tag}.png` });
      await shot("rest");
      if (w >= 768) {
        for (const [tag, x, y] of [["tl", 0, 0], ["br", w - 1, h - 1]] as const) {
          await page.mouse.move(x, y, { steps: 4 });
          await page.waitForTimeout(1200);
          await shot(tag);
        }
      }
      await ctx.close();
    }
  }
  await browser.close();
}
void main();
