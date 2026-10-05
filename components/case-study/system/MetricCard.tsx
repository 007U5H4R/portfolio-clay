import type { CaseProof } from "@/data/schema";
import { formatAsOf } from "@/lib/format";
import { EvidenceBadge } from "./EvidenceBadge";

/**
 * A proof point (spec §5–§6, §18–§20): big value, short label, its evidence badge, and a small
 * context line with the as-of date. Used in the hero and in the evidence section; the theme decides
 * whether it reads as a ticket, a stamped card, a worksheet mark or a plain card.
 */
export function MetricCard({ proof, size = "md" }: { proof: CaseProof; size?: "md" | "lg" }) {
  return (
    <div className="csx-metric" data-size={size} data-kind={proof.kind} data-long={proof.value.length > 5 ? "" : undefined} data-paper="card">
      <p className="csx-metric-value">{proof.value}</p>
      <p className="csx-metric-label">{proof.label}</p>
      <p className="csx-metric-foot">
        <EvidenceBadge kind={proof.kind} />
        {proof.asOf ? <span className="csx-metric-date" data-micro-label="">{formatAsOf(proof.asOf)}</span> : null}
      </p>
      {proof.note ? <p className="csx-metric-note">{proof.note}</p> : null}
    </div>
  );
}
