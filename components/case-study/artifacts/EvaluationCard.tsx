import { Fragment } from "react";
import type { SourceRef } from "@/data/schema";
import type { EvaluationArtifact } from "./types";
import { Hand } from "@/components/paper";
import { ArtifactShell } from "./ArtifactShell";

export interface EvaluationCardProps {
  artifact: EvaluationArtifact;
  source: SourceRef;
}

/**
 * EvaluationCard (Design.md §7.3 `evaluation`): a paper-2 bordered card whose `dl` pairs a Caveat
 * `dt` (`Hand label`: Method / Result / Limitation) with an Inter `dd` — so a claim is always shown
 * next to how it was measured AND what that measurement cannot say (Solution-PRD §7 truth rules).
 * The `dt`s are forest, not the mockup's steel: steel on paper-2 is 3.6:1 (TKT-83 CSS header note).
 */
export function EvaluationCard({ artifact, source }: EvaluationCardProps) {
  const rows: { label: string; value: string }[] = [
    { label: "Method", value: artifact.method },
    { label: "Result", value: artifact.result },
    { label: "Limitation", value: artifact.limitation },
  ];
  return (
    <ArtifactShell form="eval" label="Evaluation" source={source} caption={artifact.caption}>
      <dl>
        {rows.map((row) => (
          <Fragment key={row.label}>
            <Hand kind="label" as="dt">
              {row.label}
            </Hand>
            <dd>{row.value}</dd>
          </Fragment>
        ))}
      </dl>
    </ArtifactShell>
  );
}
