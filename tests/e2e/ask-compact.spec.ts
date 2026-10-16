/**
 * ask-compact.spec.ts (TASK-229) — the phone-only compact Ask Tushky section (< 640 px). On a phone the eyebrow, title,
 * subtitle, intro, small Tushky, composer with its send button and three prompts fit one screen above the dock; the other
 * three prompts stay reachable through "More questions". Tablet and desktop render as before (all six prompts, no button).
 * The launcher answers in the right-side drawer from the same local index as always, so submitting is exercised for real.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { TUSHKY_SUGGESTIONS } from "@/components/ai/tushky-questions";

const HEADER_H = 69; // the compact phone header (TASK-224)
const WIDTHS = [
  { w: 320, h: 568 },
  { w: 360, h: 740 },
  { w: 375, h: 812 },
  { w: 390, h: 844 },
  { w: 412, h: 915 },
  { w: 430, h: 932 },
];
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const section = (page: Page) => page.locator("section#ask");
const cards = (page: Page) => section(page).locator("ul.hat-cards .hat-card"); // CSS, not role: the hidden extras must still be counted
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);

/** Load Home, pick the theme, scroll #ask to just under the header, let the one-shot entrance finish. */
async function openAsk(page: Page, theme: "light" | "dark" = "light") {
  await page.goto("/", { waitUntil: "load" });
  await setTheme(page, theme);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate((hh) => {
    const top = document.querySelector("#ask")!.getBoundingClientRect().top + window.scrollY - hh;
    window.scrollTo({ top, behavior: "instant" });
  }, HEADER_H);
  await expect(page.locator(".hat-grid[data-in]")).toHaveCount(1);
  await page.waitForTimeout(1_100);
}

const box = async (page: Page, selector: string) => (await page.locator(selector).first().boundingBox())!;
const dockTop = async (page: Page) => (await box(page, ".mobile-dock")).y;

test.describe("compact Ask Tushky on phones (TASK-229)", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`fits above the dock at every phone width (${theme})`, async ({ page }) => {
      test.skip(width(page) !== 390, "drives its own viewports; runs once");
      test.setTimeout(120_000);
      for (const { w, h } of WIDTHS) {
        await page.setViewportSize({ width: w, height: h });
        await openAsk(page, theme);
        const tag = `${theme} ${w}x${h}`;
        const dock = await dockTop(page);
        const bottomOf = async (sel: string) => {
          const b = await box(page, sel);
          return b.y + b.height;
        };
        // always: title and composer + send above the dock, intro readable, nothing clipped sideways
        for (const sel of ["#ask-heading", ".hat-lead", ".hat-composer", ".hat-send"]) {
          expect(await bottomOf(sel), `${sel} above dock at ${tag}`).toBeLessThanOrEqual(dock + 0.5);
          const b = await box(page, sel);
          expect(b.x, `${sel} left edge at ${tag}`).toBeGreaterThanOrEqual(0);
          expect(b.x + b.width, `${sel} right edge at ${tag}`).toBeLessThanOrEqual(w + 0.5);
        }
        expect(await bottomOf(".hat-subtitle"), `subtitle above dock at ${tag}`).toBeLessThanOrEqual(dock + 0.5);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `overflow at ${tag}`).toBeLessThanOrEqual(0);
        // the composer is never hidden behind the dock: the point at the send button's centre hits the send button
        const send = await box(page, ".hat-send");
        const hit = await page.evaluate(([x, y]) => !!document.elementFromPoint(x!, y!)?.closest(".hat-send"), [send.x + send.width / 2, send.y + send.height / 2]);
        expect(hit, `send button reachable at ${tag}`).toBe(true);
        // exactly three prompts visible, one row
        const visible = await cards(page).evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).map((e) => e.getBoundingClientRect().toJSON() as DOMRect));
        expect(visible.length, `visible prompts at ${tag}`).toBe(3);
        expect(new Set(visible.map((b) => Math.round(b.y))).size, `one row at ${tag}`).toBe(1);
        if (h >= 740) {
          // the full composition above the dock: mascot, sticky note (taller phones) and all three prompts
          expect(await bottomOf(".hat-dog"), `mascot above dock at ${tag}`).toBeLessThanOrEqual(dock + 0.5);
          for (const b of visible) expect(b.y + b.height, `prompt above dock at ${tag}`).toBeLessThanOrEqual(dock + 0.5);
          const dog = await box(page, ".hat-dog");
          expect(dog.height, `mascot compact at ${tag}`).toBeLessThanOrEqual(110);
          expect(dog.height).toBeGreaterThanOrEqual(72);
        }
        if (h >= 781) await expect(page.locator(".hat-sticky"), `sticky note at ${tag}`).toBeVisible();
        else await expect(page.locator(".hat-sticky"), `sticky note dropped first at ${tag}`).toBeHidden();
        // tap targets
        for (const el of await section(page).locator("a[href], button, input").all()) {
          const b = await el.boundingBox();
          if (b) expect(Math.min(b.width, b.height), `tap target ${await el.getAttribute("class")} at ${tag}`).toBeGreaterThanOrEqual(44 - 0.5);
        }
      }
    });
  }

  test("More questions reveals the other prompts; no prompt is removed from the data", async ({ page }) => {
    test.skip(width(page) !== 390, "phone only");
    await openAsk(page);
    const more = section(page).getByRole("button", { name: "More questions" });
    await expect(more).toHaveAttribute("aria-expanded", "false");
    await expect(cards(page)).toHaveCount(TUSHKY_SUGGESTIONS.length); // all six stay in the DOM
    await more.click();
    await expect(section(page).getByRole("button", { name: "Fewer questions" })).toHaveAttribute("aria-expanded", "true");
    const visible = await cards(page).evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length);
    expect(visible).toBe(6);
    await expect(cards(page).locator(".hat-card-text")).toHaveText(TUSHKY_SUGGESTIONS.map((q) => q.label));
    // a revealed prompt works like any other
    await cards(page).nth(5).click();
    const drawer = page.locator("dialog.ask-panel");
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('[data-role="user"]').first()).toContainText(TUSHKY_SUGGESTIONS[5]!.label);
    await expect(drawer.locator('[data-role="tushky"][data-msg="answer"]')).toHaveCount(1, { timeout: 5_000 });
  });

  test("submitting a typed question and tapping a visible prompt still open the drawer and answer", async ({ page }) => {
    test.skip(width(page) !== 390, "phone only");
    await openAsk(page);
    const drawer = page.locator("dialog.ask-panel");
    await page.locator("#ask-portfolio-input").fill("What products has Tushar built?");
    await section(page).getByRole("button", { name: "Ask Tushky" }).click();
    await expect(drawer.locator('[data-role="user"]').first()).toContainText("What products has Tushar built?");
    await expect(drawer.locator('[data-role="tushky"][data-msg="answer"]')).toHaveCount(1, { timeout: 5_000 });
    await expect(drawer.getByRole("list", { name: "Sources" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).not.toHaveAttribute("open", "");
    await cards(page).first().click();
    await expect(drawer.locator('[data-role="user"]').first()).toContainText(TUSHKY_SUGGESTIONS[0]!.label);
    await expect(drawer.locator('[data-role="tushky"][data-msg="answer"]')).toHaveCount(1, { timeout: 5_000 });
  });

  test("reduced motion: the compact section is fully visible with nothing offset", async ({ page, withReducedMotion }) => {
    test.skip(width(page) !== 390, "phone only");
    await withReducedMotion(page);
    await page.goto("/", { waitUntil: "load" });
    const states = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#ask .hat-intro > *, #ask .hat-in-dog, #ask .hat-in-panel, #ask .hat-in-card")).map((el) => {
        const cs = getComputedStyle(el);
        return { opacity: cs.opacity, translate: cs.translate, scale: cs.scale };
      }),
    );
    expect(states.length).toBeGreaterThan(8);
    for (const s of states) expect(s).toEqual({ opacity: "1", translate: "none", scale: "none" });
  });

  test("tablet and desktop are unchanged: all six prompts, no More questions button, large mascot", async ({ page }) => {
    test.skip(width(page) < 640, "tablet and desktop only");
    await page.goto("/", { waitUntil: "load" });
    await section(page).scrollIntoViewIfNeeded();
    await expect(cards(page)).toHaveCount(6);
    for (const c of await cards(page).all()) await expect(c).toBeVisible();
    await expect(section(page).getByRole("button", { name: /More questions|Fewer questions/ })).toBeHidden();
    await expect(page.locator(".hat-notebook-title")).toBeVisible();
    await expect(page.locator(".hat-sticky")).toBeVisible();
    const dog = await box(page, ".hat-dog");
    expect(dog.height).toBeGreaterThanOrEqual(200);
    const xs = new Set(await cards(page).evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().x))));
    expect(xs.size).toBe(width(page) >= 1024 && width(page) < 1200 ? 1 : 2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });
});
