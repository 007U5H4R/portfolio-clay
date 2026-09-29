import { circle, ellipse, g, path, pine, poly, polyline, rect, smooth, type P } from "../kit";
import { box, collageSvg, piece, prng, ridgePts, ring, screens, strokes, torn, type Collage } from "../collage";

/**
 * Campfire Board — Featured Work, bottom-right card (TASK-133, spec §7). A cut-paper evening camp:
 * a kraft planning board on an easel — three columns under terracotta / ochre / forest header strips,
 * pinned paper notes carrying only illegible scribble (never words), ticks on the done column — with a
 * small Gantt slip (bars + a dependency arrow: the product's Kanban and Execution Gantt views) taped to
 * its corner; a layered paper campfire in a stone ring; ONE chair and a tin mug (a solo, local tool —
 * no crowd, no team implied); forest-green pines, navy hills, an orange sun and a lake strip.
 * Transparent background, no lettering.
 */

const W = 1000;
const H = 860;
const NAVY = "#0d1735";
const NAVY2 = "#2e3854";
const TERRA = "#92381f";
const RUST = "#b64927";
const ORANGE = "#d9722f";
const OCHRE = "#e0a441";
const FOREST = "#214f43";
const GREEN2 = "#496d58";
const KRAFT = "#d7be93";
const NOTE = "#eedca9";
const RIM = "#fffbf2";
const WOOD = "#8a5a32";
const SHADE = "#1b1a2e";

/** Illegible scribble for a note: a few short wavy strokes, no letterforms. */
function scribble(x: number, y: number, w: number, lines: number, seed: number): string {
  const rand = prng(seed);
  const out: string[] = [];
  for (let i = 0; i < lines; i += 1) {
    const yy = y + i * 13;
    const len = w * (0.55 + rand() * 0.4);
    const pts: P[] = [];
    for (let k = 0; k <= 6; k += 1) pts.push([x + (len * k) / 6, yy + (k % 2 ? -2.5 : 2.5) * (0.6 + rand() * 0.6)]);
    out.push(path(smooth(pts, false, 0.8), { fill: "none", stroke: NAVY2, "stroke-width": 2.4, "stroke-linecap": "round", opacity: 0.55 }));
  }
  return out.join("");
}

function board(defs: string[]): string {
  const out: string[] = [];
  // easel legs behind the board
  out.push(strokes([[[560, 420], [520, 660]], [[860, 420], [900, 660]], [[710, 90], [710, 440]]], { stroke: WOOD, "stroke-width": 16, "stroke-linecap": "round" }));
  out.push(strokes([[[540, 560], [880, 560]]], { stroke: WOOD, "stroke-width": 9, "stroke-linecap": "round" }));
  // frame + cork face
  out.push(piece(defs, "cf-frame", torn(box(492, 102, 436, 342, 1.5), 201, 3, 12), { fill: "#6d4527", rim: RIM, rimWidth: 4 }, SHADE));
  out.push(piece(defs, "cf-cork", torn(box(508, 118, 404, 310, 1.5), 203, 3, 12), { fill: KRAFT, screen: ["ht", 0.1], shadow: 0 }, SHADE));
  const cols: [number, string][] = [[522, TERRA], [654, OCHRE], [786, FOREST]];
  const noteFills = [NOTE, "#fbf7ef", "#f3e3bd"];
  let seed = 1;
  cols.forEach(([x, color], ci) => {
    out.push(piece(defs, `cf-head${ci}`, torn(box(x + 4, 130, 112, 20, ci - 1), 210 + ci, 1.5, 6), { fill: color, shadow: 0.4 }, SHADE));
    const rows = ci === 1 ? 2 : 3;
    for (let r = 0; r < rows; r += 1) {
      const nx = x + 8 + (r % 2) * 6;
      const ny = 164 + r * 84;
      const rot = ((seed * 37) % 7) - 3;
      out.push(piece(defs, `cf-n${ci}${r}`, torn(box(nx, ny, 102, 72, rot), 220 + seed, 2, 6), { fill: noteFills[(ci + r) % 3]!, shadow: 0.5 }, SHADE));
      out.push(g({ transform: `rotate(${rot} ${nx + 51} ${ny + 36})` }, scribble(nx + 14, ny + 26, 70, 3, 300 + seed)));
      out.push(circle(nx + 51, ny + 8, 5.5, { fill: [RUST, OCHRE, GREEN2][(r + ci) % 3]!, stroke: NAVY, "stroke-width": 1.5 }));
      if (ci === 2) out.push(polyline([[nx + 72, ny + 52], [nx + 80, ny + 60], [nx + 94, ny + 42]], { stroke: FOREST, "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round" }));
      seed += 1;
    }
  });
  // the Gantt slip, taped over the board's lower-right corner
  const c: P = [850, 432];
  out.push(piece(defs, "cf-gantt", torn(box(752, 388, 196, 92, -4), 241, 3, 8), { fill: "#fbf7ef", rim: RIM }, SHADE));
  out.push(
    g(
      { transform: `rotate(-4 ${c[0]} ${c[1]})` },
      strokes([[[770, 404], [770, 468]], [[810, 404], [810, 468]], [[850, 404], [850, 468]], [[890, 404], [890, 468]]], { stroke: "#63799e", "stroke-width": 1.2, opacity: 0.35 }),
      rect(770, 406, 64, 10, { rx: 3, fill: TERRA }),
      rect(812, 424, 58, 10, { rx: 3, fill: OCHRE }),
      rect(850, 442, 70, 10, { rx: 3, fill: FOREST }),
      rect(796, 460, 44, 10, { rx: 3, fill: "#63799e" }),
      path("M834,411 C846,411 846,429 812,429", { fill: "none", stroke: NAVY2, "stroke-width": 2, opacity: 0.8 }),
      path("M870,429 C882,429 880,447 852,447", { fill: "none", stroke: NAVY2, "stroke-width": 2, opacity: 0.8 }),
    ),
  );
  out.push(piece(defs, "cf-tape", torn(box(880, 370, 76, 26, 32), 251, 2, 5), { fill: KRAFT, extra: { opacity: 0.8 }, shadow: 0.3 }, SHADE));
  return out.join("");
}

function fire(defs: string[]): string {
  const out: string[] = [];
  out.push(ellipse(300, 720, 210, 70, { fill: OCHRE, opacity: 0.18 }));
  // logs, crossed
  out.push(g({ transform: "rotate(-16 300 730)" }, rect(214, 718, 172, 26, { rx: 12, fill: WOOD, stroke: NAVY, "stroke-width": 3 }), ellipse(380, 731, 9, 12, { fill: KRAFT, stroke: NAVY, "stroke-width": 2 })));
  out.push(g({ transform: "rotate(18 300 730)" }, rect(214, 718, 172, 26, { rx: 12, fill: "#74492a", stroke: NAVY, "stroke-width": 3 }), ellipse(220, 731, 9, 12, { fill: KRAFT, stroke: NAVY, "stroke-width": 2 })));
  // layered paper flames: terracotta → orange → ochre → pale core
  const flame = (cx: number, base: number, w: number, h: number): P[] => [
    [cx - w / 2, base], [cx - w * 0.46, base - h * 0.3], [cx - w * 0.28, base - h * 0.5], [cx - w * 0.34, base - h * 0.74], [cx - w * 0.12, base - h * 0.56],
    [cx - w * 0.06, base - h * 0.86], [cx + w * 0.04, base - h], [cx + w * 0.12, base - h * 0.66], [cx + w * 0.3, base - h * 0.8], [cx + w * 0.3, base - h * 0.5],
    [cx + w * 0.46, base - h * 0.34], [cx + w / 2, base],
  ];
  out.push(piece(defs, "cf-f1", torn(flame(300, 726, 150, 230), 261, 3, 7), { fill: TERRA, shadow: 0 }, SHADE));
  out.push(piece(defs, "cf-f2", torn(flame(302, 726, 116, 180), 263, 3, 7), { fill: ORANGE, shadow: 0 }, SHADE));
  out.push(piece(defs, "cf-f3", torn(flame(298, 726, 76, 120), 265, 2.5, 6), { fill: OCHRE, shadow: 0 }, SHADE));
  out.push(piece(defs, "cf-f4", torn(flame(300, 726, 36, 60), 267, 2, 5), { fill: "#f7dc9a", shadow: 0 }, SHADE));
  // sparks
  for (const [x, y, r] of [[262, 470, 4], [320, 440, 3], [350, 488, 3.5], [292, 420, 2.5]] as const) out.push(circle(x, y, r, { fill: OCHRE }));
  // stone ring (front stones)
  for (const [x, y, rx] of [[200, 742, 30], [252, 760, 32], [312, 766, 34], [372, 758, 32], [418, 740, 28]] as const) {
    out.push(ellipse(x, y, rx, 17, { fill: "#8e8f96", stroke: NAVY, "stroke-width": 2.5 }));
    out.push(ellipse(x - 6, y - 5, rx * 0.5, 5, { fill: "#b9bac0", opacity: 0.8 }));
  }
  return out.join("");
}

function chair(): string {
  // one Adirondack chair, three-quarter view, facing the fire
  const ink = { stroke: NAVY, "stroke-width": 3, "stroke-linejoin": "round" } as const;
  const slats = [0, 1, 2, 3].map((i) => poly([[70 + i * 22, 520 + i * 4], [88 + i * 22, 520 + i * 4], [100 + i * 20, 650], [80 + i * 20, 650]], { fill: "#a5532c", ...ink }));
  return g(
    {},
    ...slats,
    poly([[64, 646], [196, 634], [214, 676], [80, 690]], { fill: "#b8653a", ...ink }),
    poly([[50, 600], [150, 596], [152, 610], [52, 614]], { fill: "#b8653a", ...ink }),
    poly([[168, 610], [236, 602], [238, 616], [170, 624]], { fill: "#b8653a", ...ink }),
    rect(62, 612, 12, 118, { fill: "#8d4424", ...ink }),
    rect(206, 620, 12, 110, { fill: "#8d4424", ...ink }),
    rect(104, 680, 12, 58, { fill: "#8d4424", ...ink }),
    // the tin mug on the armrest
    rect(208, 574, 24, 30, { rx: 3, fill: "#fbf7ef", ...ink }),
    path("M232,582 q12,0 12,8 q0,8 -12,8", { fill: "none", stroke: NAVY, "stroke-width": 3 }),
    path("M214,564 q4,-8 0,-16 M224,564 q4,-8 0,-16", { fill: "none", stroke: "#fbf7ef", "stroke-width": 2.5, "stroke-linecap": "round", opacity: 0.9 }),
  );
}

export const campfireBoardFeatured: Collage = {
  slug: "campfire-board",
  render() {
    const defs: string[] = [screens(NAVY, "#fff6df")];
    const body: string[] = [];
    body.push(piece(defs, "cf-sun", torn(ring(270, 330, 132, 32), 271, 4, 14), { fill: ORANGE, screen: ["hl", 0.2] }, SHADE));
    body.push(piece(defs, "cf-far", torn(ridgePts([[-20, 470], [120, 400], [250, 452], [380, 380], [520, 440], [660, 400], [820, 452], [1020, 410]], 700), 273, 4, 12, 3), { fill: "#8e9ab0", rim: RIM, rimWidth: 4, screen: ["hs", 0.12] }, SHADE));
    body.push(piece(defs, "cf-hills", torn(ridgePts([[-20, 540], [140, 486], [300, 530], [470, 476], [640, 520], [820, 488], [1020, 530]], 700), 275, 4, 12, 3), { fill: NAVY2, rim: RIM, rimWidth: 4, screen: ["hs", 0.16] }, SHADE));
    for (const [x, b, h] of [[40, 560, 190], [92, 566, 140], [940, 560, 200], [986, 556, 250], [440, 548, 120], [470, 552, 90]] as const) body.push(pine(x, b, h, h * 0.44, { fill: "#2c4a44" }));
    body.push(piece(defs, "cf-lake", torn(box(-20, 548, 1040, 80), 277, 4, 14), { fill: "#8a9dbb", rim: RIM, rimWidth: 4 }, SHADE));
    body.push(strokes([[[80, 576], [220, 574]], [[560, 590], [700, 586]]], { stroke: RIM, "stroke-width": 3, opacity: 0.7 }));
    body.push(piece(defs, "cf-meadow", torn(ridgePts([[-20, 616], [200, 604], [480, 620], [760, 606], [1020, 618]], 880), 279, 4, 12, 3), { fill: GREEN2, rim: RIM, rimWidth: 4, screen: ["ht", 0.1] }, SHADE));
    body.push(board(defs));
    body.push(chair());
    body.push(fire(defs));
    for (const [x, b, h] of [[20, 860, 300], [966, 860, 280]] as const) body.push(pine(x, b, h, h * 0.42, { fill: FOREST, stroke: NAVY, "stroke-width": 2.5, "stroke-linejoin": "round" }));
    return collageSvg(W, H, defs.join(""), body.join(""));
  },
};
