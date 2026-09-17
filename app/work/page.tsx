import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { EditorialGrid } from "@/components/projects/EditorialGrid";
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
 * `/work` (TKT-16, M-004): the full editorial project index. `WorkHero` (flat intro) → `FilterTabs`
 * (URL-synced `?filter=`) → `WorkGrid` (client-filtered editorial grid of the PERSONAL builds only;
 * professional experience renders in the ExperienceStrip, TKT-17).
 *
 * The route MUST stay statically prerendered (TP1). `FilterTabs` and `WorkGrid` read the filter with
 * `useSearchParams` (client) rather than a server `searchParams` prop — reading `searchParams`
 * server-side would make `/work` dynamic (E-4). Each sits in its own `<Suspense>` whose fallback
 * prerenders the DEFAULT state (All tab active + the unfiltered grid), so the static HTML carries
 * every card (SEO + the dead-control crawler) and a deep link (`/work?filter=ai`) only flashes the
 * full grid for one frame before the client narrows it (TP7, accepted). `assert-static` stays green.
 */
const personalProjects = projects.filter((project) => project.category === "personal");

export default function WorkPage() {
  return (
    <>
      <WorkHero />
      <Container as="section" aria-label="Projects" className="pb-[var(--section-gap-desktop)]">
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
    </>
  );
}
