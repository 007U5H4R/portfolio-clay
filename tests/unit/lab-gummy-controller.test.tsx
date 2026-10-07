/**
 * TASK-143 — the gummy controller is stepped once per FIXED physics step (EVAL-030): its forces must
 * depend on the number of steps (simulated time), never on how the rendered frames were split, and
 * must read the body's own position (rt.bear is only refreshed once per rendered frame).
 */
import { describe, expect, it } from "vitest";
import { GummyController } from "@/components/lab/gummy-controller";
import { PHYSICS_DT } from "@/components/lab/physics-step";

function fakeBody(x = 0, y = 0) {
  const body = { x, y, vx: 0, vy: 0 };
  return {
    body,
    rb: {
      translation: () => ({ x: body.x, y: body.y, z: 0 }),
      linvel: () => ({ x: body.vx, y: body.vy, z: 0 }),
      setLinvel: (v: { x: number; y: number }) => {
        body.vx = v.x;
        body.vy = v.y;
      },
    } as never,
  };
}

function controller() {
  const rt = { bear: { x: 99, y: 99, dragged: false, squishing: false, charge: 0 }, arena: { halfW: 5, floorY: -5, ceilingY: 5 }, env: { windX: 0 } } as never;
  return new GummyController(rt, {} as HTMLElement, () => ({}) as never, () => true, () => false);
}

describe("GummyController.update (fixed step)", () => {
  it("is a 60 Hz step", () => {
    expect(PHYSICS_DT).toBeCloseTo(1 / 60, 10);
  });

  it("an ArrowRight hold adds speed in proportion to simulated time: 0.4 s = 24 steps = +12 u/s", () => {
    const c = controller();
    (c as unknown as { keyRight: boolean }).keyRight = true;
    const { body, rb } = fakeBody();
    for (let i = 0; i < 24; i += 1) c.update(PHYSICS_DT, rb);
    expect(body.vx).toBeCloseTo(12, 6);
  });

  it("ArrowLeft pushes the other way and both together cancel", () => {
    const c = controller();
    const k = c as unknown as { keyLeft: boolean; keyRight: boolean };
    const { body, rb } = fakeBody();
    k.keyLeft = true;
    c.update(PHYSICS_DT, rb);
    expect(body.vx).toBeLessThan(0);
    body.vx = 0;
    k.keyRight = true;
    c.update(PHYSICS_DT, rb);
    expect(body.vx).toBe(0);
  });

  it("the drag spring pulls the body (not the stale rt.bear) toward the pointer", () => {
    const c = controller();
    const p = c as unknown as { mode: string; world: { x: number; y: number }; grab: { x: number; y: number } };
    p.mode = "drag";
    p.world = { x: 2, y: 0.5 };
    p.grab = { x: 0, y: 0 };
    const { body, rb } = fakeBody(0, 0); // body at the origin; rt.bear claims (99, 99)
    c.update(PHYSICS_DT, rb);
    expect(body.vx).toBeGreaterThan(0);
    expect(body.vx).toBeLessThan(15);
  });
});
