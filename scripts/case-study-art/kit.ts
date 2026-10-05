/**
 * TASK-130 · shared helpers for the case-study art (hand-authored SVG, no generation). Colour
 * literals live only in these generated files under public/ — the site's TS/TSX/CSS never carries
 * one (EVAL-020). The paper palette below mirrors the 13 tokens in app/globals.css (Design.md §2.1).
 */
export const INK = {
  paper: "#F7F1E7",
  ivory: "#FBF7EF",
  paper2: "#EFE7D8",
  navy: "#0D1735",
  navy2: "#2E3854",
  inkSoft: "#5A6178",
  rust: "#B64927",
  terracotta: "#92381F",
  forest: "#214F43",
  green2: "#496D58",
  steel: "#63799E",
  note: "#EEDCA9",
  kraft: "#D7BE93",
} as const;

export interface Asset {
  /** File name under public/media/case-studies/<slug>/ */
  file: string;
  svg: string;
}

/** A rough "inked stamp" filter: a little turbulence displacement plus speckled ink loss. */
export function stampFilter(id: string, seed = 3): string {
  return `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" result="d"/><feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="1" seed="${seed + 7}" result="m"/><feColorMatrix in="m" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.75" result="mask"/><feComposite in="d" in2="mask" operator="in"/></filter>`;
}

/** Text laid on a circle (for round stamps). `r` is the baseline radius. */
export function ringText(id: string, cx: number, cy: number, r: number, text: string, attrs: string): string {
  const path = `M ${cx - r},${cy} a ${r},${r} 0 1,1 ${2 * r},0 a ${r},${r} 0 1,1 ${-2 * r},0`;
  return `<path id="${id}" d="${path}" fill="none"/><text ${attrs}><textPath href="#${id}" startOffset="0">${text}</textPath></text>`;
}

export function svg(w: number, h: number, body: string, title = ""): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"${title ? ` role="img"` : ` aria-hidden="true"`}>${body}</svg>\n`;
}
