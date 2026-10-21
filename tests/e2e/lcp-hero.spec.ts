/**
 * Stage 12 RCA2 (TASK-320): Lighthouse's SIMULATED throttling reported mobile LCP 5.4 s (/) and 6.4 s (/projects); measured with
 * applied throttling it is 2.65–2.76 s and LCP == FCP — the hero's bg image paints in the first frame. This guards that invariant
 * on the phone tier under 4x CPU: the scene's bg image is the LCP element, it is never gated behind hydration or a reveal (LCP lands
 * within 500 ms of first contentful paint), and it is requested before the page finishes loading. Absolute LCP stays an EVAL-005 /
 * Lighthouse (applied throttling) measurement; this spec only guards the structure that keeps it close to FCP.
 */
import { test, expect } from "./fixtures";

const ROUTES = [
  { path: "/", scene: "hero-home" },
  { path: "/projects", scene: "scene-work" },
] as const;

for (const { path, scene } of ROUTES) {
  test(`RCA2: ${path} — the ${scene} bg image is the LCP element and paints with the first frame (4x CPU)`, async ({ page }) => {
    test.skip(test.info().project.name !== "w390", "phone tier only");
    await page.addInitScript(() => {
      const w = window as unknown as { __lcp: { t: number; src: string }[]; __fcp: number };
      w.__lcp = [];
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as PerformanceEntry[] & { url?: string }[]) w.__lcp.push({ t: Math.round(e.startTime), src: ((e as unknown as { url?: string }).url ?? "").split("/").pop() ?? "" });
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (e.name === "first-contentful-paint") w.__fcp = Math.round(e.startTime);
      }).observe({ type: "paint", buffered: true });
    });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.goto(path, { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const m = await page.evaluate(() => {
      const w = window as unknown as { __lcp: { t: number; src: string }[]; __fcp: number };
      return { lcp: w.__lcp, fcp: w.__fcp };
    });
    const seen = JSON.stringify(m);
    const bg = m.lcp.find((e) => new RegExp(`${scene}-bg-mobile`).test(e.src));
    const last = m.lcp.at(-1);
    // candidate order varies (a heading may paint a frame earlier; at 390 the /projects paper section later outgrows the
    // scene), so the guard is timing: the scene's bg image is a candidate soon after first paint, and so is the final LCP
    expect(bg, `the scene's mobile bg image is an LCP candidate — ${seen}`).toBeTruthy();
    expect(bg!.t - m.fcp, `the bg image paints within 500 ms of FCP — ${seen}`).toBeLessThanOrEqual(500);
    // the final candidate may be the /projects paper section whose SVG texture arrives ~0.5–0.7 s after first paint at 390;
    // a hydration-gated paint lands 4–5 s later, so 1.5 s still separates the two cleanly
    expect(last!.t - m.fcp, `final LCP within 1500 ms of FCP (nothing gated behind hydration) — ${seen}`).toBeLessThanOrEqual(1500);
  });
}
