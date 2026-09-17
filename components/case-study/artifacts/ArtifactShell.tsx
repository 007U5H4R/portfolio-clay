import type { ReactNode } from "react";
import type { SourceRef } from "@/data/schema";
import { ClayCard } from "@/components/clay/ClayCard";
import { SourceCaption } from "./SourceCaption";

export interface ArtifactShellProps {
  /** Resolved source for the provenance line every artifact carries (TKT-20 AC 1). */
  source: SourceRef;
  /** Short type eyebrow ("Insight", "Metric", …) — aids scanning without colour alone. */
  label: string;
  /** Optional author caption from `artifact.caption`. */
  caption?: string | undefined;
  className?: string | undefined;
  children: ReactNode;
}

/**
 * The single shared card-tier DNA for every artifact (TKT-20 AC 1: "one shared `ClayCard` DNA,
 * shape varies by type"). It fixes the surface (card tier, neutral untinted fill), the internal
 * padding, the type eyebrow, and the caption + `SourceCaption` footer — so the per-type cards
 * carry only their own *shape*, never their own radius/shadow/padding forks (the anti-pattern
 * called out in the plan: "artifact sprawl → props only, no per-type styling forks"). Text zones
 * inside stay flat (no nested clay), per AC 1.
 */
export function ArtifactShell({ source, label, caption, className, children }: ArtifactShellProps) {
  return (
    <ClayCard
      tier="card"
      tone="neutral"
      className={["flex flex-col gap-[var(--space-4)] p-[var(--space-5)]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-caption font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-3">
        {label}
      </p>
      {children}
      <div className="mt-auto flex flex-col gap-[var(--space-1)] pt-[var(--space-2)]">
        {caption ? <p className="text-caption text-ink-2">{caption}</p> : null}
        <SourceCaption source={source} />
      </div>
    </ClayCard>
  );
}
