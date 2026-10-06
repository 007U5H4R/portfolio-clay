/**
 * Layered Paper World scenes (M-011, Design.md §14.5, EVAL-034) — the one source of truth for each scene's layers.
 * A scene is 3–5 transparent WebP layers over one opaque `bg`, served from `public/media/paper-world/<scene>/`
 * as `<scene>-<layer>[-dark][-mobile].webp` (desktop 2400 px, mobile 1280 px; same aspect). One shared `alt` per
 * scene: the root is `role="img"`, every layer is `alt=""` + `aria-hidden`. Provenance rows live in
 * `public/media/paper-world/README.md`.
 */
export type LayerName = "bg" | "distant" | "mid" | "subject" | "fg" | "details";

/** The parallax factors of the elevation scale PAPER-0…5 (`--par-0…5`, Design.md §14.3). */
export const DEPTHS = [0, 0.05, 0.12, 0.22, 0.4, 0.6] as const;
export type Depth = (typeof DEPTHS)[number];

export interface SceneLayer {
  layer: LayerName;
  /** Light rendition, relative to the scene folder. The mobile twin inserts `-mobile` before `.webp`. */
  file: string;
  /** Matched dark rendition (same layer, same pixel size). */
  darkFile: string;
  depth: Depth;
  /** Fetched eagerly with the page (the LCP scene's `bg` always is; this flags `subject` on the home hero). */
  eager?: boolean;
}

export interface LayeredScene {
  id: string;
  alt: string;
  /** Desktop pixel size shared by every layer. */
  width: number;
  height: number;
  /** Mobile pixel size shared by every mobile layer. */
  mobileWidth: number;
  mobileHeight: number;
  layers: readonly SceneLayer[];
}

export const LAYERED_SCENES = [
  {
    id: "hero-home",
    alt: "Illustration of Tushar in layered paper-cut at a warm desk — laptop, notebook, plants, a lamp, a sleeping golden retriever, blank pinned notes, a mountain photo, and a stack of books.",
    width: 2400,
    height: 1029,
    mobileWidth: 1280,
    mobileHeight: 549,
    layers: [
      { layer: "bg", file: "hero-home-bg.webp", darkFile: "hero-home-bg-dark.webp", depth: 0.05 },
      { layer: "subject", file: "hero-home-subject.webp", darkFile: "hero-home-subject-dark.webp", depth: 0.22, eager: true },
      { layer: "fg", file: "hero-home-fg.webp", darkFile: "hero-home-fg-dark.webp", depth: 0.4 },
      { layer: "details", file: "hero-home-details.webp", darkFile: "hero-home-details-dark.webp", depth: 0.6 },
    ],
  },
  {
    id: "scene-work",
    alt: "Illustration of a layered paper-cut shelf wall — two wooden shelves of blank project boxes beside a toy train, a skyline model, a campfire, a tiny cubicle, an arcade cabinet, fabric swatches and a potted plant, under a kraft banner with an empty cream frame hanging at the centre.",
    width: 2400,
    height: 1029,
    mobileWidth: 1280,
    mobileHeight: 549,
    layers: [
      { layer: "bg", file: "scene-work-bg.webp", darkFile: "scene-work-bg-dark.webp", depth: 0.05 },
      { layer: "mid", file: "scene-work-mid.webp", darkFile: "scene-work-mid-dark.webp", depth: 0.22 },
      { layer: "fg", file: "scene-work-fg.webp", darkFile: "scene-work-fg-dark.webp", depth: 0.4 },
    ],
  },
  {
    id: "scene-certifications",
    alt: "Illustration of a layered paper-cut credential board — a cork pinboard of eight blank certificates with ribbon rosettes, and a wooden shelf below holding a golden trophy, a stack of books and a potted plant.",
    width: 2400,
    height: 1029,
    mobileWidth: 1280,
    mobileHeight: 549,
    layers: [
      { layer: "bg", file: "scene-certifications-bg.webp", darkFile: "scene-certifications-bg-dark.webp", depth: 0.05 },
      { layer: "mid", file: "scene-certifications-mid.webp", darkFile: "scene-certifications-mid-dark.webp", depth: 0.22 },
      { layer: "fg", file: "scene-certifications-fg.webp", darkFile: "scene-certifications-fg-dark.webp", depth: 0.4 },
    ],
  },
  {
    id: "scene-experience",
    alt: "Illustration of Tushar in layered paper-cut presenting at a whiteboard of blue, terracotta and yellow sticky notes above a timeline arrow — a laptop, a mug and a notebook on the wooden table before a window onto a paper city skyline.",
    width: 2400,
    height: 1029,
    mobileWidth: 1280,
    mobileHeight: 549,
    layers: [
      { layer: "bg", file: "scene-experience-bg.webp", darkFile: "scene-experience-bg-dark.webp", depth: 0.05 },
      { layer: "subject", file: "scene-experience-subject.webp", darkFile: "scene-experience-subject-dark.webp", depth: 0.22 },
      { layer: "fg", file: "scene-experience-fg.webp", darkFile: "scene-experience-fg-dark.webp", depth: 0.4 },
      { layer: "details", file: "scene-experience-details.webp", darkFile: "scene-experience-details-dark.webp", depth: 0.6 },
    ],
  },
  {
    id: "scene-about",
    alt: "Illustration of Tushar from behind in layered paper-cut, coffee in one hand and a notebook under his arm, looking out from a grassy hillside over misty blue mountain ridges, a river and pine forest towards a terracotta sun and snow-capped peaks.",
    width: 2400,
    height: 1029,
    mobileWidth: 1280,
    mobileHeight: 549,
    layers: [
      { layer: "bg", file: "scene-about-bg.webp", darkFile: "scene-about-bg-dark.webp", depth: 0.05 },
      { layer: "subject", file: "scene-about-subject.webp", darkFile: "scene-about-subject-dark.webp", depth: 0.22 },
      { layer: "fg", file: "scene-about-fg.webp", darkFile: "scene-about-fg-dark.webp", depth: 0.4 },
    ],
  },
  {
    id: "scene-contact",
    alt: "Illustration of Tushar in layered paper-cut waving with one hand and holding a terracotta mug in the other, on the last page of a ruled notebook beside an envelope, a fountain pen, a paper plane and a flowering plant, with paper hills below.",
    width: 2400,
    height: 1029,
    mobileWidth: 1280,
    mobileHeight: 549,
    layers: [
      { layer: "bg", file: "scene-contact-bg.webp", darkFile: "scene-contact-bg-dark.webp", depth: 0.05 },
      { layer: "subject", file: "scene-contact-subject.webp", darkFile: "scene-contact-subject-dark.webp", depth: 0.22 },
      { layer: "fg", file: "scene-contact-fg.webp", darkFile: "scene-contact-fg-dark.webp", depth: 0.4 },
    ],
  },
  {
    id: "scene-thinking",
    alt: "Illustration of Tushar in layered paper-cut resting his chin on his hand at a writing desk, a winding paper pathway leading from him across green hills past six stations — a magnifying glass over a page, sticky notes, a glowing light bulb, stacked blocks, a checked sheet and a red star.",
    width: 2400,
    height: 1029,
    mobileWidth: 1280,
    mobileHeight: 549,
    layers: [
      { layer: "bg", file: "scene-thinking-bg.webp", darkFile: "scene-thinking-bg-dark.webp", depth: 0.05 },
      { layer: "mid", file: "scene-thinking-mid.webp", darkFile: "scene-thinking-mid-dark.webp", depth: 0.22 },
      { layer: "fg", file: "scene-thinking-fg.webp", darkFile: "scene-thinking-fg-dark.webp", depth: 0.4 },
    ],
  },
  {
    id: "scene-playground",
    alt: "Illustration of Tushar in layered paper-cut at a workshop stage, holding up a small cardboard prototype with a gear between red curtains and a backdrop of cardboard machines and a rocket — a paper plane, a toy car, scissors, tape and a tablet sketch on the desk.",
    width: 2400,
    height: 1029,
    mobileWidth: 1280,
    mobileHeight: 549,
    layers: [
      { layer: "bg", file: "scene-playground-bg.webp", darkFile: "scene-playground-bg-dark.webp", depth: 0.05 },
      { layer: "subject", file: "scene-playground-subject.webp", darkFile: "scene-playground-subject-dark.webp", depth: 0.22 },
      { layer: "fg", file: "scene-playground-fg.webp", darkFile: "scene-playground-fg-dark.webp", depth: 0.4 },
    ],
  },
] as const satisfies readonly LayeredScene[];

export type LayeredSceneId = (typeof LAYERED_SCENES)[number]["id"];

export function layeredScene(id: LayeredSceneId): LayeredScene {
  return LAYERED_SCENES.find((s) => s.id === id)!;
}

/** `hero-home-bg-dark.webp` → `hero-home-bg-dark-mobile.webp`. */
export const mobileFile = (file: string) => file.replace(/\.webp$/, "-mobile.webp");

/** Public URL of a layer file (desktop, or its mobile twin). */
export const layerSrc = (scene: string, file: string, mobile = false) =>
  `/media/paper-world/${scene}/${mobile ? mobileFile(file) : file}`;

/** Pointer range in px before the layer's factor: ±12, foreground (factor ≥ .40) ±25 (Design.md §14.4). */
export const pointerRangePx = (depth: Depth) => (depth >= 0.4 ? 25 : 12);

/** Orientation maximum shift in px per layer (§06 mobile): bg 2, distant 5, mid/subject 9, fg 14, details 18. */
export const ORIENTATION_PX: Record<LayerName, number> = { bg: 2, distant: 5, mid: 9, subject: 9, fg: 14, details: 18 };

/** Scroll-depth amplitude in px × factor (the CSS `view()` keyframes, `paper-world.module.css`). */
export const SCROLL_AMPLITUDE_PX = 12;

/** Largest distance a layer can sit from rest: pointer or tilt, plus the scroll-depth offset. */
export const maxShiftPx = (layer: LayerName, depth: Depth) =>
  Math.max(depth * pointerRangePx(depth), ORIENTATION_PX[layer]) + depth * SCROLL_AMPLITUDE_PX;

/** Bleed: the layer box is inset by −(max shift + 4 px) so no edge ever shows. */
export const bleedPx = (layer: LayerName, depth: Depth) => Math.ceil(maxShiftPx(layer, depth)) + 4;

/** The one bleed every layer of a scene shares (the largest any layer needs), so all layers scale alike at rest. */
export const sceneBleedPx = (scene: LayeredScene) => Math.max(...scene.layers.map((l) => bleedPx(l.layer, l.depth)));
