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
        {/* QA-003 (TKT-48): kept one level below the chapter heading (now `h2`, was `h3`) so the
            outline stays h1 → h2 → h3 with no skip. */}
        <h3 className="text-[length:var(--text-body)] font-bold text-navy">{artifact.title}</h3>
        <div className="grid gap-[var(--space-4)] md:grid-cols-2 md:divide-x md:divide-navy/10">
          <div className="flex flex-col gap-[var(--space-2)] md:pr-[var(--space-4)]">
            <p className="inline-flex items-center gap-[var(--space-2)] text-caption font-semibold text-navy">
              <span className="inline-flex items-center justify-center rounded-full bg-forest p-[2px] text-navy">
                <Icon icon={Check} size={20} label="Chosen" />
              </span>
              Chosen
            </p>
            <p className="text-[length:var(--text-body)] text-navy">{artifact.chosen}</p>
          </div>
          <div className="flex flex-col gap-[var(--space-2)] border-t border-navy/10 pt-[var(--space-4)] md:border-t-0 md:pl-[var(--space-4)] md:pt-0">
            <p className="inline-flex items-center gap-[var(--space-2)] text-caption font-semibold text-ink-soft">
              <Icon icon={X} size={20} label="Rejected" />
              Rejected
            </p>
            <ul className="flex flex-col gap-[var(--space-1)]">
              {artifact.rejected.map((option, i) => (
                <li key={i} className="text-[length:var(--text-body)] text-ink-soft line-through decoration-ink-soft/40">
                  {option}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {artifact.reason ? (
          <p className="text-caption text-navy-2">
            <span className="font-semibold text-navy-2">Why: </span>
            {artifact.reason}
          </p>
        ) : null}
      </div>
    </ArtifactShell>
  );
}
