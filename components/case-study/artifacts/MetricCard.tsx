import { Gauge, Ruler, UserRound, type LucideIcon } from "lucide-react";
import type { Metric, SourceRef } from "@/data/schema";
import { tierClass, toneClass, type Tone } from "@/components/clay/tiers";
import { Icon } from "@/components/common/Icon";
import { formatAsOf } from "@/lib/format";
import { ArtifactShell } from "./ArtifactShell";
import { SourceCaption } from "./SourceCaption";

export interface MetricCardProps {
  /**
   * The metric to render. Its prop type is the full `Metric` — `value`, `label`, `context`,
   * `asOf`, `kind` and `source` are all **non-optional**, so a partial metric is a compile-time
   * error (TKT-20 AC 2, the type-level guard). The runtime invariant below is the belt-and-braces
   * for data that reaches render having dodged the schema (EVAL-013: no unsourced/undated metric).
   */
  metric: Metric;
  /** Resolved SourceRef for `metric.source` — provenance is mandatory (EVAL-013). */
  source: SourceRef;
  caption?: string | undefined;
  /**
   * `card` (default) = the full clay-tier artifact card used inside chapter columns and the
   * `/dev/artifacts` board. `inline` = the compact, flat mini-metric the `CaseStudyHeader` places
   * beside the lead (Design.md §3 "2–3 inline mini MetricCards" / TKT-19 TSK-16 "inline variant").
   * Both carry the SAME five sourced fields (value + label + context + asOf + kind badge + source,
   * TKT-19 AC 2); the inline variant drops only the clay shell so a row of them reads as header
   * meta rather than stacked cards.
   */
  variant?: "card" | "inline" | undefined;
}

type Kind = Metric["kind"];

/** kind → {tone, icon, label} — the measured/structural/self-reported badge (icon + text). */
const kindMap: Record<Kind, { tone: Tone; icon: LucideIcon; label: string }> = {
  measured: { tone: "mint", icon: Gauge, label: "Measured" },
  structural: { tone: "sky", icon: Ruler, label: "Structural" },
  "self-reported": { tone: "peach", icon: UserRound, label: "Self-reported" },
};

/**
 * MetricCard (Design.md §3): a large `tabular-nums` value, its label, a context sentence, the
 * `formatAsOf(asOf)` freshness caption, and a kind badge. It renders ONLY sourced, dated data —
 * a metric that arrives without `asOf` or `source` throws rather than rendering a bare number
 * (no fabricated / floating metric ever reaches the page — EVAL-013).
 */
export function MetricCard({ metric, source, caption, variant = "card" }: MetricCardProps) {
  // Runtime sourcing guard (the type already forbids this at compile time; this catches data that
  // reached render around the type, e.g. `as any` or a loosened cast — fail loud, never render).
  if (!metric.asOf || !metric.source) {
    throw new Error(
      `MetricCard: refusing to render an unsourced/undated metric (label="${metric.label}") — every metric needs asOf + source (EVAL-013).`,
    );
  }

  const { tone, icon, label } = kindMap[metric.kind];

  // The value/label/context/badge/asOf body is identical in both variants — only the surrounding
  // surface differs (clay card shell vs. flat inline block), so it is defined once here.
  const body = (
    <div className="flex flex-col gap-[var(--space-2)]">
      <p className="text-[length:var(--text-h2)] font-extrabold tabular-nums leading-none text-navy">
        {metric.value}
      </p>
      <p className="text-[length:var(--text-body)] font-semibold text-navy">{metric.label}</p>
      <p className="text-caption text-navy-2">{metric.context}</p>
      <div className="mt-[var(--space-1)] flex flex-wrap items-center gap-[var(--space-3)]">
        <span
          className={[
            tierClass.utility,
            toneClass[tone],
            "inline-flex items-center gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-1)] text-caption font-semibold",
          ].join(" ")}
        >
          <Icon icon={icon} size={20} />
          {label}
        </span>
        <span className="text-caption text-ink-soft">{formatAsOf(metric.asOf)}</span>
      </div>
    </div>
  );

  if (variant === "inline") {
    // Flat header mini-metric: no clay shell (a row of these is header meta, not stacked cards),
    // but it still carries the mandatory source line so no metric ever renders without provenance.
    return (
      <div className="flex flex-col gap-[var(--space-2)]">
        {body}
        {caption ? <p className="text-caption text-navy-2">{caption}</p> : null}
        <SourceCaption source={source} />
      </div>
    );
  }

  return (
    <ArtifactShell source={source} label="Metric" caption={caption}>
      {body}
    </ArtifactShell>
  );
}
