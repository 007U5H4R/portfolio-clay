import { Archive, BookOpen, FlaskConical, Hammer, Radio, type LucideIcon } from "lucide-react";
import { Icon } from "@/components/common/Icon";
import { tierClass, toneClass, type Tone } from "@/components/clay/tiers";

export type ProjectStatus = "live" | "pilot" | "prototype" | "research" | "archived";

/** status → {tone, icon} per technical-plan.md §B S03.05 / Design.md §3 (never colour alone). */
const statusMap: Record<ProjectStatus, { tone: Tone; icon: LucideIcon }> = {
  live: { tone: "mint", icon: Radio },
  pilot: { tone: "sky", icon: FlaskConical },
  prototype: { tone: "peach", icon: Hammer },
  research: { tone: "lavender", icon: BookOpen },
  archived: { tone: "neutral", icon: Archive },
};

export interface StatusBadgeProps {
  status: ProjectStatus;
  /** The rendered label — content owns the copy (e.g. "Live", "Pilot"). */
  statusLabel: string;
  className?: string | undefined;
}

/** Icon + text, always — colour is never the sole carrier of status meaning. */
export function StatusBadge({ status, statusLabel, className }: StatusBadgeProps) {
  const { tone, icon } = statusMap[status];
  const classes = [
    tierClass.utility,
    toneClass[tone],
    "inline-flex items-center gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-1)] text-caption font-semibold",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      <Icon icon={icon} size={20} />
      {statusLabel}
    </span>
  );
}
