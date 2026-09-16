import type { LucideIcon } from "lucide-react";
import { ClayTile } from "./ClayTile";
import type { Tone } from "./tiers";

export interface ClayIconProps {
  icon: LucideIcon;
  size?: 40 | 56 | undefined;
  tone?: Tone | undefined;
  className?: string | undefined;
  /** Decorative by default (icon sits beside its own label); pass to give it an accessible name. */
  "aria-label"?: string | undefined;
}

/** A lucide icon (1.75px stroke) centered inside a utility-tier `ClayTile` (card icon / nav mark). */
export function ClayIcon({ icon: Icon, size = 40, tone, className, "aria-label": ariaLabel }: ClayIconProps) {
  const a11yProps = ariaLabel
    ? ({ "aria-label": ariaLabel, role: "img" as const })
    : ({ "aria-hidden": true as const });

  return (
    <ClayTile size={size} tone={tone} tier="utility" className={className}>
      <Icon size={size * 0.5} strokeWidth={1.75} {...a11yProps} />
    </ClayTile>
  );
}
