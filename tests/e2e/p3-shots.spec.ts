/**
 * p3-shots.spec.ts (TASK-181.3 visual QA) — the hero, the Home Tushky launcher and Contact at rest and in their interaction
 * states, light + dark, at the project's width (run with --project=w390 --project=w1440). Writes
 * docs/screenshots/m-013/task-181-p3/. Opt-in: skipped unless P3_SHOTS=1 so the regular e2e run never rewrites screenshots.
 */
import { test } from "./fixtures";
import { mkdirSync } from "node:fs";

const OUT = "docs/screenshots/m-013/task-181-p3";

test.describe("P3 screenshots", () => {
  test.skip(!process.env.P3_SHOTS, "opt-in: P3_SHOTS=1");
  test.describe.configure({ timeout: 120_000 });
  for (const theme of ["light", "dark"] as const) {
    test(`p3 shots ${theme}`, async ({ page }) => {
      mkdirSync(OUT, { recursive: true });
      const w = page.viewportSize()!.width;
      const fine = w >= 1024;
      const shot = (name: string) => page.screenshot({ path: `${OUT}/${name}-${theme}-${w}.png` });

      await page.goto("/", { waitUntil: "networkidle" });
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
      await page.waitForTimeout(600);

      // hero: banner + polaroids at rest, then the two CTA reactions
      await shot("hero-rest");
      await page.locator(".hero-cta-row").scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await shot("hero-cta-rest");
      if (fine) {
        await page.mouse.move(0, 0);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(400);
        const btn = page.locator(".hero-btn-primary").first();
        await btn.scrollIntoViewIfNeeded();
        await btn.hover();
        await page.waitForTimeout(1100);
        await shot("hero-view-work-hover");
        await page.locator(".hero-btn-secondary").first().hover();
        await page.waitForTimeout(800);
        await shot("hero-ask-hover");
        await page.mouse.move(2, 2);
      }

      // Tushky launcher: rest, breathing mid-way is skipped (finite), hover lean, composer attentive
      await page.locator("section#ask").scrollIntoViewIfNeeded();
      await page.waitForTimeout(9000);
      await shot("tushky-rest");
      if (fine) {
        const box = (await page.locator(".hat-mascot").boundingBox())!;
        await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.6, { steps: 8 });
        await page.waitForTimeout(900);
        await shot("tushky-hover");
        await page.mouse.move(2, 2);
        await page.locator("#ask-portfolio-input").focus();
        await page.waitForTimeout(900);
        await shot("tushky-attentive");
        await page.locator("#ask-portfolio-input").blur();
      }

      // Contact: rest and the primary CTA's sequence
      await page.goto("/contact", { waitUntil: "networkidle" });
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
      await page.waitForTimeout(900);
      await shot("contact-rest");
      if (fine) {
        await page.locator(".cx-btn-primary").hover();
        await page.waitForTimeout(900);
        await shot("contact-email-hover");
      }
    });
  }
});
