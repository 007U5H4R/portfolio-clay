/**
 * TASK-185 (Tushar, phone screenshots: "the bouncers are very near to each other ... make the bouncers lesser and smaller"):
 * the layout keeps real room around everything a gummy can roll into. A gap narrower than 1.5 gummy widths can wedge it, so
 * the phone table's bumpers, plates and pickup spawns keep at least that much clear edge to edge.
 */
import { describe, expect, it } from "vitest";
import { buildArena, portraitHalfWidth } from "@/lib/lab/arena";
import { GUMMY_W, MIN_CLEAR, layoutClearances, pointClearance } from "@/lib/lab/arena-clearance";

const phone = buildArena(2.7);
const wide = buildArena(5);

describe("the phone table is chosen by aspect, like the 390 layout", () => {
  it("uses the narrow table for portrait aspects and the wide one for landscape", () => {
    expect(portraitHalfWidth(390 / 844)).toBe(2.7);
    expect(portraitHalfWidth(1440 / 900)).toBe(5);
  });
});

describe("phone table: fewer, smaller, well-spaced bumpers", () => {
  it("has two bumpers (no spinner) at about 72 % of the desktop radius", () => {
    expect(phone.bumpers).toHaveLength(2);
    expect(phone.bumpers.some((b) => b.spin)).toBe(false);
    const desktop = wide.bumpers.find((b) => !b.spin)!.r;
    for (const b of phone.bumpers) {
      expect(b.r / desktop).toBeGreaterThanOrEqual(0.7);
      expect(b.r / desktop).toBeLessThanOrEqual(0.75);
    }
    expect(wide.bumpers.filter((b) => !b.spin).length).toBe(4); // the desktop layout keeps its four
  });

  it("keeps all four targets, none overlapping", () => {
    expect(phone.targets.map((t) => t.id).sort()).toEqual(["AI", "BUILD", "DESIGN", "PRODUCT"]);
    expect(layoutClearances(phone).targetTarget).toBeGreaterThan(0.3);
    expect(layoutClearances(wide).targetTarget).toBeGreaterThan(0.3);
  });

  it(`leaves at least ${MIN_CLEAR.toFixed(2)} (1.5 gummy widths) between bumpers, walls and plates`, () => {
    const c = layoutClearances(phone);
    expect(c.bumperBumper).toBeGreaterThanOrEqual(MIN_CLEAR);
    expect(c.bumperWall).toBeGreaterThanOrEqual(MIN_CLEAR);
    expect(c.bumperTarget).toBeGreaterThanOrEqual(MIN_CLEAR);
  });

  it("keeps the middle of the field open above the slings: no bumper or plate in the central strip", () => {
    for (const b of phone.bumpers) expect(Math.abs(b.x) - b.r).toBeGreaterThan(0.0);
    // a gummy-wide column down the middle, from just above the slings to the first bumper's underside, is clear of everything
    const low = Math.min(...phone.bumpers.map((b) => b.y - b.r));
    for (let y = 0.2; y < low - 0.2; y += 0.2) expect(pointClearance(phone, { x: 0, y })).toBeGreaterThan(GUMMY_W / 2);
  });
});

describe("desktop table: the layout is kept, and still roomy", () => {
  it("keeps bumpers apart and off the walls by at least 1.5 gummy widths", () => {
    const c = layoutClearances(wide);
    expect(c.bumperBumper).toBeGreaterThanOrEqual(MIN_CLEAR);
    expect(c.bumperWall).toBeGreaterThanOrEqual(MIN_CLEAR);
  });
  it("never lets a bumper squeeze against a plate (a floor under today's layout; the plates were already this close)", () => {
    expect(layoutClearances(wide).bumperTarget).toBeGreaterThanOrEqual(0.6);
  });
});

describe("pickup and power-up spawns (anchors)", () => {
  it("keep 1.5 gummy widths from bumpers, plates and walls on the phone table", () => {
    for (const p of phone.anchors) expect(pointClearance(phone, p), `anchor ${p.x},${p.y}`).toBeGreaterThanOrEqual(MIN_CLEAR);
  });
  it("never sit in the feed from the bumpers to the flippers, nor in the lane", () => {
    const lowest = Math.min(...phone.bumpers.map((b) => b.y - b.r));
    for (const p of phone.anchors) {
      expect(p.x).toBeLessThan(phone.lane.xIn);
      const inFeed = Math.abs(p.x) < 0.3 && p.y > -0.8 && p.y < lowest;
      expect(inFeed, `anchor ${p.x},${p.y}`).toBe(false);
    }
  });
  it("are still plentiful enough for the spawner", () => {
    expect(phone.anchors.length).toBeGreaterThanOrEqual(5);
  });
});
