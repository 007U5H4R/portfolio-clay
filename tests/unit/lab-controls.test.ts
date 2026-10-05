/** TASK-143.3 — drag spring, flick, tap and squish maths (gummy-bear.md §17). */
import { describe, expect, it } from "vitest";
import {
  BOUNCE_BASE_SPEED,
  FLICK_MAX_SPEED,
  bounceSpeed,
  clampSpeed,
  dragAcceleration,
  flickLaunch,
  flickVelocity,
  isTap,
  squishCharge,
  tapKick,
} from "@/lib/lab/controls";

describe("drag spring", () => {
  it("pulls toward the target and is damped by velocity", () => {
    const a = dragAcceleration({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: -1 });
    expect(a.x).toBeGreaterThan(0);
    expect(a.y).toBeLessThan(0);
    const damped = dragAcceleration({ x: 1, y: 0 }, { x: 5, y: 0 }, { x: 1, y: 0 });
    expect(damped.x).toBeLessThan(0);
  });
  it("is zero at rest on the target", () => {
    expect(dragAcceleration({ x: 2, y: 3 }, { x: 0, y: 0 }, { x: 2, y: 3 })).toEqual({ x: 0, y: 0 });
  });
});

describe("flick", () => {
  const swipe = [
    { t: 900, x: 0, y: 0 },
    { t: 950, x: 0.5, y: 0 },
    { t: 1000, x: 1, y: 0 },
  ];
  it("measures pointer velocity over the trailing 100 ms", () => {
    expect(flickVelocity(swipe, 1000).x).toBeCloseTo(10, 5);
  });
  it("ignores stale samples and single samples", () => {
    expect(flickVelocity(swipe, 2000)).toEqual({ x: 0, y: 0 });
    expect(flickVelocity([swipe[0]!], 900)).toEqual({ x: 0, y: 0 });
  });
  it("launches faster for faster flicks and caps extreme values", () => {
    const slow = flickLaunch([{ t: 0, x: 0, y: 0 }, { t: 100, x: 0.5, y: 0 }], 100)!;
    const fast = flickLaunch([{ t: 0, x: 0, y: 0 }, { t: 100, x: 1.6, y: 0 }], 100)!;
    expect(fast.x).toBeGreaterThan(slow.x);
    const absurd = flickLaunch([{ t: 0, x: 0, y: 0 }, { t: 10, x: 50, y: 50 }], 10)!;
    expect(Math.hypot(absurd.x, absurd.y)).toBeCloseTo(FLICK_MAX_SPEED, 5);
  });
  it("a slow release is a plain drop, not a launch", () => {
    expect(flickLaunch([{ t: 0, x: 0, y: 0 }, { t: 100, x: 0.05, y: 0 }], 100)).toBeNull();
  });
  it("clampSpeed keeps direction", () => {
    const v = clampSpeed({ x: 30, y: 40 }, 5);
    expect(v.x).toBeCloseTo(3, 5);
    expect(v.y).toBeCloseTo(4, 5);
  });
});

describe("squish and tap", () => {
  it("charge is 0 for a short hold, rises monotonically and saturates at 1", () => {
    expect(squishCharge(100)).toBe(0);
    const mid = squishCharge(500);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
    expect(squishCharge(700)).toBeGreaterThan(mid);
    expect(squishCharge(5000)).toBe(1);
  });
  it("a full charge bounces higher than none, Super Squish multiplies", () => {
    expect(bounceSpeed(0)).toBe(BOUNCE_BASE_SPEED);
    expect(bounceSpeed(1)).toBeGreaterThan(bounceSpeed(0.4));
    expect(bounceSpeed(1, 2)).toBeCloseTo(bounceSpeed(1) * 2, 5);
    expect(bounceSpeed(7)).toBe(bounceSpeed(1));
  });
  it("a tap bounces up and kicks away from the poke side", () => {
    expect(tapKick(-0.4).x).toBeGreaterThan(0);
    expect(tapKick(0.4).x).toBeLessThan(0);
    expect(tapKick(0).x).toBeCloseTo(0, 5);
    expect(tapKick(0).y).toBeGreaterThan(0);
  });
  it("tap vs hold: short and still is a tap", () => {
    expect(isTap(120, 3)).toBe(true);
    expect(isTap(400, 3)).toBe(false);
    expect(isTap(120, 40)).toBe(false);
  });
});
