import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { easings, interactionDurations } from "@/lib/motion";

/**
 * EXE-3 / M-012: the interaction tokens in `app/globals.css @theme` and `lib/motion.ts` must never diverge. This reads the
 * CSS and compares each token to its TypeScript mirror (whitespace-insensitive), so a one-sided edit fails here.
 */
const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
const theme = css.slice(css.indexOf("@theme"));
const norm = (v: string) => v.replace(/\s+/g, "").replace(/(^|[^\d])0\./g, "$1.");
const tokenOf = (name: string) => {
  const m = theme.match(new RegExp(`${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`token ${name} not found in @theme`);
  return norm(m[1]!);
};

describe("interaction motion tokens (Design.md §14.10)", () => {
  it.each([
    ["--ease-paper", easings.paper],
    ["--ease-l1", easings.l1],
    ["--ease-press", easings.press],
    ["--ease-hover", easings.hover],
    ["--ease-reveal", easings.reveal],
  ])("%s matches lib/motion.ts", (name, ts) => {
    expect(tokenOf(name)).toBe(norm(ts));
  });

  it.each([
    ["--dur-l1", interactionDurations.l1],
    ["--dur-l1-out", interactionDurations.l1Out],
    ["--dur-l2", interactionDurations.l2],
    ["--dur-l2-out", interactionDurations.l2Out],
    ["--dur-l3", interactionDurations.l3],
    ["--dur-press", interactionDurations.press],
  ])("%s matches lib/motion.ts", (name, ms) => {
    expect(tokenOf(name)).toBe(`${ms}ms`);
  });

  it("enter durations sit inside their level bands", () => {
    expect(interactionDurations.l1).toBeGreaterThanOrEqual(150);
    expect(interactionDurations.l1Out).toBeGreaterThanOrEqual(150);
    expect(interactionDurations.l1).toBeLessThanOrEqual(250);
    expect(interactionDurations.l2).toBeGreaterThanOrEqual(300);
    expect(interactionDurations.l2).toBeLessThanOrEqual(700);
    expect(interactionDurations.l2Out).toBeGreaterThanOrEqual(300);
    expect(interactionDurations.l3).toBeGreaterThanOrEqual(500);
    expect(interactionDurations.l3).toBeLessThanOrEqual(1200);
  });
});
