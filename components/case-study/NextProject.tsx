import type { CSSProperties } from "react";
import { NEW_TAB_HINT } from "@/lib/case-study-link";
import type { Project } from "@/data/schema";
import { TornEdge } from "@/components/paper/TornEdge";
import { ViewTransitionLink } from "@/components/interactions/ViewTransitionLink";
import { Container } from "@/components/layout/Container";
import { portfolioEntries } from "@/data/portfolio";
import { CaseName } from "./CaseName";
import { NEXT_BAND_ART } from "./next-art";

/** Per-theme artwork for the band (TASK-275): two WebPs generated on each theme's own band colour. */
export interface NextProjectArt {
  light: string;
  dark: string;
  alt: string;
  width: number;
  height: number;
  /** Fraction of the image width that is empty on its left (a transparent cut-out): trimmed so the subject sits at the band edge. */
  x0?: number;
}

/** The eyebrow on every next band (NextProject and the four paper bands): one source. */
export const NEXT_EYEBROW = "Next project";

/** Products whose logo file is an opaque dark plate (Slag City's metal sign), which reads as a small dark box on a band: the band shows the plain name. */
const PLAIN_NAME_IN_BAND = new Set(["slag-city"]);

/** TASK-292: the one-line description under a product's name on every next band. One source: `nextLine` on its `data/portfolio.ts` entry. */
export function nextLineFor(slug: string): string | undefined {
  return portfolioEntries.find((e) => e.slug === slug)?.nextLine;
}

export interface NextProjectProps {
  /** The next personal project in `/projects` index order (the page wraps around at the end). */
  project: Pick<Project, "slug" | "name">;
}

export type NextProjectTone = "cream";

/**
 * Next-project band (TKT-81, Design.md §7.3 "Next project", §3.3 = torn + "next up" → 2): a navy
 * section with a navy torn top, kraft eyebrow "Next", ivory h2 `{name} →` (the arrow slides 8 px on
 * hover, not under reduced motion) and the kraft "next up" annotation. The whole band is one link
 * (TC-156 step 4) with a kraft focus ring; it keeps the `project-{slug}` view-transition name so the
 * next header morphs in (EXE-5) and the explicit accessible name "Next project: {name}".
 * TASK-292: the supporting line under the title is the product's `nextLine` (data/portfolio.ts). Optional (TASK-279): `tone="cream"`
 * turns the light-mode band cream (see `NextProjectProps`).
 */
export function NextProject({ project }: NextProjectProps) {
  const line = nextLineFor(project.slug);
  const { art, tone } = NEXT_BAND_ART[project.slug] ?? {};
  return (
    <section className="cs-next cs-torn-fill next-band" aria-label="Next project" data-tone={tone}>
      <TornEdge fill="navy" />
      {art ? (
        <span className="cs-next-art next-band-art" aria-hidden="true" style={art.x0 ? ({ "--na-x0": art.x0 } as CSSProperties) : undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized, pre-compressed static WebP, one per theme */}
          <img className="cs-next-art-img cs-next-art-light" src={art.light} alt="" width={art.width} height={art.height} loading="lazy" decoding="async" />
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized, pre-compressed static WebP, one per theme */}
          <img className="cs-next-art-img cs-next-art-dark" src={art.dark} alt="" width={art.width} height={art.height} loading="lazy" decoding="async" />
        </span>
      ) : null}
      <Container className="next-band-in">
        <ViewTransitionLink
          href={`/work/${project.slug}`}
          transitionName={`project-${project.slug}`}
          aria-label={`Next project: ${project.name} ${NEW_TAB_HINT}`}
          target="_blank"
          rel="noopener noreferrer"
          className="cs-next-link next-band-link"
        >
          <span className="cs-next-eyebrow next-band-eyebrow">{NEXT_EYEBROW}</span>
          <h2 className="cs-next-h next-band-h">
            {PLAIN_NAME_IN_BAND.has(project.slug) ? project.name : <CaseName slug={project.slug} name={project.name} onDark={tone !== "cream"} />} <span className="cs-next-arr" aria-hidden="true">→</span>
          </h2>
          {line ? <p className="cs-next-line next-band-line">{line}</p> : null}
        </ViewTransitionLink>
      </Container>
    </section>
  );
}
