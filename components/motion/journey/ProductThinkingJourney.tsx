"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { buildJourneySteps, JOURNEY_TIMING } from "./timeline";
import { armJourney, completeJourney, createJourneyRunner, type JourneyRunner } from "./runner";

export interface ProductThinkingJourneyProps {
  /** Stage ids in story order — names the spec §19 states (`pathToInsight`, `insightReveal`, …). */
  stageIds: readonly string[];
  className?: string | undefined;
  children: ReactNode;
}

/** Visible fraction of a stage that counts as "meaningfully visible" (spec §13: ~25–35 %). */
const TRIGGER = 0.3;

/**
 * Spec §1 reveals from the board's exact centre. On a board much taller than the screen (the stacked
 * tablet / mobile columns) that centre is off-screen, so the circle starts from the middle of what
 * the reader is actually looking at instead (spec §16: don't force desktop geometry).
 */
function centreRadialOnViewport(root: HTMLElement) {
  const rect = root.getBoundingClientRect();
  if (rect.height <= window.innerHeight * 1.5) return;
  const oy = Math.min(100, Math.max(0, ((window.innerHeight / 2 - rect.top) / rect.height) * 100));
  root.style.setProperty("--jr-oy", `${oy.toFixed(1)}%`);
}

// Once per page load (spec §13): a client-side return to `/` never replays the sequence.
let played = false;

/**
 * The choreography root (TKT-110, spec §18): wraps the server-rendered board and drives the
 * paper-unrolling sequence over it through `runner.ts`. Renders one `<div data-journey>`; everything
 * else is data attributes + CSS (`app/globals.css` TKT-110 block), so the cards stay server-rendered.
 *
 * Safety rails (A11Y-1, CLS, no-JS):
 *   - SSR / no-JS: no pre-state attribute is ever in the HTML → the final composition renders.
 *   - After hydration the pre-state is armed ONLY if motion is allowed and the whole board is still
 *     below the fold; otherwise it is marked `complete` at once (nothing that was visible hides).
 *   - Pre-state hides with clip-path / opacity only — content stays in the accessibility tree and
 *     focusable; any focus entering the board before the end skips straight to `complete`.
 *   - Never touches scrolling; the sequence runs on its own once triggered.
 */
export function ProductThinkingJourney({ stageIds, className, children }: ProductThinkingJourneyProps) {
  const ref = useRef<HTMLDivElement>(null);
  const runner = useRef<JourneyRunner | null>(null);
  const ids = stageIds.join(",");

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const stages = Array.from(root.querySelectorAll<HTMLElement>("[data-journey-stage]"));
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const belowFold = root.getBoundingClientRect().top >= window.innerHeight;
    if (played || reduce || !belowFold || typeof IntersectionObserver !== "function") {
      completeJourney(root, stages);
      return undefined;
    }

    armJourney(root, stages, JOURNEY_TIMING);
    const r = createJourneyRunner({
      root,
      stages,
      steps: buildJourneySteps(ids.split(",")),
      timing: JOURNEY_TIMING,
      onComplete: () => {
        played = true;
      },
    });
    runner.current = r;

    // One observer per stage: in view (≥ 30 %) or already scrolled past → eligible. On desktop the
    // six sit side by side, so they all qualify together and the timeline plays straight through.
    // It watches each stage's PARENT box: Chromium measures a target after its own clip-path, and a
    // rolled card is clipped to its top ~28 px, so it would never read as 30 % visible.
    const targets = stages.map((el) => el.parentElement ?? el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = targets.indexOf(e.target as HTMLElement);
          const past = e.boundingClientRect.bottom < (e.rootBounds?.top ?? 0);
          if (i >= 0 && (e.intersectionRatio >= TRIGGER || past)) {
            if (root.dataset.journeyState === "idle") centreRadialOnViewport(root);
            // A stage counts only once every earlier one does (a fast scroll past several cards).
            for (let k = 0; k <= i; k++) r.markEligible(k);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: [0, TRIGGER] },
    );
    targets.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      r.destroy();
      runner.current = null;
      // Unmounted mid-sequence: leave the DOM in its final state, not half-rolled.
      if (root.dataset.journeyState !== "complete") completeJourney(root, stages);
    };
  }, [ids]);

  return (
    <div
      ref={ref}
      data-journey=""
      className={className}
      onFocus={() => {
        // Keyboard users never land on a rolled-up card: focus anywhere in the board finishes it.
        runner.current?.skip();
      }}
    >
      {children}
    </div>
  );
}
