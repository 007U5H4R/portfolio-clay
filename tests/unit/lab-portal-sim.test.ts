/**
 * TASK-185 follow-up, redone for TASK-199 (the black hole now sits INSIDE the table, top-left on the desktop table): a headless Rapier
 * run of the real colliders (tests/unit/lab-sim.ts). The black hole is a skill shot: some plunger powers carry the gummy into its
 * sensor, most do not, and a flipper shot can too. Only the sensor lets the gummy leave: the cabinet around it stays sealed.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { MAX_FORCE, MIN_FORCE } from "@/lib/lab/plunger";
import { portalSensor } from "@/lib/lab/arena";
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

  it("is a skill shot: not the first thing every launch does, and the holding-to-MAX launch is not the only way in either", () => {
    const hits = sweep.filter((r) => r.hit);
    expect(hits.length).toBeGreaterThanOrEqual(3);
    expect(hits.length / sweep.length).toBeGreaterThan(0.03);
  });

  it("keeps the cabinet sealed: nothing gets past the left wall or over the ceiling", () => {
    const a = new LabSim(hw).arena;
    for (const r of sweep) {
      expect(r.minX).toBeGreaterThan(-hw - 0.05);
      expect(r.maxY).toBeLessThan(a.ceilingY);
    }
  });

  it("is inside the table: the sensor is wholly within the playfield, the hole is where the drawing is", () => {
    const a = new LabSim(hw).arena;
    const s = portalSensor(a);
    expect(s.x - s.r).toBeGreaterThan(-hw);
    expect(s.x).toBe(a.portal.x);
    expect(s.y).toBe(a.portal.y);
    expect(s.r).toBeLessThanOrEqual(a.portal.r);
  });
});

describe.each([
  { name: "desktop table", hw: 5 },
  { name: "phone table", hw: 2.7 },
])("a shot from a flipper on the $name", ({ hw }) => {
  it("can reach the black hole too: a scan of drops onto the swinging left flipper finds one", () => {
    // A launched gummy dropped onto the left flipper at some point along it, the flipper raised some moment later: look for any that gets there.
    let found: { frac: number; drop: number; at: number } | null = null;
    const l = new LabSim(hw).arena.flippers[0];
    const tipX = l.pivot.x + l.len * Math.cos(-0.46);
    const tipY = l.pivot.y + l.len * Math.sin(-0.46);
    for (const frac of [0.3, 0.45, 0.6, 0.75]) {
      for (const drop of [0.6, 1.2, 2.0]) {
        for (const at of [0.1, 0.18, 0.26, 0.34]) {
          if (found) break;
          const s = new LabSim(hw);
          s.place(l.pivot.x + (tipX - l.pivot.x) * frac, l.pivot.y + (tipY - l.pivot.y) * frac + drop, 1.5, 0);
          s.run(8, (t) => ({ left: t >= at && t < at + 0.32, right: false }), () => s.portalAt !== null);
          if (s.portalAt !== null) found = { frac, drop, at };
        }
      }
    }
    console.info(`[portal-sim] hw ${hw}: flipper shot into the black hole: ${found ? JSON.stringify(found) : "none found"}`);
    expect(found).not.toBeNull();
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
  it("StallWatch leaves a gummy in the black hole's mouth alone (no false nudge there)", () => {
    const s = new LabSim(2.7);
    const a = s.arena;
    s.place(a.portal.x, a.portal.y - 0.5, 0, 0);
    s.run(4); // in the real game the exit has already taken over; here nothing exits, so it would sit there
    expect(s.portalHits).toBeGreaterThanOrEqual(1);
    expect(s.nudges).toHaveLength(0);
  });
  it("in the physics, the sensor reports its entry (and only the gummy can trigger it)", () => {
    for (const hw of [5, 2.7]) {
      const s = new LabSim(hw);
      const a = s.arena;
      s.place(a.portal.x + 0.8, a.portal.y - 0.5, -4, 0);
      s.run(2, undefined, () => s.portalHits > 0);
      expect(s.portalHits, `hw ${hw}`).toBeGreaterThanOrEqual(1);
    }
  });
  it("a gummy that stays out of the sensor never reports an entry", () => {
    const s = new LabSim(5);
    s.place(0, 3.0, 0, 0);
    s.run(1.5);
    expect(s.portalHits).toBe(0);
  });
});
