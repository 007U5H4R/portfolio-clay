import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { Annotation, TornEdge } from "@/components/paper";
import { SceneOpener } from "@/components/paper/SceneOpener";
import { ExperienceStrip, ExperienceStripFallback } from "@/components/projects/ExperienceStrip";
import { FilterTabs, FilterTabsFallback } from "@/components/projects/FilterTabs";
import { WorkGrid } from "@/components/projects/WorkGrid";
import { WorkHero } from "@/components/projects/WorkHero";
import { WorkIndex } from "@/components/projects/WorkIndex";
import { projects } from "@/data/projects";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `Projects · ${site.name}`,
  description:
    "Every project — personal AI builds and professional platform work — filterable by AI, Enterprise, Cloud and Experiments.",
  path: "/projects",
  ogFamily: "Selected Work",
});

/**
 * `/projects` (TKT-16/17 → TKT-80, Design.md §7.2; moved from `/work` by TKT-101 — `/work` is now the
 * Experience page, case studies stay at `/work/<slug>`): `SceneOpener` (TKT-95) → `WorkHero` (opener copy) →
 * the index section (`FilterTabs`, URL-synced `?filter=`, + `WorkGrid` → the numbered `WorkIndex` of
 * the PERSONAL builds, or `EmptyState` only when a filter is empty) → `ExperienceStrip` (the
 * professional entries as employment, never mixed into the filterable product index).
 *
 * The route MUST stay statically prerendered (TP1). `FilterTabs`, `WorkGrid` and `ExperienceStrip`
 * all read the filter with `useSearchParams` (client) rather than a server `searchParams` prop —
 * reading `searchParams` server-side would make `/projects` dynamic (E-4). Each sits in its own
 * `<Suspense>` whose fallback prerenders the DEFAULT state (All tab active + the unfiltered grid/
 * strip), so the static HTML carries every card/row (SEO + the dead-control crawler) and a deep link
 * (`/projects?filter=ai`) only flashes the full set for one frame before the client narrows it (TP7,
 * accepted). `assert-static` stays green.
 */
const personalProjects = projects.filter((project) => project.category === "personal");
const professionalProjects = projects.filter((project) => project.category === "professional");

export default function ProjectsPage() {
  return (
    <>
      {/* TKT-95 scene opener (EXE-18): the character's face + reaching arm sit ≈ 38 % down the scene. */}
      <SceneOpener id="scene-work" priority />
      <WorkHero />
      {/* TKT-80 index (Design.md §7.2): paper-2, torn top, sr-only h2 (QA-004 heading outline h1 → h2 →
          h3), the serif filter tabs + "start here ↓" annotation, then the numbered index / EmptyState.
          EVAL-018 unit = torn · annotation · (RailCite) sticky = 3. */}
      <section aria-labelledby="work-personal-heading" className="work-index-sec">
        <TornEdge fill="paper-2" />
        <Container className="work-index-wrap">
          <h2 id="work-personal-heading" className="sr-only">
            Personal builds
          </h2>
          <div className="work-tabs-row">
            <Suspense fallback={<FilterTabsFallback />}>
              <FilterTabs />
            </Suspense>
            <Annotation arrow="down" rotate={-1.5} className="work-tabs-note">
              start here ↓
            </Annotation>
          </div>
          <Suspense
            fallback={
              <div className="work-panel">
                <WorkIndex projects={personalProjects} />
              </div>
            }
          >
            <WorkGrid projects={personalProjects} />
          </Suspense>
        </Container>
      </section>
      {/* The strip renders its own <section aria-label="Professional experience"> (torn) so it leaves
          no empty landmark behind when a filter ("Experiments") matches no professional entry. */}
      <Suspense fallback={<ExperienceStripFallback projects={professionalProjects} />}>
        <ExperienceStrip projects={professionalProjects} />
      </Suspense>
    </>
  );
}
