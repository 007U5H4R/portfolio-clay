/**
 * ask-inline.spec.ts (technical-plan.md §B S10.06) — the notebook `AskPortfolio` answer states.
 *
 * TKT-113 (Design.md §11 Dev-64–69): the Home page no longer answers inline — `section#ask` is the
 * Ask Tushky launcher, covered by `home-ask-tushky.spec.ts`. `AskPortfolio` and its states live on in
 * the QA-only `/dev/ask` fixture, so only the fixture tests remain here. They SKIP (never fail) when
 * `/dev/ask` 404s under a normal production build — the `paper-board.spec.ts` pattern (run them under
 * `ALLOW_DEV_ROUTES=1`).
 *
 * All titles carry the `ask-inline` prefix so `pnpm test:e2e --grep ask-inline` selects this file, and
 * each test is tagged with its EVAL id so the harness aggregates it.
 */
import { test, expect } from "./fixtures";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

async function gotoDev(page: import("@playwright/test").Page, path: string): Promise<boolean> {
  const resp = await page.goto(path, { waitUntil: "load" });
  const missing = (resp?.status() ?? 404) === 404;
  test.skip(missing, `${path} 404s without ALLOW_DEV_ROUTES=1 — run the QA job to exercise it`);
  return !missing;
}

test.describe("ask-inline", () => {
  // ── QA-only fixture states (run under ALLOW_DEV_ROUTES=1; skip on a normal build) ──────────────
  test("@EVAL-012 error state via /dev/ask?mode=error : alert + retry, no answer", {
    tag: "@EVAL-012",
  }, async ({ page }) => {
    test.skip(width(page) !== 1440, "state verified once at w1440");
    if (!(await gotoDev(page, "/dev/ask?mode=error"))) return;
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
    await expect(page.getByText(/something went wrong/i)).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Answer" })).toHaveCount(0);
  });

  test("@EVAL-007 loading skeleton via /dev/ask?mode=slow : a status region is announced while resolving", {
    tag: "@EVAL-007",
  }, async ({ page }) => {
    test.skip(width(page) !== 1440, "state verified once at w1440");
    if (!(await gotoDev(page, "/dev/ask?mode=slow"))) return;
    // slow mode auto-submits and resolves after ~2s, so the skeleton is comfortably visible.
    const status = page.getByRole("status");
    await expect(status).toBeVisible();
    await expect(status).toHaveAttribute("aria-busy", "true");
    // It eventually resolves to an answer (proving the floor is a floor, not a stall).
    await expect(page.getByRole("heading", { level: 3, name: "Answer" })).toBeVisible({ timeout: 5000 });
  });

  // ── TC-149 · the paper contract on the fixture (M-009, TKT-77) ────────────────────────────────
  test("@TC-149 error state on paper: rust-bordered ivory panel with a glyph + Try again", {
    tag: ["@EVAL-015", "@TC-149"],
  }, async ({ page }) => {
    test.skip(width(page) !== 1440, "state verified once at w1440");
    if (!(await gotoDev(page, "/dev/ask?mode=error"))) return;
    const panel = page.locator('[data-paper="notebook"] .ask-error');
    await expect(panel).toBeVisible();
    await expect(panel.locator("svg")).toHaveCount(1);
    // A solid rust border (1.5 px in CSS; Chromium snaps it to device pixels, so width is only > 0
    // here): its colour equals the rust alert glyph's.
    const border = await panel.evaluate((el) => {
      const s = getComputedStyle(el);
      const glyph = el.querySelector("svg");
      return {
        width: Number.parseFloat(s.borderTopWidth),
        style: s.borderTopStyle,
        color: s.borderTopColor,
        rust: glyph ? getComputedStyle(glyph).color : "",
      };
    });
    expect(border.width).toBeGreaterThan(0);
    expect(border.style).toBe("solid");
    expect(border.color).toBe(border.rust);
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });

  test("@TC-149 loading state on paper: two shimmer lines + the sr-only status", {
    tag: ["@EVAL-014", "@TC-149"],
  }, async ({ page }) => {
    test.skip(width(page) !== 1440, "state verified once at w1440");
    if (!(await gotoDev(page, "/dev/ask?mode=slow"))) return;
    const status = page.locator('[data-paper="notebook"]').getByRole("status");
    await expect(status).toBeVisible();
    await expect(status.locator(".ask-shimmer")).toHaveCount(2);
    await expect(status.getByText("Looking through the portfolio…")).toHaveClass(/sr-only/);
  });

});
