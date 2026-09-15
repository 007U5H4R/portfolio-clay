import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { CaseStudyHeader } from "@/components/case-study/CaseStudyHeader";
import { getFeaturedProject } from "@/data/tracer";

/** Only the slugs listed here are built; any other `/work/*` slug 404s (dynamicParams=false). */
export function generateStaticParams() {
  return [{ slug: "teachspark" }];
}

export const dynamicParams = false;

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getFeaturedProject(slug);
  if (!project) return {};
  return { title: project.name, description: project.proposition };
}

/**
 * Tracer case-study stub (TSK-06 / S06.04). `generateStaticParams` + `dynamicParams=false` mean
 * `/work/teachspark` builds static (200) and any other slug 404s; the in-body `notFound()` is a
 * defensive guard that also narrows the type. Renders the shared `CaseStudyHeader` (the VT target)
 * plus a "coming in this build" note — the chapter body lands with the case-study build.
 */
export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const project = getFeaturedProject(slug);
  if (!project) notFound();

  return (
    <Container as="article" className="py-32">
      <CaseStudyHeader
        slug={project.slug}
        name={project.name}
        lead={project.proposition}
        role="Solo build"
        duration="Aug 2026"
        status={project.status}
        statusLabel={project.statusLabel}
        icon={project.icon}
      />
      <p className="mt-[var(--space-8)] text-[length:var(--text-lead)] text-ink-3">
        Case study — coming in this build
      </p>
    </Container>
  );
}
