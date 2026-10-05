import type { Metric, SourceRef } from "@/data/schema";
import { impactMetrics, impactSources } from "@/data/impact";
import { Container } from "@/components/layout/Container";
import { SourceCaption } from "@/components/case-study/artifacts/SourceCaption";
import { Pin, Sheet, Sticky, TornEdge, type PinProps } from "@/components/paper";
import { formatAsOf } from "@/lib/format";

const KIND_LABEL: Record<Metric["kind"], string> = {
  measured: "Measured",
  structural: "Structural",
  "self-reported": "Self-reported",
};

/** Mockup pin colours (about.html `.index:nth-child(n) .pin`): rust · steel · rust · forest, repeating. */
const PIN_TONES: readonly NonNullable<PinProps["tone"]>[] = ["rust", "steel", "rust", "forest"];
/** Mockup rotations (about.html `.index:nth-child(4n+k)`), within the Sheet's ±0.9° cap. */
const ROTATIONS = [-0.8, 0.6, -0.4, 0.9] as const;

export interface ResolvedMetric {
  metric: Metric;
  source: SourceRef;
}

export interface ResumeGroup {
  /** Group heading — the rows' shared context minus the "self-reported in résumé" suffix. */
  title: string;
  rows: ResolvedMetric[];
}

/** Resolve every metric's `source` id; fail loud on an undeclared id (EVAL-013 — never drop a metric). */
export function resolveImpact(metrics: readonly Metric[] = impactMetrics, sources: readonly SourceRef[] = impactSources) {
  const bySourceId = new Map<string, SourceRef>(sources.map((s) => [s.id, s]));
  const resolved = metrics.map((metric): ResolvedMetric => {
    const source = bySourceId.get(metric.source);
    if (!source) {
      throw new Error(
        `Impact: metric (label="${metric.label}") references source "${metric.source}" not declared in impactSources[] (EVAL-013).`,
      );
    }
    if (!metric.asOf) throw new Error(`Impact: metric (label="${metric.label}") has no asOf (EVAL-013).`);
    return { metric, source };
  });
  // DC2 tiers: shipped-product evidence first, self-reported résumé figures second.
  return {
    product: resolved.filter(({ metric }) => metric.source !== "RESUME"),
    resume: resolved.filter(({ metric }) => metric.source === "RESUME"),
  };
}

const RESUME_SUFFIX = /;\s*self-reported in résumé$/;

/**
 * Group the résumé rows by engagement: the key is the context's first clause up to a comma
 * ("AmEx MARS Accounts Receivable migration"), the title is the first row's context without the
 * "self-reported in résumé" suffix, "; " read as " · ". Order follows `data/impact.ts`.
 */
export function groupResume(rows: readonly ResolvedMetric[]): ResumeGroup[] {
  const groups = new Map<string, ResumeGroup>();
  for (const row of rows) {
    const key = row.metric.context.split(/[,;]/)[0]!.trim();
    const existing = groups.get(key);
    if (existing) {
      existing.rows.push(row);
    } else {
      groups.set(key, { title: row.metric.context.replace(RESUME_SUFFIX, "").replace(/;\s*/g, " · "), rows: [row] });
    }
  }
  return [...groups.values()];
}

/** "8 (47%)" → ["8", "(47%)"]; "37.5 min" → ["37.5", "min"]; "5,760" → ["5,760", ""]. */
export function splitValue(value: string): [string, string] {
  const at = value.indexOf(" ");
  return at === -1 ? [value, ""] : [value.slice(0, at), value.slice(at + 1)];
}

function KindBadge({ kind }: { kind: Metric["kind"] }) {
  return (
    <span className="aimp-kind" data-kind={kind} data-micro-label="">
      {KIND_LABEL[kind]}
    </span>
  );
}

/**
 * `/about` "Impact" (TKT-86 S86.02, Design.md §7.4 "Impact"; mockup about.html `.impact-s`; DC2
 * tiers preserved). Server component.
 *
 *   1. Shipped-product evidence (`source !== "RESUME"`): eight pinned, ruled index cards 4-up (2-up
 *      ≤ 1100, 1-up ≤ 640) — value (Fraunces), label, context, kind badge (Inter, Dev-04) + asOf,
 *      Source line. Every card carries all six parts (EVAL-013).
 *   2. "From my résumé" (`source === "RESUME"`): h3, body, one group per engagement of inline
 *      value + Inter label pairs, and one foot with the shared Self-reported badge + asOf + Source —
 *      asserted uniform below, so the shared foot can never misdate a row.
 *
 * Decorations (§3.3): torn + sticky "dated, labelled, never rounded up." = 2.
 */
export function Impact() {
  const { product, resume } = resolveImpact();
  const groups = groupResume(resume);

  const first = resume[0];
  if (
    first &&
    resume.some(
      ({ metric, source }) =>
        metric.asOf !== first.metric.asOf || metric.kind !== first.metric.kind || source.id !== first.source.id,
    )
  ) {
    throw new Error("Impact: résumé rows no longer share one asOf/kind/source — the shared foot would misdate them (EVAL-013).");
  }

  return (
    <section id="impact" className="aimp" aria-labelledby="impact-heading">
      <TornEdge fill="paper-2" />
      <Container className="aimp-wrap">
        <div className="about-head">
          <div>
            <p className="about-eyebrow" data-micro-label="">Evidence</p>
            <h2 id="impact-heading" className="about-h2">
              Impact
            </h2>
          </div>
          <p className="about-lead">
            Numbers from AmEx, Godrej, TeachSpark, and RailCite — each dated and labelled by how it was verified.
          </p>
        </div>

        <ul className="aimp-evidence" aria-label="Shipped-product evidence">
          {product.map(({ metric, source }, index) => {
            const [main, small] = splitValue(metric.value);
            return (
              <li key={metric.label} className="aimp-item">
                <Sheet
                  as="article"
                  variant="index"
                  rotate={ROTATIONS[index % ROTATIONS.length]}
                  className={[
                    "aimp-card",
                    index === 0 ? "aimp-card--hot" : "",
                    metric.kind === "structural" ? "aimp-card--zero" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <Pin tone={PIN_TONES[index % PIN_TONES.length]} />
                  <p className="aimp-value">
                    {main}
                    {small ? <small> {small}</small> : null}
                  </p>
                  <p className="aimp-label">{metric.label}</p>
                  <p className="aimp-ctx">{metric.context}</p>
                  <p className="aimp-meta">
                    <KindBadge kind={metric.kind} />
                    <span>{formatAsOf(metric.asOf)}</span>
                  </p>
                  <SourceCaption source={source} className="aimp-src" />
                </Sheet>
              </li>
            );
          })}
        </ul>

        {first ? (
          <div className="aimp-note">
            <div className="aimp-resume">
              <h3 className="aimp-resume-h3">From my résumé</h3>
              <p className="aimp-resume-body">
                Self-reported outcomes from earlier enterprise roles at American Express and Godrej, dated to my résumé
                snapshot.
              </p>
              {groups.map((group) => (
                <div key={group.title} className="aimp-rgroup">
                  <p className="aimp-rgroup-title" data-micro-label="">{group.title}</p>
                  <ul>
                    {group.rows.map(({ metric }) => (
                      <li key={metric.label}>
                        <b>{metric.value}</b>
                        <span>{metric.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="aimp-foot">
                <KindBadge kind={first.metric.kind} />
                <span>{formatAsOf(first.metric.asOf)}</span>
                <SourceCaption source={first.source} className="aimp-src" />
              </div>
            </div>
            <Sticky rotate={-2.5} className="aimp-sticky">
              dated, labelled, never rounded up.
            </Sticky>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
