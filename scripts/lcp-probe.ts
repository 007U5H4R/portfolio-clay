/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-expressions -- ad-hoc browser probe: PerformanceObserver entries are untyped */
import { chromium } from "@playwright/test";
const base = process.env.PW_BASE_URL ?? "http://127.0.0.1:3335";
(async () => {
  for (const scheme of ["light", "dark"] as const) for (const mobile of [true, false]) {
    const b = await chromium.launch();
    const ctx = await b.newContext({ colorScheme: scheme, viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, deviceScaleFactor: mobile ? 2 : 1, hasTouch: mobile, isMobile: mobile });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await page.addInitScript(() => {
      (window as any).__l = [];
      new PerformanceObserver((l) => { for (const e of l.getEntries() as any[]) (window as any).__l.push({ t: Math.round(e.startTime), url: (e.url || "").split("/").pop(), el: e.element?.tagName + "." + (e.element?.className||"").toString().slice(0,30) + " lazy=" + e.element?.getAttribute?.("loading") + " vis=" + (e.element && getComputedStyle(e.element).display), load: Math.round(e.loadTime), render: Math.round(e.renderTime) }); }).observe({ type: "largest-contentful-paint", buffered: true });
    });
    await page.goto(base + "/", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    console.log(scheme, mobile ? "390" : "1440", JSON.stringify(await page.evaluate(() => (window as any).__l)));
    await b.close();
  }
})();
