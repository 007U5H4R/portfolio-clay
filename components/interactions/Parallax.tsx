"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useMotionValue, useSpring } from "motion/react";
import { springs, usePointerFine, useReducedMotionSafe } from "@/lib/motion";

export interface ParallaxProps {
  /** Depth factor. Sign sets direction (avatar uses -1 to move opposite the cursor); tiles use 0.5/1/1.5. */
  depth: number;
  /** Maximum pixel displacement in each axis (6 for the avatar, 6×depth for the tiles — §A6 / S05.01). */
  maxPx: number;
  className?: string | undefined;
  children?: ReactNode | undefined;
}

/**
 * Cursor-parallax leaf (technical-plan.md §A6 / S05.01). Translates its children by a
 * spring-smoothed offset derived from the pointer's position relative to the viewport centre.
 *
 * Active **only** when `usePointerFine() && !useReducedMotionSafe()` — on touch or under
 * reduced motion it renders its children unmoved and attaches **no** `pointermove` listener
 * (Design.md §4: parallax is desktop-cursor-only and fully collapses under reduced motion).
 * `useReducedMotionSafe` seeds `true` until mounted, so the first client frame is always static.
 *
 * TKT-49 perf lever: the spring-smoothed offset is applied to a plain `<div>`'s `transform` via a
 * ref + `MotionValue.on("change")` subscription, rather than an `m.div style={{ x, y }}`. `useSpring`
 * / `useMotionValue` are standalone hooks (driven by motion's own frameloop) and need no
 * `LazyMotion`/`domAnimation` feature bundle to render — so this leaf no longer pulls the ~28 kB gz
 * feature set onto `/` first-load JS (EVAL-005). The visible behaviour is identical: the same spring
 * config, the same `translate3d` output, the same `will-change:transform` hint.
 */
export function Parallax({ depth, maxPx, className, children }: ParallaxProps) {
  const pointerFine = usePointerFine();
  const reduced = useReducedMotionSafe();
  const active = pointerFine && !reduced;

  const ref = useRef<HTMLDivElement>(null);

  // Hooks are unconditional (rules of hooks); when inactive these springs simply never receive input.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springs.parallax);
  const springY = useSpring(y, springs.parallax);

  useEffect(() => {
    if (!active) return;
    const direction = Math.sign(depth) || 1;

    // Write the current spring values straight to the element's transform each frame the springs
    // change — this is what `m.div style={{ x, y }}` did internally, without the render feature.
    const apply = () => {
      const el = ref.current;
      if (el) el.style.transform = `translate3d(${springX.get()}px, ${springY.get()}px, 0)`;
    };
    const unsubX = springX.on("change", apply);
    const unsubY = springY.on("change", apply);
    // CR-009 (Stage 9): sync once on (re)activation. `apply` only ran on spring *change*, so when
    // `active` flipped false→true the freshly-mounted element sat untransformed while the springs
    // still held their last non-zero values — until the next pointermove snapped it into place.
    apply();

    const onPointerMove = (event: PointerEvent) => {
      // Normalise pointer position to [-1, 1] around the viewport centre, scale to maxPx, apply direction.
      const nx = (event.clientX / window.innerWidth - 0.5) * 2;
      const ny = (event.clientY / window.innerHeight - 0.5) * 2;
      x.set(nx * maxPx * direction);
      y.set(ny * maxPx * direction);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      unsubX();
      unsubY();
    };
  }, [active, depth, maxPx, x, y, springX, springY]);

  if (!active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
