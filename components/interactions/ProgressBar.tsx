"use client";

import { useRef, useState } from "react";
import { m, useMotionValueEvent, useScroll } from "motion/react";
import { LazyMotionRoot } from "@/lib/motion";

/** aria-valuenow update ceiling (technical-plan.md §B S05.03: "updated at most 4×/s"). */
const ARIA_UPDATE_INTERVAL_MS = 250;

/**
 * Reading-progress bar (technical-plan.md §B S05.03, Design.md §4). A 3px bar whose `scaleX`
 * tracks page-scroll position via `motion`'s `useScroll`. Not mounted by this ticket — TSK-18
 * (case-study shell, M-003) wires it into `/work/[slug]`.
 *
 * Kept (not disabled) under reduced motion: it is a direct 1:1 mapping to scroll position, never
 * an autoplaying animation, so there is nothing to collapse (A6). `aria-valuenow` is throttled to
 * at most 4 updates/second via a `useMotionValueEvent` listener so screen-reader polling doesn't
 * thrash on every scroll pixel.
 */
export function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const [valueNow, setValueNow] = useState(0);
  const lastUpdateRef = useRef(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < ARIA_UPDATE_INTERVAL_MS) return;
    lastUpdateRef.current = now;
    setValueNow(Math.round(latest * 100));
  });

  return (
    <LazyMotionRoot>
      <m.div
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={valueNow}
        className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-accent"
        style={{ scaleX: scrollYProgress }}
      />
    </LazyMotionRoot>
  );
}
