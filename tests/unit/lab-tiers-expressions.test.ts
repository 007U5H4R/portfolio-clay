/** TASK-143.3/4 — device tiers, adaptive DPR, physics states and faces (§24, §38, §39, §43). */
import { describe, expect, it } from "vitest";
import { detectTier, nextDpr, tierConfig } from "@/lib/lab/tiers";
import { physicsState } from "@/lib/lab/gummy-state";
import { pickFace } from "@/lib/lab/expressions";
import { FACE_OPEN_CAP } from "@/lib/lab/jelly";

describe("detectTier", () => {
  it("phone → low, tablet → mid, desktop → high, weak desktop → mid", () => {
    expect(detectTier({ coarsePointer: true, shortSide: 390 })).toBe("low");
    expect(detectTier({ coarsePointer: true, shortSide: 820 })).toBe("mid");
    expect(detectTier({ coarsePointer: false, shortSide: 900 })).toBe("high");
    expect(detectTier({ coarsePointer: false, shortSide: 900, cores: 2 })).toBe("mid");
  });
  it("only the high tier uses transmission; lower tiers simplify the arena", () => {
    expect(tierConfig("high").transmission).toBe(true);
    expect(tierConfig("mid").transmission).toBe(false);
    expect(tierConfig("low").simplifiedArena).toBe(true);
  });
  it("reduced motion cuts particles hard but keeps some", () => {
    expect(tierConfig("high", true).particles).toBeLessThan(tierConfig("high").particles / 2);
    expect(tierConfig("low", true).particles).toBeGreaterThanOrEqual(8);
  });
});

describe("nextDpr", () => {
  it("drops on slow frames, recovers on fast ones, stays inside [min, max]", () => {
    expect(nextDpr(2, 30, 1, 2)).toBe(1.75);
    expect(nextDpr(1, 30, 1, 2)).toBe(1);
    expect(nextDpr(1.5, 8, 1, 2)).toBe(1.75);
    expect(nextDpr(2, 8, 1, 2)).toBe(2);
    expect(nextDpr(1.5, 18, 1, 2)).toBe(1.5);
  });
});

describe("physicsState", () => {
  const base = { dragged: false, squishing: false, inDanger: false, sinceBounce: Infinity, powered: false, grounded: false };
  it("follows the priority order", () => {
    expect(physicsState(base)).toBe("AIRBORNE");
    expect(physicsState({ ...base, grounded: true })).toBe("GROUND");
    expect(physicsState({ ...base, powered: true })).toBe("POWERED");
    expect(physicsState({ ...base, powered: true, sinceBounce: 0.1 })).toBe("BOUNCING");
    expect(physicsState({ ...base, inDanger: true, sinceBounce: 0.1 })).toBe("DANGER");
    expect(physicsState({ ...base, inDanger: true, squishing: true })).toBe("SQUISHED");
    expect(physicsState({ ...base, inDanger: true, squishing: true, dragged: true })).toBe("DRAGGED");
  });
});

describe("pickFace", () => {
  const calm = { state: "GROUND" as const, speed: 0, fallTime: 0, urgency: 0, combo: 1, powered: false, gameOver: false };
  it("is happy by default and worried in danger", () => {
    expect(pickFace(calm).Happy).toBeGreaterThan(0.5);
    const danger = pickFace({ ...calm, state: "DANGER", urgency: 0.2 });
    expect(danger.Worried).toBeGreaterThan(danger.Happy);
  });
  it("is surprised at speed and on a long fall", () => {
    expect(pickFace({ ...calm, state: "AIRBORNE", speed: 18 }).Surprised).toBeGreaterThan(0.3);
    expect(pickFace({ ...calm, state: "AIRBORNE", fallTime: 2 }).Surprised).toBeGreaterThan(0.3);
  });
  it("never opens the mouth past the runtime cap", () => {
    for (const speed of [0, 10, 30, 200]) {
      for (const urgency of [0, 0.5, 1]) {
        for (const state of ["AIRBORNE", "DANGER", "DRAGGED"] as const) {
          const f = pickFace({ ...calm, state, speed, urgency, fallTime: 9 });
          expect(f.Surprised).toBeLessThanOrEqual(FACE_OPEN_CAP);
          expect(f.Panic).toBeLessThanOrEqual(FACE_OPEN_CAP);
        }
      }
    }
  });
  it("celebrates a hot combo and is dizzy-but-adorable at game over", () => {
    expect(pickFace({ ...calm, combo: 6 }).Happy).toBe(1);
    const over = pickFace({ ...calm, gameOver: true });
    expect(over.Panic).toBe(0);
    expect(over.Worried).toBeGreaterThan(0);
  });
});
