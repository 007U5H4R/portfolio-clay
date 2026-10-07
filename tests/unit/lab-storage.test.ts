// @vitest-environment jsdom
/** TASK-143.4 — high score / achievements live in localStorage only, and never throw (gummy-bear.md §32, §35). */
import { afterEach, describe, expect, it, vi } from "vitest";
import { ACHIEVEMENTS, STORAGE_KEY, loadStored, recordRun, unlock } from "@/lib/lab/storage";

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("lab storage", () => {
  it("starts empty", () => {
    expect(loadStored()).toEqual({ bestScore: 0, bestTime: 0, maxCombo: 1, achievements: [] });
  });

  it("recordRun keeps the best of each stat and flags a new best score", () => {
    expect(recordRun({ score: 500, timeS: 20, combo: 3 }).newBest).toBe(true);
    const lower = recordRun({ score: 300, timeS: 40, combo: 2 });
    expect(lower.newBest).toBe(false);
    expect(lower.stored).toMatchObject({ bestScore: 500, bestTime: 40, maxCombo: 3 });
    expect(recordRun({ score: 900, timeS: 5, combo: 1 }).newBest).toBe(true);
    expect(loadStored().bestScore).toBe(900);
  });

  it("persists across a fresh load (a reload)", () => {
    recordRun({ score: 1234, timeS: 31, combo: 7 });
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!).bestScore).toBe(1234);
    expect(loadStored().maxCombo).toBe(7);
  });

  it("unlock reports newly unlocked achievements exactly once", () => {
    expect(unlock("CURIOUS_MIND")).toBe(true);
    expect(unlock("CURIOUS_MIND")).toBe(false);
    expect(loadStored().achievements).toEqual(["CURIOUS_MIND"]);
    expect(Object.keys(ACHIEVEMENTS)).toHaveLength(5);
  });

  it("survives corrupt data and blocked storage without throwing", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadStored().bestScore).toBe(0);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ bestScore: "x", achievements: [1, "A"] }));
    expect(loadStored()).toEqual({ bestScore: 0, bestTime: 0, maxCombo: 1, achievements: ["A"] });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => recordRun({ score: 1, timeS: 1, combo: 1 })).not.toThrow();
    expect(() => unlock("WOBBLE_MASTER")).not.toThrow();
    expect(loadStored().bestScore).toBe(0);
  });

  it("only ever uses its own key (nothing else is written)", () => {
    recordRun({ score: 10, timeS: 2, combo: 1 });
    unlock("CURIOUS_MIND");
    expect(window.localStorage.length).toBe(1);
  });
});
