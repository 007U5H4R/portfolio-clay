import { ExternalLink } from "@/components/common/ExternalLink";
import { Container } from "@/components/layout/Container";
import type { ProjectSource } from "@/lib/sources";

export type SourcesProps = {
  /** From `projectSources(project)` — unique, first-appearance order, labels verbatim from the data. */
  sources: readonly ProjectSource[];
};

/**
 * "Sources" (TKT-82, Design.md §7.3; TC-158): the page-level provenance index. `section.sources`
 * on `paper-2` with a dashed top rule, `200px 1fr`: h2 "Where every line on this page comes from",
 * then a 2-column `<ol>` of the unique source labels the page cites — a link only where the data
 * declares a public URL. Zero decorations (§3.3: sources 0), no new content. Returns `null` when
 * the page cites nothing (a thin project with no metrics and no artifacts). Server component.
 */
export function Sources({ sources }: SourcesProps) {
  if (sources.length === 0) return null;
  return (
    <section className="sources" aria-labelledby="sources-h">
      <Container className="sources-wrap">
        <div className="sources-inner">
          <div>
            <p className="sources-eyebrow">Sources</p>
            <h2 id="sources-h" className="sources-h">
              Where every line on this page comes from
            </h2>
          </div>
          <ol className="sources-list">
            {sources.map((source) => (
              <li key={source.id}>
                {source.href ? <ExternalLink href={source.href}>{source.label}</ExternalLink> : source.label}
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
