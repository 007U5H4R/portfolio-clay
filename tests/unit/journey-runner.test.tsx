/**
 * journey-runner.test.tsx (TKT-110) — the DOM state-machine driver under fake timers: order, the
 * one-card-at-a-time invariant, eligibility gating (mobile), skip-to-complete, and arming.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { armJourney, createJourneyRunner } from "@/components/motion/journey/runner";
import { buildJourneySteps, JOURNEY_TIMING, journeySchedule } from "@/components/motion/journey/timeline";
import { STAGE_ORDER } from "@/lib/stages";

function board() {
  const root = document.createElement("div");
  root.innerHTML =
    STAGE_ORDER.map((_, i) => `<div data-journey-stage="${i}"></div>`).join("") +
    `<svg>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path data-journey-segment="${i}"></path>`).join("")}</svg>`;
  const stages = Array.from(root.querySelectorAll<HTMLElement>("[data-journey-stage]"));
  const seg = (i: number) => root.querySelector(`[data-journey-segment="${i}"]`)!;
  return { root, stages, seg };
}

describe("journey runner", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("arms the pre-state: idle, every card rolled, timing vars on the root", () => {
    const { root, stages } = board();
    armJourney(root, stages);
    expect(root.dataset.journeyState).toBe("idle");
    expect(root.hasAttribute("data-journey-armed")).toBe(true);
    expect(stages.every((s) => s.dataset.roll === "rolled")).toBe(true);
    expect(root.style.getPropertyValue("--jr-roll-ms")).toBe("750ms");
  });

  it("plays the whole sequence in order, one card at a time, then completes and disarms", () => {
    const { root, stages, seg } = board();
    armJourney(root, stages);
    const log: string[] = [];
    const complete = vi.fn();
    const r = createJourneyRunner({ root, stages, steps: buildJourneySteps(STAGE_ORDER), onComplete: complete });
    // Sample every 50 ms: record each card's rolled → rolling transition in the order it happens.
    const seen = new Set<number>();
    const sample = () =>
      stages.forEach((s, i) => {
        if (s.dataset.roll === "rolling" && !seen.has(i)) {
          seen.add(i);
          log.push(`${i}:rolling`);
        }
      });
    STAGE_ORDER.forEach((_, i) => r.markEligible(i));
    expect(root.dataset.journeyState).toBe("backgroundReveal");

    vi.advanceTimersByTime(700);
    expect(root.dataset.journeyState).toBe("pathToProblem");
    expect(seg(0).getAttribute("data-draw")).toBe("drawing");
    expect(stages[0]!.dataset.roll).toBe("rolled");
    vi.advanceTimersByTime(300);
    expect(root.dataset.journeyState).toBe("problemReveal");
    expect(stages[0]!.dataset.roll).toBe("rolling");
    expect(stages[1]!.dataset.roll).toBe("rolled");

    // At every instant at most one card is rolling.
    for (let t = 0; t < 7000; t += 50) {
      vi.advanceTimersByTime(50);
      sample();
      expect(stages.filter((s) => s.dataset.roll === "rolling").length).toBeLessThanOrEqual(1);
    }
    vi.advanceTimersByTime(journeySchedule(STAGE_ORDER).totalMs);
    expect(root.dataset.journeyState).toBe("complete");
    expect(root.hasAttribute("data-journey-armed")).toBe(false);
    expect(seg(6).getAttribute("data-draw")).toBe("drawn");
    expect(complete).toHaveBeenCalledTimes(1);
    const rolling = log.map((l) => Number(l.split(":")[0]));
    expect(rolling).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("waits for a stage that is not yet eligible (mobile), then resumes in order", () => {
    const { root, stages } = board();
    armJourney(root, stages);
    const r = createJourneyRunner({ root, stages, steps: buildJourneySteps(STAGE_ORDER) });
    r.markEligible(0);
    vi.advanceTimersByTime(5000);
    expect(stages[0]!.dataset.roll).toBe("settled");
    expect(stages[1]!.dataset.roll).toBe("rolled");
    expect(root.dataset.journeyState).toBe("problemReveal");
    r.markEligible(1);
    expect(root.dataset.journeyState).toBe("pathToInsight");
    vi.advanceTimersByTime(JOURNEY_TIMING.pathLeadMs);
    expect(stages[1]!.dataset.roll).toBe("rolling");
  });

  it("never starts before stage 0 is eligible, and skip() completes at once", () => {
    const { root, stages } = board();
    armJourney(root, stages);
    const r = createJourneyRunner({ root, stages, steps: buildJourneySteps(STAGE_ORDER) });
    vi.advanceTimersByTime(10_000);
    expect(root.dataset.journeyState).toBe("idle");
    r.markEligible(0);
    vi.advanceTimersByTime(1200);
    r.skip();
    expect(root.dataset.journeyState).toBe("complete");
    expect(stages.every((s) => s.dataset.roll === "settled")).toBe(true);
    vi.advanceTimersByTime(10_000);
    expect(root.dataset.journeyState).toBe("complete");
  });
});
