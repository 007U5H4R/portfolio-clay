import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
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
 * `/playground` (TKT-44, M-006): `PlaygroundHero` (h1 only) + `PlaygroundGrid` (2×2 ≥md / 1-col
 * <md of the 4 sanctioned experiments, each a fully-clickable `ClayTile` out to its live URL).
 * Static — same discipline as `/work`/`/thinking` (TP1), no client data-fetching.
 *
 * No extra section heading is needed before the grid (unlike `/thinking`, which needed a
 * visually-hidden `h2` to bridge its own `h1`→`h3` rows): each tile's title here is already an
 * `h2`, so `h1` (`PlaygroundHero`) → `h2` (each tile) is already a skip-free outline.
 */
export default function PlaygroundPage() {
  return (
    <>
      {/* TKT-95 scene opener (EXE-18): the crop keeps the face and the cardboard prototype. */}
      <SceneOpener id="scene-playground" focalX={0.45} focalY={0.3} priority />
      <PlaygroundHero />
      <Container
        as="section"
        aria-label="Experiments"
        className="pb-[var(--section-gap-desktop)]"
      >
        <PlaygroundGrid />
      </Container>
    </>
  );
}
