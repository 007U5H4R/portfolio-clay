/**
 * paperMotion (M-011, Design.md §14.4, TASK-156.2) — the one motion source for every Paper World scene.
 *
 * One passive `pointermove` listener (fine pointers), one passive `deviceorientation` listener (touch, only
 * while a scene is in view, and only after the chip tap where the platform asks), one rAF spring loop for the
 * whole page. It writes two unitless custom properties, `--pp-x` / `--pp-y` in [-1, 1], on the roots of the
 * scenes that are intersecting; layers turn them into `translate` in CSS. The loop sleeps when the spring is
 * at rest, when no scene is intersecting and when the tab is hidden, and restarts only on new input. Under
 * `prefers-reduced-motion: reduce` nothing is attached and layers stay at rest.
 *
 * `createPaperMotion(env)` takes its browser as an argument so the unit tests drive it by hand; the exported
 * `paperMotion` binds to `window` lazily (nothing touches `window` at import time, so SSR is safe).
 */
export type GyroResult = "granted" | "denied" | "unavailable";

interface MQ {
  matches: boolean;
  addEventListener(type: "change", cb: () => void): void;
  removeEventListener(type: "change", cb: () => void): void;
}
type Listen = (type: string, cb: (e: never) => void, opts?: { passive?: boolean }) => void;
export interface MotionEnv {
  win: {
    innerWidth: number;
    innerHeight: number;
    matchMedia(q: string): MQ;
    addEventListener: Listen;
    removeEventListener: Listen;
    requestAnimationFrame(cb: (t: number) => void): number;
    cancelAnimationFrame(id: number): void;
    IntersectionObserver: new (cb: (e: Array<{ target: Element; isIntersecting: boolean }>) => void) => {
      observe(el: Element): void;
      unobserve(el: Element): void;
      disconnect(): void;
    };
    DeviceOrientationEvent?: { requestPermission?: () => Promise<string> };
  };
  doc: { visibilityState: string; addEventListener: Listen; removeEventListener: Listen };
}

const STIFFNESS = 120;
const DAMPING = 20; // mass 1
const ALPHA = 0.15; // low-pass on sensor input
const TILT_MAX = 25; // degrees
const REST_POS = 0.001;
const REST_VEL = 0.01;
const clamp = (n: number) => Math.max(-1, Math.min(1, n));
const fmt = (n: number) => String(Math.round(n * 1e4) / 1e4);

export function createPaperMotion({ win, doc }: MotionEnv) {
  const roots = new Set<HTMLElement>();
  const seen = new Set<HTMLElement>(); // intersecting roots
  const reducedMq = win.matchMedia("(prefers-reduced-motion: reduce)");
  const fineMq = win.matchMedia("(hover: hover) and (pointer: fine)");
  let io: InstanceType<MotionEnv["win"]["IntersectionObserver"]> | undefined;
  let attached = false;
  let orienting = false;
  let granted = false;
  let decided = false;
  let raf = 0;
  let last = 0;
  let mode = "";
  const pos = [0, 0];
  const vel = [0, 0];
  const tgt = [0, 0];
  const lp = [0, 0];

  const ask = () => win.DeviceOrientationEvent?.requestPermission;
  const wantsGyro = () => !reducedMq.matches && !fineMq.matches && !!win.DeviceOrientationEvent && (!ask() || granted);

  const write = (root: HTMLElement) => {
    root.style.setProperty("--pp-x", fmt(pos[0]!));
    root.style.setProperty("--pp-y", fmt(pos[1]!));
  };
  const writeAll = () => seen.forEach(write);
  const stop = () => {
    if (raf) win.cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
  };
  const setMode = (m: string) => {
    if (m === mode) return;
    mode = m;
    seen.forEach((r) => (r.dataset.ppMode = m));
  };
  const wake = () => {
    if (!raf && seen.size > 0 && doc.visibilityState !== "hidden") raf = win.requestAnimationFrame(tick);
  };

  function tick(t: number) {
    raf = 0;
    const dt = last ? Math.min((t - last) / 1000, 1 / 30) : 1 / 60;
    last = t;
    let rest = true;
    for (let i = 0; i < 2; i++) {
      vel[i] = vel[i]! + (STIFFNESS * (tgt[i]! - pos[i]!) - DAMPING * vel[i]!) * dt;
      pos[i] = pos[i]! + vel[i]! * dt;
      if (Math.abs(tgt[i]! - pos[i]!) >= REST_POS || Math.abs(vel[i]!) >= REST_VEL) rest = false;
    }
    if (rest) {
      pos[0] = tgt[0]!;
      pos[1] = tgt[1]!;
      vel[0] = vel[1] = 0;
    }
    writeAll();
    if (rest) last = 0;
    else raf = win.requestAnimationFrame(tick);
  }

  const onPointer = (e: { clientX: number; clientY: number }) => {
    if (seen.size === 0 || doc.visibilityState === "hidden") return;
    setMode("pointer");
    tgt[0] = clamp((e.clientX / win.innerWidth) * 2 - 1);
    tgt[1] = clamp((e.clientY / win.innerHeight) * 2 - 1);
    wake();
  };
  const onOrient = (e: { gamma: number | null; beta: number | null }) => {
    if (seen.size === 0 || doc.visibilityState === "hidden") return;
    setMode("orientation");
    const raw = [(e.gamma ?? 0) / TILT_MAX, ((e.beta ?? 45) - 45) / TILT_MAX];
    let moved = false;
    for (let i = 0; i < 2; i++) {
      lp[i] = lp[i]! + ALPHA * (clamp(raw[i]!) - lp[i]!);
      // Sensor jitter below the spring's own rest threshold must not wake the loop on a phone lying still.
      if (Math.abs(lp[i]! - tgt[i]!) >= 2 * REST_POS) {
        tgt[i] = lp[i]!;
        moved = true;
      }
    }
    if (moved) wake();
  };
  const onVisibility = () => {
    if (doc.visibilityState === "hidden") stop();
  };

  const syncOrientation = () => {
    const on = attached && seen.size > 0 && wantsGyro();
    if (on === orienting) return;
    orienting = on;
    if (on) win.addEventListener("deviceorientation", onOrient, { passive: true });
    else win.removeEventListener("deviceorientation", onOrient);
  };

  const attach = () => {
    if (attached) return;
    attached = true;
    if (fineMq.matches) win.addEventListener("pointermove", onPointer, { passive: true });
    doc.addEventListener("visibilitychange", onVisibility);
    io = new win.IntersectionObserver((entries) => {
      for (const { target, isIntersecting } of entries) {
        const el = target as HTMLElement;
        if (isIntersecting) {
          seen.add(el);
          if (mode) el.dataset.ppMode = mode;
          write(el);
        } else seen.delete(el);
      }
      if (seen.size === 0) stop();
      else if (pos[0] !== tgt[0] || pos[1] !== tgt[1]) wake();
      syncOrientation();
    });
    roots.forEach((r) => io!.observe(r));
  };
  const detach = () => {
    if (!attached) return;
    attached = false;
    win.removeEventListener("pointermove", onPointer);
    doc.removeEventListener("visibilitychange", onVisibility);
    io?.disconnect();
    io = undefined;
    syncOrientation();
    stop();
  };
  const rest = () => {
    pos[0] = pos[1] = vel[0] = vel[1] = tgt[0] = tgt[1] = lp[0] = lp[1] = 0;
    roots.forEach(write);
    seen.clear();
  };
  const decide = () => {
    if (reducedMq.matches || roots.size === 0) {
      const was = attached;
      detach();
      if (was && reducedMq.matches) rest();
    } else attach();
  };
  let watching = false;

  return {
    /** Register a scene root; returns the unregister function. */
    register(root: HTMLElement): () => void {
      roots.add(root);
      if (!watching) {
        watching = true;
        reducedMq.addEventListener("change", decide);
      }
      if (attached) io?.observe(root);
      decide();
      return () => {
        roots.delete(root);
        seen.delete(root);
        io?.unobserve(root);
        if (seen.size === 0) stop();
        syncOrientation();
        if (roots.size === 0) {
          watching = false;
          reducedMq.removeEventListener("change", decide);
        }
        decide();
      };
    },
    /** True where the platform gates motion sensors behind a user gesture and none was given yet. */
    needsGyroPermission: () => !reducedMq.matches && !fineMq.matches && typeof ask() === "function" && !granted && !decided,
    /** Call synchronously from the chip's click handler — the only place `requestPermission` is ever called. */
    requestGyro(): Promise<GyroResult> {
      const request = ask();
      if (reducedMq.matches || fineMq.matches || typeof request !== "function") return Promise.resolve("unavailable");
      let result: Promise<string>;
      try {
        result = request.call(win.DeviceOrientationEvent);
      } catch {
        decided = true;
        return Promise.resolve("denied");
      }
      return result.then(
        (state) => {
          decided = true;
          granted = state === "granted";
          syncOrientation();
          return granted ? "granted" : "denied";
        },
        () => {
          decided = true;
          return "denied";
        },
      );
    },
  };
}

type PaperMotion = ReturnType<typeof createPaperMotion>;
let instance: PaperMotion | undefined;
const get = () =>
  (instance ??= createPaperMotion({ win: window as unknown as MotionEnv["win"], doc: document as unknown as MotionEnv["doc"] }));

/** Browser singleton; every method is safe to import on the server and must be called from an effect or handler. */
export const paperMotion = {
  register: (root: HTMLElement) => get().register(root),
  needsGyroPermission: () => get().needsGyroPermission(),
  requestGyro: () => get().requestGyro(),
};
