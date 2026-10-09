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
const SCROLL_WINDOW = 150; // ms after a scroll event during which no object activates
const OBJ_SELECTOR = "[data-pm-obj]";
const clamp = (n: number) => Math.max(-1, Math.min(1, n));
const fmt = (n: number) => String(Math.round(n * 1e4) / 1e4);

interface PointerLike {
  clientX: number;
  clientY: number;
  target?: unknown;
  timeStamp?: number;
}

export function createPaperMotion({ win, doc }: MotionEnv) {
  const roots = new Set<HTMLElement>();
  const seen = new Set<HTMLElement>(); // intersecting roots
  const objects = new Set<HTMLElement>(); // registered objects ([data-pm-obj])
  const objSeen = new Set<HTMLElement>(); // intersecting objects
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
  let scrolling = false; // the scroll listener is attached
  const pos = [0, 0];
  const vel = [0, 0];
  const tgt = [0, 0];
  const lp = [0, 0];
  // object channel: `cur` is the one element whose --hx/--hy are being written; `follow` is true while the
  // pointer is over it (false = settling back to 0, then released).
  let cur: HTMLElement | undefined;
  let follow = false;
  let rect: { left: number; top: number; width: number; height: number } | undefined;
  let lastTarget: unknown;
  let lastCandidate: HTMLElement | undefined;
  let scrollUntil = -Infinity;
  let sceneMoving = false;
  const opos = [0, 0];
  const ovel = [0, 0];
  const otgt = [0, 0];
  const oWritten = ["", ""];

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
    if (!raf && (seen.size > 0 || cur) && doc.visibilityState !== "hidden") raf = win.requestAnimationFrame(tick);
  };

  const writeObj = (force: boolean) => {
    if (!cur) return;
    for (let i = 0; i < 2; i++) {
      const v = fmt(opos[i]!);
      if (force || v !== oWritten[i]) {
        cur.style.setProperty(i ? "--hy" : "--hx", v);
        oWritten[i] = v;
      }
    }
  };
  /** Drop the current object at once: custom properties back to 0, marker removed, channel zeroed. */
  const clearObj = () => {
    if (cur) {
      cur.style.setProperty("--hx", "0");
      cur.style.setProperty("--hy", "0");
      cur.removeAttribute("data-pm-active");
    }
    cur = undefined;
    follow = false;
    rect = undefined;
    opos[0] = opos[1] = ovel[0] = ovel[1] = otgt[0] = otgt[1] = 0;
    oWritten[0] = oWritten[1] = "";
  };
  /** The pointer left the object, the page scrolled or the object left view: settle to 0, release at rest. */
  const releaseObj = () => {
    if (!cur) return;
    follow = false;
    rect = undefined;
    otgt[0] = otgt[1] = 0;
    wake();
  };
  const activate = (el: HTMLElement) => {
    if (cur && cur !== el) clearObj();
    if (cur !== el) {
      cur = el;
      el.setAttribute("data-pm-active", "");
      oWritten[0] = oWritten[1] = "";
    }
    follow = true;
    rect = el.getBoundingClientRect();
  };

  function tick(t: number) {
    raf = 0;
    const dt = last ? Math.min((t - last) / 1000, 1 / 30) : 1 / 60;
    last = t;
    let sceneRest = true;
    for (let i = 0; i < 2; i++) {
      vel[i] = vel[i]! + (STIFFNESS * (tgt[i]! - pos[i]!) - DAMPING * vel[i]!) * dt;
      pos[i] = pos[i]! + vel[i]! * dt;
      if (Math.abs(tgt[i]! - pos[i]!) >= REST_POS || Math.abs(vel[i]!) >= REST_VEL) sceneRest = false;
    }
    if (sceneRest) {
      pos[0] = tgt[0]!;
      pos[1] = tgt[1]!;
      vel[0] = vel[1] = 0;
    }
    if (!sceneRest || sceneMoving) writeAll();
    sceneMoving = !sceneRest;

    let objRest = true;
    if (cur) {
      for (let i = 0; i < 2; i++) {
        ovel[i] = ovel[i]! + (STIFFNESS * (otgt[i]! - opos[i]!) - DAMPING * ovel[i]!) * dt;
        opos[i] = opos[i]! + ovel[i]! * dt;
        if (Math.abs(otgt[i]! - opos[i]!) >= REST_POS || Math.abs(ovel[i]!) >= REST_VEL) objRest = false;
      }
      if (objRest) {
        opos[0] = otgt[0]!;
        opos[1] = otgt[1]!;
        ovel[0] = ovel[1] = 0;
      }
      writeObj(false);
      // settled and no longer followed: write the final 0, drop the marker and the reference
      if (objRest && !follow) clearObj();
    }
    if (sceneRest && objRest) last = 0;
    else raf = win.requestAnimationFrame(tick);
  }

  const candidateOf = (target: unknown): HTMLElement | undefined => {
    if (target === lastTarget) return lastCandidate;
    lastTarget = target;
    const t = target as { closest?: (sel: string) => unknown } | null | undefined;
    const c = t && typeof t.closest === "function" ? (t.closest(OBJ_SELECTOR) as HTMLElement | null) : null;
    lastCandidate = c && objects.has(c) ? c : undefined;
    return lastCandidate;
  };
  const onPointer = (e: PointerLike) => {
    if (doc.visibilityState === "hidden") return;
    // object channel: the DOM walk runs only when the hovered element changes
    if (objects.size > 0) {
      const c = candidateOf(e.target);
      const blocked = (e.timeStamp ?? 0) < scrollUntil;
      if (cur && follow && (c !== cur || blocked)) releaseObj();
      if (c && !blocked && objSeen.has(c) && (!cur || !follow || c !== cur)) activate(c);
      if (cur && follow) {
        const r = rect ?? (rect = cur.getBoundingClientRect());
        otgt[0] = r.width ? clamp(((e.clientX - r.left) / r.width) * 2 - 1) : 0;
        otgt[1] = r.height ? clamp(((e.clientY - r.top) / r.height) * 2 - 1) : 0;
        wake();
      }
    }
    // scene channel: holds its target while an object is under the pointer (no motion competition)
    if (seen.size === 0 || (cur && follow)) return;
    setMode("pointer");
    tgt[0] = clamp((e.clientX / win.innerWidth) * 2 - 1);
    tgt[1] = clamp((e.clientY / win.innerHeight) * 2 - 1);
    wake();
  };
  const onScroll = (e: { timeStamp?: number }) => {
    scrollUntil = (e.timeStamp ?? 0) + SCROLL_WINDOW;
    if (cur && follow) releaseObj();
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
    if (doc.visibilityState === "hidden") {
      stop();
      clearObj();
    }
  };

  const syncOrientation = () => {
    const on = attached && seen.size > 0 && wantsGyro();
    if (on === orienting) return;
    orienting = on;
    if (on) win.addEventListener("deviceorientation", onOrient, { passive: true });
    else win.removeEventListener("deviceorientation", onOrient);
  };

  /** The scroll listener exists only while objects are registered (it feeds the activation window). */
  const syncScroll = () => {
    const on = attached && objects.size > 0;
    if (on === scrolling) return;
    scrolling = on;
    if (on) win.addEventListener("scroll", onScroll, { passive: true });
    else win.removeEventListener("scroll", onScroll);
  };

  const attach = () => {
    if (attached) return;
    attached = true;
    if (fineMq.matches) win.addEventListener("pointermove", onPointer, { passive: true });
    doc.addEventListener("visibilitychange", onVisibility);
    io = new win.IntersectionObserver((entries) => {
      for (const { target, isIntersecting } of entries) {
        const el = target as HTMLElement;
        if (objects.has(el)) {
          if (isIntersecting) objSeen.add(el);
          else {
            objSeen.delete(el);
            if (cur === el) clearObj();
          }
          continue;
        }
        if (isIntersecting) {
          seen.add(el);
          if (mode) el.dataset.ppMode = mode;
          write(el);
        } else seen.delete(el);
      }
      if (seen.size === 0 && !cur) stop();
      else if (pos[0] !== tgt[0] || pos[1] !== tgt[1]) wake();
      syncOrientation();
    });
    roots.forEach((r) => io!.observe(r));
    objects.forEach((o) => io!.observe(o));
    syncScroll();
  };
  const detach = () => {
    if (!attached) return;
    attached = false;
    win.removeEventListener("pointermove", onPointer);
    doc.removeEventListener("visibilitychange", onVisibility);
    io?.disconnect();
    io = undefined;
    objSeen.clear();
    clearObj();
    syncScroll();
    syncOrientation();
    stop();
  };
  const rest = () => {
    pos[0] = pos[1] = vel[0] = vel[1] = tgt[0] = tgt[1] = lp[0] = lp[1] = 0;
    roots.forEach(write);
    seen.clear();
    clearObj();
  };
  const decide = () => {
    // objects need a fine pointer; scenes also run on touch (gyro) — so an objects-only page attaches nothing on a phone
    const want = roots.size > 0 || (objects.size > 0 && fineMq.matches);
    if (reducedMq.matches || !want) {
      const was = attached;
      detach();
      if (was && reducedMq.matches) rest();
    } else attach();
  };
  let watching = false;
  const watch = () => {
    if (watching) return;
    watching = true;
    reducedMq.addEventListener("change", decide);
  };
  const unwatch = () => {
    if (roots.size > 0 || objects.size > 0) return;
    watching = false;
    reducedMq.removeEventListener("change", decide);
  };

  return {
    /** Register a scene root; returns the unregister function. */
    register(root: HTMLElement): () => void {
      roots.add(root);
      watch();
      if (attached) io?.observe(root);
      decide();
      return () => {
        roots.delete(root);
        seen.delete(root);
        io?.unobserve(root);
        if (seen.size === 0 && !cur) stop();
        syncOrientation();
        unwatch();
        decide();
      };
    },
    /** Register an interactive object (`data-pm-obj`); returns the unregister function. See the header comment. */
    registerObject(el: HTMLElement): () => void {
      objects.add(el);
      lastTarget = lastCandidate = undefined;
      watch();
      if (attached) {
        io?.observe(el);
        syncScroll();
      }
      decide();
      return () => {
        objects.delete(el);
        objSeen.delete(el);
        lastTarget = lastCandidate = undefined;
        io?.unobserve(el);
        if (cur === el) clearObj();
        if (seen.size === 0 && !cur) stop();
        syncScroll();
        unwatch();
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
  registerObject: (el: HTMLElement) => get().registerObject(el),
  needsGyroPermission: () => get().needsGyroPermission(),
  requestGyro: () => get().requestGyro(),
};
