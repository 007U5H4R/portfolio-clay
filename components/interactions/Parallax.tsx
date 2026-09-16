"use client";

import { useEffect, type ReactNode } from "react";
import { LazyMotion, domAnimation, m, useMotionValue, useSpring } from "motion/react";
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
 */
export function Parallax({ depth, maxPx, className, children }: ParallaxProps) {
  const pointerFine = usePointerFine();
  const reduced = useReducedMotionSafe();
  const active = pointerFine && !reduced;

  // Hooks are unconditional (rules of hooks); when inactive these springs simply never receive input.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springs.parallax);
  const springY = useSpring(y, springs.parallax);

  useEffect(() => {
    if (!active) return;
    const direction = Math.sign(depth) || 1;
    const onPointerMove = (event: PointerEvent) => {
      // Normalise pointer position to [-1, 1] around the viewport centre, scale to maxPx, apply direction.
      const nx = (event.clientX / window.innerWidth - 0.5) * 2;
      const ny = (event.clientY / window.innerHeight - 0.5) * 2;
      x.set(nx * maxPx * direction);
      y.set(ny * maxPx * direction);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [active, depth, maxPx, x, y]);

  if (!active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div className={className} style={{ x: springX, y: springY, willChange: "transform" }}>
        {children}
      </m.div>
    </LazyMotion>
  );
}
