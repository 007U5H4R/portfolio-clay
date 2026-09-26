import type { Metadata } from "next";
import { SceneOpener } from "@/components/paper/SceneOpener";
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
 * `/thinking` (TKT-84, Design.md §7.5): TKT-95's scene opener (EXE-18) → `ThinkingHero` (eyebrow,
 * h1 + underline, hand-sub) → `ThinkingList` (the essays section on the ruled sheet) → band. Static —
 * no client data-fetching (TP1). The mockup's "quiet close" section is not built (D9 / Dev-08: the
 * band is the only closing CTA).
 */
export default function ThinkingPage() {
  return (
    <>
      {/* TKT-95 scene opener (EXE-18), sized like the home banner (TKT-107, Dev-48) — focal point per scene in components/paper/scene-opener-frames.ts. */}
      <SceneOpener id="scene-thinking" priority />
      <ThinkingHero />
      <ThinkingList essays={writing} />
    </>
  );
}
