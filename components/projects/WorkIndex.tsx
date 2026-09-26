"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/data/schema";
import { ViewTransitionLink } from "@/components/interactions/ViewTransitionLink";
import { Hand, Sheet, Sticky, Tape } from "@/components/paper";
import { formatAsOf } from "@/lib/format";

/**
 * `/work` numbered project index (TKT-80 · TSK-40, Design.md §7.2 "Index"; replaces the M-008
 * `EditorialGrid`). An `<ol>` on a 12-column grid:
 *   - rank 1 → the flagship opener: an ivory `Sheet card` (−0.5°, tape right) with the giant rust
 *     numeral outside the card, kicker, h3, tagline, metrics row + as-of note, status line;
 *   - rank 2 → the second opener (dashed left rule) — carries the "trust is the product." sticky
 *     when it is RailCite, the project the line is about (§3.3 index unit: torn · "start here" ·
 *     sticky = 3; any other filter shows ≤ 3);
 *   - ranks 3+ → slim rows `64px 1fr 240px 260px` (numeral · h3 + tagline · tags · status).
 *
 * Numerals come from the FILTERED array index, so they re-sequence on every filter change; they are
 * `aria-hidden` (the native `<ol>` already announces the ordinal). Every `<li>` holds exactly ONE
 * link — the h3's, stretched over its opener/row by CSS (`.work-link::after`) so the whole object is
 * the click target (TC-152 step 4). Status = coloured dot + the data's text, never colour alone.
 * Every string is verbatim from `data/projects.ts` (D7); dates through `lib/format`.
 *
 * Filter changes crossfade (Design.md §4: fade-out 150 / fade-in 200) in plain CSS (TKT-90d — was
 * `motion/react`'s `AnimatePresence`, which cost `/work` ~51 kB gz of first-load JS): items that
 * join the list get `data-enter` (a 200 ms opacity keyframe), items that leave stay mounted for
 * 150 ms with `data-exit` (opacity transition to 0, `inert`, `aria-hidden`) and are then dropped.
 * The first paint never animates (nothing is "entering" on the initial list). Reduced motion: the
 * global A6 rule forces the CSS to ~1 ms and the exit hold drops to 0 ms (EVAL-010). Opacity only —
 * never a transform.
 */

const EXIT_MS = 150;

interface Entry {
  project: Project;
  /** Index in the list it was last rendered in (exiting entries keep their old numeral/rank). */
  index: number;
  entering: boolean;
  exiting: boolean;
}

function toEntries(projects: Project[], previous: Entry[] | null): Entry[] {
  const before = new Set(previous?.filter((e) => !e.exiting).map((e) => e.project.slug) ?? []);
  const next: Entry[] = projects.map((project, index) => ({
    project,
    index,
    entering: previous !== null && !before.has(project.slug),
    exiting: false,
  }));
  if (!previous) return next;
  const kept = new Set(projects.map((p) => p.slug));
  previous.forEach((entry, position) => {
    if (kept.has(entry.project.slug) || entry.exiting) return;
    next.splice(Math.min(position, next.length), 0, { ...entry, entering: false, exiting: true });
  });
  return next;
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Rank = "flagship" | "second" | "row";

function rankOf(index: number): Rank {
  if (index === 0) return "flagship";
  if (index === 1) return "second";
  return "row";
}

const numeral = (index: number) => String(index + 1).padStart(2, "0");

function Status({ project }: { project: Project }) {
  return (
    <p className="work-status">
      <span className="work-status-label" data-status={project.status}>
        {project.statusLabel}
      </span>
      {project.statusAsOf ? <span className="work-asof">{formatAsOf(project.statusAsOf)}</span> : null}
    </p>
  );
}

function ProjectLink({ project }: { project: Project }) {
  return (
    <ViewTransitionLink
      href={`/work/${project.slug}`}
      transitionName={`project-${project.slug}`}
      aria-label={project.name}
      data-card-mode="grid"
      className="work-link focus-ring"
    >
      {project.name}
    </ViewTransitionLink>
  );
}

function Metrics({ project, max }: { project: Project; max: number }) {
  const shown = project.metrics.slice(0, max);
  const first = shown[0];
  if (!first) return null;
  return (
    <div className="work-metrics">
      {shown.map((metric, i) => (
        <p key={metric.label} className="work-metric" data-lead={i === 0 ? "" : undefined}>
          <b>{metric.value}</b>
          <span>{metric.label}</span>
        </p>
      ))}
      <p className="work-metrics-note">{formatAsOf(first.asOf)}</p>
    </div>
  );
}

function Opener({ project, index, rank }: { project: Project; index: number; rank: "flagship" | "second" }) {
  const body = (
    <>
      <p className="work-kicker" data-micro-label="">
        {project.tags.join(" · ")}
      </p>
      <h3 className="work-opener-h">
        <ProjectLink project={project} />
      </h3>
      <p className="work-tagline">{project.tagline}</p>
      <Metrics project={project} max={rank === "flagship" ? 3 : 2} />
      <Status project={project} />
      <span className="work-cta" aria-hidden="true">
        <Hand kind="cta">Read the case study →</Hand>
      </span>
    </>
  );

  if (rank === "flagship") {
    return (
      <>
        <span className="work-num work-num-giant" aria-hidden="true" data-numeral="">
          {numeral(index)}
        </span>
        <Sheet as="article" variant="card" rotate={-0.5} className="work-opener work-opener-flagship">
          <Tape side="r" />
          {body}
        </Sheet>
      </>
    );
  }

  return (
    <article className="work-opener work-opener-second">
      {project.slug === "railcite" ? (
        <Sticky tone="kraft" rotate={4} className="work-sticky">
          trust is the product.
        </Sticky>
      ) : null}
      <span className="work-num" aria-hidden="true" data-numeral="">
        {numeral(index)}
      </span>
      {body}
    </article>
  );
}

function Row({ project, index }: { project: Project; index: number }) {
  return (
    <>
      <span className="work-num" aria-hidden="true" data-numeral="">
        {numeral(index)}
      </span>
      <div className="work-row-main">
        <h3 className="work-row-h">
          <ProjectLink project={project} />
        </h3>
        <p className="work-tagline">{project.tagline}</p>
      </div>
      <p className="work-tags" data-micro-label="">
        {project.tags.join(" · ")}
      </p>
      <Status project={project} />
    </>
  );
}

export interface WorkIndexProps {
  projects: Project[];
}

export function WorkIndex({ projects }: WorkIndexProps) {
  // "Adjust state when a prop changes" during render (React docs pattern) — no effect round-trip,
  // so the new list and the exiting items appear in the same commit as the filter change.
  const [source, setSource] = useState(projects);
  const [entries, setEntries] = useState<Entry[]>(() => toEntries(projects, null));
  if (source !== projects) {
    setSource(projects);
    setEntries(toEntries(projects, entries));
  }

  const hasExiting = entries.some((e) => e.exiting);
  useEffect(() => {
    if (!hasExiting) return undefined;
    const timer = window.setTimeout(
      () => setEntries((current) => current.filter((e) => !e.exiting)),
      prefersReducedMotion() ? 0 : EXIT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [hasExiting, entries]);

  return (
    <ol className="work-index">
      {entries.map(({ project, index, entering, exiting }) => {
        const rank = rankOf(index);
        return (
          <li
            key={project.slug}
            data-rank={rank}
            data-slug={project.slug}
            data-enter={entering ? "" : undefined}
            data-exit={exiting ? "" : undefined}
            aria-hidden={exiting ? true : undefined}
            inert={exiting}
            className={`work-item work-item-${rank}`}
          >
            {rank === "row" ? (
              <Row project={project} index={index} />
            ) : (
              <Opener project={project} index={index} rank={rank} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
