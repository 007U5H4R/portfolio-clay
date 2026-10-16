/**
 * footer-compact.spec.ts (TASK-236) — the phone footer: the "Let's connect" content above the paper sea is compact,
 * and the sea + ship are exactly what main shipped.
 *
 * `footer-compact-main.json` is a recording of origin/main (before TASK-236). Re-record it from a main checkout with
 *   FOOT_RECORD_OUT=tests/e2e/footer-compact-main.json PW_BASE_URL=http://127.0.0.1:<port> pnpm test:e2e tests/e2e/footer-compact.spec.ts --project=w390
 * Optional FOOT_SHOTS_DIR=<dir> also saves 768 / 1024 / 1440 footer screenshots (before/after desktop evidence).
 * Runs once (the w390 project) and drives its own viewports: 320 360 375 390 412 430 in light and dark.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const PHONES = [320, 360, 375, 390, 412, 430];
const DESKTOPS = [768, 1024, 1440];
const THEMES = ["light", "dark"] as const;
const RECORD_OUT = process.env.FOOT_RECORD_OUT;
const SHOTS = process.env.FOOT_SHOTS_DIR;
const ANIM = ["animationName", "animationDuration", "animationTimingFunction", "animationIterationCount", "animationDelay", "animationDirection", "animationFillMode", "transformOrigin"] as const;

type Measure = {
  bodyH: number;
  bandH: number;
  ocean: Record<string, Record<string, string | number>>;
  email: { href: string | null; w: number; h: number };
  social: { href: string | null; label: string | null; w: number; h: number }[];
  overflow: number;
  contentRight: number;
  lastBottom: number;
  dockTop: number | null;
};
type Recording = Record<string, Measure>;

const baseline: Recording | null = RECORD_OUT ? null : (JSON.parse(readFileSync(join(__dirname, "footer-compact-main.json"), "utf8")) as Recording);

async function measure(page: Page, w: number, theme: "light" | "dark", reduced: boolean): Promise<Measure> {
  await page.emulateMedia({ reducedMotion: reduced ? "reduce" : "no-preference" });
  await page.setViewportSize({ width: w, height: 760 });
  await page.goto("/", { waitUntil: "load" });
  await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(900);
  return page.evaluate((anim) => {
    const q = (s: string) => document.querySelector<HTMLElement>(s)!;
    const r = (el: Element) => el.getBoundingClientRect();
    const band = q("footer.band");
    const ocean = q(".band-ocean");
    const rows: Record<string, Record<string, string | number>> = {};
    const targets: [string, Element][] = [
      ["ocean", ocean],
      ["back", q(".ocean-back")],
      ["mid", q(".ocean-mid")],
      ["front", q(".ocean-front")],
      ["shipWrap", q(".ocean-ship-wrap")],
      ["ship", q(".ocean-ship")],
    ];
    for (const [key, el] of targets) {
      const cs = getComputedStyle(el);
      const box = el as HTMLElement; // layout size and inset values: transforms (the drift, the rocking) are animated, so never measured
      const row: Record<string, string | number> = { w: box.offsetWidth, h: box.offsetHeight, playState: cs.animationPlayState, bottom: cs.bottom, left: cs.left, top: cs.top, right: cs.right, translate: cs.translate };
      for (const k of anim) row[k] = cs[k as keyof CSSStyleDeclaration] as string;
      rows[key] = row;
    }
    const email = q(".band-email");
    const social = [...document.querySelectorAll<HTMLElement>(".band-social a")].map((a) => ({ href: a.getAttribute("href"), label: a.getAttribute("aria-label"), w: r(a).width, h: r(a).height }));
    const content = [...band.querySelectorAll(".band-body *")];
    const dock = document.querySelector('nav[aria-label="Primary mobile"]');
    return {
      bodyH: r(q(".band-body")).height,
      bandH: r(band).height,
      ocean: rows,
      email: { href: email.getAttribute("href"), w: r(email).width, h: r(email).height },
      social,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      contentRight: Math.max(...content.map((el) => r(el).right)),
      lastBottom: r(q(".band-tagline")).bottom,
      dockTop: dock ? r(dock).top : null,
    };
  }, ANIM as unknown as string[]);
}

const recorded: Recording = {};
const key = (w: number, theme: string, reduced: boolean) => `${w}-${theme}${reduced ? "-reduced" : ""}`;

test.describe("phone footer compaction (TASK-236)", () => {
  test.describe.configure({ timeout: 120_000 });

  test("the contact block is smaller, the sea and ship identical, links and targets intact (320-430, light and dark)", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) !== 390, "drives its own viewports; runs once");
    const report: string[] = [];
    for (const theme of THEMES) {
      for (const w of PHONES) {
        const m = await measure(page, w, theme, false);
        recorded[key(w, theme, false)] = m;
        if (RECORD_OUT) continue;
        const b = baseline![key(w, theme, false)]!;
        report.push(`${w} ${theme}: contact block ${b.bodyH.toFixed(1)} -> ${m.bodyH.toFixed(1)} px (-${(b.bodyH - m.bodyH).toFixed(1)})`);
        // compact: measurably smaller than main
        expect(m.bodyH, `contact block at ${w} ${theme}`).toBeLessThanOrEqual(b.bodyH - 40);
        // the sea and the ship: size, position inside the strip, animation settings: all identical to main
        expect(m.ocean, `sea + ship at ${w} ${theme}`).toEqual(b.ocean);
        for (const part of ["back", "mid", "front", "shipWrap", "ship"]) expect(m.ocean[part]!.animationName, `${part} animates at ${w}`).not.toBe("none");
        // destinations unchanged
        expect(m.email.href).toBe(b.email.href);
        expect(m.social.map((s) => [s.href, s.label])).toEqual(b.social.map((s) => [s.href, s.label]));
        expect(m.social).toHaveLength(4);
        // controls >= 44 x 44
        expect(m.email.h, `email link height at ${w}`).toBeGreaterThanOrEqual(44);
        expect(m.email.w, `email link width at ${w}`).toBeGreaterThanOrEqual(44);
        for (const s of m.social) {
          expect(s.w, `${s.label} width at ${w}`).toBeGreaterThanOrEqual(44);
          expect(s.h, `${s.label} height at ${w}`).toBeGreaterThanOrEqual(44);
        }
        // no overflow, and the last content clears the dock
        expect(m.overflow, `page overflow at ${w}`).toBe(0);
        expect(m.contentRight, `content right edge at ${w}`).toBeLessThanOrEqual(w + 0.5);
        expect(m.dockTop, "dock is present on phones").not.toBeNull();
        expect(m.lastBottom, `tagline clears the dock at ${w}`).toBeLessThanOrEqual(m.dockTop! - 1);
      }
    }
    if (!RECORD_OUT) test.info().annotations.push({ type: "contact block before -> after", description: report.join("\n") });
    if (!RECORD_OUT) console.log(report.join("\n"));
  });

  test("reduced motion behaves as before (same still sea, same compaction)", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) !== 390, "drives its own viewports; runs once");
    for (const w of [320, 390, 430]) {
      const m = await measure(page, w, "light", true);
      recorded[key(w, "light", true)] = m;
      if (RECORD_OUT) continue;
      const b = baseline![key(w, "light", true)]!;
      expect(m.ocean, `reduced-motion sea + ship at ${w}`).toEqual(b.ocean);
      expect(m.bodyH).toBeLessThanOrEqual(b.bodyH - 40);
      expect(m.overflow).toBe(0);
    }
  });

  test("tablet and desktop footers are unchanged (768 / 1024 / 1440)", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) !== 390, "drives its own viewports; runs once");
    for (const w of DESKTOPS) {
      for (const theme of THEMES) {
        const m = await measure(page, w, theme, false);
        recorded[key(w, theme, false)] = m;
        if (SHOTS && theme === "light") {
          mkdirSync(SHOTS, { recursive: true });
          await page.locator("footer.band").screenshot({ path: join(SHOTS, `${process.env.FOOT_SHOTS_LABEL ?? "shot"}-${w}.png`) });
        }
        if (RECORD_OUT) continue;
        const b = baseline![key(w, theme, false)]!;
        expect(m.bodyH, `contact block at ${w} ${theme}`).toBe(b.bodyH);
        expect(m.bandH, `footer height at ${w} ${theme}`).toBe(b.bandH);
        expect(m.ocean, `sea + ship at ${w} ${theme}`).toEqual(b.ocean);
        expect(m.email).toEqual(b.email);
        expect(m.social).toEqual(b.social);
      }
    }
  });

  test.afterAll(() => {
    if (RECORD_OUT && Object.keys(recorded).length) writeFileSync(RECORD_OUT, JSON.stringify(recorded, null, 1) + "\n");
  });
});
