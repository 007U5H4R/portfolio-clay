"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useMotionValue, useSpring, type MotionValue } from "motion/react";
import { springs, usePointerFine, useReducedMotionSafe } from "@/lib/motion";

/**
 * Cursor-parallax foundation for the hero avatar scene (animation prompt.md §2).
 *
 * `usePointerParallax` tracks the pointer's position **normalised from the centre of the hero card**
 * to `[-1, 1]` on each axis and exposes it as two spring-smoothed `MotionValue`s (`nx`, `ny`). Each
 * visual layer then scales those normalised values by its own depth (via `useParallaxLayer` below),
 * so one pointer source drives frame / avatar / icon tiles at different magnitudes — the depth cue.
 *
 * Active **only** on a fine pointer with motion allowed (`usePointerFine() && !useReducedMotionSafe()`):
 * on touch or under `prefers-reduced-motion` it attaches no listeners and the motion values stay 0,
 * so every consumer renders unmoved (Design.md §4 — parallax/tilt are desktop-cursor-only).
 * `useReducedMotionSafe` seeds `true` until mounted, so the first client frame is always static.
 *
 * Perf: like `components/interactions/Parallax.tsx` (the TKT-49 lever), this uses standalone
 * `useMotionValue` / `useSpring` (driven by motion's own frameloop) and lets consumers write the
 * `transform` straight to a DOM node — it needs NO `LazyMotion`/`domAnimation` feature bundle, so it
 * adds nothing to `/` first-load JS beyond the motion primitives Parallax already pulls (EVAL-005).
 */
export interface PointerParallax {
  /** Attach to the hero card — the element the pointer position is measured relative to. */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Spring-smoothed, centre-normalised pointer offset in [-1, 1]. */
  nx: MotionValue<number>;
  ny: MotionValue<number>;
  /** True only when parallax is live (fine pointer + motion allowed). */
  active: boolean;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function usePointerParallax(): PointerParallax {
  const pointerFine = usePointerFine();
  const reduced = useReducedMotionSafe();
  const active = pointerFine && !reduced;

  const containerRef = useRef<HTMLDivElement>(null);

  // Raw target (set by the pointer) → spring (what layers read). Hooks are unconditional; when
  // inactive the springs simply never receive input and rest at 0.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const nx = useSpring(rawX, springs.parallax);
  const ny = useSpring(rawY, springs.parallax);

  useEffect(() => {
    if (!active) return;
    const el = containerRef.current;
    if (!el) return;

    const onPointerMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;
      if (halfW === 0 || halfH === 0) return;
      // Offset from the card centre, normalised to [-1, 1] and clamped so a cursor far from the
      // card can never push the layers past their tasteful maximum.
      rawX.set(clamp((event.clientX - (rect.left + halfW)) / halfW, -1, 1));
      rawY.set(clamp((event.clientY - (rect.top + halfH)) / halfH, -1, 1));
    };
    // Spring back to rest whenever the pointer leaves the document.
    const onPointerLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [active, rawX, rawY]);

  return { containerRef, nx, ny, active };
}

/**
 * Binds one layer's `transform` to the shared pointer springs (the ref-write pattern from
 * `Parallax.tsx` — no `domAnimation` bundle). `writer` maps the normalised `(x, y)` to a full CSS
 * `transform` string, so each layer decides its own depth, tilt and translate composition.
 *
 * When inactive the layer's inline transform is cleared, letting the element fall back to its CSS
 * (entrance / breathing / lean) with no leftover parallax offset. `writer` MUST be stable
 * (wrap it in `useCallback`) so the subscription is not town down and rebuilt every render.
 */
export function useParallaxLayer(
  ref: RefObject<HTMLElement | null>,
  nx: MotionValue<number>,
  ny: MotionValue<number>,
  active: boolean,
  writer: (x: number, y: number) => string,
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!active) {
      el.style.transform = "";
      return;
    }
    const apply = () => {
      el.style.transform = writer(nx.get(), ny.get());
    };
    const unsubX = nx.on("change", apply);
    const unsubY = ny.on("change", apply);
    apply(); // sync once on (re)activation (CR-009 pattern: don't wait for the next pointermove)
    return () => {
      unsubX();
      unsubY();
    };
  }, [ref, nx, ny, active, writer]);
}
