/**
 * journey-timeline.test.ts (TKT-110) — the choreography timeline and path geometry as pure data:
 * the spec §6 instants, the spec §19 state names, and the path segments' count / routing.
 */
import { describe, expect, it } from "vitest";
import { buildJourneySteps, journeySchedule, journeyStates, JOURNEY_TIMING, timingVars } from "@/components/motion/journey/timeline";
import { journeyPathSegments } from "@/components/motion/journey/path-geometry";
import { STAGE_ORDER } from "@/lib/stages";

describe("journey timeline (spec §6 / §19)", () => {
  it("names every state of the spec §19 machine, in order", () => {
    expect(journeyStates(STAGE_ORDER)).toEqual([
      "idle", "backgroundReveal",
      "pathToProblem", "problemReveal", "pathToInsight", "insightReveal", "pathToBet", "betReveal",
      "pathToBuild", "buildReveal", "pathToEvaluate", "evaluateReveal", "pathToImpact", "impactReveal",
      "complete",
    ]);
  });

  it("hits Tushar's §6 instants: path 0.70, Problem 1.00, path → Insight 1.85, Insight 2.10 … Impact 6.50", () => {
    const { steps, totalMs } = journeySchedule(STAGE_ORDER);
    const at = (state: string) => steps.find((s) => s.state === state)!.atMs;
    expect(at("backgroundReveal")).toBe(0);
    expect(at("pathToProblem")).toBe(700);
    expect(at("problemReveal")).toBe(1000);
    expect(at("pathToInsight")).toBe(1850);
    expect(at("insightReveal")).toBe(2100);
    expect(at("betReveal")).toBe(3200);
    expect(at("buildReveal")).toBe(4300);
    expect(at("evaluateReveal")).toBe(5400);
    expect(at("pathToImpact")).toBe(6250);
    expect(at("impactReveal")).toBe(6500);
    // Impact settles at 7.25 s; the tail + final settle close the sequence inside 7–8 s.
    expect(at("impactReveal") + JOURNEY_TIMING.rollMs).toBe(7250);
    expect(totalMs).toBeGreaterThanOrEqual(7000);
    expect(totalMs).toBeLessThanOrEqual(8000);
  });

  it("is strictly sequential: each card's rollout starts only after the previous one has settled", () => {
    const { steps } = journeySchedule(STAGE_ORDER);
    const reveals = steps.filter((s) => s.kind === "reveal");
    for (let i = 1; i < reveals.length; i++) {
      expect(reveals[i]!.atMs).toBeGreaterThanOrEqual(reveals[i - 1]!.atMs + JOURNEY_TIMING.rollMs);
    }
    // each path segment starts before its card and its draw overlaps the start of the rollout
    for (const r of reveals) {
      const path = steps.find((s) => s.kind === "path" && s.stage === r.stage)!;
      expect(path.atMs).toBeLessThan(r.atMs);
      expect(path.atMs + JOURNEY_TIMING.drawMs).toBeGreaterThan(r.atMs);
    }
  });

  it("keeps the bounce in the spec's 250–350 ms window and feeds CSS from the same numbers", () => {
    // jr-unroll: the unroll ends at 60 % of the roll, the recoil fills the rest
    const recoil = JOURNEY_TIMING.rollMs * 0.4;
    expect(recoil).toBeGreaterThanOrEqual(250);
    expect(recoil).toBeLessThanOrEqual(350);
    expect(timingVars()).toEqual({ "--jr-radial-ms": "1400ms", "--jr-draw-ms": "450ms", "--jr-roll-ms": "750ms" });
    expect(buildJourneySteps(["a", "b"]).map((s) => s.state)).toEqual(["backgroundReveal", "pathToA", "aReveal", "pathToB", "bReveal", "finalSettle"]);
  });
});

describe("journey path geometry (spec §2 / §3)", () => {
  const pins = [0, 1, 2, 3, 4, 5].map((i) => ({ x: 100 + i * 200, y: i % 2 ? 34 : 62 }));
  const segs = journeyPathSegments(pins);
  const nums = (d: string) => d.match(/-?\d+(\.\d+)?/g)!.map(Number);

  it("has a lead-in, one join per consecutive pair and a tail (7 segments for 6 stages)", () => {
    expect(segs).toHaveLength(7);
  });

  it("arcs above the pin row (never down into the card text) and stops at each pin's rim", () => {
    for (let i = 1; i < 6; i++) {
      const [sx, sy, , c1y, , c2y, ex, ey] = nums(segs[i]!);
      const a = pins[i - 1]!;
      const b = pins[i]!;
      expect(Math.max(c1y!, c2y!)).toBeLessThan(Math.min(a.y, b.y));
      expect(Math.hypot(sx! - a.x, sy! - a.y)).toBeCloseTo(14, 0);
      expect(Math.hypot(ex! - b.x, ey! - b.y)).toBeCloseTo(14, 0);
    }
  });

  it("returns nothing without pins", () => {
    expect(journeyPathSegments([])).toEqual([]);
  });
});
