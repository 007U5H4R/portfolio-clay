/** Long-animation-frame attribution for one route: ROUTE=/card tsx scripts/loaf-probe.ts (4x CPU, w1440, 2 scroll passes). */
import { chromium } from "@playwright/test";
const base = process.env.PW_BASE_URL ?? "http://127.0.0.1:3335";
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.addInitScript(() => {
    (window as any).__l = [];
    new PerformanceObserver((l) => { for (const e of l.getEntries() as any[]) (window as any).__l.push({ d: Math.round(e.duration), blocking: Math.round(e.blockingDuration), render: Math.round(e.renderStart ? e.startTime + e.duration - e.renderStart : 0), style: Math.round(e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0), scripts: e.scripts.map((s: any) => `${s.invokerType}:${s.invoker}:${(s.sourceURL||"").split("/").pop()}:${s.sourceFunctionName}:${Math.round(s.duration)}:forced${Math.round(s.forcedStyleAndLayoutDuration)}`) }); }).observe({ type: "long-animation-frame", buffered: true });
  });
  await page.goto(base + (process.env.ROUTE ?? "/card"), { waitUntil: "load" });
  await page.waitForTimeout(2500);
  (await page.evaluate(() => (window as any).__l.splice(0))).length;
  for (let pass = 0; pass < 2; pass++) {
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 300) { await page.mouse.wheel(0, 300); await page.waitForTimeout(60); }
    await page.waitForTimeout(400); await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(400);
  }
  const l = await page.evaluate(() => (window as any).__l);
  console.log(JSON.stringify(l.slice(0, 8), null, 1), l.length);
  await b.close();
})();
