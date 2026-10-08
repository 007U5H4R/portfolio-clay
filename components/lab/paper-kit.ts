import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  ExtrudeGeometry,
  MeshBasicMaterial,
  SRGBColorSpace,
  Shape,
  type ColorRepresentation,
} from "three";
import { mix, type CandyPalette, type RGB } from "@/lib/lab/tokens";
import { col } from "./materials";

/**
 * The paper-machine kit (TASK-185): small builders the machine's parts share. Everything here is procedural, nothing is
 * fetched: shapes become layered extruded cardstock, the table's painted landscape and the soft light sprites are drawn
 * once on a canvas, and every colour is mixed from the site's role tokens (Design.md; the spec's hexes were only
 * approximations of them). Browser only (canvas textures).
 */

/** Deterministic random numbers so the art is the same every visit (and the same in a screenshot). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const css = (c: RGB, a = 1) => `color(srgb ${c[0].toFixed(4)} ${c[1].toFixed(4)} ${c[2].toFixed(4)}${a < 1 ? ` / ${a}` : ""})`;
export const cssColor = css;

/**
 * The light accents (spec §4–6): warm amber, cool cyan, soft magenta and warm white, mixed from the paper tokens and
 * lifted toward white so they read as light against the cardstock. They are accents, never surfaces.
 */
export interface Neon {
  amber: Color;
  cyan: Color;
  magenta: Color;
  white: Color;
  amberRGB: RGB;
  cyanRGB: RGB;
  magentaRGB: RGB;
  whiteRGB: RGB;
}
export function neonColors(p: CandyPalette): Neon {
  const lift = (c: RGB, t: number): RGB => mix(c, [1, 1, 1], t);
  // Scale a colour so its brightest channel is full: a saturated light of the token's own hue, not a pale tint of it.
  const glow = (c: RGB): RGB => {
    const m = Math.max(c[0], c[1], c[2], 0.001);
    return [c[0] / m, c[1] / m, c[2] / m];
  };
  const { rust, note, steel, sage } = p.tok;
  const amberRGB = glow(mix(rust, note, 0.34));
  const cyanRGB = lift(glow(mix(steel, sage, 0.5)), 0.12);
  // magenta: the rust's red and the steel's blue, with the steel's green held low
  const magentaRGB = lift(glow([rust[0], steel[1] * 0.55, steel[2]]), 0.18);
  const whiteRGB = lift(note, 0.7);
  return { amber: col(amberRGB), cyan: col(cyanRGB), magenta: col(magentaRGB), white: col(whiteRGB), amberRGB, cyanRGB, magentaRGB, whiteRGB };
}

/** A radial-gradient "light spill" sprite: white at the centre falling to nothing (tinted by the material colour). */
export function glowTexture(size = 128, falloff = 2.2): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (let i = 0; i <= 8; i += 1) {
    const t = i / 8;
    grad.addColorStop(t, `color(srgb 1 1 1 / ${Math.pow(1 - t, falloff).toFixed(3)})`);
  }
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

/** An additive, unlit light material: the spill on nearby paper and the bloom around a light tube. */
export function glowMaterial(color: ColorRepresentation, map: CanvasTexture | null, opacity: number): MeshBasicMaterial {
  return new MeshBasicMaterial({ color, map, transparent: true, opacity, blending: AdditiveBlending, depthWrite: false, toneMapped: false });
}

/** Rounded-rectangle outline centred on the origin. */
export function roundedRect(w: number, h: number, r: number): Shape {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  const rr = Math.min(r, w / 2, h / 2);
  s.moveTo(x + rr, y);
  s.lineTo(x + w - rr, y);
  s.quadraticCurveTo(x + w, y, x + w, y + rr);
  s.lineTo(x + w, y + h - rr);
  s.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  s.lineTo(x + rr, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - rr);
  s.lineTo(x, y + rr);
  s.quadraticCurveTo(x, y, x + rr, y);
  return s;
}

export function starShape(r: number, inner = 0.45, points = 5): Shape {
  const s = new Shape();
  for (let i = 0; i < points * 2; i += 1) {
    const rad = i % 2 === 0 ? r : r * inner;
    const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
    if (i === 0) s.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
    else s.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  s.closePath();
  return s;
}

/** A sheet of cardstock: the shape pushed out `depth` with a hair of bevel so its edge catches the light. */
export function sheet(shape: Shape, depth: number, bevel = 0.025): ExtrudeGeometry {
  return new ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: 10 });
}

/** A flipper's outline: a round hub at the pivot tapering to a smaller round tip, along +x. */
export function flipperShape(len: number, rHub: number, rTip: number): Shape {
  const s = new Shape();
  const ang = Math.asin((rHub - rTip) / len);
  s.absarc(0, 0, rHub, Math.PI / 2 + ang, -Math.PI / 2 - ang, false);
  s.absarc(len, 0, rTip, -Math.PI / 2 - ang, Math.PI / 2 + ang, false);
  s.closePath();
  return s;
}

/** A layered paper pine: three stacked triangles, each one a little narrower and further forward. Base at y = 0. */
export function pineShapes(w: number, h: number): Shape[] {
  const out: Shape[] = [];
  for (let i = 0; i < 3; i += 1) {
    const k = 1 - i * 0.24;
    const y0 = h * (0.12 + i * 0.27);
    const s = new Shape();
    s.moveTo(-w * 0.5 * k, y0);
    s.lineTo(0, y0 + h * 0.5 * k);
    s.lineTo(w * 0.5 * k, y0);
    s.closePath();
    out.push(s);
  }
  return out;
}

/** A torn outline: a circle whose radius wobbles (the black hole's paper tear). */
export function tornCircle(r: number, wobble: number, seed: number, n = 56): Shape {
  const rand = rng(seed);
  const s = new Shape();
  let k = 0;
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    k += (rand() - 0.5) * wobble;
    k *= 0.7;
    const rr = r * (1 + k + (i % 2 === 0 ? 0.02 : -0.02));
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}

/** Font families resolved from the site's CSS variables (they hold the next/font names), with a safe fallback. */
export function siteFont(which: "display" | "body"): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(which === "display" ? "--font-display" : "--font-body").trim();
  return v || (which === "display" ? "Georgia, serif" : "system-ui, sans-serif");
}

/**
 * A canvas texture whose text is redrawn once the site fonts are ready (so Fraunces / Inter land even when the lab opens
 * before they have been fetched). `draw` paints the whole canvas; call `redraw()` to repaint (e.g. a percentage changed).
 */
export function textTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  let alive = true;
  const redraw = () => {
    if (!alive) return;
    g.clearRect(0, 0, w, h);
    draw(g, w, h);
    tex.needsUpdate = true;
  };
  redraw();
  void document.fonts?.ready.then(redraw);
  return {
    tex,
    redraw,
    dispose() {
      alive = false;
      tex.dispose();
    },
  };
}

/** Table geometry the painted board needs. */
export interface BoardSpec {
  x0: number;
  y0: number;
  w: number;
  h: number;
}

/**
 * The table's painted landscape (spec §3): a cream board with a warm sun, three ranges of layered cut-paper hills with
 * soft contact shadows, tiny pines, the chevrons that point up the table and a paper-fibre grain. Drawn once.
 */
export function paintBoard(palette: CandyPalette, spec: BoardSpec, px = 1024): CanvasTexture {
  const { tok, isDark } = palette;
  const cw = px;
  const ch = Math.round(px * (spec.h / spec.w));
  const c = document.createElement("canvas");
  c.width = cw;
  c.height = ch;
  const g = c.getContext("2d")!;
  const rand = rng(1851);
  const lift = (a: RGB, b: RGB, t: number) => mix(a, b, t);
  const base = isDark ? lift(tok.ivory, tok.steel, 0.12) : lift(tok.ivory, tok.kraft, 0.4);

  g.fillStyle = css(base);
  g.fillRect(0, 0, cw, ch);

  // a dusk-blue sky washing down from the top into the cream
  const sky = g.createLinearGradient(0, 0, 0, ch * 0.5);
  sky.addColorStop(0, css(lift(base, tok.steel, isDark ? 0.4 : 0.34), 0.95));
  sky.addColorStop(1, css(base, 0));
  g.fillStyle = sky;
  g.fillRect(0, 0, cw, ch * 0.5);

  // the sun, behind the top bumper
  const sunX = cw * 0.5;
  const sunY = ch * 0.17;
  g.fillStyle = css(lift(tok.note, tok.rust, isDark ? 0.5 : 0.22), 0.95);
  g.beginPath();
  g.arc(sunX, sunY, cw * 0.1, 0, Math.PI * 2);
  g.fill();

  // paper-cut hills: jagged ridges, each with its own contact shadow
  const ridge = (yBase: number, amp: number, step: number, colr: RGB, shadow: number) => {
    g.save();
    g.shadowColor = css(tok.navy, shadow);
    g.shadowBlur = cw * 0.012;
    g.shadowOffsetX = cw * 0.004;
    g.shadowOffsetY = cw * 0.008;
    g.fillStyle = css(colr);
    g.beginPath();
    g.moveTo(-10, ch + 10);
    g.lineTo(-10, yBase);
    for (let x = 0; x <= cw + step; x += step) {
      const peak = Math.floor(x / step) % 2 === 0;
      g.lineTo(x, yBase - (peak ? amp * (0.55 + rand() * 0.45) : amp * rand() * 0.25));
    }
    g.lineTo(cw + 10, ch + 10);
    g.closePath();
    g.fill();
    g.restore();
  };
  ridge(ch * 0.4, ch * 0.085, cw * 0.11, lift(tok.steel, base, isDark ? 0.55 : 0.58), 0.1);
  ridge(ch * 0.55, ch * 0.09, cw * 0.1, lift(tok.sage, base, isDark ? 0.5 : 0.5), 0.12);
  ridge(ch * 0.72, ch * 0.1, cw * 0.13, lift(tok.terracotta, base, isDark ? 0.45 : 0.55), 0.14);
  ridge(ch * 0.88, ch * 0.09, cw * 0.09, lift(tok.rust, base, isDark ? 0.5 : 0.62), 0.14);

  // pines, thickest toward the edges where the gameplay isn't
  const pine = (x: number, y: number, s: number, colr: RGB) => {
    g.save();
    g.shadowColor = css(tok.navy, 0.18);
    g.shadowBlur = s * 0.2;
    g.shadowOffsetY = s * 0.12;
    g.fillStyle = css(colr);
    for (let i = 0; i < 3; i += 1) {
      const k = 1 - i * 0.24;
      const y0 = y - s * (0.12 + i * 0.27);
      g.beginPath();
      g.moveTo(x - s * 0.34 * k, y0);
      g.lineTo(x, y0 - s * 0.5 * k);
      g.lineTo(x + s * 0.34 * k, y0);
      g.closePath();
      g.fill();
    }
    g.restore();
  };
  for (let i = 0; i < 70; i += 1) {
    const edge = rand() < 0.65;
    const x = edge ? (rand() < 0.5 ? rand() * cw * 0.2 : cw * (0.8 + rand() * 0.2)) : rand() * cw;
    const y = ch * (0.3 + rand() * 0.68);
    pine(x, y, cw * (0.04 + rand() * 0.035), lift(tok.forest, tok.sage, 0.2 + rand() * 0.5));
  }

  // chevrons pointing up the table, down the middle
  g.fillStyle = css(lift(tok.terracotta, base, 0.35), 0.55);
  for (let i = 0; i < 4; i += 1) {
    const cx = cw * 0.5;
    const cy = ch * (0.7 - i * 0.065);
    const s = cw * (0.034 - i * 0.002);
    g.beginPath();
    g.moveTo(cx - s, cy + s * 0.5);
    g.lineTo(cx, cy - s * 0.8);
    g.lineTo(cx + s, cy + s * 0.5);
    g.lineTo(cx, cy + s * 0.1);
    g.closePath();
    g.fill();
  }

  // fibres and grain
  for (let i = 0; i < 520; i += 1) {
    g.strokeStyle = css(rand() < 0.5 ? tok.navy : tok.kraft, 0.045 + rand() * 0.04);
    g.lineWidth = 0.6 + rand() * 0.8;
    const x = rand() * cw;
    const y = rand() * ch;
    const a = rand() * Math.PI;
    const l = 4 + rand() * 12;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }

  // a soft vignette so the table sinks into its cabinet
  const vg = g.createRadialGradient(cw / 2, ch * 0.5, cw * 0.3, cw / 2, ch * 0.5, cw * 0.85);
  vg.addColorStop(0, css(tok.navy, 0));
  vg.addColorStop(1, css(tok.navy, isDark ? 0.4 : 0.22));
  g.fillStyle = vg;
  g.fillRect(0, 0, cw, ch);

  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Merge helper result type for callers that want to dispose a list of geometries. */
export const disposeAll = (items: ({ dispose(): void } | null | undefined)[]) => items.forEach((i) => i?.dispose());

export type { BufferGeometry };
