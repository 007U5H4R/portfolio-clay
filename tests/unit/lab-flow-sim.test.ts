/**
 * TASK-185 (Tushar: "in the mobile version the bouncers are very near to each other, gummy bear will never be able to come to the
 * flipper"): 50 random launches per table, no flipper input, in the headless Rapier world (tests/unit/lab-sim.ts). The gummy has
 * to come down to the flipper zone, within a reasonable time, and never sit still on the way.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { MAX_FORCE, MIN_FORCE } from "@/lib/lab/plunger";
import { LabSim, initRapier } from "./lab-sim";

// Whole-table simulations: a loaded machine (a full gate run) needs more than the default 5 s / 10 s.
vi.setConfig({ testTimeout: 90_000, hookTimeout: 180_000 });

beforeAll(async () => {
  await initRapier();
});

const rng = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

interface Run {
  outcome: "flippers" | "black hole" | "plunger" | "timeout";
  at: number;
  stillest: number;
}
function play(hw: number, force: number, cap: number): Run {
  const s = new LabSim(hw);
  s.launch(force);
  let anchor = { x: s.x, y: s.y };
  let still = 0;
  let stillest = 0;
  for (let k = 0; k < 60 * cap; k += 1) {
    s.step();
    if (s.portalAt !== null) return { outcome: "black hole", at: s.t, stillest };
    if (s.launched && s.gateShut && s.y < -1.5 && s.x < s.arena.lane.xIn - 0.3) return { outcome: "flippers", at: s.t, stillest };
    if (s.launched && !s.gateShut && s.onPlunger && s.t > 1) return { outcome: "plunger", at: s.t, stillest };
    if (Math.hypot(s.x - anchor.x, s.y - anchor.y) > 0.06) {
      anchor = { x: s.x, y: s.y };
      still = 0;
    } else {
      still += 1 / 60;
      stillest = Math.max(stillest, still);
    }
  }
  return { outcome: "timeout", at: cap, stillest };
}

describe.each([
  { name: "phone", hw: 2.7, minOk: 0.95 },
  { name: "desktop", hw: 5, minOk: 0.85 },
])("flow on the $name table", ({ name, hw, minOk }) => {
  const runs: Run[] = [];
  beforeAll(() => {
    const r = rng(11);
    for (let i = 0; i < 50; i += 1) runs.push(play(hw, MIN_FORCE + r() * (MAX_FORCE - MIN_FORCE), 45));
  });

  it(`brings the gummy to the flippers (or the black hole, or back to the plunger) in ${Math.round(minOk * 100)} %+ of 50 launches`, () => {
    const ok = runs.filter((r) => r.outcome !== "timeout").length;
    const flippers = runs.filter((r) => r.outcome === "flippers").map((r) => r.at).sort((a, b) => a - b);
    const count = (o: Run["outcome"]) => runs.filter((r) => r.outcome === o).length;
    console.info(
      `[flow-sim] ${name}: flippers ${count("flippers")}, black hole ${count("black hole")}, back on plunger ${count("plunger")}, timeout(45 s) ${count("timeout")}; ` +
        `time to flippers median ${flippers[Math.floor(flippers.length / 2)]?.toFixed(1)} s, p90 ${flippers[Math.floor(flippers.length * 0.9)]?.toFixed(1)} s, max ${flippers[flippers.length - 1]?.toFixed(1)} s; ` +
        `longest stillness ${Math.max(...runs.filter((r) => r.outcome !== "plunger").map((r) => r.stillest)).toFixed(2)} s`,
    );
    expect(ok / runs.length).toBeGreaterThanOrEqual(minOk);
  });

  it("never sits still for more than about 2 s on the way", () => {
    for (const r of runs.filter((x) => x.outcome !== "plunger")) expect(r.stillest).toBeLessThanOrEqual(2);
  });

  if (hw < 4) {
    it("phone: the middle of the run is quick (median under 6 s to the flippers)", () => {
      const t = runs.filter((r) => r.outcome === "flippers").map((r) => r.at).sort((a, b) => a - b);
      expect(t[Math.floor(t.length / 2)]!).toBeLessThan(6);
    });
  }
});
