/**
 * Enterprise Field Journal art configuration (TASK-204, EXE-80). Presentation only: no project fact lives here.
 * Facts (client, program, role, dates, tags, workstreams) stay in `data/enterprise.ts`; this file knows only where
 * the movable paper layers sit inside each cutout and how they move, so animation config stays separate from content.
 *
 * Coordinates are percentages of the cutout (`ratio` = width / height of the shipped WebP). A part is a clipped copy of
 * the same cutout that translates on its own (`dx`/`dy` in px at the card's art size, `delay` in ms). A `hole` part is
 * also cut out of the still base so the lifted layer leaves open paper behind it; parts that touch a neighbour skip the
 * hole and lift only a few px, so the copy beneath never shows. A `path` draws a connector (stroke-dashoffset on an SVG
 * path, in the same percent space). A `mark` fades a restrained outline over an existing artifact.
 */
export interface ArtPart {
  /** [x, y, w, h] in % of the cutout. */
  rect: readonly [number, number, number, number];
  dx?: number;
  dy: number;
  delay: number;
  hole?: boolean;
  /** The part that answers a hover (shifts a few px); one per card. */
  hover?: boolean;
}
export interface ArtConnector {
  d: string;
  delay: number;
}
export interface ArtMark {
  rect: readonly [number, number, number, number];
  delay: number;
}
export interface EnterpriseArt {
  /** Folder under /media/enterprise-work/. */
  dir: string;
  ratio: number;
  /** Informative alt for the miniature model (no client claims; says what the paper scene depicts). */
  alt: string;
  parts: readonly ArtPart[];
  connectors: readonly ArtConnector[];
  marks: readonly ArtMark[];
}

export const enterpriseArt: Record<string, EnterpriseArt> = {
  "pear-health-labs": {
    dir: "pear",
    ratio: 760 / 737,
    alt: "Paper model of a cloud above a cluster of infrastructure blocks, joined by connectors to a cylindrical data warehouse.",
    parts: [
      { rect: [16, 0, 66, 43], dy: -7, delay: 0, hole: true, hover: true },
      { rect: [66, 48, 34, 52], dy: -4, delay: 90 },
    ],
    connectors: [
      { d: "M46 60 C 57 62, 56 77, 68 77", delay: 240 },
      { d: "M46 82 C 57 82, 58 72, 68 73", delay: 330 },
    ],
    marks: [],
  },
  mojix: {
    dir: "mojix",
    ratio: 760 / 565,
    alt: "Paper model of inventory crates feeding a row of three pipeline blocks that lead down to an analytics warehouse.",
    parts: [
      { rect: [0, 0, 28, 45], dy: -5, delay: 0, hover: true },
      { rect: [29, 22, 17, 26], dy: -4, delay: 110 },
      { rect: [45.5, 28, 17, 28], dy: -4, delay: 220 },
      { rect: [62, 32, 17, 27], dy: -4, delay: 330 },
      { rect: [72, 57, 28, 43], dy: -4, delay: 440 },
    ],
    connectors: [{ d: "M19 31 L 31 37 L 46 43 L 63 48 L 80 51 C 85 52, 85 55, 85 58", delay: 200 }],
    marks: [],
  },
  "google-cloud-hmle": {
    dir: "google",
    ratio: 760 / 655,
    alt: "Paper model of a research bench with a processor chip, beside two standing comparison sheets with abstract charts.",
    parts: [
      { rect: [36, 0, 27, 70], dy: -5, delay: 0, hover: true },
      { rect: [64, 8, 36, 92], dx: -5, dy: -3, delay: 140 },
    ],
    connectors: [],
    marks: [{ rect: [67, 42, 27, 24], delay: 420 }],
  },
  "telus-health-lifeworks": {
    dir: "telus",
    ratio: 760 / 532,
    alt: "Paper model of stacked report sheets and a spreadsheet joined by connectors to a checklist and a round validation seal.",
    parts: [
      { rect: [70, 8, 30, 50], dx: -5, dy: -3, delay: 0 },
      { rect: [37, 40, 25, 52], dy: -4, delay: 140, hover: true },
      { rect: [74, 68, 26, 32], dy: -6, delay: 280 },
    ],
    connectors: [],
    marks: [{ rect: [72, 12, 27, 44], delay: 460 }],
  },
  "lifepoint-health": {
    dir: "lifepoint",
    ratio: 760 / 460,
    alt: "Paper model of a row of record folders joined by connectors to a stack of data-transfer blocks.",
    parts: [
      { rect: [0, 0, 47, 82], dy: -5, delay: 0, hover: true },
      { rect: [62, 8, 38, 60], dy: -6, delay: 120 },
    ],
    connectors: [
      { d: "M47 40 L 65 52", delay: 300 },
      { d: "M47 48 L 65 59", delay: 380 },
    ],
    marks: [],
  },
  "iu-health": {
    dir: "iu",
    ratio: 760 / 540,
    alt: "Paper model of a hospital, a calendar sheet and four data-source blocks beside a standing chart with a rising line.",
    parts: [
      { rect: [12, 68, 18, 32], dy: -5, delay: 0, hover: true },
      { rect: [31, 68, 17, 32], dy: -5, delay: 70 },
      { rect: [49, 68, 17, 32], dy: -5, delay: 140 },
      { rect: [67, 68, 20, 32], dy: -5, delay: 210 },
    ],
    connectors: [{ d: "M71 52 L 78 45 L 81 49 L 88 40 L 93 33", delay: 380 }],
    marks: [],
  },
};

/** Header cutout (decorative: the heading carries the meaning). */
export const enterpriseHeaderArt = { dir: "header", ratio: 760 / 506 };
