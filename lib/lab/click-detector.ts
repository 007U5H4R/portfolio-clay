/**
 * The secret click detector (gummy-bear.md §9, S30, EVAL-030). Pure and dependency-free: it is the
 * only Gummy Lab logic that rides in the first-load set of every route, so it stays tiny.
 * `click(now)` → how many clicks of the sequence are live (the hint step, 1–5) and whether this
 * click completes five inside the window (first→fifth ≤ 3.5 s). A completed sequence resets.
 *
 * The window measures the visitor's clicking, not page loads: `rebase(now)` restarts the window at
 * `now` while keeping the clicks counted. The trigger calls it when the route change caused by the
 * sequence's own first click (inner page → home) commits, so a slow navigation cannot eat the 3.5 s.
 * The caller decides when a rebase is warranted; the detector does not second-guess it.
 */
export const CLICKS_NEEDED = 5;
export const CLICK_WINDOW_MS = 3500;

export interface ClickResult {
  /** Clicks of the live sequence including this one (1–5). Drives the progressive hints. */
  step: number;
  triggered: boolean;
}

export function createClickDetector(needed = CLICKS_NEEDED, windowMs = CLICK_WINDOW_MS) {
  let times: number[] = [];
  return {
    click(now: number): ClickResult {
      times.push(now);
      // Drop clicks that can no longer be part of a sequence ending now.
      while (times.length > 0 && now - times[0]! > windowMs) times.shift();
      if (times.length >= needed) {
        times = [];
        return { step: needed, triggered: true };
      }
      return { step: times.length, triggered: false };
    },
    /** Restart the window at `now` without losing the clicks counted so far. */
    rebase(now: number) {
      times = times.map(() => now);
    },
    reset() {
      times = [];
    },
  };
}
