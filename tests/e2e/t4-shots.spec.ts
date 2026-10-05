/**
 * t4-shots.spec.ts (M-010 T4, TASK-145.6; EVAL-031 T4 gate evidence) — nav, footer ocean and a divider, light + dark,
 * at the project's width (run with --project=w390 --project=w1440). Writes docs/screenshots/m-010/t4/. Opt-in:
 * skipped unless T4_SHOTS=1 so the regular e2e run never rewrites screenshots.
 */
import { test } from "./fixtures";
import { mkdirSync } from "node:fs";

const OUT = "docs/screenshots/m-010/t4";

test.describe("T4 screenshots", () => {
  test.skip(!process.env.T4_SHOTS, "opt-in: T4_SHOTS=1");
  for (const theme of ["light", "dark"] as const) {
    test(`t4 shots ${theme}`, async ({ page }) => {
      mkdirSync(OUT, { recursive: true });
      const w = page.viewportSize()!.width;
      await page.goto("/", { waitUntil: "load" });
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForTimeout(400);
      await page.locator("header[data-site-header]").screenshot({ path: `${OUT}/nav-${theme}-${w}.png` });
      const divider = page.locator('main [data-decor="torn"]').first();
      await divider.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const box = (await divider.boundingBox())!;
      await page.screenshot({
        path: `${OUT}/divider-${theme}-${w}.png`,
        clip: { x: 0, y: Math.max(0, box.y - 140), width: w, height: 300 },
      });
      await page.locator("footer.band").scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      await page.locator("footer.band").screenshot({ path: `${OUT}/footer-${theme}-${w}.png` });
    });
  }
});
