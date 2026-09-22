import type { SourceRef } from "@/data/schema";
import { impactMetrics, impactSources } from "@/data/impact";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ArtifactGrid, MetricCard } from "@/components/case-study/artifacts";

/**
 * `/about`'s "Impact" section (Design.md §3 Timeline section: "`Impact` numbers use the
 * `MetricCard` artifact shape (value + label + context, never a naked number, per
 * DESIGN_DIRECTION §1 rule 4)"; TSK-24, TKT-40 AC 2, TC-095, EVAL-013).
 *
 * Builds the id→`SourceRef` map from `impactSources` and resolves each `impactMetrics` row's
 * `source`, exactly like `CaseStudyHeader` — failing loud (never silently dropping a metric) if a
 * row references a source `impactSources` doesn't declare. `MetricCard` itself also throws if a
 * metric reaches it without `asOf`/`source` (EVAL-013's render-time backstop), so an unsourced
 * number can never render.
 *
 * `card` variant + the reused `ArtifactGrid` (1-up mobile / 2-up ≥768 / 3-up ≥1024 — the same
 * chapter-artifact grid TKT-20 already built) rather than a bespoke grid, since Impact's metrics
 * are the same clay-tier artifact shape as a chapter's `MetricCard`s. The kind badge
 * (Measured/Structural/Self-reported) is rendered by `MetricCard` itself — never re-printed here.
 *
 * Server component: no interactivity.
 */
export function Impact() {
  const bySourceId = new Map<string, SourceRef>(impactSources.map((s) => [s.id, s]));
  const rows = impactMetrics.map((metric) => {
    const source = bySourceId.get(metric.source);
    if (!source) {
      throw new Error(
        `Impact: metric (label="${metric.label}") references source "${metric.source}" not declared in impactSources[] (EVAL-013).`,
      );
    }
    return { metric, source };
  });

  return (
    <Section id="impact" aria-labelledby="impact-heading">
      <SectionHeading
        id="impact-heading"
        eyebrow="Evidence"
        title="Impact"
        lead="Numbers from AmEx, Godrej, TeachSpark, and RailCite — each dated and labelled by how it was verified."
        className="mb-[var(--space-8)]"
      />

      <ArtifactGrid>
        {rows.map(({ metric, source }) => (
          <MetricCard key={metric.label} metric={metric} source={source} variant="card" />
        ))}
      </ArtifactGrid>
    </Section>
  );
}
