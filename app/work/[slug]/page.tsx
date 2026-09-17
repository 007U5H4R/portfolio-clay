import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { CaseStudyHeader } from "@/components/case-study/CaseStudyHeader";
import { getProject, projectIcon, projects } from "@/data/projects";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

/**
 * Only the slugs listed here are built; any other `/work/*` slug 404s (dynamicParams=false). Every
 * personal build gets a `/work/<slug>` page (TKT-12: teachspark, railcite, velora today; the rest of
 * the personal collection lands with TKT-15). Professional experience entries have no case-study
 * page (SITEMAP.md), matching the sitemap's personal-only filter.
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

/**
 * Tracer case-study stub (TSK-06 / S06.04). `generateStaticParams` + `dynamicParams=false` mean
 * `/work/teachspark` builds static (200) and any other slug 404s; the in-body `notFound()` is a
 * defensive guard that also narrows the type. Renders the shared `CaseStudyHeader` (the VT target)
 * plus a "coming in this build" note — the chapter body lands with the case-study build.
 */
export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <Container as="article" className="py-32">
      <CaseStudyHeader
        slug={project.slug}
        name={project.name}
        lead={project.tagline}
        role={project.role}
        duration={project.duration}
        status={project.status}
        statusLabel={project.statusLabel}
        icon={projectIcon(project.icon)}
      />
      <p className="mt-[var(--space-8)] text-[length:var(--text-lead)] text-ink-3">
        Case study — coming in this build
      </p>
    </Container>
  );
}
