import { CheckCircle2, CircleDashed, CircleDot, XCircle, type LucideIcon } from "lucide-react";
import type { SourceRef } from "@/data/schema";
import type { HypothesisArtifact } from "./types";
import { Hand } from "@/components/paper";
import { Icon } from "@/components/common/Icon";
import { ArtifactShell } from "./ArtifactShell";

export interface HypothesisCardProps {
  artifact: HypothesisArtifact;
  source: SourceRef;
}

type Status = HypothesisArtifact["status"];

/** status → {icon, label} — colour is never the only signal (icon + text always; icon tint via CSS). */
const statusMap: Record<Status, { icon: LucideIcon; label: string }> = {
  validated: { icon: CheckCircle2, label: "Validated" },
  "partially-validated": { icon: CircleDot, label: "Partially validated" },
  invalidated: { icon: XCircle, label: "Invalidated" },
  unmeasured: { icon: CircleDashed, label: "Unmeasured" },
};

/**
 * HypothesisCard (Design.md §7.3 `hypothesis`): a note-coloured card — "We believe" / "We'll know
 * when" as Caveat `Hand label`s, the hypothesis text in **Inter 15 px** (Dev-04: the mockup's Caveat
 * body is normalised — data is never hand-written), a dashed rule between the two, and the status as
 * an icon + Inter text pill. `data-status` drives only the icon tint.
 */
export function HypothesisCard({ artifact, source }: HypothesisCardProps) {
  const { icon, label } = statusMap[artifact.status];
  return (
    <ArtifactShell form="hyp" label="Hypothesis" source={source} caption={artifact.caption}>
      <Hand kind="label" className="artifact-lbl">
        We believe
      </Hand>
      <p className="artifact-text font-body">{artifact.believe}</p>
      <div className="artifact-rule" aria-hidden="true" />
      <Hand kind="label" className="artifact-lbl">
        We&apos;ll know when
      </Hand>
      <p className="artifact-text font-body">{artifact.knowWhen}</p>
      <span className="artifact-status font-body" data-status={artifact.status}>
        <Icon icon={icon} size={20} />
        {label}
      </span>
    </ArtifactShell>
  );
}
