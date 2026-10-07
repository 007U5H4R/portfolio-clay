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
 * - `band`: home.html `.band-torn` (terracotta footer band), 1440×46, with a tooth inserted between every
 *   mockup point so the teeth are half as wide (Tushar 2026-09-26: "make the width smaller").
 */
export const TORN_PATHS = {
  paper:
    "M0 26 L 60 22 L 110 30 L 170 18 L 230 27 L 300 15 L 350 24 L 420 12 L 480 22 L 530 16 L 600 28 L 660 20 L 720 30 L 790 17 L 850 25 L 910 13 L 980 24 L 1040 18 L 1100 29 L 1160 15 L 1230 23 L 1290 12 L 1350 24 L 1400 19 L 1440 26 L 1440 46 L 0 46 Z",
  band: "M0 30 L 12 31 L 24 18 L 36 18 L 48 32 L 59 30 L 70 14 L 83 14 L 96 28 L 108 32 L 120 22 L 130 21 L 140 34 L 154 30 L 168 12 L 180 12 L 192 26 L 203 30 L 214 20 L 227 18 L 240 30 L 251 30 L 262 16 L 275 15 L 288 28 L 300 33 L 312 24 L 324 22 L 336 34 L 347 31 L 358 14 L 371 13 L 384 26 L 396 30 L 408 20 L 419 19 L 430 32 L 443 31 L 456 16 L 468 15 L 480 28 L 492 32 L 504 22 L 516 21 L 528 34 L 540 33 L 552 18 L 564 15 L 576 26 L 588 26 L 600 12 L 612 14 L 624 30 L 636 33 L 648 22 L 660 20 L 672 32 L 684 31 L 696 16 L 708 15 L 720 28 L 732 31 L 744 20 L 756 20 L 768 34 L 780 31 L 792 14 L 804 13 L 816 26 L 828 31 L 840 22 L 852 20 L 864 32 L 876 32 L 888 18 L 900 16 L 912 28 L 924 27 L 936 12 L 948 14 L 960 30 L 972 33 L 984 22 L 996 21 L 1008 34 L 1020 32 L 1032 16 L 1044 14 L 1056 26 L 1068 30 L 1080 20 L 1092 19 L 1104 32 L 1116 30 L 1128 14 L 1140 14 L 1152 28 L 1164 32 L 1176 22 L 1188 21 L 1200 34 L 1212 33 L 1224 18 L 1236 15 L 1248 26 L 1260 26 L 1272 12 L 1284 14 L 1296 30 L 1308 32 L 1320 20 L 1332 19 L 1344 32 L 1356 31 L 1368 16 L 1380 15 L 1392 28 L 1404 32 L 1416 22 L 1428 19 L 1440 30 L 1440 46 L 0 46 Z",
} as const;

export type SketchLineVariant = "underline" | "spark" | "path" | "journey" | "chain" | "tools" | "arrow";

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
  // home.html `.journey .path` (TKT-76: the home How-I-think curve behind the six stage cards; the
  // `path` variant above is the About product-journey drawing, a different curve).
  // TKT-99 round 2 (Tushar: "the path connecting each stages is not that visible"): pin-to-pin
  // arcs in a fixed-height strip across the card tops (x = the six column centres, y = the pin
  // heads: 92 for cards 1/3/5, 64 for 2/4/6, strip top at −30 px), arcing above the cards so every
  // segment reads between pins. Rendered 150 px tall, stretched horizontally only.
  journey: {
    viewBox: "0 0 1200 150",
    stretch: true,
    paths: [
      {
        d: "M100 92 C 140 26, 250 6, 300 64 C 350 16, 450 20, 500 92 C 540 26, 650 6, 700 64 C 750 16, 850 20, 900 92 C 940 26, 1050 6, 1100 64",
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

/**
 * M-010 T4 (TASK-145.4) · organic paper ridges for the section tears, replacing the zig-zag `TORN_PATHS`
 * silhouettes. Three layers per variant, back → front, smooth cubic contours in the shared 1440×46 viewBox
 * (the front layer is the section's own fill and reaches y=46, so no hairline opens). Generated once from
 * seeded layered sines (scratch: .scratch/t4) — code-drawn, so zero asset weight (Dev-174).
 */
export const RIDGE_PATHS = {
  hills: [
    "M0 8.8 C 30 8.8 30 8.0 60 8.0 C 90 8.0 90 6.3 120 6.3 C 150 6.3 150 3.9 180 3.9 C 210 3.9 210 5.8 240 5.8 C 270 5.8 270 8.2 300 8.2 C 330 8.2 330 8.0 360 8.0 C 390 8.0 390 5.1 420 5.1 C 450 5.1 450 5.7 480 5.7 C 510 5.7 510 5.9 540 5.9 C 570 5.9 570 6.5 600 6.5 C 630 6.5 630 6.6 660 6.6 C 690 6.6 690 8.8 720 8.8 C 750 8.8 750 14.1 780 14.1 C 810 14.1 810 14.7 840 14.7 C 870 14.7 870 14.1 900 14.1 C 930 14.1 930 14.7 960 14.7 C 990 14.7 990 12.7 1020 12.7 C 1050 12.7 1050 9.1 1080 9.1 C 1110 9.1 1110 8.2 1140 8.2 C 1170 8.2 1170 8.1 1200 8.1 C 1230 8.1 1230 8.7 1260 8.7 C 1290 8.7 1290 7.6 1320 7.6 C 1350 7.6 1350 6.9 1380 6.9 C 1410 6.9 1410 8.3 1440 8.3 L 1440 46 L 0 46 Z",
    "M0 13.9 C 26 13.9 26 12.3 52 12.3 C 78 12.3 78 14.2 104 14.2 C 130 14.2 130 14.3 156 14.3 C 182 14.3 182 15.2 208 15.2 C 234 15.2 234 14.7 260 14.7 C 286 14.7 286 15.6 312 15.6 C 338 15.6 338 16.1 364 16.1 C 390 16.1 390 14.9 416 14.9 C 442 14.9 442 11.4 468 11.4 C 494 11.4 494 12.4 520 12.4 C 546 12.4 546 13.5 572 13.5 C 598 13.5 598 17.3 624 17.3 C 650 17.3 650 15.6 676 15.6 C 702 15.6 702 19.6 728 19.6 C 754 19.6 754 20.4 780 20.4 C 806 20.4 806 24.1 832 24.1 C 858 24.1 858 22.2 884 22.2 C 910 22.2 910 20.2 936 20.2 C 962 20.2 962 20.5 988 20.5 C 1014 20.5 1014 17.8 1040 17.8 C 1066 17.8 1066 16.8 1092 16.8 C 1118 16.8 1118 17.6 1144 17.6 C 1170 17.6 1170 16.0 1196 16.0 C 1222 16.0 1222 16.2 1248 16.2 C 1274 16.2 1274 19.7 1300 19.7 C 1326 19.7 1326 18.2 1352 18.2 C 1396 18.2 1396 13.4 1440 13.4 L 1440 46 L 0 46 Z",
    "M0 27.2 C 22 27.2 22 24.5 44 24.5 C 66 24.5 66 25.7 88 25.7 C 110 25.7 110 26.2 132 26.2 C 154 26.2 154 26.3 176 26.3 C 198 26.3 198 27.6 220 27.6 C 242 27.6 242 24.8 264 24.8 C 286 24.8 286 26.6 308 26.6 C 330 26.6 330 25.0 352 25.0 C 374 25.0 374 23.6 396 23.6 C 418 23.6 418 21.6 440 21.6 C 462 21.6 462 21.4 484 21.4 C 506 21.4 506 20.3 528 20.3 C 550 20.3 550 18.7 572 18.7 C 594 18.7 594 20.3 616 20.3 C 638 20.3 638 19.9 660 19.9 C 682 19.9 682 23.3 704 23.3 C 726 23.3 726 24.8 748 24.8 C 770 24.8 770 26.9 792 26.9 C 814 26.9 814 28.1 836 28.1 C 858 28.1 858 27.4 880 27.4 C 902 27.4 902 27.2 924 27.2 C 946 27.2 946 26.4 968 26.4 C 990 26.4 990 25.0 1012 25.0 C 1034 25.0 1034 28.1 1056 28.1 C 1078 28.1 1078 26.7 1100 26.7 C 1122 26.7 1122 27.5 1144 27.5 C 1166 27.5 1166 27.3 1188 27.3 C 1210 27.3 1210 28.3 1232 28.3 C 1254 28.3 1254 29.5 1276 29.5 C 1298 29.5 1298 29.6 1320 29.6 C 1342 29.6 1342 27.6 1364 27.6 C 1402 27.6 1402 25.0 1440 25.0 L 1440 46 L 0 46 Z",
  ],
  ridge: [
    "M0 6.6 C 24 6.6 24 5.3 48 5.3 C 72 5.3 72 11.2 96 11.2 C 120 11.2 120 13.4 144 13.4 C 168 13.4 168 11.8 192 11.8 C 216 11.8 216 10.7 240 10.7 C 264 10.7 264 8.9 288 8.9 C 312 8.9 312 7.6 336 7.6 C 360 7.6 360 8.2 384 8.2 C 408 8.2 408 5.4 432 5.4 C 456 5.4 456 -1.6 480 -1.6 C 504 -1.6 504 1.3 528 1.3 C 552 1.3 552 -1.3 576 -1.3 C 600 -1.3 600 -0.7 624 -0.7 C 648 -0.7 648 -2.2 672 -2.2 C 696 -2.2 696 3.9 720 3.9 C 744 3.9 744 4.6 768 4.6 C 792 4.6 792 8.0 816 8.0 C 840 8.0 840 6.8 864 6.8 C 888 6.8 888 1.6 912 1.6 C 936 1.6 936 2.2 960 2.2 C 984 2.2 984 4.1 1008 4.1 C 1032 4.1 1032 3.8 1056 3.8 C 1080 3.8 1080 9.7 1104 9.7 C 1128 9.7 1128 6.5 1152 6.5 C 1176 6.5 1176 6.8 1200 6.8 C 1224 6.8 1224 14.1 1248 14.1 C 1272 14.1 1272 12.4 1296 12.4 C 1320 12.4 1320 16.7 1344 16.7 C 1368 16.7 1368 11.2 1392 11.2 C 1416 11.2 1416 9.5 1440 9.5 L 1440 46 L 0 46 Z",
    "M0 19.5 C 20 19.5 20 16.4 40 16.4 C 60 16.4 60 16.7 80 16.7 C 100 16.7 100 19.5 120 19.5 C 140 19.5 140 16.2 160 16.2 C 180 16.2 180 19.9 200 19.9 C 220 19.9 220 16.2 240 16.2 C 260 16.2 260 21.8 280 21.8 C 300 21.8 300 16.7 320 16.7 C 340 16.7 340 17.7 360 17.7 C 380 17.7 380 20.0 400 20.0 C 420 20.0 420 19.7 440 19.7 C 460 19.7 460 23.5 480 23.5 C 500 23.5 500 22.9 520 22.9 C 540 22.9 540 17.2 560 17.2 C 580 17.2 580 20.7 600 20.7 C 620 20.7 620 16.5 640 16.5 C 660 16.5 660 13.3 680 13.3 C 700 13.3 700 11.6 720 11.6 C 740 11.6 740 14.4 760 14.4 C 780 14.4 780 9.9 800 9.9 C 820 9.9 820 10.1 840 10.1 C 860 10.1 860 8.6 880 8.6 C 900 8.6 900 11.6 920 11.6 C 940 11.6 940 11.3 960 11.3 C 980 11.3 980 13.8 1000 13.8 C 1020 13.8 1020 13.5 1040 13.5 C 1060 13.5 1060 11.0 1080 11.0 C 1100 11.0 1100 16.7 1120 16.7 C 1140 16.7 1140 13.7 1160 13.7 C 1180 13.7 1180 18.0 1200 18.0 C 1220 18.0 1220 18.8 1240 18.8 C 1260 18.8 1260 15.2 1280 15.2 C 1300 15.2 1300 10.8 1320 10.8 C 1340 10.8 1340 16.4 1360 16.4 C 1380 16.4 1380 17.8 1400 17.8 C 1420 17.8 1420 16.8 1440 16.8 L 1440 46 L 0 46 Z",
    "M0 17.1 C 17 17.1 17 23.9 34 23.9 C 51 23.9 51 25.1 68 25.1 C 85 25.1 85 27.4 102 27.4 C 119 27.4 119 24.6 136 24.6 C 153 24.6 153 24.9 170 24.9 C 187 24.9 187 26.9 204 26.9 C 221 26.9 221 25.6 238 25.6 C 255 25.6 255 28.1 272 28.1 C 289 28.1 289 24.8 306 24.8 C 323 24.8 323 24.5 340 24.5 C 357 24.5 357 28.0 374 28.0 C 391 28.0 391 24.4 408 24.4 C 425 24.4 425 24.9 442 24.9 C 459 24.9 459 27.5 476 27.5 C 493 27.5 493 25.9 510 25.9 C 527 25.9 527 24.5 544 24.5 C 561 24.5 561 30.3 578 30.3 C 595 30.3 595 27.9 612 27.9 C 629 27.9 629 27.4 646 27.4 C 663 27.4 663 26.4 680 26.4 C 697 26.4 697 29.1 714 29.1 C 731 29.1 731 23.9 748 23.9 C 765 23.9 765 25.9 782 25.9 C 799 25.9 799 20.7 816 20.7 C 833 20.7 833 19.8 850 19.8 C 867 19.8 867 18.5 884 18.5 C 901 18.5 901 15.1 918 15.1 C 935 15.1 935 13.9 952 13.9 C 969 13.9 969 18.2 986 18.2 C 1003 18.2 1003 21.2 1020 21.2 C 1037 21.2 1037 20.7 1054 20.7 C 1071 20.7 1071 19.8 1088 19.8 C 1105 19.8 1105 22.1 1122 22.1 C 1139 22.1 1139 19.9 1156 19.9 C 1173 19.9 1173 21.8 1190 21.8 C 1207 21.8 1207 24.5 1224 24.5 C 1241 24.5 1241 28.9 1258 28.9 C 1275 28.9 1275 23.2 1292 23.2 C 1309 23.2 1309 21.3 1326 21.3 C 1343 21.3 1343 20.5 1360 20.5 C 1377 20.5 1377 20.3 1394 20.3 C 1417 20.3 1417 23.3 1440 23.3 L 1440 46 L 0 46 Z",
  ],
  dunes: [
    "M0 13.8 C 45 13.8 45 13.8 90 13.8 C 135 13.8 135 15.0 180 15.0 C 225 15.0 225 13.1 270 13.1 C 315 13.1 315 13.1 360 13.1 C 405 13.1 405 13.8 450 13.8 C 495 13.8 495 13.3 540 13.3 C 585 13.3 585 13.3 630 13.3 C 675 13.3 675 9.9 720 9.9 C 765 9.9 765 7.7 810 7.7 C 855 7.7 855 8.7 900 8.7 C 945 8.7 945 9.1 990 9.1 C 1035 9.1 1035 12.7 1080 12.7 C 1125 12.7 1125 13.0 1170 13.0 C 1215 13.0 1215 11.7 1260 11.7 C 1305 11.7 1305 13.9 1350 13.9 C 1395 13.9 1395 13.1 1440 13.1 L 1440 46 L 0 46 Z",
    "M0 22.9 C 40 22.9 40 21.7 80 21.7 C 120 21.7 120 21.7 160 21.7 C 200 21.7 200 20.6 240 20.6 C 280 20.6 280 19.3 320 19.3 C 360 19.3 360 20.7 400 20.7 C 440 20.7 440 21.0 480 21.0 C 520 21.0 520 19.4 560 19.4 C 600 19.4 600 18.4 640 18.4 C 680 18.4 680 16.0 720 16.0 C 760 16.0 760 13.5 800 13.5 C 840 13.5 840 16.2 880 16.2 C 920 16.2 920 17.6 960 17.6 C 1000 17.6 1000 18.3 1040 18.3 C 1080 18.3 1080 21.2 1120 21.2 C 1160 21.2 1160 20.7 1200 20.7 C 1240 20.7 1240 19.6 1280 19.6 C 1320 19.6 1320 21.4 1360 21.4 C 1400 21.4 1400 21.2 1440 21.2 L 1440 46 L 0 46 Z",
    "M0 24.3 C 35 24.3 35 24.9 70 24.9 C 105 24.9 105 25.2 140 25.2 C 175 25.2 175 25.1 210 25.1 C 245 25.1 245 25.6 280 25.6 C 315 25.6 315 27.2 350 27.2 C 385 27.2 385 26.2 420 26.2 C 455 26.2 455 25.9 490 25.9 C 525 25.9 525 27.7 560 27.7 C 595 27.7 595 27.2 630 27.2 C 665 27.2 665 28.0 700 28.0 C 735 28.0 735 31.0 770 31.0 C 805 31.0 805 30.8 840 30.8 C 875 30.8 875 28.8 910 28.8 C 945 28.8 945 28.1 980 28.1 C 1015 28.1 1015 27.2 1050 27.2 C 1085 27.2 1085 24.5 1120 24.5 C 1155 24.5 1155 25.4 1190 25.4 C 1225 25.4 1225 26.8 1260 26.8 C 1295 26.8 1295 25.8 1330 25.8 C 1385 25.8 1385 25.9 1440 25.9 L 1440 46 L 0 46 Z",
  ],
} as const;
