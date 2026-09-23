import type { Metric, SourceRef } from "@/data/schema";
import { impactMetrics, impactSources } from "@/data/impact";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ArtifactGrid, MetricCard } from "@/components/case-study/artifacts";

/**
 * `/about`'s "Impact" section (Design.md §3 Timeline section: "`Impact` numbers use the
 * `MetricCard` artifact shape (value + label + context, never a naked number, per
 * DESIGN_DIRECTION §1 rule 4)"; TSK-24, TKT-40 AC 2, TC-095, EVAL-013).
 *
 * DES-004 (Stage-8 critique) fix — signal over noise (DESIGN_DIRECTION §1 rule 1). The section
 * previously rendered all 19 metrics as one undifferentiated wall of clay `MetricCard`s; 11 of
 * them are self-reported résumé figures (AmEx ×7, Godrej ×4) with near-identical context strings,
 * which drowned the credible, dated, *measured* product numbers (RailCite corpus, TeachSpark
 * pilot) and the *structural* "0 invented citations" — the eight metrics that actually carry the
 * page. It is now split into two credibility tiers, ordered strong-first:
 *
 *   1. Shipped-product evidence (`source !== "RESUME"` → the TeachSpark pilot, the live RailCite
 *      corpus, and the structural validator figure): the prominent clay `card` grid.
 *   2. From my résumé (the `source === "RESUME"` self-reported figures): a quieter, flat `inline`
 *      block under a secondary `h3`, clearly framed as self-reported so it reads as supporting
 *      context, not headline evidence.
 *
 * No number, context, `asOf`, `kind`, or `source` changes — only the grouping and visual weight.
 * Every metric still renders through `MetricCard` (its render-time `asOf`/`source` guard and the
 * measured/structural/self-reported kind badge are preserved for BOTH tiers, EVAL-013).
 *
 * Builds the id→`SourceRef` map from `impactSources` and resolves each row's `source`, exactly like
 * `CaseStudyHeader` — failing loud (never silently dropping a metric) if a row references a source
 * `impactSources` doesn't declare.
 *
 * Server component: no interactivity.
 */
export function Impact() {
  const bySourceId = new Map<string, SourceRef>(impactSources.map((s) => [s.id, s]));

  const resolve = (metric: Metric) => {
    const source = bySourceId.get(metric.source);
    if (!source) {
      throw new Error(
        `Impact: metric (label="${metric.label}") references source "${metric.source}" not declared in impactSources[] (EVAL-013).`,
      );
    }
    return { metric, source };
  };

  const productRows = impactMetrics.filter((m) => m.source !== "RESUME").map(resolve);
  const resumeRows = impactMetrics.filter((m) => m.source === "RESUME").map(resolve);

  return (
    <Section id="impact" aria-labelledby="impact-heading">
      <SectionHeading
        id="impact-heading"
        eyebrow="Evidence"
        title="Impact"
        lead="Numbers from AmEx, Godrej, TeachSpark, and RailCite — each dated and labelled by how it was verified."
        className="mb-[var(--space-8)]"
      />

      {/* Tier 1 — shipped-product evidence: the measured pilot + live-corpus numbers and the
          structural validator figure, given the full clay card weight. */}
      <ArtifactGrid>
        {productRows.map(({ metric, source }) => (
          <MetricCard key={metric.label} metric={metric} source={source} variant="card" />
        ))}
      </ArtifactGrid>

      {/* Tier 2 — self-reported résumé figures: same sourced/dated MetricCards (EVAL-013 intact),
          but the flat `inline` variant in a quieter block so they support rather than compete with
          the measured evidence above. */}
      {resumeRows.length > 0 ? (
        <div className="mt-[var(--space-10)] flex flex-col gap-[var(--space-6)]">
          <div className="flex max-w-[44ch] flex-col gap-[var(--space-2)]">
            <h3 className="text-[length:var(--text-h3)] font-bold text-ink">From my résumé</h3>
            <p className="text-[length:var(--text-body)] text-ink-2">
              Self-reported outcomes from earlier enterprise roles at American Express and Godrej,
              dated to my résumé snapshot.
            </p>
          </div>
          <div className="grid gap-x-[var(--space-8)] gap-y-[var(--space-7)] grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))]">
            {resumeRows.map(({ metric, source }) => (
              <MetricCard key={metric.label} metric={metric} source={source} variant="inline" />
            ))}
          </div>
        </div>
      ) : null}
    </Section>
  );
}
