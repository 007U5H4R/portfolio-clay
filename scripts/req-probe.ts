import { chromium } from "@playwright/test";
const base = process.env.PW_BASE_URL ?? "http://127.0.0.1:3335";
(async () => {
  const scheme = (process.env.SCHEME ?? "light") as "light" | "dark";
  const b = await chromium.launch();
  const ctx = await b.newContext({ colorScheme: scheme, viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  const t0 = Date.now();
  const rows: string[] = [];
  page.on("requestfinished", async (r) => { const s = await r.sizes().catch(() => null); rows.push(`${Date.now() - t0}ms ${Math.round((s?.responseBodySize ?? 0) / 1024)}KB ${r.resourceType()} ${r.url().slice(-80)}`); });
  await page.goto(base + (process.env.ROUTE ?? "/"), { waitUntil: "load" });
  await page.waitForTimeout(2000);
  console.log(scheme, rows.join("\n"));
  await b.close();
})();
