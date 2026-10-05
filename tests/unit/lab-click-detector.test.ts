/**
 * TASK-143.2 — the secret click detector (gummy-bear.md §9, EVAL-030): 5 clicks within 3.5 s
 * trigger; 4 clicks, or a slow sequence, never do; each click reports its hint step (1–5).
 */
import { describe, expect, it } from "vitest";
import { CLICK_WINDOW_MS, CLICKS_NEEDED, createClickDetector } from "@/lib/lab/click-detector";

describe("createClickDetector", () => {
  it("needs 5 clicks inside 3.5 s", () => {
    expect(CLICKS_NEEDED).toBe(5);
    expect(CLICK_WINDOW_MS).toBe(3500);
  });

  it("triggers on the fifth rapid click and reports steps 1..5", () => {
    const d = createClickDetector();
    const steps = [0, 300, 600, 900, 1200].map((t) => d.click(t));
    expect(steps.map((s) => s.step)).toEqual([1, 2, 3, 4, 5]);
    expect(steps.map((s) => s.triggered)).toEqual([false, false, false, false, true]);
  });

  it("does not trigger on four clicks", () => {
    const d = createClickDetector();
    const out = [0, 200, 400, 600].map((t) => d.click(t));
    expect(out.some((s) => s.triggered)).toBe(false);
  });

  it("does not trigger on a slow sequence (first to fifth > 3.5 s)", () => {
    const d = createClickDetector();
    const out = [0, 1000, 2000, 3000, 4000].map((t) => d.click(t));
    expect(out.some((s) => s.triggered)).toBe(false);
  });

  it("triggers at exactly 3.5 s but not 1 ms later", () => {
    const a = createClickDetector();
    expect([0, 800, 1600, 2400, 3500].map((t) => a.click(t)).at(-1)?.triggered).toBe(true);
    const b = createClickDetector();
    expect([0, 800, 1600, 2400, 3501].map((t) => b.click(t)).at(-1)?.triggered).toBe(false);
  });

  it("a long pause resets the hint step to 1", () => {
    const d = createClickDetector();
    d.click(0);
    d.click(200);
    expect(d.click(10_000).step).toBe(1);
  });

  it("a sliding window still triggers once five clicks fit", () => {
    const d = createClickDetector();
    const out = [0, 3000, 3200, 3400, 3600, 3800].map((t) => d.click(t));
    // the click at 0 slides out; 3000..3800 are five clicks within 0.8 s
    expect(out.at(-1)?.triggered).toBe(true);
    expect(out.slice(0, -1).some((s) => s.triggered)).toBe(false);
  });

  it("resets after triggering so the next five clicks are needed again", () => {
    const d = createClickDetector();
    [0, 100, 200, 300, 400].forEach((t) => d.click(t));
    expect(d.click(500).step).toBe(1);
    expect(d.click(600).triggered).toBe(false);
  });

  it("reset() clears progress", () => {
    const d = createClickDetector();
    d.click(0);
    d.click(100);
    d.reset();
    expect(d.click(200).step).toBe(1);
  });
});
