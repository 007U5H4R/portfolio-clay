/**
 * The `/about` art (TASK-136): hand-authored cut-paper SVGs built by `scripts/about-art/build.ts` into
 * `public/about/`. `width`/`height` are each file's viewBox, so every `<img>` reserves its box (no CLS).
 *
 * Every piece is decorative next to its HTML text (spec §59): the chapter prints and the horizon repeat
 * what the copy beside them says, so each renders with `alt=""` and the words stay HTML. No piece carries
 * lettering. (The hero and research art moved to generated WebP: `about-artwork.ts`, TASK-212/213.)
 */
export interface AboutArt {
  src: string;
  width: number;
  height: number;
}

const art = (slug: string, width: number, height: number): AboutArt => ({ src: `/about/${slug}.svg`, width, height });

export const ABOUT_ART = {
  "chapter-builder": art("chapter-builder", 800, 460),
  "chapter-operator": art("chapter-operator", 800, 460),
  "chapter-researcher": art("chapter-researcher", 800, 460),
  mountains: art("mountains", 1000, 380),
} as const satisfies Record<string, AboutArt>;

export type AboutArtId = keyof typeof ABOUT_ART;
