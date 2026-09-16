/**
 * ask-inline.spec.ts (technical-plan.md §B S10.06) — the home inline Ask surface (TKT-10) across the
 * four screen states, keyboard operability, 44px targets, mobile wrapping and reduced motion.
 *
 * The idle / answer / empty states are exercised on the REAL home route (`/`), where the deterministic
 * local provider resolves a matching query to an answer and an off-topic query to the graceful empty
 * state — no dev flag needed. The `error` and `loading` (slow) states need a forced provider, so they
 * run on the QA-only `/dev/ask` fixture and SKIP (never fail) when it 404s under a normal production
 * build — exactly the `primitives.spec.ts` pattern (run the full five under `ALLOW_DEV_ROUTES=1`).
 *
 * All titles carry the `ask-inline` prefix so `pnpm test:e2e --grep ask-inline` selects this file, and
 * each test is tagged with its EVAL id so the harness aggregates it.
 */
import { test, expect } from "./fixtures";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

const REAL_QUERY = "What products have you built?";
const OFF_TOPIC_QUERY = "what is the weather in paris";

async function gotoDev(page: import("@playwright/test").Page, path: string): Promise<boolean> {
  const resp = await page.goto(path, { waitUntil: "load" });
  const missing = (resp?.status() ?? 404) === 404;
  test.skip(missing, `${path} 404s without ALLOW_DEV_ROUTES=1 — run the QA job to exercise it`);
  return !missing;
}

test.describe("ask-inline", () => {
  test("@EVAL-012 answer state on / : type + Enter shows a sourced answer, never navigates, page still scrolls", {
    tag: ["@EVAL-012", "@EVAL-007"],
  }, async ({ page }) => {
    test.skip(width(page) !== 1440, "in-place expansion measured once at w1440 (fine pointer)");
    await page.goto("/", { waitUntil: "load" });

    const card = page.getByTestId("ask-card");
    const input = page.locator("#ask-portfolio-input");
    await input.scrollIntoViewIfNeeded();
    const beforeHeight = (await card.boundingBox())?.height ?? 0;
    const urlBefore = page.url();

    await input.fill(REAL_QUERY);
    await input.press("Enter");

    const heading = page.getByRole("heading", { level: 3, name: "Answer" });
    await expect(heading).toBeVisible();

    // Never navigates (brief §13).
    expect(page.url()).toBe(urlBefore);

    // Focus moves to the answer heading (Design.md §3).
    await expect(heading).toBeFocused();

    // The answer carries resolving evidence + the honesty microcopy + the DRAFT badge.
    await expect(page.getByRole("list", { name: "Sources" })).toBeVisible();
    await expect(page.getByText("Answers come from this portfolio's content — nothing generated.")).toBeVisible();
    // Scoped to the Ask card (TKT-13's HowIThink section reuses the same "Draft" badge convention
    // further down the page, so an unscoped page.getByText("Draft") is no longer unique).
    await expect(card.getByText("Draft")).toBeVisible();

    // Card grew in place to the expanded min-height.
    const afterHeight = (await card.boundingBox())?.height ?? 0;
    expect(afterHeight).toBeGreaterThanOrEqual(240);
    expect(afterHeight).toBeGreaterThan(beforeHeight);

    // The page still scrolls (focus is moved, not trapped — unlike the panel).
    await page.mouse.wheel(0, 500);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });

  test("@EVAL-012 empty state on / : an off-topic query returns the fallback + fresh prompts, never an answer", {
    tag: "@EVAL-012",
  }, async ({ page }) => {
    test.skip(width(page) !== 1440, "state behaviour verified once at w1440");
    await page.goto("/", { waitUntil: "load" });

    const input = page.locator("#ask-portfolio-input");
    await input.fill(OFF_TOPIC_QUERY);
    await input.press("Enter");

    await expect(
      page.getByText("I only answer from the sourced facts on this site — try one of the prompts, or email me."),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Answer" })).toHaveCount(0);
    // Fresh suggestions to recover.
    const suggestions = page.getByRole("list", { name: "Suggested questions" });
    await expect(suggestions).toBeVisible();
    expect(await suggestions.getByRole("button").count()).toBeGreaterThanOrEqual(1);
  });

  test("@EVAL-007 keyboard: field → prompts → answer heading → evidence → Ask another, focus ring at every stop", {
    tag: "@EVAL-007",
  }, async ({ page, keyboardOnly }) => {
    test.skip(width(page) !== 1440, "keyboard sweep runs at a desktop width");
    await page.goto("/", { waitUntil: "load" });

    // Every focus-visible stop from the top of the page through the Ask idle controls wears the
    // shared 3px accent ring (fixture asserts this on each stop it lands on).
    await keyboardOnly(page, { tabs: 16 });

    // Functional keyboard path: reach the field, submit with Enter, land on the answer heading, then
    // Tab forward onto the evidence links and the "Ask another" control.
    const input = page.locator("#ask-portfolio-input");
    await input.focus();
    await page.keyboard.type(REAL_QUERY);
    await page.keyboard.press("Enter");

    const heading = page.getByRole("heading", { level: 3, name: "Answer" });
    await expect(heading).toBeFocused();

    await page.keyboard.press("Tab");
    const firstEvidence = page.getByRole("list", { name: "Sources" }).getByRole("link").first();
    await expect(firstEvidence).toBeFocused();

    // Tab through the remaining evidence links to the ghost "Ask another".
    const askAnother = page.getByRole("button", { name: "Ask another" });
    for (let i = 0; i < 5; i++) {
      if (await askAnother.evaluate((el) => el === document.activeElement)) break;
      await page.keyboard.press("Tab");
    }
    await expect(askAnother).toBeFocused();
  });

  test("@EVAL-008 Ask controls all meet the 44px target floor", { tag: "@EVAL-008" }, async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const input = page.locator("#ask-portfolio-input");
    await input.scrollIntoViewIfNeeded();

    // Answer first so evidence pills + "Ask another" are present too.
    await input.fill(REAL_QUERY);
    await input.press("Enter");
    await expect(page.getByRole("heading", { level: 3, name: "Answer" })).toBeVisible();

    const controls = page.locator("#ask a[href], #ask button, #ask input");
    const count = await controls.count();
    expect(count).toBeGreaterThan(0);
    const undersized: { text: string; w: number; h: number }[] = [];
    for (let i = 0; i < count; i++) {
      const box = await controls.nth(i).boundingBox();
      if (!box) continue;
      if (box.width < 44 || box.height < 44) {
        undersized.push({
          text: (await controls.nth(i).innerText().catch(() => "")).slice(0, 30),
          w: Math.round(box.width),
          h: Math.round(box.height),
        });
      }
    }
    expect(undersized, `Ask controls below 44x44:\n${JSON.stringify(undersized, null, 2)}`).toEqual([]);
  });

  test("@EVAL-008 the Ask section does not overflow the viewport width", { tag: "@EVAL-008" }, async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const section = page.locator("#ask");
    await section.scrollIntoViewIfNeeded();
    const box = await section.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.ceil(box!.width)).toBeLessThanOrEqual(width(page));
  });

  test("@EVAL-008 suggested prompts wrap to more than one row at 390", { tag: "@EVAL-008" }, async ({ page }) => {
    test.skip(width(page) !== 390, "wrapping is a mobile concern");
    await page.goto("/", { waitUntil: "load" });
    const pills = page.getByRole("list", { name: "Suggested questions" }).getByRole("button");
    await expect(pills.first()).toBeVisible();
    const firstY = (await pills.first().boundingBox())?.y ?? 0;
    const lastY = (await pills.last().boundingBox())?.y ?? 0;
    expect(lastY).toBeGreaterThan(firstY);
  });

  test("@EVAL-006 the Ask section is axe-clean in idle and answer states", { tag: "@EVAL-006" }, async ({
    page,
    axe,
  }) => {
    test.skip(width(page) !== 390 && width(page) !== 1440, "axe runs at 390 and 1440");
    await page.goto("/", { waitUntil: "load" });
    await axe(page, { include: "#ask" }); // idle
    await page.locator("#ask-portfolio-input").fill(REAL_QUERY);
    await page.locator("#ask-portfolio-input").press("Enter");
    await expect(page.getByRole("heading", { level: 3, name: "Answer" })).toBeVisible();
    await axe(page, { include: "#ask" }); // answer
  });

  test("@EVAL-010 reduced motion: the answer still appears and content is not transform-animated", {
    tag: "@EVAL-010",
  }, async ({ page, withReducedMotion }) => {
    test.skip(width(page) !== 1440, "reduced-motion check runs once at w1440");
    await withReducedMotion(page);
    await page.goto("/", { waitUntil: "load" });

    const input = page.locator("#ask-portfolio-input");
    await input.fill(REAL_QUERY);
    await input.press("Enter");
    const heading = page.getByRole("heading", { level: 3, name: "Answer" });
    await expect(heading).toBeVisible();

    // Under reduced motion the content settles with no lingering transform offset.
    await page.waitForTimeout(200);
    const transform = await page
      .getByText("Answers come from this portfolio's content — nothing generated.")
      .evaluate((el) => getComputedStyle(el.closest("div")!).transform);
    expect(transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)").toBeTruthy();
  });

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
});
