/**
 * enterprise-shots.spec.ts (TASK-204 visual QA) — the Enterprise Field Journal, light + dark, at the project's width
 * (run with --project=w390 --project=w1440): the section, each card mid-signature, and an open case file. Writes
 * docs/screenshots/m-013/task-204/. Opt-in: skipped unless ENTERPRISE_SHOTS=1 so the regular run never rewrites screenshots.
 */
import { test } from "./fixtures";
import { mkdirSync } from "node:fs";
import { enterpriseCases } from "@/data/enterprise";

const OUT = "docs/screenshots/m-013/task-204";

test.describe("Enterprise screenshots", () => {
  test.skip(!process.env.ENTERPRISE_SHOTS, "opt-in: ENTERPRISE_SHOTS=1");
  test.describe.configure({ timeout: 180_000 });
  for (const theme of ["light", "dark"] as const) {
    test(`enterprise shots ${theme}`, async ({ page }) => {
      mkdirSync(OUT, { recursive: true });
      const w = page.viewportSize()!.width;
      await page.goto("/projects", { waitUntil: "networkidle" });
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
      const section = page.locator("section#enterprise");
      await section.scrollIntoViewIfNeeded();
      for (const c of enterpriseCases) await page.locator(`.ee-item[data-case="${c.id}"]`).scrollIntoViewIfNeeded();
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
      await section.screenshot({ path: `${OUT}/section-${theme}-${w}.png` });
      for (const c of enterpriseCases) {
        const it = page.locator(`.ee-item[data-case="${c.id}"]`);
        await it.scrollIntoViewIfNeeded();
        await it.locator(".ee-open").click();
        await page.waitForTimeout(560);
        await it.locator(".ee-face").screenshot({ path: `${OUT}/signature-${c.id}-${theme}-${w}.png` });
        await page.waitForTimeout(1200);
        if (c.id === "pear-health-labs" || c.id === "iu-health") await it.screenshot({ path: `${OUT}/casefile-${c.id}-${theme}-${w}.png` });
        await it.locator(".ee-open").click();
      }
    });
  }
});
