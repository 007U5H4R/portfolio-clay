/**
 * eval-038.spec.ts (`@EVAL-038`, evaluation-plan §10, M-011 P6 / TASK-161) — the automated half of the style gate: the whole
 * paper sailboat (mast tip to hull bottom, rock and sail extremes included) lies inside the visible footer ocean strip at
 * 390 / 768 / 1024 / 1440 in both themes. The loops are driven through the Web Animations API (pause, seek to the ends) so the
 * extremes are measured deterministically, not sampled.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const WIDTHS = [390, 768, 1024, 1440];
const EPS = 0.5;

async function boatRects(page: Page) {
  return page.evaluate(() => {
    const strip = document.querySelector("[data-band-ocean]") as HTMLElement;
    const boat = strip.querySelector(".ocean-ship") as HTMLElement;
    const anims = document.getAnimations().filter((a) => (a.effect as KeyframeEffect | null)?.target?.closest?.("[data-band-ocean]"));
    const sail = anims.find((a) => (a as CSSAnimation).animationName === "ocean-sail");
    const rock = anims.find((a) => (a as CSSAnimation).animationName === "ocean-rock");
    const rect = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { l: r.left, r: r.right, t: r.top, b: r.bottom };
    };
    const at = (poses: [Animation | undefined, number][]) => {
      for (const [a, f] of poses) {
        if (!a) continue;
        a.pause();
        const t = a.effect!.getComputedTiming();
        a.currentTime = (t.duration as number) * f;
      }
      return { boat: rect(boat), strip: rect(strip), vw: window.innerWidth, vh: window.innerHeight };
    };
    return [
      at([[sail, 0], [rock, 0]]),
      at([[sail, 0], [rock, 0.5]]),
      at([[sail, 1], [rock, 0]]),
      at([[sail, 1], [rock, 0.5]]),
      at([[sail, 0.5], [rock, 0.25]]),
    ];
  });
}

for (const w of WIDTHS) {
  for (const theme of ["light", "dark"] as const) {
    test(`@EVAL-038 the whole sailboat is inside the footer ocean at ${w}px (${theme})`, async ({ page }) => {
      test.skip(page.viewportSize()!.width !== w && w !== 1440, "this project's width only (plus 1440 as the sweep owner)");
      await page.setViewportSize({ width: w, height: 900 });
      await page.addInitScript((t) => localStorage.setItem("portfolio-theme", t), theme);
      await page.goto("/contact", { waitUntil: "networkidle" });
      await page.locator("[data-band-ocean]").scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
      await page.waitForTimeout(500);
      const poses = await boatRects(page);
      for (const [i, p] of poses.entries()) {
        const at = `${w}px ${theme} pose ${i}: boat ${p.boat.l.toFixed(0)}–${p.boat.r.toFixed(0)} × ${p.boat.t.toFixed(0)}–${p.boat.b.toFixed(0)} in strip ${p.strip.l.toFixed(0)}–${p.strip.r.toFixed(0)} × ${p.strip.t.toFixed(0)}–${p.strip.b.toFixed(0)}`;
        expect(p.boat.t, `${at}: mast tip below the strip's top`).toBeGreaterThanOrEqual(p.strip.t - EPS);
        expect(p.boat.b, `${at}: hull above the strip's bottom`).toBeLessThanOrEqual(p.strip.b + EPS);
        expect(p.boat.l, `${at}: inside the viewport (left)`).toBeGreaterThanOrEqual(-EPS);
        expect(p.boat.r, `${at}: inside the viewport (right)`).toBeLessThanOrEqual(p.vw + EPS);
        expect(p.strip.b, `${at}: the strip is on screen`).toBeLessThanOrEqual(p.vh + EPS);
      }
    });
  }
}
