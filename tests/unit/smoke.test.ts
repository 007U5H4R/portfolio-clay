import { describe, it, expect } from "vitest";

// Minimal smoke test: proves the Vitest harness (node project) runs (S01.04 gate).
describe("smoke", () => {
  it("runs the test harness", () => {
    expect(1 + 1).toBe(2);
  });
});
