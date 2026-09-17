import { notFound } from "next/navigation";
import { OG_SIZE, renderOgCard } from "@/lib/og";
import { getProject, projects } from "@/data/projects";
import type { ProjectStatus } from "@/components/projects/StatusBadge";
import type { Tone } from "@/components/clay/tiers";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Case study cover image";

/** Same status -> tone mapping as `StatusBadge` (Design.md §3) — kept as a small local copy so the
 * OG render path doesn't have to pull `StatusBadge`'s lucide icon imports into this route. */
const STATUS_TONE: Record<ProjectStatus, Tone> = {
  live: "mint",
  pilot: "sky",
  prototype: "peach",
  research: "lavender",
  archived: "neutral",
};

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
    tone: STATUS_TONE[project.status],
    badge: project.statusLabel,
  });
}
