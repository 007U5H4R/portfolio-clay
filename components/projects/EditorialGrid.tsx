"use client";

import { ArrowRight } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import type { Project } from "@/data/schema";
import { projectIcon } from "@/data/projects";
import { ClayIcon } from "@/components/clay/ClayIcon";
import { Icon } from "@/components/common/Icon";
import { Tag } from "@/components/common/Tag";
import { StatusBadge } from "@/components/projects/StatusBadge";
import { ViewTransitionLink } from "@/components/interactions/ViewTransitionLink";
import { LazyMotionRoot, useReducedMotionSafe } from "@/lib/motion";

/**
 * Editorial project INDEX (TKT-16 → M-008 Stage B / TASK-57, redesign to `docs/redesign-mockups/
 * mockups-8panel-2026-09-23.png` panel 6 "Work — Editorial Layout"). Replaces the earlier
 * "hero + rail + 3-up" positional card grid with a numbered `01 / 02 / 03…` list of rows — the
 * brief's own gap question ("is the numbered list the replacement for the EditorialGrid card
 * matrix?") is resolved here as YES, a full replacement, not an additional treatment.
 *
 * The component keeps its original name/export/prop shape (`EditorialGrid`, `{ projects }`) so
 * `WorkGrid.tsx` and `app/work/page.tsx`'s Suspense fallback need no changes — only what renders
 * inside changed.
 *
 * Numbering (brief gap question): numerals RE-SEQUENCE on every filter change (`01` is always the
 * first VISIBLE row for the active filter, never a fixed id) — a numbered index reads as "here is
 * this view's shortlist, in order," not a stable per-project id. The numeral is `aria-hidden`; the
 * native `<ol>` already gives assistive tech the same ordinal ("1 of 6" etc.), so the visible glyph
 * is not double-announced.
 *
 * Row anatomy (mockup 6): big numeral (outside the card) → `ClayIcon` (same lavender-tone icon
 * every other project surface uses, Law of Similarity) → name/tagline/tags/status → a decorative
 * "View project" affordance. The mockup's row-anatomy is followed, with one deliberate departure:
 * `StatusBadge` is kept (mockup's illustrative rows omit it, but every other project surface on the
 * site — `ProjectCard` featured/grid — shows it; dropping it here would silently regress the
 * status-communication the rest of the site guarantees, so it stays, docked beside the tags).
 *
 * Interaction model unchanged from the old grid: each row is exactly ONE link (same single-link
 * anatomy `ProjectCard` and `ProductScene` use — Law of Figure-Ground), so the mockup's "View
 * project →" pill is rendered as an inert `aria-hidden` span (never a second, nested `<a>`), and
 * the row itself carries `data-card-mode="grid"` — the exact hook `tests/e2e/work.spec.ts`'s
 * `gridSlugs()` already reads — plus the same `project-{slug}` / `icon-{slug}` view-transition
 * names `ProjectCard`/`CaseStudyHeader` use, so the case-study morph keeps working unchanged.
 *
 * Filter changes still crossfade (Design.md §4 "Filter change": fade-out 150 / fade-in 200) via the
 * same `AnimatePresence`-keyed-by-slug approach the prior grid used — opacity only, `initial={false}`
 * so the first paint (incl. the Suspense-fallback prerendered HTML) shows rows at full opacity with
 * no entrance animation, and reduced motion collapses every transition to instant.
 *
 * Deviation (documented, out of scope for this pass): mockup 6 also shows two small teaser cards
 * below the numbered rows ("More experiments" → playground, "Enterprise scale" → AmEx/Quantiphi/
 * Godrej). `redesign-brief.md` §3 itself lists the ExperienceStrip's placement/treatment as an open
 * gap ("need mockup 6"), and TKT-17/S8 deliberately keeps `ExperienceStrip` a flat, non-clay strip —
 * the visual OPPOSITE of a clay row — precisely so professional experience never reads as a product
 * (Law of Common Region). Building a clay "Enterprise scale" teaser card would contradict that
 * standing decision without a resolved brief answer, and a "More experiments" → `/playground` promo
 * is new site structure with no backing ticket/copy. Both are left out of this pass rather than
 * invented; `ExperienceStrip` continues to render, unchanged, directly below this index.
 */

const ENTER_SEC = 0.2; // Design.md §4 fade-in 200ms
const EXIT_SEC = 0.15; // Design.md §4 fade-out 150ms

/**
 * The whole-row clay surface — the row IS the link (Law of Figure-Ground), same rest/hover/press
 * physics `ProjectCard`'s `cardClass` uses (rise 5px / shadow swap, 200ms, collapsed under
 * `motion-reduce`), just laid out as a wide shallow row instead of a tall card.
 */
const rowClass =
  "group relative isolate flex min-w-0 flex-1 flex-col gap-[var(--space-4)] p-[var(--card-padding)] " +
  "rounded-[var(--radius-clay)] bg-ivory bg-[image:var(--gradient-clay-volume)] shadow-[var(--shadow-clay-rest)] text-navy focus-ring " +
  "transition-[transform,box-shadow] duration-200 ease-[var(--ease-hover)] " +
  "sm:flex-row sm:items-center sm:gap-[var(--space-6)] " +
  "hover:-translate-y-[5px] hover:shadow-[var(--shadow-clay-hover)] " +
  "active:translate-y-px active:scale-[.98] active:shadow-[var(--shadow-clay-press)] " +
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100";

/** Row anatomy — a numeral + the row link. Rendered as the children of the `m.li` list wrapper
 * below (kept as a plain fragment, not its own `<li>`, so `<ol>`'s only direct children are the
 * `m.li`s AnimatePresence/motion needs to key and animate — a `<div>` between `<ol>` and `<li>`
 * would be invalid list markup). */
function ProjectRow({ project, index }: { project: Project; index: number }) {
  const { slug, name, tagline, tags, status, statusLabel, icon } = project;
  const IconComponent = projectIcon(icon);
  const numeral = String(index + 1).padStart(2, "0");

  return (
    <>
      <span
        aria-hidden="true"
        className="w-[2ch] shrink-0 pt-[var(--space-1)] text-right text-[length:var(--text-h3)] font-extrabold text-ink-soft sm:pt-0"
      >
        {numeral}
      </span>

      <ViewTransitionLink
        href={`/work/${slug}`}
        transitionName={`project-${slug}`}
        aria-label={name}
        data-card-mode="grid"
        className={rowClass}
      >
        {/* Hover sheen — identical convention to ProjectCard's own hover overlay. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-[image:var(--gradient-clay-volume)] opacity-0 transition-opacity duration-200 ease-[var(--ease-hover)] group-hover:opacity-[0.08] motion-reduce:transition-none motion-reduce:group-hover:opacity-0"
        />

        <span
          className="inline-flex w-fit shrink-0 transition-transform duration-200 ease-[var(--ease-hover)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          style={{ viewTransitionName: `icon-${slug}` }}
        >
          <ClayIcon icon={IconComponent} size={56} tone="lavender" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-2)]">
          <h3 className="text-[length:var(--text-h3)] font-bold leading-tight text-navy">{name}</h3>
          <p className="line-clamp-2 text-[length:var(--text-body)] text-navy-2">{tagline}</p>
          <div className="flex flex-wrap items-center gap-[var(--space-2)]">
            {tags.slice(0, 3).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
            <StatusBadge status={status} statusLabel={statusLabel} />
          </div>
        </div>

        {/* Decorative "View project" affordance (mockup 6's dark pill button) — an inert span, not
            a second link: the row above already carries the one accessible link (aria-label). */}
        <span
          aria-hidden
          className="hidden shrink-0 items-center gap-[var(--space-2)] self-start rounded-[var(--radius-pill)] bg-navy px-[var(--space-4)] py-[var(--space-2)] text-caption font-semibold text-paper transition-transform duration-200 ease-[var(--ease-hover)] group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 sm:inline-flex sm:self-center"
        >
          View project
          <Icon icon={ArrowRight} size={20} />
        </span>
        {/* Mobile equivalent: the same ghost-arrow footprint ProjectCard uses elsewhere. */}
        <span
          aria-hidden
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-[var(--radius-clay-sm)] text-navy transition-transform duration-200 ease-[var(--ease-hover)] group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 sm:hidden"
        >
          <Icon icon={ArrowRight} size={24} />
        </span>
      </ViewTransitionLink>
    </>
  );
}

export interface EditorialGridProps {
  projects: Project[];
}

export function EditorialGrid({ projects }: EditorialGridProps) {
  const reduced = useReducedMotionSafe();
  const enter = reduced ? { duration: 0 } : { duration: ENTER_SEC };
  const exit = reduced ? { duration: 0 } : { duration: EXIT_SEC };

  return (
    <LazyMotionRoot>
      <ol className="flex list-none flex-col gap-[var(--space-5)]">
        <AnimatePresence initial={false}>
          {projects.map((project, index) => (
            <m.li
              key={project.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: enter }}
              exit={{ opacity: 0, transition: exit }}
              className="flex items-start gap-[var(--space-4)] sm:items-center sm:gap-[var(--space-5)]"
            >
              <ProjectRow project={project} index={index} />
            </m.li>
          ))}
        </AnimatePresence>
      </ol>
    </LazyMotionRoot>
  );
}
