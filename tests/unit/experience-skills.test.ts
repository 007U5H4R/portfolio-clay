import { describe, expect, it } from "vitest";
import { collections, validateAll } from "@/data/index";
import { experience } from "@/data/experience";
import { skills } from "@/data/skills";

/**
 * TSK-22 — `data/experience.ts` + `data/skills.ts` (TKT-40 AC 1–5, TC-094).
 * Content correctness (every string traces to CONTENT_INVENTORY §4.1–4.5) is verified by hand in
 * docs/reports/TSK-22.md; this file asserts the structural/schema/truth invariants that TC-094
 * requires and that a future edit could silently break.
 */
describe("data/experience + data/skills (TSK-22)", () => {
  it("validateAll() reports no issues for the live collections (experience + skills wired in)", () => {
    expect(validateAll(collections)).toEqual({ ok: true });
  });

  it("has exactly 4 experience roles with the TimelineNode-matching ids (AC 1)", () => {
    expect(experience).toHaveLength(4);
    expect(experience.map((e) => e.id).sort()).toEqual(["amex", "godrej", "quantiphi", "shellkode"]);
  });

  it("marks scale 'not recorded' for every role §4.5 lists as MISSING, and a real figure for AmEx (AC 2)", () => {
    const byId = new Map(experience.map((e) => [e.id, e]));
    expect(byId.get("godrej")?.scale).toBe("not recorded");
    expect(byId.get("quantiphi")?.scale).toBe("not recorded");
    expect(byId.get("shellkode")?.scale).toBe("not recorded");
    expect(byId.get("amex")?.scale).not.toBe("not recorded");
  });

  it("never labels a résumé-only outcome 'measured' (AC 5)", () => {
    for (const e of experience) {
      expect(e.outcomes.length).toBeGreaterThan(0);
      for (const o of e.outcomes) {
        expect(o.kind).toBe("self-reported");
      }
    }
  });

  it("has exactly 4 skill clusters, each with a tone and 3-6 items (AC 6)", () => {
    expect(skills).toHaveLength(4);
    expect(new Set(skills.map((s) => s.id)).size).toBe(4);
    for (const cluster of skills) {
      expect(cluster.items.length).toBeGreaterThanOrEqual(3);
      expect(cluster.items.length).toBeLessThanOrEqual(6);
      expect(cluster.tone).toBeTruthy();
      expect(cluster.source.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("never contains PMP, a SAFe certification claim, or DOB/phone PII patterns (AC 4)", () => {
    const text = JSON.stringify([...experience, ...skills]);
    expect(text).not.toMatch(/\bPMP\b/);
    expect(text).not.toMatch(/SAFe (Agilist|certif)/i);
    expect(text).not.toMatch(/\b(0?[1-9]|[12]\d|3[01])[/\-.](0?[1-9]|1[0-2])[/\-.](19|20)\d{2}\b/);
    expect(text).not.toMatch(/\+91[\s-]?\d{5}[\s-]?\d{5}/);
    expect(text).not.toMatch(/\b\d{10}\b/);
  });
});
