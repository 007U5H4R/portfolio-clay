"use client";

import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Project } from "@/data/schema";
import { ClayPill } from "@/components/clay/ClayPill";
import { Icon } from "@/components/common/Icon";
import { Tag } from "@/components/common/Tag";
import { applyFilter, parseFilter } from "@/lib/filters";

/**
 * ExperienceStrip (TKT-17, M-004; Design.md §3 "Work page → ExperienceStrip"; tickets.md TKT-17).
 *
 * Below the personal `/work` grid: a flat, non-clay, bordered strip of the three
 * `category:'professional'` entries, rendered as **employment**, not product — deliberately the
 * visual opposite of `ProjectCard` (Law of Common Region: a shared flat/bordered treatment marks
 * this as a different kind of content). No `ClayCard`/`ClayIcon` surface, no `StatusBadge`, no
 * `DemoVideo`, no external/live link, no `ViewTransition`. A row is role + company/name + dates +
 * tags, with an inline expand-on-click for the one-paragraph, resume-sourced summary
 * (`overview.thirtySecond[0]`). Only one row is open at a time; the expand reuses `HowIThink`'s
 * (`components/home/HowIThink.tsx`) `grid-template-rows` CSS-transition technique — no `layout`
 * animation (no `domMax` bundle cost) — collapsed to instant via `motion-reduce:transition-none`.
 *
 * Filter-aware (AC4): shares the single `lib/filters.ts` `applyFilter`/`parseFilter` the personal
 * grid's `WorkGrid` uses, reading the same `?filter=`. A professional entry's own `filters` array
 * (e.g. MARS: `['enterprise','cloud','ai']`) decides whether it survives a given tab. When a filter
 * leaves nothing to show (e.g. "Experiments", which no professional entry carries), the shell
 * renders nothing — no heading, rows, or CTA — leaving no empty labelled box behind (the wrapping
 * `<section aria-label>` in `app/work/page.tsx` still exists as an empty landmark, same as any
 * section whose content can be filtered to zero).
 *
 * `ExperienceStrip` reads `useSearchParams` (client-only, requires a `<Suspense>` boundary — same
 * constraint `WorkGrid` has, TP7); `ExperienceStripFallback` is the sibling rendered in the Suspense
 * fallback, showing the unfiltered set, so `/work` stays statically prerendered and a deep link only
 * flashes the full strip for one frame before the client narrows it.
 *
 * Deviation (documented): technical-plan.md's row spec names "title · company · dates · tags", but
 * the `Project` schema (shared with personal builds, TKT-15) has no discrete `company` field for a
 * professional entry — the employer is already folded into `name` (e.g. "Accounts Receivable
 * Modernization — American Express"). Rather than parsing a company out of that string, the row
 * shows `role` (the "Senior Product Manager" / "Technical Project Manager" / "Assistant Product
 * Manager" title, S8) as the primary line and `name` (which already carries the employer) as the
 * secondary line — every word rendered is verbatim from the data, nothing is fabricated or split.
 */

export interface ExperienceStripProps {
  /** The professional-experience entries (`category === 'professional'`). */
  projects: Project[];
}

const rowPanelId = (slug: string) => `experience-row-${slug}`;

function ExperienceRow({
  project,
  isOpen,
  onToggle,
}: {
  project: Project;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = rowPanelId(project.slug);
  const summary = project.overview.thirtySecond[0];

  return (
    <li className="border-t border-ink-soft/20 first:border-t-0">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex min-h-11 w-full flex-col gap-[var(--space-2)] rounded-[var(--radius-utility)] py-[var(--space-4)] text-left focus-ring"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-[var(--space-4)] gap-y-[var(--space-1)]">
          <div>
            <p className="font-bold text-navy">{project.role}</p>
            <p className="text-caption text-navy-2">{project.name}</p>
          </div>
          <p className="whitespace-nowrap text-caption text-ink-soft">{project.duration}</p>
        </div>
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          {project.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
          <Icon
            icon={ChevronDown}
            size={20}
            className={`ml-auto shrink-0 text-ink-soft transition-transform duration-200 ease-[var(--ease-hover)] motion-reduce:transition-none ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>
      <div
        id={panelId}
        className="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          {isOpen && summary ? (
            <p className="max-w-[60ch] pb-[var(--space-4)] text-[length:var(--text-body)] text-navy-2">
              {summary}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function ExperienceStripShell({ projects }: ExperienceStripProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  if (projects.length === 0) return null;

  return (
    <div className="border-t border-ink-soft/20 pt-[var(--space-8)]">
      <h2 className="text-caption font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-navy-2">
        Professional experience — corporate work, not a public product.
      </h2>
      <ol className="mt-[var(--space-4)] flex flex-col">
        {projects.map((project) => (
          <ExperienceRow
            key={project.slug}
            project={project}
            isOpen={openSlug === project.slug}
            onToggle={() =>
              setOpenSlug((current) => (current === project.slug ? null : project.slug))
            }
          />
        ))}
      </ol>
      <div className="mt-[var(--space-6)]">
        <ClayPill variant="link" href="/about#experience">
          See my experience
        </ClayPill>
      </div>
    </div>
  );
}

/** Filter-aware strip — must live inside a `<Suspense>` boundary (reads `useSearchParams`, TP7). */
export function ExperienceStrip({ projects }: ExperienceStripProps) {
  const searchParams = useSearchParams();
  const filter = parseFilter(searchParams.get("filter"));
  const filtered = applyFilter(projects, filter);
  return <ExperienceStripShell projects={filtered} />;
}

/** Suspense fallback: the unfiltered set, matching the default `/work` (`all`) state (TP7). */
export function ExperienceStripFallback({ projects }: ExperienceStripProps) {
  return <ExperienceStripShell projects={projects} />;
}
