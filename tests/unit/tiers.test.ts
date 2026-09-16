import { describe, expect, it } from "vitest";
import {
  headerGlassClass,
  tierClass,
  toneClass,
  type ClayProps,
  type Tone,
} from "@/components/clay/tiers";

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

  it("glass is exported separately from the tier map (glass is NOT a tier)", () => {
    expect(headerGlassClass).toBe("glass");
    // The tier union has no 'glass' member — proven structurally by tierClass's keys.
    expect(Object.keys(tierClass).sort()).toEqual(["card", "flat", "hero", "utility"]);
  });

  it("D1: tier 'flat' with a non-neutral tone is a compile-time type error", () => {
    // @ts-expect-error — tier:'flat' only permits tone:'neutral' (D1)
    const invalid: ClayProps = { tier: "flat", tone: "lavender" };
    expect(invalid).toBeTruthy();
  });

  it("D1: tier 'flat' with interactive is a compile-time type error", () => {
    // @ts-expect-error — tier:'flat' forbids interactive (nothing to lift/press) (D1)
    const invalid: ClayProps = { tier: "flat", interactive: true };
    expect(invalid).toBeTruthy();
  });

  it("D1: tier 'utility' with interactive (non-filter) is a compile-time type error", () => {
    // @ts-expect-error — utility has "no press state" (Design.md §2); the only interactive
    // utility-radius control is ClayPill variant:'filter', which does not use ClayProps (D1).
    const invalid: ClayProps = { tier: "utility", interactive: true };
    expect(invalid).toBeTruthy();
  });

  it("a hero/card tier accepts any tone + interactive (sanity check for the D1 guard)", () => {
    const valid: ClayProps = { tier: "card", tone: "lavender", interactive: true };
    expect(valid.tier).toBe("card");
    const validUtility: ClayProps = { tier: "utility", tone: "sky" };
    expect(validUtility.tier).toBe("utility");
  });
});
