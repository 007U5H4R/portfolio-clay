import { describe, expect, it } from "vitest";
import { experience } from "@/data/experience";
import * as logic from "@/components/timeline/timeline-logic";
import { SECTION_ANCHOR, storyCardId, textStatesKind, TIMELINE_LEAD } from "@/components/timeline/timeline-logic";

/**
 * timeline-logic unit suite (TKT-41, trimmed by TKT-87 — Dev-11 always-open cards). The open/close
 * reducer, hash parser and roving-focus maths were deleted with the click-to-open behaviour; what
 * remains is the anchor contract, the S18 lead constant and the badge-suppression rule.
 */
describe("timeline-logic (TKT-41 → TKT-87)", () => {
  it("storyCardId builds the `#experience-<id>` target; the section anchor stays `experience`", () => {
    expect(storyCardId("amex")).toBe("experience-amex");
    expect(SECTION_ANCHOR).toBe("experience");
  });

  it("exports no open/close, hash or roving-focus helpers any more (TC-167 step 5)", () => {
    expect(Object.keys(logic).sort()).toEqual(["SECTION_ANCHOR", "TIMELINE_LEAD", "storyCardId", "textStatesKind"]);
  });

  it("the lead says oldest to newest (S18)", () => {
    expect(TIMELINE_LEAD).toContain("oldest to newest");
    expect(TIMELINE_LEAD).not.toContain("newest to oldest");
  });

  describe("textStatesKind — no double-printed qualifier (TKT-41 AC 1)", () => {
    it("detects the kind phrase already in the text", () => {
      expect(textStatesKind("-30% cycle time (self-reported)", "Self-reported")).toBe(true);
    });
    it("is false when the text omits the kind phrase", () => {
      expect(textStatesKind("12 features shipped in 11 months", "Self-reported")).toBe(false);
      expect(textStatesKind("Zero data loss during migrations (unquantified)", "Self-reported")).toBe(false);
    });
    it("suppresses the badge for every AmEx outcome (all carry '(self-reported)' inline)", () => {
      const amex = experience.find((r) => r.id === "amex")!;
      for (const o of amex.outcomes) expect(textStatesKind(o.text, "Self-reported")).toBe(true);
    });
    it("keeps the badge for Godrej outcomes (none carry the phrase inline)", () => {
      const godrej = experience.find((r) => r.id === "godrej")!;
      for (const o of godrej.outcomes) expect(textStatesKind(o.text, "Self-reported")).toBe(false);
    });
  });
});
