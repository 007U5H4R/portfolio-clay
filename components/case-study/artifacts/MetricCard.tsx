import { Gauge, Ruler, UserRound, type LucideIcon } from "lucide-react";
import type { Metric, SourceRef } from "@/data/schema";
import { Pin } from "@/components/paper";
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
  // No `variant`: the legacy `inline` header mini-metric was removed in TKT-97 once `MetricStrip`
  // (TKT-81) replaced it in the case-study header; the pinned index card is the only form (§7.3).
}

type Kind = Metric["kind"];

/** kind → {icon, label, pin} — the measured/structural/self-reported badge (icon + Inter text, Dev-04). */
const kindMap: Record<Kind, { icon: LucideIcon; label: string; pin: "rust" | "forest" | "steel" }> = {
  measured: { icon: Gauge, label: "Measured", pin: "rust" },
  structural: { icon: Ruler, label: "Structural", pin: "steel" },
  "self-reported": { icon: UserRound, label: "Self-reported", pin: "forest" },
};

/**
 * MetricCard (Design.md §7.3 `metric`): a pinned ruled index card (`Sheet index` + `Pin`) — Fraunces
 * value, Inter label / context, and a foot with the **Inter** kind badge (Dev-04 — never Caveat), the
 * `formatAsOf(asOf)` freshness caption and the Source. It renders ONLY sourced, dated data — a metric
 * that arrives without `asOf` or `source` throws rather than rendering a bare number (no fabricated /
 * floating metric ever reaches the page — EVAL-013).
 */
export function MetricCard({ metric, source, caption }: MetricCardProps) {
  // Runtime sourcing guard (the type already forbids this at compile time; this catches data that
  // reached render around the type, e.g. `as any` or a loosened cast — fail loud, never render).
  if (!metric.asOf || !metric.source) {
    throw new Error(
      `MetricCard: refusing to render an unsourced/undated metric (label="${metric.label}") — every metric needs asOf + source (EVAL-013).`,
    );
  }

  const { icon, label, pin } = kindMap[metric.kind];

  return (
    <ArtifactShell form="metric" variant="index" label="Metric" caption={caption} fasteners={<Pin tone={pin} />}>
      <p className="metric-val">{metric.value}</p>
      <p className="metric-lbl font-body">{metric.label}</p>
      <p className="metric-ctx font-body">{metric.context}</p>
      <p className="metric-foot font-body">
        <span className="metric-kind font-body" data-kind={metric.kind}>
          <Icon icon={icon} size={20} />
          {label}
        </span>
        <span>{formatAsOf(metric.asOf)}</span>
        <SourceCaption as="span" source={source} className="artifact-src" />
      </p>
    </ArtifactShell>
  );
}
