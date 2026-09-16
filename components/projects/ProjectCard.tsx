import { ArrowRight, type LucideIcon } from "lucide-react";
import { ClayIcon } from "@/components/clay/ClayIcon";
import { Icon } from "@/components/common/Icon";
import { Tag } from "@/components/common/Tag";
import { StatusBadge, type ProjectStatus } from "@/components/projects/StatusBadge";
import { ViewTransitionLink } from "@/components/interactions/ViewTransitionLink";

export interface ProjectCardProject {
  slug: string;
  name: string;
  proposition: string;
  tags: string[];
  status: ProjectStatus;
  statusLabel: string;
  icon: LucideIcon;
}

export interface ProjectCardProps {
  project: ProjectCardProject;
  /** `featured` (home) is implemented here; `grid` (/work editorial grid) lands in TKT-16. */
  mode?: "featured" | "grid";
}

/**
 * Card-tier clay surface that is itself the link (Law of Figure-Ground: the shadow/radius makes it
 * read as one clickable figure — no secondary "read more"). `isolate` gives it its own stacking
 * context so the hover sheen (a `-z-10` child) paints over the surface but under the content. Hover
 * physics verbatim from Design.md §3 states row (rise 5px / shadow swap, 200ms), collapsed under
 * `motion-reduce`; `.focus-ring` gives the shared visible focus treatment.
 */
const cardClass =
  "group relative isolate flex h-full flex-col gap-[var(--space-4)] p-[var(--card-padding)] " +
  "rounded-[var(--radius-clay)] bg-surface bg-[image:var(--gradient-clay-volume)] shadow-[var(--shadow-clay-rest)] text-ink focus-ring " +
  "transition-[transform,box-shadow] duration-200 ease-[var(--ease-hover)] " +
  "hover:-translate-y-[5px] hover:shadow-[var(--shadow-clay-hover)] " +
  "active:translate-y-px active:scale-[.98] active:shadow-[var(--shadow-clay-press)] " +
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100";

export function ProjectCard({ project, mode = "featured" }: ProjectCardProps) {
  // Grid mode (/work editorial grid) is implemented in TKT-16; the tracer renders featured only.
  if (mode === "grid") return null;

  const { slug, name, proposition, tags, status, statusLabel, icon } = project;

  return (
    <ViewTransitionLink
      href={`/work/${slug}`}
      transitionName={`project-${slug}`}
      aria-label={name}
      className={cardClass}
    >
      {/* Hover: tone gradient +8% opacity (Design.md §3). Decorative + inert; sits under content. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-[image:var(--gradient-clay-volume)] opacity-0 transition-opacity duration-200 ease-[var(--ease-hover)] group-hover:opacity-[0.08] motion-reduce:transition-none motion-reduce:group-hover:opacity-0"
      />

      {/* Icon carries the `icon-{slug}` shared-element name (EXE-5 CSS hook) and scales on hover. */}
      <span
        className="inline-flex w-fit transition-transform duration-200 ease-[var(--ease-hover)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        style={{ viewTransitionName: `icon-${slug}` }}
      >
        <ClayIcon icon={icon} size={56} tone="lavender" />
      </span>

      <h3 className="text-[length:var(--text-h3)] font-bold leading-tight text-ink">{name}</h3>

      <p className="line-clamp-2 text-[length:var(--text-body)] text-ink-2">{proposition}</p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {tags.slice(0, 3).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-[var(--space-3)] pt-[var(--space-2)]">
        <StatusBadge status={status} statusLabel={statusLabel} />
        {/* Presentational arrow — the whole card is already the link, so this is a span, never a
            nested control (aria-hidden). Ghost-button footprint (44×44); nudges +4px on hover. */}
        <span
          aria-hidden
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-clay-sm)] text-ink transition-transform duration-200 ease-[var(--ease-hover)] group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        >
          <Icon icon={ArrowRight} size={24} />
        </span>
      </div>
    </ViewTransitionLink>
  );
}
