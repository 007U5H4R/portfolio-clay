import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Artifact, Metric, Project, SourceRef } from "@/data/schema";
import { Sources } from "@/components/case-study/Sources";
import { projects } from "@/data/projects";
import { projectSources } from "@/lib/sources";

/**
 * TC-158 (TKT-82 AC 2, AC 3): the case-study "Sources" index is derived from the sources the page
 * cites (metrics, then chapter artifacts), de-duplicated in first-appearance order, labels
 * byte-equal to `sources[].label`, a link only where the SourceRef has a public `url`, and the
 * section owns 0 decorations.
 */

const SRC: SourceRef[] = [
  { id: "A-README", label: "Alpha README", ref: "A/README.md:1", inventory: "§1" },
  { id: "A-PRD", label: "Alpha PRD", ref: "A/prd.md", inventory: "§1" },
  { id: "A-LIVE", label: "Alpha live app", ref: "https://alpha.example", inventory: "§1", url: "https://alpha.example" },
  { id: "A-UNUSED", label: "Alpha never cited", ref: "A/x.md", inventory: "§1" },
];

const metric = (source: string): Metric => ({
  value: "17",
  label: "teachers",
  context: "joined the pilot in week one",
  asOf: "2026-09-09",
  kind: "measured",
  source,
});

const FIXTURE: Pick<Project, "metrics" | "chapters" | "sources"> = {
  sources: SRC,
  metrics: [metric("A-PRD"), metric("A-PRD")],
  chapters: [
    {
      id: "context",
      title: "Context",
      body: ["x"],
      artifacts: [
        { id: "i1", type: "insight", source: "A-README", quote: "A quote of some length.", attribution: "A teacher" },
        { id: "m1", type: "metric", source: "A-PRD", metric: metric("A-LIVE") },
      ] satisfies Artifact[],
    },
    {
      id: "problem",
      title: "Problem",
      body: ["y"],
      // two artifacts citing the same source → one row
      artifacts: [
        { id: "e1", type: "experiment", source: "A-README", setup: "Same prompt both ways.", result: "Matched.", learning: "Context wins." },
      ] satisfies Artifact[],
    },
  ] as Project["chapters"],
};

describe("projectSources — TC-158", () => {
  it("returns unique ids in first-appearance order (metrics, then artifacts)", () => {
    expect(projectSources(FIXTURE).map((s) => s.id)).toEqual(["A-PRD", "A-README", "A-LIVE"]);
  });

  it("uses the data's label byte-for-byte and links only where a url exists", () => {
    const rows = projectSources(FIXTURE);
    for (const row of rows) {
      const ref = SRC.find((s) => s.id === row.id)!;
      expect(row.label).toBe(ref.label);
      expect(row.href).toBe(ref.url);
      if (!ref.url) expect("href" in row).toBe(false);
    }
  });

  it("is empty when the page cites nothing", () => {
    expect(projectSources({ sources: SRC, metrics: [], chapters: [] })).toEqual([]);
  });

  it("every real project: labels exist in its sources[], no duplicates, href iff url", () => {
    for (const project of projects) {
      const rows = projectSources(project);
      expect(new Set(rows.map((r) => r.id)).size, project.slug).toBe(rows.length);
      for (const row of rows) {
        const ref = project.sources.find((s) => s.id === row.id);
        expect(ref, `${project.slug}:${row.id}`).toBeDefined();
        expect(row.label).toBe(ref!.label);
        expect(row.href).toBe(ref!.url);
      }
    }
    expect(projectSources(projects.find((p) => p.slug === "teachspark")!).length).toBeGreaterThan(0);
  });
});

describe("<Sources> — TC-158", () => {
  const html = renderToStaticMarkup(createElement(Sources, { sources: projectSources(FIXTURE) }));

  it("renders one <li> per unique source, labels verbatim, one external link for the url source", () => {
    expect(html).toContain('class="sources"');
    expect(html).toContain("Where every line on this page comes from");
    expect(html.match(/<li/g)).toHaveLength(3);
    for (const label of ["Alpha README", "Alpha PRD", "Alpha live app"]) expect(html).toContain(label);
    expect(html).not.toContain("Alpha never cited");
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toContain('href="https://alpha.example"');
    expect(html).not.toContain("A/README.md"); // `ref` is never rendered
  });

  it("owns 0 decorations (§3.3) and renders nothing for an empty list", () => {
    expect(html).not.toContain("data-decor");
    expect(renderToStaticMarkup(createElement(Sources, { sources: [] }))).toBe("");
  });
});
