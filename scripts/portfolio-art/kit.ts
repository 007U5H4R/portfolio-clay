/**
 * The shared print kit for the `/projects` product covers (TASK-127). Every cover scene is a
 * hand-authored 1600 × 900 SVG composition built from these helpers, so the twelve covers share one
 * packaging grammar and one illustration style:
 *
 *   - a calm top band (sky / wall) where the HTML title lettering sits, the subject in the
 *     centre-left third (the 5:6 cover crop), story props on the right (seen on the 16:9 stage),
 *   - flat printed colour with ink keylines on the foreground, lighter unlined shapes behind
 *     (atmospheric depth), one warm light source,
 *   - halftone dot shading (`#ht`, `#hs`, `#hl` patterns) and a two-tone print grain (`#grain`).
 *
 * Colour lives only in these generated SVG files (public/, outside the EVAL-020 scan); the site's
 * TS/TSX/CSS never carries a literal. No text, logos or trademarks are drawn — titles stay HTML.
 */

export const W = 1600;
export const H = 900;

export type P = readonly [number, number];
type Attrs = Record<string, string | number | undefined>;

/** Numbers at one decimal — the art never needs more, and it keeps every file small. */
export function n(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

export const pt = ([x, y]: P): string => `${n(x)},${n(y)}`;
export const pts = (points: readonly P[]): string => points.map(pt).join(" ");
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const mix = (a: P, b: P, t: number): P => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

function attrs(values: Attrs): string {
  return Object.entries(values)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => ` ${key}="${typeof value === "number" ? n(value) : value}"`)
    .join("");
}

export function el(tag: string, values: Attrs = {}, children?: string): string {
  return children === undefined ? `<${tag}${attrs(values)}/>` : `<${tag}${attrs(values)}>${children}</${tag}>`;
}

export const g = (values: Attrs, ...children: string[]): string => el("g", values, children.join(""));
export const path = (d: string, values: Attrs = {}): string => el("path", { d, ...values });
export const poly = (points: readonly P[], values: Attrs = {}): string => el("polygon", { points: pts(points), ...values });
export const polyline = (points: readonly P[], values: Attrs = {}): string =>
  el("polyline", { points: pts(points), fill: "none", ...values });
export const rect = (x: number, y: number, w: number, h: number, values: Attrs = {}): string =>
  el("rect", { x, y, width: w, height: h, ...values });
export const circle = (cx: number, cy: number, r: number, values: Attrs = {}): string => el("circle", { cx, cy, r, ...values });
export const ellipse = (cx: number, cy: number, rx: number, ry: number, values: Attrs = {}): string =>
  el("ellipse", { cx, cy, rx, ry, ...values });
export const line = (a: P, b: P, values: Attrs = {}): string =>
  el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], ...values });

/** Cubic segments of a Catmull-Rom spline through `points` (smooth silhouettes, clouds, hills). */
function splineSegments(points: readonly P[], closed: boolean, tension: number): string {
  const count = points.length;
  const at = (i: number): P => {
    if (closed) return points[((i % count) + count) % count]!;
    return points[Math.max(0, Math.min(count - 1, i))]!;
  };
  const segments: string[] = [];
  const last = closed ? count : count - 1;
  for (let i = 0; i < last; i += 1) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1: P = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2: P = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    segments.push(`C${pt(c1)} ${pt(c2)} ${pt(p2)}`);
  }
  return segments.join("");
}

/** A smooth path through `points`; closed shapes loop back to the start. */
export function smooth(points: readonly P[], closed = false, tension = 1): string {
  const first = points[0];
  if (!first) return "";
  return `M${pt(first)}${splineSegments(points, closed, tension)}${closed ? "Z" : ""}`;
}

/** A ridge (hills, mesas, a treeline edge): a smooth top through `points`, closed down to `baseY`. */
export function ridge(points: readonly P[], baseY: number, tension = 1): string {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return "";
  return `M${n(first[0])},${n(baseY)}L${pt(first)}${splineSegments(points, false, tension)}L${n(last[0])},${n(baseY)}Z`;
}

/** A conifer silhouette in three jagged tiers, trunk hidden (for treelines and framing trees). */
export function pine(x: number, baseY: number, h: number, w: number, values: Attrs): string {
  const tiers: P[] = [];
  const steps = 3;
  for (let i = 0; i < steps; i += 1) {
    const top = baseY - h + (h * i) / (steps + 0.4);
    const bottom = baseY - h + (h * (i + 1.35)) / (steps + 0.4);
    const half = (w / 2) * ((i + 1.1) / steps);
    tiers.push([x - half, bottom], [x - half * 0.38, top + (bottom - top) * 0.34]);
  }
  const left = tiers;
  const right = tiers.map(([px, py]) => [2 * x - px, py] as P).reverse();
  return poly([[x, baseY - h], ...left, [x - w * 0.05, baseY], [x + w * 0.05, baseY], ...right], values);
}

/** A regular star / spark (`points` tips) — chalk stars, sparkles. */
export function star(cx: number, cy: number, outer: number, inner: number, points = 5, rotate = -90): P[] {
  const out: P[] = [];
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = ((rotate + (i * 180) / points) * Math.PI) / 180;
    out.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return out;
}

type Stop = readonly [offset: number, color: string, opacity?: number];

function stops(list: readonly Stop[]): string {
  return list
    .map(([offset, color, opacity]) => el("stop", { offset, "stop-color": color, "stop-opacity": opacity }))
    .join("");
}

/** A linear gradient in object space (default: top → bottom). */
export function linear(id: string, list: readonly Stop[], x1 = 0, y1 = 0, x2 = 0, y2 = 1): string {
  return el("linearGradient", { id, x1, y1, x2, y2 }, stops(list));
}

/** A linear gradient in user space (for gradients shared across shapes, e.g. a light beam). */
export function linearUser(id: string, list: readonly Stop[], a: P, b: P): string {
  return el("linearGradient", { id, gradientUnits: "userSpaceOnUse", x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, stops(list));
}

/** A radial gradient in object space. */
export function radial(id: string, list: readonly Stop[], cx = 0.5, cy = 0.5, r = 0.5): string {
  return el("radialGradient", { id, cx, cy, r }, stops(list));
}

/** A radial glow in user space — light sources (lamps, suns, headlights, fires). */
export function glow(id: string, color: string, center: P, r: number, peak = 0.7): string {
  return el(
    "radialGradient",
    { id, gradientUnits: "userSpaceOnUse", cx: center[0], cy: center[1], r },
    stops([
      [0, color, peak],
      [0.45, color, peak * 0.35],
      [1, color, 0],
    ]),
  );
}

/** sRGB 0–1 channels for a `#rrggbb` colour (feColorMatrix needs numbers). */
function channels(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const at = (i: number) => Math.round((parseInt(value.slice(i, i + 2), 16) / 255) * 1000) / 1000;
  return [at(0), at(2), at(4)];
}

/**
 * The print kit every scene shares: three halftone dot screens (45°, like a 90s four-colour print —
 * `#ht` coarse ink dots, `#hs` fine ink dots, `#hl` light dots) and the two-tone print grain
 * (`#grain`: sparse ink specks + sparse light specks from one fractal noise).
 */
export function printDefs(ink: string, light: string, seed: number): string {
  const [ir, ig, ib] = channels(ink);
  const [lr, lg, lb] = channels(light);
  return [
    `<pattern id="ht" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="7" cy="7" r="2.6" fill="${ink}"/></pattern>`,
    `<pattern id="hs" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="4.5" cy="4.5" r="1.5" fill="${ink}"/></pattern>`,
    `<pattern id="hl" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="7" cy="7" r="2.4" fill="${light}"/></pattern>`,
    `<filter id="grain" x="0" y="0" width="${W}" height="${H}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">` +
      `<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${seed}" stitchTiles="stitch" result="n"/>` +
      `<feColorMatrix in="n" result="d" values="0 0 0 0 ${ir} 0 0 0 0 ${ig} 0 0 0 0 ${ib} -4.2 0 0 0 1.72"/>` +
      `<feColorMatrix in="n" result="l" values="0 0 0 0 ${lr} 0 0 0 0 ${lg} 0 0 0 0 ${lb} 4.2 0 0 0 -2.5"/>` +
      `<feMerge><feMergeNode in="d"/><feMergeNode in="l"/></feMerge></filter>`,
    radial("vig", [
      [0.55, ink, 0],
      [1, ink, 0.42],
    ], 0.5, 0.46, 0.75),
  ].join("");
}

/** The print finish laid over every scene: grain, then a soft vignette (the printed-card edge). */
export function printFinish(grainOpacity = 0.55, vignette = 1): string {
  return rect(0, 0, W, H, { filter: "url(#grain)", opacity: grainOpacity }) + rect(0, 0, W, H, { fill: "url(#vig)", opacity: vignette });
}

/** The SVG document. `width`/`height` give `<img>` its intrinsic 16:9 size for `object-fit`. */
export function svg(defs: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${defs}</defs>${body}</svg>`;
}

export interface Scene {
  slug: string;
  render(): string;
}
