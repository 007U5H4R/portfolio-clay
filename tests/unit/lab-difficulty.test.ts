/** TASK-143.4 — difficulty ramps gradually and never becomes unfair (gummy-bear.md §20). */
import { describe, expect, it } from "vitest";
import { difficultyAt } from "@/lib/lab/difficulty";

describe("difficultyAt", () => {
  it("0–10 s is calm: static platforms, normal gravity, no wind, no rise", () => {
    for (const t of [0, 3, 9.9]) {
      const d = difficultyAt(t);
      expect(d).toMatchObject({ phase: 0, motion: 0, gravityMul: 1, windX: 0, dangerRise: 0, vanish: false });
    }
  });
  it("10–20 s the arena starts moving, eased in", () => {
    expect(difficultyAt(10).motion).toBe(0);
    expect(difficultyAt(11.5).motion).toBeGreaterThan(0);
    expect(difficultyAt(11.5).motion).toBeLessThan(difficultyAt(15).motion);
    expect(difficultyAt(15).phase).toBe(1);
  });
  it("20–35 s adds gravity pulses, wind and vanishing platforms", () => {
    const samples = Array.from({ length: 150 }, (_, i) => difficultyAt(20 + i * 0.1));
    expect(Math.max(...samples.map((d) => d.gravityMul))).toBeGreaterThan(1.2);
    expect(Math.max(...samples.map((d) => Math.abs(d.windX)))).toBeGreaterThan(0.5);
    expect(samples.every((d) => d.vanish)).toBe(true);
  });
  it("35–50 s shifts to low gravity at times and the danger floor starts rising", () => {
    const samples = Array.from({ length: 150 }, (_, i) => difficultyAt(35 + i * 0.1));
    expect(Math.min(...samples.map((d) => d.gravityMul))).toBeLessThan(0.7);
    expect(difficultyAt(49).dangerRise).toBeGreaterThan(difficultyAt(36).dangerRise);
    expect(samples.every((d) => d.padShift !== undefined)).toBe(true);
  });
  it("50+ s is LAB UNSTABLE and keeps ramping without becoming impossible", () => {
    expect(difficultyAt(60).label).toBe("LAB UNSTABLE");
    expect(difficultyAt(120).motion).toBeGreaterThan(difficultyAt(55).motion);
    for (const t of [50, 90, 300, 3000]) {
      const d = difficultyAt(t);
      expect(d.dangerRise).toBeLessThanOrEqual(0.95);
      expect(d.motion).toBeLessThanOrEqual(2);
      expect(d.gravityMul).toBeGreaterThanOrEqual(0.5);
      expect(d.gravityMul).toBeLessThanOrEqual(1.45);
      expect(d.dangerRate).toBeLessThanOrEqual(1.3);
    }
  });
  it("is monotone in phase", () => {
    let last = 0;
    for (let t = 0; t < 120; t += 0.5) {
      const p = difficultyAt(t).phase;
      expect(p).toBeGreaterThanOrEqual(last);
      last = p;
    }
  });
});
