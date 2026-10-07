/** TASK-143.4 — collectibles and power-ups appear sparingly, from the arena's anchors (gummy-bear.md §21–23). */
import { describe, expect, it } from "vitest";
import { Spawner, type Pickup } from "@/lib/lab/spawner";
import { buildArena } from "@/lib/lab/arena";

function seeded(seed = 7) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function run(sp: Spawner, seconds: number, ctx = { inDanger: false, bearX: 0, bearY: 0 }, start = 0) {
  const all: Pickup[] = [];
  for (let t = start; t < start + seconds; t += 0.1) all.push(...sp.update(0.1, t, ctx).spawned);
  return all;
}

const anchors = buildArena(4.2).anchors;

describe("Spawner", () => {
  it("never fills the screen: caps rings, stars and power-ups at once", () => {
    const sp = new Spawner(anchors, seeded());
    for (let t = 0; t < 120; t += 0.1) {
      sp.update(0.1, t, { inDanger: false, bearX: 0, bearY: 0 });
      const kinds = sp.items.map((i) => i.kind);
      expect(kinds.filter((k) => k === "ring").length).toBeLessThanOrEqual(3);
      expect(kinds.filter((k) => k === "star").length).toBeLessThanOrEqual(1);
      expect(sp.items.filter((i) => !["ring", "star", "droplet"].includes(i.kind)).length).toBeLessThanOrEqual(1);
      expect(sp.items.length).toBeLessThanOrEqual(6);
    }
  });

  it("places everything on an arena anchor, never two on the same spot", () => {
    const sp = new Spawner(anchors, seeded(3));
    run(sp, 60);
    const spots = sp.items.map((i) => `${i.x},${i.y}`);
    expect(new Set(spots).size).toBe(spots.length);
    for (const i of sp.items) expect(anchors.some((a) => a.x === i.x && a.y === i.y)).toBe(true);
  });

  it("starts calm: a ring early, power-ups only after a few seconds, Time Freeze only late", () => {
    const sp = new Spawner(anchors, seeded(11));
    const early = run(sp, 6);
    expect(early.some((p) => p.kind === "ring")).toBe(true);
    expect(early.some((p) => p.kind === "TIME_FREEZE")).toBe(false);
    const sp2 = new Spawner(anchors, seeded(5));
    const first25 = run(sp2, 25);
    expect(first25.some((p) => p.kind === "TIME_FREEZE")).toBe(false);
  });

  it("eventually offers each of the four main power-ups, and the rare freeze after 30 s", () => {
    const sp = new Spawner(anchors, seeded(2));
    const seen = new Set<string>();
    for (let t = 0; t < 1500; t += 0.1) {
      for (const p of sp.update(0.1, t, { inDanger: false, bearX: 0, bearY: 0 }).spawned) seen.add(p.kind);
      sp.items.splice(0, sp.items.length); // collected instantly: keep the spawn flow going
    }
    for (const k of ["SUPER_SQUISH", "LOW_GRAVITY", "RAINBOW", "GOLDEN", "TIME_FREEZE", "ring", "star", "droplet"]) expect(seen.has(k)).toBe(true);
  });

  it("unclaimed pickups expire", () => {
    const sp = new Spawner(anchors, seeded(9));
    run(sp, 5);
    const ids = sp.items.map((i) => i.id);
    expect(ids.length).toBeGreaterThan(0);
    const expired: number[] = [];
    for (let t = 5; t < 40; t += 0.1) {
      sp.update(0.1, t, { inDanger: false, bearX: 0, bearY: 0 }).expired.forEach((e) => expired.push(e));
    }
    expect(expired).toEqual(expect.arrayContaining([ids[0]!]));
  });

  it("offers a gummy droplet when the bear enters danger", () => {
    const sp = new Spawner(anchors, seeded(4));
    run(sp, 3);
    const out = sp.update(0.1, 3, { inDanger: true, bearX: 0, bearY: -4.8 });
    expect(out.spawned.some((p) => p.kind === "droplet") || sp.items.some((p) => p.kind === "droplet")).toBe(true);
  });

  it("remove() and reset() clear items", () => {
    const sp = new Spawner(anchors, seeded(6));
    run(sp, 10);
    const first = sp.items[0]!;
    sp.remove(first.id);
    expect(sp.items.find((i) => i.id === first.id)).toBeUndefined();
    sp.reset();
    expect(sp.items).toHaveLength(0);
  });
});
