import type { Metric, SourceRef } from "@/data/schema";
import { ExternalLink } from "@/components/common/ExternalLink";
import { Annotation } from "@/components/paper/Annotation";
import { Pin } from "@/components/paper/Pin";
import { Sheet } from "@/components/paper/Sheet";
import { TornEdge } from "@/components/paper/TornEdge";
import { formatAsOf } from "@/lib/format";
import { Container } from "@/components/layout/Container";

export interface MetricStripProps {
  /** The project's headline metrics (schema-validated; every one dated + sourced). */
  metrics: Metric[];
  /** The project's declared sources — each metric's `source` id resolves here (EVAL-013). */
  sources: SourceRef[];
  /** Used only in the fail-loud message when a source id is missing. */
  slug: string;
}

/** Inter kind badge (Design.md §7.3 "kind badge Inter", Dev-04) — text + border, never colour alone. */
const KIND: Record<Metric["kind"], { label: string; tone: string }> = {
  measured: { label: "Measured", tone: "text-forest" },
  structural: { label: "Structural", tone: "text-navy-2" },
  "self-reported": { label: "Self-reported", tone: "text-terracotta" },
};

/** Alternating card tilt + pin colour (mockup `.mstrip .mc:nth-child(n)` / `.pin.g` / `.pin.s`). */
const ROTATE = [0, -0.7, 0.6] as const;
const PIN = ["rust", "forest", "steel"] as const;

/** The strip renders from this many metrics up; below it the section is omitted (§7.3, TC-155). */
export const MIN_STRIP_METRICS = 2;

/**
 * Headline-metric strip (TKT-81, Design.md §7.3 "Metric strip", §3.3 = torn + annotation → 2).
 * `section aria-label="Headline metrics"` on `paper-2` with a torn top edge; up to 3 pinned
 * `Sheet variant="index"` cards — value (Fraunces, tabular), label, context, foot (kind badge +
 * `as of …` + `Source:`). The "the smaller, honest number" annotation only appears with ≥ 2 metrics,
 * and a project with 0–1 metrics gets no section at all (returns `null`) — nothing invented.
 */
export function MetricStrip({ metrics, sources, slug }: MetricStripProps) {
  if (metrics.length < MIN_STRIP_METRICS) return null;

  const bySourceId = new Map(sources.map((source) => [source.id, source]));
  const cards = metrics.slice(0, 3).map((metric) => {
    const source = bySourceId.get(metric.source);
    // Render-time backstop for the schema's superRefine — never show an unsourced number (EVAL-013).
    if (!source) {
      throw new Error(
        `MetricStrip: metric (label="${metric.label}") references source "${metric.source}" not declared in ${slug}.sources[] (EVAL-013).`,
      );
    }
    return { metric, source };
  });

  return (
    <section className="cs-strip cs-torn-fill" aria-label="Headline metrics">
      <TornEdge fill="paper-2" />
      <Container className="cs-strip-wrap">
        <Annotation arrow="down" size="lg" rotate={-2} className="cs-strip-note">
          the smaller, honest number
        </Annotation>
        <ul className="cs-strip-grid">
          {cards.map(({ metric, source }, index) => {
            const kind = KIND[metric.kind];
            return (
              <li key={metric.label}>
                <Sheet variant="index" rotate={ROTATE[index]} className="cs-metric">
                  <Pin tone={PIN[index]} />
                  <p className="cs-metric-value">{metric.value}</p>
                  <p className="cs-metric-label">{metric.label}</p>
                  <p className="cs-metric-context">{metric.context}</p>
                  <div className="cs-metric-foot">
                    <span className={`cs-kind ${kind.tone}`} data-micro-label="">
                      {kind.label}
                    </span>
                    <span>{formatAsOf(metric.asOf)}</span>
                    <span>
                      Source:{" "}
                      {source.url ? <ExternalLink href={source.url}>{source.label}</ExternalLink> : source.label}
                    </span>
                  </div>
                </Sheet>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
