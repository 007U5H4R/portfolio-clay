import type { Project } from "@/data/schema";

/** One row of the case-study "Sources" index: the data's label, verbatim, plus its public URL if any. */
export type ProjectSource = { id: string; label: string; href?: string };

/**
 * The page-level provenance index (TKT-82, Design.md §7.3 "Sources", TC-158): the unique
 * `SourceRef`s this case study actually cites on the page — headline `metrics[].source`, then every
 * chapter artifact's `source` (and a metric artifact's own `metric.source`) — de-duplicated by id
 * and ordered by first appearance. No new content: `label` is `SourceRef.label` byte-for-byte and
 * `href` exists only when the `SourceRef` declares a public `url` (`ref` is never exposed). An id
 * with no declared `SourceRef` is skipped (the schema refinement already rejects that at build time).
 */
export function projectSources(project: Pick<Project, "metrics" | "chapters" | "sources">): ProjectSource[] {
  const cited: string[] = [];
  for (const metric of project.metrics) cited.push(metric.source);
  for (const chapter of project.chapters) {
    for (const artifact of chapter.artifacts) {
      cited.push(artifact.source);
      if (artifact.type === "metric") cited.push(artifact.metric.source);
    }
  }

  const byId = new Map(project.sources.map((source) => [source.id, source]));
  const seen = new Set<string>();
  const rows: ProjectSource[] = [];
  for (const id of cited) {
    if (seen.has(id)) continue;
    seen.add(id);
    const source = byId.get(id);
    if (!source) continue;
    rows.push(source.url ? { id, label: source.label, href: source.url } : { id, label: source.label });
  }
  return rows;
}
