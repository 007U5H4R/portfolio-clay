/**
 * Shared palette and paper helpers for the `/about` art (TASK-136). Every About asset is a hand-authored
 * cut-paper collage in the TASK-127 / TASK-133 grammar — flat printed colour, torn fibre-rimmed edges, ink
 * keylines on the hero object, halftone screens for shade — on a transparent background, so it lies on the
 * page's cream paper. Built by `scripts/about-art/build.ts` into `public/about/`.
 *
 * Colour lives only in the generated SVG files (public/, outside the EVAL-020 scan): the hex values below
 * are the Design.md §2.1 paper tokens plus a few tints of them (sage, dusty blue, muted yellow — spec §6).
 * No lettering except the four book spines (AI · Systems · Products · Impact, spec §4); no logos.
 */
import { el, g, line, path, rect, smooth, type P } from "../portfolio-art/kit";
import { box, piece, torn, strokes } from "../portfolio-art/collage";

export const C = {
  navy: "#0d1735",
  navy2: "#2e3854",
  ink: "#39435b",
  inkSoft: "#5a6178",
  rust: "#b64927",
  sun: "#c0613f",
  terracotta: "#92381f",
  forest: "#214f43",
  green2: "#496d58",
  sage: "#8fa58a",
  sageLight: "#b7c6ae",
  steel: "#63799e",
  dusty: "#8fa3bf",
  dustyLight: "#b9c5d6",
  yellow: "#e3c56b",
  note: "#eedca9",
  kraft: "#d7be93",
  cream: "#f3ead6",
  paper: "#f7f1e7",
  paper2: "#efe7d8",
  grid: "#ede3cb",
  rim: "#fffbf2",
  shade: "#1b1a2e",
  rule: "#8e97ab",
} as const;

type Attrs = Record<string, string | number | undefined>;

/** A torn sheet of paper (a rectangle turned by `deg`), drawn shadow → rim → face. */
export function sheet(
  defs: string[],
  id: string,
  rectangle: readonly [x: number, y: number, w: number, h: number],
  deg: number,
  seed: number,
  fill: string,
  opts: { depth?: number; screen?: readonly ["ht" | "hs" | "hl", number]; shadow?: number } = {},
): string {
  const [x, y, w, h] = rectangle;
  return piece(
    defs,
    id,
    torn(box(x, y, w, h, deg), seed, opts.depth ?? 4, 10),
    { fill, rim: C.rim, rimWidth: 4, screen: opts.screen, shadow: opts.shadow ?? 1 },
    C.shade,
  );
}

/** A strip of kraft masking tape (semi-opaque, torn ends). */
export function tape(defs: string[], id: string, x: number, y: number, w: number, h: number, deg: number, seed: number): string {
  return piece(defs, id, torn(box(x, y, w, h, deg), seed, 2.2, 5), { fill: C.kraft, extra: { opacity: 0.8 }, shadow: 0.3 }, C.shade);
}

/** Content laid on a sheet, turned with it about the sheet's centre. */
export function onSheet(rectangle: readonly [number, number, number, number], deg: number, ...children: string[]): string {
  const [x, y, w, h] = rectangle;
  return g({ transform: `rotate(${deg} ${x + w / 2} ${y + h / 2})` }, ...children);
}

/** Ruled lines across a box (notebook / article body), ragged right. */
export function ruled(x: number, y: number, w: number, h: number, gap: number, seed: number, values: Attrs = {}): string {
  const segs: [P, P][] = [];
  let r = seed;
  for (let yy = y; yy <= y + h; yy += gap) {
    r = (r * 9301 + 49297) % 233280;
    const ragged = w * (0.72 + (r / 233280) * 0.28);
    segs.push([[x, yy], [x + ragged, yy]]);
  }
  return strokes(segs, { stroke: C.rule, "stroke-width": 3, "stroke-linecap": "round", ...values });
}

/** A square grid (graph paper) over a box. */
export function grid(x: number, y: number, w: number, h: number, step: number, values: Attrs = {}): string {
  const segs: [P, P][] = [];
  for (let xx = x; xx <= x + w; xx += step) segs.push([[xx, y], [xx, y + h]]);
  for (let yy = y; yy <= y + h; yy += step) segs.push([[x, yy], [x + w, yy]]);
  return strokes(segs, { stroke: C.steel, "stroke-width": 1.2, opacity: 0.25, ...values });
}

/** A hand-drawn ink line through points (slightly wobbly via the spline). */
export function inkLine(points: readonly P[], values: Attrs = {}): string {
  return path(smooth(points, false, 0.9), {
    fill: "none",
    stroke: C.navy2,
    "stroke-width": 3,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    ...values,
  });
}

/** A gear outline (sketch) — `teeth` square teeth round a ring, with a hub. */
export function gear(cx: number, cy: number, r: number, teeth: number, values: Attrs = {}): string {
  const pts: string[] = [];
  const depth = r * 0.2;
  for (let i = 0; i < teeth * 4; i += 1) {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const rr = i % 4 < 2 ? r + depth : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  const stroke = { fill: "none", stroke: C.navy2, "stroke-width": 3, "stroke-linejoin": "round", ...values };
  return [
    el("polygon", { points: pts.join(" "), ...stroke }),
    el("circle", { cx, cy, r: r * 0.36, ...stroke }),
    el("circle", { cx, cy, r: r * 0.12, fill: values.stroke ?? C.navy2 }),
  ].join("");
}

/** A dimension line with arrow ends and ticks (engineering drawing). */
export function dimension(a: P, b: P, values: Attrs = {}): string {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const head = (p: P, dir: number) => {
    const s = 11;
    const l: P = [p[0] + s * Math.cos(ang + dir * Math.PI + 0.4), p[1] + s * Math.sin(ang + dir * Math.PI + 0.4)];
    const r: P = [p[0] + s * Math.cos(ang + dir * Math.PI - 0.4), p[1] + s * Math.sin(ang + dir * Math.PI - 0.4)];
    return path(`M${l[0].toFixed(1)},${l[1].toFixed(1)}L${p[0]},${p[1]}L${r[0].toFixed(1)},${r[1].toFixed(1)}`, {
      fill: "none",
      stroke: C.navy2,
      "stroke-width": 2,
      "stroke-linejoin": "round",
      ...values,
    });
  };
  return [line(a, b, { stroke: C.navy2, "stroke-width": 2, ...values }), head(a, 0), head(b, 1)].join("");
}

/** A small rust approval / seal stamp (no lettering). */
export function seal(cx: number, cy: number, r: number): string {
  return g(
    { opacity: 0.85 },
    el("circle", { cx, cy, r, fill: "none", stroke: C.rust, "stroke-width": 4 }),
    el("circle", { cx, cy, r: r * 0.78, fill: "none", stroke: C.rust, "stroke-width": 1.6, "stroke-dasharray": "3 4" }),
    rect(cx - r * 0.45, cy - 4, r * 0.9, 8, { rx: 3, fill: C.rust }),
  );
}

/** A leafy sprig (cut paper): a stem with alternating leaves. */
export function sprig(base: P, len: number, deg: number, fill: string): string {
  const leaves: string[] = [];
  const count = 7;
  for (let i = 0; i < count; i += 1) {
    const t = (i + 1) / (count + 1);
    const y = -len * t;
    const side = i % 2 === 0 ? 1 : -1;
    const lw = len * 0.16 * (1 - t * 0.45);
    const lh = lw * 0.42;
    const tip: P = [side * lw * 1.9, y - lw * 0.9];
    leaves.push(
      path(`M0,${y.toFixed(1)}Q${(side * lw).toFixed(1)},${(y - lh * 2.2).toFixed(1)} ${tip[0].toFixed(1)},${tip[1].toFixed(1)}Q${(side * lw * 0.7).toFixed(1)},${(y + lh * 0.6).toFixed(1)} 0,${y.toFixed(1)}Z`),
    );
  }
  leaves.push(path(`M0,${(-len - 6).toFixed(1)}Q${(len * 0.1).toFixed(1)},${(-len - len * 0.18).toFixed(1)} 0,${(-len - len * 0.3).toFixed(1)}Q${(-len * 0.1).toFixed(1)},${(-len - len * 0.18).toFixed(1)} 0,${(-len - 6).toFixed(1)}Z`));
  return g(
    { transform: `translate(${base[0]} ${base[1]}) rotate(${deg})` },
    path(`M0,0Q${(len * 0.05).toFixed(1)},${(-len * 0.5).toFixed(1)} 0,${(-len - 6).toFixed(1)}`, { fill: "none", stroke: C.green2, "stroke-width": 3, "stroke-linecap": "round" }),
    g({ fill, stroke: C.forest, "stroke-width": 1.6, "stroke-linejoin": "round" }, ...leaves),
  );
}
