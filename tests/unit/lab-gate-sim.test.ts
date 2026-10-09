/**
 * TASK-185 follow-up (Tushar: "once the launch happened, the launch path should be closed otherwise the gummy bear will again
 * fall into the launch pad"): the one-way gate on the shooter lane, checked against the real colliders (tests/unit/lab-sim.ts).
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { clearedLane } from "@/lib/lab/gate";
import { MIN_FORCE } from "@/lib/lab/plunger";
import { LabSim, initRapier } from "./lab-sim";

// Whole-table simulations: a loaded machine (a full gate run) needs more than the default 5 s / 10 s.
vi.setConfig({ testTimeout: 90_000, hookTimeout: 180_000 });

beforeAll(async () => {
  await initRapier();
});

describe.each([5, 2.7])("the lane gate (table half-width %s)", (hw) => {
  it("lets a 0 % launch (MIN_FORCE) out of the lane, then shuts behind it", () => {
    const s = new LabSim(hw);
    expect(s.gateShut).toBe(false);
    s.launch(MIN_FORCE);
    s.run(6, undefined, () => s.gateShut);
    expect(s.gateShut).toBe(true);
    expect(clearedLane(s.arena, { x: s.x, y: s.y })).toBe(true);
  });

  it("is open on the plunger and while the gummy is still in the lane", () => {
    const s = new LabSim(hw);
    s.run(1);
    expect(s.gateShut).toBe(false);
    s.launch(MIN_FORCE);
    for (let i = 0; i < 25; i += 1) s.step(); // ~0.4 s: well up the lane, not yet round the arch
    expect(s.x).toBeGreaterThan(s.arena.lane.xIn);
    expect(s.gateShut).toBe(false);
  });

  it("a launch too weak to clear it rolls back onto the plunger; the gate stays open and the next launch works", () => {
    const s = new LabSim(hw);
    s.launch(11); // far too weak: it never reaches the top of the lane
    s.run(6, undefined, () => s.gateShut);
    expect(s.gateShut).toBe(false);
    expect(s.onPlunger).toBe(true);
    s.launch(MIN_FORCE + 2);
    s.run(6, undefined, () => s.gateShut);
    expect(s.gateShut).toBe(true);
  });

  it("a gummy dropped into the field above the lane entrance can never enter the lane (many drops, many angles)", () => {
    const base = new LabSim(hw);
    const a = base.arena;
    let drops = 0;
    let inLane = 0;
    for (let x = a.halfW - 1.6; x <= a.lane.xIn - 0.4; x += 0.4) {
      for (let y = a.lane.dividerTop + 0.3; y <= a.lane.dividerTop + 2.7; y += 0.6) {
        for (const vx of [0, 2, 5, 8]) {
          const s = new LabSim(hw);
          s.launched = true;
          s.place(x, y, vx, 0);
          // it is in the field: the controller closes the gate on its first step
          s.run(5);
          drops += 1;
          if (s.reenteredLane || s.x > a.lane.xIn + 0.05) inLane += 1;
        }
      }
    }
    expect(drops).toBeGreaterThan(40);
    expect(inLane).toBe(0);
  });

  it("a new serve reopens it: the next ball can launch out of the lane again", () => {
    const s = new LabSim(hw);
    s.launch(MIN_FORCE);
    s.run(6, undefined, () => s.gateShut);
    expect(s.gateShut).toBe(true);
    s.serve();
    expect(s.gateShut).toBe(false);
    s.run(1);
    expect(s.onPlunger).toBe(true);
    s.launch(MIN_FORCE);
    s.run(6, undefined, () => s.gateShut);
    expect(s.gateShut).toBe(true);
  });
});
