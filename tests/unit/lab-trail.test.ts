/**
 * TASK-185 — the gummy's light trail (spec §7–9, §27): a FIXED-SIZE ring buffer. The pool never grows, nothing is allocated after
 * construction, samples expire by themselves, the trail is longest at speed, and the fade follows 100 → 70 → 40 → 15 → 0 %.
 */
import { describe, expect, it } from "vitest";
import { FULL_SPEED, MAX_LIFE_S, MIN_LIFE_S, MIN_TRAIL_SPEED, SPACING, TRAIL_CAPACITY, TrailBuffer, lifeForSpeed, trailFade } from "@/lib/lab/trail";

describe("TrailBuffer is a fixed-size pool", () => {
  it("never grows: the same typed arrays, the same length, a bounded count, however many samples go in", () => {
    const t = new TrailBuffer();
    const refs = [t.x, t.y, t.age, t.life, t.speed];
    const lengths = refs.map((a) => a.length);
    for (let i = 0; i < 20000; i += 1) {
      t.push(Math.sin(i * 0.05) * 4 + i * 0.001, Math.cos(i * 0.05) * 4, 18, 1 / 60);
      if (i % 2 === 0) t.update(1 / 60);
      expect(t.count).toBeLessThanOrEqual(t.capacity);
    }
    expect([t.x, t.y, t.age, t.life, t.speed]).toEqual(refs);
    expect(refs.map((a) => a.length)).toEqual(lengths);
    expect(t.capacity).toBe(TRAIL_CAPACITY);
    expect(lengths.every((n) => n === TRAIL_CAPACITY)).toBe(true);
  });

  it("holds exactly its capacity when pushed without ever ageing (the oldest slot is overwritten)", () => {
    const t = new TrailBuffer(8);
    for (let i = 0; i < 100; i += 1) t.push(i * 0.3, 0, 20);
    expect(t.count).toBe(8);
    // the newest sample is the last one pushed
    expect(t.x[t.slot(0)]).toBeCloseTo(99 * 0.3, 4);
  });

  it("expires samples by itself: a trail left alone empties", () => {
    const t = new TrailBuffer();
    for (let i = 0; i < 30; i += 1) t.push(i * 0.2, 0, FULL_SPEED);
    expect(t.count).toBeGreaterThan(10);
    for (let i = 0; i < 40; i += 1) t.update(1 / 60);
    expect(t.count).toBe(0);
  });

  it("records nothing while disabled (reduced motion) or while the gummy crawls", () => {
    const off = new TrailBuffer();
    off.enabled = false;
    for (let i = 0; i < 50; i += 1) off.push(i, 0, 20);
    expect(off.count).toBe(0);
    const slow = new TrailBuffer();
    for (let i = 0; i < 50; i += 1) slow.push(i, 0, MIN_TRAIL_SPEED - 0.1);
    expect(slow.count).toBe(0);
  });

  it("fills in a long frame's travel so the ribbon is smooth at any frame rate, with the ages the points would have had", () => {
    const t = new TrailBuffer();
    t.push(0, 0, 20, 1 / 30);
    t.update(1 / 30);
    t.push(1.6, 0, 20, 1 / 30);
    expect(t.count).toBeGreaterThanOrEqual(Math.ceil(1.6 / SPACING));
    // newest first: x falls as k grows and ages rise toward the oldest
    for (let k = 1; k < t.count; k += 1) {
      expect(t.x[t.slot(k)]!).toBeLessThanOrEqual(t.x[t.slot(k - 1)]!);
      expect(t.age[t.slot(k)]!).toBeGreaterThanOrEqual(t.age[t.slot(k - 1)]!);
    }
  });

  it("a teleport starts a fresh trail instead of streaking across the table", () => {
    const t = new TrailBuffer();
    t.push(0, 0, 20);
    t.push(0.3, 0, 20);
    const before = t.count;
    t.push(30, 20, 20);
    expect(t.count).toBe(before + 1);
  });

  it("a gummy that slows down breaks the trail: the next fast point does not join the old position", () => {
    const t = new TrailBuffer();
    t.push(0, 0, 20);
    t.push(0.2, 0, 20);
    t.push(0.2, 0, 0.5); // stopped
    const n = t.count;
    t.push(2.0, 0, 20);
    expect(t.count).toBe(n + 1);
  });
});

describe("the trail is longest at speed and fades with the spec's gradient", () => {
  it("life grows with speed between MIN_LIFE_S and MAX_LIFE_S", () => {
    expect(lifeForSpeed(0)).toBe(MIN_LIFE_S);
    expect(lifeForSpeed(FULL_SPEED)).toBe(MAX_LIFE_S);
    expect(lifeForSpeed(FULL_SPEED * 3)).toBe(MAX_LIFE_S);
    expect(lifeForSpeed(FULL_SPEED / 2)).toBeGreaterThan(MIN_LIFE_S);
    expect(lifeForSpeed(FULL_SPEED / 2)).toBeLessThan(MAX_LIFE_S);
  });

  it("a fast gummy leaves a longer trail than a slow one over the same time", () => {
    const run = (speed: number) => {
      const t = new TrailBuffer();
      let x = 0;
      for (let i = 0; i < 60; i += 1) {
        x += speed / 60;
        t.push(x, 0, speed, 1 / 60);
        t.update(1 / 60);
      }
      return t.count;
    };
    expect(run(22)).toBeGreaterThan(run(6));
  });

  it("fades 100% → 70% → 40% → 15% → 0% across a sample's life", () => {
    expect(trailFade(0)).toBe(1);
    expect(trailFade(0.25)).toBeCloseTo(0.7, 10);
    expect(trailFade(0.5)).toBeCloseTo(0.4, 10);
    expect(trailFade(0.75)).toBeCloseTo(0.15, 10);
    expect(trailFade(1)).toBe(0);
    expect(trailFade(2)).toBe(0);
    let prev = 2;
    for (let i = 0; i <= 40; i += 1) {
      const a = trailFade(i / 40);
      expect(a).toBeLessThanOrEqual(prev);
      prev = a;
    }
  });

  it("the head of the trail is the brightest and the tail the faintest", () => {
    const t = new TrailBuffer();
    for (let i = 0; i < 12; i += 1) {
      t.push(i * 0.4, 0, 20, 1 / 60);
      t.update(1 / 60);
    }
    expect(t.alpha(0)).toBeGreaterThan(t.alpha(t.count - 1));
    expect(t.alpha(0)).toBeGreaterThan(0.9);
  });
});
