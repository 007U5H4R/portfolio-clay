/**
 * Journey choreography timeline (TKT-110, Tushar's spec 2026-09-26 §6 / §19). Pure data + pure
 * functions — no DOM, no React — so the sequencing is unit-tested on its own and the DOM runner
 * (`runner.ts`) and the CSS (durations written as custom properties) read ONE set of numbers.
 *
 * Spec §6 timeline (seconds): 0.00 radial reveal · 0.70 path begins · 1.00 Problem rollout ·
 * 1.75 settles · 1.85 path → Insight · 2.10 Insight rollout · … · 6.50 Impact rollout · 7.25 settles ·
 * 7.40 final path / details settle. Expressed here as ordered steps with durations, which yields
 * exactly those instants (see `journeySchedule`) and lets a step wait (mobile: a stage that is not
 * yet near the viewport) without breaking the order.
 */

export interface JourneyTiming {
  /** Radial background reveal (CSS animation length). */
  radialMs: number;
  /** Radial reveal → first path segment (spec: the path starts at ~65–75 % of the reveal). */
  radialLeadMs: number;
  /** First path segment → Problem rollout. */
  firstPathLeadMs: number;
  /** Later path segments → their stage's rollout. */
  pathLeadMs: number;
  /** One path segment's draw (overlaps the start of its card's rollout — spec §3). */
  drawMs: number;
  /** One card's rollout incl. the recoil (spec §4–§5: unroll + 250–350 ms bounce). */
  rollMs: number;
  /** Settled card → next path segment. */
  holdMs: number;
  /** After the last card settles: the path tail + final settle (spec §20). */
  finalMs: number;
}

export const JOURNEY_TIMING: JourneyTiming = {
  radialMs: 1400,
  radialLeadMs: 700,
  firstPathLeadMs: 300,
  pathLeadMs: 250,
  drawMs: 450,
  rollMs: 750,
  holdMs: 100,
  finalMs: 350,
};

export type JourneyStepKind = "backgroundReveal" | "path" | "reveal" | "final";

export interface JourneyStep {
  /** Spec §19 state name, e.g. `pathToInsight`, `insightReveal`. */
  state: string;
  kind: JourneyStepKind;
  /** Stage index for `path` / `reveal` steps. */
  stage?: number;
  /** Time until the next step starts. */
  durationMs: number;
}

const cap = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

/** Spec §19 state names for a list of stage ids: idle → backgroundReveal → pathToX → xReveal → … → complete. */
export function journeyStates(ids: readonly string[]): string[] {
  return ["idle", "backgroundReveal", ...ids.flatMap((id) => [`pathTo${cap(id)}`, `${id}Reveal`]), "complete"];
}

/** The ordered steps (everything between `idle` and `complete`). */
export function buildJourneySteps(ids: readonly string[], t: JourneyTiming = JOURNEY_TIMING): JourneyStep[] {
  const steps: JourneyStep[] = [{ state: "backgroundReveal", kind: "backgroundReveal", durationMs: t.radialLeadMs }];
  ids.forEach((id, i) => {
    steps.push({ state: `pathTo${cap(id)}`, kind: "path", stage: i, durationMs: i === 0 ? t.firstPathLeadMs : t.pathLeadMs });
    steps.push({ state: `${id}Reveal`, kind: "reveal", stage: i, durationMs: t.rollMs + t.holdMs });
  });
  steps.push({ state: "finalSettle", kind: "final", durationMs: t.finalMs - t.holdMs });
  return steps;
}

export interface ScheduledStep extends JourneyStep {
  atMs: number;
}

/** Absolute start times when no step has to wait (the desktop case). */
export function journeySchedule(ids: readonly string[], t: JourneyTiming = JOURNEY_TIMING): { steps: ScheduledStep[]; totalMs: number } {
  let at = 0;
  const steps = buildJourneySteps(ids, t).map((s) => {
    const scheduled = { ...s, atMs: at };
    at += s.durationMs;
    return scheduled;
  });
  return { steps, totalMs: at };
}

/** The timing as CSS custom properties for the choreography root (CSS reads these, never its own numbers). */
export function timingVars(t: JourneyTiming = JOURNEY_TIMING): Record<string, string> {
  return {
    "--jr-radial-ms": `${t.radialMs}ms`,
    "--jr-draw-ms": `${t.drawMs}ms`,
    "--jr-roll-ms": `${t.rollMs}ms`,
  };
}
