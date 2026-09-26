/**
 * ask-panel.spec.ts (technical-plan.md §B S11.01–03, TKT-11 → TKT-104 r2) — the global Ask panel,
 * which is now the "Ask Tushky" right drawer (Tushar's spec 2026-09-26, Design.md §11 Dev-60–63).
 *
 * Exercised on the REAL site (no dev flag) with the deterministic local provider. Covers the lazy-mount
 * contract (EVAL-005), opening from the RIGHT and closing to the RIGHT, the backdrop / Esc / close
 * paths, the focus trap and return, the geometry (420–480 px at 1440, full-screen at 390), the empty
 * state fitting one laptop viewport with the composer pinned, the multi-turn chat (the empty state
 * collapses, sources and follow-ups appear, and a follow-up asks again), grounding (EVAL-012), 44 px
 * targets (EVAL-008), no overflow, axe (EVAL-006) and reduced motion (EVAL-010).
 *
 * Titles carry the `ask-panel` prefix so `pnpm test:e2e --grep ask-panel` selects this file.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const width = (page: Page) => page.viewportSize()?.width ?? 0;

const REAL_QUERY = "What products has Tushar built?";
const OFF_TOPIC_QUERY = "what is the weather in paris";
const FALLBACK = "I only answer from the sourced facts on this site — try one of the prompts, or email me.";

const panel = (page: Page) => page.locator("dialog.ask-panel");
const input = (page: Page) => panel(page).locator("#ask-panel-input");
const conversation = (page: Page) => panel(page).getByRole("log", { name: "Conversation with Tushky" });
const lastAnswer = (page: Page) => panel(page).locator('.tk-turn[data-role="tushky"]').last();

/** The width-appropriate trigger: the header's Ask ghost at lg+, the MobileMenu row below it. */
async function trigger(page: Page) {
  if (width(page) < 1024) {
    const menu = page.locator('dialog[aria-label="Site navigation"]');
    // The menu stays open behind the drawer, so a re-open uses its Ask row directly.
    if (!(await menu.isVisible())) await page.getByRole("button", { name: "Open menu" }).click();
    await expect(menu).toBeVisible();
    return menu.getByRole("button", { name: "Ask AI" });
  }
  return page.locator("header").getByRole("button", { name: "Ask AI" });
}

async function openPanel(page: Page): Promise<void> {
  await (await trigger(page)).click();
  await expect(panel(page)).toBeVisible();
  await expect(panel(page)).toHaveAttribute("data-open", "");
}

async function askQuery(page: Page, query: string): Promise<void> {
  await input(page).fill(query);
  await input(page).press("Enter");
  await expect(lastAnswer(page)).not.toHaveAttribute("data-msg", "loading");
}

/** Wait for the open slide (420 ms + settle) to finish before reading geometry. */
const settled = (page: Page) => page.waitForTimeout(600);

test.describe("ask-panel", () => {
  test("@EVAL-005 lazy: the drawer is not in the DOM until first open, then it mounts", async ({ page }) => {
    test.skip(width(page) !== 1440, "lazy-mount contract verified once at a desktop width");
    await page.goto("/", { waitUntil: "load" });
    await expect(panel(page)).toHaveCount(0);
    await openPanel(page);
    await expect(panel(page)).toHaveCount(1);
  });

  test("@EVAL-012 empty state: Ask Tushky header, one grounding note, intro, Tushar's six questions, pinned composer", async ({
    page,
  }) => {
    test.skip(width(page) !== 1440, "empty-state content verified once at w1440");
    await page.goto("/", { waitUntil: "load" });
    await openPanel(page);
    await expect(panel(page)).toHaveAttribute("aria-labelledby", "ask-tushky-title");
    await expect(panel(page).getByRole("heading", { level: 2, name: "Ask Tushky" })).toBeVisible();
    await expect(panel(page).getByText("Tushar’s Portfolio Assistant")).toBeVisible();
    await expect(panel(page).getByRole("img", { name: /^Tushky, the golden retriever/ })).toBeVisible();
    // The grounding note appears exactly once (a visual Caveat note plus its sr-only twin).
    await expect(
      panel(page).locator("p:not([aria-hidden])", {
        hasText: "Ask anything about Tushar — answers are grounded only in this portfolio.",
      }),
    ).toHaveCount(1);
    await expect(panel(page).getByText("Hi! I’m Tushky.")).toBeVisible();
    const cards = panel(page).getByRole("list", { name: "Suggested questions" }).locator(".tk-card-text");
    await expect(cards).toHaveText([
      "What products has Tushar built?",
      "What impact has he created?",
      "Show me his product thinking process.",
      "What is his AI / cloud experience?",
      "What are his strongest skills?",
      "Walk me through a specific project.",
    ]);
    await expect(input(page)).toHaveAttribute("placeholder", "Ask Tushky anything about Tushar...");
    // No attachment control (Dev-61): the composer is the input + Send only.
    await expect(panel(page).locator("form.tk-composer").getByRole("button")).toHaveText([""]);
    await expect(panel(page).getByRole("button", { name: "Send" })).toBeVisible();
  });

  test("@TC-051 opens from the RIGHT and closes to the RIGHT; the page stays visible on the left", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const vw = width(page);
    await openPanel(page);
    // Mid-slide the drawer is displaced to the right (translateX > 0), never left / up.
    const early = await panel(page).evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
    expect(early).toBeGreaterThanOrEqual(-4.5);
    await settled(page);
    const box = (await panel(page).boundingBox())!;
    expect(Math.round(box.x + box.width)).toBe(vw); // flush to the right edge
    expect(Math.round(box.y)).toBe(0);
    expect(Math.round(box.height)).toBe(page.viewportSize()!.height);
    if (vw >= 768) expect(box.x, "the portfolio stays visible on the left").toBeGreaterThan(250);

    // Sample the slide-out from inside the page (a rAF sampler armed before the click, so host load
    // can't make the probe miss the 280 ms window): the drawer only ever moves right (translateX > 0)
    // before it hides.
    await panel(page).evaluate((el) => {
      const w = window as unknown as { __tkMaxX: number; __tkMinX: number };
      w.__tkMaxX = 0;
      w.__tkMinX = 0;
      const tick = () => {
        if (!(el as HTMLDialogElement).open) return;
        const x = new DOMMatrix(getComputedStyle(el).transform).m41;
        w.__tkMaxX = Math.max(w.__tkMaxX, x);
        w.__tkMinX = Math.min(w.__tkMinX, x);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await panel(page).getByRole("button", { name: "Close Ask Tushky" }).click();
    await expect(panel(page)).toBeHidden();
    const moved = await page.evaluate(() => {
      const w = window as unknown as { __tkMaxX: number; __tkMinX: number };
      return { max: w.__tkMaxX, min: w.__tkMinX };
    });
    expect(moved.max, "the drawer slides out to the right").toBeGreaterThan(0);
    expect(moved.min, "it never moves left on close (no bounce)").toBeGreaterThanOrEqual(0);
    await expect(panel(page)).toBeHidden();
  });

  test("@TC-051 geometry: 420–480 px drawer at 1440, 400 px on tablets, full-screen at 390", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await openPanel(page);
    await settled(page);
    const box = (await panel(page).boundingBox())!;
    const vw = width(page);
    if (vw < 768) expect(Math.round(box.width)).toBe(vw);
    else if (vw >= 1440) {
      expect(box.width).toBeGreaterThanOrEqual(420);
      expect(box.width).toBeLessThanOrEqual(480);
    } else expect(Math.round(box.width)).toBe(400);
  });

  test("@EVAL-007 the backdrop click and Esc each close the drawer and return focus to the trigger", async ({ page }) => {
    test.skip(width(page) !== 1440, "backdrop geometry is a desktop-drawer concern");
    await page.goto("/", { waitUntil: "load" });
    const ask = await trigger(page);
    await openPanel(page);
    await settled(page);
    await page.mouse.click(40, 400); // far-left: the backdrop (the <dialog> itself)
    await expect(panel(page)).toBeHidden();
    await expect(ask).toBeFocused();

    await ask.click();
    await expect(panel(page)).toHaveAttribute("data-open", "");
    await page.keyboard.press("Escape");
    await expect(panel(page)).toBeHidden();
    await expect(ask).toBeFocused();
  });

  test("@EVAL-007 focus is trapped inside the drawer and lands in the composer on open", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await openPanel(page);
    await expect(input(page)).toBeFocused();
    for (let i = 0; i < 16; i++) {
      await page.keyboard.press("Tab");
      const escaped = await page.evaluate(() => {
        const a = document.activeElement;
        if (!a || a === document.body || a === document.documentElement) return false;
        return ["header", "#main", "footer"].some((sel) => document.querySelector(sel)?.contains(a));
      });
      expect(escaped, `Tab ${i + 1} reached a page control`).toBe(false);
    }
  });

  test("@EVAL-008 the empty state fits one viewport: no drawer scroll, no body scroll, composer pinned", async ({
    page,
  }) => {
    const w = width(page);
    test.skip(w < 1024, "the one-view fit is a laptop-height contract (1440×900 and 1024×768)");
    await page.goto("/", { waitUntil: "load" });
    await openPanel(page);
    await settled(page);
    await page.evaluate(() => document.fonts.ready);
    const fit = await panel(page).evaluate((el) => {
      const scroll = el.querySelector<HTMLElement>(".tk-scroll")!;
      const composer = el.querySelector<HTMLElement>(".tk-composer")!.getBoundingClientRect();
      return {
        overflow: scroll.scrollHeight - scroll.clientHeight,
        composerBottom: Math.round(composer.bottom),
        vh: window.innerHeight,
        bodyScrolls: document.documentElement.style.overflow === "hidden",
      };
    });
    expect(fit.overflow, "the empty state must not need scrolling").toBeLessThanOrEqual(1);
    expect(fit.composerBottom).toBe(fit.vh);
    expect(fit.bodyScrolls, "the page behind is scroll-locked").toBe(true);
  });

  test("@EVAL-008 the empty state fits 1366×768", async ({ page }) => {
    test.skip(width(page) !== 1440, "one extra laptop size, checked from the 1440 project");
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/", { waitUntil: "load" });
    await openPanel(page);
    await settled(page);
    await page.evaluate(() => document.fonts.ready);
    const overflow = await panel(page)
      .locator(".tk-scroll")
      .evaluate((el) => el.scrollHeight - el.clientHeight);
    expect(overflow).toBeLessThanOrEqual(1);
    const box = (await panel(page).boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(420);
    expect(box.width).toBeLessThanOrEqual(480);
  });

  test("@EVAL-012 chat: a question collapses the empty state into a sourced conversation with follow-ups", async ({
    page,
  }) => {
    test.skip(width(page) !== 1440 && width(page) !== 390, "chat flow verified at 1440 and 390");
    await page.goto("/", { waitUntil: "load" });
    const urlBefore = page.url();
    await openPanel(page);
    await panel(page).getByRole("button", { name: "What products has Tushar built?" }).click();

    await expect(panel(page)).toHaveAttribute("data-mode", "chat");
    await expect(panel(page).getByRole("list", { name: "Suggested questions" })).toHaveCount(0);
    await expect(panel(page).getByRole("img", { name: /^Tushky, the golden retriever/ })).toHaveCount(0);
    await expect(conversation(page).locator('[data-role="user"]')).toHaveText(/What products has Tushar built\?/);
    await expect(lastAnswer(page)).toHaveAttribute("data-msg", "answer");
    const sources = lastAnswer(page).getByRole("list", { name: "Sources" }).getByRole("link");
    await expect(sources).toHaveText(["TeachSpark", "RailCite", "Nuptis → Velora"]);
    for (const href of await sources.evaluateAll((els) => els.map((a) => a.getAttribute("href") ?? "")))
      expect(href).not.toMatch(/^https?:/); // titles only — no raw URLs for this answer
    const followUps = lastAnswer(page).getByRole("list", { name: "Follow-up questions" }).getByRole("button");
    const n = await followUps.count();
    expect(n).toBeGreaterThanOrEqual(2);
    expect(n).toBeLessThanOrEqual(3);
    await expect(input(page)).toBeFocused(); // focus stays in the drawer, on the composer
    // The composer stays pinned to the bottom in chat mode.
    const composer = (await panel(page).locator(".tk-composer").boundingBox())!;
    expect(Math.round(composer.y + composer.height)).toBe(page.viewportSize()!.height);

    // A follow-up asks again: a second exchange appears, and only the latest answer offers follow-ups.
    const label = (await followUps.first().textContent())!.trim();
    await followUps.first().click();
    await expect(conversation(page).locator('[data-role="user"]')).toHaveCount(2);
    await expect(conversation(page).locator('[data-role="user"]').last()).toHaveText(new RegExp(label));
    await expect(lastAnswer(page)).toHaveAttribute("data-msg", "answer");
    await expect(panel(page).getByRole("list", { name: "Follow-up questions" })).toHaveCount(1);

    // A typed question works too; an off-topic one gets the fallback, never an invented answer.
    await askQuery(page, OFF_TOPIC_QUERY);
    await expect(lastAnswer(page)).toHaveAttribute("data-msg", "empty");
    await expect(lastAnswer(page)).toContainText(FALLBACK);
    await expect(lastAnswer(page).getByRole("list", { name: "Sources" })).toHaveCount(0);
    expect(page.url()).toBe(urlBefore); // in place, never navigates (S7)

    // Closing resets: a fresh open is the empty state again.
    await page.keyboard.press("Escape");
    await expect(panel(page)).toBeHidden();
    await openPanel(page);
    await expect(panel(page)).toHaveAttribute("data-mode", "empty");
  });

  test("@EVAL-008 every drawer control meets the 44px target floor", { tag: "@EVAL-008" }, async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await openPanel(page);
    const measure = async () => {
      await page.evaluate(() => document.fonts.ready);
      await expect(async () => {
        const controls = panel(page).locator("a[href], button, input");
        const undersized: { text: string; w: number; h: number }[] = [];
        for (let i = 0; i < (await controls.count()); i++) {
          const box = await controls.nth(i).boundingBox();
          if (!box) continue;
          const w = Math.round(box.width);
          const h = Math.round(box.height);
          if (w < 44 || h < 44)
            undersized.push({ text: (await controls.nth(i).innerText().catch(() => "")).slice(0, 30), w, h });
        }
        expect(undersized, `drawer controls below 44x44:\n${JSON.stringify(undersized, null, 2)}`).toEqual([]);
      }).toPass({ timeout: 6000 });
    };
    await measure(); // empty state
    await askQuery(page, REAL_QUERY);
    await measure(); // chat: source chips + follow-ups
  });

  test("@EVAL-008 the open drawer does not overflow the viewport width", { tag: "@EVAL-008" }, async ({
    page,
    noOverflow,
  }) => {
    await page.goto("/", { waitUntil: "load" });
    await openPanel(page);
    await noOverflow(page);
  });

  test("@EVAL-006 the drawer is axe-clean in the empty and chat states", { tag: "@EVAL-006" }, async ({ page, axe }) => {
    test.skip(width(page) !== 390 && width(page) !== 1440, "axe runs at 390 and 1440");
    await page.goto("/", { waitUntil: "load" });
    await openPanel(page);
    await settled(page);
    await axe(page, { include: "dialog.ask-panel" });
    await askQuery(page, REAL_QUERY);
    await axe(page, { include: "dialog.ask-panel" });
  });

  test("@EVAL-010 reduced motion: the drawer appears in place, with no slide and no mascot entrance", async ({
    page,
    withReducedMotion,
  }) => {
    test.skip(width(page) !== 1440, "reduced-motion check runs at w1440");
    await withReducedMotion(page);
    await page.goto("/", { waitUntil: "load" });
    await openPanel(page);
    const s = await panel(page).evaluate(async (el) => {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const mascot = el.querySelector(".tk-mascot")!;
      return {
        transform: getComputedStyle(el).transform,
        animation: getComputedStyle(el).animationName,
        mascot: getComputedStyle(mascot).animationName,
      };
    });
    expect(s.transform).toBe("none");
    expect(s.animation).toBe("none");
    expect(s.mascot).toBe("none");
  });

  test("@TC-149 screenshots: the drawer empty + chat states at 390 / 1440", async ({ page }) => {
    const w = width(page);
    test.skip(w !== 390 && w !== 1440, "SHOT(m-009/tkt-104r2/*)");
    const dir = "docs/screenshots/m-009/tkt-104r2";
    await page.goto("/", { waitUntil: "load" });
    await openPanel(page);
    await settled(page);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${dir}/empty-${w}.png` });
    await panel(page).getByRole("button", { name: "What products has Tushar built?" }).click();
    await expect(lastAnswer(page)).toHaveAttribute("data-msg", "answer");
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${dir}/chat-${w}.png` });
    // The TC-149 pack keeps its path: the drawer's chat state.
    await page.screenshot({ path: `docs/screenshots/m-009/ask-panel-${w}.png` });
  });
});
