import type { ReactNode } from "react";

export interface ArtifactGridProps {
  children: ReactNode;
  className?: string | undefined;
}

/**
 * The chapter-column artifact layout (TKT-20 AC 3, Design.md §3): 1-up on mobile, 2-up from 768,
 * up to 3-up from 1024 — always inside the chapter's own column, never full-bleed (Law of
 * Proximity: evidence stays anchored to the paragraph it supports). The single home for this
 * grid so `Chapter` (TKT-19) and the `/dev/artifacts` board don't each re-decide the breakpoints.
 */
export function ArtifactGrid({ children, className }: ArtifactGridProps) {
  return (
    <div
      className={[
        "grid grid-cols-1 gap-[var(--space-5)] md:grid-cols-2 lg:grid-cols-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
