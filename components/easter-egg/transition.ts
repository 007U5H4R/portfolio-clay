import "./transition.css";

/**
 * Gummy Lab entry / exit transitions (TASK-143.2, gummy-bear.md §9–11, §36–37). Imperative and
 * dependency-free on purpose: one overlay element on <body> that survives the route change, so the
 * portfolio visibly transforms into the lab and back (never a bare `location.href`). Lazily imported:
 * `SecretTrigger` fetches it at click 2, the lab route imports it for the exit. It sits in the
 * `/lab` chunk set plus a tiny shared lazy chunk — it contains no three.js.
 *
 *   playEntry   click 5: the name turns to gummy lettering, stretches and melts, a peach wash opens
 *               from the name and covers the page; then `navigate()` runs under the wash.
 *   playExit    the lab's exit: a candy vortex spirals in, the TP monogram appears and flies to the
 *               header's monogram, the screen brightens, then `navigate()`.
 *   settleOverlay  the destination calls this once it has painted; the overlay fades and is removed.
 * Reduced motion collapses all of it to a short cross-fade (§40). A watchdog removes the overlay if
 * the destination never settles it, so the visitor is never stuck behind it.
 */

const OVERLAY_SELECTOR = "[data-gummy-overlay]";
const WATCHDOG_MS = 6000;
const SVG_NS = "http://www.w3.org/2000/svg";
/** The same four strokes as `components/navigation/Monogram.tsx` (decorative copy for the flight). */
const TP_STROKES: { d: string; w: string }[] = [
  { d: "M6 9 C 14 7, 22 8, 30 7", w: "2.4" },
  { d: "M17 8 C 15 16, 13 24, 12 33", w: "2.4" },
  { d: "M23 12 C 24 20, 22 27, 21 33", w: "2.2" },
  { d: "M23 12 C 30 10, 35 13, 34 18 C 33 23, 27 24, 22 22", w: "2.2" },
];

let timers: number[] = [];
let busy = false;

function later(fn: () => void, ms: number) {
  timers.push(window.setTimeout(fn, ms));
}

export function hasOverlay(): boolean {
  return typeof document !== "undefined" && document.querySelector(OVERLAY_SELECTOR) !== null;
}

function makeOverlay(mode: "entry" | "exit"): HTMLElement {
  document.querySelector(OVERLAY_SELECTOR)?.remove();
  const el = document.createElement("div");
  el.dataset.gummyOverlay = mode;
  el.setAttribute("aria-hidden", "true");
  document.body.append(el);
  later(() => settleOverlay(), WATCHDOG_MS);
  return el;
}

/** Click 3/4 hint extras: a few translucent droplets next to the brand (1–2 at click 3, more at 4). */
export function spawnDroplets(origin: Element, count: number) {
  const r = origin.getBoundingClientRect();
  for (let i = 0; i < count; i += 1) {
    const d = document.createElement("span");
    d.className = "gl-drop";
    d.style.left = `${r.left + 10 + Math.random() * Math.max(20, r.width - 20)}px`;
    d.style.top = `${r.top + r.height * 0.6}px`;
    d.style.setProperty("--dx", `${(Math.random() - 0.5) * 36}px`);
    d.style.setProperty("--dy", `${22 + Math.random() * 26}px`);
    d.setAttribute("aria-hidden", "true");
    document.body.append(d);
    d.addEventListener("animationend", () => d.remove(), { once: true });
    later(() => d.remove(), 1500);
  }
}

export interface EntryOptions {
  /** The header name element (its text becomes the gummy lettering). */
  nameEl: Element | null;
  reducedMotion: boolean;
  /** Runs under the opened wash (the route change). */
  navigate: () => void;
}

export function playEntry({ nameEl, reducedMotion, navigate }: EntryOptions) {
  if (busy) return;
  busy = true;
  const overlay = makeOverlay("entry");
  const wash = document.createElement("div");
  wash.className = "gt-wash";
  overlay.append(wash);

  if (!reducedMotion && nameEl) {
    const r = nameEl.getBoundingClientRect();
    wash.style.setProperty("--gt-x", `${r.left + r.width / 2}px`);
    wash.style.setProperty("--gt-y", `${r.top + r.height / 2}px`);
    const name = document.createElement("div");
    name.className = "gt-name";
    name.style.left = `${r.left}px`;
    name.style.top = `${r.top}px`;
    name.style.setProperty("--gt-s", "5");
    name.style.setProperty("--gt-dx", `${window.innerWidth / 2 - r.left - r.width * 2.5}px`);
    name.style.setProperty("--gt-dy", `${window.innerHeight * 0.4 - r.top}px`);
    Array.from(nameEl.textContent ?? "").forEach((ch, i) => {
      const s = document.createElement("span");
      s.style.setProperty("--i", String(i));
      s.textContent = ch === " " ? " " : ch;
      name.append(s);
    });
    overlay.append(name);
  }
  later(() => {
    navigate();
    busy = false;
  }, reducedMotion ? 200 : 780);
}

export interface ExitOptions {
  /** The header monogram's rect, if it is laid out (the TP flies there). */
  targetRect: DOMRect | null;
  reducedMotion: boolean;
  navigate: () => void;
}

export function playExit({ targetRect, reducedMotion, navigate }: ExitOptions) {
  if (busy) return;
  busy = true;
  const overlay = makeOverlay("exit");
  const wash = document.createElement("div");
  wash.className = "gt-wash";
  const bright = document.createElement("div");
  bright.className = "gt-bright";
  if (reducedMotion) {
    overlay.append(wash, bright);
    bright.dataset.play = "";
    later(() => {
      navigate();
      busy = false;
    }, 220);
    return;
  }
  const vortex = document.createElement("div");
  vortex.className = "gt-vortex";
  const tp = document.createElementNS(SVG_NS, "svg");
  tp.setAttribute("class", "gt-tp");
  tp.setAttribute("viewBox", "0 0 40 40");
  tp.setAttribute("aria-hidden", "true");
  for (const s of TP_STROKES) {
    const p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", s.d);
    p.setAttribute("stroke-width", s.w);
    tp.append(p);
  }
  const cx = window.innerWidth / 2 - 20;
  const cy = window.innerHeight / 2 - 20;
  const tx = targetRect ? targetRect.left + targetRect.width / 2 - 20 : 40;
  const ty = targetRect ? targetRect.top + targetRect.height / 2 - 20 : 40;
  tp.style.setProperty("--gt-x0", `${cx}px`);
  tp.style.setProperty("--gt-y0", `${cy}px`);
  tp.style.setProperty("--gt-x1", `${tx}px`);
  tp.style.setProperty("--gt-y1", `${ty}px`);
  overlay.append(wash, vortex, tp, bright);
  later(() => (tp.dataset.play = ""), 520);
  later(() => (bright.dataset.play = ""), 1050);
  later(() => {
    navigate();
    busy = false;
  }, 1400);
}

/** The destination has painted: fade the overlay out and drop it. Safe to call when none exists. */
export function settleOverlay() {
  const overlay = document.querySelector<HTMLElement>(OVERLAY_SELECTOR);
  if (!overlay) return;
  busy = false;
  overlay.dataset.settling = "";
  later(() => overlay.remove(), 700);
}

/** Test/teardown helper: cancel every pending timer and drop the overlay immediately. */
export function resetTransitions() {
  timers.forEach((t) => window.clearTimeout(t));
  timers = [];
  busy = false;
  document.querySelector(OVERLAY_SELECTOR)?.remove();
}
