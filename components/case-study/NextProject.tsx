import { ArrowRight, type LucideIcon } from "lucide-react";
import type { Project } from "@/data/schema";
import { Container } from "@/components/layout/Container";
import { ClayIcon } from "@/components/clay/ClayIcon";
import { Icon } from "@/components/common/Icon";
import { ViewTransitionLink } from "@/components/interactions/ViewTransitionLink";

export interface NextProjectProps {
  /** The next personal project in `/work` grid order (the page wraps around at the end). */
  project: Pick<Project, "slug" | "name">;
  /** Resolved lucide icon for the next project (the thumbnail that slides in on hover). */
  icon: LucideIcon;
}

/**
 * NextProject band (Design.md §3, TKT-19 AC 6): a flat full-bleed "Next: {name} →" band linking to
 * the next personal case study in `/work` grid order (the page cycles, so the last project points
 * back to the first). The whole band is the link — it carries the `project-{slug}` view-transition
 * name so navigating from here also morphs into the next header (EXE-5). The next project's icon is
 * a thumbnail that slides in from the right on hover (200ms, desktop-only, collapsed under reduced
 * motion) — decorative, so it is `aria-hidden`; the link's accessible name is set explicitly.
 */
export function NextProject({ project, icon }: NextProjectProps) {
  return (
    <section aria-label="Next project" className="mt-[var(--section-gap-desktop)] border-t border-ink/10 bg-surface/40">
      <Container>
        <ViewTransitionLink
          href={`/work/${project.slug}`}
          transitionName={`project-${project.slug}`}
          aria-label={`Next project: ${project.name}`}
          className="group flex min-h-24 items-center justify-between gap-[var(--space-4)] py-[var(--space-6)] focus-ring"
        >
          <span className="flex flex-col gap-[var(--space-1)]">
            <span className="text-caption font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-3">
              Next
            </span>
            <span className="flex items-center gap-[var(--space-3)] text-[length:var(--text-h3)] font-bold text-ink">
              {project.name}
              <Icon
                icon={ArrowRight}
                size={24}
                className="transition-transform duration-200 ease-[var(--ease-hover)] motion-reduce:transition-none [@media(hover:hover)]:group-hover:translate-x-1"
              />
            </span>
          </span>

          {/* Thumbnail slides in from the right on hover (desktop only). */}
          <span
            aria-hidden
            className="hidden translate-x-2 opacity-0 transition-[transform,opacity] duration-200 ease-[var(--ease-hover)] motion-reduce:transition-none sm:inline-flex [@media(hover:hover)]:group-hover:translate-x-0 [@media(hover:hover)]:group-hover:opacity-100"
          >
            <ClayIcon icon={icon} size={56} tone="lavender" />
          </span>
        </ViewTransitionLink>
      </Container>
    </section>
  );
}
