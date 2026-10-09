/**
 * TASK-185 follow-up (Tushar: "there should be a way to go to the black hole ... but the path is blocked"): a headless Rapier
 * run of the real colliders (tests/unit/lab-sim.ts). The black hole is a skill shot: some plunger powers carry the gummy round
 * the top and into the opening in the left wall, most do not, and nothing else lets it out of the cabinet.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { MAX_FORCE, MIN_FORCE } from "@/lib/lab/plunger";
import { LabSim, initRapier } from "./lab-sim";
import { portalOnce } from "@/components/lab/portal-exit";

// Whole-table simulations: a loaded machine (a full gate run) needs more than the default 5 s / 10 s.
vi.setConfig({ testTimeout: 90_000, hookTimeout: 180_000 });

beforeAll(async () => {
  await initRapier();
});

const forces = (step: number) => {
  const out: number[] = [];
  for (let f = MIN_FORCE; f <= MAX_FORCE + 1e-9; f += step) out.push(f);
  return out;
};

describe.each([
  { name: "desktop table", hw: 5 },
  { name: "phone table", hw: 2.7 },
])("the black-hole path on the $name", ({ hw }) => {
  let sweep: { f: number; hit: boolean; minX: number; maxY: number; hits: number }[] = [];
  beforeAll(() => {
    sweep = forces(0.05).map((f) => {
    const s = new LabSim(hw);
    s.launch(f);
    let minX = Infinity;
    let maxY = -Infinity;
    s.run(10, undefined, () => {
      minX = Math.min(minX, s.x);
      maxY = Math.max(maxY, s.y);
      return s.portalAt !== null;
    });
    return { f, hit: s.portalAt !== null, minX, maxY, hits: s.portalHits };
    });
  });

  it("is reachable: at least one realistic launch power reaches the sensor", () => {
    const hits = sweep.filter((r) => r.hit);
    expect(hits.length).toBeGreaterThanOrEqual(1);
    console.info(`[portal-sim] hw ${hw}: ${hits.length}/${sweep.length} launch powers reach the black hole: ${hits.map((r) => r.f.toFixed(2)).join(" ")}`);
  });

  it("is a skill shot: well under a quarter of launch powers exit", () => {
    expect(sweep.filter((r) => r.hit).length / sweep.length).toBeLessThan(0.25);
  });

  it("keeps the cabinet sealed: nothing gets past the pocket's back plate or over the ceiling", () => {
    const a = new LabSim(hw).arena;
    for (const r of sweep) {
      expect(r.minX).toBeGreaterThan(-hw - a.portal.depth - 0.05);
      expect(r.maxY).toBeLessThan(a.ceilingY);
    }
  });

  it("is a gap the gummy fits through but not by much (the opening is its height plus a little)", () => {
    const a = new LabSim(hw).arena;
    const h = a.portal.y1 - a.portal.y0;
    expect(h).toBeGreaterThan(1.05);
    expect(h).toBeLessThan(1.6);
  });
});

describe("a shot from a flipper", () => {
  it("can reach the black hole too (a launched gummy dropped onto the swinging left flipper)", () => {
    // Found with a scan over drop height, flipper position and timing: this is one of the shots that gets there on the desktop table.
    const s = new LabSim(5);
    const l = s.arena.flippers[0];
    const frac = 0.45;
    const tipX = l.pivot.x + 2.2 * Math.cos(-0.46);
    const tipY = l.pivot.y + 2.2 * Math.sin(-0.46);
    s.place(l.pivot.x + (tipX - l.pivot.x) * frac, l.pivot.y + (tipY - l.pivot.y) * frac + 1, 2, 0);
    s.run(8, (t) => ({ left: t >= 0.18 && t < 0.48, right: false }), () => s.portalAt !== null);
    expect(s.portalAt).not.toBeNull();
  });
});

describe("the sensor fires the exit exactly once", () => {
  it("unlocks the achievement and leaves once, however many times it is touched", () => {
    let found = 0;
    let left = 0;
    const hook = portalOnce(() => true, () => (found += 1), () => (left += 1));
    hook();
    hook();
    hook();
    expect([found, left]).toEqual([1, 1]);
  });
  it("ignores the sensor while the game is not live (paused, over, already exiting) and never throws", () => {
    let found = 0;
    let left = 0;
    let running = false;
    const hook = portalOnce(() => running, () => (found += 1), () => (left += 1));
    hook();
    expect([found, left]).toEqual([0, 0]);
    running = true;
    hook();
    expect([found, left]).toEqual([1, 1]);
  });
  it("StallWatch leaves a gummy in the black hole's channel alone (no false nudge near the portal)", () => {
    const s = new LabSim(2.7);
    const a = s.arena;
    s.place(-2.7 + 0.5, (a.portal.y0 + a.portal.y1) / 2 - 0.49, -3, 0);
    s.run(4); // in the real game the exit has already taken over; here nothing exits, so it would sit in the pocket
    expect(s.portalHits).toBeGreaterThanOrEqual(1);
    expect(s.nudges).toHaveLength(0);
  });
  it("in the physics, the sensor reports its entry (and only the gummy can trigger it)", () => {
    const s = new LabSim(2.7);
    const a = s.arena;
    s.place(-2.7 + 0.35, (a.portal.y0 + a.portal.y1) / 2 - 0.5, -6, 0);
    s.run(2, undefined, () => s.portalHits > 0);
    expect(s.portalHits).toBeGreaterThanOrEqual(1);
  });
});
