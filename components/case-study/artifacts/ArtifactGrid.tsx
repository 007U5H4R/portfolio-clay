import { Children, type ReactNode } from "react";

export interface ArtifactGridProps {
  children: ReactNode;
  className?: string | undefined;
}

/**
 * The chapter artifact cluster (TKT-83 / Design.md §7.3): a flex-wrap cluster capped at
 * `68ch + 260px` — paper objects that sit under the reading column and may hang past it on desktop
 * (Law of Proximity: evidence stays anchored to the paragraph it supports, never full-bleed). Each
 * child is placed in an `.art` slot (basis 260 px, max 400 px; per-form widths in the CSS) and the
 * slots alternate ±0.6° — the slot rotates, not the sheet, so a card's own `--rot` stays 0 and the bare
 * insight quote is left straight. Below 640 every slot is full width (mockup `@media (max-width: 640px)`).
 *
 * Still the single home for the artifact layout, so `Chapter`, `Impact` and the `/dev/artifacts` board
 * never re-decide it. `Children.map` keeps each child's key on its slot.
 */
export function ArtifactGrid({ children, className }: ArtifactGridProps) {
  return (
    <div className={["artifacts", className].filter(Boolean).join(" ")}>
      {Children.map(children, (child) =>
        child === null || child === undefined || child === false ? null : <div className="art">{child}</div>,
      )}
    </div>
  );
}
