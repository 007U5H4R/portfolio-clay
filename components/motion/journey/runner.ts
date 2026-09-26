import { JOURNEY_TIMING, timingVars, type JourneyStep, type JourneyTiming } from "./timeline";

/**
 * Journey state-machine driver (TKT-110, spec §6 / §19). Walks the `buildJourneySteps` list strictly
 * in order over the DOM — it never renders, it only flips data attributes the CSS keys off:
 *
 *   root                    `data-journey-state` = the current spec §19 state (`idle` … `complete`)
 *                           `data-journey-armed` while the pre-state is in force (removed at `complete`)
 *   `[data-journey-stage]`  `data-roll` = rolled → rolling → settled
 *   `[data-journey-segment]` `data-draw` = drawing → drawn (absent = not yet drawn)
 *
 * Sequencing: a step that belongs to a stage waits until that stage is *eligible* (the caller's
 * IntersectionObserver says it is ≥ 30 % visible or already scrolled past) — so on a tall mobile
 * column each card rolls as the reader reaches it, and card n + 1 can never start before card n
 * has settled (the chain is one `setTimeout` after another; there is no parallel stagger).
 * `skip()` jumps straight to `complete` (keyboard focus, unmount). Nothing here touches scrolling.
 */

export interface JourneyRunner {
  /** Mark stage `i` as near/in the viewport; resumes the chain if it is waiting on it. */
  markEligible(i: number): void;
  /** Jump to `complete` now: every card settled, every segment drawn, pre-state removed. */
  skip(): void;
  /** Cancel pending timers without changing the DOM (unmount). */
  destroy(): void;
  readonly state: string;
}

export interface JourneyRunnerOptions {
  root: HTMLElement;
  /** The `[data-journey-stage]` elements, in story order. */
  stages: readonly HTMLElement[];
  steps: readonly JourneyStep[];
  timing?: JourneyTiming;
  onComplete?: () => void;
}

const segments = (root: HTMLElement, i: number) => root.querySelectorAll<Element>(`[data-journey-segment="${i}"]`);

/** Apply the pre-state (only ever called after hydration, and only when the board is below the fold). */
export function armJourney(root: HTMLElement, stages: readonly HTMLElement[], timing: JourneyTiming = JOURNEY_TIMING) {
  for (const [name, value] of Object.entries(timingVars(timing))) root.style.setProperty(name, value);
  root.dataset.journeyState = "idle";
  root.setAttribute("data-journey-armed", "");
  for (const el of stages) el.dataset.roll = "rolled";
}

/** Final state with no motion (reduced motion, already on screen, skip, completion). */
export function completeJourney(root: HTMLElement, stages: readonly HTMLElement[]) {
  root.dataset.journeyState = "complete";
  root.removeAttribute("data-journey-armed");
  for (const el of stages) el.dataset.roll = "settled";
  root.querySelectorAll<Element>("[data-journey-segment]").forEach((el) => el.setAttribute("data-draw", "drawn"));
}

export function createJourneyRunner({ root, stages, steps, timing = JOURNEY_TIMING, onComplete }: JourneyRunnerOptions): JourneyRunner {
  const eligible = stages.map(() => false);
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let next = 0; // index of the next step to run
  let waiting = false;
  let done = false;

  const later = (fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  const clear = () => {
    timers.forEach(clearTimeout);
    timers.clear();
  };

  const finish = () => {
    if (done) return;
    done = true;
    clear();
    completeJourney(root, stages);
    onComplete?.();
  };

  /** The background reveal waits on stage 0; path / reveal steps wait on their own stage. */
  const gate = (step: JourneyStep) => (step.kind === "backgroundReveal" ? 0 : step.stage);

  const run = () => {
    if (done) return;
    const step = steps[next];
    if (!step) return finish();
    const g = gate(step);
    if (g !== undefined && !eligible[g]) {
      waiting = true;
      return;
    }
    waiting = false;
    root.dataset.journeyState = step.state;
    if (step.kind === "path" || step.kind === "final") {
      const seg = step.kind === "final" ? stages.length : step.stage!;
      segments(root, seg).forEach((el) => el.setAttribute("data-draw", "drawing"));
      later(() => segments(root, seg).forEach((el) => el.setAttribute("data-draw", "drawn")), timing.drawMs);
    } else if (step.kind === "reveal") {
      const el = stages[step.stage!];
      if (el) {
        el.dataset.roll = "rolling";
        later(() => {
          el.dataset.roll = "settled";
        }, timing.rollMs);
      }
    }
    next += 1;
    later(run, step.durationMs);
  };

  return {
    markEligible(i) {
      if (done || eligible[i]) return;
      eligible[i] = true;
      if (waiting || next === 0) run();
    },
    skip: finish,
    destroy() {
      done = true;
      clear();
    },
    get state() {
      return root.dataset.journeyState ?? "idle";
    },
  };
}
