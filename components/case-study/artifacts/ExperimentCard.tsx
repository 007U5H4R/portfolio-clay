import type { SourceRef } from "@/data/schema";
import type { ExperimentArtifact } from "./types";
import { Hand } from "@/components/paper";
import { ArtifactShell } from "./ArtifactShell";

export interface ExperimentCardProps {
  artifact: ExperimentArtifact;
  source: SourceRef;
}

/**
 * ExperimentCard (Design.md §7.3 `experiment`): an ivory card with the Setup ↓ Result ↓ Learning
 * three-step read top-to-bottom — Caveat step labels (`Hand label`, the last in rust) beside Inter
 * 14 px text. The ↓ between steps is CSS (`li + li::before`, `content: "↓" / ""`) so it is never
 * announced; the DOM order already carries the sequence (Law of Continuity). Always vertical
 * (DES-001): legible in a 260–440 px slot and structurally immune to overflow.
 */
export function ExperimentCard({ artifact, source }: ExperimentCardProps) {
  const steps: { label: string; value: string }[] = [
    { label: "Setup", value: artifact.setup },
    { label: "Result", value: artifact.result },
    { label: "Learning", value: artifact.learning },
  ];
  return (
    <ArtifactShell form="exp" label="Experiment" source={source} caption={artifact.caption}>
      <ol>
        {steps.map((step) => (
          <li key={step.label}>
            <Hand kind="label" as="b" className="exp-lbl">
              {step.label}
            </Hand>
            {step.value}
          </li>
        ))}
      </ol>
    </ArtifactShell>
  );
}
