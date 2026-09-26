import { describe, expect, it } from "vitest";
import { hero } from "@/data/hero";

/**
 * TKT-108 (Tushar 2026-09-26, Design.md §11 Dev-50): the hero copy is Tushar's own, quoted verbatim from
 * docs/redesign-mockups/m-009/tushar-2026-09-26/hero-copy-target.png. `components/hero/Hero.tsx` renders
 * the headline as its three parts (the reference's desktop lines) and underlines "problems." in the hand
 * line, so both splits are asserted here.
 */
describe("data/hero · TKT-108 copy", () => {
  it("is the reference copy, verbatim", () => {
    expect(hero.eyebrow.text).toBe("SENIOR PRODUCT MANAGER · ENTERPRISE AI · AI-NATIVE BUILDER");
    expect(`${hero.headline.before}${hero.headline.highlight}${hero.headline.after}`).toBe(
      "I turn messy problems into AI-native products people actually use.",
    );
    expect(hero.handLine.text).toBe("Same curiosity. Bigger problems. Better products.");
    expect(hero.support.text).toBe(
      "7+ years across product, cloud, data and AI — from enterprise platforms at Godrej, Quantiphi, Shellkode and American Express to independently built AI products tested with real users.",
    );
  });

  it("splits where the component expects: three headline lines, one 'problems.' in the hand line", () => {
    expect([hero.headline.before.trim(), hero.headline.highlight, hero.headline.after.trim()]).toEqual([
      "I turn messy problems into",
      "AI-native products",
      "people actually use.",
    ]);
    expect(hero.handLine.text.split("problems.")).toHaveLength(2);
  });

  it("every TKT-108 row cites the reference as its source", () => {
    for (const row of [hero.eyebrow, hero.headline, hero.handLine, hero.support]) {
      expect(row.source).toContain("hero-copy-target.png");
    }
  });
});
