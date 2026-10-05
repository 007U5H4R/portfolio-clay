/**
 * eval-024.spec.ts (`@EVAL-024`; evaluation-plan.md §9.3; toggle.md §39–§41, dark-mode.md §53; TASK-141) — the header's
 * paper-cut theme switch, at w390 and w1440.
 *
 *   semantics     — `role="switch"` named "Use dark theme", `aria-checked` ↔ `data-theme` agree both ways;
 *                   LIGHT / DARK are real text in the control.
 *   keyboard      — focusable by Tab; Space and Enter both toggle; the focus ring is solid ≥ 2 px and ≥ 3:1 against
 *                   the page in BOTH themes.
 *   reserved box  — the control's box is the same before and after hydration and no layout shift is attributed to it.
 *   reduced motion— no transition on the art, no View Transition / transition mark, the theme still switches.
 *   axe           — the header is axe-clean (0 critical / serious) in both themes and both switch states.
 * VoiceOver is the manual half (TASK-141 gate).
 */
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

const MEASURED = [390, 1440];
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const skipUnmeasured = (page: Page) => test.skip(!MEASURED.includes(width(page)), "EVAL-024 measures w390 and w1440 only");
const theme = (page: Page) => page.evaluate(() => document.documentElement.getAttribute("data-theme"));
const toggle = (page: Page) => page.locator("[data-theme-toggle]");

/** Any CSS colour → [r,g,b] via a 1×1 canvas (computed oklch() values need real conversion). */
async function rgbOf(page: Page, css: string): Promise<[number, number, number]> {
  return page.evaluate((c) => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const cx = cv.getContext("2d")!;
    cx.fillStyle = "#000";
    cx.fillStyle = c;
    cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    return [d[0]!, d[1]!, d[2]!] as [number, number, number];
  }, css);
}
const lum = ([r, g, b]: [number, number, number]) => {
  const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a: [number, number, number], b: [number, number, number]) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

test("@EVAL-024 one switch: role, action name, real LIGHT/DARK text, aria-checked agrees with data-theme", async ({ page }) => {
  skipUnmeasured(page);
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/", { waitUntil: "load" });
  const sw = page.getByRole("switch", { name: "Use dark theme" });
  await expect(sw).toBeVisible();
  await expect(sw).toHaveCount(1);
  await expect(sw).toContainText("Light");
  await expect(sw).toContainText("Dark");
  await expect(sw).toHaveAttribute("aria-checked", "false");
  expect(await theme(page)).toBe("light");
  await sw.click();
  await expect(sw).toHaveAttribute("aria-checked", "true");
  expect(await theme(page)).toBe("dark");
  await sw.click();
  await expect(sw).toHaveAttribute("aria-checked", "false");
  expect(await theme(page)).toBe("light");
});

test("@EVAL-024 keyboard: Tab reaches it, Space and Enter toggle, the focus ring is solid ≥ 2 px and ≥ 3:1 in both themes", async ({ page }) => {
  skipUnmeasured(page);
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/", { waitUntil: "load" });
  const sw = toggle(page);
  for (const expected of ["dark", "light"] as const) {
    await sw.focus();
    await page.keyboard.press("Space");
    await expect.poll(() => theme(page)).toBe(expected);
    await page.keyboard.press("Enter");
    await expect.poll(() => theme(page)).toBe(expected === "dark" ? "light" : "dark");
    await page.keyboard.press("Enter");
    await expect.poll(() => theme(page)).toBe(expected);
    // ring, in the theme we are in now
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    const ring = await sw.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth), color: cs.outlineColor, focused: el === document.activeElement, bg: getComputedStyle(document.documentElement).backgroundColor };
    });
    expect(ring.focused, "the switch is the focused element").toBe(true);
    expect(ring.style).toBe("solid");
    expect(ring.width).toBeGreaterThanOrEqual(2);
    const c = ratio(await rgbOf(page, ring.color), await rgbOf(page, ring.bg));
    test.info().annotations.push({ type: "eval-024", description: `focus ring in ${expected}: ${c.toFixed(2)}:1` });
    expect(c, `focus ring contrast in ${expected}`).toBeGreaterThanOrEqual(3);
  }
});

test("@EVAL-024 the box is reserved: same size before and after hydration, no layout shift attributed to it", async ({ page }) => {
  skipUnmeasured(page);
  await page.addInitScript(() => {
    const w = window as unknown as { __shifts: number };
    w.__shifts = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as { hadRecentInput: boolean; sources?: { node?: Element }[] }[]) {
        if (e.hadRecentInput) continue;
        for (const s of e.sources ?? []) if (s.node && (s.node as Element).closest?.("[data-theme-toggle]")) w.__shifts += 1;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(600);
  const box = await toggle(page).boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.width).toBeGreaterThanOrEqual(width(page) < 640 ? 56 : 112);
  expect(await page.evaluate(() => (window as unknown as { __shifts: number }).__shifts), "layout shifts attributed to the toggle").toBe(0);
  const html = await (await page.request.get("/")).text();
  expect(html, "the control is in the server HTML (reserved before hydration)").toContain("data-theme-toggle");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("@EVAL-024 reduced motion: static art, no transition mark, the theme still switches", async ({ page }) => {
    skipUnmeasured(page);
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/", { waitUntil: "load" });
    const dur = await page.locator(".tt-scene-light").evaluate((el) => getComputedStyle(el).transitionDuration);
    // the global reduced-motion rule collapses durations to ~1 ms (app/globals.css), i.e. no visible transition
    expect(dur.split(",").every((d) => parseFloat(d) <= 0.01), `scene transition duration ${dur}`).toBe(true);
    await toggle(page).click();
    const marks = await page.evaluate(() => ({ vt: document.documentElement.hasAttribute("data-theme-vt"), sw: document.documentElement.hasAttribute("data-theme-switching") }));
    expect(marks).toEqual({ vt: false, sw: false });
    expect(await theme(page)).toBe("dark");
  });
});

for (const scheme of ["light", "dark"] as const) {
  test(`@EVAL-024 axe on the header in ${scheme} (switch off and on): 0 critical / serious`, async ({ page }) => {
    skipUnmeasured(page);
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/", { waitUntil: "load" });
    for (const state of [0, 1]) {
      if (state === 1) await toggle(page).click();
      await page.waitForTimeout(500); // the 240 ms dissolve
      const results = await new AxeBuilder({ page }).include("header").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      const bad = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
      expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`), `header axe, ${scheme} start, state ${state}`).toEqual([]);
    }
  });
}
