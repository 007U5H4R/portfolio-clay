"use client";

import { useEffect, useRef } from "react";

/**
 * Reading-progress bar (Design.md §4.1 "Reading progress", §8 last row; TKT-71 restyle of S05.03).
 * A 3 px rust bar fixed at the header's bottom edge whose `transform: scaleX(var(--p))` tracks the
 * page-scroll fraction, mounted only by `/work/[slug]` (the long-form route). `aria-hidden`: it is a
 * position indicator duplicated by the scrollbar, not information — the TKT-11-era
 * `role="progressbar"` + throttled `aria-valuenow` went with it (a hidden element carries no role).
 *
 * Kept (not disabled) under reduced motion: a direct 1:1 mapping to scroll position, never an
 * autoplaying animation, so there is nothing to collapse (A6). The passive scroll listener writes
 * the `--p` custom property straight to the element — no React state, no `motion` (`useScroll`)
 * dependency in the shared chrome.
 */
export function ProgressBar() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    let frame = 0;
    const apply = () => {
      frame = 0;
      const doc = document.documentElement;
      const range = doc.scrollHeight - doc.clientHeight;
      const p = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
      bar.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} data-progress="" aria-hidden="true" className="reading-progress" />;
}
