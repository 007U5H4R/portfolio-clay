/**
 * eval-026.spec.ts (`@EVAL-026`; evaluation-plan.md §9.3; dark-mode.md §59–§61; TASK-141) — theme-switch stability.
 * light → dark → light on every static route at w390 and w1440, plus with the Ask drawer open, on a case study
 * and at the footer:
 *
 *   CLS            — the sum of layout shifts across the switch is < 0.05 (buffered `layout-shift` observer);
 *   height         — `scrollHeight` before and after each switch differs by ≤ 1 px (no layout jump);
 *   no CSS filter  — no tone filter (invert / brightness / hue-rotate …; only a cut-out's own `drop-shadow()` is allowed)
 *                    on any img / picture / video / iframe / canvas / [data-scene] in dark mode — rich art is swapped
 *                    by matched file, never converted (dark-mode.md §42);
 *   footer         — the band keeps its terracotta token (`.band-body` background = the live `--color-terracotta`);
 *   console        — 0 errors.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { STATIC_ROUTES } from "./routes";

const MEASURED = [390, 1440];
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const skipUnmeasured = (page: Page) => test.skip(!MEASURED.includes(width(page)), "EVAL-026 measures w390 and w1440 only");
const theme = (page: Page) => page.evaluate(() => document.documentElement.getAttribute("data-theme"));

async function watchShifts(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __cls: number };
    w.__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as { hadRecentInput: boolean; value: number }[]) if (!e.hadRecentInput) w.__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
}
const cls = (page: Page) => page.evaluate(() => (window as unknown as { __cls: number }).__cls);
const height = (page: Page) => page.evaluate(() => document.documentElement.scrollHeight);

/** Flip through the real control; `viaDom` clicks the element directly (it sits behind the Ask drawer's modal backdrop). */
async function flip(page: Page, to: "light" | "dark", viaDom = false) {
  const sw = page.locator("[data-theme-toggle]");
  if (viaDom) await sw.evaluate((el: HTMLElement) => el.click());
  else await sw.click();
  await expect.poll(() => theme(page)).toBe(to);
  await page.waitForTimeout(450); // the 240 ms dissolve + settle
}

/**
 * Tone filters on art are forbidden (dark-mode.md §42: invert / brightness / hue-rotate …). A `drop-shadow()` is
 * the cut-out's own paper shadow, not a conversion of the art, so it is allowed — anything else is a failure.
 */
async function filtered(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll("img, picture, video, iframe, canvas, [data-scene]")]
      .filter((el) => {
        const f = getComputedStyle(el).filter;
        return f !== "none" && f.replace(/drop-shadow\((?:[^()]|\([^()]*\))*\)/g, "").trim() !== "";
      })
      .map((el) => `${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).split(" ")[0] : ""}: ${getComputedStyle(el).filter}`),
  );
}

async function bandTerracottaIntact(page: Page) {
  return page.evaluate(() => {
    const band = document.querySelector(".band-body");
    if (!band) return null;
    const probe = document.createElement("i");
    probe.style.backgroundColor = "var(--color-terracotta)";
    document.body.appendChild(probe);
    const want = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return getComputedStyle(band).backgroundColor === want;
  });
}

async function roundTrip(page: Page, route: string, opts: { viaDom?: boolean; before?: () => Promise<void> } = {}) {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({ colorScheme: "light" });
  await watchShifts(page);
  await page.goto(route, { waitUntil: "load" });
  await page.waitForTimeout(600);
  await opts.before?.();
  const h0 = await height(page);
  const c0 = await cls(page);
  await flip(page, "dark", opts.viaDom);
  const h1 = await height(page);
  expect(await filtered(page), `${route}: filtered media in dark`).toEqual([]);
  expect(await bandTerracottaIntact(page), `${route}: band terracotta token in dark`).not.toBe(false);
  // Regression (TASK-141): a scene without a dark twin must still render in dark — the `[data-theme-art]` hide rules
  // may only ever touch a PAIRED scene's inactive twin.
  expect(
    await page.evaluate(() =>
      [...document.querySelectorAll("figure[data-illustration]")]
        .filter((f) => ![...f.querySelectorAll("img")].some((i) => i.getBoundingClientRect().width > 0))
        .map((f) => f.getAttribute("data-illustration")),
    ),
    `${route}: scene figures with no visible image in dark`,
  ).toEqual([]);
  await flip(page, "light", opts.viaDom);
  const h2 = await height(page);
  const shift = (await cls(page)) - c0;
  test.info().annotations.push({ type: "eval-026", description: `${route} @${width(page)}: CLS ${shift.toFixed(4)}, height ${h0}→${h1}→${h2}` });
  expect(shift, `${route}: CLS across the switch`).toBeLessThan(0.05);
  expect(Math.abs(h1 - h0), `${route}: scrollHeight light→dark`).toBeLessThanOrEqual(1);
  expect(Math.abs(h2 - h1), `${route}: scrollHeight dark→light`).toBeLessThanOrEqual(1);
  expect(errors, `${route}: console errors`).toEqual([]);
}

for (const route of STATIC_ROUTES) {
  test(`@EVAL-026 ${route}: light → dark → light is stable`, async ({ page }) => {
    skipUnmeasured(page);
    await roundTrip(page, route);
  });
}

test("@EVAL-026 with the Ask drawer open", async ({ page }) => {
  skipUnmeasured(page);
  await roundTrip(page, "/", {
    viaDom: true,
    before: async () => {
      await page.getByRole("button", { name: "Ask AI" }).click();
      await page.waitForTimeout(700);
    },
  });
});

test("@EVAL-026 at the footer of a case study", async ({ page }) => {
  skipUnmeasured(page);
  await roundTrip(page, "/work/teachspark", {
    before: async () => {
      await page.locator(".band").scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    },
  });
});
