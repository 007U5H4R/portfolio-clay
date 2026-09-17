import type { SourceRef } from "@/data/schema";
import type { InsightArtifact } from "./types";
import { ArtifactShell } from "./ArtifactShell";

export interface InsightCardProps {
  artifact: InsightArtifact;
  source: SourceRef;
}

/**
 * InsightCard (Design.md §3): a verbatim quote block with a `butter` left accent bar and its
 * attribution, over the shared artifact shell. The quote is the figure; attribution is its cite.
 */
export function InsightCard({ artifact, source }: InsightCardProps) {
  return (
    <ArtifactShell source={source} label="Insight" caption={artifact.caption}>
      <figure className="flex flex-col gap-[var(--space-3)]">
        <blockquote className="border-l-[4px] border-butter pl-[var(--space-4)] text-[length:var(--text-lead)] font-medium text-ink">
          “{artifact.quote}”
        </blockquote>
        <figcaption className="text-caption text-ink-2">— {artifact.attribution}</figcaption>
      </figure>
    </ArtifactShell>
  );
}
