import Image from "next/image";

/**
 * HowIThinkCollage (TKT-99, Tushar direction 2026-09-26 — how-i-think-target.png) — the torn-paper
 * collage behind the six stage cards. Server component.
 *
 * Round 2: the pieces are crops of Tushar-approved Higgsfield sprite sheets (`collage-paper.png` job
 * 6eab8569-…, `collage-botanical.png` job 8fddab59-…; provenance in
 * `content/media/illustrations/README.md`), served from `public/media/illustrations/collage-*.webp`
 * (shared names, deduped with TKT-100/101/102): sage / rust / kraft / grid scraps, a hole-punched
 * notebook strip, leaf and fern sprigs, a golden wildflower, a leaf postage stamp and a postmark.
 *
 * ONE decoration object (Design.md §3.1 `collage` row, §11 Dev-41): a single
 * `<div data-decor="collage" aria-hidden="true">`, pointer-events none, no text, no animation. Its
 * pieces are plain `<img alt="">` children with no `data-decor`, so EVAL-018 counts the backdrop
 * once. Every piece is `loading="lazy"` and below the fold — never an LCP candidate. Pieces tagged
 * `wide` are hidden below 1024 px (fewer scraps on small screens; count unchanged at every width).
 */

type Piece = {
  /** Position / size / rotation key in app/globals.css (`.hit-piece[data-k="…"]`). */
  key: string;
  /** `public/media/illustrations/collage-<file>.webp` */
  file: string;
  /** Intrinsic size of the webp (for the width/height attributes). */
  w: number;
  h: number;
  wide?: boolean;
};

const SAGE = { file: "scrap-sage", w: 291, h: 300 };
const RUST = { file: "scrap-rust", w: 297, h: 300 };
const KRAFT = { file: "scrap-kraft", w: 254, h: 300 };
const GRID = { file: "scrap-grid", w: 269, h: 300 };
const STRIP = { file: "notebook-strip", w: 560, h: 158 };

// DOM order = paint order: scraps first, botanicals and postal pieces on top.
const PIECES: Piece[] = [
  { key: "kraft-tl", ...KRAFT, wide: true },
  { key: "sage-l", ...SAGE },
  { key: "grid-bl", ...GRID },
  { key: "sage-12", ...SAGE, wide: true },
  { key: "kraft-23", ...KRAFT, wide: true },
  { key: "rust-34", ...RUST, wide: true },
  { key: "rust-b", ...RUST, wide: true },
  { key: "strip-45", ...STRIP, wide: true },
  { key: "sage-56", ...SAGE, wide: true },
  { key: "grid-tr", ...GRID },
  { key: "sage-r", ...SAGE, wide: true },
  { key: "kraft-br", ...KRAFT },
  { key: "sprig-tl", file: "leaf-1", w: 125, h: 380 },
  { key: "sprig-b34", file: "fern", w: 143, h: 380, wide: true },
  { key: "sprig-b5", file: "leaf-2", w: 142, h: 380, wide: true },
  { key: "sprig-r6", file: "wildflower", w: 108, h: 380 },
  { key: "stamp", file: "stamp", w: 178, h: 220 },
  { key: "postmark", file: "postmark", w: 260, h: 168 },
];

export function HowIThinkCollage() {
  return (
    <div data-decor="collage" aria-hidden="true" className="hit-collage">
      {PIECES.map((p) => (
        <Image
          key={p.key}
          src={`/media/illustrations/collage-${p.file}.webp`}
          alt=""
          width={p.w}
          height={p.h}
          loading="lazy"
          unoptimized
          draggable={false}
          className="hit-piece"
          data-k={p.key}
          data-wide={p.wide ? "" : undefined}
        />
      ))}
    </div>
  );
}
