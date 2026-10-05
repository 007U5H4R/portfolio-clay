import { circle, ellipse, g, path, pine, poly, polyline, rect, smooth, type P } from "../kit";
import { box, collageSvg, piece, prng, ridgePts, ring, screens, strokes, torn, type Collage } from "../collage";

/**
 * Campfire Board — Featured Work, bottom-right card (TASK-133 fidelity pass). A FULL-CARD cut-paper
 * evening camp (1240 × 640, the reference card's ≈ 1.94 : 1) behind the copy: the left ~40 % stays
 * calm for the name, cover line and CTA; the scene fills the right and bleeds along the bottom.
 *
 * Layers, back to front: pale hills + a lake strip (bottom-left, under the copy) · a muted sunset
 * circle · pines · a planning board on an easel — a dark frame around a cream plan map (hills, a
 * dashed route, pins) with four pinned paper notes carrying only illegible scribble (never words) ·
 * a kraft tape strip · the meadow · a layered paper campfire in a stone ring · TWO wooden Adirondack
 * chairs facing it (the spec asks for two or three; kept to two, as the earlier brief asked not to
 * imply a team for a solo local tool) · a tin mug · framing pines. Transparent background.
 */

const W = 1240;
const H = 640;
const NAVY = "#12203a";
const NAVY2 = "#2b3a57";
const TERRA = "#92381f";
const RUST = "#b0502c";
const ORANGE = "#d4702f";
const OCHRE = "#dfa243";
const FOREST = "#1f3a33";
const FOREST2 = "#2f5245";
const GREEN = "#4f6f55";
const WOOD = "#9a5530";
const WOOD2 = "#7a4122";
const NOTE = "#eedca9";
const RIM = "#fffaf0";
const SHADE = "#2a2218";

/** Illegible scribble on a note: short wavy strokes, no letterforms. */
function scribble(x: number, y: number, w: number, lines: number, seed: number): string {
  const rand = prng(seed);
  const out: string[] = [];
  for (let i = 0; i < lines; i += 1) {
    const len = w * (0.55 + rand() * 0.4);
    const pts: P[] = [];
    for (let k = 0; k <= 6; k += 1) pts.push([x + (len * k) / 6, y + i * 12 + (k % 2 ? -2.5 : 2.5) * (0.6 + rand() * 0.6)]);
    out.push(path(smooth(pts, false, 0.8), { fill: "none", stroke: NAVY2, "stroke-width": 2.3, "stroke-linecap": "round", opacity: 0.6 }));
  }
  return out.join("");
}

function backdrop(defs: string[]): string {
  const out: string[] = [];
  out.push(piece(defs, "cf-far", torn(ridgePts([[-20, 520], [80, 470], [170, 500], [280, 440], [390, 492], [520, 450], [640, 500], [760, 470], [900, 510]], 660), 273, 4, 14, 3), { fill: "#b3bccb", rim: RIM, rimWidth: 4, screen: ["hs", 0.12] }, SHADE));
  out.push(piece(defs, "cf-sun", torn(ring(690, 452, 82, 30), 271, 3, 12), { fill: "#c0613f", screen: ["hl", 0.2] }, SHADE));
  out.push(piece(defs, "cf-hills", torn(ridgePts([[-20, 560], [120, 520], [260, 548], [400, 506], [520, 536], [640, 520], [760, 548]], 660), 275, 4, 14, 3), { fill: "#6a7b98", rim: RIM, rimWidth: 4, screen: ["hs", 0.18] }, SHADE));
  out.push(piece(defs, "cf-lake", torn(box(-20, 556, 760, 46), 277, 3, 16), { fill: "#9fb1c8", rim: RIM, rimWidth: 3 }, SHADE));
  out.push(strokes([[[60, 576], [180, 574]], [[320, 584], [420, 582]], [[520, 574], [600, 573]]], { stroke: RIM, "stroke-width": 2.5, opacity: 0.8 }));
  for (const [x, b, h] of [[640, 530, 190], [676, 536, 150], [1210, 520, 300], [1170, 528, 220]] as const) out.push(pine(x, b, h, h * 0.4, { fill: FOREST }));
  return out.join("");
}

function board(defs: string[]): string {
  const out: string[] = [];
  // easel legs
  out.push(strokes([[[760, 360], [724, 540]], [[1060, 360], [1100, 540]], [[910, 30], [910, 370]]], { stroke: WOOD2, "stroke-width": 12, "stroke-linecap": "round" }));
  // dark frame + cream plan map
  out.push(piece(defs, "cf-frame", torn(box(700, 36, 420, 330, -1.5), 201, 2.5, 12), { fill: "#2c2a2e", rim: RIM, rimWidth: 3 }, SHADE));
  out.push(piece(defs, "cf-plan", torn(box(716, 52, 388, 298, -1.5), 203, 3, 12), { fill: "#ece2c9", screen: ["hs", 0.08], shadow: 0 }, SHADE));
  const c: P = [910, 200];
  out.push(
    g(
      { transform: `rotate(-1.5 ${c[0]} ${c[1]})` },
      path("M860,280 L890,236 L912,262 L944,214 L978,258 L1000,238 L1026,280", { fill: "none", stroke: NAVY2, "stroke-width": 2.5, "stroke-linejoin": "round", opacity: 0.75 }),
      path(smooth([[858, 320], [900, 300], [940, 312], [990, 292], [1040, 304]]), { fill: "none", stroke: "#7f93b3", "stroke-width": 3, opacity: 0.8 }),
      path(smooth([[870, 140], [900, 180], [880, 220], [930, 250], [980, 230]]), { fill: "none", stroke: RUST, "stroke-width": 3, "stroke-dasharray": "8 7" }),
      poly([[900, 300], [908, 286], [916, 300]], { fill: FOREST2 }),
      poly([[1010, 318], [1018, 302], [1026, 318]], { fill: FOREST2 }),
      circle(980, 230, 6, { fill: RUST }),
    ),
  );
  // four pinned notes (scribble only), one taped
  const notes: [number, number, number, number, string][] = [
    [732, 70, 104, 86, NOTE],
    [982, 64, 104, 84, "#d98b5a"],
    [736, 206, 96, 80, "#f3ead7"],
    [1000, 196, 96, 92, NOTE],
  ];
  notes.forEach(([x, y, w, h, fill], i) => {
    const rot = [-4, 5, 3, -3][i]!;
    out.push(piece(defs, `cf-note${i}`, torn(box(x, y, w, h, rot), 220 + i, 2, 6), { fill, shadow: 0.6 }, SHADE));
    out.push(g({ transform: `rotate(${rot} ${x + w / 2} ${y + h / 2})` }, scribble(x + 16, y + 30, w - 30, 3, 300 + i)));
    out.push(circle(x + w / 2, y + 10, 5, { fill: [RUST, NAVY2, GREEN, RUST][i]!, stroke: NAVY, "stroke-width": 1.5 }));
  });
  out.push(piece(defs, "cf-tape", torn(box(840, 22, 120, 30, -3), 251, 2, 6), { fill: "#d8c29c", extra: { opacity: 0.8 }, shadow: 0.3 }, SHADE));
  return out.join("");
}

function meadow(defs: string[]): string {
  return piece(defs, "cf-meadow", torn(ridgePts([[-20, 612], [200, 604], [380, 580], [520, 552], [680, 540], [840, 552], [1000, 536], [1260, 548]], 680), 279, 4, 14, 3), { fill: GREEN, rim: RIM, rimWidth: 3, screen: ["ht", 0.12] }, SHADE);
}

function fire(defs: string[]): string {
  const out: string[] = [];
  out.push(ellipse(900, 560, 190, 50, { fill: OCHRE, opacity: 0.22 }));
  out.push(g({ transform: "rotate(-14 900 560)" }, rect(838, 550, 124, 22, { rx: 10, fill: WOOD, stroke: NAVY, "stroke-width": 2.5 })));
  out.push(g({ transform: "rotate(16 900 560)" }, rect(838, 550, 124, 22, { rx: 10, fill: WOOD2, stroke: NAVY, "stroke-width": 2.5 })));
  const flame = (cx: number, base: number, w: number, h: number): P[] => [
    [cx - w / 2, base], [cx - w * 0.46, base - h * 0.3], [cx - w * 0.28, base - h * 0.5], [cx - w * 0.34, base - h * 0.74], [cx - w * 0.12, base - h * 0.56],
    [cx - w * 0.06, base - h * 0.86], [cx + w * 0.04, base - h], [cx + w * 0.12, base - h * 0.66], [cx + w * 0.3, base - h * 0.8], [cx + w * 0.3, base - h * 0.5],
    [cx + w * 0.46, base - h * 0.34], [cx + w / 2, base],
  ];
  out.push(piece(defs, "cf-f1", torn(flame(900, 556, 120, 190), 261, 3, 7), { fill: TERRA, shadow: 0 }, SHADE));
  out.push(piece(defs, "cf-f2", torn(flame(902, 556, 92, 148), 263, 3, 7), { fill: ORANGE, shadow: 0 }, SHADE));
  out.push(piece(defs, "cf-f3", torn(flame(898, 556, 60, 98), 265, 2.5, 6), { fill: OCHRE, shadow: 0 }, SHADE));
  out.push(piece(defs, "cf-f4", torn(flame(900, 556, 28, 50), 267, 2, 5), { fill: "#f7dc9a", shadow: 0 }, SHADE));
  for (const [x, y, r] of [[872, 340, 3.5], [926, 318, 3], [948, 360, 3]] as const) out.push(circle(x, y, r, { fill: OCHRE }));
  for (const [x, y, rx] of [[818, 576, 26], [862, 590, 28], [910, 594, 30], [958, 588, 28], [998, 574, 24]] as const) {
    out.push(ellipse(x, y, rx, 14, { fill: "#8e8f96", stroke: NAVY, "stroke-width": 2.2 }));
    out.push(ellipse(x - 5, y - 4, rx * 0.5, 4, { fill: "#b9bac0", opacity: 0.8 }));
  }
  return out.join("");
}

/** An Adirondack chair, three-quarter view; `flip` turns it to face left. */
function chair(x: number, y: number, s: number, flip: boolean): string {
  const ink = { stroke: NAVY, "stroke-width": 2.5 / s, "stroke-linejoin": "round" } as const;
  const slats = [0, 1, 2, 3].map((i) => poly([[i * 20, -150 + i * 3], [16 + i * 20, -150 + i * 3], [26 + i * 18, -30], [8 + i * 18, -30]], { fill: WOOD, ...ink }));
  const parts = [
    ...slats,
    poly([[0, -36], [128, -46], [146, -6], [16, 6]], { fill: "#b0633a", ...ink }),
    poly([[-14, -84], [84, -88], [86, -74], [-12, -70]], { fill: "#b0633a", ...ink }),
    poly([[96, -76], [168, -82], [170, -68], [98, -62]], { fill: "#b0633a", ...ink }),
    rect(-6, -74, 11, 80, { fill: WOOD2, ...ink }),
    rect(150, -68, 11, 74, { fill: WOOD2, ...ink }),
    rect(40, -8, 11, 20, { fill: WOOD2, ...ink }),
  ];
  const t = flip ? `translate(${x} ${y}) scale(${-s} ${s})` : `translate(${x} ${y}) scale(${s})`;
  return g({ transform: t }, ...parts);
}

export const campfireBoardFeatured: Collage = {
  slug: "campfire-board",
  render() {
    const defs: string[] = [screens(NAVY, "#fff6df")];
    const body = [
      backdrop(defs),
      board(defs),
      meadow(defs),
      chair(660, 610, 0.95, false),
      chair(1170, 606, 0.95, true),
      // a tin mug on the left chair's arm
      rect(752, 504, 20, 24, { rx: 3, fill: "#f3ead7", stroke: NAVY, "stroke-width": 2.2 }),
      path("M772,510 q9,0 9,6 q0,6 -9,6", { fill: "none", stroke: NAVY, "stroke-width": 2.2 }),
      polyline([[756, 496], [760, 486], [756, 478]], { stroke: RIM, "stroke-width": 2, opacity: 0.8 }),
      fire(defs),
      pine(1236, 660, 280, 110, { fill: FOREST, stroke: NAVY, "stroke-width": 2, "stroke-linejoin": "round" }),
    ];
    return collageSvg(W, H, defs.join(""), body.join(""));
  },
};
