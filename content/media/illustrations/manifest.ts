/**
 * Illustration manifest — the one source of truth for every illustration's id, kind, size and alt
 * (Design.md §6.1; S20 — EVAL-021, EVAL-013). Components never write an alt inline: they render
 * `illustration(id).alt` from `lib/illustrations.ts`.
 *
 * STUB (TSK-34): the nine ids, kinds, routes and the exact §6.3 alt strings are final; `file` is
 * `""`, `publicSrc` is unset and `width`/`height` are the reference renditions' pixel sizes from
 * `docs/redesign-mockups/m-009/assets/` (hero: the §5.2 1280 × 684 frame; the character sheet has no
 * rendition yet). TSK-36 adds the asset files and fills `file` / `publicSrc` / `width` / `height`
 * — the exported types below must not change (they are Design.md §6.1 verbatim).
 */

export type IllustrationKind = "scene" | "poster" | "clip" | "reference";
export interface Illustration {
  id: "hero-desk" | "hero-clip" | "scene-work" | "scene-casestudy" | "scene-about" | "scene-thinking" | "scene-playground" | "scene-contact" | "character-sheet-b";
  kind: IllustrationKind;
  file: string;          // relative to content/media/illustrations/ (source rendition)
  publicSrc?: string;    // served path under public/media/illustrations/ (clip + poster only; scenes go through next/image)
  width: number; height: number;
  alt: string;           // MUST start with "Illustration of" (scenes/poster) or "Animated illustration of" (clip); ≥ 8 chars (schema)
  usedOn: string[];      // routes
}

export const ILLUSTRATIONS: readonly Illustration[] = [
  {
    id: "hero-desk",
    kind: "poster",
    file: "",
    width: 1280,
    height: 684,
    alt: "Illustration of Tushar at a warm desk — laptop, notebook, books, a plant, a lamp, and pinned notes reading Problem → Insight → Bet → Build → Evaluate → Impact.",
    usedOn: ["/"],
  },
  {
    id: "hero-clip",
    kind: "clip",
    file: "",
    width: 1280,
    height: 684,
    alt: "Animated illustration of Tushar thinking at his desk and turning a pen — plays once.",
    usedOn: ["/"],
  },
  {
    id: "scene-work",
    kind: "scene",
    file: "",
    width: 2048,
    height: 1360,
    alt: "Illustration of Tushar pinning a product sketch to a corkboard already covered in wireframes, flow diagrams, sticky notes and small landscape photos — a plant and a green mug on the shelf below.",
    usedOn: ["/work"],
  },
  {
    id: "scene-casestudy",
    kind: "scene",
    file: "",
    width: 2048,
    height: 1360,
    alt: "Illustration of Tushar reading in a green armchair under a floor lamp, a golden retriever asleep on the rug beside him, a mug and a stack of books on the side table.",
    usedOn: ["/work/[slug]"],
  },
  {
    id: "scene-about",
    kind: "scene",
    file: "",
    width: 2048,
    height: 1360,
    alt: "Illustration of Tushar from behind on a hillside path at dawn, coffee in one hand and a notebook under his arm, looking out over pine forest towards a snow-capped mountain horizon.",
    usedOn: ["/about"],
  },
  {
    id: "scene-thinking",
    kind: "scene",
    file: "",
    width: 2336,
    height: 1744,
    alt: "Illustration of Tushar writing in an open notebook at a wooden desk by a window — a green lamp, a cup of tea, stacked books, a plant, and a sketched flow diagram on loose paper.",
    usedOn: ["/thinking"],
  },
  {
    id: "scene-playground",
    kind: "scene",
    file: "",
    width: 2048,
    height: 1360,
    alt: "Illustration of Tushar at a tinkering workbench, holding up a small cardboard prototype with wires; a breadboard, tape, scissors, paper planes and a tablet sketch sit on the desk under a green lamp.",
    usedOn: ["/playground"],
  },
  {
    id: "scene-contact",
    kind: "scene",
    file: "",
    width: 1792,
    height: 2240,
    alt: "Illustration of Tushar standing by a window next to a tall leafy plant, a terracotta coffee mug in one hand, the other raised in a friendly wave.",
    usedOn: ["/contact"],
  },
  {
    id: "character-sheet-b",
    kind: "reference",
    file: "",
    width: 0, // no rendition yet — TSK-36 (never rendered)
    height: 0,
    alt: "Illustration reference sheet of the Tushar character — front, three-quarter and profile views.",
    usedOn: [],
  },
];
