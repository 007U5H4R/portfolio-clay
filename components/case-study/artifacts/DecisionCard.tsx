import { Check } from "lucide-react";
import type { SourceRef } from "@/data/schema";
import type { DecisionArtifact } from "./types";
import { Hand } from "@/components/paper";
import { Icon } from "@/components/common/Icon";
import { ArtifactShell } from "./ArtifactShell";

export interface DecisionCardProps {
  artifact: DecisionArtifact;
  source: SourceRef;
}

/**
 * DecisionCard (Design.md §7.3 `decision`): an ivory card — Fraunces `h3` title, "Chosen" (forest
 * check) and "Rejected" (rust) as Caveat `Hand label`s over Inter 14 px text, the rejected
 * alternatives struck through in ink-soft, and a "Why:" line (Caveat label + Inter reason).
 *
 * QA-003 (TKT-48): the heading stays `h3`, one level under the chapter `h2`, so the outline reads
 * h1 → h2 (chapter) → h3 (decision) with no skip.
 */
export function DecisionCard({ artifact, source }: DecisionCardProps) {
  return (
    <ArtifactShell form="dec" label="Decision" source={source} caption={artifact.caption}>
      <h3>{artifact.title}</h3>
      <div className="dec-col dec-chosen">
        <p className="dec-col-lbl">
          <Icon icon={Check} size={20} />
          <Hand kind="label">Chosen</Hand>
        </p>
        <p>{artifact.chosen}</p>
      </div>
      <div className="dec-col dec-rej">
        <p className="dec-col-lbl">
          <Hand kind="label">Rejected</Hand>
        </p>
        <ul>
          {artifact.rejected.map((option, i) => (
            <li key={i}>{option}</li>
          ))}
        </ul>
      </div>
      {artifact.reason ? (
        <p className="dec-why">
          <Hand kind="label" as="b" className="dec-why-lbl">
            Why:
          </Hand>{" "}
          {/* TKT-90d (A11Y-4): a real space, so "Why:" is not read as one word with the reason. */}
          {artifact.reason}
        </p>
      ) : null}
    </ArtifactShell>
  );
}
