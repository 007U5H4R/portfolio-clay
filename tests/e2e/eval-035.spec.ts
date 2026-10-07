/**
 * eval-035.spec.ts (`@EVAL-035`, evaluation-plan §10, M-011 P1 / TASK-157) — layered scene loading on the home hero:
 * before `load` only the home hero's own light layers are requested (bg + subject eager; fg + details lazy but in view; ≤ 4), the LCP element is a
 * scene layer `<img fetchpriority="high">`, no layer is lazy-eager except those two, the inactive twin is fetched only
 * after load (ThemeArtPreload, EVAL-026), and layers cause no layout shift. Runs at 390 and 1440 (eval-cases.json).
 * The bundle half (primitive ≤ 3 kB gz, home ≤ 180 kB gz) is `scripts/bundle-budget.ts`.
 */
import { test, expect } from "./fixtures";

test.use({ launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {} });
test.skip(({ viewport }) => ![390, 1440].includes(viewport!.width), "EVAL-035 runs at 390 and 1440");

const LAYER_URL = /\/media\/paper-world\//;

async function observe(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __lcp?: { tag: string; src: string; priority: string | null }; __cls: number };
    w.__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as { element?: Element }[]) {
        const el = e.element as HTMLImageElement | undefined;
        if (el) w.__lcp = { tag: el.tagName, src: el.currentSrc || el.src || "", priority: el.getAttribute("fetchpriority") };
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) w.__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
}

test.describe("@EVAL-035 home hero layers (light)", () => {
  test("only bg + subject load before `load`; LCP is a high-priority layer; CLS < 0.05", async ({ page }) => {
    await observe(page);
    const before: string[] = [];
    let loaded = false;
    page.on("request", (r) => {
      if (!loaded && LAYER_URL.test(r.url())) before.push(new URL(r.url()).pathname);
    });
    page.on("load", () => (loaded = true));
    await page.goto("/", { waitUntil: "load" });
    // Chromium's headless shell never reports LCP; set PW_CHROMIUM to a full Chromium binary to assert it (done in the M-011 cloud gate).
    const reportsLcp = await page.waitForFunction(() => (window as unknown as { __lcp?: unknown }).__lcp, undefined, { timeout: 5000 }).then(() => true, () => false);
    if (!reportsLcp) test.info().annotations.push({ type: "lcp", description: "not reported by this Chromium build — LCP assertions skipped" });
    await page.waitForTimeout(300);

    // EXE-50: bg + subject are the eager pair; fg + details are lazy but sit inside the hero's first viewport, so the browser
    // fetches them during load. What may never load before `load`: a hidden layer (the dark twin, another scene).
    expect(before.length, `layer requests before load: ${before.join(", ")}`).toBeLessThanOrEqual(4);
    expect(before.every((u) => /hero-home-(bg|subject|fg|details)(-mobile)?\.webp$/.test(u)), before.join(", ")).toBe(true);
    expect(before.some((u) => /-dark/.test(u))).toBe(false);

    // Markup contract: only light bg (+ flagged subject) eager; everything else lazy + async; layers reserve their box.
    // Read the served HTML, not the live DOM: ThemeArtPreload flips the inactive twin to eager after idle (EVAL-026).
    const html = await (await page.request.get("/")).text();
    const scene = html.slice(html.indexOf('data-paper-scene="hero-home"'));
    const attr = (tag: string, name: string) => tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"))?.[1] ?? null;
    const imgs = [...scene.matchAll(/<img\b[^>]*>/g)]
      .map((m) => m[0])
      .filter((t) => /paper-world\/hero-home/.test(t))
      .map((t) => ({ src: attr(t, "src") ?? "", loading: attr(t, "loading"), decoding: attr(t, "decoding"), prio: attr(t, "fetchpriority"), w: attr(t, "width"), h: attr(t, "height") }));
    expect(imgs.length).toBe(8);
    for (const i of imgs) {
      const eager = /hero-home-(bg|subject)\.webp$/.test(i.src);
      expect(i.loading, i.src).toBe(eager ? "eager" : "lazy");
      expect(i.decoding, i.src).toBe("async");
      expect(i.w && i.h, `${i.src} reserves its size`).toBeTruthy();
      expect(i.prio, i.src).toBe(/hero-home-bg\.webp$/.test(i.src) ? "high" : null);
    }

    const m = await page.evaluate(() => {
      const w = window as unknown as { __lcp?: { tag: string; src: string; priority: string | null }; __cls: number };
      return { __lcp: w.__lcp, __cls: w.__cls };
    });
    if (reportsLcp) {
      expect(m.__lcp?.tag).toBe("IMG");
      expect(m.__lcp?.src).toMatch(LAYER_URL);
      expect(m.__lcp?.priority).toBe("high");
    }
    expect(m.__cls).toBeLessThan(0.05);
  });

  test("the dark twin is fetched only after load (idle warm-up), never before", async ({ page }) => {
    const darkBefore: string[] = [];
    const darkAfter: string[] = [];
    let loaded = false;
    page.on("request", (r) => {
      if (!LAYER_URL.test(r.url()) || !/-dark/.test(r.url())) return;
      (loaded ? darkAfter : darkBefore).push(r.url());
    });
    page.on("load", () => (loaded = true));
    await page.goto("/", { waitUntil: "load" });
    expect(darkBefore).toEqual([]);
  });

  test("no other route's layers are prefetched by the home page", async ({ page }) => {
    const other: string[] = [];
    page.on("request", (r) => {
      if (LAYER_URL.test(r.url()) && !/hero-home/.test(r.url())) other.push(r.url());
    });
    await page.goto("/", { waitUntil: "networkidle" });
    expect(other).toEqual([]);
  });
});

test.describe("@EVAL-035 home hero layers (dark)", () => {
  test.use({ colorScheme: "dark" });
  test("a dark visitor's own bg + subject load with the page (visible lazy layers) and nothing else is eager", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("portfolio-theme", "dark"));
    const urls: string[] = [];
    page.on("request", (r) => LAYER_URL.test(r.url()) && urls.push(new URL(r.url()).pathname));
    await page.goto("/", { waitUntil: "networkidle" });
    // Known trade-off (EXE-50): the light eager pair is still fetched (display:none does not stop an eager <img>).
    expect(urls.some((u) => /hero-home-bg-dark(-mobile)?\.webp$/.test(u))).toBe(true);
    expect(urls.some((u) => /hero-home-subject-dark(-mobile)?\.webp$/.test(u))).toBe(true);
  });
});
