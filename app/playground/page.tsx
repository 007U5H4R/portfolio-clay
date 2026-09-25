import type { Metadata } from "next";
import { SceneOpener } from "@/components/paper/SceneOpener";
import { PlaygroundGrid } from "@/components/playground/PlaygroundGrid";
import { PlaygroundHero } from "@/components/playground/PlaygroundHero";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `Playground · ${site.name}`,
  description:
    "Four shipped experiments — Pratyasa, Tegaki, Dino Arcade and Cinematic Portfolio — each linking straight to its live build.",
  path: "/playground",
  ogFamily: "Product Playground",
});

/**
 * `/playground` (TKT-88 · TSK-45, Design.md §7.7): TKT-95's `SceneOpener` (the bench scene, EXE-18)
 * → `PlaygroundHero` (opener copy) → `PlaygroundGrid` (`section#experiments`, the bench board) → band
 * (layout). Static — no client data-fetching. Outline: h1 (opener) → h2 "Experiments" → h3 per card.
 * The mockup's quiet close is not built (D9 / Dev-08: the band is the closing CTA).
 */
export default function PlaygroundPage() {
  return (
    <>
      {/* TKT-95 scene opener (EXE-18): the crop keeps the face and the cardboard prototype. */}
      <SceneOpener id="scene-playground" focalX={0.45} focalY={0.3} priority />
      <PlaygroundHero />
      <PlaygroundGrid />
    </>
  );
}
