/**
 * TASK-130 journal scenes · canvas helpers for the hand-authored hero scenes, built on the TASK-127
 * portfolio-art kit (same pen, same halftone and grain), but at a scene's own size instead of the
 * kit's fixed 1600 × 900 cover canvas.
 */
import { rect, radial } from "../portfolio-art/kit";

function channels(hex: string): [string, string, string] {
  const v = hex.replace("#", "");
  return [0, 2, 4].map((i) => (parseInt(v.slice(i, i + 2), 16) / 255).toFixed(3)) as [string, string, string];
}

/** Halftone patterns + a grain filter + a vignette, sized to the scene. */
export function sceneDefs(ink: string, light: string, seed: number, w: number, h: number): string {
  const [ir, ig, ib] = channels(ink);
  const [lr, lg, lb] = channels(light);
  return [
    `<pattern id="ht" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="7" cy="7" r="2.6" fill="${ink}"/></pattern>`,
    `<pattern id="hs" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="4.5" cy="4.5" r="1.5" fill="${ink}"/></pattern>`,
    `<filter id="grain" x="0" y="0" width="${w}" height="${h}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">` +
      `<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${seed}" stitchTiles="stitch" result="n"/>` +
      `<feColorMatrix in="n" result="d" values="0 0 0 0 ${ir} 0 0 0 0 ${ig} 0 0 0 0 ${ib} -4.2 0 0 0 1.72"/>` +
      `<feColorMatrix in="n" result="l" values="0 0 0 0 ${lr} 0 0 0 0 ${lg} 0 0 0 0 ${lb} 4.2 0 0 0 -2.5"/>` +
      `<feMerge><feMergeNode in="d"/><feMergeNode in="l"/></feMerge></filter>`,
    radial("vig", [
      [0.55, ink, 0],
      [1, ink, 0.4],
    ], 0.5, 0.46, 0.78),
  ].join("");
}

export function sceneFinish(w: number, h: number, grain = 0.22, vignette = 0.85): string {
  return rect(0, 0, w, h, { filter: "url(#grain)", opacity: grain }) + rect(0, 0, w, h, { fill: "url(#vig)", opacity: vignette });
}

/** Decorative scene: aria-hidden (the page's own HTML carries every fact; the real UI is an <img>). */
export function sceneSvg(w: number, h: number, defs: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><defs>${defs}</defs>${body}</svg>\n`;
}
