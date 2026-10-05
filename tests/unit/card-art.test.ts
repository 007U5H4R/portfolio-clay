import { describe, expect, it } from "vitest";
import { BLEED, backEdgeLayers, landscapeLayers, rng, roughen } from "@/lib/card/art";

describe("card landscape art (TASK-146.2, Dev-185)", () => {
  it("is deterministic and seeded", () => {
    expect(rng(5)()).toBe(rng(5)());
    expect(roughen([[0, 0], [100, 0]], 3)).toEqual(roughen([[0, 0], [100, 0]], 3));
    expect(roughen([[0, 0], [100, 0]], 3)).not.toEqual(roughen([[0, 0], [100, 0]], 4));
  });

  it("builds independent layers with the section 45/49 depth ordering", () => {
    const layers = landscapeLayers();
    expect(layers.map((l) => l.id)).toEqual(["far", "peak", "mid", "shore", "water", "land", "ripples"]);
    const far = layers.find((l) => l.id === "far")!;
    const ripples = layers.find((l) => l.id === "ripples")!;
    expect(ripples.k).toBeGreaterThan(far.k);
    expect(ripples.z).toBeGreaterThan(far.z);
    for (const l of layers) expect(l.d).toMatch(/^M-?\d.*Z$/);
  });

  it("overshoots the card edge so parallax cannot expose a gap", () => {
    expect(BLEED).toBeGreaterThanOrEqual(18);
    const first = landscapeLayers().find((l) => l.id === "far")!.d;
    expect(first.startsWith("M0 ") || first.startsWith("M0.")).toBe(true);
  });

  it("has a back edge decoration", () => {
    expect(backEdgeLayers().length).toBe(2);
  });
});
