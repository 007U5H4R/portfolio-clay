/** TASK-199 — the slingshot kick (flipper-side triangles and the new wall trapezia) and its scoring. */
import { describe, expect, it } from "vitest";
import { buildArena } from "@/lib/lab/arena";
import { ACTION_POINTS } from "@/lib/lab/engine";
import { SLING_LIFT, SLING_MIN_SPEED, slingFacing, slingKick } from "@/lib/lab/slings";

const mag = (v: { x: number; y: number }) => Math.hypot(v.x, v.y);

describe.each([5, 2.7])("slingshot kicks on the %s table", (hw) => {
  const a = buildArena(hw);
  const wall = a.slings.filter((s) => s.kind === "wall");

  it("kicks out along the face's normal (into the table) and a little up, at least the minimum speed", () => {
    for (const s of a.slings) {
      const k = slingKick(s, 0);
      expect(mag({ x: k.x - 0, y: k.y - SLING_LIFT[s.kind] })).toBeCloseTo(SLING_MIN_SPEED, 9);
      expect(k.x * s.normal.x + (k.y - SLING_LIFT[s.kind]) * s.normal.y).toBeGreaterThan(0);
      expect(k.y).toBeGreaterThan(0);
    }
  });

  it("a left wall sling kicks right and a right one kicks left", () => {
    for (const s of wall) expect(slingKick(s, 5).x * (s.side === "left" ? 1 : -1)).toBeGreaterThan(8);
  });

  it("a faster gummy is kicked faster (60 % of its speed + 5), scaled by the power-up multiplier", () => {
    const s = wall[0]!;
    expect(slingKick(s, 20).x).toBeGreaterThan(slingKick(s, 5).x);
    expect(mag({ x: slingKick(s, 20).x, y: slingKick(s, 20).y - SLING_LIFT.wall })).toBeCloseTo(20 * 0.6 + 5, 9);
    expect(slingKick(s, 5, 1.15).x).toBeCloseTo(slingKick(s, 5).x * 1.15, 9);
  });

  it("only a gummy on the face's side is kicked: not one over the body or behind it", () => {
    for (const s of wall) {
      const sgn = s.side === "left" ? 1 : -1;
      expect(slingFacing(s, s.mid.x + sgn * 0.5, s.mid.y)).toBe(true);
      expect(slingFacing(s, s.mid.x - sgn * 0.3, s.mid.y)).toBe(false);
    }
  });

  it("scores the standard sling value, 30", () => {
    expect(ACTION_POINTS.sling).toBe(30);
  });
});
