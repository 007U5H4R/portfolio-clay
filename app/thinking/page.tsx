import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ThinkingHero } from "@/components/thinking/ThinkingHero";
import { ThinkingList } from "@/components/thinking/ThinkingList";
import { writing } from "@/data/writing";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `Thinking · ${site.name}`,
  description:
    "An honest editorial list — five DRAFT essays, each backed by a real quoted passage, none published yet.",
  path: "/thinking",
  ogFamily: "Product Thinking",
});

/**
 * `/thinking` (TKT-43, M-006): `ThinkingHero` (h1 only) + `ThinkingList` (numbered rows, one per
 * `data/writing.ts` essay). Static — no client data-fetching, same discipline as `/work` (TP1).
 * Every essay is `draft: true` today; `ThinkingList` renders the "five drafts, none published yet"
 * empty-state line above the (still fully shown) rows.
 */
export default function ThinkingPage() {
  return (
    <>
      <ThinkingHero />
      <Container as="section" aria-label="Essays" className="pb-[var(--section-gap-desktop)]">
        <ThinkingList essays={writing} />
      </Container>
    </>
  );
}
