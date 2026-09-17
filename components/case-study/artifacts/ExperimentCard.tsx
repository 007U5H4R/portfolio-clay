import { ArrowRight } from "lucide-react";
import { Fragment } from "react";
import type { SourceRef } from "@/data/schema";
import type { ExperimentArtifact } from "./types";
import { Icon } from "@/components/common/Icon";
import { ArtifactShell } from "./ArtifactShell";

export interface ExperimentCardProps {
  artifact: ExperimentArtifact;
  source: SourceRef;
}

/**
 * ExperimentCard (Design.md §3): a Setup → Result → Learning three-step mini-connector. The
 * connector runs horizontally from ≥768 and stacks vertically below it; the arrow rotates a
 * quarter-turn so the flow reads top-to-bottom on mobile. Decorative arrows are `aria-hidden`;
 * the reading order in the DOM already carries the sequence (Law of Continuity).
 */
export function ExperimentCard({ artifact, source }: ExperimentCardProps) {
  const steps: { label: string; value: string }[] = [
    { label: "Setup", value: artifact.setup },
    { label: "Result", value: artifact.result },
    { label: "Learning", value: artifact.learning },
  ];
  return (
    <ArtifactShell source={source} label="Experiment" caption={artifact.caption}>
      <ol className="flex flex-col items-stretch gap-[var(--space-3)] md:flex-row md:items-center">
        {steps.map((step, i) => (
          <Fragment key={step.label}>
            <li className="flex flex-1 flex-col gap-[var(--space-1)]">
              <span className="text-caption font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-3">
                {step.label}
              </span>
              <span className="text-[length:var(--text-body)] text-ink">{step.value}</span>
            </li>
            {i < steps.length - 1 ? (
              <span aria-hidden="true" className="flex justify-center text-ink-3">
                <span className="rotate-90 md:rotate-0">
                  <Icon icon={ArrowRight} size={20} />
                </span>
              </span>
            ) : null}
          </Fragment>
        ))}
      </ol>
    </ArtifactShell>
  );
}
