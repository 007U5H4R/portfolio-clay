import type { Metadata } from "next";
import "../../styles/thinking__thinking-slug.css";
import "../../styles/thinking-slug.css";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { SceneOpener } from "@/components/paper/SceneOpener";
import { EssayBody } from "@/components/thinking/EssayBody";
import { writing } from "@/data/writing";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

/** Only the essay slugs in data/writing.ts are built; any other slug 404s. */
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
    type: "article",
    // Draft pages may be previewed by link, but must not appear in search results.
    noindex: essay.draft,
  });
}

/** /thinking/[slug]: statically rendered essay pages. Draft status is controlled by data/writing.ts. */
export default async function EssayPage({ params }: EssayPageProps) {
  const { slug } = await params;
  const index = writing.findIndex((essay) => essay.slug === slug);
  const essay = writing[index];
  if (!essay) notFound();
  const next = writing[index + 1];

  return (
    <>
      <SceneOpener id="scene-thinking" priority />
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
