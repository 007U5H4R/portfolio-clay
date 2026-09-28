"use client";

import { useEffect, useRef } from "react";

/** The band headline's italic verbs, in cycle order (Tushar 2026-09-28, TASK-118). The first is the static one. */
export const BAND_VERBS = ["build", "ship", "design", "fix", "create", "rethink"] as const;

/**
 * TASK-118 — the italic verb in the band's "Let's *build*" headline (Design.md §8, §11). Screen readers
 * get one stable word ("build", sr-only); the six stacked verbs are `aria-hidden` and cycle through
 * pure CSS keyframes (`app/globals.css` TASK-118 block) once `data-cycle="run"` lands on the stack.
 *
 * One mount effect decides reduced motion **once** (the TP13 pattern — no media-query subscription):
 * under `prefers-reduced-motion: reduce` it returns and "build" stays static. Otherwise an
 * IntersectionObserver + `visibilitychange` set `data-cycle` to `run` only while the band is on screen
 * and the tab is visible, and to `paused` (animation-play-state) after that — nothing runs until the
 * band has been in view. No React state: the attribute is written straight to the node.
 */
export function BandVerb() {
  const stack = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = stack.current;
    if (!el || typeof window.matchMedia !== "function" || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let inView = false;
    const sync = () => {
      if (inView && document.visibilityState === "visible") el.dataset.cycle = "run";
      else if (el.dataset.cycle) el.dataset.cycle = "paused";
    };
    const io = new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <em className="band-verb">
      <span className="sr-only">{BAND_VERBS[0]}</span>
      <span ref={stack} className="band-verbs" aria-hidden="true">
        {BAND_VERBS.map((verb) => (
          <span key={verb} className="band-verbs-word">
            {verb}
          </span>
        ))}
      </span>
    </em>
  );
}
