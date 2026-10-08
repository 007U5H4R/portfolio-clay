/** TASK-185 — the machine's layout as data: the launch lane, the four targets, the bumpers and the two slingshots (spec §2, §13, §18–20). */
import { describe, expect, it } from "vitest";
import { buildArena } from "@/lib/lab/arena";
import { ACTION_POINTS, TARGET_POINTS } from "@/lib/lab/engine";

describe.each([5, 2.7])("buildArena(%s)", (hw) => {
  const a = buildArena(hw);

  it("puts the gummy on the plunger in the right-hand launch lane, clear of the table", () => {
    expect(a.lane.xIn).toBeGreaterThan(hw);
    expect(a.lane.xOut).toBeGreaterThan(a.lane.xIn + 1);
    expect(a.lane.x).toBeGreaterThan(a.lane.xIn + 0.45);
    expect(a.lane.x).toBeLessThan(a.lane.xOut - 0.45);
    expect(a.spawn.x).toBe(a.lane.x);
    expect(a.spawn.y).toBeGreaterThan(a.lane.restY);
    // the lane is wider than the gummy (about 0.7) and the cap rests above the danger line, so waiting there is never the drain
    expect(a.lane.xOut - a.lane.xIn).toBeGreaterThan(0.9);
    expect(a.lane.restY).toBeGreaterThan(a.dangerTop);
    expect(a.lane.restY - a.lane.travel).toBeGreaterThan(a.floorY - 2);
  });

  it("closes the lane's top with an arch that bends a shot toward the table", () => {
    const arch = a.rails.filter((r) => r.id.startsWith("ARCH-"));
    expect(arch.length).toBeGreaterThanOrEqual(4);
    // each segment turns further left as it climbs, ending up heading left (x2 < x1)
    expect(arch[0]!.x1).toBeGreaterThan(arch[arch.length - 1]!.x2);
    expect(arch[arch.length - 1]!.x2).toBeLessThan(a.lane.xIn);
    expect(a.lane.dividerTop).toBeLessThan(arch[0]!.y1);
  });

  it("has four targets, AI DESIGN PRODUCT BUILD, two a side, on the table", () => {
    expect(a.targets.map((t) => t.id).sort()).toEqual(["AI", "BUILD", "DESIGN", "PRODUCT"]);
    expect(a.targets.filter((t) => t.x < 0)).toHaveLength(2);
    expect(a.targets.filter((t) => t.x > 0)).toHaveLength(2);
    for (const t of a.targets) {
      expect(Math.abs(t.x) + t.r).toBeLessThan(hw + 0.4);
      expect(t.y).toBeGreaterThan(a.lane.restY + 2);
    }
  });

  it("has three to five major bumpers (the spinner arrives later)", () => {
    const major = a.bumpers.filter((b) => !b.spin);
    expect(major.length).toBeGreaterThanOrEqual(3);
    expect(major.length).toBeLessThanOrEqual(5);
    for (const b of major) expect(Math.abs(b.x) + b.r).toBeLessThan(hw);
    // a gummy (about 0.7 wide) can pass between any two of them
    for (let i = 0; i < major.length; i += 1)
      for (let j = i + 1; j < major.length; j += 1) {
        const gap = Math.hypot(major[i]!.x - major[j]!.x, major[i]!.y - major[j]!.y) - major[i]!.r - major[j]!.r;
        expect(gap).toBeGreaterThan(0.7);
      }
  });

  it("has two slingshots above the flippers, their kicking faces pointing up and into the table", () => {
    expect(a.slings.map((s) => s.side).sort()).toEqual(["left", "right"]);
    for (const s of a.slings) {
      const sgn = s.side === "left" ? 1 : -1;
      expect(s.normal.y).toBeGreaterThan(0.2);
      expect(s.normal.x * sgn).toBeGreaterThan(0.2);
      expect(Math.hypot(s.normal.x, s.normal.y)).toBeCloseTo(1, 6);
      // above the flipper pivots, inside the walls
      const f = a.flippers[s.side === "left" ? 0 : 1];
      for (const p of s.pts) {
        expect(p.y).toBeGreaterThan(f.pivot.y);
        expect(Math.abs(p.x)).toBeLessThanOrEqual(hw + 0.01);
      }
    }
  });

  it("keeps a clear drain between the flippers and puts the black hole top-left, outside the table", () => {
    expect(Math.abs(a.drain.x)).toBeLessThan(0.1);
    expect(a.drain.y).toBeLessThan(a.flippers[0].pivot.y);
    expect(a.portal.x).toBeLessThan(-hw);
    expect(a.portal.y).toBeGreaterThan(a.ceilingY - 0.5);
    expect(a.minX).toBeLessThan(a.portal.x - a.portal.r);
    expect(a.maxX).toBeGreaterThan(a.lane.xOut);
    expect(a.topY).toBeGreaterThan(a.portal.y + a.portal.r);
  });

  it("never scatters a collectible inside a bumper, a target or the lane", () => {
    for (const p of a.anchors) {
      expect(p.x).toBeLessThan(a.lane.xIn);
      for (const b of a.bumpers.filter((x) => !x.spin)) expect(Math.hypot(p.x - b.x, p.y - b.y)).toBeGreaterThan(b.r + 0.3);
      for (const t of a.targets) expect(Math.hypot(p.x - t.x, p.y - t.y)).toBeGreaterThan(t.r + 0.2);
    }
  });
});

describe("what the machine scores (spec §10, §19)", () => {
  it("targets are worth AI 150, DESIGN 200, PRODUCT 250, BUILD 300, and a bumper 100", () => {
    expect(TARGET_POINTS).toEqual({ AI: 150, DESIGN: 200, PRODUCT: 250, BUILD: 300 });
    expect(ACTION_POINTS.bumper).toBe(100);
  });
});
