import type { Project } from "@/data/schema";
import { Annotation } from "@/components/paper/Annotation";
import { TornEdge } from "@/components/paper/TornEdge";
import { ViewTransitionLink } from "@/components/interactions/ViewTransitionLink";
import { Container } from "@/components/layout/Container";

export interface NextProjectProps {
  /** The next personal project in `/work` grid order (the page wraps around at the end). */
  project: Pick<Project, "slug" | "name">;
}

/**
 * Next-project band (TKT-81, Design.md §7.3 "Next project", §3.3 = torn + "next up" → 2): a navy
 * section with a navy torn top, kraft eyebrow "Next", ivory h2 `{name} →` (the arrow slides 8 px on
 * hover, not under reduced motion) and the kraft "next up" annotation. The whole band is one link
 * (TC-156 step 4) with a kraft focus ring; it keeps the `project-{slug}` view-transition name so the
 * next header morphs in (EXE-5) and the explicit accessible name "Next project: {name}".
 */
export function NextProject({ project }: NextProjectProps) {
  return (
    <section className="cs-next cs-torn-fill" aria-label="Next project">
      <TornEdge fill="navy" />
      <Container>
        <ViewTransitionLink
          href={`/work/${project.slug}`}
          transitionName={`project-${project.slug}`}
          aria-label={`Next project: ${project.name}`}
          className="cs-next-link"
        >
          <span className="cs-next-eyebrow">Next</span>
          <h2 className="cs-next-h">
            {project.name} <span className="cs-next-arr" aria-hidden="true">→</span>
          </h2>
          <Annotation size="lg" rotate={-1.5} className="cs-next-note">
            next up
          </Annotation>
        </ViewTransitionLink>
      </Container>
    </section>
  );
}
