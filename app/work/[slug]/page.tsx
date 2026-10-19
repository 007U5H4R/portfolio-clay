import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgressBar } from "@/components/interactions/ProgressBar";
import { getProject, projects } from "@/data/projects";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { isListed, nextListedProject } from "@/lib/portfolio";
// TASK-130: the custom product case-study system (Tushar's spec 2026-09-29).
import { getCaseStudy } from "@/data/case-studies";
import { portfolioEntries } from "@/data/portfolio";
import { CaseStudyView } from "@/components/case-study/system/CaseStudyView";
import { JournalView } from "@/components/case-study/journal/JournalView";
import { PaperView } from "@/components/case-study/teachspark/PaperView";
import { RailciteView } from "@/components/case-study/railcite/RailciteView";
import { VeloraView } from "@/components/case-study/velora/VeloraView";
import { BhaktiVilasView } from "@/components/case-study/bhakti-vilas/BhaktiVilasView";
import { NuptisView } from "@/components/case-study/nuptis/NuptisView";
import { PratyasaView } from "@/components/case-study/pratyasa/PratyasaView";
import { CampfireView } from "@/components/case-study/campfire/CampfireView";
import { SlagCityView } from "@/components/case-study/slag-city/SlagCityView";
import "./case-study.css";
import "./journal.css";
import "./teachspark-paper.css";
import "./railcite-paper.css";
import "./velora-paper.css";
import "./bhakti-vilas-paper.css";
import "./nuptis-paper.css";
import "./pratyasa-paper.css";
import "./campfire-paper.css";
import "./slag-city-paper.css";

/**
 * Only the personal slugs are built; any other `/work/*` slug 404s (dynamicParams=false). Every
 * personal build gets a `/work/<slug>` page; professional experience entries have no case-study
 * page (SITEMAP.md), matching the sitemap's personal-only filter. All routes stay static (TP1).
 */
export function generateStaticParams() {
  return projects
    .filter((project) => project.category === "personal")
    .map((project) => ({ slug: project.slug }));
}

export const dynamicParams = false;

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return buildMetadata({
    title: `${project.name} · ${site.name}`,
    description: project.tagline,
    path: `/work/${project.slug}`,
    type: "article",
    noindex: !isListed(project), // TASK-249 (Tushar 2026-10-18): unlisted builds stay reachable but out of the index
  });
}

const PERSONAL = projects.filter((project) => project.category === "personal");

/**
 * The custom product case study (TASK-130, Tushar's spec 2026-09-29; Design.md Dev-130): every
 * personal build renders a one-page story from its own record in `data/case-studies/<slug>.ts`
 * through `CaseStudyView` — product hero, numbered sections, evidence drawer, action strip and the
 * next-project band. `validateAll()` fails the build if a personal build has no record, so there is
 * no fallback template.
 */
export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  // TASK-249 (Tushar 2026-10-18): the next-project band cycles through listed builds only.
  const nextProject = nextListedProject(PERSONAL, project.slug);
  const study = getCaseStudy(project.slug);
  const portfolio = portfolioEntries.find((entry) => entry.slug === project.slug);
  if (!study || !portfolio) throw new Error(`/work/${project.slug}: no case-study record or portfolio entry (TASK-130)`);

  return (
    <>
      <ProgressBar />
      {study.layout === "pratyasa" ? (
        <PratyasaView project={project} study={study} portfolio={portfolio} next={nextProject} />
      ) : study.layout === "bhakti" ? (
        <BhaktiVilasView project={project} study={study} portfolio={portfolio} next={nextProject} />
      ) : study.layout === "nuptis" ? (
        <NuptisView project={project} study={study} portfolio={portfolio} next={nextProject} />
      ) : study.layout === "campfire" ? (
        <CampfireView project={project} study={study} portfolio={portfolio} next={nextProject} />
      ) : study.layout === "slagcity" ? (
        <SlagCityView project={project} study={study} portfolio={portfolio} next={nextProject} />
      ) : study.layout === "velora" ? (
        <VeloraView project={project} study={study} portfolio={portfolio} next={nextProject} />
      ) : study.layout === "railcite" ? (
        <RailciteView project={project} study={study} portfolio={portfolio} next={nextProject} />
      ) : study.layout === "paper" ? (
        <PaperView project={project} study={study} portfolio={portfolio} next={nextProject} />
      ) : study.layout === "journal" ? (
        <JournalView project={project} study={study} portfolio={portfolio} next={nextProject} />
      ) : (
        <CaseStudyView project={project} study={study} portfolio={portfolio} next={nextProject} />
      )}
    </>
  );
}
