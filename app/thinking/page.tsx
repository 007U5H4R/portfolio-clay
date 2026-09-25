import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SceneOpener } from "@/components/paper/SceneOpener";
import { ThinkingHero } from "@/components/thinking/ThinkingHero";
import { ThinkingList } from "@/components/thinking/ThinkingList";
import { VisuallyHidden } from "@/components/common/VisuallyHidden";
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
 *
 * a11y fix (post-acceptance review): each row title is a real `<h3>` (Design.md §3 "title (h3)",
 * same pattern `ProjectCard` already uses — an `<h3>` nested inside its row `<a>`), so heading
 * navigation actually finds all 5 essay titles. That makes the section's own heading level (`h2`)
 * mandatory too, or the document would skip straight from the page's `h1` (`ThinkingHero`) to `h3`
 * — a visually-hidden `h2` fills that gap without adding visible copy the design doesn't call for
 * (the section is still labelled for landmark navigation via `aria-label`, same as `/work`'s
 * sections; the `h2` is the same text, just also in the heading outline).
 */
export default function ThinkingPage() {
  return (
    <>
      {/* TKT-95 scene opener (EXE-18): the crop keeps the face and the writing hand. */}
      <SceneOpener id="scene-thinking" focalX={0.5} focalY={0.29} priority />
      <ThinkingHero />
      <Container as="section" aria-label="Essays" className="pb-[var(--section-gap-desktop)]">
        <VisuallyHidden as="h2">Essays</VisuallyHidden>
        <ThinkingList essays={writing} />
      </Container>
    </>
  );
}
