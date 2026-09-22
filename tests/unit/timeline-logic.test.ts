import { describe, expect, it } from "vitest";
import { experience } from "@/data/experience";
import {
  nextNodeIndex,
  roleIdFromHash,
  SECTION_ANCHOR,
  storyCardId,
  textStatesKind,
  toggleOpen,
} from "@/components/timeline/timeline-logic";

/**
 * TKT-41 pure-logic unit suite: the one-open-at-a-time reducer, the deep-link hash parser, the
 * roving-focus index maths, and the badge-suppression rule — the behaviour behind AC 1–3, tested
 * without mounting the client component.
 */
const IDS = experience.map((r) => r.id);

describe("timeline-logic (TKT-41)", () => {
  it("storyCardId builds the `#experience-<id>` target", () => {
    expect(storyCardId("amex")).toBe("experience-amex");
    expect(SECTION_ANCHOR).toBe("experience");
  });

  describe("roleIdFromHash — deep link (AC 2)", () => {
    it("opens the AmEx card for /about#experience-amex", () => {
      expect(roleIdFromHash("#experience-amex", IDS)).toBe("amex");
    });
    it("resolves every real role id", () => {
      for (const id of IDS) expect(roleIdFromHash(`#${storyCardId(id)}`, IDS)).toBe(id);
    });
    it("returns null for the bare section anchor, empty, or unknown targets", () => {
      expect(roleIdFromHash("#experience", IDS)).toBeNull();
      expect(roleIdFromHash("", IDS)).toBeNull();
      expect(roleIdFromHash("#experience-nope", IDS)).toBeNull();
      expect(roleIdFromHash("#something-else", IDS)).toBeNull();
    });
  });

  describe("toggleOpen — exactly one open (AC 3)", () => {
    it("opens from closed", () => {
      expect(toggleOpen(null, "amex")).toBe("amex");
    });
    it("closes when the open one is clicked again", () => {
      expect(toggleOpen("amex", "amex")).toBeNull();
    });
    it("replaces (never accumulates) when another is clicked", () => {
      expect(toggleOpen("amex", "godrej")).toBe("godrej");
    });
  });

  describe("nextNodeIndex — arrow roving (AC 2)", () => {
    it("moves forward and back", () => {
      expect(nextNodeIndex(0, 1, 4)).toBe(1);
      expect(nextNodeIndex(2, -1, 4)).toBe(1);
    });
    it("wraps at both ends", () => {
      expect(nextNodeIndex(3, 1, 4)).toBe(0);
      expect(nextNodeIndex(0, -1, 4)).toBe(3);
    });
  });

  describe("textStatesKind — no double-printed qualifier (AC 1)", () => {
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
