/**
 * SVG geometry for the counted paper decorations (TSK-33 · technical-plan.md S70.01–S70.03).
 *
 * Every path is lifted verbatim from the approved M-009 mockups (`docs/redesign-mockups/m-009/`),
 * never redrawn; the source file and selector sit beside each constant. The only edits are the two
 * noted on `TORN_PATHS` / `ANNOTATION_ARROWS.up`.
 */

export type SvgPath = { d: string; className?: string };

export type SvgDrawing = {
  viewBox: string;
  /** Rendered as `preserveAspectRatio="none"` (stretches to its box: underline, path, chain). */
  stretch?: boolean;
  paths: readonly SvgPath[];
  circles?: readonly { cx: number; cy: number; r: number }[];
  /** Optional wrapper transform (the mirrored `up` arrow). */
  transform?: string;
};

/** Every `TornEdge` shares one 1440×46 viewBox (S70.01); the edge is stretched to its box. */
export const TORN_VIEWBOX = "0 0 1440 46";

/**
 * Torn-edge silhouettes.
 * - `paper`: home.html, the first `.torn-top` (featured section). Its closing edge was at y=44 in
 *   the mockup's 1440×44 viewBox; it closes at y=46 here so the fill reaches the bottom of the
 *   shared 46-unit viewBox (no hairline gap).
 * - `band`: home.html `.band-torn` (terracotta footer band) — already 1440×46, verbatim.
 */
export const TORN_PATHS = {
  paper:
    "M0 26 L 60 22 L 110 30 L 170 18 L 230 27 L 300 15 L 350 24 L 420 12 L 480 22 L 530 16 L 600 28 L 660 20 L 720 30 L 790 17 L 850 25 L 910 13 L 980 24 L 1040 18 L 1100 29 L 1160 15 L 1230 23 L 1290 12 L 1350 24 L 1400 19 L 1440 26 L 1440 46 L 0 46 Z",
  band: "M0 30 L 24 18 L 48 32 L 70 14 L 96 28 L 120 22 L 140 34 L 168 12 L 192 26 L 214 20 L 240 30 L 262 16 L 288 28 L 312 24 L 336 34 L 358 14 L 384 26 L 408 20 L 430 32 L 456 16 L 480 28 L 504 22 L 528 34 L 552 18 L 576 26 L 600 12 L 624 30 L 648 22 L 672 32 L 696 16 L 720 28 L 744 20 L 768 34 L 792 14 L 816 26 L 840 22 L 864 32 L 888 18 L 912 28 L 936 12 L 960 30 L 984 22 L 1008 34 L 1032 16 L 1056 26 L 1080 20 L 1104 32 L 1128 14 L 1152 28 L 1176 22 L 1200 34 L 1224 18 L 1248 26 L 1272 12 L 1296 30 L 1320 20 L 1344 32 L 1368 16 L 1392 28 L 1416 22 L 1440 30 L 1440 46 L 0 46 Z",
} as const;

export type SketchLineVariant = "underline" | "spark" | "path" | "chain" | "tools" | "arrow";

/** `Sketch` line-art variants (the seventh, `flow`, is HTML boxes — see `FLOW_DEFAULT_ROWS`). */
export const SKETCHES: Record<SketchLineVariant, SvgDrawing> = {
  // home.html `.hero h1 .ul svg` (also work/thinking/playground h1 `.ul`) — the draw-in underline.
  underline: {
    viewBox: "0 0 400 24",
    stretch: true,
    paths: [{ d: "M4 14 C 80 4, 160 20, 240 10 S 360 6, 396 14" }],
  },
  // home.html `.featured-head h2 .spark svg`.
  spark: {
    viewBox: "0 0 24 24",
    paths: [{ d: "M4 20 L 9 13 M12 19 L 13 10 M18 18 L 20 12" }],
  },
  // about.html `.jgrid .path` (product-journey path).
  path: {
    viewBox: "0 0 1200 120",
    stretch: true,
    paths: [
      {
        d: "M20 96 C 80 90, 110 71, 150 71 C 250 71, 350 35, 450 35 C 550 35, 650 83, 750 83 C 850 83, 950 47, 1050 47 C 1100 47, 1140 30, 1180 18",
      },
    ],
  },
  // case-study.html `.chain .path` (show-the-thinking vertical chain).
  chain: {
    viewBox: "0 0 28 1000",
    stretch: true,
    paths: [{ d: "M14 0 C 24 90, 4 180, 14 270 S 24 450, 14 540 S 4 720, 14 810 S 22 940, 14 1000" }],
  },
  // playground.html `.board .tools svg` (a pencil and a roll of tape).
  tools: {
    viewBox: "0 0 220 70",
    paths: [
      { d: "M12 52 L 150 14 L 162 22 L 24 60 Z" },
      { d: "M150 14 L 158 8 L 168 18 L 162 22" },
      { d: "M12 52 L 6 62 L 24 60" },
      { d: "M40 48 L 146 19" },
      { d: "M206 30 C 214 36, 216 48, 210 56" },
    ],
    circles: [
      { cx: 192, cy: 42, r: 18 },
      { cx: 192, cy: 42, r: 8 },
    ],
  },
  // contact.html `.details .arrow` (free arrow; dashed shaft, solid head).
  arrow: {
    viewBox: "0 0 150 44",
    paths: [
      { d: "M4 8 C 40 6, 90 34, 142 30", className: "shaft" },
      { d: "M132 22 L 142 30 L 131 36", className: "head" },
    ],
  },
};

export type AnnotationArrow = "up" | "down" | "left" | "right" | "dashed";

/**
 * Arrows drawn inside an `Annotation` (part of the same counted object). Every mockup source has a
 * dashed shaft and a solid head (`.head { stroke-dasharray: none }`).
 * - `up`: no mockup annotation points up — this is the `down` drawing mirrored vertically
 *   (`matrix(1 0 0 -1 0 64)` over its 90×64 box), not a new drawing.
 */
export const ANNOTATION_ARROWS: Record<AnnotationArrow, SvgDrawing> = {
  // work.html `.tabs-note .arrow` ("start here ↓").
  down: {
    viewBox: "0 0 90 64",
    paths: [
      { d: "M70 4 C 60 26, 40 44, 10 56", className: "shaft" },
      { d: "M22 58 L 10 56 L 14 45", className: "head" },
    ],
  },
  up: {
    viewBox: "0 0 90 64",
    transform: "matrix(1 0 0 -1 0 64)",
    paths: [
      { d: "M70 4 C 60 26, 40 44, 10 56", className: "shaft" },
      { d: "M22 58 L 10 56 L 14 45", className: "head" },
    ],
  },
  // thinking.html `.margin-arrow svg` ("the same lesson, told twice").
  left: {
    viewBox: "0 0 110 34",
    paths: [
      { d: "M106 6 C 80 4, 40 20, 6 22", className: "shaft" },
      { d: "M16 15 L 6 22 L 17 27", className: "head" },
    ],
  },
  // playground.html `.opener .aside svg` ("go poke at it").
  right: {
    viewBox: "0 0 110 34",
    paths: [
      { d: "M6 6 C 30 4, 60 26, 100 24", className: "shaft" },
      { d: "M90 18 L 100 24 L 90 30", className: "head" },
    ],
  },
  // home.html `.quote-card .arrow` (quote-card annotation).
  dashed: {
    viewBox: "0 0 130 40",
    paths: [
      { d: "M4 32 C 40 30, 80 8, 122 14", className: "shaft" },
      { d: "M112 8 L 122 14 L 112 20", className: "head" },
    ],
  },
};

export type FlowBox = { label: string; tone?: "rust" | "forest" | undefined };
export type FlowRow = { indent?: boolean | undefined; boxes: readonly FlowBox[] };

/** home.html `.work-card .sketch` — the TeachSpark flow (the one planned `flow` use, Design §3.3). */
export const FLOW_DEFAULT_ROWS: readonly FlowRow[] = [
  { boxes: [{ label: "teacher on WhatsApp" }, { label: "question paper", tone: "rust" }] },
  { indent: true, boxes: [{ label: "QC pass", tone: "forest" }, { label: "back in minutes" }] },
];
