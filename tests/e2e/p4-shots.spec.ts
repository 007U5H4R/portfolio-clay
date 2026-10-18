/**
 * p4-shots.spec.ts (M-012 P4, TASK-181.4) — visual QA: the essay row, a certification card and a
 * more-credentials tile, light + dark, at rest and hovered (w1440) / keyboard-focused (w390). Run with
 * --project=w390 --project=w1440. Writes docs/screenshots/m-013/task-181-p4/. Opt-in: skipped unless P4_SHOTS=1.
 */
import type { Locator, Page } from "@playwright/test";
import { test } from "./fixtures";
import { mkdirSync } from "node:fs";

const OUT = "docs/screenshots/m-013/task-181-p4";

async function shoot(page: Page, loc: Locator, name: string) {
  await loc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const b = (await loc.boundingBox())!;
  const pad = 36;
  const vp = page.viewportSize()!;
  const x = Math.max(0, b.x - pad);
  const y = Math.max(0, b.y - pad);
  await page.screenshot({
    path: `${OUT}/${name}.png`,
    clip: { x, y, width: Math.min(vp.width - x, b.width + pad * 2), height: Math.min(vp.height - y, b.height + pad * 2) },
  });
}

async function state(page: Page, loc: Locator, focusTarget: Locator, w: number) {
  if (w >= 1024) {
    await loc.hover();
  } else {
    await page.keyboard.press("Shift");
    await focusTarget.focus();
  }
  await page.waitForTimeout(800);
}

test.describe("P4 screenshots", () => {
  test.skip(!process.env.P4_SHOTS, "opt-in: P4_SHOTS=1");
  for (const theme of ["light", "dark"] as const) {
    test(`p4 shots ${theme}`, async ({ page }) => {
      mkdirSync(OUT, { recursive: true });
      const w = page.viewportSize()!.width;
      const mode = w >= 1024 ? "hover" : "focus";
      const surfaces: Array<[string, string, (p: Page) => Locator, (p: Page) => Locator]> = [
        ["essay-row", "/thinking", (p) => p.locator(".essay-entry").nth(1), (p) => p.locator(".essay-entry").nth(1).locator(".essay-entry-title a")],
        ["cert-card", "/certifications", (p) => p.locator("ol.cert-list > li a").first(), (p) => p.locator("ol.cert-list > li a").first()],
        ["cert-tile", "/certifications", (p) => p.locator(".certm-tile").first(), (p) => p.locator(".certm-tile").first()],
      ];
      for (const [name, route, find, focusT] of surfaces) {
        await page.goto(route, { waitUntil: "networkidle" });
        await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
        await page.waitForTimeout(300);
        const loc = find(page);
        if ((await loc.count()) === 0) continue;
        await page.mouse.move(2, 2);
        await shoot(page, loc, `${name}-${theme}-${w}-rest`);
        await state(page, loc, focusT(page), w);
        await shoot(page, loc, `${name}-${theme}-${w}-${mode}`);
      }
    });
  }
});
