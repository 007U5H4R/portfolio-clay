import { CheckCircle2, CircleDashed, CircleDot, XCircle, type LucideIcon } from "lucide-react";
import type { SourceRef } from "@/data/schema";
import type { HypothesisArtifact } from "./types";
import { tierClass, toneClass, type Tone } from "@/components/clay/tiers";
import { Icon } from "@/components/common/Icon";
import { ArtifactShell } from "./ArtifactShell";

export interface HypothesisCardProps {
  artifact: HypothesisArtifact;
  source: SourceRef;
}

type Status = HypothesisArtifact["status"];

/** status → {tone, icon, label} — colour is never the only signal (icon + text always). */
const statusMap: Record<Status, { tone: Tone; icon: LucideIcon; label: string }> = {
  validated: { tone: "mint", icon: CheckCircle2, label: "Validated" },
  "partially-validated": { tone: "butter", icon: CircleDot, label: "Partially validated" },
  invalidated: { tone: "blush", icon: XCircle, label: "Invalidated" },
  unmeasured: { tone: "neutral", icon: CircleDashed, label: "Unmeasured" },
};

/**
 * HypothesisCard (Design.md §3): a two-part "We believe…" / "We'll know when…" split divided by a
 * thin rule, plus the hypothesis status as an icon+text badge.
 */
export function HypothesisCard({ artifact, source }: HypothesisCardProps) {
  const { tone, icon, label } = statusMap[artifact.status];
  return (
    <ArtifactShell source={source} label="Hypothesis" caption={artifact.caption}>
      <div className="flex flex-col gap-[var(--space-4)]">
        <div className="flex flex-col gap-[var(--space-1)]">
          <p className="text-caption font-semibold text-ink-3">We believe</p>
          <p className="text-[length:var(--text-body)] text-ink">{artifact.believe}</p>
        </div>
        <hr className="border-0 border-t border-ink/10" />
        <div className="flex flex-col gap-[var(--space-1)]">
          <p className="text-caption font-semibold text-ink-3">We&apos;ll know when</p>
          <p className="text-[length:var(--text-body)] text-ink">{artifact.knowWhen}</p>
        </div>
        <span
          className={[
            tierClass.utility,
            toneClass[tone],
            "inline-flex w-fit items-center gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-1)] text-caption font-semibold",
          ].join(" ")}
        >
          <Icon icon={icon} size={20} />
          {label}
        </span>
      </div>
    </ArtifactShell>
  );
}
