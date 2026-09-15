"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A6 motion constants (technical-plan.md §A6, decision TP6) — the single source of truth for
 * every spring/duration/easing used by `m.*` layout animations and CSS transitions across the
 * app. `easings` MUST stay byte-identical to the `--ease-*` custom properties in
 * `app/globals.css` (EXE-3 sync requirement) — a change to one without the other is a bug.
 */
export const springs = {
  parallax: { stiffness: 120, damping: 20, mass: 1 },
  filter: { stiffness: 260, damping: 28 },
  askExpand: { stiffness: 210, damping: 26 },
  story: { stiffness: 240, damping: 30 },
} as const;

export const durations = {
  hover: 200,
  press: 90,
  lift: 180,
  reveal: 500,
  header: 250,
  panel: 320,
  node: 220,
} as const;

/** Kept identical to `--ease-hover/-reveal/-panel/-vt` in `app/globals.css` — never diverge. */
export const easings = {
  reveal: "cubic-bezier(.2,.7,.2,1)",
  hover: "cubic-bezier(0.23,1,0.32,1)",
  panel: "cubic-bezier(0.32,0.72,0,1)",
  vt: "cubic-bezier(.77,0,.175,1)",
} as const;

/**
 * Subscribes to a `matchMedia` query as a React 18 external store: `getSnapshot` reads the live
 * value, `getServerSnapshot` is the SSR/pre-hydration fallback. `useSyncExternalStore` renders
 * with `getServerSnapshot` on the very first client render (matching the server-rendered HTML),
 * then re-renders with the real `getSnapshot` value once mounted — exactly the "unknown until
 * mounted" behaviour A6 asks for, with no manual `setState`-in-effect (avoids
 * `react-hooks/set-state-in-effect`).
 */
function subscribeMediaQuery(query: string) {
  return (onChange: () => void) => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
    const mql = window.matchMedia(query);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  };
}

function readMediaQuery(query: string, fallback: boolean): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return fallback;
  return window.matchMedia(query).matches;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = subscribeMediaQuery(REDUCED_MOTION_QUERY);
const getReducedMotionSnapshot = () => readMediaQuery(REDUCED_MOTION_QUERY, true);
const getReducedMotionServerSnapshot = () => true;

/**
 * SSR-safe reduced-motion flag. The real preference is unknowable on the server and during the
 * very first client render (no `window` yet on the server; hydration must match that markup),
 * so the hook always starts `true` — nothing animates before we know for certain it's safe to —
 * then swaps to the live `matchMedia` result once mounted and tracks OS changes thereafter (A6).
 *
 * Deviation from the technical-plan's literal "wraps motion's `useReducedMotion`" wording:
 * `motion/react`'s `useReducedMotion` reads `matchMedia` synchronously on first render (not
 * deferred) and never re-subscribes to the OS `change` event, so it cannot provide the
 * "true-until-mounted" SSR safety or the live-update behaviour this contract requires. This
 * hook implements the same intent directly against `matchMedia` instead of composing that hook.
 */
export function useReducedMotionSafe(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);
}

const POINTER_FINE_QUERY = "(hover: hover) and (pointer: fine)";
const subscribePointerFine = subscribeMediaQuery(POINTER_FINE_QUERY);
const getPointerFineSnapshot = () => readMediaQuery(POINTER_FINE_QUERY, false);
const getPointerFineServerSnapshot = () => false;

/** True only for a mouse/trackpad-class pointer (Design.md §4 — parallax/tilt are desktop-only). */
export function usePointerFine(): boolean {
  return useSyncExternalStore(subscribePointerFine, getPointerFineSnapshot, getPointerFineServerSnapshot);
}

/**
 * View-Transition export — intentionally ABSENT (decision EXE-5). A5 planned a single
 * `export { unstable_ViewTransition as ViewTransition } from "react"` here so a shared-element
 * morph had one re-export point. The S06.01 breaker confirmed stable React 19.2.8 (pinned) ships
 * no such export and no `react/experimental` entry, so there is nothing to re-export. TSK-06 took
 * the A14 row-1 fallback: `ViewTransitionLink` wraps plain `next/link` and the morph is driven by
 * CSS `view-transition-name` hooks + the `globals.css` VT rules (a browser-native progressive
 * enhancement), with no React-orchestrated transition. If a stable React VT component later ships,
 * re-introduce the re-export here and swap `ViewTransitionLink`'s fallback for it in one place.
 */

/**
 * True once the page has scrolled past `threshold` px — drives `Header`'s rest→compact state
 * (S04.03). Passive scroll listener + rAF-throttled so it never blocks the scroll thread; the
 * rAF callback only notifies the store (`onChange`) — React itself re-reads `getSnapshot`.
 */
export function useScrollY(threshold: number): boolean {
  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.scrollY > threshold;
  }, [threshold]);

  const getServerSnapshot = useCallback(() => false, []);

  const subscribe = useCallback((onChange: () => void) => {
    if (typeof window === "undefined") return () => {};
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        onChange();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
