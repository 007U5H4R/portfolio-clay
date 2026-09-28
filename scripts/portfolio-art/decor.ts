/**
 * The `/projects` paper materials (TASK-127, fidelity spec §3, §25): static SVG tiles the page's CSS
 * references with `url()` — the colour stays in these files (public/, outside the EVAL-020 scan):
 *
 *   paper-fibers.svg  cream-paper fibres + specks + faint stains (transparent; tiles over paper/ivory)
 *   kraft.svg         kraft crumple: mottled blotches, long fibres, specks (transparent; tiles over kraft)
 *   stain.svg         one faint water-ring stain (placed once on the info sheet)
 *   select-frame.svg  a hand-drawn double marker rectangle — the selected cover's `border-image`
 *
 * Deterministic (seeded PRNG), so a rebuild is byte-identical.
 */
import { n } from "./kit";

function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const doc = (w: number, h: number, body: string, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${defs ? `<defs>${defs}</defs>` : ""}${body}</svg>`;

/** The offsets that repeat a shape across the tile edges it crosses, so the tile repeats seamlessly. */
function wraps(x: number, y: number, reach: number, size: number): (readonly [number, number])[] {
  const xs = [0, ...(x - reach < 0 ? [size] : []), ...(x + reach > size ? [-size] : [])];
  const ys = [0, ...(y - reach < 0 ? [size] : []), ...(y + reach > size ? [-size] : [])];
  return xs.flatMap((dx) => ys.map((dy) => [dx, dy] as const));
}

type Ink = readonly [color: string, opacity: number];

/** Short curved fibres: quadratic strokes of random length, bend and ink. */
function fibres(rand: () => number, size: number, count: number, inks: readonly Ink[], len: [number, number], width: [number, number]): string {
  const out: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const l = len[0] + rand() * (len[1] - len[0]);
    const a = rand() * Math.PI * 2;
    const bend = (rand() - 0.5) * l * 0.8;
    const x2 = x + Math.cos(a) * l;
    const y2 = y + Math.sin(a) * l;
    const cx = (x + x2) / 2 + Math.cos(a + Math.PI / 2) * bend;
    const cy = (y + y2) / 2 + Math.sin(a + Math.PI / 2) * bend;
    const [color, opacity] = inks[Math.floor(rand() * inks.length)]!;
    const w = width[0] + rand() * (width[1] - width[0]);
    for (const [dx, dy] of wraps(x, y, l, size)) {
      out.push(
        `<path d="M${n(x + dx)},${n(y + dy)}Q${n(cx + dx)},${n(cy + dy)} ${n(x2 + dx)},${n(y2 + dy)}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${n(w)}"/>`,
      );
    }
  }
  return `<g fill="none" stroke-linecap="round">${out.join("")}</g>`;
}

function specks(rand: () => number, size: number, count: number, inks: readonly Ink[], r: [number, number]): string {
  const out: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const [color, opacity] = inks[Math.floor(rand() * inks.length)]!;
    out.push(`<circle cx="${n(rand() * size)}" cy="${n(rand() * size)}" r="${n(r[0] + rand() * (r[1] - r[0]))}" fill="${color}" fill-opacity="${opacity}"/>`);
  }
  return out.join("");
}

/** Cream paper: warm brown + navy fibres, specks and two soft blooms (no rings — a tile repeats). */
function paperFibres(): string {
  const rand = prng(1127);
  const size = 420;
  const defs =
    `<radialGradient id="b"><stop offset="0" stop-color="#b08a5a" stop-opacity=".07"/><stop offset="1" stop-color="#b08a5a" stop-opacity="0"/></radialGradient>`;
  const body =
    `<ellipse cx="96" cy="310" rx="120" ry="96" fill="url(#b)"/><ellipse cx="330" cy="90" rx="90" ry="70" fill="url(#b)"/>` +
    fibres(rand, size, 70, [["#8c6a45", 0.24], ["#a3825a", 0.2], ["#2a3150", 0.12]], [6, 22], [0.5, 1.1]) +
    specks(rand, size, 90, [["#6b4b2e", 0.18], ["#2a3150", 0.12], ["#8c6a45", 0.2]], [0.4, 1.3]) +
    specks(rand, size, 40, [["#fffaf0", 0.55]], [0.6, 1.6]);
  return doc(size, size, body, defs);
}

/** Kraft crumple: soft dark/light blotches and long light/dark fibres over a transparent ground. */
function kraft(): string {
  const rand = prng(2711);
  const size = 360;
  const defs =
    `<radialGradient id="d"><stop offset="0" stop-color="#6e4f2e" stop-opacity=".2"/><stop offset="1" stop-color="#6e4f2e" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="l"><stop offset="0" stop-color="#fbf3df" stop-opacity=".26"/><stop offset="1" stop-color="#fbf3df" stop-opacity="0"/></radialGradient>`;
  const blotches: string[] = [];
  for (let i = 0; i < 14; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const rx = 30 + rand() * 70;
    const ry = 18 + rand() * 50;
    const turn = rand() * 180;
    const fill = i % 2 === 0 ? "url(#d)" : "url(#l)";
    for (const [dx, dy] of wraps(x, y, Math.max(rx, ry), size)) {
      blotches.push(`<ellipse cx="${n(x + dx)}" cy="${n(y + dy)}" rx="${n(rx)}" ry="${n(ry)}" transform="rotate(${n(turn)} ${n(x + dx)} ${n(y + dy)})" fill="${fill}"/>`);
    }
  }
  // crumple creases: long, slightly kinked folds — a light ridge with a dark valley beside it
  const creases: string[] = [];
  for (let i = 0; i < 9; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const a = rand() * Math.PI;
    const l = 70 + rand() * 120;
    const k = (rand() - 0.5) * 0.9;
    const pts: [number, number][] = [];
    for (let j = 0; j <= 4; j += 1) {
      const t = j / 4 - 0.5;
      const ang = a + (j === 2 ? k : 0);
      pts.push([x + Math.cos(ang) * l * t + (rand() - 0.5) * 6, y + Math.sin(ang) * l * t + (rand() - 0.5) * 6]);
    }
    for (const [dx, dy] of wraps(x, y, l / 2, size)) {
      const d = pts.map(([px, py], j) => `${j === 0 ? "M" : "L"}${n(px + dx)},${n(py + dy)}`).join("");
      creases.push(`<path d="${d}" stroke="#fff4dc" stroke-opacity=".28" stroke-width="1.6"/>`);
      creases.push(`<path d="${d}" transform="translate(1.6 1.8)" stroke="#5a3d22" stroke-opacity=".16" stroke-width="1.8"/>`);
    }
  }
  const body =
    blotches.join("") +
    `<g fill="none" stroke-linejoin="round" stroke-linecap="round">${creases.join("")}</g>` +
    fibres(rand, size, 60, [["#fff6e2", 0.34], ["#5d4125", 0.22]], [12, 40], [0.5, 1.2]) +
    specks(rand, size, 70, [["#4a3219", 0.22], ["#fff6e2", 0.3]], [0.5, 1.5]);
  return doc(size, size, body, defs);
}

/** One faint tide-line stain (a coffee/water ring), for the info sheet's lower corner. */
function stain(): string {
  const defs = `<radialGradient id="r"><stop offset=".72" stop-color="#9a7449" stop-opacity="0"/><stop offset=".9" stop-color="#9a7449" stop-opacity=".1"/><stop offset=".96" stop-color="#9a7449" stop-opacity=".16"/><stop offset="1" stop-color="#9a7449" stop-opacity="0"/></radialGradient>`;
  const body = `<ellipse cx="110" cy="104" rx="92" ry="86" fill="url(#r)" transform="rotate(-8 110 104)" opacity=".75"/>`;
  return doc(220, 220, body, defs);
}

/**
 * The selected cover's hand-drawn marker frame (9-slice `border-image`, slice 32): two quick marker
 * passes that overshoot at the corners, like a circle drawn around the chosen cartridge.
 */
function selectFrame(): string {
  const a = "M10,15 C44,8 84,11 114,12 C118,44 116,84 113,112 C82,117 42,115 9,113 C6,82 9,44 11,10";
  const b = "M16,8 C48,13 86,6 116,15 C111,46 118,80 109,116 C76,110 38,118 5,108 C12,74 4,40 15,11";
  const body = `<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${a}" stroke="#b64927" stroke-width="6"/><path d="${b}" stroke="#92381f" stroke-width="3.2" stroke-opacity=".85"/></g>`;
  return doc(124, 124, body);
}

/* ── torn-paper masks ──────────────────────────────────────────────────────────────────────────────
   Each mask is a torn rectangle drawn at its layer's typical size (so stretching with
   `mask-size: 100% 100%` barely distorts it): every edge wanders inwards by a smooth low-frequency
   tear plus hairline jitter and the odd fibre, and the corners tear off. Baked once as static vector
   paths — cheap to rasterise, unlike a live fractal-noise filter (TASK-127 measured ≈ 6× the raster
   work with `feTurbulence` + `feDisplacementMap` on every paper layer). */

/** 1D value noise in [-1, 1] with smooth interpolation (seeded, deterministic). */
function noise1(rand: () => number, knots: number): (t: number) => number {
  const values = Array.from({ length: knots + 2 }, () => rand() * 2 - 1);
  return (t: number) => {
    const x = Math.max(0, Math.min(1, t)) * knots;
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return values[i]! * (1 - u) + values[i + 1]! * u;
  };
}

type Edge = "top" | "right" | "bottom" | "left";
interface TearSpec {
  file: string;
  w: number;
  h: number;
  seed: number;
  /** Max inward depth of the slow tear per edge (0 = a clean cut edge). */
  depth: Partial<Record<Edge, number>>;
  /** Point spacing along an edge (smaller = finer fibres, bigger file). */
  step?: number;
}

function tornPath(spec: TearSpec): string {
  const rand = prng(spec.seed);
  const step = spec.step ?? 3;
  const pts: string[] = [];
  const edges: { edge: Edge; from: [number, number]; to: [number, number]; inward: [number, number] }[] = [
    { edge: "top", from: [0, 0], to: [spec.w, 0], inward: [0, 1] },
    { edge: "right", from: [spec.w, 0], to: [spec.w, spec.h], inward: [-1, 0] },
    { edge: "bottom", from: [spec.w, spec.h], to: [0, spec.h], inward: [0, -1] },
    { edge: "left", from: [0, spec.h], to: [0, 0], inward: [1, 0] },
  ];
  for (const { edge, from, to, inward } of edges) {
    const depth = spec.depth[edge] ?? 0;
    const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const count = Math.max(2, Math.round(len / step));
    const slow = noise1(rand, Math.max(2, Math.round(len / 90)));
    const mid = noise1(rand, Math.max(3, Math.round(len / 22)));
    for (let i = 0; i < count; i += 1) {
      const t = i / count;
      // corners tear off: the first/last stretch of each edge dips inward a little more
      const corner = Math.min(t, 1 - t) < 0.03 ? depth * 0.35 : 0;
      let d = depth > 0 ? depth * (0.5 + 0.34 * slow(t) + 0.16 * mid(t)) + (rand() - 0.5) * depth * 0.22 + corner : 0;
      if (depth > 0 && rand() < 0.035) d = Math.max(0, d - depth * (0.35 + rand() * 0.4)); // a fibre sticking out
      const x = from[0] + (to[0] - from[0]) * t + inward[0] * d;
      const y = from[1] + (to[1] - from[1]) * t + inward[1] * d;
      pts.push(`${Math.round(x * 2) / 2},${Math.round(y * 2) / 2}`);
    }
  }
  return `M${pts.join("L")}Z`;
}

function tearMask(spec: TearSpec): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${spec.w} ${spec.h}" width="${spec.w}" height="${spec.h}" preserveAspectRatio="none"><path d="${tornPath(spec)}"/></svg>`;
}

const TEARS: readonly TearSpec[] = [
  // the stage stack (≈ 16:9 + the mat margin): backing, under-layer, rim, mat
  { file: "tear-wide-a.svg", w: 800, h: 470, seed: 11, depth: { top: 9, right: 9, bottom: 10, left: 9 } },
  { file: "tear-wide-b.svg", w: 800, h: 470, seed: 29, depth: { top: 11, right: 8, bottom: 9, left: 10 } },
  // the product sheet + its under-sheet
  { file: "tear-tall-a.svg", w: 460, h: 560, seed: 37, depth: { top: 8, right: 8, bottom: 9, left: 7 } },
  { file: "tear-tall-b.svg", w: 460, h: 560, seed: 53, depth: { top: 9, right: 7, bottom: 10, left: 8 } },
  // the kraft band (+ its rim): torn top, bottom and both ends
  { file: "tear-band-a.svg", w: 1600, h: 380, seed: 61, depth: { top: 12, right: 18, bottom: 12, left: 18 }, step: 4 },
  { file: "tear-band-b.svg", w: 1600, h: 380, seed: 79, depth: { top: 14, right: 20, bottom: 14, left: 20 }, step: 4 },
  // action strips (three tears, cycled), icon chips, tape, tags / arrow tabs, the enterprise seam
  { file: "tear-strip-a.svg", w: 400, h: 52, seed: 83, depth: { top: 3, right: 7, bottom: 4, left: 6 }, step: 2 },
  { file: "tear-strip-b.svg", w: 400, h: 52, seed: 97, depth: { top: 4, right: 6, bottom: 3, left: 7 }, step: 2 },
  { file: "tear-strip-c.svg", w: 400, h: 52, seed: 101, depth: { top: 3, right: 8, bottom: 4, left: 5 }, step: 2 },
  { file: "tear-chip.svg", w: 48, h: 48, seed: 109, depth: { top: 3, right: 3, bottom: 3, left: 3 }, step: 1.5 },
  { file: "tear-tape.svg", w: 120, h: 34, seed: 113, depth: { top: 1.5, right: 7, bottom: 1.5, left: 7 }, step: 1.5 },
  { file: "tear-tag.svg", w: 220, h: 44, seed: 127, depth: { top: 3, right: 5, bottom: 4, left: 5 }, step: 2 },
  { file: "tear-seam.svg", w: 1600, h: 60, seed: 131, depth: { top: 14 }, step: 4 },
];

export const decorAssets: readonly { file: string; render: () => string }[] = [
  { file: "paper-fibers.svg", render: paperFibres },
  { file: "kraft.svg", render: kraft },
  { file: "stain.svg", render: stain },
  { file: "select-frame.svg", render: selectFrame },
  ...TEARS.map((spec) => ({ file: spec.file, render: () => tearMask(spec) })),
];
