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
 * TKT-107 (Dev-95): the six scenes are now 3168×1344 (21:9) Higgsfield outpaints — the home banner's size.
 */

export type IllustrationKind = "scene" | "poster" | "clip" | "reference" | "mascot";
export interface Illustration {
  id: "hero-desk" | "hero-banner" | "hero-clip" | "scene-work" | "scene-casestudy" | "scene-about" | "scene-thinking" | "scene-playground" | "scene-contact" | "character-sheet-b" | "tushky" | "tushky-avatar";
  kind: IllustrationKind;
  file: string;          // relative to content/media/illustrations/ (source rendition)
  publicSrc?: string;    // served path under public/media/illustrations/ (clip + poster + mascot; scenes go through next/image)
  width: number; height: number;
  alt: string;           // MUST start with "Illustration of" (scenes/poster), "Animated illustration of" (clip) or "Tushky, " (mascot); ≥ 8 chars (schema)
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
    alt: "Illustration of Tushar at a warm desk — laptop, notebook, plants, a lamp, a sleeping golden retriever, blank pinned notes, and books titled Product Thinking, AI & Society, System Thinking and A Better Tomorrow.",
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
    width: 3168,
    height: 1344, // TKT-107: 21:9 outpaint, the home banner's size (Dev-95)
    alt: "Illustration of Tushar pinning a product sketch to a corkboard already covered in wireframes, flow diagrams, sticky notes and small landscape photos — a plant and a green mug on the shelf below.",
    usedOn: ["/projects", "/"], // `/`: decorative polaroid crop in the hero banner (alt="", Dev-23)
  },
  {
    id: "scene-casestudy",
    kind: "scene",
    file: "scene-casestudy.jpg",
    width: 3168,
    height: 1344, // TKT-107: 21:9 outpaint, the home banner's size (Dev-95)
    alt: "Illustration of Tushar reading in a green armchair under a floor lamp, a golden retriever asleep on the rug beside him, a mug and a stack of books on the side table.",
    usedOn: ["/work/[slug]"],
  },
  {
    id: "scene-about",
    kind: "scene",
    file: "scene-about.jpg",
    width: 3168,
    height: 1344, // TKT-107: 21:9 outpaint, the home banner's size (Dev-95)
    alt: "Illustration of Tushar from behind on a hillside path at dawn, coffee in one hand and a notebook under his arm, looking out over pine forest towards a snow-capped mountain horizon.",
    usedOn: ["/about", "/"], // `/`: decorative polaroid crop in the hero banner (alt="", Dev-23)
  },
  {
    id: "scene-thinking",
    kind: "scene",
    file: "scene-thinking.jpg",
    width: 3168,
    height: 1344, // TKT-107: 21:9 outpaint, the home banner's size (Dev-95)
    alt: "Illustration of Tushar writing in an open notebook at a wooden desk by a window — a green lamp, a cup of tea, stacked books, a plant, and a sketched flow diagram on loose paper.",
    usedOn: ["/thinking", "/thinking/[slug]"], // TKT-95: the scene opener on the index and every essay
  },
  {
    id: "scene-playground",
    kind: "scene",
    file: "scene-playground.jpg",
    width: 3168,
    height: 1344, // TKT-107: 21:9 outpaint, the home banner's size (Dev-95)
    alt: "Illustration of Tushar at a tinkering workbench, holding up a small cardboard prototype with wires; a breadboard, tape, scissors, paper planes and a tablet sketch sit on the desk under a green lamp.",
    usedOn: ["/playground", "/"], // `/`: decorative polaroid crop in the hero banner (alt="", Dev-23)
  },
  {
    id: "scene-contact",
    kind: "scene",
    file: "scene-contact.jpg",
    width: 3168,
    height: 1344, // TKT-107: 21:9 outpaint, the home banner's size (Dev-95)
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
  {
    // TKT-104 (Design.md §11 Dev-48) → TKT-104 r2 (Dev-62): the Ask Tushky drawer mascot. v2 is a golden
    // retriever, head and shoulders, in a navy bandana lettered "Tushky" (Tushar 2026-09-26). It was
    // generated with Tushar's approved spend: Higgsfield `gpt_image_2_5`, job 20288256-…, 0.5 cr,
    // reference = the round-1 alternate 7312a2c0-…. Served as-is from public/ (231×280 WebP with alpha)
    // and rendered only inside the lazy AskPanel chunk, never on a page, so `usedOn` names the panel.
    id: "tushky",
    kind: "mascot",
    file: "",
    publicSrc: "/media/illustrations/tushky-bandana.webp",
    width: 231,
    height: 280,
    alt: "Tushky, the golden retriever portfolio assistant, wearing a navy bandana lettered Tushky",
    usedOn: ["Ask panel (every route)"],
  },
  {
    // TKT-104 r2 (Dev-62): a 64 px head crop of the same image, used as the chat-bubble and
    // chat-header avatar. It renders decoratively (alt="") because each bubble already names Tushky.
    id: "tushky-avatar",
    kind: "mascot",
    file: "",
    publicSrc: "/media/illustrations/tushky-avatar.webp",
    width: 64,
    height: 64,
    alt: "Tushky, the golden retriever portfolio assistant (chat avatar)",
    usedOn: ["Ask panel (every route)"],
  },
];
