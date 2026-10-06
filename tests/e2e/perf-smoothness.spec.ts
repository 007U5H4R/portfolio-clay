/**
 * EVAL-039 — runtime smoothness (TASK-155). At w1440 with a 4x CPU throttle (CDP), every static route is loaded cold
 * and scrolled top to bottom twice. Asserts, per route:
 *   - after warm-up (the second pass) 0 long animation frames > 200 ms and <= MAX_OVER_50 frames > 50 ms;
 *   - at rest (scroll top) 0 time-based CSS animations running while their target is outside the viewport
 *     (scroll-driven `view()` animations only advance when scrolled, so they are exempt);
 *   - <= 2 image preloads that apply to this viewport + scheme (a page preloads only its own LCP layers — TASK-149).
 * M-011's parallax lands on these routes: this is the guard that keeps the scroll smooth.
 */
import { expect, test } from "@playwright/test";
import routes from "./routes.json";

// Measured post-fix (headless Chromium, 4x CPU, load < 4): every route 0-1 frames > 50 ms after warm-up, worst 0-62 ms;
// threshold 3 leaves headroom for scheduler noise. /card is the one outlier: 19-22 frames > 50 ms before AND after
// (worst 134 ms) with blockingDuration 0 and ~2 ms render - paint/raster-bound (filter drop-shadows + blend on the 3D
// card under software raster), not main-thread script - so it keeps its own ceiling. Neither route may exceed 200 ms.
const MAX_OVER_50 = Number(process.env.PERF_MAX_OVER_50 ?? 3);
const MAX_OVER_50_BY_ROUTE: Record<string, number> = { "/card": 30 };

test.describe.configure({ timeout: 90_000 });

for (const route of routes.static) {
  test(`@EVAL-039 ${route} scrolls smoothly under a 4x CPU throttle`, async ({ page, context }, info) => {
    test.skip(info.project.name !== "w1440", "EVAL-039 measures w1440 only");
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      const w = window as unknown as { __loaf: number[] };
      w.__loaf = [];
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) w.__loaf.push(e.duration);
      }).observe({ type: "long-animation-frame", buffered: true });
    });
    await page.goto(route, { waitUntil: "load" });
    await page.waitForTimeout(2500);

    const rest = await page.evaluate(() => {
      const vh = innerHeight;
      const offscreen: string[] = [];
      for (const a of document.getAnimations()) {
        if (a.playState !== "running" || !(a.timeline instanceof DocumentTimeline)) continue;
        const target = (a.effect as KeyframeEffect | null)?.target as Element | null;
        if (!target) continue;
        const r = target.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh || r.width === 0) offscreen.push((a as CSSAnimation).animationName ?? "?");
      }
      const preloads = [...document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]')].filter((l) => !l.media || matchMedia(l.media).matches).length;
      return { offscreen, preloads };
    });
    expect(rest.offscreen, "running animations outside the viewport at rest").toEqual([]);
    // bg + the home hero's eager subject, hinted for this viewport + colour scheme only (PaperParallaxScene LcpPreloads).
    expect(rest.preloads, "image preloads that apply to this viewport").toBeLessThanOrEqual(2);

    const pass = async () => {
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h; y += 300) {
        await page.mouse.wheel(0, 300);
        await page.waitForTimeout(60);
      }
      await page.waitForTimeout(400);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
    };
    await pass(); // warm-up: images decode, lazy chunks load
    await page.evaluate(() => ((window as unknown as { __loaf: number[] }).__loaf.length = 0));
    await pass();
    const frames = await page.evaluate(() => (window as unknown as { __loaf: number[] }).__loaf);
    const over50 = frames.filter((d) => d > 50).length;
    const worst = Math.round(Math.max(0, ...frames));
    info.annotations.push({ type: "perf", description: `${route}: >50ms=${over50} worst=${worst}ms preloads=${rest.preloads}` });
    expect(frames.filter((d) => d > 200), `long animation frames > 200 ms (worst ${worst} ms)`).toEqual([]);
    expect(over50, `frames > 50 ms (worst ${worst} ms)`).toBeLessThanOrEqual(MAX_OVER_50_BY_ROUTE[route] ?? MAX_OVER_50);
  });
}
