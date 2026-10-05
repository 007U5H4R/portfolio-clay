import { notFound } from "next/navigation";
import { OG_SIZE, renderOgCard } from "@/lib/og";
import { writing } from "@/data/writing";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Product Thinking essay — Tushar Pathak";

/** One OG image per essay — mirrors `app/thinking/[slug]/page.tsx` so every built `/thinking/<slug>`
 * has the `/thinking/<slug>/opengraph-image` that `buildMetadata` (lib/seo.ts) advertises by default
 * (TKT-98: all five essays pointed at a 404 before this route existed). */
export function generateStaticParams() {
  return writing.map((essay) => ({ slug: essay.slug }));
}

export const dynamicParams = false;

interface EssayImageProps {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: EssayImageProps) {
  const { slug } = await params;
  const essay = writing.find((entry) => entry.slug === slug);
  if (!essay) notFound();

  return renderOgCard({
    eyebrow: "Product Thinking",
    title: essay.title,
    subtitle: essay.dek,
    ...(essay.draft ? { badge: "Draft" } : {}),
    caption: "notes first. essays later.",
  });
}
