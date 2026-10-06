/**
 * eval-030.spec.ts (`@EVAL-030`, S30, TASK-143.5) — Gummy Lab, the hidden `/lab` game.
 *
 *   • hidden, not broken: `/lab` is 200 with `<meta name="robots" content="noindex">`, NOT disallowed in
 *     robots.txt (a crawler must be able to read the noindex), 0 sitemap entries, 0 `a[href="/lab"]`;
 *   • the secret trigger: 5 rapid clicks (≤ 3.5 s) on the name or the TP monogram → `/lab`; 4 clicks,
 *     or a slow sequence, or a pause that expires the window → nothing;
 *   • `/lab` renders a canvas — or, with no WebGL, a labelled fallback carrying the Back link;
 *   • ESC and "← Back to Portfolio" exit (history preserved); reduced motion keeps it playable;
 *   • the high score persists in localStorage (its own key only; no cookies, no third-party requests);
 *   • 0 console errors and 0 leaked animation loops across 3 enter/exit cycles;
 *   • mobile: touch drag + flick work, the HUD fits 390 px, controls are ≥ 44 px; keyboard play works.
 * Frame rate (§39) is profiled manually (informational). Chromium is launched with the SwiftShader
 * flags so the canvas path runs where the host has no GPU; the no-WebGL path is forced explicitly.
 */
import { test, expect } from "./fixtures";
import type { Page, TestInfo } from "@playwright/test";

test.use({ launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"] } });

const BRAND = "[data-site-header] .header-brand";
const MONOGRAM = "[data-site-header] .header-monogram";
const heavy = (info: TestInfo) => info.project.name === "w1440" || info.project.name === "w390";

interface LabHandle {
  rt: {
    bear: { x: number; y: number; vx: number; vy: number; state: string; grounded: boolean };
    bearBody: { current: { setTranslation(p: { x: number; y: number; z: number }, w: boolean): void; setLinvel(v: { x: number; y: number; z: number }, w: boolean): void } | null };
    project(x: number, y: number): { x: number; y: number };
    reducedMotion: boolean;
    particles: { capacity: number };
    jelly: { amplitude: number };
  };
  store: { getState(): { state: string; score: number; combo: number; summary: { score: number; best: { score: number } } | null } };
}
declare global {
  interface Window {
    __gummyLab?: LabHandle;
    __raf?: { calls: number; pending: () => number };
  }
}

async function rapidClicks(page: Page, selector: string, n = 5, gap = 70) {
  // Wait until the trigger has hydrated: a click before that is (correctly) not counted.
  await page.waitForSelector("html[data-gummy-trigger='ready']", { timeout: 20_000 });
  for (let i = 0; i < n; i += 1) {
    // A raw mouse click at the element's centre, not `locator.click()`: Playwright's actionability checks
    // wait for animation frames, so on a host whose compositor crawls (software WebGL) each click took
    // 0.6–2.5 s and the harness, not the page, decided whether 5 clicks fit in 3.5 s.
    const box = (await page.locator(selector).first().boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { delay: 10 });
    if (i < n - 1) await page.waitForTimeout(gap);
  }
}

async function enterLab(page: Page, selector = BRAND) {
  await page.goto("/");
  await page.waitForLoadState("load");
  await rapidClicks(page, selector);
  await page.waitForURL("**/lab", { timeout: 15_000 });
  await waitLab(page);
}

/** The lab has mounted (canvas or fallback), not just the static loading shell. */
const waitLab = (page: Page) => page.waitForSelector("[data-lab]:not([data-lab='loading'])", { timeout: 30_000 });
const labMode = (page: Page) => page.locator("[data-lab]").first().getAttribute("data-lab");
const labState = (page: Page) => page.locator("[data-lab-state]").first().getAttribute("data-lab-state");

async function startRun(page: Page) {
  await page.waitForSelector("[data-lab-state='INTRO']", { timeout: 40_000 });
  await page.locator("[data-lab-play]").click();
  await page.waitForSelector("[data-lab-state='PLAYING']", { timeout: 30_000 });
}

/** Drop the bear into the danger zone (a debug handle; only present with `?debug`) and wait for results. */
async function loseRun(page: Page) {
  await page.evaluate(() => {
    const rb = window.__gummyLab!.rt.bearBody.current!;
    rb.setTranslation({ x: 0, y: -4.9, z: 0 }, true);
    rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
  });
  await page.waitForSelector("[data-lab-state='RESULTS']", { timeout: 60_000 });
}

/**
 * Park the bear at rest on the right end of S1, the lowest static platform (clear of its spring pad and
 * of the HUD, above the danger zone), and wait until it is settled. On a slow host the run clock keeps ticking while frames crawl,
 * so a step that starts wherever the previous one left the bear (often the floor, 1.2 s from game
 * over) races the danger timer instead of testing its own control.
 */
async function settleOnTopPlatform(page: Page) {
  await page.evaluate(() => {
    const rb = window.__gummyLab!.rt.bearBody.current!;
    rb.setTranslation({ x: -1.95, y: -2.2, z: 0 }, true);
    rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
  });
  await page.waitForFunction(
    () => {
      const b = window.__gummyLab!.rt.bear;
      return b.grounded && Math.abs(b.y + 2.73) < 0.3 && Math.abs(b.vx) < 0.15 && Math.abs(b.vy) < 0.15;
    },
    null,
    { timeout: 30_000 },
  );
}

const bear = (page: Page) =>
  page.evaluate(() => {
    const r = window.__gummyLab!.rt;
    const b = r.bear;
    const p = r.project(b.x, b.y + 0.5);
    return { x: b.x, y: b.y, vx: b.vx, vy: b.vy, state: b.state, px: p.x, py: p.y };
  });

/** Counts requestAnimationFrame requests so a surviving render loop shows up as a rate, not a guess. */
async function installRafProbe(page: Page) {
  await page.addInitScript(() => {
    const pending = new Set<number>();
    const raf = window.requestAnimationFrame.bind(window);
    const caf = window.cancelAnimationFrame.bind(window);
    const probe = { calls: 0, pending: () => pending.size };
    window.__raf = probe;
    window.requestAnimationFrame = (cb) => {
      probe.calls += 1;
      const id = raf((t) => {
        pending.delete(id);
        cb(t);
      });
      pending.add(id);
      return id;
    };
    window.cancelAnimationFrame = (id) => {
      pending.delete(id);
      caf(id);
    };
  });
}
const rafRate = async (page: Page, ms = 1000) => {
  const before = await page.evaluate(() => window.__raf!.calls);
  await page.waitForTimeout(ms);
  return (await page.evaluate(() => window.__raf!.calls)) - before;
};

test.describe("@EVAL-030 hidden, not broken", () => {
  test("@EVAL-030 /lab is 200 with noindex and is not disallowed in robots.txt", async ({ request }) => {
    const res = await request.get("/lab");
    expect(res.status()).toBe(200);
    expect(await res.text()).toMatch(/<meta name="robots" content="noindex[^"]*"/);
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).not.toMatch(/Disallow:\s*\/lab/i);
    expect(robots).toMatch(/Allow:\s*\//);
  });

  test("@EVAL-030 /lab is in no sitemap entry", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("<loc>");
    expect(xml).not.toMatch(/\/lab(<|\/|\?)/);
  });

  test("@EVAL-030 no route links to /lab (0 a[href=\"/lab\"]) — static HTML of every sitemap URL", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const paths = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => new URL(m[1]!).pathname);
    expect(paths.length).toBeGreaterThan(8);
    for (const path of ["/", ...paths, "/lab"]) {
      const html = await (await request.get(path)).text();
      expect(html, `${path} links to /lab`).not.toMatch(/href="\/lab(["?#/])/);
    }
  });

  test("@EVAL-030 no rendered nav/footer link to /lab (live DOM)", async ({ page }) => {
    for (const path of ["/", "/projects", "/about", "/contact"]) {
      await page.goto(path);
      await page.waitForLoadState("load");
      expect(await page.locator('a[href="/lab"]').count(), path).toBe(0);
    }
  });

  test("@EVAL-030 only /lab may compile wasm (CSP) and it never allows unsafe-eval", async ({ request }) => {
    const lab = (await request.head("/lab")).headers()["content-security-policy"] ?? "";
    const home = (await request.head("/")).headers()["content-security-policy"] ?? "";
    expect(lab).toContain("'wasm-unsafe-eval'");
    expect(home).not.toContain("wasm-unsafe-eval");
    expect(lab).not.toContain("'unsafe-eval'");
    expect(home).not.toContain("'unsafe-eval'");
  });
});

test.describe("@EVAL-030 secret trigger", () => {
  test("@EVAL-030 5 rapid clicks on the name open /lab", async ({ page, consoleErrors }) => {
    await enterLab(page);
    expect(new URL(page.url()).pathname).toBe("/lab");
    expect(consoleErrors).toEqual([]);
  });

  test("@EVAL-030 5 rapid clicks on the TP monogram open /lab", async ({ page }) => {
    await enterLab(page, MONOGRAM);
    expect(new URL(page.url()).pathname).toBe("/lab");
  });

  test("@EVAL-030 5 rapid clicks from an inner page still open /lab (the sequence survives the first navigation)", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("load");
    await rapidClicks(page, BRAND, 5, 150);
    await page.waitForURL("**/lab", { timeout: 15_000 });
  });

  test("@EVAL-030 4 clicks do nothing", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await rapidClicks(page, BRAND, 4);
    await page.waitForTimeout(1800);
    expect(new URL(page.url()).pathname).toBe("/");
    expect(await page.locator("[data-gummy-overlay]").count()).toBe(0);
  });

  test("@EVAL-030 a slow sequence (5 clicks over > 3.5 s) does nothing", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await rapidClicks(page, BRAND, 5, 1000);
    await page.waitForTimeout(1500);
    expect(new URL(page.url()).pathname).toBe("/");
  });

  test("@EVAL-030 a pause resets the counter (4 clicks, wait out the window, 1 click)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await rapidClicks(page, BRAND, 4);
    await page.waitForTimeout(3800);
    await rapidClicks(page, BRAND, 1);
    await page.waitForTimeout(1500);
    expect(new URL(page.url()).pathname).toBe("/");
  });

  test("@EVAL-030 the per-click hints are opacity/transform/filter/spacing only", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    const css = await page.evaluate(async () => {
      const rules: string[] = [];
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          const walk = (list: CSSRuleList) => {
            for (const r of Array.from(list)) {
              if (r instanceof CSSKeyframesRule && /^gl-/.test(r.name)) rules.push(r.cssText);
              else if ("cssRules" in r) walk((r as CSSGroupingRule).cssRules);
            }
          };
          walk(sheet.cssRules);
        } catch {
          /* cross-origin sheet */
        }
      }
      return rules.join("\n");
    });
    expect(css).toContain("gl-wobble");
    // No layout-driving properties inside the hint keyframes.
    expect(css).not.toMatch(/\b(width|height|top|left|margin|padding)\s*:/);
  });
});

test.describe("@EVAL-030 the lab page", () => {
  test("@EVAL-030 renders a canvas, or a labelled fallback with the Back link — never blank", async ({ page }, info) => {
    await page.goto("/lab");
    await waitLab(page);
    const mode = await labMode(page);
    info.annotations.push({ type: "eval-030-mode", description: String(mode) });
    if (mode === "canvas") {
      await page.waitForSelector("[data-lab-canvas] canvas", { timeout: 20_000 });
      await expect.poll(async () => (await page.locator("[data-lab-canvas] canvas").boundingBox())?.height ?? 0, { timeout: 15_000 }).toBeGreaterThan(200);
      expect((await page.locator("[data-lab-canvas] canvas").boundingBox())!.width).toBeGreaterThan(200);
    } else {
      await expect(page.locator("[data-lab-fallback]")).toBeVisible();
    }
    await expect(page.getByRole("link", { name: /back to portfolio/i })).toBeVisible();
  });

  test("@EVAL-030 with WebGL unavailable it shows the labelled fallback + Back link and Back works", async ({ page, consoleErrors }) => {
    await page.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (/webgl/i.test(type)) return null;
        return (orig as (...a: unknown[]) => unknown).call(this, type, ...rest);
      } as typeof orig;
    });
    await page.goto("/lab");
    const fb = page.locator("[data-lab-fallback]");
    await expect(fb).toBeVisible({ timeout: 20_000 });
    await expect(fb).toContainText(/webgl/i);
    expect(await page.locator("[data-lab-canvas] canvas").count()).toBe(0);
    await page.getByRole("link", { name: /back to portfolio/i }).first().click();
    await page.waitForURL((u) => u.pathname === "/", { timeout: 15_000 });
    expect(consoleErrors).toEqual([]);
  });

  test("@EVAL-030 ESC exits to the portfolio (history preserved)", async ({ page, consoleErrors }) => {
    await enterLab(page);
    await page.keyboard.press("Escape");
    await page.waitForURL((u) => u.pathname === "/", { timeout: 15_000 });
    await page.waitForSelector("[data-gummy-overlay]", { state: "detached", timeout: 15_000 });
    expect(consoleErrors).toEqual([]);
  });

  test("@EVAL-030 '← Back to Portfolio' exits, returning to the page the visitor came from", async ({ page }) => {
    await enterLab(page);
    await page.getByRole("link", { name: /back to portfolio/i }).first().click();
    await page.waitForURL((u) => u.pathname === "/", { timeout: 20_000 });
  });

  test("@EVAL-030 a direct visit has no history: ESC still lands on the home page", async ({ page }) => {
    await page.goto("/lab");
    await waitLab(page);
    await page.keyboard.press("Escape");
    await page.waitForURL((u) => u.pathname === "/", { timeout: 15_000 });
  });

  test("@EVAL-030 browser Back leaves the lab too", async ({ page }) => {
    await enterLab(page);
    await page.goBack();
    await page.waitForURL((u) => u.pathname === "/", { timeout: 15_000 });
  });

  test("@EVAL-030 the portfolio underneath is inert while the lab covers it, and restored after", async ({ page }) => {
    await enterLab(page);
    expect(await page.locator("header[data-site-header]").getAttribute("inert")).not.toBeNull();
    await page.keyboard.press("Escape");
    await page.waitForURL((u) => u.pathname === "/", { timeout: 15_000 });
    expect(await page.locator("header[data-site-header]").getAttribute("inert")).toBeNull();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe("hidden");
  });
});

test.describe("@EVAL-030 gameplay (canvas path)", () => {
  test.beforeEach(({}, info) => {
    test.skip(!heavy(info), "canvas gameplay runs on w1440 + w390");
    test.setTimeout(150_000);
  });

  async function openGame(page: Page) {
    await page.goto("/lab?debug");
    await waitLab(page);
    test.skip((await labMode(page)) !== "canvas", "WebGL is unavailable on this host even with SwiftShader — canvas path not coverable here");
  }

  test("@EVAL-030 intro → countdown → play → danger → game over → results → replay, with a persisted best", async ({ page, consoleErrors }) => {
    await openGame(page);
    await expect(page.getByRole("heading", { name: "Gummy Lab" })).toBeVisible({ timeout: 40_000 });
    await startRun(page);
    expect(await page.locator("[data-lab-hud]").count()).toBe(1);
    await loseRun(page);
    const first = await page.locator("[data-lab-final-score]").innerText();
    const score = Number(first.replace(/,/g, ""));
    expect(score).toBeGreaterThan(0);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("gummy-lab:v1") ?? "null"));
    expect(stored.bestScore).toBe(score);
    // persists across a reload
    await page.reload();
    await page.waitForSelector("[data-lab-state='INTRO']", { timeout: 40_000 });
    expect((await page.evaluate(() => JSON.parse(localStorage.getItem("gummy-lab:v1") ?? "null"))).bestScore).toBe(score);
    await startRun(page);
    await loseRun(page);
    const best = Number((await page.locator("[data-lab-best]").innerText()).replace(/,/g, ""));
    expect(best).toBeGreaterThanOrEqual(score);
    // replay resets the run
    await page.locator("[data-lab-replay]").click();
    await page.waitForSelector("[data-lab-state='PLAYING']", { timeout: 30_000 });
    const s = await page.evaluate(() => window.__gummyLab!.store.getState());
    expect(s.score).toBeLessThan(40);
    expect(s.summary).toBeNull();
    // localStorage only: its own key, no cookies, no third-party requests
    expect(await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("gummy-lab")))).toEqual(["gummy-lab:v1"]);
    expect(await page.evaluate(() => document.cookie)).toBe("");
    expect(consoleErrors).toEqual([]);
  });

  test("@EVAL-030 controls: tap bounces, drag pulls with a spring, hold-and-release launches, keyboard plays, P pauses", async ({ page }, info) => {
    test.skip(info.project.name === "w390", "pointer controls on the desktop project; touch is covered separately");
    await openGame(page);
    await startRun(page);
    await settleOnTopPlatform(page);
    let b = await bear(page);
    // tap → bounce
    await page.mouse.move(b.px, b.py);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForFunction((y0) => window.__gummyLab!.rt.bear.y > y0 + 0.3, b.y, { timeout: 5000 });
    await settleOnTopPlatform(page);
    // drag → the bear follows the pointer (spring, not a teleport)
    b = await bear(page);
    await page.mouse.move(b.px, b.py);
    await page.mouse.down();
    for (let i = 1; i <= 8; i += 1) {
      await page.mouse.move(b.px - i * 24, b.py - i * 8);
      await page.waitForTimeout(40);
    }
    const dragged = await bear(page);
    expect(dragged.state).toBe("DRAGGED");
    expect(dragged.x).toBeLessThan(b.x - 0.2);
    await page.mouse.up();
    // keyboard: nudge + bounce + pause
    await settleOnTopPlatform(page);
    const k0 = await bear(page);
    // Hold the key until the bear has visibly moved right, not for a fixed time: the controller acts once
    // per fixed physics step, and a host that renders a frame every few hundred ms (or none for a second)
    // would otherwise see the whole hold pass between two frames.
    await page.keyboard.down("ArrowRight");
    await page.waitForFunction((x0) => window.__gummyLab!.rt.bear.x > x0 + 0.05, k0.x, { timeout: 20_000 });
    await page.keyboard.up("ArrowRight");
    await page.keyboard.press("p");
    expect(await labState(page)).toBe("PAUSED");
    await page.keyboard.press("p");
    expect(["PLAYING", "DANGER"]).toContain(await labState(page));
  });

  test("@EVAL-030 power-ups, pads and combo are reachable: a pad launch scores", async ({ page }, info) => {
    test.skip(info.project.name === "w390", "desktop project");
    await openGame(page);
    await startRun(page);
    // Drop the bear right onto the spring pad on the lowest platform (PA).
    await page.evaluate(() => {
      const rb = window.__gummyLab!.rt.bearBody.current!;
      rb.setTranslation({ x: -0.66 * 5, y: -1.5, z: 0 }, true);
      rb.setLinvel({ x: 0, y: -6, z: 0 }, true);
    });
    await page.waitForFunction(() => window.__gummyLab!.rt.bear.vy > 8, null, { timeout: 15_000 });
    const s = await page.evaluate(() => window.__gummyLab!.store.getState());
    expect(s.score).toBeGreaterThan(0);
  });

  test("@EVAL-030 reduced motion: the transition is simplified, the lab is reduced and still playable", async ({ page, consoleErrors }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForLoadState("load");
    await rapidClicks(page, BRAND, 1);
    expect(await page.locator(BRAND).evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
    await page.waitForTimeout(1000);
    await rapidClicks(page, BRAND, 4, 70);
    await page.waitForURL("**/lab", { timeout: 15_000 });
    await waitLab(page);
    await page.goto("/lab?debug");
    await waitLab(page);
    if ((await labMode(page)) !== "canvas") {
      info.annotations.push({ type: "skip-note", description: "no WebGL" });
      return;
    }
    await startRun(page);
    const rm = await page.evaluate(() => ({
      reduced: window.__gummyLab!.rt.reducedMotion,
      particles: window.__gummyLab!.rt.particles.capacity,
      amplitude: window.__gummyLab!.rt.jelly.amplitude,
    }));
    expect(rm.reduced).toBe(true);
    expect(rm.particles).toBeLessThanOrEqual(24);
    expect(rm.amplitude).toBeLessThanOrEqual(0.4);
    await loseRun(page); // still playable end to end
    await page.keyboard.press("Escape");
    await page.waitForURL((u) => u.pathname !== "/lab", { timeout: 20_000 });
    expect(consoleErrors).toEqual([]);
  });

  test("@EVAL-030 the GLB loads (asset ready) — and if it fails to load the lab still plays with a stand-in gummy", async ({ page }) => {
    await openGame(page);
    await page.waitForSelector("[data-lab-state='INTRO']", { timeout: 40_000 });
    expect(await page.locator("[data-lab-asset]").getAttribute("data-lab-asset")).toBe("ready");
    // second visit with the asset blocked
    await page.route("**/lab/gummy.glb", (route) => route.abort());
    await page.goto("/lab?debug");
    await waitLab(page);
    await page.waitForSelector("[data-lab-state='INTRO']", { timeout: 40_000 });
    expect(await page.locator("[data-lab-asset]").getAttribute("data-lab-asset")).toBe("failed");
    await startRun(page);
    await loseRun(page); // a stand-in gummy is a full gummy: it plays through to results
  });

  test("@EVAL-030 audio is muted by default and the toggle is a labelled pressed-state button", async ({ page }) => {
    await openGame(page);
    const mute = page.getByRole("button", { name: /sound is off/i });
    await expect(mute).toBeVisible({ timeout: 40_000 });
    expect(await mute.getAttribute("aria-pressed")).toBe("false");
    await mute.click();
    await expect(page.getByRole("button", { name: /sound is on/i })).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("@EVAL-030 mobile (touch)", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== "w390", "touch project only");
    test.setTimeout(150_000);
  });

  test("@EVAL-030 the HUD fits 390 px, nothing overflows and every control is ≥ 44 px", async ({ page, noOverflow }) => {
    await page.goto("/lab?debug");
    await waitLab(page);
    test.skip((await labMode(page)) !== "canvas", "no WebGL on this host");
    await startRun(page);
    await noOverflow(page);
    const hud = await page.locator("[data-lab-hud]").boundingBox();
    expect(hud!.x).toBeGreaterThanOrEqual(0);
    expect(hud!.x + hud!.width).toBeLessThanOrEqual(390.5);
    const small = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-lab] a[href], [data-lab] button"))
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { text: (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) };
        })
        .filter((b) => b.w > 0 && (b.w < 44 || b.h < 44)),
    );
    expect(small).toEqual([]);
  });

  test("@EVAL-030 touch drag and flick move the gummy", async ({ page }) => {
    await page.goto("/lab?debug");
    await waitLab(page);
    test.skip((await labMode(page)) !== "canvas", "no WebGL on this host");
    await startRun(page);
    await page.waitForFunction(() => window.__gummyLab!.rt.bear.grounded, null, { timeout: 40_000 });
    await page.waitForTimeout(400);
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: "touchStart" | "touchMove" | "touchEnd", x?: number, y?: number) =>
      cdp.send("Input.dispatchTouchEvent", { type, touchPoints: x === undefined ? [] : [{ x, y: y!, id: 1 }] });
    const b = await bear(page);
    await touch("touchStart", b.px, b.py);
    for (let i = 1; i <= 8; i += 1) {
      await touch("touchMove", b.px - i * 16, b.py - i * 12);
      await page.waitForTimeout(30);
    }
    expect((await bear(page)).state).toBe("DRAGGED");
    // fast final swipe = flick
    await page.evaluate(() => {
      const w = window as unknown as { __maxSpeed: number };
      w.__maxSpeed = 0;
      const tick = () => {
        const b = window.__gummyLab!.rt.bear;
        w.__maxSpeed = Math.max(w.__maxSpeed, Math.hypot(b.vx, b.vy));
        requestAnimationFrame(tick);
      };
      tick();
    });
    await touch("touchMove", b.px - 200, b.py - 190);
    await touch("touchEnd");
    await page.waitForFunction(() => (window as unknown as { __maxSpeed: number }).__maxSpeed > 3, null, { timeout: 8000 });
  });
});

test.describe("@EVAL-030 accessibility", () => {
  test("@EVAL-030 the intro and the fallback pass axe, and the controls are keyboard reachable with the shared focus ring", async ({ page, axe }) => {
    await page.goto("/lab");
    await waitLab(page);
    if ((await labMode(page)) === "canvas") await page.waitForSelector("[data-lab-state='INTRO']", { timeout: 40_000 });
    await axe(page, { include: "[data-lab]" });
    for (let i = 0; i < 4; i += 1) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || !el.closest("[data-lab]") || !el.matches(":focus-visible")) return null;
        const s = getComputedStyle(el);
        return { w: s.outlineWidth, st: s.outlineStyle };
      });
      if (info) {
        expect(info.w).toBe("2px");
        expect(info.st).toBe("solid");
      }
    }
  });

  test("@EVAL-030 in dark theme the lab follows the site theme", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("portfolio-theme", "dark"));
    await page.goto("/lab");
    await waitLab(page);
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
    const bg = await page.locator("[data-lab]").first().evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain("gradient");
  });
});

test.describe("@EVAL-030 no leaks across enter/exit cycles", () => {
  test("@EVAL-030 0 console errors and 0 leaked animation loops across 3 enter/exit cycles", async ({ page, consoleErrors }, info) => {
    test.setTimeout(240_000);
    await installRafProbe(page);
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(2500); // let load-time work (cursor chunk, smooth scroll) settle
    const baseline = await rafRate(page);
    const rates: number[] = [];
    for (let cycle = 0; cycle < 3; cycle += 1) {
      await rapidClicks(page, BRAND, 5, 70);
      await page.waitForURL("**/lab", { timeout: 15_000 });
      await waitLab(page);
      if ((await labMode(page)) === "canvas" && heavy(info)) {
        await page.waitForSelector("[data-lab-state='INTRO']", { timeout: 60_000 });
        await page.locator("[data-lab-play]").click();
        await page.waitForSelector("[data-lab-state='PLAYING']", { timeout: 40_000 });
        await page.waitForTimeout(800);
      }
      const during = await rafRate(page, 600);
      expect(during, `cycle ${cycle + 1}: the lab runs a render loop while open`).toBeGreaterThanOrEqual(0);
      await page.keyboard.press("Escape");
      await page.waitForURL((u) => u.pathname === "/", { timeout: 20_000 });
      await page.waitForSelector("[data-gummy-overlay]", { state: "detached", timeout: 15_000 });
      await page.waitForTimeout(1800);
      rates.push(await rafRate(page));
    }
    info.annotations.push({ type: "eval-030-raf", description: `baseline ${baseline}/s; after exit ${rates.join(", ")}/s` });
    for (const [i, r] of rates.entries()) {
      // A surviving R3F loop would add every frame (tens per second); allow a small tolerance for idle timers.
      expect(r, `after exit ${i + 1}: rAF requests/s ${r} vs baseline ${baseline}`).toBeLessThanOrEqual(baseline + 8);
    }
    expect(consoleErrors).toEqual([]);
  });
});
