import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import type { Project, SourceRef } from "@/data/schema";
import { ClayFrame } from "@/components/clay/ClayFrame";
import { ClayIcon } from "@/components/clay/ClayIcon";
import { StatusBadge } from "@/components/projects/StatusBadge";
import { MetricCard } from "@/components/case-study/artifacts";
import { DemoVideo } from "@/components/projects/DemoVideo";

export interface CaseStudyHeaderProps {
  /** The full schema-validated project — the header reads name, lead, meta, metrics, hero media. */
  project: Project;
  /** Resolved lucide icon for `project.icon` (the page resolves the name → component). */
  icon: LucideIcon;
}

/**
 * Flat 60/40 header for a case study (Design.md §3, TKT-19). Left: name (h1) → one-line lead →
 * role/duration/status meta chips → 2–3 inline `MetricCard`s (value/label/context/asOf/kind +
 * source; TKT-19 AC 2). Right: a 16:9 card-tier `ClayFrame` that is the View-Transition target — it
 * carries the same `project-{slug}` / `icon-{slug}` CSS names as the ProjectCard, so the browser
 * morphs the card into this media where native VT fires (EXE-5).
 *
 * Hero media is one of three (technical-plan.md §B TKT-19): the project's `hero.image`, else its
 * `links.demoVideo` (rendered through the reused `DemoVideo`, TKT-18), else a labelled placeholder
 * ("Hero media coming") — never a broken `<img>` (A13). Every project ships thin today, so the
 * placeholder is the live path until M-005 supplies real media.
 */
export function CaseStudyHeader({ project, icon }: CaseStudyHeaderProps) {
  const { slug, name, tagline, role, duration, status, statusLabel, metrics, hero, links, sources } =
    project;

  const meta = [
    role ? { label: "Role", value: role } : null,
    duration ? { label: "Duration", value: duration } : null,
  ].filter((entry): entry is { label: string; value: string } => entry !== null);

  // Resolve a metric's source id → the declared SourceRef; fail loud if it is missing (the schema's
  // superRefine already forbids this — this is the render-time backstop, EVAL-013).
  const bySourceId = new Map<string, SourceRef>(sources.map((s) => [s.id, s]));
  const headerMetrics = metrics.slice(0, 3).map((metric) => {
    const source = bySourceId.get(metric.source);
    if (!source) {
      throw new Error(
        `CaseStudyHeader: metric (label="${metric.label}") references source "${metric.source}" not declared in ${slug}.sources[] (EVAL-013).`,
      );
    }
    return { metric, source };
  });

  return (
    <header className="grid gap-[var(--space-8)] lg:grid-cols-[60fr_40fr] lg:items-start">
      <div className="flex flex-col gap-[var(--space-5)]">
        <h1 className="text-[length:var(--text-h2)] font-extrabold tracking-[var(--tracking-hero)] text-navy">
          {name}
        </h1>
        <p className="max-w-[44ch] text-[length:var(--text-lead)] text-navy-2">{tagline}</p>
        <div className="flex flex-wrap items-center gap-[var(--space-3)]">
          {meta.map((entry) => (
            <span key={entry.label} className="text-[length:var(--text-caption)] text-ink-soft">
              <span className="font-semibold text-navy-2">{entry.label}:</span> {entry.value}
            </span>
          ))}
          <StatusBadge status={status} statusLabel={statusLabel} />
        </div>

        {/* 2–3 inline mini-metrics — rendered only from real `Project.metrics` (empty until M-005,
            so nothing shows today; no fabricated number ever appears). */}
        {headerMetrics.length > 0 ? (
          <div className="grid grid-cols-1 gap-[var(--space-5)] sm:grid-cols-2">
            {headerMetrics.map(({ metric, source }) => (
              <MetricCard key={metric.label} metric={metric} source={source} variant="inline" />
            ))}
          </div>
        ) : null}
      </div>

      <ClayFrame
        ratio="16/9"
        tier="card"
        tone="lavender"
        style={{ viewTransitionName: `project-${slug}` }}
      >
        {/* Icon slot — same `icon-{slug}` name as the ProjectCard icon so it morphs (EXE-5). */}
        <span
          className="absolute left-[var(--space-5)] top-[var(--space-5)] z-10"
          style={{ viewTransitionName: `icon-${slug}` }}
        >
          <ClayIcon icon={icon} size={56} tone="lavender" />
        </span>

        {hero.image ? (
          <Image
            src={hero.image.src}
            alt={hero.image.alt}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            priority
            className="object-cover"
          />
        ) : links.demoVideo ? (
          <DemoVideo
            video={links.demoVideo}
            posterFallback={hero.image}
            liveUrl={links.live}
            name={name}
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
        ) : (
          // Media.kind:'placeholder' — real hero media lands with the case-study content (M-005).
          <div className="flex h-full w-full items-center justify-center p-[var(--space-6)] text-center text-[length:var(--text-body)] font-medium text-ink-soft">
            Hero media coming
          </div>
        )}
      </ClayFrame>
    </header>
  );
}
