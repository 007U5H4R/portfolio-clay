/** TASK-143.4 — the particle pool stays within its cap and dies off (gummy-bear.md §25: 20–80 live). */
import { describe, expect, it } from "vitest";
import { ParticlePool } from "@/lib/lab/particles";

describe("ParticlePool", () => {
  it("never exceeds its capacity however much is emitted", () => {
    const p = new ParticlePool(40);
    for (let i = 0; i < 100; i += 1) p.emit({ x: 0, y: 0, kind: "sparkle", count: 10 });
    expect(p.active).toBeLessThanOrEqual(40);
    expect(p.active).toBe(40);
  });
  it("particles fall under gravity and expire", () => {
    const p = new ParticlePool(8, () => 0.5);
    p.emit({ x: 1, y: 2, kind: "droplet", count: 3 });
    expect(p.active).toBe(3);
    const y0 = p.y[0]!;
    p.update(0.1);
    expect(p.y[0]).not.toBe(y0);
    for (let i = 0; i < 40; i += 1) p.update(0.1);
    expect(p.active).toBe(0);
  });
  it("alpha fades from 1 to 0 over the lifetime", () => {
    const p = new ParticlePool(4, () => 0.5);
    p.emit({ x: 0, y: 0, kind: "star", count: 1 });
    expect(p.alpha(0)).toBe(1);
    p.update(p.maxLife[0]! / 2);
    expect(p.alpha(0)).toBeCloseTo(0.5, 1);
    p.clear();
    expect(p.alpha(0)).toBe(0);
  });
});

describe("ParticlePool under reduced motion (TASK-185)", () => {
  it("a pool of capacity 0 holds nothing and never throws, whatever is emitted", () => {
    const p = new ParticlePool(0);
    expect(() => {
      for (const kind of ["sparkle", "droplet", "star", "trail", "streak"] as const) p.emit({ x: 0, y: 0, kind, count: 20 });
      p.update(0.1);
    }).not.toThrow();
    expect(p.capacity).toBe(0);
    expect(p.active).toBe(0);
  });
  it("streak sparks are tiny, drift back along the path and are gone within a fraction of a second", () => {
    const p = new ParticlePool(16, () => 0.5);
    p.emit({ x: 0, y: 0, kind: "streak", count: 4, dirX: 1, dirY: 0 });
    expect(p.active).toBe(4);
    expect(p.vx[0]!).toBeLessThan(0); // opposite the direction of travel
    expect(p.size[0]!).toBeLessThan(0.06);
    expect(p.maxLife[0]!).toBeLessThan(0.4);
    for (let i = 0; i < 10; i += 1) p.update(0.05);
    expect(p.active).toBe(0);
  });
});
