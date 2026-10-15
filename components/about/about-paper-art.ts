/**
 * The `/about` body art (TASK-196): origami paper-craft miniatures generated with Higgsfield
 * (`gpt_image_2_5` on a flat magenta backdrop), keyed to RGBA and shipped as WebP in
 * `public/media/about-paper/`. Provenance, prompts and job ids: `docs/about-paper-art.md`.
 *
 * Every piece is decoration beside its HTML text (alt=""), with no lettering baked in. `width`/`height`
 * are each file's pixel size, so every `<img>` reserves its box (no layout shift). The desk, the map and
 * the notebook have a light and a dark treatment; the rest read on both papers.
 */
export interface PaperArt {
  src: string;
  width: number;
  height: number;
}

const art = (slug: string, width: number, height: number): PaperArt => ({ src: `/media/about-paper/${slug}.webp`, width, height });

export const PAPER_ART = {
  "desk-light": art("desk-light", 1200, 869),
  "desk-dark": art("desk-dark", 1200, 800),
  "pin-map-light": art("pin-map-light", 1500, 1076),
  "pin-map-dark": art("pin-map-dark", 1500, 1066),
  "notebook-light": art("notebook-light", 1100, 689),
  "notebook-dark": art("notebook-dark", 1100, 845),
  "chapter-builder": art("chapter-builder", 560, 561),
  "chapter-operator": art("chapter-operator", 560, 532),
  "chapter-researcher": art("chapter-researcher", 560, 514),
  "polaroid-research": art("polaroid-research", 340, 449),
  "polaroid-cloud": art("polaroid-cloud", 340, 459),
  "polaroid-enterprise": art("polaroid-enterprise", 340, 456),
  "polaroid-ai": art("polaroid-ai", 340, 436),
  grove: art("grove", 420, 445),
} as const satisfies Record<string, PaperArt>;

export type PaperArtId = keyof typeof PAPER_ART;

/** Pieces with a light and a dark treatment (same composition and box shape per theme). */
export const THEMED_ART = {
  desk: ["desk-light", "desk-dark"],
  map: ["pin-map-light", "pin-map-dark"],
  notebook: ["notebook-light", "notebook-dark"],
} as const satisfies Record<string, readonly [PaperArtId, PaperArtId]>;

export type ThemedArtId = keyof typeof THEMED_ART;

/** Chapter id → its miniature scene. */
export const CHAPTER_ART = { builder: "chapter-builder", operator: "chapter-operator", researcher: "chapter-researcher" } as const satisfies Record<string, PaperArtId>;
/** Era id → its pinned photograph. */
export const ERA_ART = { research: "polaroid-research", cloud: "polaroid-cloud", enterprise: "polaroid-enterprise", ai: "polaroid-ai" } as const satisfies Record<string, PaperArtId>;
