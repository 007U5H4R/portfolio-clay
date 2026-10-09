/**
 * TASK-185 (coordinator: do the phone table's runs end faster than the desktop's?): time from launch to the first drain over 50
 * seeded launches per table, in the headless Rapier world, with no flipper input and with a casual flipper bot (it swings at roughly 7 in 10 chances when the gummy is above a flipper and falling). The phone table must not drain much faster than the desktop one.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { MAX_FORCE, MIN_FORCE } from "@/lib/lab/plunger";
import { LabSim, initRapier } from "./lab-sim";

vi.setConfig({ testTimeout: 120_000, hookTimeout: 180_000 });
beforeAll(async () => {
  await initRapier();
});

const rng = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const median = (a: number[]) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]!;

function firstDrain(hw: number, force: number, bot: boolean, cap = 120, seed = 5): number {
  const s = new LabSim(hw);
  const miss = rng(seed);
  s.launch(force);
  const hold = [0, 0];
  for (let k = 0; k < 60 * cap; k += 1) {
    let left = false;
    let right = false;
    if (bot && s.launched && s.gateShut) {
      const piv = s.arena.flippers[0].pivot.y;
      const vy = s.gummy.linvel().y;
      const low = s.y < piv + 1.7 && s.y > piv - 0.2 && vy < 2;
      for (const side of [0, 1] as const) {
        const onSide = side === 0 ? s.x < 0.3 : s.x > -0.3;
        // a casual player: swings at about 7 in 10 of the chances, a little late
        if (low && onSide && hold[side]! <= 0 && miss() < 0.7 / 6) hold[side] = 0.28;
        if (hold[side]! > 0) {
          hold[side] = hold[side]! - 1 / 60;
          if (side === 0) left = true;
          else right = true;
        }
      }
    }
    s.step({ left, right });
    if (s.launched && s.y < s.arena.dangerTop - 0.1 && s.x < s.arena.lane.xIn - 0.3) return s.t;
    if (s.portalAt !== null) return cap; // left through the black hole: not a drain
  }
  return cap;
}

describe("time to first drain", () => {
  const out: Record<string, number[]> = {};
  beforeAll(() => {
    for (const [name, hw] of [["phone", 2.7], ["desktop", 5]] as const) {
      for (const bot of [false, true]) {
        const r = rng(21);
        out[`${name}${bot ? "+bot" : ""}`] = Array.from({ length: 50 }, (_, i) => firstDrain(hw, MIN_FORCE + r() * (MAX_FORCE - MIN_FORCE), bot, 120, 100 + i));
      }
    }
  });
  it("a player with flippers lasts on the phone table as long as on the desktop one (median at least 60% of it); with no input it falls in about half the time, as a table half as wide must", () => {
    const m = (k: string) => median(out[k]!);
    console.info(`[drain-sim] median s to first drain: no flippers phone ${m("phone").toFixed(1)} vs desktop ${m("desktop").toFixed(1)}; with a flipper bot phone ${m("phone+bot").toFixed(1)} vs desktop ${m("desktop+bot").toFixed(1)}`);
    expect(m("phone")).toBeGreaterThanOrEqual(0.4 * m("desktop")); // unattended: a floor, not a target
    expect(m("phone+bot")).toBeGreaterThanOrEqual(0.6 * m("desktop+bot"));
  });
});
