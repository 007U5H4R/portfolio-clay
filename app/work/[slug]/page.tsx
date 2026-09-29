import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgressBar } from "@/components/interactions/ProgressBar";
import { getProject, projects } from "@/data/projects";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
// TASK-130: the custom product case-study system (Tushar's spec 2026-09-29).
import { getCaseStudy } from "@/data/case-studies";
import { portfolioEntries } from "@/data/portfolio";
import { CaseStudyView } from "@/components/case-study/system/CaseStudyView";
import { JournalView } from "@/components/case-study/journal/JournalView";
import "./case-study.css";
import "./journal.css";

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
    ogFamily: `${project.name} case study`,
    type: "article",
  });
}

const PERSONAL = projects.filter((project) => project.category === "personal");

/**
 * The custom product case study (TASK-130, Tushar's spec 2026-09-29; Design.md Dev-129): every
 * personal build renders a one-page story from its own record in `data/case-studies/<slug>.ts`
 * through `CaseStudyView` — product hero, numbered sections, evidence drawer, action strip and the
 * next-project band. `validateAll()` fails the build if a personal build has no record, so there is
 * no fallback template.
 */
export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const currentIndex = PERSONAL.findIndex((entry) => entry.slug === project.slug);
  const nextProject = PERSONAL[(currentIndex + 1) % PERSONAL.length]!;
  const study = getCaseStudy(project.slug);
  const portfolio = portfolioEntries.find((entry) => entry.slug === project.slug);
  if (!study || !portfolio) throw new Error(`/work/${project.slug}: no case-study record or portfolio entry (TASK-130)`);

  return (
    <>
      <ProgressBar />
      {study.layout === "journal" ? (
        <JournalView project={project} study={study} portfolio={portfolio} next={nextProject} />
      ) : (
        <CaseStudyView project={project} study={study} portfolio={portfolio} next={nextProject} />
      )}
    </>
  );
}
