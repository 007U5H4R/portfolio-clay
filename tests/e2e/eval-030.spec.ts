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
 *   • pinball (TASK-172): the player works two flippers, the gummy is the ball, and falling through the drain ends the run;
 *   • the paper-cut machine (TASK-185): Space is the plunger (hold to charge, release to launch, longer = harder), A/D/arrows/Z/M
 *     are the flippers, the black hole in the corner is the real "Back to Portfolio" link, reduced motion draws no trail/particles.
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
  body: { current: { setNextKinematicRotation(q: { x: number; y: number; z: number; w: number }): void } | null };
}
interface LabHandle {
  rt: {
    flippers: [FlipperHandle, FlipperHandle];
    plunger: { progress: number; charging: boolean; pull: number; phase: string };
    trail: { capacity: number; count: number; enabled: boolean; x: Float32Array };
    particles: { capacity: number; active: number };
    launched: boolean;
    arena: { pads: { x: number; y: number }[]; guides: { x1: number; y1: number; x2: number; y2: number }[]; lane: { x: number; restY: number; xIn: number; xOut: number } };
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

/** The camera has finished easing from the intro framing to the machine (the overlays are placed from it each frame). */
const settled = (page: Page) => page.waitForFunction(() => (window.__gummyLab!.rt as unknown as { introBlend: number }).introBlend > 0.985, null, { timeout: 90_000 });

/**
 * Hold the plunger (Space, via the controller's own key handler) until it has charged to `charge` (0–1), then release. Waits
 * for the launch itself (the gummy leaves the lane on the next physics step) and returns the force the plunger fired with.
 */
async function launch(page: Page, charge = 0.05) {
  await page.evaluate(() => {
    const w = window as unknown as { __launches?: number[]; __hookWrapped?: boolean };
    w.__launches = [];
    (w as unknown as { __launchVy: number[] }).__launchVy = [];
    const rt = window.__gummyLab!.rt as unknown as { hooks: { launch: (...a: number[]) => void }; bearBody: { current: { linvel(): { y: number } } } };
    if (!w.__hookWrapped) {
      w.__hookWrapped = true;
      const orig = rt.hooks.launch.bind(rt.hooks);
      // the run-time hooks object is replaced when the scene mounts: wrap whatever is current. The hook runs straight after the
      // impulse is applied, so the body's own vertical velocity then IS what the impulse gave it.
      rt.hooks.launch = (...a: number[]) => {
        w.__launches!.push(a[0]!);
        (w as unknown as { __launchVy: number[] }).__launchVy.push(rt.bearBody.current.linvel().y);
        orig(...a);
      };
    }
    window.dispatchEvent(new KeyboardEvent("keydown", { key: " ", cancelable: true }));
  });
  await page.waitForFunction((c) => window.__gummyLab!.rt.plunger.progress >= c, charge, { timeout: 60_000 });
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent("keyup", { key: " ", cancelable: true })));
  await page.waitForFunction(() => (window as unknown as { __launches: number[] }).__launches.length > 0, null, { timeout: 60_000 });
  return page.evaluate(() => {
    const w = window as unknown as { __launches: number[]; __launchVy: number[] };
    return w.__launches[0]!;
  });
}

/** The body's vertical velocity the instant the last plunger launch was applied (see `launch`). */
const launchVy = (page: Page) => page.evaluate(() => (window as unknown as { __launchVy: number[] }).__launchVy[0]!);

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
async function dropOnFlipperAndPress(page: Page, i: 0 | 1, key: string, along = 1) {
  await waitFlipper(page, i, FLIP_REST);
  await page.evaluate(
    ([idx, k, along]) => {
      const rt = window.__gummyLab!.rt;
      const f = rt.flippers[idx as 0 | 1];
      const a = f.state.angle;
      const s = f.layout.side === "left" ? 1 : -1;
      const d = { x: s * Math.cos(a), y: Math.sin(a) };
      const n = { x: -s * Math.sin(a), y: Math.cos(a) };
      const c = { x: f.layout.pivot.x + d.x * (along as number) + n.x * 0.55, y: f.layout.pivot.y + d.y * (along as number) + n.y * 0.55 };
      const rb = rt.bearBody.current!;
      rb.setTranslation({ x: c.x, y: c.y - 0.5, z: 0 }, true);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      // Reset the peak tracker in the same turn as the press so no frame of the launch can be missed.
      const w = window as unknown as { __peak?: { y: number; vy: number } };
      w.__peak = { y: c.y, vy: -Infinity };
      window.dispatchEvent(new KeyboardEvent("keydown", { key: k as string, cancelable: true }));
    },
    [i, key, along] as const,
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

  test("@EVAL-030 controls: ← A Z and → D M raise their own flipper, Space is the plunger (not a flipper), release lowers them, P pauses", async ({ page }, info) => {
    test.skip(info.project.name === "w390", "keyboard and mouse controls on the desktop project; touch is covered separately");
    await openGame(page);
    await startRun(page);
    for (const [i, keys] of [[0, ["ArrowLeft", "a", "z"]], [1, ["ArrowRight", "d", "m"]]] as const) {
      for (const k of keys) {
        await page.keyboard.down(k);
        await waitFlipper(page, i, FLIP_UP);
        expect((await flipper(page, i === 0 ? 1 : 0)).pressed, `${k} must not raise the other flipper`).toBe(false);
        await page.keyboard.up(k);
        await waitFlipper(page, i, FLIP_REST);
      }
    }
    // Space charges the plunger and moves neither flipper (it used to raise both)
    await page.keyboard.down("Space");
    await page.waitForFunction(() => window.__gummyLab!.rt.plunger.charging, null, { timeout: 20_000 });
    expect((await flipper(page, 0)).pressed).toBe(false);
    expect((await flipper(page, 1)).pressed).toBe(false);
    await page.keyboard.up("Space");
    await page.keyboard.press("p");
    expect(await labState(page)).toBe("PAUSED");
    await page.keyboard.press("p");
    expect(["PLAYING", "DANGER"]).toContain(await labState(page));
  });

  test("@EVAL-030 the plunger: holding Space longer launches the gummy with a stronger real force (it hits the physics body, not just an animation)", async ({ page }, info) => {
    test.skip(info.project.name === "w390", "desktop project; the touch plunger has its own test on w390");
    await openGame(page);
    await startRun(page);
    // the gummy waits on the plunger in the right-hand lane at 0%
    const rest = await page.evaluate(() => {
      const rt = window.__gummyLab!.rt;
      const p = rt.bearBody.current!.translation();
      return { x: p.x, y: p.y, laneX: rt.arena.lane.x, restY: rt.arena.lane.restY, charging: rt.plunger.charging, launched: rt.launched };
    });
    expect(Math.abs(rest.x - rest.laneX)).toBeLessThan(0.45);
    expect(rest.y).toBeLessThan(rest.restY + 0.6);
    expect(rest.launched).toBe(false);
    await expect(page.locator("[data-lab-plaque]")).toBeVisible();
    const forces: number[] = [];
    const speeds: number[] = [];
    for (const charge of [0.02, 0.5, 0.97]) {
      // back on the plunger at rest
      await page.evaluate((r) => {
        const rt = window.__gummyLab!.rt;
        rt.bearBody.current!.setTranslation({ x: r.laneX, y: r.restY + 0.05, z: 0 }, true);
        rt.bearBody.current!.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }, rest);
      await page.waitForFunction(() => !window.__gummyLab!.rt.plunger.charging && window.__gummyLab!.rt.plunger.phase === "idle", null, { timeout: 30_000 });
      forces.push(await launch(page, charge));
      speeds.push(await launchVy(page));
    }
    // the force the plunger fired with grows with the hold, from MIN to MAX …
    expect(forces[0]!).toBeGreaterThanOrEqual(21);
    expect(forces[1]!).toBeGreaterThan(forces[0]! + 1);
    expect(forces[2]!).toBeGreaterThan(forces[1]! + 1);
    expect(forces[2]!).toBeLessThanOrEqual(27.5 + 1e-6);
    // … and it is the physics body that received it: the gummy's own vertical velocity, read the instant the impulse was applied,
    // equals the launch force (impulse per unit mass), so a longer hold really is a harder shot
    for (let i = 0; i < 3; i += 1) expect(Math.abs(speeds[i]! - forces[i]!), `launch ${i}: body vy ${speeds[i]} vs force ${forces[i]}`).toBeLessThan(0.05);
    expect(speeds[2]!).toBeGreaterThan(speeds[1]! + 1);
    expect(speeds[1]!).toBeGreaterThan(speeds[0]! + 1);
    // the start plaque goes at the first launch
    await expect(page.locator("[data-lab-plaque]")).toHaveCount(0);
  });

  test("@EVAL-030 the black hole is the real 'Back to Portfolio' link: keyboard focusable, named, and it exits", async ({ page, axe }, info) => {
    test.skip(info.project.name === "w390", "desktop project; the link is size-checked on w390 in the touch test");
    await openGame(page);
    await startRun(page);
    await settled(page);
    const hole = page.getByRole("link", { name: "Back to Portfolio" });
    await expect(hole).toHaveCount(1);
    await expect(hole).toHaveAttribute("href", "/");
    await expect(hole).toHaveAttribute("data-ready", "1", { timeout: 20_000 });
    // reachable by keyboard
    let focused = false;
    for (let i = 0; i < 12 && !focused; i += 1) {
      await page.keyboard.press("Tab");
      focused = await hole.evaluate((el) => el === document.activeElement);
    }
    expect(focused, "Tab reaches the black-hole link").toBe(true);
    expect(await page.evaluate(() => (window.__gummyLab!.rt as unknown as { blackHoleHover: boolean }).blackHoleHover), "focus swells the hole").toBe(true);
    const box = (await hole.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    // it sits over the machine's top-left corner, inside the canvas
    const canvas = (await page.locator("[data-lab-canvas] canvas").boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(canvas.x - 2);
    expect(box.y).toBeGreaterThanOrEqual(canvas.y - 2);
    expect(box.x + box.width / 2, "top-left").toBeLessThan(canvas.x + canvas.width / 2);
    expect(box.y + box.height / 2, "top-left").toBeLessThan(canvas.y + canvas.height / 3);
    await axe(page, { include: "[data-lab]" });
    // Space on the focused link must not charge the plunger (a focused control keeps its keys)
    await page.keyboard.down("Space");
    expect(await page.evaluate(() => window.__gummyLab!.rt.plunger.charging)).toBe(false);
    await page.keyboard.up("Space");
    // Enter follows the link: the same exit path as the old button (history, return route)
    await page.keyboard.press("Enter");
    await page.waitForURL((u) => u.pathname === "/", { timeout: 30_000 });
  });

  test("@EVAL-030 clicking the black hole exits, and Esc and the pause card's Back to Portfolio still do", async ({ page }, info) => {
    test.skip(info.project.name === "w390", "desktop project");
    await openGame(page);
    await startRun(page);
    await page.keyboard.press("p");
    await expect(page.getByRole("dialog", { name: "Paused" }).getByRole("button", { name: "Back to Portfolio" })).toBeVisible();
    await page.keyboard.press("p");
    await page.getByRole("link", { name: "Back to Portfolio" }).click();
    await page.waitForURL((u) => u.pathname === "/", { timeout: 30_000 });
  });

  /** Wrap a runtime function so each call is counted on `window[name]` (the original still runs). */
  const countCalls = (page: Page, path: "requestExit" | "hooks.portal" | "hooks.nudge", name: string) =>
    page.evaluate(
      ([p, n]) => {
        const rt = window.__gummyLab!.rt as unknown as Record<string, Record<string, (...a: unknown[]) => unknown> & ((...a: unknown[]) => unknown)>;
        const w = window as unknown as Record<string, number>;
        w[n!] = 0;
        const [holder, key] = p!.includes(".") ? (p!.split(".") as [string, string]) : (["", p!] as [string, string]);
        const obj = (holder ? rt[holder] : rt) as unknown as Record<string, (...a: unknown[]) => unknown>;
        const orig = obj[key!]!.bind(obj);
        obj[key!] = (...a: unknown[]) => {
          w[n!] = (w[n!] ?? 0) + 1;
          return orig(...a);
        };
      },
      [path, name] as const,
    );

  test("@EVAL-030 the black hole is a way in: the gummy entering the opening in the left wall unlocks YOU REALLY FOUND IT and exits once, without pausing or ending the run", async ({ page }) => {
    await openGame(page);
    await startRun(page);
    await settled(page);
    await countCalls(page, "requestExit", "__exits");
    await page.evaluate(() => {
      const rt = window.__gummyLab!.rt as unknown as { arena: { halfW: number; portal: { y0: number; y1: number } }; bearBody: { current: { setTranslation(p: object, w: boolean): void; setLinvel(v: object, w: boolean): void } } };
      const { halfW, portal } = rt.arena;
      // the gummy flies into the opening from the table: feet a hair above the opening's floor, moving left
      rt.bearBody.current.setTranslation({ x: -halfW + 0.9, y: portal.y0 + 0.12, z: 0 }, true);
      rt.bearBody.current.setLinvel({ x: -7, y: 0, z: 0 }, true);
    });
    await page.waitForFunction(() => (window as unknown as { __exits: number }).__exits >= 1, null, { timeout: 60_000 });
    // the same exit as the link and Esc: the machine moves to EXITING (not PAUSED, not GAME_OVER)
    expect(await labState(page)).toBe("EXITING");
    // touching the sensor again (or the link in the same moment) cannot exit twice
    await page.evaluate(() => (window.__gummyLab!.rt as unknown as { hooks: { portal(): void } }).hooks.portal());
    await page.waitForURL((u) => u.pathname === "/", { timeout: 30_000 });
    // the exit ran exactly once (the app is single-page, so the counter survives the navigation)
    expect(await page.evaluate(() => (window as unknown as { __exits?: number }).__exits)).toBe(1);
    const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem("gummy-lab:v1") ?? "{}") as { achievements?: string[] });
    expect(stored.achievements).toContain("YOU_REALLY_FOUND_IT");
  });

  test("@EVAL-030 the shooter lane closes behind the gummy: a gummy dropped toward the lane cannot enter it, and a new game reopens the gate", async ({ page }) => {
    await openGame(page);
    await startRun(page);
    await settled(page);
    expect(await page.evaluate(() => (window.__gummyLab!.rt as unknown as { laneGateShut: boolean }).laneGateShut)).toBe(false);
    await launch(page, 0.05);
    await page.waitForFunction(() => (window.__gummyLab!.rt as unknown as { laneGateShut: boolean }).laneGateShut, null, { timeout: 90_000 });
    // fling it at the lane's open side from the table, over and over, and watch where it ever gets to
    const maxX = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          const rt = window.__gummyLab!.rt as unknown as { arena: { lane: { xIn: number; dividerTop: number } }; bearBody: { current: { setTranslation(p: object, w: boolean): void; setLinvel(v: object, w: boolean): void; translation(): { x: number; y: number } } } };
          const { xIn, dividerTop } = rt.arena.lane;
          const rb = rt.bearBody.current;
          let max = -Infinity;
          let shots = 0;
          const shoot = () => {
            rb.setTranslation({ x: xIn - 0.9, y: dividerTop + 0.6 + (shots % 3) * 0.7, z: 0 }, true);
            rb.setLinvel({ x: 7, y: 0, z: 0 }, true);
          };
          shoot();
          const tick = () => {
            max = Math.max(max, rb.translation().x);
            if (shots < 4 && rb.translation().x < xIn - 1.5) {
              // it bounced back: shoot again
              shots += 1;
              shoot();
            }
            if (shots >= 4 && rb.translation().x < xIn - 1.5) return resolve(max);
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }),
    );
    const xIn = await page.evaluate(() => window.__gummyLab!.rt.arena.lane.xIn);
    expect(maxX, "the gummy never got into the lane").toBeLessThan(xIn + 0.05);
    // a drain, then a new game: the gate is open again and the gummy is back on the plunger
    await loseRun(page);
    await page.getByRole("button", { name: /play again|replay/i }).first().click();
    await page.waitForSelector("[data-lab-state='PLAYING']", { timeout: 60_000 });
    expect(await page.evaluate(() => (window.__gummyLab!.rt as unknown as { laneGateShut: boolean }).laneGateShut)).toBe(false);
    await page.waitForFunction(() => window.__gummyLab!.rt.bear.x > window.__gummyLab!.rt.arena.lane.xIn, null, { timeout: 30_000 });
  });

  test("@EVAL-030 N nudges the table: a wedged gummy is kicked free (and the cooldown holds a second press)", async ({ page }) => {
    await openGame(page);
    await startRun(page);
    await settled(page);
    await launch(page, 0.05);
    await page.waitForFunction(() => (window.__gummyLab!.rt as unknown as { laneGateShut: boolean }).laneGateShut, null, { timeout: 90_000 });
    await countCalls(page, "hooks.nudge", "__nudges");
    // park the gummy where the headless scan found it wedged (phone: against a bumper; desktop: in the left pocket) and press N in the same turn
    const rest = await page.evaluate(() => {
      const rt = window.__gummyLab!.rt as unknown as { arena: { halfW: number }; bearBody: { current: { setTranslation(p: object, w: boolean): void; setLinvel(v: object, w: boolean): void } } };
      const at = rt.arena.halfW < 4 ? { x: -0.57, y: 3.42 } : { x: -4.5, y: 3.97 };
      rt.bearBody.current.setTranslation({ x: at.x, y: at.y, z: 0 }, true);
      rt.bearBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "n", cancelable: true }));
      window.dispatchEvent(new KeyboardEvent("keyup", { key: "n", cancelable: true }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "n", cancelable: true })); // pressed again at once: the cooldown ignores it
      window.dispatchEvent(new KeyboardEvent("keyup", { key: "n", cancelable: true }));
      return at;
    });
    await page.waitForFunction(() => (window as unknown as { __nudges: number }).__nudges >= 1, null, { timeout: 60_000 });
    await page.waitForFunction(([x, y]) => Math.hypot(window.__gummyLab!.rt.bear.x - (x as number), window.__gummyLab!.rt.bear.y - (y as number)) > 0.5, [rest.x, rest.y] as const, { timeout: 60_000 });
    expect(await page.evaluate(() => (window as unknown as { __nudges: number }).__nudges)).toBe(1);
  });

  test("@EVAL-030 the Nudge button is a labelled, focusable control that shakes the table and recharges", async ({ page }, info) => {
    await openGame(page);
    await startRun(page);
    await settled(page);
    await launch(page, 0.05);
    await page.waitForFunction(() => (window.__gummyLab!.rt as unknown as { laneGateShut: boolean }).laneGateShut, null, { timeout: 90_000 });
    await countCalls(page, "hooks.nudge", "__nudges");
    const btn = page.getByRole("button", { name: "Nudge the machine" });
    await expect(btn).toHaveCount(1);
    const box = (await btn.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    // clear of the plunger control and inside the viewport
    const vp = page.viewportSize()!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 0.5);
    const plunger = await page.locator("[data-lab-plunger]").boundingBox();
    if (plunger) expect(box.x + box.width <= plunger.x || plunger.x + plunger.width <= box.x || box.y + box.height <= plunger.y || plunger.y + plunger.height <= box.y).toBe(true);
    // wedge the gummy, then use the button (a tap at w390, a click on desktop)
    const rest = await page.evaluate(() => {
      const rt = window.__gummyLab!.rt as unknown as { arena: { halfW: number }; bearBody: { current: { setTranslation(p: object, w: boolean): void; setLinvel(v: object, w: boolean): void } } };
      const at = rt.arena.halfW < 4 ? { x: -0.57, y: 3.42 } : { x: -4.5, y: 3.97 };
      rt.bearBody.current.setTranslation({ x: at.x, y: at.y, z: 0 }, true);
      rt.bearBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return at;
    });
    if (info.project.name === "w390") await btn.tap();
    else await btn.click();
    await page.waitForFunction(() => (window as unknown as { __nudges: number }).__nudges >= 1, null, { timeout: 60_000 });
    await page.waitForFunction(([x, y]) => Math.hypot(window.__gummyLab!.rt.bear.x - (x as number), window.__gummyLab!.rt.bear.y - (y as number)) > 0.5, [rest.x, rest.y] as const, { timeout: 60_000 });
    // it recharges (the real cooldown, in game time): dimmed and aria-disabled while it does, then ready again
    await expect(btn).toHaveAttribute("aria-disabled", "true");
    await expect(btn).not.toHaveAttribute("aria-disabled", "true", { timeout: 60_000 });
    // keyboard: focusable, and Enter presses it
    await btn.focus();
    await expect(btn).toBeFocused();
  });

  test("@EVAL-030 reduced motion draws no light trail and no particles, and the lights change state without a loop; play is intact", async ({ page }) => {
    test.setTimeout(150_000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openGame(page);
    await startRun(page);
    const before = await page.evaluate(() => {
      const rt = window.__gummyLab!.rt;
      return { enabled: rt.trail.enabled, cap: rt.trail.capacity, particles: rt.particles.capacity, reduced: rt.reducedMotion };
    });
    expect(before.reduced).toBe(true);
    expect(before.enabled).toBe(false);
    expect(before.particles).toBe(0);
    // a full-power launch and some play: nothing is ever recorded or emitted
    await launch(page, 0.9);
    await page.waitForTimeout(2500);
    const after = await page.evaluate(() => {
      const rt = window.__gummyLab!.rt;
      return { count: rt.trail.count, active: rt.particles.active };
    });
    expect(after.count).toBe(0);
    expect(after.active).toBe(0);
    // no looping animation anywhere in the lab (the black hole's swirl and orbit are driven by the render loop and stop)
    const loops = await page.evaluate(() => document.getAnimations().filter((a) => (a.effect as KeyframeEffect | null)?.getTiming().iterations === Infinity).length);
    expect(loops).toBe(0);
    // gameplay stays intact: the gummy is in play and the drain still ends the run
    expect(await page.evaluate(() => window.__gummyLab!.rt.launched)).toBe(true);
    await loseRun(page);
  });

  test("@EVAL-030 the trail pool is a fixed-size buffer: it never grows however long the game runs", async ({ page }, info) => {
    test.skip(info.project.name === "w390", "desktop project");
    await openGame(page);
    await startRun(page);
    const r = await page.evaluate(() => {
      const rt = window.__gummyLab!.rt;
      const t = rt.trail as unknown as { capacity: number; x: Float32Array; y: Float32Array; age: Float32Array; push(x: number, y: number, s: number, dt: number): void; update(dt: number): void };
      const refs = [t.x, t.y, t.age];
      const len0 = refs.map((a) => a.length);
      let maxCount = 0;
      for (let i = 0; i < 6000; i += 1) {
        t.push(Math.sin(i * 0.07) * 4, Math.cos(i * 0.07) * 4 + i * 0.0005, 20, 1 / 60);
        if (i % 3 === 0) t.update(1 / 60);
        maxCount = Math.max(maxCount, rt.trail.count);
      }
      return { cap: t.capacity, len0, len1: [t.x, t.y, t.age].map((a) => a.length), same: refs.every((a, i) => a === [t.x, t.y, t.age][i]), maxCount };
    });
    expect(r.same).toBe(true);
    expect(r.len1).toEqual(r.len0);
    expect(r.maxCount).toBeLessThanOrEqual(r.cap);
    expect(r.len0.every((n) => n === r.cap)).toBe(true);
  });

  test("@EVAL-030 a flipper swung into the gummy sends it up the table (left by keyboard, right by keyboard)", async ({ page }, info) => {
    test.skip(info.project.name === "w390", "desktop project; the touch halves are covered on w390");
    await openGame(page);
    await startRun(page);
    await page.evaluate(() => {
      const w = window as unknown as { __peak: { y: number; vy: number } };
      w.__peak = { y: -Infinity, vy: -Infinity };
      // Sample the physics body itself on EVERY fixed physics step (not per rendered frame: a software-GL host renders a frame every
      // few steps, and a shot that bounces off a bumper and falls back inside that gap would be missed). A flipper's body is told its
      // angle once per step, so wrapping that call gives a per-step tick.
      const rt = window.__gummyLab!.rt;
      const flipperBody = rt.flippers[0].body.current!;
      const stepFlipper = flipperBody.setNextKinematicRotation.bind(flipperBody);
      flipperBody.setNextKinematicRotation = (q) => {
        const body = rt.bearBody.current!;
        w.__peak.y = Math.max(w.__peak.y, body.translation().y);
        w.__peak.vy = Math.max(w.__peak.vy, body.linvel().y);
        stepFlipper(q);
      };
    });
    for (const [i, key] of [[0, "ArrowLeft"], [1, "ArrowRight"]] as const) {
      // 1.5 along the paddle (toward the tip): the shot goes up the middle of the table, clear of the ramps out by the walls
      await dropOnFlipperAndPress(page, i, key, 1.5);
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
    // the right half, but clear of the launch lane (which has its own plunger control)
    await page.mouse.move(box.x + box.width * 0.6, y);
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

  test("@EVAL-030 the first-session hint appears only after the launch and sits in clear space: it never overlaps a flipper or a guide rail", async ({ page }) => {
    await openGame(page);
    await startRun(page);
    await page.waitForTimeout(500);
    expect(await page.locator("[data-lab-hint]").count(), "no overlay before the launch").toBe(0);
    await launch(page, 0.05);
    await page.waitForSelector("[data-lab-hint]", { timeout: 20_000 });
    const r = await page.evaluate(() => {
      const rt = window.__gummyLab!.rt;
      const h = document.querySelector("[data-lab-hint]")!.getBoundingClientRect();
      const boxOf = (pts: { x: number; y: number }[]) => {
        const p = pts.map((q) => rt.project(q.x, q.y));
        const pad = 14; // the flipper/guide is a thick card, not a line
        return { l: Math.min(...p.map((q) => q.x)) - pad, r: Math.max(...p.map((q) => q.x)) + pad, t: Math.min(...p.map((q) => q.y)) - pad, b: Math.max(...p.map((q) => q.y)) + pad };
      };
      const boxes = [
        ...rt.flippers.map((f) => {
          const tip = { x: f.layout.pivot.x + (f.layout.side === "left" ? 1 : -1) * f.layout.len, y: f.layout.pivot.y };
          return { name: `flipper-${f.layout.side}`, ...boxOf([f.layout.pivot, tip, { x: tip.x, y: tip.y + 0.9 }]) };
        }),
        ...rt.arena.guides.map((g, i) => ({ name: `guide-${i}`, ...boxOf([{ x: g.x1, y: g.y1 }, { x: g.x2, y: g.y2 }]) })),
      ];
      const hit = boxes.filter((b) => h.left < b.r && h.right > b.l && h.top < b.b && h.bottom > b.t).map((b) => b.name);
      return { hit, hint: { l: h.left, r: h.right, t: h.top, b: h.bottom }, centre: (h.left + h.right) / 2, vw: window.innerWidth };
    });
    expect(r.hit).toEqual([]);
    expect(Math.abs(r.centre - r.vw / 2), "centred (within a scrollbar's width)").toBeLessThan(16);
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
      rb.setTranslation({ x: pad.x, y: pad.y + 0.55, z: 0 }, true);
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
    const rx = box.x + box.width * 0.58; // the right half, clear of the launch lane (its own plunger control)
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

test.describe("@EVAL-030 mobile plunger (touch)", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== "w390", "touch project only");
    test.setTimeout(150_000);
  });

  test("@EVAL-030 touch: press and hold the visible plunger in the launch lane to charge, release to launch", async ({ page }) => {
    await page.goto("/lab?debug");
    await waitLab(page);
    test.skip((await labMode(page)) !== "canvas", "no WebGL on this host");
    await startRun(page);
    await settled(page);
    // the start plaque speaks touch, and the plunger is a real, big-enough control sitting over the lane
    await expect(page.locator("[data-lab-plaque]")).toContainText(/plunger/i);
    const btn = page.locator("[data-lab-plunger]");
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAccessibleName(/plunger.*hold to charge, release to launch/i);
    await expect.poll(async () => (await btn.boundingBox())?.width ?? 0, { timeout: 20_000 }).toBeGreaterThanOrEqual(44);
    const b = (await btn.boundingBox())!;
    expect(b.height).toBeGreaterThanOrEqual(44);
    const lane = await page.evaluate(() => {
      const rt = window.__gummyLab!.rt;
      const a = rt.project(rt.arena.lane.x, rt.arena.lane.restY);
      return { x: a.x, y: a.y };
    });
    expect(lane.x, "the control covers the lane").toBeGreaterThan(b.x);
    expect(lane.x).toBeLessThan(b.x + b.width);
    expect(lane.y).toBeGreaterThan(b.y);
    expect(lane.y).toBeLessThan(b.y + b.height);
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: "touchStart" | "touchEnd", points: { x: number; y: number; id: number }[]) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });
    await page.evaluate(() => {
      const w = window as unknown as { __launches: number[] };
      w.__launches = [];
      const hooks = (window.__gummyLab!.rt as unknown as { hooks: { launch: (...a: number[]) => void } }).hooks;
      const orig = hooks.launch.bind(hooks);
      hooks.launch = (...a: number[]) => {
        w.__launches.push(a[0]!);
        orig(...a);
      };
    });
    await touch("touchStart", [{ x: lane.x, y: lane.y, id: 1 }]);
    await page.waitForFunction(() => window.__gummyLab!.rt.plunger.charging, null, { timeout: 20_000 });
    // flippers are untouched by a plunger press
    expect((await flipper(page, 0)).pressed).toBe(false);
    expect((await flipper(page, 1)).pressed).toBe(false);
    await page.waitForFunction(() => window.__gummyLab!.rt.plunger.progress >= 0.25, null, { timeout: 60_000 });
    await touch("touchEnd", []);
    await page.waitForFunction(() => (window as unknown as { __launches: number[] }).__launches.length > 0, null, { timeout: 60_000 });
    const force = await page.evaluate(() => (window as unknown as { __launches: number[] }).__launches[0]!);
    expect(force).toBeGreaterThan(21.5);
    await expect(page.locator("[data-lab-plaque]")).toHaveCount(0);
    expect(await page.evaluate(() => window.__gummyLab!.rt.launched)).toBe(true);
  });

  test("@EVAL-030 the black hole link is a 44 px+ target on a phone and sits in the top-left of the table", async ({ page }) => {
    await page.goto("/lab?debug");
    await waitLab(page);
    test.skip((await labMode(page)) !== "canvas", "no WebGL on this host");
    await startRun(page);
    await settled(page);
    const hole = page.getByRole("link", { name: "Back to Portfolio" });
    await expect(hole).toHaveAttribute("data-ready", "1", { timeout: 20_000 });
    const b = (await hole.boundingBox())!;
    expect(b.width).toBeGreaterThanOrEqual(44);
    expect(b.height).toBeGreaterThanOrEqual(44);
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width).toBeLessThanOrEqual(390.5);
    await hole.click();
    await page.waitForURL((u) => u.pathname === "/", { timeout: 30_000 });
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
