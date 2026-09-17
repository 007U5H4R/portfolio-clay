import type { SourceRef } from "@/data/schema";
import type { EvaluationArtifact } from "./types";
import { ArtifactShell } from "./ArtifactShell";

export interface EvaluationCardProps {
  artifact: EvaluationArtifact;
  source: SourceRef;
}

/**
 * EvaluationCard (Design.md §3): three stacked labelled rows — Method → Result → Limitation — so
 * a claim is always shown next to how it was measured AND what that measurement cannot say
 * (Solution-PRD §7 truth rules: every result carries its limitation).
 */
export function EvaluationCard({ artifact, source }: EvaluationCardProps) {
  const rows: { label: string; value: string }[] = [
    { label: "Method", value: artifact.method },
    { label: "Result", value: artifact.result },
    { label: "Limitation", value: artifact.limitation },
  ];
  return (
    <ArtifactShell source={source} label="Evaluation" caption={artifact.caption}>
      <dl className="flex flex-col gap-[var(--space-3)]">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-[var(--space-1)]">
            <dt className="text-caption font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-3">
              {row.label}
            </dt>
            <dd className="text-[length:var(--text-body)] text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </ArtifactShell>
  );
}
