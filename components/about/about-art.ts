/**
 * The `/about` art (TASK-136): hand-authored cut-paper SVGs built by `scripts/about-art/build.ts` into
 * `public/about/`. `width`/`height` are each file's viewBox, so every `<img>` reserves its box (no CLS).
 *
 * Every piece is decorative next to its HTML text (spec §59): the chapter prints, the research artifacts,
 * the hero collage and the horizon repeat what the copy beside them says, so each renders with `alt=""`
 * and the words stay HTML. Nothing here is text except the four book spines (AI · Systems · Products ·
 * Impact), which the hero copy already covers.
 */
export interface AboutArt {
  src: string;
  width: number;
  height: number;
}

const art = (slug: string, width: number, height: number): AboutArt => ({ src: `/about/${slug}.svg`, width, height });

export const ABOUT_ART = {
  "research-sketches": art("research-sketches", 760, 640),
  "systems-collage": art("systems-collage", 900, 700),
  "books-stack": art("books-stack", 640, 520),
  "product-desk": art("product-desk", 900, 500),
  "chapter-builder": art("chapter-builder", 800, 460),
  "chapter-operator": art("chapter-operator", 800, 460),
  "chapter-researcher": art("chapter-researcher", 800, 460),
  "research-nano": art("research-nano", 520, 400),
  "patent-sheet": art("patent-sheet", 520, 400),
  "research-papers": art("research-papers", 520, 400),
  mountains: art("mountains", 1000, 380),
} as const satisfies Record<string, AboutArt>;

export type AboutArtId = keyof typeof ABOUT_ART;
