import { describe, expect, it } from "vitest";
import { awards, education, languages, papers, patent, researchDisclaimer } from "@/data/credentials";

/**
 * TKT-42 — `data/credentials.ts` (Awards/Research/Education, CONTENT_INVENTORY §4.6–4.8). Not
 * part of the `Collections`/`validateAll()` registry (mirrors `data/impact.ts`'s own suite in
 * `experience-skills.test.ts`) — this file is the schema/truth gate for this module.
 */
describe("data/credentials (TKT-42)", () => {
  it("has exactly 3 awards, none of them PMP or SAFe Agilist", () => {
    expect(awards).toHaveLength(3);
    const text = JSON.stringify(awards);
    expect(text).not.toMatch(/\bPMP\b/);
    expect(text).not.toMatch(/SAFe (Agilist|certif)/i);
  });

  it("uses the certificate patent number (429867), never the résumé's SL No. misprint", () => {
    expect(patent.number).toBe("IN 429867");
    const text = JSON.stringify([patent, ...papers, researchDisclaimer]);
    expect(text).toContain("429867");
    // The résumé's SL No. is the exact string the certificate/rights gate (resume-pii.test.ts)
    // also forbids as a patent-number misprint — never present here in any form.
    expect(text).not.toContain("044152784");
  });

  it("carries the exact rights/safety disclaimer", () => {
    expect(researchDisclaimer).toBe(
      "Patent owned by NIT–Calicut; research prototype, not an approved diagnostic.",
    );
  });

  it("has exactly 2 papers; Langmuir has a resolvable DOI, Soft Matter has none (DOI pending, never fabricated)", () => {
    expect(papers).toHaveLength(2);
    const langmuir = papers.find((p) => p.id === "langmuir-2025");
    const softMatter = papers.find((p) => p.id === "soft-matter-2023");

    expect(langmuir?.doi).toBe("10.1021/acs.langmuir.5c00784");
    expect(langmuir?.doiHref).toBe("https://doi.org/10.1021/acs.langmuir.5c00784");

    expect(softMatter?.doi).toBeUndefined();
    expect(softMatter?.doiHref).toBeUndefined();
    expect(softMatter?.authors).toBeUndefined();
  });

  it("has exactly 2 education entries (M.Tech NIT Calicut 2022, B.E. BIT Durg 2016)", () => {
    expect(education).toHaveLength(2);
    const byId = new Map(education.map((e) => [e.id, e]));
    expect(byId.get("mtech-nitc")).toMatchObject({ year: "2022" });
    expect(byId.get("be-bitd")).toMatchObject({ year: "2016" });
  });

  it("carries no DOB/phone PII patterns anywhere in the module", () => {
    const text = JSON.stringify([awards, patent, papers, education, languages, researchDisclaimer]);
    expect(text).not.toMatch(/\b(0?[1-9]|[12]\d|3[01])[/\-.](0?[1-9]|1[0-2])[/\-.](19|20)\d{2}\b/);
    expect(text).not.toMatch(/\+91[\s-]?\d{5}[\s-]?\d{5}/);
    expect(text).not.toMatch(/\b\d{10}\b/);
  });
});
