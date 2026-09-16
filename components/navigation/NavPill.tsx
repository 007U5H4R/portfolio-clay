"use client";

import { LazyMotion, domAnimation, m } from "motion/react";
import { useReducedMotionSafe } from "@/lib/motion";

/**
 * Lavender utility-fill pill absolutely positioned behind the active nav link (Design.md §3,
 * technical-plan.md §B S04.04). Only ever one instance is mounted at a time (`Header` renders
 * it inside whichever link matches the current route); the shared `layoutId` is what makes it
 * slide to the new position when the active link changes, instead of popping.
 *
 * `aria-current="page"` lives on the `<Link>` itself (`Header.tsx`), never here — this element
 * is purely decorative background, so it stays `aria-hidden`.
 */
export function NavPill() {
  const reducedMotion = useReducedMotionSafe();
  const motionProps = reducedMotion
    ? ({ layout: false as const, transition: { duration: 0 } })
    : ({ layout: "position" as const });

  return (
    <LazyMotion features={domAnimation} strict>
      <m.span
        layoutId="nav-pill"
        {...motionProps}
        aria-hidden="true"
        className="absolute inset-0 rounded-[var(--radius-pill)] bg-lavender/30"
      />
    </LazyMotion>
  );
}
