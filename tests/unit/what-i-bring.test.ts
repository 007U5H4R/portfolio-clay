import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { projects } from "@/data/projects";
import { wibHeading, wibStages, wibStatement } from "@/data/what-i-bring";

/**
 * TASK-187 — the "What I Bring" journey data. The reference image invented tools; this suite keeps the page honest:
 * seven stages in the spec's order, every tool / example / proof figure traceable to `data/`, and the five
 * verified-absent names never present.
 */
const dataDir = resolve(process.cwd(), "data");
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|json)$/.test(f) && f !== "what-i-bring.ts" ? [p] : [];
  });
}
const corpus = walk(dataDir)
  .map((f) => readFileSync(f, "utf8"))
  .join("\n")
  .toLowerCase();

describe("data/what-i-bring (TASK-187)", () => {
  it("has the 7 stages in journey order, numbered 01-07", () => {
    expect(wibStages.map((s) => s.id)).toEqual(["ambiguity", "discovery", "product", "ai-genai", "technology", "execution", "impact"]);
    expect(wibStages.map((s) => s.number)).toEqual(["01", "02", "03", "04", "05", "06", "07"]);
    expect(wibHeading).toBe("What I Bring");
    expect(wibStatement).toBe("I turn ambiguous problems into shipped products.");
  });

  it("gives every stage a heading, 5-7 capabilities and a principle", () => {
    for (const s of wibStages) {
      expect(s.heading.length, s.id).toBeGreaterThan(10);
      expect(s.capabilities.length, s.id).toBeGreaterThanOrEqual(5);
      expect(s.capabilities.length, s.id).toBeLessThanOrEqual(7);
      expect(s.principle.length, s.id).toBeGreaterThan(0);
    }
  });

  it("keeps every panel to at most five capabilities and three tools so the stage illustration is never cropped (TASK-216)", () => {
    for (const s of wibStages) {
      expect(s.capabilities.length, s.id).toBeLessThanOrEqual(5);
      expect(s.tools.length, s.id).toBeLessThanOrEqual(3);
    }
  });

  it("every tool and proof figure exists in data/ (evidence term found in the corpus)", () => {
    const claims = wibStages.flatMap((s) => [
      ...s.tools.map((t) => [s.id, t.label, t.evidence] as const),
      ...(s.proof ?? []).map((p) => [s.id, p.label, p.evidence] as const),
    ]);
    expect(claims.length).toBeGreaterThan(15);
    for (const [stage, label, evidence] of claims) {
      expect(corpus.includes(evidence.toLowerCase()), `${stage}: "${label}" needs "${evidence}" in data/`).toBe(true);
    }
  });

  it("the technology capabilities that name a product are in data/", () => {
    const named = ["BigQuery", "Spanner", "Supabase", "Next.js", "Vercel", "Railway", "GCP", "AWS", "Jira", "Azure DevOps", "SAFe", "Kanban", "Scrum"];
    for (const n of named) expect(corpus.includes(n.toLowerCase()), n).toBe(true);
    const text = wibStages.flatMap((s) => s.capabilities).join(" | ");
    for (const n of ["BigQuery", "Spanner", "Supabase", "Next.js", "Vercel", "Railway", "Jira", "Azure DevOps", "SAFe"]) expect(text).toContain(n);
  });

  it("never mentions the tools the reference image invented (LangChain, Planview, Confluence, Miro, OKR)", () => {
    const text = JSON.stringify(wibStages);
    expect(text).not.toMatch(/langchain|planview|confluence|miro\b|\bokrs?\b|workshops?/i);
  });

  it("keeps the self-reported label on both proof figures, and invents no other number", () => {
    const impact = wibStages.find((s) => s.id === "impact")!;
    expect(impact.proof?.map((p) => `${p.value} ${p.label}`)).toEqual(["12 features in 11 months", "30% delivery-cycle reduction"]);
    for (const p of impact.proof!) expect(p.note).toBe("self-reported");
    for (const s of wibStages.filter((s) => s.id !== "impact")) expect(s.proof).toBeUndefined();
  });

  it("ships the landscape in both themes and one illustration per stage (TASK-216), each referenced from the data", () => {
    for (const f of ["journey-landscape-light", "journey-landscape-dark"])
      expect(statSync(resolve(process.cwd(), `public/media/experience/${f}.webp`)).size, f).toBeGreaterThan(5000);
    for (const s of wibStages) {
      expect(s.art.src, s.id).toBe(`/media/experience/stage-${s.id}.webp`);
      expect(statSync(resolve(process.cwd(), `public${s.art.src}`)).size, s.id).toBeGreaterThan(5000);
      expect(s.art.alt.length, s.id).toBeGreaterThan(20);
    }
  });

  it("every tool-to-project pairing exists in data/projects (TASK-201): the slug, the display name and the evidence term in that project's record", () => {
    const paired = wibStages.flatMap((st) => st.tools.filter((t) => t.project).map((t) => ({ stage: st.id, tool: t })));
    expect(paired.length).toBeGreaterThan(0);
    for (const { stage, tool } of paired) {
      const pr = tool.project!;
      const project = projects.find((p) => p.slug === pr.slug);
      expect(project, `${stage}: ${tool.label} -> unknown project slug "${pr.slug}"`).toBeDefined();
      expect(project!.name.toLowerCase(), `${stage}: ${tool.label} -> "${pr.name}" is not (part of) the project name`).toContain(pr.name.toLowerCase());
      expect(JSON.stringify(project).toLowerCase(), `${stage}: ${tool.label} -> "${pr.evidence}" not in the ${pr.slug} record`).toContain(pr.evidence.toLowerCase());
    }
  });

  it("never pairs a tool the data does not back: Interviews, JTBD, Vertex AI, BigQuery, Jira, Azure DevOps and SAFe stay label-less", () => {
    const bare = new Set(["Interviews", "JTBD", "Vertex AI", "BigQuery", "Jira", "Azure DevOps", "SAFe"]);
    for (const t of wibStages.flatMap((s) => s.tools)) if (bare.has(t.label)) expect(t.project, t.label).toBeUndefined();
  });
});
