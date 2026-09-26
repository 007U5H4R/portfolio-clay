import { deckle } from "./deckle";

/**
 * JourneyCollage (TKT-100, Tushar direction 2026-09-26 — about-journey-target.png) — the torn-paper
 * collage behind and around the `/about` product-journey cards: sage / rust / kraft / grid-paper
 * scraps, leaf sprigs, dried flowers, a postage stamp and postmarks, and the small line-art doodles
 * at the foot of the cards (generic office building · cloud + database with "Cloud. Data. GenAI." ·
 * generic office building · lightbulb with "TeachSpark / RailCite / Cubicle"). Server component.
 *
 * The paper scraps, botanicals, stamp and postmark are the shared generated collage pieces
 * (`public/media/illustrations/collage-<piece>.webp`, cropped from the two Higgsfield sprite sheets
 * Tushar approved 2026-09-26; provenance in content/media/illustrations/README.md) — decorative,
 * `alt=""`, lazy. A few thin CSS strips (grid / ledger / tape) fill between them.
 *
 * ONE decoration object (Design.md §3.1 `collage` row, §11 Dev-42): a single
 * `<div data-decor="collage" aria-hidden="true">`, pointer-events none, no animation. Its pieces carry
 * no `data-decor` of their own, so EVAL-018 counts the whole layer once. Scraps sit under the cards
 * and the doodles over the card feet (z-index inside `.aj-grid`'s stacking context). Pieces tagged
 * `wide` are hidden below 1025 px (the cards reflow and the doodles no longer have a foot to sit
 * on); the object stays in the DOM, so the count is the same at every width.
 *
 * The building doodles are generic and unbranded on purpose (EVAL-021: no logos or brand marks in
 * illustrations) — the reference's company-name buildings are not reproduced.
 *
 * Visual vocabulary matches TKT-99's `HowIThinkCollage` (home) and TKT-102's certifications collage
 * — dedupe the shared pieces at merge. CSS colours are paper tokens / `color-mix` (EVAL-020).
 */

type Piece = { key: string; file: string; w: number; h: number; wide?: boolean };

// Position / size live in app/globals.css (`.ajc-piece[data-k="…"]`). `w`/`h` = the file's pixels.
const PIECES: Piece[] = [
  { key: "kraft-tl", file: "collage-scrap-kraft", w: 280, h: 327, wide: true },
  { key: "flowers-tl", file: "collage-babys-breath-1", w: 170, h: 416, wide: true },
  { key: "sage-l", file: "collage-scrap-sage", w: 280, h: 290 },
  { key: "leaf-l", file: "collage-leaf-1", w: 120, h: 366, wide: true },
  { key: "rust-23", file: "collage-scrap-rust", w: 280, h: 282, wide: true },
  { key: "sage-tr", file: "collage-scrap-sage", w: 280, h: 290 },
  { key: "kraft-r", file: "collage-scrap-kraft", w: 280, h: 327, wide: true },
  { key: "grid-r", file: "collage-scrap-grid", w: 280, h: 313 },
  { key: "rust-r", file: "collage-scrap-rust", w: 280, h: 282 },
  { key: "postmark-tr", file: "collage-postmark", w: 220, h: 142, wide: true },
  { key: "stamp", file: "collage-stamp", w: 180, h: 224 },
  { key: "leaf-2", file: "collage-leaf-2", w: 150, h: 390, wide: true },
  { key: "leaf-3", file: "collage-leaf-1", w: 120, h: 366, wide: true },
  { key: "flowers-r", file: "collage-wildflower", w: 120, h: 420 },
  { key: "fern-bl", file: "collage-fern", w: 120, h: 303, wide: true },
  { key: "postmark-b", file: "collage-postmark", w: 220, h: 142, wide: true },
];

type Scrap = { key: string; tone: "sage" | "kraft" | "grid" | "ledger" | "rust"; seed: number };

// Thin CSS strips between the pieces (all wide-only); the torn outline lives here.
const SCRAPS: Scrap[] = [
  { key: "grid-12", tone: "grid", seed: 34 },
  { key: "kraft-23", tone: "kraft", seed: 36 },
  { key: "sage-23", tone: "sage", seed: 37 },
  { key: "grid-34", tone: "grid", seed: 38 },
  { key: "ledger-b", tone: "ledger", seed: 44 },
  { key: "rust-tape", tone: "rust", seed: 45 },
];

/** A generic, unbranded office building with a few trees (cards 1 and 3; EVAL-021). */
function Building({ k }: { k: string }) {
  const windows: [number, number][] = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 6; c++) windows.push([70 + c * 17, 30 + r * 15]);
  return (
    <svg
      className="ajc-doodle"
      data-k={k}
      data-wide=""
      viewBox="0 0 240 110"
      focusable="false"
    >
      <path className="ajc-line" d="M4 100 H236" />
      <path
        className="ajc-line"
        d="M60 100 V20 H176 V100 M60 20 L70 12 H186 L176 20 M186 12 V92 L176 100"
      />
      <path
        className="ajc-line ajc-thin"
        d="M18 100 V58 H60 M18 58 L26 52 H60 M28 68 H50 M28 80 H50"
      />
      {windows.map(([x, y], i) => (
        <rect
          key={i}
          className="ajc-line ajc-thin"
          x={x}
          y={y}
          width="10"
          height="9"
        />
      ))}
      <path className="ajc-line ajc-thin" d="M108 100 V88 H128 V100" />
      {[196, 214, 230].map((x, i) => (
        <g key={x}>
          <path className="ajc-line ajc-thin" d={`M${x} 100 V${84 - i * 3}`} />
          <circle className="ajc-tree" cx={x} cy={78 - i * 3} r={9 - i} />
        </g>
      ))}
      {[10, 38].map((x) => (
        <g key={x}>
          <path className="ajc-line ajc-thin" d={`M${x} 100 V90`} />
          <circle className="ajc-tree" cx={x} cy={86} r="6" />
        </g>
      ))}
    </svg>
  );
}

/** Card 2: a cloud and a database cylinder, with a handwritten note. */
function CloudData() {
  return (
    <svg
      className="ajc-doodle"
      data-k="cloud"
      data-wide=""
      viewBox="0 0 240 110"
      focusable="false"
    >
      <path
        className="ajc-line"
        d="M20 50 C 8 50, 6 32, 20 30 C 20 14, 44 10, 50 24 C 58 14, 76 20, 72 34 C 84 34, 86 50, 72 50 Z"
      />
      <ellipse className="ajc-line" cx="100" cy="46" rx="24" ry="7" />
      <path
        className="ajc-line"
        d="M76 46 V92 C 76 101, 124 101, 124 92 V46 M76 61 C 76 70, 124 70, 124 61 M76 77 C 76 86, 124 86, 124 77"
      />
      <text className="ajc-note" x="158" y="30" transform="rotate(-8 158 30)">
        Cloud.
      </text>
      <text className="ajc-note" x="166" y="60" transform="rotate(-8 166 60)">
        Data.
      </text>
      <text className="ajc-note" x="160" y="92" transform="rotate(-8 160 92)">
        GenAI.
      </text>
    </svg>
  );
}

/** Card 4: a lightbulb with rays and the three product names. */
function Bulb() {
  return (
    <svg
      className="ajc-doodle"
      data-k="bulb"
      data-wide=""
      viewBox="0 0 240 110"
      focusable="false"
    >
      <g className="ajc-bulb">
        <path d="M50 70 C 50 60, 34 54, 34 38 C 34 24, 44 16, 56 16 C 68 16, 78 24, 78 38 C 78 54, 62 60, 62 70 Z" />
        <path d="M50 76 H62 M51 82 H61 M53 88 H59 M50 70 V76 M62 70 V76 M52 60 L56 44 L60 60" />
        <path d="M56 4 V10 M30 14 L35 19 M82 14 L77 19 M20 38 H27 M85 38 H92" />
      </g>
      <text className="ajc-note" x="112" y="30" transform="rotate(-9 112 30)">
        TeachSpark
      </text>
      <text className="ajc-note" x="122" y="62" transform="rotate(-9 122 62)">
        RailCite
      </text>
      <text className="ajc-note" x="130" y="94" transform="rotate(-9 130 94)">
        Cubicle
      </text>
    </svg>
  );
}


export function JourneyCollage() {
  return (
    <div data-decor="collage" aria-hidden="true" className="ajc">
      {SCRAPS.map((s) => (
        <i
          key={s.key}
          className="ajc-scrap"
          data-k={s.key}
          data-tone={s.tone}
          data-wide=""
          style={{ clipPath: deckle(s.seed, { across: 10, down: 14, depthX: 7, depthY: 3.5 }) }}
        />
      ))}
      {PIECES.map((p) => (
        // eslint-disable-next-line @next/next/no-img-element -- decorative sprite crops, no srcset needed
        <img
          key={p.key}
          className="ajc-piece"
          data-k={p.key}
          data-wide={p.wide ? "" : undefined}
          src={`/media/illustrations/${p.file}.webp`}
          alt=""
          width={p.w}
          height={p.h}
          loading="lazy"
          decoding="async"
        />
      ))}

      {/* line-art doodles at the foot of the four cards */}
      <Building k="b-1" />
      <CloudData />
      <Building k="b-3" />
      <Bulb />
    </div>
  );
}
