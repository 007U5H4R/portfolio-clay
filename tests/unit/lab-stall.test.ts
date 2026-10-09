import { describe, expect, it } from "vitest";
import { STALL_AFTER_S, STALL_RADIUS, StallWatch } from "@/lib/lab/flippers";

/**
 * TASK-184 (Tushar 2026-10-08): in the LAB UNSTABLE phase a gummy wedged between the green ball and the blue rail was
 * never freed — wind and the low-gravity wobble kept it twitching above the old speed threshold, so the speed-based
 * stall check never fired, and its upward kick pushed into the rail above. Stalls are now judged by position.
 */
const DT = 1 / 60;

function run(watch: StallWatch, seconds: number, at: (t: number) => { x: number; y: number }, onFlipper = false) {
  const nudges: Array<{ x: number; y: number }> = [];
  for (let t = 0; t < seconds; t += DT) {
    const n = watch.step(DT, at(t), onFlipper);
    if (n) nudges.push(n);
  }
  return nudges;
}

describe("StallWatch (TASK-184)", () => {
  it("frees a gummy that jiggles in place — wind/wobble motion above any speed threshold still counts as stuck", () => {
    const w = new StallWatch();
    // ±0.1 units at 6 Hz: fast motion, but it never leaves a small area.
    const nudges = run(w, STALL_AFTER_S + 0.3, (t) => ({ x: 0.2 + 0.1 * Math.sin(t * 37), y: 1 + 0.1 * Math.cos(t * 41) }));
    expect(nudges.length).toBe(1);
  });

  it("never nudges a gummy that is actually travelling", () => {
    const w = new StallWatch();
    expect(run(w, 5, (t) => ({ x: -3 + t * 1.2, y: 2 }))).toEqual([]);
  });

  it("never disturbs a gummy cradled on a flipper", () => {
    const w = new StallWatch();
    expect(run(w, 5, () => ({ x: -1, y: -3 }), true)).toEqual([]);
  });

  it("repeated stalls alternate direction, grow stronger, and the second try pushes DOWN to escape a rail above", () => {
    const w = new StallWatch();
    const nudges = run(w, STALL_AFTER_S * 3 + 0.5, () => ({ x: 0.2, y: 1 }));
    expect(nudges.length).toBe(3);
    expect(Math.sign(nudges[0]!.x)).not.toBe(Math.sign(nudges[1]!.x));
    expect(Math.hypot(nudges[1]!.x, nudges[1]!.y)).toBeGreaterThan(Math.hypot(nudges[0]!.x, nudges[0]!.y));
    expect(nudges[1]!.y).toBeLessThan(0);
  });

  it("a gummy that escapes resets the escalation", () => {
    const w = new StallWatch();
    run(w, STALL_AFTER_S + 0.2, () => ({ x: 0.2, y: 1 }));
    run(w, 1, (t) => ({ x: 0.2 + t * 3, y: 1 })); // moves well beyond the radius
    const again = run(w, STALL_AFTER_S + 0.2, () => ({ x: 3.5, y: 1 }));
    expect(again.length).toBe(1);
    expect(Math.hypot(again[0]!.x, again[0]!.y)).toBeLessThan(5);
    expect(STALL_RADIUS).toBeGreaterThan(0.1);
  });
});
