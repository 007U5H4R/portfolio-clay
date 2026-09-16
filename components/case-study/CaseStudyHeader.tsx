import type { LucideIcon } from "lucide-react";
import { ClayFrame } from "@/components/clay/ClayFrame";
import { ClayIcon } from "@/components/clay/ClayIcon";
import { StatusBadge, type ProjectStatus } from "@/components/projects/StatusBadge";

export interface CaseStudyHeaderProps {
  slug: string;
  name: string;
  /** One-line problem statement (Design.md §3 case-study header lead). */
  lead: string;
  role?: string | undefined;
  duration?: string | undefined;
  status: ProjectStatus;
  statusLabel: string;
  icon: LucideIcon;
}

/**
 * Flat 60/40 header for a case study (Design.md §3). Left: name + one-line lead + meta chips
 * (role / duration / status). Right: a 16:9 card-tier `ClayFrame` that is the View-Transition
 * target — it carries the same `project-{slug}` / `icon-{slug}` CSS names as the ProjectCard, so
 * the browser morphs the card into this media where native VT fires (EXE-5). The media is a
 * labelled placeholder until the case-study build supplies real hero media.
 */
export function CaseStudyHeader({
  slug,
  name,
  lead,
  role,
  duration,
  status,
  statusLabel,
  icon,
}: CaseStudyHeaderProps) {
  const meta = [
    role ? { label: "Role", value: role } : null,
    duration ? { label: "Duration", value: duration } : null,
  ].filter((entry): entry is { label: string; value: string } => entry !== null);

  return (
    <header className="grid gap-[var(--space-8)] lg:grid-cols-[60fr_40fr] lg:items-center">
      <div className="flex flex-col gap-[var(--space-5)]">
        <h1 className="text-[length:var(--text-h2)] font-extrabold tracking-[var(--tracking-hero)] text-ink">
          {name}
        </h1>
        <p className="max-w-[44ch] text-[length:var(--text-lead)] text-ink-2">{lead}</p>
        <div className="flex flex-wrap items-center gap-[var(--space-3)]">
          {meta.map((entry) => (
            <span key={entry.label} className="text-[length:var(--text-caption)] text-ink-3">
              <span className="font-semibold text-ink-2">{entry.label}:</span> {entry.value}
            </span>
          ))}
          <StatusBadge status={status} statusLabel={statusLabel} />
        </div>
      </div>

      <ClayFrame
        ratio="16/9"
        tier="card"
        tone="lavender"
        style={{ viewTransitionName: `project-${slug}` }}
      >
        {/* Icon slot — same `icon-{slug}` name as the ProjectCard icon so it morphs (EXE-5). */}
        <span
          className="absolute left-[var(--space-5)] top-[var(--space-5)]"
          style={{ viewTransitionName: `icon-${slug}` }}
        >
          <ClayIcon icon={icon} size={56} tone="lavender" />
        </span>

        {/* Media.kind:'placeholder' — real hero media lands with the case-study build. */}
        <div className="flex h-full w-full items-center justify-center p-[var(--space-6)] text-center text-[length:var(--text-body)] font-medium text-ink-3">
          Hero media coming
        </div>
      </ClayFrame>
    </header>
  );
}
