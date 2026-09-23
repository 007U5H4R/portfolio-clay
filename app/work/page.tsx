import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { EditorialGrid } from "@/components/projects/EditorialGrid";
import { ExperienceStrip, ExperienceStripFallback } from "@/components/projects/ExperienceStrip";
import { FilterTabs, FilterTabsFallback } from "@/components/projects/FilterTabs";
import { WorkGrid } from "@/components/projects/WorkGrid";
import { WorkHero } from "@/components/projects/WorkHero";
import { projects } from "@/data/projects";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `Work · ${site.name}`,
  description:
    "Every project — personal AI builds and professional platform work — filterable by AI, Enterprise, Cloud and Experiments.",
  path: "/work",
  ogFamily: "Selected Work",
});

/**
 * `/work` (TKT-16/17, M-004): the full editorial project index. `WorkHero` (flat intro) →
 * `FilterTabs` (URL-synced `?filter=`) → `WorkGrid` (client-filtered editorial grid of the PERSONAL
 * builds only) → `ExperienceStrip` (the professional-experience entries, TKT-17: a flat, non-clay,
 * clearly-separated strip below the grid — never mixed into the filterable product grid).
 *
 * The route MUST stay statically prerendered (TP1). `FilterTabs`, `WorkGrid` and `ExperienceStrip`
 * all read the filter with `useSearchParams` (client) rather than a server `searchParams` prop —
 * reading `searchParams` server-side would make `/work` dynamic (E-4). Each sits in its own
 * `<Suspense>` whose fallback prerenders the DEFAULT state (All tab active + the unfiltered grid/
 * strip), so the static HTML carries every card/row (SEO + the dead-control crawler) and a deep link
 * (`/work?filter=ai`) only flashes the full set for one frame before the client narrows it (TP7,
 * accepted). `assert-static` stays green.
 */
const personalProjects = projects.filter((project) => project.category === "personal");
const professionalProjects = projects.filter((project) => project.category === "professional");

export default function WorkPage() {
  return (
    <>
      <WorkHero />
      <Container as="section" aria-labelledby="work-personal-heading" className="pb-[var(--section-gap-desktop)]">
        {/* QA-004 (TKT-48 follow-up): the page h1 ("Work") was followed directly by the ProjectCard
            h3s — an h1→h3 heading-outline skip for screen-reader users navigating by heading (caught
            by the CF-3 heading-order guard, invisible to axe's WCAG2AA tags). A real (sr-only) h2
            names the personal-builds region so the outline reads h1 → h2 → h3; the visible framing
            already lives in WorkHero's lead + FilterTabs, so no visual change. */}
        <h2 id="work-personal-heading" className="sr-only">
          Personal builds
        </h2>
        <Suspense fallback={<FilterTabsFallback />}>
          <FilterTabs />
        </Suspense>
        <Suspense
          fallback={
            <div className="mt-[var(--space-8)]">
              <EditorialGrid projects={personalProjects} />
            </div>
          }
        >
          <WorkGrid projects={personalProjects} />
        </Suspense>
      </Container>
      <Container as="section" aria-label="Professional experience" className="pb-[var(--section-gap-desktop)]">
        <Suspense fallback={<ExperienceStripFallback projects={professionalProjects} />}>
          <ExperienceStrip projects={professionalProjects} />
        </Suspense>
      </Container>
    </>
  );
}
