/**
 * TASK-185 — the launch plunger (spec §15–17): the charge → force mapping (a pure function), the charge state machine, and the
 * ballistic check that a 0% launch clears the lane while a 100% launch reaches the top ramp.
 */
import { describe, expect, it } from "vitest";
import { buildArena } from "@/lib/lab/arena";
import { MAX_CHARGE_MS, MAX_FORCE, METER_HOLD_S, MIN_FORCE, Plunger, SNAP_S, chargeProgress, launchApex, launchForce, litSegments } from "@/lib/lab/plunger";
import { GRAVITY } from "@/components/lab/physics-step";

describe("charge → force", () => {
  it("MAX_CHARGE_MS is 1500 and chargeProgress is elapsed / MAX, clamped to 0–1", () => {
    expect(MAX_CHARGE_MS).toBe(1500);
    expect(chargeProgress(0)).toBe(0);
    expect(chargeProgress(750)).toBeCloseTo(0.5, 10);
    expect(chargeProgress(1500)).toBe(1);
    expect(chargeProgress(99999)).toBe(1);
    expect(chargeProgress(-40)).toBe(0);
  });

  it("launchForce is MIN_FORCE + progress × (MAX_FORCE − MIN_FORCE)", () => {
    expect(launchForce(0)).toBe(MIN_FORCE);
    expect(launchForce(1)).toBe(MAX_FORCE);
    expect(launchForce(0.5)).toBeCloseTo((MIN_FORCE + MAX_FORCE) / 2, 10);
    expect(launchForce(-3)).toBe(MIN_FORCE);
    expect(launchForce(7)).toBe(MAX_FORCE);
    let prev = -Infinity;
    for (let i = 0; i <= 20; i += 1) {
      const f = launchForce(i / 20);
      expect(f).toBeGreaterThan(prev);
      prev = f;
    }
  });

  it("a 0% launch still clears the lane, and a 100% launch reaches the top ramp (ballistic, frictionless)", () => {
    for (const hw of [5, 2.7]) {
      const { lane, ceilingY } = buildArena(hw);
      const toDividerTop = lane.dividerTop - lane.restY;
      const toRamp = ceilingY - 0.1 - lane.restY;
      expect(Math.abs(GRAVITY)).toBeGreaterThan(0);
      // 0%: it must rise past the divider's top with room to spare (damping and the bend take some of it)
      expect(launchApex(MIN_FORCE, GRAVITY)).toBeGreaterThan(toDividerTop * 1.6);
      // 100%: it must reach the arch at the top of the lane, bear height and all
      expect(launchApex(MAX_FORCE, GRAVITY)).toBeGreaterThan(toRamp + 1);
      expect(launchApex(MAX_FORCE, GRAVITY)).toBeGreaterThan(launchApex(MIN_FORCE, GRAVITY));
    }
  });

  it("lights the meter's lamps from the bottom: none at rest, all at full", () => {
    expect(litSegments(0, 8)).toBe(0);
    expect(litSegments(0.01, 8)).toBe(1);
    expect(litSegments(0.5, 8)).toBe(4);
    expect(litSegments(1, 8)).toBe(8);
    expect(litSegments(2, 8)).toBe(8);
  });
});

describe("Plunger", () => {
  it("starts extended at 0%, charges while held and caps at MAX_CHARGE_MS", () => {
    const p = new Plunger();
    expect(p.phase).toBe("idle");
    expect(p.pull).toBe(0);
    expect(p.meter).toBe(0);
    p.press();
    expect(p.charging).toBe(true);
    p.step(750);
    expect(p.progress).toBeCloseTo(0.5, 10);
    expect(p.pull).toBeGreaterThan(0.5); // eased: it compresses fast at first, like a spring being squeezed
    p.step(5000);
    expect(p.progress).toBe(1);
    expect(p.pull).toBeCloseTo(1, 10);
  });

  it("compresses further the longer it is held", () => {
    const p = new Plunger();
    p.press();
    let prev = 0;
    for (let i = 0; i < 15; i += 1) {
      p.step(100);
      expect(p.pull).toBeGreaterThan(prev);
      prev = p.pull;
    }
  });

  it("release returns the launch force for the charge held, then snaps forward to rest", () => {
    const p = new Plunger();
    p.press();
    p.step(MAX_CHARGE_MS / 2);
    const pulled = p.pull;
    const f = p.release();
    expect(f).toBeCloseTo((MIN_FORCE + MAX_FORCE) / 2, 6);
    expect(p.phase).toBe("snapping");
    expect(p.pull).toBeCloseTo(pulled, 10);
    p.step((SNAP_S * 1000) / 2);
    expect(p.pull).toBeLessThan(pulled);
    p.step(SNAP_S * 1000);
    expect(p.phase).toBe("idle");
    expect(p.pull).toBe(0);
  });

  it("an instant tap launches at MIN_FORCE; nothing launches without a press; a second release does nothing", () => {
    const p = new Plunger();
    expect(p.release()).toBeNull();
    p.press();
    expect(p.release()).toBe(MIN_FORCE);
    expect(p.release()).toBeNull();
  });

  it("the meter holds the launched value for a beat after release, then fades out", () => {
    const p = new Plunger();
    p.press();
    p.step(MAX_CHARGE_MS);
    expect(p.meter).toBe(1);
    p.release();
    expect(p.meter).toBeCloseTo(1, 6);
    p.step((METER_HOLD_S * 1000) / 2);
    expect(p.meter).toBeGreaterThan(0.3);
    expect(p.meter).toBeLessThan(0.7);
    p.step(METER_HOLD_S * 1000);
    expect(p.meter).toBe(0);
  });

  it("cancel (pause, blur, game over) abandons a charge with no launch and resets everything", () => {
    const p = new Plunger();
    p.press();
    p.step(900);
    p.cancel();
    expect(p.phase).toBe("idle");
    expect(p.progress).toBe(0);
    expect(p.pull).toBe(0);
    expect(p.meter).toBe(0);
    expect(p.release()).toBeNull();
  });

  it("a press during the snap-forward is ignored until the plunger has landed", () => {
    const p = new Plunger();
    p.press();
    p.release();
    p.press();
    expect(p.phase).toBe("snapping");
    p.step(SNAP_S * 1000 + 1);
    p.press();
    expect(p.charging).toBe(true);
  });
});
