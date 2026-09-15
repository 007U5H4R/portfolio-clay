import type { ReactNode } from "react";
import { tierClass, toneClass, type Tone } from "./tiers";

/**
 * 56/120/140/180 per technical-plan.md §B S03.04 (icon tiles, floating hero tiles, playground
 * tiles); 40 added so `ClayIcon`'s 40×40 nav-mark size (Design.md §3) can reuse this component
 * as its shell without a second near-duplicate tile primitive — a minimal, non-breaking widening
 * of the declared union, not a token change.
 */
export type ClayTileSize = 40 | 56 | 120 | 140 | 180;

export interface ClayTileProps {
  size?: ClayTileSize | undefined;
  tone?: Tone | undefined;
  tier?: "utility" | "card" | undefined;
  className?: string | undefined;
  children?: ReactNode | undefined;
}

/** Square icon/decorative tile — icon tiles, floating hero tiles, playground tiles (Design.md §3). */
export function ClayTile({ size = 56, tone, tier = "utility", className, children }: ClayTileProps) {
  const classes = [
    "inline-flex shrink-0 items-center justify-center",
    tierClass[tier],
    tone ? toneClass[tone] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={{ width: size, height: size }}>
      {children}
    </div>
  );
}
