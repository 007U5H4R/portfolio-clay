import { circle, el, g, line, linear, path, rect, type P } from "../../portfolio-art/kit";
import type { Asset } from "../kit";
import { sceneDefs, sceneFinish, sceneSvg } from "../scene-kit";

/**
 * TASK-130 journal · Velora hero scene (Tushar's redesign brief §35): a fashion-sourcing studio
 * moodboard — linen board with a stitched border, fabric swatches cut with pinking shears, a thread
 * spool whose loose thread runs across the board, a hanging sample tag, an RFP form and a bid sheet,
 * a measuring tape. The page lays the REAL screens on top: the killed Nuptis dashboard (struck, torn)
 * on the left, Velora's phones on the right. No passport wording (Vendor Passport is not a product).
 * Decorative: aria-hidden, alt="".
 */
const W = 1200;
const H = 960;
const INK = "#1f2433";
const CORAL = "#d9826c";
const SAGE = "#94ab8f";
const LAVENDER = "#b3a6cc";
const CHARCOAL = "#3a3d4a";
const CREAM = "#fbf4e6";
const KRAFT = "#d8bd8e";

const inked = (w = 3) => ({ stroke: INK, "stroke-width": w, "stroke-linejoin": "round", "stroke-linecap": "round" }) as const;
const stroke = (color: string, width: number, opacity?: number) =>
  ({ fill: "none", stroke: color, "stroke-width": width, "stroke-linecap": "round", "stroke-linejoin": "round", opacity }) as const;

/** A swatch with pinking-shear (zigzag) edges, rotated about its centre. */
function swatch(x: number, y: number, w: number, h: number, a: number, fill: string, weave: string): string {
  const z = 7;
  const pts: string[] = [];
  for (let i = 0; i <= w; i += z * 2) pts.push(`${x + i},${y} ${x + Math.min(w, i + z)},${y - z}`);
  for (let i = 0; i <= h; i += z * 2) pts.push(`${x + w},${y + i} ${x + w + z},${y + Math.min(h, i + z)}`);
  for (let i = w; i >= 0; i -= z * 2) pts.push(`${x + i},${y + h} ${x + Math.max(0, i - z)},${y + h + z}`);
  for (let i = h; i >= 0; i -= z * 2) pts.push(`${x},${y + i} ${x - z},${y + Math.max(0, i - z)}`);
  const cx = x + w / 2;
  const cy = y + h / 2;
  return g(
    { transform: `rotate(${a} ${cx} ${cy})` },
    el("polygon", { points: pts.join(" "), fill: "#2a2a30", opacity: 0.22, transform: "translate(6 8)" }),
    el("polygon", { points: pts.join(" "), fill }),
    el("polygon", { points: pts.join(" "), fill: `url(#${weave})`, opacity: 0.35 }),
    circle(cx, y + 16, 8, { fill: "#c9423a", ...inked(2) }),
    circle(cx - 3, y + 13, 2.5, { fill: "#ffd9cf" }),
  );
}

function board(): string {
  return (
    rect(0, 0, W, H, { fill: "url(#linen)" }) +
    rect(0, 0, W, H, { fill: "url(#weave)", opacity: 0.35 }) +
    rect(26, 26, W - 52, H - 52, { rx: 14, fill: "none", stroke: CORAL, "stroke-width": 4, "stroke-dasharray": "14 10", opacity: 0.85 })
  );
}

function spoolAndThread(): string {
  return (
    // loose thread running across the board toward the phones
    path("M512,168C600,240 560,300 660,300S820,210 880,260 1000,300 1060,240", stroke(CORAL, 3.5, 0.9)) +
    g(
      { transform: "rotate(-8 500 160)" },
      rect(462, 92, 76, 20, { rx: 5, fill: "#a67c52", ...inked(3) }),
      rect(470, 112, 60, 96, { fill: CORAL, ...inked(3) }),
      g(stroke("#b8604c", 3), ...[124, 140, 156, 172, 188].map((y) => line([470, y], [530, y + 6]))),
      rect(462, 208, 76, 20, { rx: 5, fill: "#a67c52", ...inked(3) }),
    )
  );
}

function sampleTag(): string {
  return g(
    { transform: "rotate(9 640 150)" },
    path("M640,40C650,70 640,90 646,108", stroke(INK, 2.5)),
    path("M592,110H688L700,126V232H580V126Z", { fill: KRAFT, ...inked(3) }),
    circle(640, 128, 7, { fill: "#cbb89b", ...inked(2) }),
    el("text", { x: 640, y: 172, "text-anchor": "middle", "font-family": "Courier New, monospace", "font-weight": 700, "font-size": 20, fill: INK }, "SAMPLE"),
    el("text", { x: 640, y: 200, "text-anchor": "middle", "font-family": "Courier New, monospace", "font-size": 17, fill: INK }, "NO. 01"),
  );
}

function form(x: number, y: number, a: number, title: string, rows: number): string {
  const lines: string[] = [];
  for (let i = 0; i < rows; i++) lines.push(line([x + 22, y + 70 + i * 26], [x + (i % 2 ? 150 : 190), y + 70 + i * 26], stroke("#9aa2b4", 5)));
  return g(
    { transform: `rotate(${a} ${x + 110} ${y + 100})` },
    rect(x, y, 220, 200, { fill: "#2a2a30", opacity: 0.2, transform: "translate(6 9)" }),
    rect(x, y, 220, 200, { fill: CREAM, ...inked(3) }),
    rect(x, y, 220, 40, { fill: CHARCOAL }),
    el("text", { x: x + 20, y: y + 28, "font-family": "Courier New, monospace", "font-weight": 700, "font-size": 20, fill: CREAM, "letter-spacing": 2 }, title),
    ...lines,
  );
}

function tape(): string {
  const ticks: string[] = [];
  const nums: string[] = [];
  for (let i = 0; i < 44; i++) {
    const x = 20 + i * 28;
    ticks.push(line([x, 0], [x, i % 5 === 0 ? 20 : 11], stroke(INK, 2)));
    if (i % 5 === 0) nums.push(el("text", { x: x + 3, y: 36, "font-family": "Courier New, monospace", "font-size": 14, fill: INK }, String(i / 5 + 1)));
  }
  return g({ transform: "translate(-20 842) rotate(-3)" }, rect(0, 0, 1260, 44, { fill: "#f2cf5b", ...inked(2.5) }), ...ticks, ...nums);
}

export function veloraScene(): string {
  const defs = [
    sceneDefs(INK, "#fff6e4", 29, W, H),
    linear("linen", [
      [0, "#e7e0d1"],
      [1, "#d6cdb9"],
    ]),
    el("pattern", { id: "weave", width: 6, height: 6, patternUnits: "userSpaceOnUse" }, line([0, 0], [6, 0] as P, stroke("#8f8573", 1)) + line([0, 0], [0, 6] as P, stroke("#8f8573", 0.6))),
    el("pattern", { id: "twill", width: 10, height: 10, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, line([0, 0], [0, 10] as P, stroke("#ffffff", 3))),
    el("pattern", { id: "herring", width: 12, height: 12, patternUnits: "userSpaceOnUse" }, path("M0,6L6,0L12,6", stroke("#ffffff", 2))),
  ];
  const body = [
    board(),
    swatch(70, 70, 150, 130, -7, CORAL, "twill"),
    swatch(214, 92, 136, 124, 6, SAGE, "herring"),
    swatch(118, 208, 126, 100, -2, LAVENDER, "twill"),
    swatch(334, 70, 104, 96, 11, CHARCOAL, "herring"),
    spoolAndThread(),
    sampleTag(),
    form(96, 588, -5, "RFP", 4),
    form(360, 612, 4, "BID", 4),
    swatch(1010, 612, 110, 92, -9, SAGE, "twill"),
    swatch(1060, 700, 96, 84, 7, CORAL, "herring"),
    tape(),
    sceneFinish(W, H, 0.16, 0.55),
  ].join("");
  return sceneSvg(W, H, defs.join(""), body);
}

export const veloraJournalAssets: Asset[] = [{ file: "hero-studio.svg", svg: veloraScene() }];
