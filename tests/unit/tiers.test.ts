import { describe, expect, it } from "vitest";
import {
  toneClass,
  type Tone,
} from "@/components/clay/tiers";

describe("clay tiers", () => {
  it("toneClass covers every tone", () => {
    const tones: Tone[] = ["neutral", "lavender", "sky", "mint", "blush", "peach", "butter"];
    for (const tone of tones) {
      expect(toneClass[tone].length).toBeGreaterThan(0);
    }
  });
});
