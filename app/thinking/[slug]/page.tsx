import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { SceneOpener } from "@/components/paper/SceneOpener";
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
 * `/thinking/[slug]` (TKT-84, Design.md §7.6): TKT-95's scene opener (EXE-18) → `section.essay-section`
 * holding the `EssayBody` article (crumb, header, margin, flat prose, pager) → band. Static (all 5
 * slugs prerendered). The pager's "next note" follows `data/writing.ts` order; the last essay has none.
 */
export default async function EssayPage({ params }: EssayPageProps) {
  const { slug } = await params;
  const index = writing.findIndex((essay) => essay.slug === slug);
  const essay = writing[index];
  if (!essay) notFound();
  const next = writing[index + 1];

  return (
    <>
      {/* TKT-95 scene opener (EXE-18): the /thinking scene opens every essay too. */}
      <SceneOpener id="scene-thinking" focalX={0.5} focalY={0.29} priority />
      <section className="essay-section" aria-labelledby="essay-h">
        <Container>
          <EssayBody
            essay={essay}
            number={index + 1}
            next={next ? { slug: next.slug, title: next.title } : undefined}
          />
        </Container>
      </section>
    </>
  );
}
