import { notFound } from "next/navigation";
import { OG_SIZE, renderOgCard } from "@/lib/og";
import { getProject, projects } from "@/data/projects";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Case study cover image";

/** One OG image per personal case-study page — mirrors `app/work/[slug]/page.tsx` so every built
 * `/work/<slug>` has a matching `/work/<slug>/opengraph-image` (any other slug 404s via
 * dynamicParams=false). */
export function generateStaticParams() {
  return projects
    .filter((project) => project.category === "personal")
    .map((project) => ({ slug: project.slug }));
}

export const dynamicParams = false;

interface CaseStudyImageProps {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: CaseStudyImageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return renderOgCard({
    eyebrow: "Case study",
    title: project.name,
    subtitle: project.tagline,
    badge: project.statusLabel,
    caption: "evenings, mostly reading",
    // Case studies reuse the hero poster — the scenes are page-family assets (Design.md §9, D11).
    poster: true,
  });
}
