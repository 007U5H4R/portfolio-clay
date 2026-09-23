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
 * ExperimentCard (Design.md §3): a Setup → Result → Learning three-step mini-connector, read
 * top-to-bottom with a down-arrow between each step. Decorative arrows are `aria-hidden`; the DOM
 * reading order already carries the sequence (Law of Continuity).
 *
 * DES-001 (Stage-8 critique): the connector previously went horizontal (`md:flex-row`) from 768px
 * up. But this card lives in the artifact grid, which is capped at the ≤60ch chapter column and is
 * at most 2-up there — so the card is only ~288px wide regardless of viewport, and three horizontal
 * flex columns overflowed the card edge (their text spilled ~200px into the neighbouring card,
 * genuinely illegible). It is now vertical at every width (the same always-vertical reasoning as
 * `ShowTheThinking`, Design.md §5 deviation 6): legible in a narrow card and structurally immune to
 * overflow. `min-w-0` stays as belt-and-braces so a long word wraps rather than pushing width.
 */
export function ExperimentCard({ artifact, source }: ExperimentCardProps) {
  const steps: { label: string; value: string }[] = [
    { label: "Setup", value: artifact.setup },
    { label: "Result", value: artifact.result },
    { label: "Learning", value: artifact.learning },
  ];
  return (
    <ArtifactShell source={source} label="Experiment" caption={artifact.caption}>
      <ol className="flex flex-col items-stretch gap-[var(--space-3)]">
        {steps.map((step, i) => (
          <Fragment key={step.label}>
            <li className="flex min-w-0 flex-1 flex-col gap-[var(--space-1)]">
              <span className="text-caption font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-3">
                {step.label}
              </span>
              <span className="text-[length:var(--text-body)] text-ink">{step.value}</span>
            </li>
            {i < steps.length - 1 ? (
              <span aria-hidden="true" className="flex justify-center text-ink-3">
                <span className="rotate-90">
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
