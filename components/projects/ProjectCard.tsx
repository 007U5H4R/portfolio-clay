import type { ReactNode } from "react";
import type { Metric, Project } from "@/data/schema";
import { Hand, Sheet, Tape, type TapeSide } from "@/components/paper";
import { ViewTransitionLink } from "@/components/interactions/ViewTransitionLink";
import { formatAsOf } from "@/lib/format";

export interface ProjectCardProps {
  /** A schema-validated `Project`; kicker, name, tagline and status render verbatim (D7). */
  project: Project;
  /**
   * The metric rows this card shows, taken as-is from `project.metrics` (FeaturedWork picks them —
   * Design.md §7.1). Values, labels and `asOf` render verbatim; a non-`measured` row names its kind.
   * Empty → no metrics row.
   */
  metrics?: readonly Metric[] | undefined;
  /** `large` = the TeachSpark card (bigger h3 + padding, rust hero metric). */
  size?: "large" | "medium" | undefined;
  /** Where the fastening tape sits (mockup `.tape.l` / `.tape` / `.tape.r`). */
  tape?: TapeSide | undefined;
  /** Degrees; `Sheet` clamps to ±0.9. */
  rotate?: number | undefined;
  /** Optional slot between the tagline and the metrics (the flow `Sketch`). */
  children?: ReactNode | undefined;
  /**
   * A decoration pinned to the card (the `Sticky`). Rendered inside the host but outside the link,
   * so it never becomes part of the link's content.
   */
  aside?: ReactNode | undefined;
}

/** Unique `as of …` captions, in row order (one line when every row shares a date). */
function asOfCaption(metrics: readonly Metric[]): string {
  return [...new Set(metrics.map((m) => formatAsOf(m.asOf)))].join(" · ");
}

/**
 * Featured work card (Design.md §7.1, TKT-75 S75.01): a taped ivory `Sheet` whose content is one
 * `ViewTransitionLink` (exactly one `a` per card, `aria-label` = the project name, EXE-5 CSS-only VT
 * name `project-{slug}` on the anchor). Hover lifts the sheet −3 px and swaps to
 * `--shadow-paper-hover`; rotation lives on the separate `rotate` property, so it is preserved.
 * Reduced motion keeps only the shadow change (globals.css TKT-75 block). Server component.
 */
export function ProjectCard({
  project,
  metrics = [],
  size = "medium",
  tape = "c",
  rotate,
  children,
  aside,
}: ProjectCardProps) {
  const { slug, name, tagline, tags, statusLabel } = project;

  return (
    <Sheet as="article" variant="card" rotate={rotate} className={size === "large" ? "work-card work-card-large" : "work-card"}>
      <Tape side={tape} />
      <ViewTransitionLink
        href={`/work/${slug}`}
        transitionName={`project-${slug}`}
        aria-label={name}
        data-card-size={size}
        className="work-card-link focus-ring"
      >
        <p className="work-kicker" data-micro-label="">
          <span data-kicker="tags">{tags.join(" · ")}</span>{" "}
          <span className="work-kicker-status">
            · <span data-kicker="status">{statusLabel}</span>
          </span>
        </p>
        <h3 className="work-card-h">{name}</h3>
        <p className="work-card-tagline">{tagline}</p>
        {children}
        {metrics.length > 0 ? (
          <div className="work-metrics">
            <div className="work-metric-row">
              {metrics.map((metric, i) => (
                <div
                  key={metric.label}
                  className="work-metric"
                  data-metric={metric.kind}
                  data-tone={size === "large" && i === 0 ? "hero" : metric.value === "0" ? "zero" : undefined}
                >
                  <b data-metric-value="">{metric.value}</b>
                  <span>
                    <span data-metric-label="">{metric.label}</span>
                    {metric.kind !== "measured" ? <span className="work-metric-kind"> · {metric.kind}</span> : null}
                  </span>
                </div>
              ))}
            </div>
            <p className="work-metric-asof" data-metric-asof="">
              {asOfCaption(metrics)}
            </p>
          </div>
        ) : null}
        <Hand kind="cta" className="work-card-cta">
          Read the case study →
        </Hand>
      </ViewTransitionLink>
      {aside}
    </Sheet>
  );
}
