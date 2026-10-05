/** TASK-143.3 — jelly deformation: impact → overshoot → oscillation → damping → rest (gummy-bear.md §14). */
import { describe, expect, it } from "vitest";
import { Jelly, MORPH_NAMES, emptyWeights } from "@/lib/lab/jelly";

function run(j: Jelly, seconds: number, dt = 1 / 60) {
  const trace: number[] = [];
  for (let t = 0; t < seconds; t += dt) {
    j.step(dt);
    trace.push(j.weights().SquishVertical - j.weights().StretchVertical);
  }
  return trace;
}

describe("Jelly", () => {
  it("is at rest with neutral weights before any impact", () => {
    const j = new Jelly();
    expect(j.resting).toBe(true);
    expect(j.weights()).toEqual(emptyWeights());
  });

  it("a hard landing squashes first, overshoots to a stretch, then settles", () => {
    const j = new Jelly();
    j.impact(0, -1, 18);
    const trace = run(j, 2.5);
    expect(Math.max(...trace)).toBeGreaterThan(0.1); // compression
    expect(Math.min(...trace)).toBeLessThan(-0.01); // overshoot
    expect(Math.abs(trace.at(-1)!)).toBeLessThan(0.02); // damped
    expect(trace.indexOf(Math.max(...trace))).toBeLessThan(trace.findIndex((v) => v < -0.01));
  });

  it("returns fully to rest after enough time", () => {
    const j = new Jelly();
    j.impact(0.7, -0.7, 20);
    run(j, 6);
    expect(j.resting).toBe(true);
  });

  it("ears keep moving after the body has stopped (follow-through)", () => {
    const j = new Jelly();
    j.impact(0, -1, 20);
    let bodyDoneAt = -1;
    let earsStillAt = -1;
    for (let i = 0; i < 360; i += 1) {
      j.step(1 / 60);
      const w = j.weights();
      if (bodyDoneAt < 0 && w.SquishVertical + w.StretchVertical < 0.01) bodyDoneAt = i;
      if (w.EarBounceLeft > 0.01) earsStillAt = i;
    }
    expect(earsStillAt).toBeGreaterThanOrEqual(bodyDoneAt);
  });

  it("weights stay in [0, 1] even for absurd impacts", () => {
    const j = new Jelly();
    for (let i = 0; i < 40; i += 1) j.impact(Math.random() - 0.5, -1, 500);
    for (let i = 0; i < 200; i += 1) {
      j.step(1 / 30);
      for (const n of MORPH_NAMES) {
        const w = j.weights()[n];
        expect(w).toBeGreaterThanOrEqual(0);
        expect(w).toBeLessThanOrEqual(1);
      }
    }
  });

  it("reduced-motion amplitude shrinks the wobble", () => {
    const full = new Jelly();
    const calm = new Jelly();
    calm.amplitude = 0.4;
    full.impact(0, -1, 18);
    calm.impact(0, -1, 18);
    expect(Math.max(...run(calm, 1))).toBeLessThan(Math.max(...run(full, 1)));
  });

  it("side impacts wobble the head toward the push", () => {
    const j = new Jelly();
    j.impact(1, 0, 18);
    let right = 0;
    for (let i = 0; i < 30; i += 1) {
      j.step(1 / 60);
      right = Math.max(right, j.weights().HeadWobbleRight);
    }
    expect(right).toBeGreaterThan(0.05);
  });
});
