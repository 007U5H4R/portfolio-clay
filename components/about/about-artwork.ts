/**
 * TASK-212 / TASK-213 — the generated `/about` paper-craft artwork (Higgsfield `gpt_image_2_5`), shipped as
 * WebP in `public/media/about/`. No lettering is baked into any of it; every word is HTML beside the image.
 * `width`/`height` are each file's pixel size, so every `<img>` reserves its box (no layout shift).
 * Provenance, prompts and credits: `docs/reports/TASK-212-213.md`.
 */
export interface AboutArtwork {
  src: string;
  width: number;
  height: number;
  alt: string;
}

const artwork = (slug: string, width: number, height: number, alt: string): AboutArtwork => ({ src: `/media/about/${slug}.webp`, width, height, alt });

export const ABOUT_ARTWORK = {
  "about-hero": artwork(
    "about-hero",
    1168,
    880,
    "A paper-craft diorama: a research sheet with a rising bar chart and gears, a stack of four books, a laptop and an open notebook with a three-step flow, and a layered paper city in front of a terracotta sun.",
  ),
} as const satisfies Record<string, AboutArtwork>;

export type AboutArtworkId = keyof typeof ABOUT_ARTWORK;
