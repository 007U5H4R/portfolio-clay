/** TASK-185, TASK-199 — the machine's layout as data: the launch lane, the bumper diamond and spinner, the slingshots and the black hole (spec §2, §13, §18–20). */
import { describe, expect, it } from "vitest";
import { buildArena } from "@/lib/lab/arena";
import { ACTION_POINTS } from "@/lib/lab/engine";
import { BUMPER_KINDS } from "@/lib/lab/bumpers";
import { pointClearance } from "@/lib/lab/arena-clearance";

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

  it("has no AI / DESIGN / PRODUCT / BUILD bricks any more (TASK-199)", () => {
    expect(Object.keys(a)).not.toContain("targets");
  });

  it("has the right bumpers: a four-type diamond on the wide table, two (pop + turbo) on the phone table; the spinner is a desktop part", () => {
    const major = a.bumpers.filter((b) => !b.spin);
    if (hw < 4) {
      expect(major.map((b) => b.kind).sort()).toEqual(["pop", "turbo"]);
      expect(a.bumpers.some((b) => b.spin)).toBe(false);
    } else {
      expect(major.map((b) => b.kind).sort()).toEqual([...BUMPER_KINDS].sort());
      expect(a.bumpers.filter((b) => b.spin)).toHaveLength(1);
    }
    for (const b of major) expect(Math.abs(b.x) + b.r).toBeLessThan(hw);
    // a gummy (about 0.7 wide) can pass between any two of them
    for (let i = 0; i < major.length; i += 1)
      for (let j = i + 1; j < major.length; j += 1) {
        const gap = Math.hypot(major[i]!.x - major[j]!.x, major[i]!.y - major[j]!.y) - major[i]!.r - major[j]!.r;
        expect(gap).toBeGreaterThan(0.7);
      }
  });

  it("keeps every bumper's top clear of the ceiling by more than a gummy's height (nothing wedges under the top rail)", () => {
    for (const b of a.bumpers.filter((x) => !x.spin)) expect(a.ceilingY - (b.y + b.r)).toBeGreaterThan(1.1);
  });

  it("has two slingshots above the flippers, their kicking faces pointing up and into the table", () => {
    const low = a.slings.filter((s) => s.kind === "flipper");
    expect(low.map((s) => s.side).sort()).toEqual(["left", "right"]);
    for (const s of low) {
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

  it("has two unlabelled trapezoidal slingshots on the side walls at mid-height (TASK-199), the right one against the lane's wall", () => {
    const wall = a.slings.filter((s) => s.kind === "wall");
    expect(wall.map((s) => s.side).sort()).toEqual(["left", "right"]);
    for (const s of wall) {
      const sgn = s.side === "left" ? -1 : 1;
      expect(s.pts).toHaveLength(4);
      // a trapezoid: the wall edge and the face are parallel (both vertical) and the face is the shorter one
      const [wTop, fTop, fBot, wBot] = s.pts as [typeof s.pts[number], typeof s.pts[number], typeof s.pts[number], typeof s.pts[number]];
      expect(wTop.x).toBeCloseTo(wBot.x, 9);
      expect(fTop.x).toBeCloseTo(fBot.x, 9);
      expect(wTop.y - wBot.y).toBeGreaterThan(fTop.y - fBot.y);
      expect(wTop.x).toBeCloseTo(sgn * hw, 9);
      // the face looks into the table, and the thing sits about halfway up the playfield
      expect(s.normal.x * sgn).toBeLessThan(-0.99);
      expect(s.mid.y).toBeGreaterThan(1.5);
      expect(s.mid.y).toBeLessThan(a.ceilingY - 2);
      // it carries no label of any kind
      expect(Object.keys(s).sort()).toEqual(["face", "id", "kind", "mid", "normal", "pts", "side"]);
    }
    expect(a.slings.map((s) => s.id).sort()).toEqual(["SL", "SR", "WL", "WR"]);
  });

  it("keeps a clear drain between the flippers and puts the black hole inside the table, not outside the frame", () => {
    expect(Math.abs(a.drain.x)).toBeLessThan(0.1);
    expect(a.drain.y).toBeLessThan(a.flippers[0].pivot.y);
    // inside the playfield (right of the left wall, below the ceiling) and on the left side
    expect(a.portal.x - a.portal.r).toBeGreaterThan(-hw - 0.4);
    expect(a.portal.x).toBeGreaterThan(-hw);
    expect(a.portal.x).toBeLessThan(0);
    expect(a.portal.y + a.portal.r).toBeLessThan(a.ceilingY);
    expect(a.portal.catchR).toBeLessThanOrEqual(a.portal.r);
    // the desktop hole is in the top-left of the playfield (Tushar's annotated screenshot)
    if (hw > 4) expect(a.portal.y).toBeGreaterThan(4.5);
    // the camera frames the cabinet, not an empty margin where the hole used to hang
    expect(a.minX).toBeGreaterThan(-hw - 0.9);
    expect(a.maxX).toBeGreaterThan(a.lane.xOut);
    expect(a.topY).toBeGreaterThan(a.ceilingY);
  });

  it("puts the spinner just below the diamond, centred (desktop)", () => {
    if (hw < 4) return;
    const spin = a.bumpers.find((b) => b.spin)!;
    const major = a.bumpers.filter((b) => !b.spin);
    expect(spin.x).toBe(0);
    expect(spin.y).toBeLessThan(Math.min(...major.map((b) => b.y)) - 1);
    expect(spin.y).toBeGreaterThan(-1.5);
    // the diamond itself: top over bottom on the centre line, left and right level, all four around one centre
    const byX = (x: number) => major.filter((b) => Math.abs(b.x - x) < 1e-9);
    expect(byX(0)).toHaveLength(2);
    const l = major.find((b) => b.x < 0)!;
    const r = major.find((b) => b.x > 0)!;
    expect(l.y).toBeCloseTo(r.y, 9);
    expect(l.x).toBeCloseTo(-r.x, 9);
  });

  it("never scatters a collectible inside a bumper, a slingshot, the black hole or the lane", () => {
    for (const p of a.anchors) {
      expect(p.x).toBeLessThan(a.lane.xIn);
      expect(pointClearance(a, p), `anchor ${p.x},${p.y}`).toBeGreaterThan(0.5);
      expect(Math.hypot(p.x - a.portal.x, p.y - a.portal.y)).toBeGreaterThan(a.portal.r + 0.3);
    }
  });
});

describe("what the machine scores (spec §10, TASK-199)", () => {
  it("a bumper is 100 whatever its type, and a slingshot (flipper-side or wall) is the standard 30", () => {
    expect(ACTION_POINTS.bumper).toBe(100);
    expect(ACTION_POINTS.sling).toBe(30);
    expect(Object.keys(ACTION_POINTS)).not.toContain("target");
  });
});
