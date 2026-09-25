/**
 * Illustration manifest — the one source of truth for every illustration's id, kind, size and alt
 * (Design.md §6.1; S20 — EVAL-021, EVAL-013). Components never write an alt inline: they render
 * `illustration(id).alt` from `lib/illustrations.ts`.
 *
 * TSK-36: `file` / `publicSrc` / `width` / `height` now point at the shipped renditions under
 * `content/media/illustrations/` and `public/media/illustrations/` (provenance in this folder's
 * `README.md`). Scenes were re-encoded from the PNG masters with sharp (`jpeg({ quality: 82,
 * mozjpeg: true })`, long edge 2048) — `width`/`height` are the re-encoded pixel sizes, not the
 * mockup renditions' (scene-thinking and scene-contact differ from the earlier stub because their
 * long edge, not width, is 2336/2240 in the master).
 */

export type IllustrationKind = "scene" | "poster" | "clip" | "reference";
export interface Illustration {
  id: "hero-desk" | "hero-banner" | "hero-clip" | "scene-work" | "scene-casestudy" | "scene-about" | "scene-thinking" | "scene-playground" | "scene-contact" | "character-sheet-b";
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
    file: "hero-desk.webp",
    publicSrc: "/media/illustrations/hero-poster.webp",
    width: 1280,
    height: 684,
    alt: "Illustration of Tushar at a warm desk — laptop, notebook, books, a plant, a lamp, and pinned notes reading Problem → Insight → Bet → Build → Evaluate → Impact.",
    // TKT-93: no longer rendered as an <img>; ships as the clip's `poster` attribute on `/` (Design.md §5.2).
    usedOn: ["/"],
  },
  {
    // TKT-93 (Dev-23 / EXE-15): the 21:9 outpaint of `hero-desk` — the full-bleed home banner and the
    // LCP image; the clip is registered on it (components/hero/registration.ts). Static import via
    // lib/illustrations.ts (`sceneImage("hero-banner")`) so next/image emits AVIF/WebP + srcset.
    id: "hero-banner",
    kind: "scene",
    file: "hero-banner.webp",
    width: 3168,
    height: 1344,
    alt: "Illustration of Tushar at a warm desk — laptop, notebook, books, plants, a lamp, a sleeping golden retriever, and pinned notes reading Problem → Insight → Bet → Build → Evaluate → Impact.",
    usedOn: ["/"],
  },
  {
    id: "hero-clip",
    kind: "clip",
    file: "",
    publicSrc: "/media/illustrations/hero-animation.webm",
    width: 1280,
    height: 684,
    alt: "Animated illustration of Tushar thinking at his desk and turning a pen — plays once.",
    usedOn: ["/"],
  },
  {
    id: "scene-work",
    kind: "scene",
    file: "scene-work.jpg",
    width: 2048,
    height: 1360,
    alt: "Illustration of Tushar pinning a product sketch to a corkboard already covered in wireframes, flow diagrams, sticky notes and small landscape photos — a plant and a green mug on the shelf below.",
    usedOn: ["/work", "/"], // `/`: decorative polaroid crop in the hero banner (alt="", Dev-23)
  },
  {
    id: "scene-casestudy",
    kind: "scene",
    file: "scene-casestudy.jpg",
    width: 2048,
    height: 1360,
    alt: "Illustration of Tushar reading in a green armchair under a floor lamp, a golden retriever asleep on the rug beside him, a mug and a stack of books on the side table.",
    usedOn: ["/work/[slug]"],
  },
  {
    id: "scene-about",
    kind: "scene",
    file: "scene-about.jpg",
    width: 2048,
    height: 1360,
    alt: "Illustration of Tushar from behind on a hillside path at dawn, coffee in one hand and a notebook under his arm, looking out over pine forest towards a snow-capped mountain horizon.",
    usedOn: ["/about", "/"], // `/`: decorative polaroid crop in the hero banner (alt="", Dev-23)
  },
  {
    id: "scene-thinking",
    kind: "scene",
    file: "scene-thinking.jpg",
    width: 2048,
    height: 1529,
    alt: "Illustration of Tushar writing in an open notebook at a wooden desk by a window — a green lamp, a cup of tea, stacked books, a plant, and a sketched flow diagram on loose paper.",
    usedOn: ["/thinking"],
  },
  {
    id: "scene-playground",
    kind: "scene",
    file: "scene-playground.jpg",
    width: 2048,
    height: 1360,
    alt: "Illustration of Tushar at a tinkering workbench, holding up a small cardboard prototype with wires; a breadboard, tape, scissors, paper planes and a tablet sketch sit on the desk under a green lamp.",
    usedOn: ["/playground", "/"], // `/`: decorative polaroid crop in the hero banner (alt="", Dev-23)
  },
  {
    id: "scene-contact",
    kind: "scene",
    file: "scene-contact.jpg",
    width: 1638,
    height: 2048,
    alt: "Illustration of Tushar standing by a window next to a tall leafy plant, a terracotta coffee mug in one hand, the other raised in a friendly wave.",
    usedOn: ["/contact"],
  },
  {
    id: "character-sheet-b",
    kind: "reference",
    file: "reference/character-sheet-b.jpg",
    width: 2688, // never rendered on a page (usedOn: []) — Stage-8 drift check only
    height: 1520,
    alt: "Illustration reference sheet of the Tushar character — front, three-quarter and profile views.",
    usedOn: [],
  },
];
