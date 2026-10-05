/**
 * eval-025-scenes.spec.ts (`@EVAL-025`; M-010 T3, TASK-144.5/144.6) — the paper-cut tab scenes are live pairs.
 * For each tab opener (w390 uses the narrow crop, w1440 the full 3168×1344 scene), in both themes:
 *
 *   one visible twin — exactly one banner image is visible, the one for the active theme, with real pixels
 *                      (`naturalWidth` > 0; the dark twin is lazy so it is warmed first, as a visitor's idle warm-up does);
 *   right file       — its `currentSrc` is the matching rendition: `<id>` light / `<id>-dark` dark, `-mobile` at w390;
 *   hidden twin      — the other twin is `display: none` (removed from the accessibility tree), never a CSS filter;
 *   one alt          — both twins carry the one manifest alt (and only the visible one is in the accessibility tree).
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { ILLUSTRATIONS } from "@/content/media/illustrations/manifest";

const MEASURED = [390, 1440];
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const ROUTES: { route: string; id: string }[] = [
  { route: "/about", id: "scene-about" },
  { route: "/work", id: "scene-experience" },
  { route: "/thinking", id: "scene-thinking" },
  { route: "/projects", id: "scene-work" },
  { route: "/playground", id: "scene-playground" },
  { route: "/certifications", id: "scene-certifications" },
  { route: "/contact", id: "scene-contact" },
];

for (const { route, id } of ROUTES) {
  for (const theme of ["light", "dark"] as const) {
    test(`@EVAL-025 ${route} (${id}) shows its ${theme} twin only`, async ({ page }) => {
      test.skip(!MEASURED.includes(width(page)), "EVAL-025 scenes are measured at w390 and w1440");
      await page.addInitScript(
        ({ t }) => {
          if (!sessionStorage.getItem("__seeded")) {
            localStorage.setItem("portfolio-theme", t);
            sessionStorage.setItem("__seeded", "1");
          }
        },
        { t: theme },
      );
      await page.goto(route, { waitUntil: "load" });
      await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute("data-theme"))).toBe(theme);
      const fig = page.locator(`figure.scene-banner[data-illustration="${id}"]`);
      // The inactive twin is lazy; the active one decodes at load. Wait for the active one to have pixels.
      await expect
        .poll(() => fig.evaluate((el) => [...el.querySelectorAll("img")].some((img) => img.naturalWidth > 0 && img.getBoundingClientRect().width > 0)), { timeout: 15_000 })
        .toBe(true);
      const imgs = await fig.evaluate((el) =>
        [...el.querySelectorAll("img")].map((img) => ({
          art: img.closest("[data-theme-art]")?.getAttribute("data-theme-art") ?? null,
          shown: getComputedStyle(img.closest("[data-theme-art]") ?? img).display !== "none" && img.getBoundingClientRect().width > 0,
          src: decodeURIComponent(img.currentSrc),
          natural: img.naturalWidth,
          filter: getComputedStyle(img).filter,
          alt: img.getAttribute("alt"),
        })),
      );
      expect(imgs.length, "two twins in the markup").toBe(2);
      const visible = imgs.filter((i) => i.shown);
      expect(visible.length, "exactly one twin visible").toBe(1);
      const [on] = visible;
      expect(on!.art, "the active theme's twin").toBe(theme);
      expect(on!.filter, "no CSS filter on art").toBe("none");
      const mobile = width(page) < 768;
      expect(on!.src, "rendition file").toContain(`${id}${theme === "dark" ? "-dark" : ""}${mobile ? "-mobile" : ""}`);
      if (theme === "light") expect(on!.src, "light is never the dark file").not.toContain("-dark");
      expect(imgs.map((i) => i.alt).every((a) => a === ILLUSTRATIONS.find((e) => e.id === id)!.alt), "one shared alt").toBe(true);
      expect(imgs.filter((i) => !i.shown).length, "the other twin is hidden").toBe(1);
    });
  }
}
