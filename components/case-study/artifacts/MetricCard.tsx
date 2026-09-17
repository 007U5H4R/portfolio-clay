import { Gauge, Ruler, UserRound, type LucideIcon } from "lucide-react";
import type { Metric, SourceRef } from "@/data/schema";
import { tierClass, toneClass, type Tone } from "@/components/clay/tiers";
import { Icon } from "@/components/common/Icon";
import { formatAsOf } from "@/lib/format";
import { ArtifactShell } from "./ArtifactShell";

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
export function MetricCard({ metric, source, caption }: MetricCardProps) {
  // Runtime sourcing guard (the type already forbids this at compile time; this catches data that
  // reached render around the type, e.g. `as any` or a loosened cast — fail loud, never render).
  if (!metric.asOf || !metric.source) {
    throw new Error(
      `MetricCard: refusing to render an unsourced/undated metric (label="${metric.label}") — every metric needs asOf + source (EVAL-013).`,
    );
  }

  const { tone, icon, label } = kindMap[metric.kind];

  return (
    <ArtifactShell source={source} label="Metric" caption={caption}>
      <div className="flex flex-col gap-[var(--space-2)]">
        <p className="text-[length:var(--text-h2)] font-extrabold tabular-nums leading-none text-ink">
          {metric.value}
        </p>
        <p className="text-[length:var(--text-body)] font-semibold text-ink">{metric.label}</p>
        <p className="text-caption text-ink-2">{metric.context}</p>
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
          <span className="text-caption text-ink-3">{formatAsOf(metric.asOf)}</span>
        </div>
      </div>
    </ArtifactShell>
  );
}
