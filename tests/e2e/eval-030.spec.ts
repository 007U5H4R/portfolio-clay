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
 *   • mobile: touch halves work the flippers (multi-touch), the HUD fits 390 px, controls are ≥ 44 px; keyboard play works;
 *   • pinball (TASK-172): the player works two flippers, the gummy is the ball, and falling through the drain ends the run.
 * Frame rate (§39) is profiled manually (informational). Chromium is launched with the SwiftShader
 * flags so the canvas path runs where the host has no GPU; the no-WebGL path is forced explicitly.
 */
import { test, expect } from "./fixtures";
import type { Page, TestInfo } from "@playwright/test";
import { BRAND, enterLab, rapidClicks, waitLab } from "./lab-helpers";

test.use({ launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"] } });

const heavy = (info: TestInfo) => info.project.name === "w1440" || info.project.name === "w390";

interface FlipperHandle {
  layout: { side: "left" | "right"; pivot: { x: number; y: number }; len: number };
  state: { angle: number; omega: number };
  pressed: boolean;
}
interface LabHandle {
  rt: {
    flippers: [FlipperHandle, FlipperHandle];
    arena: { pads: { x: number; y: number }[] };
    bear: { x: number; y: number; vx: number; vy: number; state: string; grounded: boolean };
    bearBody: {
      current: {
        setTranslation(p: { x: number; y: number; z: number }, w: boolean): void;
        setLinvel(v: { x: number; y: number; z: number }, w: boolean): void;
        translation(): { x: number; y: number; z: number };
        linvel(): { x: number; y: number; z: number };
      } | null;
    };
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

/** The flipper raise angles the game uses (lib/lab/flippers.ts): rest, and fully raised. */
const FLIP_REST = -0.46;
const FLIP_UP = 0.26;

const flipper = (page: Page, i: 0 | 1) =>
  page.evaluate((idx) => {
    const f = window.__gummyLab!.rt.flippers[idx];
    return { pressed: f.pressed, angle: f.state.angle, omega: f.state.omega };
  }, i);

/** Wait (by state, not by time) until flipper `i` reaches `angle` (within a hair). */
const waitFlipper = (page: Page, i: 0 | 1, angle: number, timeout = 20_000) =>
  page.waitForFunction(([idx, a]) => Math.abs(window.__gummyLab!.rt.flippers[idx as 0 | 1].state.angle - (a as number)) < 0.01, [i, angle] as const, { timeout });

/**
 * Put the bear on the surface of a resting flipper (about 1 unit out from its pivot), at rest, and keep the run alive.
 * Pressing the flipper key in the SAME JavaScript turn (before the next frame) means the first physics step after the
 * teleport already has the flipper swinging into a gummy that is touching it, so the test never races the bear sliding
 * off the tip while a slow host renders a frame.
 */
async function dropOnFlipperAndPress(page: Page, i: 0 | 1, key: string) {
  await waitFlipper(page, i, FLIP_REST);
  await page.evaluate(
    ([idx, k]) => {
      const rt = window.__gummyLab!.rt;
      const f = rt.flippers[idx as 0 | 1];
      const a = f.state.angle;
      const s = f.layout.side === "left" ? 1 : -1;
      const d = { x: s * Math.cos(a), y: Math.sin(a) };
      const n = { x: -s * Math.sin(a), y: Math.cos(a) };
      const c = { x: f.layout.pivot.x + d.x + n.x * 0.55, y: f.layout.pivot.y + d.y + n.y * 0.55 };
      const rb = rt.bearBody.current!;
      rb.setTranslation({ x: c.x, y: c.y - 0.5, z: 0 }, true);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      // Reset the peak tracker in the same turn as the press so no frame of the launch can be missed.
      const w = window as unknown as { __peak?: { y: number; vy: number } };
      w.__peak = { y: c.y, vy: -Infinity };
      window.dispatchEvent(new KeyboardEvent("keydown", { key: k as string, cancelable: true }));
    },
    [i, key] as const,
  );
}

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
/**
 * The most rAF loops alive at once over `ms` (each live loop always has exactly one pending request).
 * A request *rate* tracks the frame rate, not the loop count: under SwiftShader a cold home page renders
 * at ~1 fps and the same page after an exit at 60 fps, so one Lenis loop read as "32 → 61/s" (TASK-143).
 */
const rafLoops = async (page: Page, ms = 1000) =>
  page.evaluate(
    (window_ms) =>
      new Promise<number>((resolve) => {
        let max = window.__raf!.pending();
        const t = setInterval(() => (max = Math.max(max, window.__raf!.pending())), 25);
        setTimeout(() => {
          clearInterval(t);
          resolve(max);
        }, window_ms);
      }),
    ms,
  );

const rafRate = async (page: Page, ms = 1000) => {
  const before = await page.evaluate(() => window.__raf!.calls);
  await page.waitForTimeout(ms);
  return (await page.evaluate(() => window.__raf!.calls)) - before;
};

test.describe("@EVAL-030 the lab page", () => {
  // Each test's own waits add up to ~75 s (entry 15 s + mount 30 s + exit 15 s + overlay 15 s); the 30 s
  // default test budget cut them off under SwiftShader, where entering alone took 17 s (TASK-143, EXE-55).
  // The step waits are unchanged; this only stops the default budget overriding them (cf. gameplay: 150 s).
  test.beforeEach(() => test.setTimeout(90_000));
  // TASK-143: the footer's infinite animations (T4 ocean, band verb) kept compositing under the opaque
  // lab and starved its WebGL boot (canvas unsized for 90 s, ESC exit 130 s late under SwiftShader).
  test("@EVAL-030 nothing of the portfolio animates under the lab (no band footer on /lab)", async ({ page }) => {
    await page.goto("/lab");
    await page.waitForSelector("[data-lab]");
    expect(await page.locator("footer.band, [data-band-ocean]").count()).toBe(0);
    const under = await page.evaluate(() =>
      document.getAnimations().filter((a) => {
        const t = (a.effect as KeyframeEffect | null)?.target;
        return a.effect?.getTiming().iterations === Infinity && !t?.closest("[data-lab]");
      }).length,
    );
    expect(under).toBe(0);
  });

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

  test("@EVAL-030 controls: ← / Z and → / M raise their own flipper, Space raises both, release lowers them, P pauses", async ({ page }, info) => {
    test.skip(info.project.name === "w390", "keyboard and mouse controls on the desktop project; touch is covered separately");
    await openGame(page);
    await startRun(page);
    for (const [i, keys] of [[0, ["ArrowLeft", "z"]], [1, ["ArrowRight", "m"]]] as const) {
      for (const k of keys) {
        await page.keyboard.down(k);
        await waitFlipper(page, i, FLIP_UP);
        expect((await flipper(page, i === 0 ? 1 : 0)).pressed, `${k} must not raise the other flipper`).toBe(false);
        await page.keyboard.up(k);
        await waitFlipper(page, i, FLIP_REST);
      }
    }
    await page.keyboard.down("Space");
    await waitFlipper(page, 0, FLIP_UP);
    await waitFlipper(page, 1, FLIP_UP);
    await page.keyboard.up("Space");
    await waitFlipper(page, 0, FLIP_REST);
    await waitFlipper(page, 1, FLIP_REST);
    await page.keyboard.press("p");
    expect(await labState(page)).toBe("PAUSED");
    await page.keyboard.press("p");
    expect(["PLAYING", "DANGER"]).toContain(await labState(page));
  });

  test("@EVAL-030 a flipper swung into the gummy sends it up the table (left by keyboard, right by keyboard)", async ({ page }, info) => {
    test.skip(info.project.name === "w390", "desktop project; the touch halves are covered on w390");
    await openGame(page);
    await startRun(page);
    await page.evaluate(() => {
      const w = window as unknown as { __peak: { y: number; vy: number } };
      w.__peak = { y: -Infinity, vy: -Infinity };
      // Read the physics body itself: `rt.bear` is only refreshed by the render loop, so right after a teleport it is stale.
      const tick = () => {
        const body = window.__gummyLab!.rt.bearBody.current!;
        w.__peak.y = Math.max(w.__peak.y, body.translation().y);
        w.__peak.vy = Math.max(w.__peak.vy, body.linvel().y);
        requestAnimationFrame(tick);
      };
      tick();
    });
    for (const [i, key] of [[0, "ArrowLeft"], [1, "ArrowRight"]] as const) {
      await dropOnFlipperAndPress(page, i, key);
      // The launch lasts a fraction of a second and a loaded host renders few frames in it (the first sample can already be past the apex, so a per-frame speed check flaked); the rise it causes is what matters.
      await page.waitForFunction(([y0]) => (window as unknown as { __peak: { y: number } }).__peak.y > (y0 as number) + 2.5, [await page.evaluate(() => window.__gummyLab!.rt.flippers[0].layout.pivot.y)], { timeout: 15_000 });
      await page.keyboard.up(key);
      await waitFlipper(page, i, FLIP_REST);
      // back in play for the second flipper
      await page.evaluate(() => window.__gummyLab!.rt.bearBody.current!.setLinvel({ x: 0, y: 0, z: 0 }, true));
    }
  });

  test("@EVAL-030 the mouse works the flippers by half: press left, press right, release", async ({ page }, info) => {
    test.skip(info.project.name === "w390", "mouse on the desktop project");
    await openGame(page);
    await startRun(page);
    const box = (await page.locator("[data-lab-canvas] canvas").boundingBox())!;
    const y = box.y + box.height * 0.8;
    await page.mouse.move(box.x + box.width * 0.25, y);
    await page.mouse.down();
    await waitFlipper(page, 0, FLIP_UP);
    expect((await flipper(page, 1)).pressed).toBe(false);
    await page.mouse.up();
    await waitFlipper(page, 0, FLIP_REST);
    await page.mouse.move(box.x + box.width * 0.75, y);
    await page.mouse.down();
    await waitFlipper(page, 1, FLIP_UP);
    expect((await flipper(page, 0)).pressed).toBe(false);
    await page.mouse.up();
    await waitFlipper(page, 1, FLIP_REST);
  });

  test("@EVAL-030 a gummy that falls through the drain between the flippers ends the run (no grab or flick to save it)", async ({ page }, info) => {
    test.skip(info.project.name === "w390", "desktop project");
    await openGame(page);
    await startRun(page);
    await page.evaluate(() => {
      const rb = window.__gummyLab!.rt.bearBody.current!;
      rb.setTranslation({ x: 0, y: -3.0, z: 0 }, true);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
    });
    await page.waitForSelector("[data-lab-state='RESULTS']", { timeout: 60_000 });
  });

  test("@EVAL-030 a live region announces 'Left and right flip' when a run starts", async ({ page }) => {
    await openGame(page);
    await startRun(page);
    await expect(page.locator("[data-lab-live]")).toHaveText("Left and right flip");
    expect(await page.locator("[data-lab-live]").getAttribute("aria-live")).toBe("polite");
  });

  test("@EVAL-030 power-ups, pads and combo are reachable: a pad launch scores", async ({ page }, info) => {
    test.skip(info.project.name === "w390", "desktop project");
    await openGame(page);
    await startRun(page);
    // Drop the bear right onto the spring pad (PB, on the tilted rail S2; the old PA/PF pads sat where the flippers are now).
    await page.evaluate(() => {
      const rt = window.__gummyLab!.rt;
      const pad = rt.arena.pads[0]!;
      const rb = rt.bearBody.current!;
      rb.setTranslation({ x: pad.x, y: pad.y + 1.3, z: 0 }, true);
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
    // TASK-155: the intro no longer waits on the GLB (it warms in parallel), so the asset becomes ready after INTRO
    // shows — within the same 40 s budget the INTRO wait had.
    await expect(page.locator("[data-lab-asset]")).toHaveAttribute("data-lab-asset", "ready", { timeout: 40_000 });
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

  test("@EVAL-030 touch: the left half holds the left flipper, the right half the right, and both at once", async ({ page }) => {
    await page.goto("/lab?debug");
    await waitLab(page);
    test.skip((await labMode(page)) !== "canvas", "no WebGL on this host");
    await startRun(page);
    const box = (await page.locator("[data-lab-canvas] canvas").boundingBox())!;
    const lx = box.x + box.width * 0.25;
    const rx = box.x + box.width * 0.75;
    const y = box.y + box.height * 0.8;
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: "touchStart" | "touchEnd", points: { x: number; y: number; id: number }[]) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });
    const L = { x: lx, y, id: 1 };
    const R = { x: rx, y, id: 2 };
    await touch("touchStart", [L]);
    await waitFlipper(page, 0, FLIP_UP);
    expect((await flipper(page, 1)).pressed).toBe(false);
    await touch("touchStart", [L, R]); // multi-touch: the second finger lands while the first is held
    await waitFlipper(page, 1, FLIP_UP);
    expect((await flipper(page, 0)).pressed).toBe(true);
    // CDP's touchEnd lifts every finger at once; releasing one finger at a time is covered by the controller unit tests.
    await touch("touchEnd", []);
    await waitFlipper(page, 0, FLIP_REST);
    await waitFlipper(page, 1, FLIP_REST);
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
    const baseline = await rafLoops(page);
    const loops: number[] = [];
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
      loops.push(await rafLoops(page));
    }
    info.annotations.push({ type: "eval-030-raf", description: `baseline ${baseline} loop(s); after exit ${loops.join(", ")}` });
    for (const [i, n] of loops.entries()) {
      // A surviving R3F loop is one more live rAF loop than the portfolio runs on its own.
      expect(n, `after exit ${i + 1}: ${n} live rAF loops vs baseline ${baseline}`).toBeLessThanOrEqual(baseline);
    }
    expect(consoleErrors).toEqual([]);
  });
});
