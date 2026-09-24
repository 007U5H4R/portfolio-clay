import type { Project } from "@/data/schema";
import { projects } from "@/data/projects";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ProjectCard } from "@/components/projects/ProjectCard";

/**
 * FeaturedWork (home section, TKT-12; M-008's flagship browser-window scene treatment removed at
 * TSK-38, pending TKT-75's rebuild). Server component — the featured trio is derived from the `projects`
 * collection (the schema/content gate guarantees exactly 3 personal builds with distinct ranks
 * 1/2/3 and exactly one `gridSize:'large'`).
 *
 * Layout: a single equal-height row at ≥1024 — the one `gridSize:'large'` card spans two of four
 * columns (~50%) while the two `medium` cards take one column each (~25%), so the lead project
 * reads as the hero of the set without breaking the equal-height rhythm (S12.02). Below 1024 the
 * row stacks to a single full-width column. Card anatomy is the plain, unrestyled `ProjectCard`
 * (featured mode) — the asymmetry is carried entirely by grid width.
 */
const featured: Project[] = projects
  .filter((project) => project.featured)
  .sort((a, b) => (a.featured ?? 0) - (b.featured ?? 0));

export function FeaturedWork() {
  return (
    <Section id="work-featured" aria-labelledby="work-featured-heading">
      <SectionHeading
        id="work-featured-heading"
        eyebrow="Featured work"
        title="Real problems. Real products."
        lead="Three products I designed and built end-to-end — from the problem to the shipped thing."
        className="mb-[var(--space-8)]"
      />

      <div className="grid grid-cols-1 gap-[var(--space-6)] lg:grid-cols-4 lg:gap-[var(--space-8)]">
        {featured.map((project) => (
          <div
            key={project.slug}
            className={project.gridSize === "large" ? "lg:col-span-2" : "lg:col-span-1"}
          >
            <ProjectCard project={project} mode="featured" />
          </div>
        ))}
      </div>
    </Section>
  );
}
