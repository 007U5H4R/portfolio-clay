import type { Project } from "@/data/schema";
import { projects } from "@/data/projects";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ProjectCard } from "@/components/projects/ProjectCard";

/**
 * FeaturedWork (home section, TKT-12). Server component — the featured trio is derived from the
 * `projects` collection (the schema/content gate guarantees exactly 3 personal builds with distinct
 * ranks 1/2/3 and exactly one `gridSize:'large'`), sorted by rank so DOM order is TeachSpark →
 * RailCite → Nuptis → Velora.
 *
 * Layout (Design.md §3 Featured Work + brief EXE-6 "not three identical rectangles"): a single
 * equal-height row at ≥1024, but *editorial*, not uniform — the one `gridSize:'large'` card spans
 * two of four columns (~50%) while the two `medium` cards take one column each (~25%), so the lead
 * project reads as the hero of the set without breaking the equal-height rhythm. Below 1024 the row
 * stacks to a single full-width column (24px gap). Card anatomy is unchanged (ProjectCard featured
 * mode); the asymmetry is carried entirely by grid width, so heights stay equal (the S12.02 gate).
 */
const featured: Project[] = projects
  .filter((project) => project.featured)
  .sort((a, b) => (a.featured ?? 0) - (b.featured ?? 0));

export function FeaturedWork() {
  return (
    <Section id="work-featured" aria-labelledby="work-featured-heading">
      <SectionHeading
        id="work-featured-heading"
        eyebrow="Work"
        title="Featured work"
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
