/**
 * paper-drawin.spec.ts (TC-128 steps 1–2; Design.md §8 "Headline underline draw-in") — the underline
 * `Sketch` on `/dev/primitives` draws in once (stroke-dashoffset 400 → 0 over 1.1 s after 0.5 s) and
 * renders complete, with no animation, under `prefers-reduced-motion: reduce`.
 *
 * Untagged (like `paper-board.spec.ts`): the board is a QA-only route that 404s on a plain build, so
 * these tests SKIP there and run under `ALLOW_DEV_ROUTES=1 pnpm build`. `data-drawin` is set on the
 * `underline` variant only (TSK-33 finding, Design.md §8), so that is the element measured. Measured
 * once at w1440. TC-128 steps 3–4 (`Reveal`) belong to TKT-79.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const PATH = "/dev/primitives";
const DRAWIN = '.sketch[data-drawin][data-sketch="underline"]';

const width = (page: Page) => page.viewportSize()?.width ?? 0;

/** Read the animated stroke values off the first underline sketch. */
function readStroke(page: Page) {
  return page.locator(DRAWIN).first().evaluate((el) => {
    const s = getComputedStyle(el);
    return { offset: s.strokeDashoffset, animationName: s.animationName };
  });
}

test.describe("TC-128 · underline draw-in", () => {
  test("default motion: 400px at t≈0, 0px after the 0.5 s delay + 1.1 s run", async ({ page }) => {
    test.skip(width(page) !== 1440, "measured once at w1440");
    // `commit` (not `load`) so the first read lands inside the 0.5 s delay before the animation starts.
    const resp = await page.goto(PATH, { waitUntil: "commit" });
    test.skip((resp?.status() ?? 404) === 404, `${PATH} 404s without ALLOW_DEV_ROUTES=1 — run the QA job to exercise it`);
    await page.locator(DRAWIN).first().waitFor({ state: "attached" });

    const start = await readStroke(page);
    expect(start.animationName, "the underline must animate via the `drawin` keyframes").toBe("drawin");
    expect(start.offset, "stroke-dashoffset starts at 400px").toBe("400px");

    await page.waitForTimeout(2000);
    const end = await readStroke(page);
    expect(end.offset, "stroke-dashoffset ends at 0px (forwards fill)").toBe("0px");
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("drawn complete immediately: 0px and animation-name none", async ({ page }) => {
      test.skip(width(page) !== 1440, "measured once at w1440");
      const resp = await page.goto(PATH, { waitUntil: "commit" });
      test.skip((resp?.status() ?? 404) === 404, `${PATH} 404s without ALLOW_DEV_ROUTES=1 — run the QA job to exercise it`);
      await page.locator(DRAWIN).first().waitFor({ state: "attached" });

      const now = await readStroke(page);
      expect(now.offset).toBe("0px");
      expect(now.animationName).toBe("none");
    });
  });
});
