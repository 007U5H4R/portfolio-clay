import { describe, expect, it } from "vitest";
import { Project } from "@/data/schema";
import { projects, teachspark } from "@/data/projects";
import { validateAll } from "@/data/index";

/**
 * Positive: all current data parses (and passes the full content gate). Negatives: each planted
 * defect must fail `Project` parse at the exact zod path (technical-plan.md §B S03.05). ≥10 cases.
 */
type AnyProject = Record<string, unknown>;
const valid = (): AnyProject => structuredClone(teachspark) as AnyProject;

/** Parse and return the dotted zod issue paths (empty when parse succeeded). */
function paths(input: unknown): string[] {
  const r = Project.safeParse(input);
  if (r.success) return [];
  return r.error.issues.map((i) => i.path.join("."));
}

describe("data/schema — positive", () => {
  it("the real TeachSpark project parses", () => {
    expect(Project.safeParse(teachspark).success).toBe(true);
  });

  it("validateAll() passes on the live collections", () => {
    expect(validateAll()).toEqual({ ok: true });
  });

  it("the collection holds all 14 records (11 personal + 3 professional) with unique slugs (TKT-15)", () => {
    expect(projects).toHaveLength(14);
    expect(projects.filter((p) => p.category === "personal")).toHaveLength(11);
    expect(projects.filter((p) => p.category === "professional")).toHaveLength(3);
    expect(new Set(projects.map((p) => p.slug)).size).toBe(14);
    // professional entries never carry a public product surface (Solution-PRD §5).
    for (const p of projects.filter((p) => p.category === "professional")) {
      expect(p.links.live).toBeUndefined();
      expect(p.links.demoVideo).toBeUndefined();
      expect(p.featured).toBeUndefined();
    }
    // exactly one large card drives the editorial grid.
    expect(projects.filter((p) => p.gridSize === "large")).toHaveLength(1);
  });
});

describe("data/schema — negatives (zod path asserted)", () => {
  it("metric without asOf → metrics.0.asOf", () => {
    const p = valid();
    p.metrics = [{ value: "8", label: "Activated", context: "week 1, handsets excluded", kind: "self-reported", source: "TS-README-3" }];
    expect(paths(p)).toContain("metrics.0.asOf");
  });

  it("metric source not declared in sources[] → metrics.0.source", () => {
    const p = valid();
    p.metrics = [{ value: "8", label: "Activated", context: "week 1, handsets excluded", asOf: "2026-08-24", kind: "self-reported", source: "NOPE" }];
    expect(paths(p)).toContain("metrics.0.source");
  });

  it("more than three tags → tags", () => {
    const p = valid();
    p.tags = ["AI", "WhatsApp", "EdTech", "Extra"];
    expect(paths(p)).toContain("tags");
  });

  it("chapters out of fixed order → chapters.0.id", () => {
    const p = valid();
    const chapters = structuredClone(teachspark.chapters) as { id: string; title: string }[];
    [chapters[0]!.id, chapters[1]!.id] = [chapters[1]!.id, chapters[0]!.id]; // swap context/problem
    p.chapters = chapters;
    expect(paths(p)).toContain("chapters.0.id");
  });

  it("thinking chain of length 7 → thinking", () => {
    const p = valid();
    const node = { stage: "observation", text: "a".repeat(20), source: "TS-README-3" };
    p.thinking = Array.from({ length: 7 }, () => structuredClone(node));
    expect(paths(p).some((x) => x.startsWith("thinking"))).toBe(true);
  });

  it("professional entry with links.live → links", () => {
    const p = valid();
    p.category = "professional";
    delete p.featured;
    expect(paths(p)).toContain("links");
  });

  it("repoPublic true without github → links.repoPublic", () => {
    const p = valid();
    const links = structuredClone(teachspark.links) as Record<string, unknown>;
    links.repoPublic = true;
    delete links.github;
    p.links = links;
    expect(paths(p)).toContain("links.repoPublic");
  });

  it("deepDive true with fewer than 4 non-empty chapters → overview.deepDive", () => {
    const p = valid();
    p.overview = { thirtySecond: ["A one-line overview of the project for the card face."], deepDive: true };
    expect(paths(p)).toContain("overview.deepDive");
  });

  it("featured on a non-personal project → featured", () => {
    const p = valid();
    p.category = "professional";
    const links = structuredClone(teachspark.links) as Record<string, unknown>;
    delete links.live;
    p.links = links;
    p.featured = 1;
    expect(paths(p)).toContain("featured");
  });

  it("empty sources → sources", () => {
    const p = valid();
    p.sources = [];
    expect(paths(p)).toContain("sources");
  });
});
