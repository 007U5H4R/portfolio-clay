import { Archive, BookOpen, FlaskConical, Hammer, Radio, type LucideIcon } from "lucide-react";
import { Icon } from "@/components/common/Icon";

export type ProjectStatus = "live" | "pilot" | "prototype" | "research" | "archived";

/**
 * status → {icon, icon colour} (Design.md §2.1 roles: forest "live dot", steel "pilot dot").
 * The icon and the text always carry the meaning together — colour is never the sole signal (§10).
 */
const statusMap: Record<ProjectStatus, { icon: LucideIcon; iconClass: string }> = {
  live: { icon: Radio, iconClass: "text-forest" },
  pilot: { icon: FlaskConical, iconClass: "text-steel" },
  prototype: { icon: Hammer, iconClass: "text-terracotta" },
  research: { icon: BookOpen, iconClass: "text-green-2" },
  archived: { icon: Archive, iconClass: "text-ink-soft" },
};

export interface StatusBadgeProps {
  status: ProjectStatus;
  /** The rendered label — content owns the copy (e.g. "Live", "Pilot"). */
  statusLabel: string;
  /** Sitting on a paper object: marks it `data-paper="tag"` (Design.md §3.1 — content, not counted). */
  onPaper?: boolean | undefined;
  className?: string | undefined;
}

/**
 * Ivory pill with a steel border, icon + Inter 12 px text (Design.md §3.1 `StatusBadge` row — never
 * Caveat; TSK-34). Icon + text, always — colour is never the sole carrier of status meaning.
 */
export function StatusBadge({ status, statusLabel, onPaper = false, className }: StatusBadgeProps) {
  const { icon, iconClass } = statusMap[status];
  const classes = [
    "inline-flex items-center gap-[6px] rounded-full border border-steel bg-ivory px-[10px] py-[3px] font-body text-[12px] font-semibold uppercase leading-[1.4] tracking-[.12em] text-navy-2",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} data-paper={onPaper ? "tag" : undefined} data-micro-label="">
      <Icon icon={icon} size={20} className={`size-[14px] ${iconClass}`} />
      {statusLabel}
    </span>
  );
}
