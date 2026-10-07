import { describe, expect, it, vi } from "vitest";
import { createPaperMotion, type MotionEnv } from "@/lib/paper-world/motion";

type Cb = (e: unknown) => void;

/** A hand-driven browser: counts listeners, queues rAF, lets the test flip media queries and intersection. */
function fakeEnv(opts: { fine?: boolean; reduced?: boolean; permission?: (() => Promise<string>) | undefined; width?: number } = {}) {
  const listeners = new Map<string, Set<Cb>>();
  const added: Array<{ type: string; passive: boolean | undefined }> = [];
  const docListeners = new Map<string, Set<Cb>>();
  const media = { fine: opts.fine ?? true, reduced: opts.reduced ?? false };
  const mqCbs = new Set<Cb>();
  let rafId = 0;
  const raf = new Map<number, (t: number) => void>();
  let ioCb: ((entries: Array<{ target: unknown; isIntersecting: boolean }>) => void) | undefined;
  const observed = new Set<unknown>();
  const doc = {
    visibilityState: "visible",
    addEventListener: (t: string, cb: Cb) => void (docListeners.get(t) ?? docListeners.set(t, new Set()).get(t)!).add(cb),
    removeEventListener: (t: string, cb: Cb) => void docListeners.get(t)?.delete(cb),
  };
  const win = {
    innerWidth: opts.width ?? 1440,
    innerHeight: 900,
    matchMedia: (q: string) => ({
      get matches() {
        if (q.includes("reduce")) return media.reduced;
        if (q.includes("pointer: fine")) return media.fine;
        return false;
      },
      addEventListener: (_t: string, cb: Cb) => void mqCbs.add(cb),
      removeEventListener: (_t: string, cb: Cb) => void mqCbs.delete(cb),
    }),
    addEventListener: (t: string, cb: Cb, o?: { passive?: boolean }) => {
      added.push({ type: t, passive: o?.passive });
      (listeners.get(t) ?? listeners.set(t, new Set()).get(t)!).add(cb);
    },
    removeEventListener: (t: string, cb: Cb) => void listeners.get(t)?.delete(cb),
    requestAnimationFrame: (cb: (t: number) => void) => (raf.set(++rafId, cb), rafId),
    cancelAnimationFrame: (id: number) => void raf.delete(id),
    IntersectionObserver: class {
      constructor(cb: typeof ioCb) {
        ioCb = cb;
      }
      observe(el: unknown) {
        observed.add(el);
      }
      unobserve(el: unknown) {
        observed.delete(el);
      }
      disconnect() {
        observed.clear();
      }
    },
    DeviceOrientationEvent: opts.permission ? { requestPermission: opts.permission } : {},
  };
  let now = 0;
  return {
    env: { win, doc } as unknown as MotionEnv,
    media,
    doc,
    count: (t: string) => listeners.get(t)?.size ?? 0,
    docCount: (t: string) => docListeners.get(t)?.size ?? 0,
    added,
    pending: () => raf.size,
    fire: (t: string, e: unknown) => listeners.get(t)?.forEach((cb) => cb(e)),
    fireDoc: (t: string) => docListeners.get(t)?.forEach((cb) => cb({})),
    /** Run one frame (16.7 ms). */
    frame() {
      now += 1000 / 60;
      const cbs = [...raf.values()];
      raf.clear();
      cbs.forEach((cb) => cb(now));
    },
    frames(n: number) {
      for (let i = 0; i < n && raf.size > 0; i++) this.frame();
    },
    intersect(el: unknown, isIntersecting: boolean) {
      ioCb?.([{ target: el, isIntersecting }]);
    },
    changeMedia() {
      mqCbs.forEach((cb) => cb({}));
    },
    observed,
  };
}

function fakeRoot() {
  const vars: Record<string, string> = {};
  return {
    vars,
    style: { setProperty: (k: string, v: string) => void (vars[k] = v) },
    dataset: {} as Record<string, string>,
  } as unknown as HTMLElement & { vars: Record<string, string> };
}
const x = (r: { vars: Record<string, string> }) => Number(r.vars["--pp-x"] ?? 0);
const y = (r: { vars: Record<string, string> }) => Number(r.vars["--pp-y"] ?? 0);

function setup(o: Parameters<typeof fakeEnv>[0] = {}) {
  const f = fakeEnv(o);
  const m = createPaperMotion(f.env);
  const root = fakeRoot();
  m.register(root);
  f.intersect(root, true);
  return { f, m, root };
}
const move = (f: ReturnType<typeof fakeEnv>, cx: number, cy: number) => f.fire("pointermove", { clientX: cx, clientY: cy, pointerType: "mouse" });

describe("paperMotion — listeners", () => {
  it("attaches exactly one passive pointermove listener however many scenes register", () => {
    const f = fakeEnv();
    const m = createPaperMotion(f.env);
    m.register(fakeRoot());
    m.register(fakeRoot());
    m.register(fakeRoot());
    expect(f.count("pointermove")).toBe(1);
    expect(f.added.filter((a) => a.type === "pointermove").every((a) => a.passive === true)).toBe(true);
  });

  it("attaches no motion listener under prefers-reduced-motion and leaves layers at rest", () => {
    const { f, root } = setup({ reduced: true });
    expect(f.count("pointermove")).toBe(0);
    expect(f.count("deviceorientation")).toBe(0);
    expect(f.docCount("visibilitychange")).toBe(0);
    expect(f.observed.size).toBe(0);
    expect(f.pending()).toBe(0);
    expect(root.vars["--pp-x"]).toBeUndefined();
  });

  it("removes listeners and returns to rest when reduced motion turns on, and re-attaches when it turns off", () => {
    const { f, root } = setup();
    move(f, 1440, 450);
    f.frames(5);
    expect(x(root)).not.toBe(0);
    f.media.reduced = true;
    f.changeMedia();
    expect(f.count("pointermove")).toBe(0);
    expect(f.pending()).toBe(0);
    expect(x(root)).toBe(0);
    expect(y(root)).toBe(0);
    f.media.reduced = false;
    f.changeMedia();
    expect(f.count("pointermove")).toBe(1);
  });

  it("detaches everything when the last scene unregisters", () => {
    const f = fakeEnv();
    const m = createPaperMotion(f.env);
    const root = fakeRoot();
    const off = m.register(root);
    off();
    expect(f.count("pointermove")).toBe(0);
    expect(f.docCount("visibilitychange")).toBe(0);
  });

  it("attaches no pointer listener without a fine pointer", () => {
    const { f } = setup({ fine: false });
    expect(f.count("pointermove")).toBe(0);
  });
});

describe("paperMotion — spring", () => {
  it("clamps the target to ±1 and writes unitless --pp-x/--pp-y", () => {
    const { f, root } = setup();
    move(f, 99999, -99999);
    f.frames(400);
    expect(x(root)).toBeCloseTo(1, 2);
    expect(y(root)).toBeCloseTo(-1, 2);
    expect(Math.abs(x(root))).toBeLessThanOrEqual(1);
  });

  it("maps the viewport centre to 0 and the corners to ±1", () => {
    const { f, root } = setup();
    move(f, 0, 0);
    f.frames(400);
    expect(x(root)).toBeCloseTo(-1, 2);
    expect(y(root)).toBeCloseTo(-1, 2);
    move(f, 720, 450);
    f.frames(400);
    expect(x(root)).toBeCloseTo(0, 2);
  });

  it("moves toward the target without a visible overshoot (stiffness 120, damping 20)", () => {
    const { f, root } = setup();
    move(f, 1440, 450);
    let peak = 0;
    for (let i = 0; i < 300 && f.pending() > 0; i++) {
      f.frame();
      peak = Math.max(peak, x(root));
    }
    expect(peak).toBeLessThanOrEqual(1.01);
    expect(peak).toBeGreaterThan(0.99);
  });

  it("sleeps once settled: no rAF callback is pending after the spring comes to rest", () => {
    const { f } = setup();
    move(f, 1440, 450);
    expect(f.pending()).toBe(1);
    f.frames(600);
    expect(f.pending()).toBe(0);
  });

  it("restarts only on new input", () => {
    const { f, root } = setup();
    move(f, 1440, 450);
    f.frames(600);
    expect(f.pending()).toBe(0);
    move(f, 0, 450);
    expect(f.pending()).toBe(1);
    f.frames(600);
    expect(x(root)).toBeCloseTo(-1, 2);
  });

  it("never starts a loop while no registered scene intersects, and writes only to intersecting roots", () => {
    const f = fakeEnv();
    const m = createPaperMotion(f.env);
    const seen = fakeRoot();
    const hidden = fakeRoot();
    m.register(seen);
    m.register(hidden);
    move(f, 1440, 450);
    expect(f.pending()).toBe(0);
    f.intersect(seen, true);
    move(f, 1440, 450);
    f.frames(600);
    expect(x(seen)).toBeCloseTo(1, 2);
    expect(hidden.vars["--pp-x"]).toBeUndefined();
  });

  it("stops the loop when the last intersecting scene leaves", () => {
    const { f, root } = setup();
    move(f, 1440, 450);
    f.frames(3);
    expect(f.pending()).toBe(1);
    f.intersect(root, false);
    expect(f.pending()).toBe(0);
  });

  it("stops on visibilitychange hidden and does not restart without input", () => {
    const { f } = setup();
    move(f, 1440, 450);
    f.frames(3);
    f.doc.visibilityState = "hidden";
    f.fireDoc("visibilitychange");
    expect(f.pending()).toBe(0);
    f.doc.visibilityState = "visible";
    f.fireDoc("visibilitychange");
    expect(f.pending()).toBe(0);
    move(f, 0, 0);
    expect(f.pending()).toBe(1);
  });

  it("ignores pointer input while the tab is hidden", () => {
    const { f } = setup();
    f.doc.visibilityState = "hidden";
    move(f, 1440, 450);
    expect(f.pending()).toBe(0);
  });

  it("marks the root as pointer-driven", () => {
    const { f, root } = setup();
    move(f, 1440, 450);
    expect(root.dataset.ppMode).toBe("pointer");
  });
});

describe("paperMotion — orientation", () => {
  const tilt = (f: ReturnType<typeof fakeEnv>, gamma: number, beta = 45) => f.fire("deviceorientation", { gamma, beta });

  it("never attaches the orientation listener on a fine-pointer desktop", () => {
    const { f } = setup({ fine: true });
    expect(f.count("deviceorientation")).toBe(0);
  });

  it("attaches the passive orientation listener only while a scene intersects (Android-style)", () => {
    const f = fakeEnv({ fine: false });
    const m = createPaperMotion(f.env);
    const root = fakeRoot();
    m.register(root);
    expect(f.count("deviceorientation")).toBe(0);
    f.intersect(root, true);
    expect(f.count("deviceorientation")).toBe(1);
    expect(f.added.find((a) => a.type === "deviceorientation")?.passive).toBe(true);
    f.intersect(root, false);
    expect(f.count("deviceorientation")).toBe(0);
  });

  it("low-passes sensor input (α 0.15) and clamps tilt to ±25°", () => {
    const { f, root } = setup({ fine: false });
    tilt(f, 80);
    f.frames(2000);
    // one event: target = 0.15 × clamp(80°, ±25°)/25° = 0.15
    expect(x(root)).toBeCloseTo(0.15, 2);
    for (let i = 0; i < 80; i++) tilt(f, 80);
    f.frames(2000);
    expect(x(root)).toBeCloseTo(1, 1);
    expect(x(root)).toBeLessThanOrEqual(1);
    expect(root.dataset.ppMode).toBe("orientation");
  });

  it("does not call requestPermission on registration, scroll-less load or intersection", () => {
    const permission = vi.fn(() => Promise.resolve("granted"));
    const f = fakeEnv({ fine: false, permission });
    const m = createPaperMotion(f.env);
    const root = fakeRoot();
    m.register(root);
    f.intersect(root, true);
    expect(permission).not.toHaveBeenCalled();
    expect(f.count("deviceorientation")).toBe(0);
    expect(m.needsGyroPermission()).toBe(true);
  });

  it("calls requestPermission synchronously from requestGyro, and attaches on granted", async () => {
    const permission = vi.fn(() => Promise.resolve("granted"));
    const f = fakeEnv({ fine: false, permission });
    const m = createPaperMotion(f.env);
    const root = fakeRoot();
    m.register(root);
    f.intersect(root, true);
    const pending = m.requestGyro();
    expect(permission).toHaveBeenCalledTimes(1);
    await expect(pending).resolves.toBe("granted");
    expect(f.count("deviceorientation")).toBe(1);
    expect(m.needsGyroPermission()).toBe(false);
  });

  it("resolves 'denied' without throwing or attaching when permission is refused or errors", async () => {
    for (const permission of [() => Promise.resolve("denied"), () => Promise.reject(new Error("nope"))]) {
      const f = fakeEnv({ fine: false, permission });
      const m = createPaperMotion(f.env);
      const root = fakeRoot();
      m.register(root);
      f.intersect(root, true);
      await expect(m.requestGyro()).resolves.toBe("denied");
      expect(f.count("deviceorientation")).toBe(0);
    }
  });

  it("reports 'unavailable' on desktop or under reduced motion and never calls requestPermission", async () => {
    const permission = vi.fn(() => Promise.resolve("granted"));
    for (const o of [{ fine: true }, { fine: false, reduced: true }]) {
      const f = fakeEnv({ ...o, permission });
      const m = createPaperMotion(f.env);
      m.register(fakeRoot());
      expect(m.needsGyroPermission()).toBe(false);
      await expect(m.requestGyro()).resolves.toBe("unavailable");
    }
    expect(permission).not.toHaveBeenCalled();
  });
});
