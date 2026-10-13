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
        await page.waitForTimeout(1200);
        await page.screenshot({ path: `${OUT}/${name}-${theme}-${w}-top.png` });
        if (name !== "lab") await page.screenshot({ path: `${OUT}/${name}-${theme}-${w}-full.png`, fullPage: true });
      }
      if (w < 640) {
        await page.goto("/", { waitUntil: "load" });
        const more = page.getByRole("button", { name: "More" });
        if (await more.isVisible()) {
          await more.click();
          await page.waitForTimeout(500);
          await page.screenshot({ path: `${OUT}/more-menu-${theme}-${w}.png` });
        }
      }
    });
  }
});
