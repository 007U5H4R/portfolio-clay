/** TASK-199 — the four bumper types: each has its own kick, and its own extra (ring flash, table shake, trail burst). */
import { describe, expect, it } from "vitest";
import { BUMPER_KINDS, BUMPER_MAX_SPEED, BUMPER_POINTS, BUMPER_TUNE, bumperKick, bumperSpeed } from "@/lib/lab/bumpers";
import { ACTION_POINTS } from "@/lib/lab/engine";
import { TrailBuffer, TURBO_BURST_S } from "@/lib/lab/trail";
import { createFxHooks, THUMPER_SHAKE } from "@/components/lab/fx";
import type { LabRuntime } from "@/components/lab/runtime";

const mag = (v: { x: number; y: number }) => Math.hypot(v.x, v.y);

describe("the kick of each bumper type", () => {
  it("pop is the TASK-185 kick: max(7.5, 0.8 × speed + 3), straight out from the bumper", () => {
    expect(mag(bumperKick("pop", 1, 0, 0))).toBeCloseTo(7.5, 9);
    expect(mag(bumperKick("pop", 0, 1, 10))).toBeCloseTo(11, 9);
    const k = bumperKick("pop", 3, 4, 0);
    expect(k.x / k.y).toBeCloseTo(3 / 4, 9);
  });

  it("jet is stronger than pop at every incoming speed", () => {
    for (const v of [0, 3, 8, 14, 20]) expect(bumperSpeed("jet", v)).toBeGreaterThan(bumperSpeed("pop", v));
  });

  it("thumper is heavier than jet and pop at every incoming speed", () => {
    for (const v of [0, 3, 8, 14, 20]) {
      expect(bumperSpeed("thumper", v)).toBeGreaterThan(bumperSpeed("jet", v));
      expect(bumperSpeed("thumper", v)).toBeGreaterThan(bumperSpeed("pop", v));
    }
  });

  it("turbo is a speed boost: the gummy leaves faster than it arrived (by at least 20% once it is moving), more than pop gives", () => {
    for (const v of [6, 10, 14, 18]) {
      expect(bumperSpeed("turbo", v)).toBeGreaterThan(v * 1.2);
      expect(bumperSpeed("turbo", v)).toBeGreaterThan(bumperSpeed("pop", v));
    }
    expect(BUMPER_TUNE.turbo.gain).toBeGreaterThan(1);
  });

  it("every kind kicks along the line from the bumper to the gummy, and straight up if they coincide", () => {
    for (const kind of BUMPER_KINDS) {
      const k = bumperKick(kind, -2, 2, 6);
      expect(k.x).toBeLessThan(0);
      expect(k.y).toBeGreaterThan(0);
      expect(k.x).toBeCloseTo(-k.y, 9);
      const up = bumperKick(kind, 0, 0, 6);
      expect(up.x).toBe(0);
      expect(up.y).toBeGreaterThan(0);
    }
  });

  it("the power-up bounce multiplier scales every kick, and nothing ever exceeds the speed cap", () => {
    for (const kind of BUMPER_KINDS) {
      expect(bumperSpeed(kind, 4, 1.15)).toBeCloseTo(Math.min(BUMPER_MAX_SPEED, bumperSpeed(kind, 4) * 1.15), 9);
      expect(bumperSpeed(kind, 200, 2)).toBeLessThanOrEqual(BUMPER_MAX_SPEED);
    }
  });

  it("the kinds are four distinct feels: at rest-ish speeds all four outgoing speeds differ", () => {
    const speeds = BUMPER_KINDS.map((k) => bumperSpeed(k, 8));
    expect(new Set(speeds.map((v) => v.toFixed(3))).size).toBe(4);
  });

  it("each type has its own extra, and only its own: jet a ring flash, thumper a shake, turbo a trail burst, pop none", () => {
    expect(BUMPER_TUNE.pop).toMatchObject({ ringFlash: false, shake: false, trailBurst: false });
    expect(BUMPER_TUNE.jet).toMatchObject({ ringFlash: true, shake: false, trailBurst: false });
    expect(BUMPER_TUNE.thumper).toMatchObject({ ringFlash: false, shake: true, trailBurst: false });
    expect(BUMPER_TUNE.turbo).toMatchObject({ ringFlash: false, shake: false, trailBurst: true });
  });

  it("all four score 100 (a different feel, not a different value)", () => {
    expect(BUMPER_POINTS).toBe(100);
    expect(ACTION_POINTS.bumper).toBe(BUMPER_POINTS);
  });
});

/** A minimal runtime: just what the bumper fx hook reads and writes. */
function stub(reducedMotion = false) {
  const trail = new TrailBuffer(16);
  const emitted: unknown[] = [];
  const rt = {
    reducedMotion,
    shake: 0,
    trailFlash: 0,
    trail,
    particles: { capacity: 8, emit: (o: unknown) => emitted.push(o) },
  } as unknown as LabRuntime;
  return { rt, trail, emitted };
}

describe("the extras the fx hook adds to each hit", () => {
  it("a thumper shakes the table with the Nudge's strength; the others do not", () => {
    for (const kind of BUMPER_KINDS) {
      const { rt } = stub();
      createFxHooks(rt).bumper("B", kind, 0, 0);
      expect(rt.shake, kind).toBe(kind === "thumper" ? THUMPER_SHAKE : 0);
    }
    expect(THUMPER_SHAKE).toBe(0.55);
  });

  it("a thumper's shake is not even asked for under reduced motion", () => {
    const { rt } = stub(true);
    createFxHooks(rt).bumper("B", "thumper", 0, 0);
    expect(rt.shake).toBe(0);
  });

  it("a turbo sends a burst down the trail; the others leave it alone", () => {
    for (const kind of BUMPER_KINDS) {
      const { rt, trail } = stub();
      createFxHooks(rt).bumper("B", kind, 0, 0);
      expect(trail.boostLeft, kind).toBe(kind === "turbo" ? TURBO_BURST_S : 0);
    }
  });

  it("a turbo's burst is a no-op under reduced motion (the trail is off)", () => {
    const { rt, trail } = stub(true);
    trail.enabled = false;
    createFxHooks(rt).bumper("B", "turbo", 0, 0);
    expect(trail.boostLeft).toBe(0);
  });

  it("every hit still flashes the trail and throws sparks, as before", () => {
    for (const kind of BUMPER_KINDS) {
      const { rt, emitted } = stub();
      createFxHooks(rt).bumper("B", kind, 1, 2);
      expect(rt.trailFlash, kind).toBeGreaterThanOrEqual(1);
      expect(emitted.length, kind).toBeGreaterThan(0);
    }
  });
});
