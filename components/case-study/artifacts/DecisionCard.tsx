import { Check, X } from "lucide-react";
import type { SourceRef } from "@/data/schema";
import type { DecisionArtifact } from "./types";
import { Icon } from "@/components/common/Icon";
import { ArtifactShell } from "./ArtifactShell";

export interface DecisionCardProps {
  artifact: DecisionArtifact;
  source: SourceRef;
}

/**
 * DecisionCard (Design.md §3): a titled decision, then two columns — "Chosen" with a `mint` check
 * vs the "Rejected" alternatives in muted `ink-3` — split by a divider, plus an optional reason.
 * Stacks to one column below 768; the divider becomes a top border between the two blocks.
 */
export function DecisionCard({ artifact, source }: DecisionCardProps) {
  return (
    <ArtifactShell source={source} label="Decision" caption={artifact.caption}>
      <div className="flex flex-col gap-[var(--space-4)]">
        <h4 className="text-[length:var(--text-body)] font-bold text-ink">{artifact.title}</h4>
        <div className="grid gap-[var(--space-4)] md:grid-cols-2 md:divide-x md:divide-ink/10">
          <div className="flex flex-col gap-[var(--space-2)] md:pr-[var(--space-4)]">
            <p className="inline-flex items-center gap-[var(--space-2)] text-caption font-semibold text-ink">
              <span className="inline-flex items-center justify-center rounded-full bg-mint p-[2px] text-ink">
                <Icon icon={Check} size={20} label="Chosen" />
              </span>
              Chosen
            </p>
            <p className="text-[length:var(--text-body)] text-ink">{artifact.chosen}</p>
          </div>
          <div className="flex flex-col gap-[var(--space-2)] border-t border-ink/10 pt-[var(--space-4)] md:border-t-0 md:pl-[var(--space-4)] md:pt-0">
            <p className="inline-flex items-center gap-[var(--space-2)] text-caption font-semibold text-ink-3">
              <Icon icon={X} size={20} label="Rejected" />
              Rejected
            </p>
            <ul className="flex flex-col gap-[var(--space-1)]">
              {artifact.rejected.map((option, i) => (
                <li key={i} className="text-[length:var(--text-body)] text-ink-3 line-through decoration-ink-3/40">
                  {option}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {artifact.reason ? (
          <p className="text-caption text-ink-2">
            <span className="font-semibold text-ink-2">Why: </span>
            {artifact.reason}
          </p>
        ) : null}
      </div>
    </ArtifactShell>
  );
}
