/**
 * The paper-collage kit for the home Featured Work art (TASK-133). The TASK-127 covers are printed
 * full-bleed scenes; these are cut-paper collages instead — flat pieces of coloured paper with torn,
 * fibre-rimmed edges, laid on the card's cream paper (transparent background), each casting a soft
 * offset shadow. Same grammar as the covers otherwise: flat colour, ink keylines on the hero object,
 * the print kit's halftone screens (`#ht`, `#hs`, `#hl` from `printDefs`) for shading.
 *
 * Every piece is defined once in `<defs>` and drawn with `<use>` (shadow → fibre rim → face), so a
 * torn edge costs its points once. Deterministic (seeded), so a rebuild is byte-identical. Colour
 * lives only in the generated SVG files (public/, outside the EVAL-020 scan). No text, logos or
 * trademarks: "documents" are ruled lines and stamp shapes.
 */
import { el, n, type P } from "./kit";

/** mulberry32 — the same seeded PRNG as decor.ts. */
export function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 1D value noise in [-1, 1], smoothstep-interpolated, periodic over [0, 1] (closed outlines). */
function loopNoise(rand: () => number, knots: number): (t: number) => number {
  const values = Array.from({ length: knots }, () => rand() * 2 - 1);
  return (t: number) => {
    const x = (((t % 1) + 1) % 1) * knots;
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return values[i % knots]! * (1 - u) + values[(i + 1) % knots]! * u;
  };
}

const r1 = (v: number) => String(Math.round(v));

/**
 * A torn outline around a closed polygon: points are resampled every `step` units along the
 * perimeter (the last `cleanTail` edges are left as one straight segment each) and pushed along the edge normal by a slow tear + a finer wander + hairline jitter, with
 * the odd fibre. `depth` is the maximum displacement. Returns path data (integer coordinates).
 */
export function torn(points: readonly P[], seed: number, depth = 6, step = 7, cleanTail = 0): string {
  const rand = prng(seed);
  const count = points.length;
  const lens = points.map((p, i) => {
    const q = points[(i + 1) % count]!;
    return Math.hypot(q[0] - p[0], q[1] - p[1]);
  });
  const perimeter = lens.reduce((a, b) => a + b, 0);
  const slow = loopNoise(rand, Math.max(3, Math.round(perimeter / 110)));
  const mid = loopNoise(rand, Math.max(5, Math.round(perimeter / 26)));
  const out: string[] = [];
  let walked = 0;
  points.forEach((p, i) => {
    const q = points[(i + 1) % count]!;
    const len = lens[i]!;
    // the last `cleanTail` edges are hidden (a ridge's sides and base): one point each, untorn
    const clean = i >= count - cleanTail;
    const steps = clean ? 1 : Math.max(1, Math.round(len / step));
    const nx = len ? -(q[1] - p[1]) / len : 0;
    const ny = len ? (q[0] - p[0]) / len : 0;
    for (let j = 0; j < steps; j += 1) {
      const t = j / steps;
      const s = (walked + len * t) / perimeter;
      let d = depth * (0.62 * slow(s) + 0.3 * mid(s)) + (rand() - 0.5) * depth * 0.3;
      if (rand() < 0.03) d += depth * (0.4 + rand() * 0.5); // a fibre sticking out
      if (clean) d = 0;
      out.push(`${r1(p[0] + (q[0] - p[0]) * t + nx * d)},${r1(p[1] + (q[1] - p[1]) * t + ny * d)}`);
    }
    walked += len;
  });
  return `M${out.join("L")}Z`;
}

/** The corners of a rectangle, optionally turned by `deg` about its centre. */
export function box(x: number, y: number, w: number, h: number, deg = 0): P[] {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return ([[x, y], [x + w, y], [x + w, y + h], [x, y + h]] as P[]).map((p) => turn(p, [cx, cy], deg));
}

/** Rotate `p` by `deg` about `c`. */
export function turn(p: P, c: P, deg: number): P {
  if (!deg) return p;
  const a = (deg * Math.PI) / 180;
  const dx = p[0] - c[0];
  const dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)];
}

/** Points on a circle (for torn discs: suns, stamps). */
export function ring(cx: number, cy: number, r: number, count = 48): P[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as P;
  });
}

/** A ridge line closed down to `baseY` (mountains, hills, a treeline) — torn along its top (pass `cleanTail` 3 to `torn`). */
export function ridgePts(top: readonly P[], baseY: number): P[] {
  const first = top[0]!;
  const last = top[top.length - 1]!;
  // densify the top so the tear follows the silhouette, then close along the (hidden) base
  const dense: P[] = [];
  for (let i = 0; i < top.length - 1; i += 1) {
    const a = top[i]!;
    const b = top[i + 1]!;
    const k = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 40));
    for (let j = 0; j < k; j += 1) dense.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k]);
  }
  dense.push(last);
  return [...dense, [last[0], baseY], [first[0], baseY]];
}

type Attrs = Record<string, string | number | undefined>;

/** Many straight strokes as ONE path (ruled lines, sleepers, grid, stone courses) — a fraction of the bytes of `<line>`s. */
export function strokes(segments: readonly (readonly [P, P])[], values: Attrs): string {
  const d = segments.map(([a, b]) => `M${n(a[0])},${n(a[1])}L${n(b[0])},${n(b[1])}`).join("");
  return el("path", { d, fill: "none", ...values });
}

export interface PieceStyle {
  fill: string;
  /** The torn fibre rim (lighter paper showing at the tear). */
  rim?: string | undefined;
  rimWidth?: number | undefined;
  /** Contact shadow offset + opacity (0 = none). */
  shadow?: number | undefined;
  /** A halftone screen laid over the face (`ht` | `hs` | `hl`) and its opacity. */
  screen?: readonly [id: "ht" | "hs" | "hl", opacity: number] | undefined;
  extra?: Attrs | undefined;
  /** Attributes on the shape itself (e.g. `fill-rule` for a piece with cut-out holes). */
  shape?: Attrs | undefined;
}

/**
 * One collage piece. Registers `d` in `defs` under `id` and returns its drawing: shadow → rim → face
 * (→ halftone screen). `shade` is the scene's shadow ink.
 */
export function piece(defs: string[], id: string, d: string, style: PieceStyle, shade: string): string {
  defs.push(el("path", { id, d, ...style.shape }));
  const ref = `#${id}`;
  const out: string[] = [];
  const sh = style.shadow ?? 1;
  if (sh > 0) out.push(el("use", { href: ref, fill: shade, opacity: n(0.2 * sh), transform: `translate(${n(3 * sh)} ${n(6 * sh)})` }));
  if (style.rim) out.push(el("use", { href: ref, fill: style.rim, stroke: style.rim, "stroke-width": style.rimWidth ?? 5, "stroke-linejoin": "round" }));
  out.push(el("use", { href: ref, fill: style.fill, ...style.extra }));
  if (style.screen) out.push(el("use", { href: ref, fill: `url(#${style.screen[0]})`, opacity: style.screen[1] }));
  return out.join("");
}

/** The print kit's three halftone screens (as in `printDefs`), without the full-bleed grain + vignette. */
export function screens(ink: string, light: string): string {
  return [
    `<pattern id="ht" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="7" cy="7" r="2.6" fill="${ink}"/></pattern>`,
    `<pattern id="hs" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="4.5" cy="4.5" r="1.5" fill="${ink}"/></pattern>`,
    `<pattern id="hl" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="7" cy="7" r="2.4" fill="${light}"/></pattern>`,
  ].join("");
}

/** The collage document: transparent background, intrinsic size for `<img>`. */
export function collageSvg(w: number, h: number, defs: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>${defs}</defs>${body}</svg>`;
}

export interface Collage {
  slug: string;
  render(): string;
}
