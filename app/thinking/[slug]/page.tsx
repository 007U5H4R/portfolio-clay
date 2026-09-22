import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { EssayBody } from "@/components/thinking/EssayBody";
import { writing } from "@/data/writing";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

/**
 * Only the 5 essay slugs in `data/writing.ts` are built; any other `/thinking/*` slug 404s
 * (`dynamicParams = false`) — same discipline as `/work/[slug]` (TKT-19).
 */
export function generateStaticParams() {
  return writing.map((essay) => ({ slug: essay.slug }));
}

export const dynamicParams = false;

function getEssay(slug: string) {
  return writing.find((essay) => essay.slug === slug);
}

interface EssayPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EssayPageProps): Promise<Metadata> {
  const { slug } = await params;
  const essay = getEssay(slug);
  if (!essay) return {};
  return buildMetadata({
    title: `${essay.title} · ${site.name}`,
    description: essay.dek,
    path: `/thinking/${essay.slug}`,
    ogFamily: "Product Thinking",
    type: "article",
  });
}

/**
 * `/thinking/[slug]` (TKT-43, M-006): one essay, `EssayBody`-rendered, in `Container`. Static (all
 * 5 slugs prerendered). Every essay is `draft: true` — `EssayBody` is the single place the DRAFT
 * tag, reading-time caption, sourced passages, framing paragraph, and related-project link render.
 */
export default async function EssayPage({ params }: EssayPageProps) {
  const { slug } = await params;
  const essay = getEssay(slug);
  if (!essay) notFound();

  return (
    <Container
      as="section"
      className="py-[var(--section-gap-mobile)] md:py-[var(--section-gap-tablet)] lg:py-[var(--section-gap-desktop)]"
    >
      <EssayBody essay={essay} />
    </Container>
  );
}
