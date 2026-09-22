import { describe, expect, it } from "vitest";
import { collections, validateAll } from "@/data/index";
import { writing } from "@/data/writing";
import { ALL_PROJECT_SLUGS } from "@/lib/anchors";

/**
 * TKT-43 — `data/writing.ts` (tickets.md TKT-43 AC 1–3, TDD gate item 3). Content correctness
 * (every quoted passage traces to CONTENT_INVENTORY §5) is verified by hand in
 * `docs/reports/TKT-43.md`; this file asserts the structural/schema/truth invariants a future edit
 * could silently break — the DRAFT-everywhere rule above all (AC2/AC3).
 */
describe("data/writing (TKT-43)", () => {
  it("validateAll() reports no issues for the live collections (writing wired in)", () => {
    expect(validateAll(collections)).toEqual({ ok: true });
  });

  it("has exactly the 5 DRAFT candidate essays from CONTENT_INVENTORY §5, unique slugs", () => {
    expect(writing).toHaveLength(5);
    expect(new Set(writing.map((e) => e.slug)).size).toBe(5);
  });

  it("every essay is draft:true and carries no publishedOn (nothing is published — AC2)", () => {
    for (const essay of writing) {
      expect(essay.draft, `essay "${essay.slug}" must be draft:true`).toBe(true);
      expect(essay.publishedOn, `essay "${essay.slug}" must not carry a publish date`).toBeUndefined();
    }
  });

  it("every essay has at least one sourced passage and a labelled DRAFT framing paragraph", () => {
    for (const essay of writing) {
      expect(essay.passages.length, `essay "${essay.slug}"`).toBeGreaterThanOrEqual(1);
      expect(essay.framing.length, `essay "${essay.slug}" framing`).toBeGreaterThanOrEqual(40);
      expect(essay.framing, `essay "${essay.slug}" framing must be clearly labelled DRAFT`).toMatch(
        /Draft — pending sign-off/,
      );
    }
  });

  it("every passage.source resolves to a declared SourceRef.id (EVAL-013 — EssayBody would render no caption otherwise)", () => {
    for (const essay of writing) {
      const ids = new Set(essay.sources.map((s) => s.id));
      for (const passage of essay.passages) {
        expect(
          ids.has(passage.source),
          `essay "${essay.slug}" passage references undeclared source "${passage.source}"`,
        ).toBe(true);
      }
    }
  });

  it("every essay's relatedProject (when present) is a real personal-build slug", () => {
    for (const essay of writing) {
      if (essay.relatedProject) {
        expect(
          (ALL_PROJECT_SLUGS as readonly string[]).includes(essay.relatedProject),
          `essay "${essay.slug}" relatedProject "${essay.relatedProject}" is not a known project slug`,
        ).toBe(true);
      }
    }
  });

  it("never contains PMP, a SAFe certification claim, or DOB/phone PII patterns", () => {
    const text = JSON.stringify(writing);
    expect(text).not.toMatch(/\bPMP\b/);
    expect(text).not.toMatch(/SAFe (Agilist|certif)/i);
    expect(text).not.toMatch(/\b(0?[1-9]|[12]\d|3[01])[/\-.](0?[1-9]|1[0-2])[/\-.](19|20)\d{2}\b/);
    expect(text).not.toMatch(/\+91[\s-]?\d{5}[\s-]?\d{5}/);
  });
});
