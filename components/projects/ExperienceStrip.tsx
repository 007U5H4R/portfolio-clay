"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Project } from "@/data/schema";
import { Hand, TornEdge } from "@/components/paper";
import { applyFilter, parseFilter } from "@/lib/filters";

/**
 * ExperienceStrip (TKT-17 → TKT-80 · TSK-41, Design.md §7.2 "Experience strip").
 *
 * Below the personal index: the three `category:'professional'` entries rendered as **employment**,
 * not product — no card, no status badge, no live/external link, no arrow affordance inside a row
 * (TC-153 step 5). The whole `<section aria-label="Professional experience">` (paper, torn top —
 * EVAL-018 unit = 1) is rendered here so it disappears entirely when a filter leaves no row
 * ("Experiments"): no empty landmark, no orphan torn edge.
 *
 * Each row is a native `<details name="job">` (role Fraunces 22, name, duration tabular, tags,
 * hand-drawn chevron that rotates 180° when open; body = `overview.thirtySecond[0]` behind a CSS `↳`
 * marker). The shared `name` makes the browser keep one row open at a time (exclusive accordion);
 * `summary` gives the keyboard path for free (Enter/Space, EVAL-007). Every word is verbatim from the
 * data — the employer already lives in `name` (TKT-17 deviation, unchanged).
 *
 * Filter-aware via the single `lib/filters.ts` parser (same `?filter=` as `WorkGrid`); must sit in a
 * `<Suspense>` (reads `useSearchParams`, TP7). `ExperienceStripFallback` prerenders the unfiltered
 * strip so `/work` stays static and a deep link only flashes the full strip for one frame.
 */

export interface ExperienceStripProps {
  /** The professional-experience entries (`category === 'professional'`). */
  projects: Project[];
}

function Chevron() {
  return (
    <svg className="job-chev" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path d="M3 6 C 6 9, 8 11, 9 12 C 10 11, 12 9, 15 6" />
    </svg>
  );
}

function ExperienceRow({ project }: { project: Project }) {
  const summary = project.overview.thirtySecond[0];
  return (
    <details className="job" name="job" data-slug={project.slug}>
      <summary className="job-summary focus-ring">
        <span className="job-title">
          <span className="job-role">{project.role}</span>
          <span className="job-name">{project.name}</span>
        </span>
        <span className="job-dur">{project.duration}</span>
        <Chevron />
        <span className="job-tags" data-micro-label="">
          {project.tags.join(" · ")}
        </span>
      </summary>
      {summary ? <p className="job-body">{summary}</p> : null}
    </details>
  );
}

function ExperienceStripShell({ projects }: ExperienceStripProps) {
  if (projects.length === 0) return null;

  return (
    <section aria-label="Professional experience" className="work-strip">
      <TornEdge fill="paper" />
      <div className="work-strip-wrap">
        <h2 className="work-strip-h" data-micro-label="">
          Professional experience — corporate work, not a public product.
        </h2>
        <div className="work-strip-rows">
          {projects.map((project) => (
            <ExperienceRow key={project.slug} project={project} />
          ))}
        </div>
        <Link href="/about#experience" className="work-strip-link focus-ring">
          <Hand kind="cta">See my experience →</Hand>
        </Link>
      </div>
    </section>
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
