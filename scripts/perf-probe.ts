/**
 * Scroll-jank probe (TASK-155). For each static route: w1440, 4x CPU throttle (CDP), cold load then two
 * scripted scroll passes; reports image preloads, long animation frames (> 50 / > 200 ms), the worst frame,
 * and CSS animations that are running while their target is outside the viewport (at rest, scroll top).
 *
 *   PW_BASE_URL=http://127.0.0.1:3335 pnpm exec dotenv -e .env.tooling -- tsx scripts/perf-probe.ts [out.json]
 */
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
import routes from "../tests/e2e/routes.json";

const base = process.env.PW_BASE_URL ?? "http://127.0.0.1:3335";

type Loaf = { d: number; forced: number; src: string };

async function probe(route: string) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.addInitScript(() => {
    const w = window as unknown as { __loaf: Loaf[]; __mark: number };
    w.__loaf = [];
    w.__mark = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as Array<{ duration: number; scripts: Array<{ sourceURL: string; sourceFunctionName: string; forcedStyleAndLayoutDuration: number }> }>) {
        const s = [...e.scripts].sort((a, b) => b.forcedStyleAndLayoutDuration - a.forcedStyleAndLayoutDuration)[0];
        w.__loaf.push({ d: e.duration, forced: s?.forcedStyleAndLayoutDuration ?? 0, src: s ? `${s.sourceURL.split("/").pop()}:${s.sourceFunctionName}` : "" });
      }
    }).observe({ type: "long-animation-frame", buffered: true });
  });
  await page.goto(base + route, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const rest = await page.evaluate(() => {
    // Hints whose `media` does not match this viewport / colour scheme are never fetched, so they do not count.
    const preloads = [...document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]')].filter((l) => !l.media || matchMedia(l.media).matches).length;
    const vh = innerHeight;
    const off: string[] = [];
    let running = 0;
    let scrollDriven = 0;
    for (const a of document.getAnimations()) {
      if (a.playState !== "running") continue;
      // Scroll-driven (view()/scroll() timeline) animations only advance when scrolled: no off-screen cost.
      if (!(a.timeline instanceof DocumentTimeline)) {
        scrollDriven++;
        continue;
      }
      const t = (a.effect as KeyframeEffect | null)?.target as Element | null;
      if (!t) continue;
      running++;
      const r = t.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh || r.width === 0) off.push((a as CSSAnimation).animationName ?? a.constructor.name);
    }
    return { preloads, running, off, scrollDriven };
  });
  const scroll = async () => {
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 300) {
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
  };
  const grab = async () => page.evaluate(() => {
    const w = window as unknown as { __loaf: Loaf[] };
    const l = w.__loaf.splice(0);
    return l;
  });
  const loadFrames = await grab();
  await scroll();
  const cold = await grab();
  await scroll();
  const warm = await grab();
  const sum = (l: Loaf[]) => ({
    over50: l.filter((x) => x.d > 50).length,
    over200: l.filter((x) => x.d > 200).length,
    worst: Math.round(Math.max(0, ...l.map((x) => x.d))),
    worstForced: l.slice().sort((a, b) => b.forced - a.forced)[0],
  });
  await browser.close();
  return { route, preloads: rest.preloads, running: rest.running, scrollDriven: rest.scrollDriven, offscreen: rest.off.length, offNames: [...new Set(rest.off)], load: sum(loadFrames), cold: sum(cold), warm: sum(warm) };
}

async function main() {
  const out = [];
  for (const r of routes.static) {
    const res = await probe(r);
    console.log(JSON.stringify(res));
    out.push(res);
  }
  if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(out, null, 2));
}
main();
