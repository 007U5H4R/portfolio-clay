/**
 * TASK-185 (Tushar, phone screenshots: "the bouncers are very near to each other ... make the bouncers lesser and smaller"):
 * the layout keeps real room around everything a gummy can roll into. A gap narrower than 1.5 gummy widths can wedge it, so
 * the bumpers (both tables, TASK-199: the tighter desktop diamond too), the side slingshots and the pickup spawns keep at least that
 * much clear edge to edge.
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
  it("has two bumpers (pop + turbo, no spinner) at about 72 % of the desktop radius", () => {
    expect(phone.bumpers).toHaveLength(2);
    expect(phone.bumpers.map((b) => b.kind).sort()).toEqual(["pop", "turbo"]);
    expect(phone.bumpers.some((b) => b.spin)).toBe(false);
    const desktop = wide.bumpers.find((b) => !b.spin)!.r;
    for (const b of phone.bumpers) {
      expect(b.r / desktop).toBeGreaterThanOrEqual(0.7);
      expect(b.r / desktop).toBeLessThanOrEqual(0.75);
    }
    expect(wide.bumpers.filter((b) => !b.spin).length).toBe(4); // the desktop layout keeps its four
  });

  it(`leaves at least ${MIN_CLEAR.toFixed(2)} (1.5 gummy widths) between bumpers, walls and the side slingshots`, () => {
    const c = layoutClearances(phone);
    expect(c.bumperBumper).toBeGreaterThanOrEqual(MIN_CLEAR);
    expect(c.bumperWall).toBeGreaterThanOrEqual(MIN_CLEAR);
    expect(c.bumperSling).toBeGreaterThanOrEqual(MIN_CLEAR);
  });

  it("keeps the middle of the field open above the flipper slings: no bumper or slingshot in the central strip", () => {
    for (const b of phone.bumpers) expect(Math.abs(b.x) - b.r).toBeGreaterThan(0.0);
    // a gummy-wide column down the middle, from just above the slings to the first bumper's underside, is clear of everything
    const low = Math.min(...phone.bumpers.map((b) => b.y - b.r));
    for (let y = 0.2; y < low - 0.2; y += 0.2) expect(pointClearance(phone, { x: 0, y })).toBeGreaterThan(GUMMY_W / 2);
  });
});

describe("desktop table: the tighter diamond, still roomy", () => {
  const c = layoutClearances(wide);
  const major = wide.bumpers.filter((b) => !b.spin);

  it(`keeps the four bumpers apart by at least ${MIN_CLEAR.toFixed(2)} (1.5 gummy widths) and off the walls and the side slingshots`, () => {
    expect(c.bumperBumper).toBeGreaterThanOrEqual(MIN_CLEAR);
    expect(c.bumperWall).toBeGreaterThanOrEqual(MIN_CLEAR);
    expect(c.bumperSling).toBeGreaterThanOrEqual(MIN_CLEAR);
  });

  it("is tighter than the TASK-185 diamond (left and right were at x = ±2.0 with a 2.7-high column) while keeping the clearance", () => {
    const l = major.find((b) => b.x < 0)!;
    const r = major.find((b) => b.x > 0)!;
    expect(r.x).toBeLessThan(2.0);
    expect(-l.x).toBeLessThan(2.0);
    // the whole diamond is smaller than before, by its width and its area (half the product of the two diagonals)
    const w = r.x - l.x;
    const h = Math.max(...major.map((b) => b.y)) - Math.min(...major.map((b) => b.y));
    expect(w).toBeLessThan(4.0);
    expect((w * h) / 2).toBeLessThan((4.0 * 2.7) / 2);
  });

  it("leaves a gap under the top bumper that is taller than a gummy (0.98), so nothing wedges against the ceiling", () => {
    const top = Math.max(...major.map((b) => b.y + b.r));
    expect(wide.ceilingY - top).toBeGreaterThan(1.1);
  });

  it("keeps the spinner's sweep clear of the bottom bumper (the spinner turns, so this is smaller than the bumper gap)", () => {
    expect(c.spinnerBumper).toBeGreaterThan(0.45);
  });

  it("keeps the two side slingshots out in the open: nowhere near each other, nowhere near the diamond", () => {
    expect(c.slingSling).toBeGreaterThan(5);
  });
});

describe("pickup and power-up spawns (anchors)", () => {
  it("keep 1.5 gummy widths from bumpers, slingshots, the black hole and walls on the phone table", () => {
    for (const p of phone.anchors) expect(pointClearance(phone, p), `anchor ${p.x},${p.y}`).toBeGreaterThanOrEqual(MIN_CLEAR);
  });
  it("keep a gummy's width and a bit from everything on the desktop table (they are looser there)", () => {
    for (const p of wide.anchors) expect(pointClearance(wide, p), `anchor ${p.x},${p.y}`).toBeGreaterThanOrEqual(0.8);
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
