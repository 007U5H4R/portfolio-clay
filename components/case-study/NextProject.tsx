import { NEW_TAB_HINT } from "@/lib/case-study-link";
import type { Project } from "@/data/schema";
import { Annotation } from "@/components/paper/Annotation";
import { TornEdge } from "@/components/paper/TornEdge";
import { ViewTransitionLink } from "@/components/interactions/ViewTransitionLink";
import { Container } from "@/components/layout/Container";

/** Per-theme artwork for the band (TASK-275): two WebPs generated on each theme's own band colour. */
export interface NextProjectArt {
  light: string;
  dark: string;
  alt: string;
  width: number;
  height: number;
}

/** TASK-275 (Tushar 2026-10-19): the Nuptis band's Bhakti Vilas artwork. Other studies pass none. */
export const BHAKTI_NEXT_ART: NextProjectArt = {
  light: "/media/case-studies/nuptis/bhakti-next-light.webp",
  dark: "/media/case-studies/nuptis/bhakti-next-dark.webp",
  alt: "A paper-craft miniature of an elderly devotee playing a harmonium beside a golden retriever, with a diya and a small heart-pulse care card joined by a paper ribbon: devotion-led wellness and care.",
  width: 1600,
  height: 1062,
};

/** TASK-279 (Tushar 2026-10-19): the supporting line under the Bhakti Vilas title on the Nuptis band. */
export const BHAKTI_NEXT_LINE = "Devotion-led wellbeing, with health monitored and cared for.";

export interface NextProjectProps {
  /** The next personal project in `/projects` index order (the page wraps around at the end). */
  project: Pick<Project, "slug" | "name">;
  art?: NextProjectArt | undefined;
  /** TASK-279: an optional supporting line under the title (one short sentence). It replaces the "next up" note; omitted → the band is unchanged. */
  line?: string | undefined;
  /**
   * TASK-279: light-mode surface tone. Omitted → the navy band every study has today. `"cream"` → the band, its torn edge,
   * its text and its focus ring take the site's paper cream with ink text in light mode; dark mode stays the navy band.
   */
  tone?: NextProjectTone | undefined;
}

export type NextProjectTone = "cream";

/**
 * Next-project band (TKT-81, Design.md §7.3 "Next project", §3.3 = torn + "next up" → 2): a navy
 * section with a navy torn top, kraft eyebrow "Next", ivory h2 `{name} →` (the arrow slides 8 px on
 * hover, not under reduced motion) and the kraft "next up" annotation. The whole band is one link
 * (TC-156 step 4) with a kraft focus ring; it keeps the `project-{slug}` view-transition name so the
 * next header morphs in (EXE-5) and the explicit accessible name "Next project: {name}".
 * Optional (TASK-279): `line` adds a supporting sentence under the title; `tone="cream"` turns the light-mode band cream
 * (see `NextProjectProps`). With neither prop the markup is exactly the original.
 */
export function NextProject({ project, art, line, tone }: NextProjectProps) {
  return (
    <section className="cs-next cs-torn-fill" aria-label="Next project" data-tone={tone}>
      <TornEdge fill="navy" />
      <Container>
        <ViewTransitionLink
          href={`/work/${project.slug}`}
          transitionName={`project-${project.slug}`}
          aria-label={`Next project: ${project.name} ${NEW_TAB_HINT}`}
          target="_blank"
          rel="noopener noreferrer"
          className="cs-next-link"
        >
          <span className="cs-next-eyebrow">Next</span>
          <h2 className="cs-next-h">
            {project.name} <span className="cs-next-arr" aria-hidden="true">→</span>
          </h2>
          {line ? <p className="cs-next-line">{line}</p> : null}
          {line ? null : (
            <Annotation size="lg" rotate={-1.5} className="cs-next-note">
              next up
            </Annotation>
          )}
          {art ? (
            <span className="cs-next-art" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized, pre-compressed static WebP, one per theme */}
              <img className="cs-next-art-img cs-next-art-light" src={art.light} alt="" width={art.width} height={art.height} loading="lazy" decoding="async" />
              {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized, pre-compressed static WebP, one per theme */}
              <img className="cs-next-art-img cs-next-art-dark" src={art.dark} alt="" width={art.width} height={art.height} loading="lazy" decoding="async" />
            </span>
          ) : null}
        </ViewTransitionLink>
      </Container>
    </section>
  );
}
