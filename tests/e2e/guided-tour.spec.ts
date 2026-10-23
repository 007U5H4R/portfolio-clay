/**
 * guided-tour.spec.ts (TASK-170) — the replayable guided tour. Drives its own viewports (runs once, from w390):
 *   - the one-time invite shows (opt-in under automation) and never again once dismissed; never without the opt-in;
 *   - desktop: the header "Take a tour" button; Next / Back / → / ← / Escape; focus goes back to the button;
 *   - phone: the More-menu row; a bottom sheet with each target scrolled into view; ends on the brand with the hint
 *     (no link, no game name); Done returns focus to the More button;
 *   - started from another page it opens on the home page;
 *   - the phone carousel does not advance while the tour is open;
 *   - reduced motion: fades only.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const note = (page: Page) => page.locator("[data-guided-tour]");
const live = (page: Page) => page.locator("[data-tour-live]");
const activeIndex = (page: Page, id: string) =>
  page.locator(`#${id} .hs-dot`).evaluateAll((els) => els.findIndex((e) => e.getAttribute("aria-current") === "true"));

async function load(page: Page, w: number, path = "/", init?: () => void) {
  if (init) await page.addInitScript(init);
  await page.setViewportSize({ width: w, height: w < 640 ? 844 : 900 });
  await page.goto(path, { waitUntil: "load" });
}

async function startFromMenu(page: Page) {
  await page.getByRole("button", { name: "More", exact: true }).click();
  await page.locator("dialog.more-menu").getByRole("button", { name: /Take a tour/ }).click();
  await expect(page.locator("dialog.more-menu")).toHaveCount(0);
  await expect(note(page)).toBeVisible();
}

/**
 * ≥44 px controls, scoped to the tour's own UI (invite / note / entry buttons) rather than the
 * whole page: the shared `minTargets` fixture audits every `a[href]`/button on the document, and
 * the home page's Selected Work cards (`HomeSections.tsx`, out of scope for TASK-170 and owned by
 * a different in-flight change) already carry an undersized `.hs-link` name anchor that no
 * existing spec exercises today because nothing calls `minTargets` on "/". This keeps the new
 * tour controls honest without tripping on that pre-existing, unrelated gap.
 */
async function minTourTargets(page: Page) {
  const sizes = await page.evaluate(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-tour-invite] button, [data-guided-tour] button, [data-site-header] .header-tour",
      ),
    );
    return els
      .filter((el) => el.getBoundingClientRect().width > 0)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { text: (el.textContent ?? "").trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) };
      });
  });
  for (const s of sizes) {
    expect(s.w, `"${s.text}" width`).toBeGreaterThanOrEqual(44);
    expect(s.h, `"${s.text}" height`).toBeGreaterThanOrEqual(44);
  }
}

/** The current stop's target box sits between the header and the note (phone sheet / desktop). */
async function targetInView(page: Page) {
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const ring = document.querySelector<HTMLElement>(".tour-ring");
        const n = document.querySelector<HTMLElement>("[data-guided-tour]");
        if (!ring || ring.hidden || !n) return "no ring";
        const r = ring.getBoundingClientRect();
        const s = n.getBoundingClientRect();
        if (r.top < -1 || r.top > window.innerHeight) return `ring off-screen ${Math.round(r.top)}`;
        if (n.dataset.side === "sheet" && r.top >= s.top) return `ring under sheet ${Math.round(r.top)} >= ${Math.round(s.top)}`;
        return "ok";
      }),
    )
    .toBe("ok");
}

test.describe("guided tour (TASK-170)", () => {
  test("the invite shows once and never again after it is dismissed", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    await load(page, 1440, "/", () => ((window as { __tourInvite?: boolean }).__tourInvite = true));
    const invite = page.locator("[data-tour-invite]");
    await expect(invite).toBeVisible({ timeout: 5_000 });
    await expect(invite).toContainText("Want a 30-second tour?");
    await invite.getByRole("button", { name: "No thanks" }).click();
    await expect(invite).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("tp-tour-invite"))).toBe("dismissed");
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(2_500);
    await expect(invite).toHaveCount(0);
  });

  test("the invite's Show me starts the tour; an automated browser without the opt-in never sees the invite", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    await load(page, 390, "/", () => ((window as { __tourInvite?: boolean }).__tourInvite = true));
    const invite = page.locator("[data-tour-invite]");
    await expect(invite).toBeVisible({ timeout: 5_000 });
    await minTourTargets(page);
    await invite.getByRole("button", { name: "Show me" }).click();
    await expect(note(page)).toHaveAttribute("data-tour-step", "hero");
    await page.keyboard.press("Escape");
    await expect(note(page)).toHaveCount(0);

    const fresh = await page.context().browser()!.newContext({ viewport: { width: 390, height: 844 } });
    const p2 = await fresh.newPage();
    await p2.goto(page.url(), { waitUntil: "load" });
    await p2.waitForTimeout(2_500);
    await expect(p2.locator("[data-tour-invite]")).toHaveCount(0);
    await fresh.close();
  });

  test("desktop: header button, Next / Back / arrows / Escape, focus restored", async ({ page, axe, noOverflow }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    await load(page, 1440);
    const button = page.locator("[data-site-header] .header-tour");
    await expect(button).toBeVisible();
    await expect(button).toHaveAccessibleName("Take a tour");
    await button.click();

    const dialog = page.getByRole("dialog", { name: "Start here" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toBeFocused();
    await expect(live(page)).toHaveText("Step 1 of 6: Start here");
    await expect(dialog.getByRole("button", { name: "Back" })).toHaveCount(0);
    await targetInView(page);
    await minTourTargets(page);
    await axe(page, { include: "[data-guided-tour]" });

    await dialog.getByRole("button", { name: "Next" }).click();
    await expect(note(page)).toHaveAttribute("data-tour-step", "work");
    await expect(live(page)).toHaveText("Step 2 of 6: Selected work");
    await expect(page.getByRole("button", { name: "Next" })).toBeFocused();
    await targetInView(page);

    await page.keyboard.press("ArrowRight");
    await expect(note(page)).toHaveAttribute("data-tour-step", "ask");
    await page.keyboard.press("ArrowLeft");
    await expect(note(page)).toHaveAttribute("data-tour-step", "work");
    await page.getByRole("button", { name: "Back" }).click();
    await expect(note(page)).toHaveAttribute("data-tour-step", "hero");

    // the note never leaves the viewport (either axis, once the scroll settles) and nothing scrolls sideways
    await expect
      .poll(async () => {
        const b = (await note(page).boundingBox())!;
        return b.x >= 0 && b.x + b.width <= 1440 && b.y >= 0 && b.y + b.height <= 900;
      })
      .toBe(true);
    await noOverflow(page);

    await page.keyboard.press("Escape");
    await expect(note(page)).toHaveCount(0);
    await expect(button).toBeFocused();
    await expect(page.locator("html")).not.toHaveAttribute("data-tour-open");
  });

  test("phone: the menu row, a bottom sheet, every target in view, ends on the brand hint", async ({ page, noOverflow }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    await load(page, 390);
    await expect(page.locator("[data-site-header] .header-tour")).toBeHidden();
    await startFromMenu(page);
    await expect(note(page)).toHaveAttribute("data-side", "sheet");

    const ids = ["hero", "work", "ask", "credentials", "theme", "brand"];
    for (const [i, id] of ids.entries()) {
      await expect(note(page)).toHaveAttribute("data-tour-step", id);
      await expect(live(page)).toContainText(`Step ${i + 1} of 6`);
      await targetInView(page);
      if (i === 0) {
        await minTourTargets(page);
        await noOverflow(page);
      }
      if (i < ids.length - 1) await page.getByRole("button", { name: "Next" }).click();
    }

    // the last stop: the brand, the exact hint, no link and no game name (S30, EXE-82)
    await expect(note(page).locator(".tour-body")).toHaveText("Psst, tap my name 5 times, fast.");
    await expect(note(page).locator("a")).toHaveCount(0);
    await expect(note(page)).not.toContainText(/gummy|lab|game/i);
    // the ring slides between stops (280 ms), so wait for it to settle on the brand
    await expect
      .poll(async () => {
        const ring = (await page.locator(".tour-ring").boundingBox())!;
        const brand = (await page.locator("[data-site-header] .header-brand").boundingBox())!;
        return Math.max(
          Math.abs(ring.x + ring.width / 2 - (brand.x + brand.width / 2)),
          Math.abs(ring.y + ring.height / 2 - (brand.y + brand.height / 2)),
        );
      })
      .toBeLessThan(2);

    await page.getByRole("button", { name: "Done" }).click();
    await expect(note(page)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "More", exact: true })).toBeFocused();
  });

  test("started from another page, it opens on the home page", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    await load(page, 1440, "/work");
    await page.locator("[data-site-header] .header-tour").click();
    await expect(page).toHaveURL(/\/$/);
    await expect(note(page)).toHaveAttribute("data-tour-step", "hero");
    await page.keyboard.press("Escape");
    await expect(note(page)).toHaveCount(0);
  });

  test("the phone carousel does not advance while the tour is open", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    test.setTimeout(45_000);
    await load(page, 390, "/", () => ((window as { __hsCarouselAutoplay?: boolean }).__hsCarouselAutoplay = true));
    await startFromMenu(page);
    for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Next" }).click();
    await expect(note(page)).toHaveAttribute("data-tour-step", "credentials");
    await targetInView(page);
    // paused while the tour is open: no `data-autoplay` (TASK-170), and the active card never moves
    await expect(page.locator("#credentials .hs-carousel")).not.toHaveAttribute("data-autoplay");
    const before = await activeIndex(page, "credentials");
    await page.waitForTimeout(6_000);
    expect(await activeIndex(page, "credentials")).toBe(before);
    // closing the tour lets autoplay carry on
    await page.keyboard.press("Escape");
    await expect(page.locator("#credentials .hs-carousel")).toHaveAttribute("data-autoplay", "");
    await expect.poll(() => activeIndex(page, "credentials"), { timeout: 8_000 }).not.toBe(before);
  });

  test("reduced motion: fades only", async ({ page }) => {
    test.skip(width(page) !== 390, "drives its own viewports; runs once");
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const w of [1440, 390]) {
      await load(page, w);
      if (w < 640) await startFromMenu(page);
      else await page.locator("[data-site-header] .header-tour").click();
      await expect(note(page)).toBeVisible();
      const motion = await page.evaluate(() => {
        const n = document.querySelector<HTMLElement>("[data-guided-tour]")!;
        const r = document.querySelector<HTMLElement>(".tour-ring")!;
        const s = getComputedStyle(n);
        return { anim: s.animationName, noteT: s.transitionDuration, ringT: getComputedStyle(r).transitionDuration };
      });
      // A6 (globals.css:402): reduced motion collapses every transition to ~instant via `1ms !important`,
      // not a literal 0s — same convention the rest of the site uses.
      expect(motion.anim, `w${w}`).toBe("tour-fade");
      expect(motion.noteT, `w${w}`).toBe("0.001s");
      expect(motion.ringT, `w${w}`).toBe("0.001s");
      await page.keyboard.press("Escape");
      await expect(note(page)).toHaveCount(0);
    }
  });
});
