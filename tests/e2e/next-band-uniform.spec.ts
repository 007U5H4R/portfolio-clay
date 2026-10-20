/**
 * next-band-uniform.spec.ts (TASK-290) — the "Next project" band is ONE size on every case study, the TeachSpark band's (TASK-288).
 * For every case-study slug, at the end of the page, at 375 / 1440 (spot-checks 768 and 1024), light and dark:
 *   - the band's body (below a NextProject band's 44px torn top) is the TeachSpark band's height, +-2px;
 *   - its art, when it has any, is object-fit cover and fully decoded (never distorted);
 *   - the text sits inside the band, never wider than the viewport, and clears the site footer's top edge by >= 8px.
 * Runs in one project (it sets its own viewports).
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { caseStudies } from "@/data/case-studies";

const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);

async function measure(page: Page, slug: string, theme: "light" | "dark") {
  await page.goto(`/work/${slug}`, { waitUntil: "load" });
  await setTheme(page, theme);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(900);
  const img = page.locator('section[aria-label="Next project"] .next-band-art img').filter({ visible: true });
  const hasArt = (await img.count()) > 0;
  if (hasArt) {
    await expect.poll(() => img.first().evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    await img.first().evaluate((el: HTMLImageElement) => el.decode());
  }
  return page.evaluate(() => {
    const band = document.querySelector('section[aria-label="Next project"]')!;
    const b = band.getBoundingClientRect();
    const torn = band.querySelector(":scope > svg[data-decor='torn']")?.getBoundingClientRect().height ?? 0;
    const t = band.querySelector("a")!.getBoundingClientRect();
    const shown = [...band.querySelectorAll<HTMLImageElement>(".next-band-art img")].find((i) => getComputedStyle(i).display !== "none");
    return {
      body: b.height - torn, bt: b.top + torn, bb: b.bottom, bl: b.left, br: b.right,
      tt: t.top, tb: t.bottom, tl: t.left, tr: t.right,
      ft: document.querySelector("footer")!.getBoundingClientRect().top,
      fit: shown ? getComputedStyle(shown).objectFit : null,
      vw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth,
    };
  });
}

test.describe("next band: one size on every case study (TASK-290)", () => {
  test.beforeEach(() => {
    test.skip(test.info().project.name !== "w1440", "sets its own viewports");
  });
  test.setTimeout(120_000);

  const widths: [number, string[]][] = [[375, ["light", "dark"]], [1440, ["light", "dark"]], [768, ["light"]], [1024, ["light"]]];
  for (const study of caseStudies) {
    test(`${study.slug}`, async ({ page }) => {
      for (const [w, themes] of widths) {
        await page.setViewportSize({ width: w, height: 900 });
        for (const theme of themes as ("light" | "dark")[]) {
          const std = await measure(page, "teachspark", theme);
          const m = await measure(page, study.slug, theme);
          const tag = `${study.slug} @${w} ${theme}`;
          expect(Math.abs(m.body - std.body), `${tag}: band body ${m.body} vs TeachSpark ${std.body}`).toBeLessThanOrEqual(2);
          expect(m.tt, `${tag}: text top`).toBeGreaterThanOrEqual(m.bt);
          expect(m.tb, `${tag}: text bottom`).toBeLessThanOrEqual(m.bb);
          expect(m.tl, `${tag}: text left`).toBeGreaterThanOrEqual(m.bl);
          expect(m.tr, `${tag}: text right`).toBeLessThanOrEqual(m.br);
          expect(m.ft - m.tb, `${tag}: text clears the footer's top edge`).toBeGreaterThanOrEqual(8);
          if (m.fit) expect(m.fit, `${tag}: art fit`).toBe("cover");
          expect(m.sw, `${tag}: no horizontal overflow`).toBeLessThanOrEqual(m.vw);
        }
      }
    });
  }

  // Review crops (not an assertion): NEXT_BAND_CROPS=<dir> writes each band, as seen at the end of the page, at 2x.
  const cropDir = process.env.NEXT_BAND_CROPS;
  test.describe("review crops", () => {
    test.skip(!cropDir, "set NEXT_BAND_CROPS to capture");
    test.use({ deviceScaleFactor: 2 });
    for (const study of caseStudies) {
      test(`crops ${study.slug}`, async ({ page }) => {
        for (const w of [1440, 375]) {
          await page.setViewportSize({ width: w, height: 900 });
          for (const theme of ["light", "dark"] as const) {
            await measure(page, study.slug, theme);
            const r = await page.evaluate(() => {
              const b = document.querySelector('section[aria-label="Next project"]')!.getBoundingClientRect();
              return { x: 0, y: Math.max(0, b.top - 12), width: window.innerWidth, height: Math.min(window.innerHeight - Math.max(0, b.top - 12), b.height + 12) };
            });
            await page.screenshot({ path: `${cropDir}/${study.slug}-${w}-${theme}.png`, clip: r });
          }
        }
      });
    }
  });
});
