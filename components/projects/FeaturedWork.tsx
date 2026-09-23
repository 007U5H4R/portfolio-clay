import type { Artifact, Project } from "@/data/schema";
import { projects } from "@/data/projects";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProductScene, type ProductSceneQuote } from "@/components/projects/ProductScene";

/**
 * FeaturedWork (home section, TKT-12; redesigned M-008 Stage B / TASK-54 to mockup 2 "Real
 * problems. Real products."). Server component — the featured trio is derived from the `projects`
 * collection (the schema/content gate guarantees exactly 3 personal builds with distinct ranks
 * 1/2/3 and exactly one `gridSize:'large'`).
 *
 * Layout: an editorial "product scene" replaces the former 3-up card grid — RailCite (the project
 * whose whole story is "the feature is a citation, the product is trust") is promoted to a
 * flagship browser-window scene (`ProductScene`) at the top; TeachSpark and Velora render below it
 * as the existing `ProjectCard` (featured mode, unchanged anatomy/links/content) in a 2-up row.
 * `gridSize`/`featured` rank on the underlying data are untouched — only this section's
 * presentation changed.
 */
const featured: Project[] = projects
  .filter((project) => project.featured)
  .sort((a, b) => (a.featured ?? 0) - (b.featured ?? 0));

const FLAGSHIP_SLUG = "railcite";
/** rc-a-trust in data/projects.ts (RailCite "learned" chapter, source RC-LINKEDIN). */
const FLAGSHIP_QUOTE_ARTIFACT_ID = "rc-a-trust";

/** Finds a real, sourced `insight` artifact's quote/attribution inside a project's chapters. */
function findInsightQuote(project: Project | undefined, artifactId: string): ProductSceneQuote | null {
  if (!project) return null;
  for (const chapter of project.chapters) {
    const hit = chapter.artifacts.find(
      (artifact): artifact is Extract<Artifact, { type: "insight" }> =>
        artifact.type === "insight" && artifact.id === artifactId,
    );
    if (hit) return { text: hit.quote, attribution: hit.attribution };
  }
  return null;
}

export function FeaturedWork() {
  const flagship = featured.find((project) => project.slug === FLAGSHIP_SLUG);
  const secondary = featured.filter((project) => project.slug !== FLAGSHIP_SLUG);
  // Falls back to the project's own (already sourced) tagline if the artifact id ever moves —
  // never fabricates a substitute quote.
  const quote =
    findInsightQuote(flagship, FLAGSHIP_QUOTE_ARTIFACT_ID) ??
    (flagship ? { text: flagship.tagline, attribution: flagship.name } : null);

  return (
    <Section id="work-featured" aria-labelledby="work-featured-heading">
      <SectionHeading
        id="work-featured-heading"
        eyebrow="Featured work"
        title="Real problems. Real products."
        lead="Three products I designed and built end-to-end — from the problem to the shipped thing."
        className="mb-[var(--space-8)]"
      />

      <div className="flex flex-col gap-[var(--space-6)] lg:gap-[var(--space-8)]">
        {flagship && quote ? <ProductScene project={flagship} quote={quote} /> : null}

        <div className="grid grid-cols-1 gap-[var(--space-6)] sm:grid-cols-2">
          {secondary.map((project) => (
            <ProjectCard key={project.slug} project={project} mode="featured" />
          ))}
        </div>
      </div>
    </Section>
  );
}
