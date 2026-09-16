import { describe, expect, it } from "vitest";
import { tierClass, toneClass, type ClayProps, type Tone } from "@/components/clay/tiers";

describe("clay tiers", () => {
  it("flat tier class contains no shadow or gradient", () => {
    expect(tierClass.flat).toBe("");
    expect(tierClass.flat).not.toMatch(/shadow/);
    expect(tierClass.flat).not.toMatch(/gradient/);
  });

  it("hero/card/utility read only the allowed tokens", () => {
    expect(tierClass.hero).toMatch(/shadow-\[var\(--shadow-clay-rest\)\]/);
    expect(tierClass.hero).toMatch(/bg-\[image:var\(--gradient-clay-volume\)\]/);
    expect(tierClass.card).toMatch(/rounded-\[var\(--radius-clay\)\]/);
    expect(tierClass.utility).toMatch(/shadow-\[var\(--shadow-utility\)\]/);
    expect(tierClass.utility).not.toMatch(/gradient/);
  });

  it("toneClass covers every tone", () => {
    const tones: Tone[] = ["neutral", "lavender", "sky", "mint", "blush", "peach", "butter"];
    for (const tone of tones) {
      expect(toneClass[tone].length).toBeGreaterThan(0);
    }
  });

  it("D1: tier 'flat' with a non-neutral tone is a compile-time type error", () => {
    // @ts-expect-error — tier:'flat' only permits tone:'neutral' (D1)
    const invalid: ClayProps = { tier: "flat", tone: "lavender" };
    expect(invalid).toBeTruthy();
  });

  it("a non-flat tier accepts any tone (sanity check for the D1 guard)", () => {
    const valid: ClayProps = { tier: "card", tone: "lavender", interactive: true };
    expect(valid.tier).toBe("card");
  });
});
