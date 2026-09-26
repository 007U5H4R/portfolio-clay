import { deckle } from "./deckle";

/**
 * HowIThinkCollage (TKT-99, Tushar direction 2026-09-26 — how-i-think-target.png) — the torn-paper
 * collage behind the six stage cards: sage / rust / kraft / grid-paper scraps, a hole-punched
 * notebook strip, botanical sprigs, a postage stamp and a postmark. Server component.
 *
 * ONE decoration object (Design.md §3.1 `collage` row, §11 Dev-41): a single
 * `<div data-decor="collage" aria-hidden="true">`, pointer-events none, no text, no animation. Its
 * pieces are plain `<i>` / `<svg>` children with no `data-decor` of their own, so EVAL-018 counts the
 * whole backdrop once. Pieces tagged `wide` are hidden below 1024 px by CSS (fewer scraps on small
 * screens; the object stays in the DOM, so the count is the same at every width).
 *
 * Colours come from CSS classes (paper tokens / `color-mix`, EVAL-020) — no literals here.
 */

type Scrap = { key: string; tone: "sage" | "rust" | "kraft" | "grid" | "ledger" | "holes" | "sage-dark"; seed: number; wide?: boolean };

// Position / size live in app/globals.css (`.hit-scrap[data-k="…"]`); the torn outline lives here.
const SCRAPS: Scrap[] = [
  { key: "kraft-tl", tone: "kraft", seed: 11, wide: true },
  { key: "sage-l", tone: "sage-dark", seed: 12 },
  { key: "grid-bl", tone: "grid", seed: 13 },
  { key: "sage-12", tone: "sage", seed: 14, wide: true },
  { key: "ledger-23", tone: "ledger", seed: 15, wide: true },
  { key: "rust-34", tone: "rust", seed: 16, wide: true },
  { key: "rust-b", tone: "rust", seed: 17, wide: true },
  { key: "holes-45", tone: "holes", seed: 18, wide: true },
  { key: "sage-56", tone: "sage-dark", seed: 19, wide: true },
  { key: "grid-tr", tone: "grid", seed: 20 },
  { key: "sage-r", tone: "sage", seed: 22, wide: true },
  { key: "kraft-br", tone: "kraft", seed: 21 },
];

const LEAF = "M0 0 C 5 -6, 15 -6, 21 0 C 15 6, 5 6, 0 0 Z";

/** A botanical sprig: a curved stem with alternating leaves. */
function Sprig({ k, wide, flip }: { k: string; wide?: boolean; flip?: boolean }) {
  const leaves = [
    { x: 30, y: 118, a: -150 },
    { x: 31, y: 104, a: -30 },
    { x: 32, y: 88, a: -145 },
    { x: 33, y: 72, a: -35 },
    { x: 34, y: 56, a: -140 },
    { x: 35, y: 40, a: -40 },
    { x: 35, y: 24, a: -120 },
    { x: 35, y: 12, a: -70 },
  ];
  return (
    <svg
      className="hit-sprig"
      data-k={k}
      data-wide={wide ? "" : undefined}
      viewBox="0 0 64 150"
      focusable="false"
      data-flip={flip ? "" : undefined}
    >
      <path className="hit-sprig-stem" d="M28 150 C 30 110, 36 60, 35 6" />
      {leaves.map((l, i) => (
        <path key={i} className="hit-sprig-leaf" d={LEAF} transform={`translate(${l.x} ${l.y}) rotate(${l.a})`} />
      ))}
    </svg>
  );
}

/** Perforation dots along a w×h stamp starting at (x, y). */
function perforations(x: number, y: number, w: number, h: number, step = 7) {
  const dots: [number, number][] = [];
  for (let i = 0; i <= w; i += step) dots.push([x + i, y], [x + i, y + h]);
  for (let j = step; j < h; j += step) dots.push([x, y + j], [x + w, y + j]);
  return dots;
}

export function HowIThinkCollage() {
  return (
    <div data-decor="collage" aria-hidden="true" className="hit-collage">
      {SCRAPS.map((s) => (
        <i
          key={s.key}
          className="hit-scrap"
          data-k={s.key}
          data-tone={s.tone}
          data-wide={s.wide ? "" : undefined}
          style={{ clipPath: deckle(s.seed, { across: 10, down: 14, depthX: 7, depthY: 3.5 }) }}
        />
      ))}

      <Sprig k="tl" />
      <Sprig k="b34" wide flip />
      <Sprig k="b5" wide />
      <Sprig k="r6" flip />

      {/* postage stamp + wavy cancellation, top-right */}
      <svg className="hit-stamp" viewBox="0 0 150 100" focusable="false">
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} className="hit-ink" d={`M2 ${30 + i * 8} q 8 -5 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0`} />
        ))}
        <rect className="hit-stamp-paper" x="62" y="6" width="80" height="90" />
        {perforations(62, 6, 80, 90).map(([cx, cy], i) => (
          <circle key={i} className="hit-stamp-hole" cx={cx} cy={cy} r="2.6" />
        ))}
        <rect className="hit-stamp-frame" x="69" y="13" width="66" height="76" />
        <path className="hit-stamp-art" d="M102 80 C 101 64, 104 44, 102 24 M102 66 C 94 62, 88 56, 86 48 M102 54 C 110 50, 116 44, 118 36 M102 42 C 95 38, 91 32, 90 26 M102 34 C 108 30, 112 24, 112 18" />
      </svg>

      {/* postmark, bottom-right */}
      <svg className="hit-postmark" viewBox="0 0 100 100" focusable="false">
        <circle className="hit-ink" cx="50" cy="50" r="44" />
        <circle className="hit-ink hit-ink-dash" cx="50" cy="50" r="33" />
        <path className="hit-ink" d="M26 50 H74 M50 26 V74" />
      </svg>
    </div>
  );
}
