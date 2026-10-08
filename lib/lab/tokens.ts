/**
 * Role tokens → linear-ish RGB floats for the WebGL scene (Design.md §13, D13). The lab's 3D colours
 * are derived from the 13 paper tokens on `<html>` (so light/dark follow `data-theme` and no colour
 * literal enters code, EVAL-020): each token is resolved by the browser (it understands oklch) via a
 * 1×1 canvas, then mixed in JS. Browser only.
 */
export type RGB = [number, number, number];

let ctx: CanvasRenderingContext2D | null = null;

export function readToken(name: string, el: Element = document.documentElement): RGB {
  const css = getComputedStyle(el).getPropertyValue(name).trim();
  if (!ctx) {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    ctx = c.getContext("2d", { willReadFrequently: true });
  }
  if (!ctx || !css) return [0.5, 0.5, 0.5];
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
}

export function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function luminance(c: RGB): number {
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export interface CandyPalette {
  cream: RGB;
  peach: RGB;
  pink: RGB;
  orange: RGB;
  cyan: RGB;
  mint: RGB;
  jelly: RGB;
  ink: RGB;
  /** The darkest of paper/navy in the active theme: the bear's face, readable either way. */
  face: RGB;
  top: RGB;
  bottom: RGB;
  /** The soft centre light behind the bear. */
  glow: RGB;
  gold: RGB;
  isDark: boolean;
  /** The raw role tokens the machine's paper art and light accents are mixed from (TASK-185). */
  tok: { paper: RGB; ivory: RGB; navy: RGB; rust: RGB; terracotta: RGB; steel: RGB; forest: RGB; sage: RGB; note: RGB; kraft: RGB };
}

/** The cream / peach / blush / candy-orange / pastel cyan palette (§29) built from the paper tokens. */
export function readPalette(): CandyPalette {
  const paper = readToken("--color-paper");
  const ivory = readToken("--color-ivory");
  const kraft = readToken("--color-kraft");
  const rust = readToken("--color-rust");
  const note = readToken("--color-note");
  const steel = readToken("--color-steel");
  const green = readToken("--color-green-2");
  const forest = readToken("--color-forest");
  const kraftTok = kraft;
  const navy = readToken("--color-navy");
  const terracotta = readToken("--color-terracotta");
  const isDark = luminance(paper) < 0.3;
  const lift = (c: RGB, t: number) => mix(c, isDark ? [0.2, 0.16, 0.26] : [1, 1, 1], t);
  const orange = isDark ? mix(rust, [1, 0.85, 0.7], 0.14) : mix(rust, note, 0.34);
  return {
    cream: mix(ivory, kraft, isDark ? 0.1 : 0.22),
    peach: isDark ? mix(rust, [1, 0.85, 0.7], 0.4) : lift(mix(rust, kraft, 0.45), 0.1),
    pink: lift(mix(rust, steel, 0.22), isDark ? 0 : 0.34),
    orange,
    cyan: lift(mix(steel, green, 0.45), isDark ? 0 : 0.22),
    mint: lift(green, isDark ? 0 : 0.22),
    jelly: mix(rust, terracotta, isDark ? 0 : 0.35),
    ink: navy,
    face: mix(luminance(paper) < luminance(navy) ? paper : navy, rust, 0.18),
    top: isDark ? mix(paper, steel, 0.16) : mix(ivory, kraft, 0.22),
    bottom: isDark ? mix(paper, rust, 0.09) : mix(ivory, rust, 0.22),
    glow: isDark ? mix(steel, rust, 0.3) : mix(rust, kraft, 0.45),
    gold: mix(note, rust, isDark ? 0.2 : 0.18),
    isDark,
    tok: { paper, ivory, navy, rust, terracotta, steel, forest, sage: green, note, kraft: kraftTok },
  };
}
