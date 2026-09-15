import type { LucideIcon } from "lucide-react";

export interface IconProps {
  icon: LucideIcon;
  size?: 20 | 24 | undefined;
  /** Decorative (aria-hidden) unless a label is given, in which case it becomes an `img`. */
  label?: string | undefined;
  className?: string | undefined;
}

/** The single lucide wrapper used everywhere — one stroke weight, one family (Design.md §3). */
export function Icon({ icon: LucideIconComponent, size = 20, label, className }: IconProps) {
  const a11yProps = label
    ? ({ "aria-label": label, role: "img" as const })
    : ({ "aria-hidden": true as const });

  return <LucideIconComponent size={size} strokeWidth={1.75} className={className} {...a11yProps} />;
}
