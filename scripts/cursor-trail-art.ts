/**
 * cursor-trail-art.ts (TASK-142.1) — draws the eight Paper Trail pieces as small inline-SVG paper
 * cut-outs (torn edge, soft layered shadow edge, ink marks) into `public/cursor/trail/`.
 * Run: `pnpm tsx scripts/cursor-trail-art.ts`. Output is committed; this is the source of truth.
 * Higgsfield pieces could not be pulled into the build sandbox (cloudfront denied) — see TASK-142 report.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const INK = "#1c2340"; // navy ink
const RUST = "#b4532f"; // terracotta
const CREAM = "#f6efe0";
const CREAM_EDGE = "#e4d7bd";
const NOTE = "#f1d98a";
const OCHRE = "#d2a24c";
const BLUE = "#dde8ee";

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

/** A rectangle-ish outline whose edges are subdivided and jittered, like a hand-torn scrap. */
function torn(x: number, y: number, w: number, h: number, seed: number, jitter = 3.2): string {
  const r = rng(seed);
  const pts: string[] = [];
  const step = 11;
  const j = () => (r() - 0.5) * 2 * jitter;
  for (let i = 0; i <= w; i += step) pts.push(`${(x + Math.min(i, w) + j() * 0.3).toFixed(1)},${(y + j()).toFixed(1)}`);
  for (let i = step; i <= h; i += step) pts.push(`${(x + w + j()).toFixed(1)},${(y + Math.min(i, h) + j() * 0.3).toFixed(1)}`);
  for (let i = w - step; i >= 0; i -= step) pts.push(`${(x + i + j() * 0.3).toFixed(1)},${(y + h + j()).toFixed(1)}`);
  for (let i = h - step; i > 0; i -= step) pts.push(`${(x + j()).toFixed(1)},${(y + i + j() * 0.3).toFixed(1)}`);
  return pts.join(" ");
}

function paper(x: number, y: number, w: number, h: number, seed: number, fill: string, edge: string): string {
  const p = torn(x, y, w, h, seed);
  // an offset darker copy under the sheet reads as the paper's thickness / shadow edge
  return `<polygon points="${p}" fill="${edge}" transform="translate(2.5 3.5)"/><polygon points="${p}" fill="${fill}" stroke="${edge}" stroke-width="1"/>`;
}

const svg = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</svg>\n`;

const pieces: Record<string, string> = {
  paw: svg(
    paper(24, 24, 150, 150, 11, CREAM, CREAM_EDGE) +
      `<g fill="${RUST}" stroke="${INK}" stroke-width="3"><path d="M100 96c-18 0-34 20-34 36 0 12 10 16 20 14 8-2 10-3 14-3s6 1 14 3c10 2 20-2 20-14 0-16-16-36-34-36z"/><ellipse cx="68" cy="84" rx="9" ry="12" transform="rotate(-18 68 84)"/><ellipse cx="88" cy="68" rx="9" ry="13" transform="rotate(-6 88 68)"/><ellipse cx="112" cy="68" rx="9" ry="13" transform="rotate(6 112 68)"/><ellipse cx="132" cy="84" rx="9" ry="12" transform="rotate(18 132 84)"/></g>`,
  ),
  "rail-ticket": svg(
    paper(16, 50, 168, 100, 23, CREAM, CREAM_EDGE) +
      `<g stroke="${INK}" stroke-width="2.5"><path d="M30 78h70M30 94h54M30 110h62M30 126h40"/><path d="M118 70l40 0M118 82l40 0" opacity=".6"/></g><g fill="${CREAM_EDGE}" stroke="${INK}" stroke-width="1.5"><circle cx="24" cy="100" r="5"/><circle cx="176" cy="100" r="5"/></g><circle cx="140" cy="116" r="20" stroke="${RUST}" stroke-width="3"/><circle cx="140" cy="116" r="13" stroke="${RUST}" stroke-width="1.5"/><path d="M132 116l6 6 11-12" stroke="${RUST}" stroke-width="3"/>`,
  ),
  sticky: svg(
    paper(30, 28, 140, 144, 37, NOTE, "#cfb56a") +
      `<g stroke="${INK}" stroke-width="3"><path d="M52 66c10-8 14 8 24 0s14 8 24 0 14 8 24 0"/><path d="M52 92h22M52 114h18M52 136h26" opacity=".85"/><path d="M82 92l4 4 8-9M78 114l4 4 8-9"/></g><path d="M52 154c24-10 56 6 96-4" stroke="${RUST}" stroke-width="4"/>`,
  ),
  "arcade-token": svg(
    `<circle cx="102" cy="104" r="72" fill="#a9792a"/><circle cx="100" cy="100" r="72" fill="${OCHRE}" stroke="${INK}" stroke-width="3.5"/><circle cx="100" cy="100" r="56" stroke="${INK}" stroke-width="2" stroke-dasharray="3 5"/><path d="M100 64l9 22 24 2-18 16 6 24-21-13-21 13 6-24-18-16 24-2z" fill="${RUST}" stroke="${INK}" stroke-width="3"/>`,
  ),
  "research-paper": svg(
    paper(32, 22, 136, 156, 51, CREAM, CREAM_EDGE) +
      `<g stroke="${INK}" stroke-width="2.5"><path d="M50 50h50M50 62h70"/><path d="M52 150V98M52 150h96"/><path d="M64 150v-26M80 150v-38M96 150v-18M112 150v-34" stroke-width="7"/><path d="M58 112l24-14 22 12 36-26" stroke="${INK}"/></g><circle cx="140" cy="84" r="9" stroke="${RUST}" stroke-width="3"/><path d="M130 48l16 8" stroke="${RUST}" stroke-width="3"/>`,
  ),
  wireframe: svg(
    paper(22, 30, 156, 140, 67, BLUE, "#b9c9d3") +
      `<g stroke="#9fb3c0" stroke-width="1"><path d="M22 60h156M22 90h156M22 120h156M22 150h156M52 30v140M82 30v140M112 30v140M142 30v140"/></g><g stroke="${INK}" stroke-width="2.5"><rect x="40" y="48" width="120" height="22" rx="3"/><rect x="40" y="82" width="52" height="60" rx="3"/><path d="M104 88h56M104 104h40M104 120h48"/></g><rect x="108" y="130" width="40" height="14" rx="3" stroke="${RUST}" stroke-width="3"/><path d="M168 152l-14-8" stroke="${RUST}" stroke-width="3"/>`,
  ),
  lightbulb: svg(
    `<g stroke="${RUST}" stroke-width="5"><path d="M100 18v16M44 42l12 12M156 42l-12 12M26 94h16M158 94h16"/></g><path d="M102 52c-30 0-48 22-48 46 0 18 10 28 20 40v12h56v-12c10-12 20-22 20-40 0-24-18-46-48-46z" fill="#c9962f" transform="translate(2.5 3.5)"/><path d="M100 50c-30 0-48 22-48 46 0 18 10 28 20 40v12h56v-12c10-12 20-22 20-40 0-24-18-46-48-46z" fill="${NOTE}" stroke="${INK}" stroke-width="3.5"/><path d="M80 150h40M84 164h32" stroke="${INK}" stroke-width="3.5"/><path d="M84 112c6-12 10 4 16-8s10 6 16-4" stroke="${INK}" stroke-width="2.5"/>`,
  ),
  "paper-arrow": svg(
    paper(14, 62, 172, 76, 83, CREAM, CREAM_EDGE) +
      `<path d="M34 100c30-6 70 4 118-2" stroke="${INK}" stroke-width="4"/><path d="M134 80l26 18-24 22" stroke="${INK}" stroke-width="4"/><path d="M30 124c20 4 40-2 58 2" stroke="${RUST}" stroke-width="3.5"/>`,
  ),
};

const out = resolve(process.cwd(), "public/cursor/trail");
mkdirSync(out, { recursive: true });
for (const [name, body] of Object.entries(pieces)) writeFileSync(resolve(out, `${name}.svg`), body);
console.log(`wrote ${Object.keys(pieces).length} trail pieces to ${out}`);
