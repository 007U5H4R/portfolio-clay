import { describe, expect, it } from "vitest";
import { caseStudies, caseStudyInputs, caseStudySourceIds, caseStudyWords } from "@/data/case-studies";
import { CaseStudy } from "@/data/schema";
import { getProject } from "@/data/projects";
import { validateAll } from "@/data/index";
import { portfolioEntries } from "@/data/portfolio";

/**
 * TASK-130 — the case-study records (spec §37): schema-valid, one per personal build at most, every
 * source id declared by the project, prose within the spec §4 ceiling, no development copy (§31),
 * every proof carries an evidence badge (§19), and 1–3 product accents (§29).
 */
const DEV_COPY = /\b(draft|pending sign-?off|coming soon|placeholder|todo|tbd|stand-in|lorem)\b/i;

describe("case studies (TASK-130)", () => {
  it("every record parses and the content gate passes", () => {
    for (const input of caseStudyInputs) expect(CaseStudy.safeParse(input).success).toBe(true);
    expect(validateAll()).toEqual({ ok: true });
  });

  it("belong to distinct personal builds that have a portfolio entry", () => {
    const slugs = caseStudies.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(getProject(slug)?.category, slug).toBe("personal");
      expect(portfolioEntries.some((e) => e.slug === slug), slug).toBe(true);
    }
  });

  it("cite only sources the project declares", () => {
    for (const study of caseStudies) {
      const declared = new Set([...getProject(study.slug)!.sources, ...study.extraSources].map((s) => s.id));
      for (const id of caseStudySourceIds(study)) expect(declared.has(id), `${study.slug}: ${id}`).toBe(true);
    }
  });

  it("keep public prose at or under the spec §4 ceiling (600 words)", () => {
    for (const study of caseStudies) expect(caseStudyWords(study), study.slug).toBeLessThanOrEqual(600);
  });

  it("carry no development copy (spec §31)", () => {
    for (const study of caseStudies) {
      // theme/story are internal art-direction notes, never rendered.
      const visible = { ...study, theme: undefined, story: undefined };
      expect(JSON.stringify(visible), study.slug).not.toMatch(DEV_COPY);
    }
  });

  it("give every proof an evidence badge and every dated proof a real date", () => {
    for (const study of caseStudies) {
      const proofs = [...study.hero.proofs, ...study.sections.flatMap((s) => (s.kind === "outcome" ? s.proofs : []))];
      for (const proof of proofs) expect(["measured", "self-reported", "structural", "prototype"]).toContain(proof.kind);
      expect(study.hero.proofs.length, `${study.slug}: 0–4 hero proofs (spec §5)`).toBeLessThanOrEqual(4);
    }
  });

  it("use 1–3 accents and 3–7 sections, with unique ids", () => {
    for (const study of caseStudies) {
      expect(study.theme.accents.length).toBeGreaterThanOrEqual(1);
      expect(study.theme.accents.length).toBeLessThanOrEqual(3);
      const ids = study.sections.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("RailCite: '0 invented citations' is structural, never measured (CONTENT_INVENTORY §8.2)", () => {
    const rc = caseStudies.find((c) => c.slug === "railcite")!;
    const zero = rc.hero.proofs.find((p) => p.label === "invented citations")!;
    expect(zero.kind).toBe("structural");
    expect(JSON.stringify(rc)).not.toMatch(/\b(625|148) tests\b/);
  });
});
