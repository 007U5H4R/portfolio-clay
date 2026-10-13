/**
 * TASK-185 (Tushar's phone screenshot at 01:03: the gummy wedged at rest between two bumpers, StallWatch did not free it).
 * ROOT CAUSE, found with this headless scan: StallWatch fired, but its nudge only set the gummy's velocity. A gummy wedged
 * between two colliders is held by the contact solver, which undoes a velocity on the next step, so the nudge changed
 * nothing, again and again, however hard it grew (it also never pushed straight up, the only way out of a pocket the gummy
 * fell into from above). The fix: nudges also move the body a hair (NUDGE_SHIFT) and the even tries go up. The manual Nudge
 * button uses the same kick.
 *
 * TASK-199: the new layout (the tighter diamond, the side slingshots) has NO wedge anywhere a scan can find. So this file now does
 * two jobs: (1) proves that, with 150 random drops plus drops aimed at every bumper's and slingshot's neighbourhood, on both tables;
 * (2) keeps testing the anti-stall and the Nudge, on a deliberately too-narrow gap (two test-only posts 0.7 apart), since the real
 * table no longer offers a wedge to free.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { LabSim, initRapier } from "./lab-sim";
import { buildArena, type ArenaSpec } from "@/lib/lab/arena";

// Whole-table simulations: a loaded machine (a full gate run) needs more than the default 5 s / 10 s.
vi.setConfig({ testTimeout: 90_000, hookTimeout: 180_000 });

beforeAll(async () => {
  await initRapier();
});

const rng = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

interface Drop {
  x: number;
  y: number;
  vx: number;
  vy: number;
}
const drops = (hw: number, n: number, seed: number): Drop[] => {
  const r = rng(seed);
  return Array.from({ length: n }, () => ({ x: (r() * 2 - 1) * (hw - 0.8), y: 3 + r() * 2.8, vx: (r() * 2 - 1) * 7, vy: (r() * 2 - 1) * 4 }));
};
const stuck = (s: LabSim) => {
  const a = { x: s.x, y: s.y };
  s.run(3);
  return s.portalAt === null && Math.hypot(s.x - a.x, s.y - a.y) < 0.06 && s.y > -1.5 && s.x < s.arena.lane.xIn && s.x > -s.arena.halfW;
};
type Posts = { x: number; y: number; r: number }[];
/** Two posts with a 0.6-0.7 gap between them: a gap a gummy (0.65 wide) can drop into and stick in. On the desktop table they stand in the open space left of the diamond. */
const gapPosts = (hw: number): Posts => {
  const cx = hw > 4 ? -3.1 : 0;
  const y = hw > 4 ? 1.6 : 3;
  const gap = hw > 4 ? 0.6 : 0.7;
  return [
    { x: cx - gap / 2 - 0.5, y, r: 0.5 },
    { x: cx + gap / 2 + 0.5, y, r: 0.5 },
  ];
};
const play = (hw: number, d: Drop, stallOff: boolean, seconds: number, posts?: Posts) => {
  const s = new LabSim(hw, undefined, posts);
  s.stallOff = stallOff;
  s.place(d.x, d.y, d.vx, d.vy);
  s.run(seconds, undefined, () => s.portalAt !== null);
  return s;
};

/** Drops aimed at the neighbourhood of every bumper and slingshot: above it, beside it, and into each gap between neighbours. */
const aimedDrops = (a: ArenaSpec): Drop[] => {
  const out: Drop[] = [];
  const spots: [number, number][] = [];
  const major = a.bumpers.filter((x) => !x.spin);
  // (a hair off the centre line: dropped dead on top of a round bumper a gummy balances for ever, in the sim only)
  for (const b of major) for (const dx of [-0.5, 0.07, 0.5]) spots.push([b.x + dx, b.y + b.r + 0.9]);
  major.forEach((b, i) => major.slice(i + 1).forEach((o) => spots.push([(b.x + o.x) / 2 + 0.07, (b.y + o.y) / 2 + 0.9])));
  for (const sl of a.slings.filter((x) => x.kind === "wall")) for (const dy of [-0.8, 0, 0.8, 1.6]) spots.push([sl.mid.x + (sl.side === "left" ? 0.3 : -0.3), sl.mid.y + dy + 0.8]);
  // never start inside something: skip a spot whose gummy (a 0.5 radius round the centre of its body) overlaps a bumper
  const free = (x: number, y: number) => major.every((b) => Math.hypot(x - b.x, y + 0.5 - b.y) > b.r + 0.55);
  for (const [x, y] of spots) if (free(x, Math.min(y, 5.3))) for (const vx of [-3, 0.4, 3]) out.push({ x, y: Math.min(y, 5.3), vx, vy: -1 });
  return out;
};

describe.each([
  { name: "phone", hw: 2.7 },
  { name: "desktop", hw: 5 },
])("the new layout never wedges a gummy ($name table, TASK-199)", ({ hw }) => {
  const arena = buildArena(hw);
  const set = [...drops(hw, 150, 7), ...aimedDrops(arena)];
  /** The one rest the scan can still find with the anti-stall off is the TASK-185 ramp pocket (a ramp's outer end against the in-lane sling), far from the new parts. */
  const oldRampPocket = (x: number, y: number) => Math.abs(x) > hw - 1.4 && y < 0.8 && y > -1.0;

  it(`no drop of ${set.length} (random and aimed at the bumpers and the side slingshots) rests near the diamond, the side slingshots or anywhere else new, with the anti-stall off`, () => {
    const wedged = set.map((d) => ({ d, s: play(hw, d, true, 30) })).filter(({ s }) => stuck(s));
    console.info(`[wedge] ${hw}: ${set.length} drops, ${wedged.length} wedged with the anti-stall off${wedged.map(({ s }) => ` (${s.x.toFixed(2)}, ${s.y.toFixed(2)})`).join("")}`);
    expect(wedged.filter(({ s }) => !oldRampPocket(s.x, s.y)).map(({ d, s }) => `${JSON.stringify(d)} rests at ${s.x.toFixed(2)},${s.y.toFixed(2)}`)).toEqual([]);
    expect(wedged.length).toBeLessThanOrEqual(hw > 4 ? 1 : 0);
  });

  it("with the anti-stall on, none of them is still stuck after 40 s", () => {
    const still = set.filter((d) => stuck(play(hw, d, false, 40)));
    expect(still).toEqual([]);
  });
});

describe.each([
  { name: "phone", hw: 2.7 },
  { name: "desktop", hw: 5 },
])("wedged gummies on the $name table (a deliberately narrow gap)", ({ hw }) => {
  const set: Drop[] = Array.from({ length: 100 }, (_, i) => ({ x: (hw > 4 ? -3.1 : 0) - 0.5 + i / 100, y: hw > 4 ? 3.4 : 4.5, vx: 0, vy: -2 }));
  const wedged: Drop[] = [];
  beforeAll(() => {
    for (const d of set) if (stuck(play(hw, d, true, 6, gapPosts(hw)))) wedged.push(d);
  });

  it("the scan finds real wedges when the anti-stall is off (the precondition)", () => {
    expect(wedged.length).toBeGreaterThanOrEqual(3);
  });

  it("StallWatch frees them: after 30 s none of the wedged drops is still stuck", () => {
    const still = wedged.filter((d) => stuck(play(hw, d, false, 30, gapPosts(hw))));
    expect(still.length).toBe(0);
  });

  it("pressing Nudge frees every wedge: most with the first press, the stubborn ones by the third (it recharges in 1.5 s)", () => {
    const presses: number[] = [];
    for (const d of wedged) {
      const s = play(hw, d, true, 30, gapPosts(hw));
      const at = { x: s.x, y: s.y };
      const rands = [0.3, 0.8, 0.55];
      let used = 0;
      let freed = false;
      for (const rv of rands) {
        s.nudgeRand = () => rv;
        s.pressNudge();
        used += 1;
        for (let i = 0; i < 95 && !freed; i += 1) {
          s.step();
          freed = Math.hypot(s.x - at.x, s.y - at.y) > 0.6;
        }
        if (freed) break;
      }
      presses.push(used);
      expect(freed, `drop ${JSON.stringify(d)} rested at ${at.x.toFixed(2)},${at.y.toFixed(2)}`).toBe(true);
    }
    const first = presses.filter((n) => n === 1).length;
    console.info(`[wedge] ${hw}: ${wedged.length} wedges; freed by the first Nudge press: ${first}, by the second: ${presses.filter((n) => n === 2).length}, by the third: ${presses.filter((n) => n === 3).length}`);
    expect(first / presses.length).toBeGreaterThanOrEqual(0.5);
  });

  it("the cooldown is respected: a second press 0.5 s later does nothing", () => {
    const d = wedged[0]!;
    const s = play(hw, d, true, 30, gapPosts(hw));
    s.pressNudge();
    s.step();
    expect(s.nudgeFired).toBe(1);
    for (let i = 0; i < 30; i += 1) s.step();
    s.pressNudge();
    s.step();
    expect(s.nudgeFired).toBe(1);
    for (let i = 0; i < 70; i += 1) s.step();
    s.pressNudge();
    s.step();
    expect(s.nudgeFired).toBe(2);
  });
});

describe("a nudge on the plunger", () => {
  it("does nothing (the gummy waiting to be launched is not shaken off the plunger)", () => {
    const s = new LabSim(2.7);
    s.run(0.5);
    const y = s.y;
    s.pressNudge();
    s.run(0.5);
    expect(s.nudgeFired).toBe(0);
    expect(Math.abs(s.y - y)).toBeLessThan(0.1);
  });
});
