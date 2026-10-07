/**
 * TASK-172 — pinball flippers: input → flipper state, impulse direction, and a deterministic Rapier run
 * (a gummy dropped on a raised flipper goes up).
 */
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import {
  DRAIN_GAP,
  FLIP_REST,
  FLIP_RISE_S,
  FLIP_UP,
  flipImpulse,
  flipperDir,
  flipperLayouts,
  flipperNormal,
  flipperRotation,
  flipperTip,
  newFlipperState,
  stepFlipper,
} from "@/lib/lab/flippers";
import { buildArena } from "@/lib/lab/arena";

const DT = 1 / 60;

describe("flipper state", () => {
  it("rises to full angle in 60-90 ms while pressed, and keeps omega positive on the way", () => {
    const s = newFlipperState();
    let steps = 0;
    while (s.angle < FLIP_UP - 1e-9) {
      stepFlipper(s, true, DT);
      expect(s.omega).toBeGreaterThan(0);
      steps += 1;
    }
    expect(steps * DT).toBeGreaterThanOrEqual(0.06);
    expect(steps * DT).toBeLessThanOrEqual(0.09 + DT);
    expect(FLIP_RISE_S).toBeGreaterThanOrEqual(0.06);
    expect(FLIP_RISE_S).toBeLessThanOrEqual(0.09);
  });

  it("lowers on release and rests at the rest angle; omega goes negative then zero", () => {
    const s = { angle: FLIP_UP, omega: 0 };
    stepFlipper(s, false, DT);
    expect(s.omega).toBeLessThan(0);
    for (let i = 0; i < 30; i += 1) stepFlipper(s, false, DT);
    expect(s.angle).toBe(FLIP_REST);
    expect(s.omega).toBe(0);
  });

  it("holding stays raised", () => {
    const s = newFlipperState();
    for (let i = 0; i < 20; i += 1) stepFlipper(s, true, DT);
    expect(s.angle).toBe(FLIP_UP);
    expect(s.omega).toBe(0);
  });
});

describe("flipper geometry", () => {
  it("the left flipper points toward +x, the right toward -x, and tips rise with the angle", () => {
    expect(flipperDir("left", 0)).toEqual({ x: 1, y: 0 });
    expect(flipperDir("right", 0).x).toBeCloseTo(-1, 12);
    const { left } = flipperLayouts(5, -3.3);
    expect(flipperTip(left, FLIP_UP).y).toBeGreaterThan(flipperTip(left, FLIP_REST).y);
  });

  it("normals face up; at rest they lean toward the middle of the table", () => {
    const l = flipperNormal("left", FLIP_REST);
    const r = flipperNormal("right", FLIP_REST);
    expect(l.y).toBeGreaterThan(0.8);
    expect(l.x).toBeGreaterThan(0);
    expect(r.x).toBeLessThan(0);
    expect(r.x).toBeCloseTo(-l.x, 12);
  });

  it("rest tips leave the drain gap, and both flippers fit inside the walls at both arena widths", () => {
    for (const hw of [5, 2.7]) {
      const { left, right } = flipperLayouts(hw, -3.3);
      expect(flipperTip(right, FLIP_REST).x - flipperTip(left, FLIP_REST).x).toBeCloseTo(DRAIN_GAP, 9);
      expect(Math.abs(left.pivot.x) + 0.3).toBeLessThan(hw);
      expect(buildArena(hw).flippers).toEqual([left, right]);
    }
  });

  it("flipperRotation is a z rotation that maps local +x onto the flipper direction", () => {
    for (const side of ["left", "right"] as const) {
      for (const a of [FLIP_REST, 0, FLIP_UP]) {
        const q = flipperRotation(side, a);
        const theta = 2 * Math.atan2(q.z, q.w);
        const d = flipperDir(side, a);
        expect(Math.cos(theta)).toBeCloseTo(d.x, 9);
        expect(Math.sin(theta)).toBeCloseTo(d.y, 9);
      }
    }
  });
});

describe("flipImpulse", () => {
  const { left, right } = flipperLayouts(5, -3.3);
  const swinging = { angle: FLIP_REST + 0.1, omega: 9 };
  const onSurface = (l: typeof left, t: number, h = 0.6) => {
    const d = flipperDir(l.side, swinging.angle);
    const n = flipperNormal(l.side, swinging.angle);
    return { x: l.pivot.x + d.x * l.len * t + n.x * h, y: l.pivot.y + d.y * l.len * t + n.y * h };
  };

  it("launches along the surface normal (up, leaning toward the middle for the resting angle)", () => {
    const hit = flipImpulse(left, swinging, onSurface(left, 0.7), { x: 0, y: -4 })!;
    expect(hit).not.toBeNull();
    expect(hit.vy).toBeGreaterThan(10);
    expect(hit.vx).toBeGreaterThan(0);
    const dir = Math.atan2(hit.vy, hit.vx);
    const nDir = Math.atan2(hit.normal.y, hit.normal.x);
    expect(dir).toBeCloseTo(nDir, 1);
    const mirrored = flipImpulse(right, swinging, onSurface(right, 0.7), { x: 0, y: -4 })!;
    expect(mirrored.vx).toBeCloseTo(-hit.vx, 9);
    expect(mirrored.vy).toBeCloseTo(hit.vy, 9);
  });

  it("is stronger at the tip than at the pivot and strong enough to cross the arena (v^2 / 2g > 9 units)", () => {
    const base = flipImpulse(left, swinging, onSurface(left, 0.1), { x: 0, y: 0 })!;
    const tip = flipImpulse(left, swinging, onSurface(left, 0.95), { x: 0, y: 0 })!;
    expect(tip.speed).toBeGreaterThan(base.speed);
    expect((tip.vy * tip.vy) / (2 * 16)).toBeGreaterThan(9);
  });

  it("does nothing while the flipper is not swinging up, when the gummy is below it, or out of reach", () => {
    const ball = onSurface(left, 0.5);
    expect(flipImpulse(left, { angle: FLIP_UP, omega: 0 }, ball, { x: 0, y: -4 })).toBeNull();
    expect(flipImpulse(left, { angle: FLIP_REST, omega: -8 }, ball, { x: 0, y: -4 })).toBeNull();
    expect(flipImpulse(left, swinging, onSurface(left, 0.5, -0.6), { x: 0, y: 0 })).toBeNull();
    expect(flipImpulse(left, swinging, onSurface(left, 0.5, 2), { x: 0, y: 0 })).toBeNull();
  });

  it("does not re-hit a gummy that is already leaving faster than the surface", () => {
    const n = flipperNormal("left", swinging.angle);
    expect(flipImpulse(left, swinging, onSurface(left, 0.5), { x: n.x * 25, y: n.y * 25 })).toBeNull();
  });
});

/** Deterministic Rapier: the same fixed step and flipper stepping the game uses, no rendering. */
describe("flipper physics (rapier)", () => {
  async function world() {
    const req = createRequire(createRequire(import.meta.url).resolve("@react-three/rapier"));
    const RAPIER = req("@dimforge/rapier3d-compat");
    await RAPIER.init();
    return RAPIER;
  }

  it("a gummy dropped on a raised flipper goes up; dropped on a resting one it does not", async () => {
    const RAPIER = await world();
    const run = async (press: boolean) => {
      const w = new RAPIER.World({ x: 0, y: -16, z: 0 });
      w.timestep = DT;
      const { left } = flipperLayouts(5, -3.3);
      const fb = w.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(left.pivot.x, left.pivot.y, 0));
      w.createCollider(RAPIER.ColliderDesc.cuboid(left.len / 2, 0.15, 0.6).setTranslation(left.len / 2, 0, 0).setFriction(0.1), fb);
      const bear = w.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic().setTranslation(left.pivot.x + 1.1, -2.2, 0).enabledRotations(false, false, false).enabledTranslations(true, true, false).setCcdEnabled(true).setCanSleep(false),
      );
      w.createCollider(RAPIER.ColliderDesc.cuboid(0.34, 0.45, 0.25).setTranslation(0, 0.5, 0).setFriction(0.15).setRestitution(0.32), bear);
      const state = newFlipperState();
      let maxVy = -Infinity;
      let startY = 0;
      let peak = -Infinity;
      for (let i = 0; i < 150; i += 1) {
        // let it fall and land first; press (or not) at step 28, which is about when it arrives
        stepFlipper(state, press && i >= 28, DT);
        const q = flipperRotation("left", state.angle);
        fb.setNextKinematicRotation(q);
        const t = bear.translation();
        const v = bear.linvel();
        const hit = flipImpulse(left, state, { x: t.x, y: t.y + 0.5 }, { x: v.x, y: v.y });
        if (hit) bear.setLinvel({ x: hit.vx, y: hit.vy, z: 0 }, true);
        w.step();
        if (i === 27) startY = bear.translation().y;
        if (i >= 28) {
          maxVy = Math.max(maxVy, bear.linvel().y);
          peak = Math.max(peak, bear.translation().y);
        }
      }
      return { maxVy, rise: peak - startY };
    };
    const pressed = await run(true);
    const idle = await run(false);
    expect(pressed.maxVy).toBeGreaterThan(10);
    expect(pressed.rise).toBeGreaterThan(3);
    expect(idle.maxVy).toBeLessThan(3);
  });
});
