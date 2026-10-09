/** TASK-185 (Tushar: "there has to be some button ... which vibrates the pinball and the gummy gets unstuck"): the nudge's rules. */
import { describe, expect, it } from "vitest";
import { NUDGE_COOLDOWN_S, NUDGE_UP, NudgeState, TILT_COUNT, TILT_WINDOW_S } from "@/lib/lab/nudge";

const advance = (n: NudgeState, seconds: number) => {
  for (let t = 0; t < seconds - 1e-9; t += 1 / 60) n.step(1 / 60);
};

describe("NudgeState", () => {
  it("kicks up, with a sideways lean in a random direction", () => {
    const seen = new Set<number>();
    for (const r of [0.1, 0.9, 0.4, 0.6]) {
      const n = new NudgeState();
      const k = n.fire(() => r)!;
      expect(k.y).toBe(NUDGE_UP);
      expect(Math.abs(k.x)).toBeGreaterThan(0.5);
      expect(Math.abs(k.x)).toBeLessThan(NUDGE_UP * 0.85);
      seen.add(Math.sign(k.x));
    }
    expect(seen.size).toBe(2); // both directions occur
  });

  it("is spent for the cooldown (about 1.5 s) and ready again after it", () => {
    const n = new NudgeState();
    expect(n.fire()).not.toBeNull();
    expect(n.cooling).toBe(true);
    expect(n.progress).toBeLessThan(0.05);
    advance(n, NUDGE_COOLDOWN_S - 0.1);
    expect(n.fire()).toBeNull(); // a press during the recharge does nothing
    expect(n.progress).toBeGreaterThan(0.9);
    advance(n, 0.2);
    expect(n.cooling).toBe(false);
    expect(n.progress).toBe(1);
    expect(n.fire()).not.toBeNull();
  });

  it("a press that is ignored does not extend the cooldown (no punishment, no cheat)", () => {
    const n = new NudgeState();
    n.fire();
    advance(n, 0.5);
    for (let i = 0; i < 20; i += 1) n.fire();
    advance(n, NUDGE_COOLDOWN_S - 0.5 + 0.05);
    expect(n.fire()).not.toBeNull();
  });

  it(`TILT comes on the ${TILT_COUNT}rd nudge inside ${TILT_WINDOW_S} s (mashing it as soon as it recharges), and not at a relaxed pace`, () => {
    const mash = new NudgeState();
    const tilts: boolean[] = [];
    for (let i = 0; i < TILT_COUNT; i += 1) {
      tilts.push(mash.fire()!.tilt);
      advance(mash, NUDGE_COOLDOWN_S + 0.05);
    }
    expect(tilts).toEqual([false, false, true]);
    const calm = new NudgeState();
    const slow: boolean[] = [];
    for (let i = 0; i < 5; i += 1) {
      slow.push(calm.fire()!.tilt);
      advance(calm, 2.2);
    }
    expect(slow.every((t) => !t)).toBe(true);
  });

  it("reset (a new serve) clears the cooldown", () => {
    const n = new NudgeState();
    n.fire();
    n.reset();
    expect(n.fire()).not.toBeNull();
  });
});
