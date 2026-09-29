/**
 * The Three Chapters art (TASK-136, spec §8–§10): one pasted cut-paper print per chapter card, each a
 * torn-edged 800 × 460 scene (the card's one dominant image, spec §11). Not about any one employer.
 *
 *   chapter-builder     machines and first research: an industrial skyline at dawn, a cut-paper gear, a
 *                       blueprint sheet with a gear drawing
 *   chapter-operator    cloud, data and platforms at scale: a steel truss bridge between mountains, piers
 *                       in the water, a small architecture-diagram scrap taped on
 *   chapter-researcher  research still shaping the work: an open research notebook (lattice sketch, a
 *                       curve), a microscope, a pen, a sticky note
 */
import { circle, el, g, line, path, pine, poly, rect, smooth, type P } from "../portfolio-art/kit";
import { box, collageSvg, piece, ridgePts, ring, screens, strokes, torn, type Collage } from "../portfolio-art/collage";
import { C, gear, grid, inkLine, onSheet, ruled, sheet, tape } from "./shared";

const W = 800;
const H = 460;

/** The torn print every chapter scene sits in: registers the outline, returns [base, clip id]. */
function print(defs: string[], id: string, seed: number, fill: string): [string, string] {
  const d = torn(box(14, 12, W - 28, H - 24), seed, 5, 12);
  const base = piece(defs, id, d, { fill, rim: C.rim, rimWidth: 5 }, C.shade);
  defs.push(el("clipPath", { id: `${id}-clip` }, el("use", { href: `#${id}` })));
  return [base, `url(#${id}-clip)`];
}

export const chapterBuilder: Collage = {
  slug: "chapter-builder",
  render() {
    const defs: string[] = [screens(C.navy, C.rim)];
    const [base, clip] = print(defs, "cb", 101, "#f4dcc4");
    const layers: string[] = [];
    layers.push(rect(0, 250, W, 210, { fill: "#efd2b6" }));
    layers.push(piece(defs, "cb-sun", torn(ring(560, 170, 70, 30), 3, 3, 12), { fill: C.yellow, shadow: 0, screen: ["hl", 0.2] }, C.shade));
    layers.push(piece(defs, "cb-far", torn(ridgePts([[-10, 300], [110, 220], [210, 262], [330, 200], [450, 262], [560, 226], [690, 272], [810, 214]], 470), 7, 4, 12, 3), { fill: C.dustyLight, rim: C.rim, rimWidth: 3, shadow: 0.4 }, C.shade));
    // the industrial skyline: a sawtooth-roof works, chimneys with smoke, towers
    const towers: [number, number, number, string][] = [
      [300, 50, 170, C.steel],
      [360, 40, 130, C.dusty],
      [410, 58, 190, C.navy2],
      [480, 44, 150, C.steel],
      [640, 54, 180, C.navy2],
      [704, 46, 220, C.steel],
    ];
    towers.forEach(([x, w, top, fill], i) => {
      layers.push(rect(x, top + 70, w, 400, { fill }));
      const wins: [P, P][] = [];
      for (let y = top + 90; y < 380; y += 18) for (let xx = x + 10; xx < x + w - 8; xx += 13) wins.push([[xx, y], [xx + 5, y]]);
      layers.push(strokes(wins, { stroke: i % 2 ? C.note : C.rim, "stroke-width": 6, opacity: 0.45 }));
    });
    const saw: string[] = ["M60,330"];
    for (let x = 60; x < 300; x += 48) saw.push(`L${x},290L${x + 48},330`);
    layers.push(path(`${saw.join("")}L300,420L60,420Z`, { fill: C.navy2, stroke: C.navy, "stroke-width": 2.5, "stroke-linejoin": "round" }));
    layers.push(strokes([60, 108, 156, 204, 252].map((x) => [[x + 8, 296], [x + 8, 326]] as [P, P]), { stroke: C.note, "stroke-width": 6, opacity: 0.55 }));
    for (const [x, h] of [[96, 150], [150, 190]] as const) {
      layers.push(rect(x, 330 - h, 18, h, { fill: C.navy, stroke: C.navy, "stroke-width": 2 }), rect(x - 2, 330 - h, 22, 8, { fill: C.rust }));
      layers.push(path(smooth([[x + 9, 322 - h], [x + 30, 290 - h], [x + 70, 300 - h], [x + 110, 270 - h]]), { fill: "none", stroke: C.rim, "stroke-width": 14, "stroke-linecap": "round", opacity: 0.8 }));
    }
    layers.push(piece(defs, "cb-ground", torn(box(-10, 400, 820, 80), 17, 4, 12), { fill: "#c9a987", rim: C.rim, rimWidth: 3 }, C.shade));
    // the blueprint (front right) with a gear drawing
    const bp = [470, 300, 260, 190] as const;
    layers.push(sheet(defs, "cb-bp", bp, -6, 23, "#4f6488", { screen: ["hs", 0.08] }));
    layers.push(onSheet(bp, -6, grid(486, 314, 228, 160, 20, { stroke: C.rim, opacity: 0.25 }), gear(560, 390, 44, 9, { stroke: C.rim, "stroke-width": 2.4 }), gear(636, 364, 24, 7, { stroke: C.rim, "stroke-width": 2 }), line([500, 460], [700, 460], { stroke: C.rim, "stroke-width": 2, "stroke-dasharray": "16 5 3 5" })));
    layers.push(tape(defs, "cb-t", 560, 286, 90, 26, 4, 29));
    // the big cut-paper gear (front left, cropped by the print)
    const teeth: string[] = [];
    for (let i = 0; i < 48; i += 1) {
      const a = (i / 48) * Math.PI * 2;
      const r = i % 4 < 2 ? 138 : 116;
      teeth.push(`${(120 + r * Math.cos(a)).toFixed(1)},${(470 + r * Math.sin(a)).toFixed(1)}`);
    }
    layers.push(el("polygon", { points: teeth.join(" "), fill: C.kraft, stroke: C.navy, "stroke-width": 3, "stroke-linejoin": "round" }));
    layers.push(el("polygon", { points: teeth.join(" "), fill: "url(#ht)", opacity: 0.1 }));
    layers.push(circle(120, 470, 44, { fill: C.rust, stroke: C.navy, "stroke-width": 3 }), circle(120, 470, 14, { fill: C.navy }));
    return collageSvg(W, H, defs.join(""), base + g({ "clip-path": clip }, ...layers));
  },
};

export const chapterOperator: Collage = {
  slug: "chapter-operator",
  render() {
    const defs: string[] = [screens(C.navy, C.rim)];
    const [base, clip] = print(defs, "co", 211, "#e9ecec");
    const layers: string[] = [];
    layers.push(piece(defs, "co-far", torn(ridgePts([[-10, 250], [90, 150], [180, 210], [300, 120], [420, 200], [520, 150], [640, 220], [810, 140]], 470), 9, 4, 12, 3), { fill: C.dustyLight, rim: C.rim, rimWidth: 3, shadow: 0.4 }, C.shade));
    layers.push(path("M288,136L300,120L318,140L306,136L298,146Z", { fill: C.rim }), path("M508,160L520,150L534,166L522,162L514,170Z", { fill: C.rim }));
    layers.push(piece(defs, "co-mid", torn(ridgePts([[-10, 300], [120, 232], [240, 280], [360, 250], [470, 292], [600, 240], [810, 290]], 470), 13, 4, 12, 3), { fill: C.steel, rim: C.rim, rimWidth: 3, shadow: 0.5, screen: ["hs", 0.08] }, C.shade));
    for (const [x, h] of [[40, 70], [70, 90], [720, 80], [750, 100], [778, 70]] as const) layers.push(pine(x, 320, h, h * 0.45, { fill: C.forest }));
    // the water
    layers.push(rect(0, 318, W, 160, { fill: C.dusty }));
    layers.push(strokes([[[60, 360], [220, 358]], [[300, 392], [520, 388]], [[580, 350], [740, 348]], [[120, 420], [300, 418]]], { stroke: C.rim, "stroke-width": 3, opacity: 0.6, "stroke-linecap": "round" }));
    // the steel truss bridge: deck, a through-truss of triangles, piers + reflections
    const deckY = 300;
    const truss: string[] = [];
    const topY = 236;
    const x0 = -10;
    const x1 = 810;
    const bays = 12;
    const step = (x1 - x0) / bays;
    for (let i = 0; i < bays; i += 1) {
      const a = x0 + i * step;
      truss.push(`M${a.toFixed(1)},${deckY}L${(a + step / 2).toFixed(1)},${topY}L${(a + step).toFixed(1)},${deckY}`);
      truss.push(`M${(a + step / 2).toFixed(1)},${topY}L${(a + step / 2).toFixed(1)},${deckY}`);
    }
    layers.push(path(truss.join(""), { fill: "none", stroke: C.navy2, "stroke-width": 5, "stroke-linejoin": "round" }));
    layers.push(line([x0, topY], [x1, topY], { stroke: C.navy2, "stroke-width": 7 }));
    layers.push(rect(x0, deckY - 4, x1 - x0, 16, { fill: C.navy, stroke: C.navy, "stroke-width": 2 }));
    for (const x of [130, 400, 670]) {
      layers.push(rect(x - 16, deckY + 12, 32, 110, { fill: C.navy2, stroke: C.navy, "stroke-width": 2.5 }));
      layers.push(rect(x - 16, deckY + 124, 32, 40, { fill: C.navy2, opacity: 0.25 }));
    }
    // the architecture-diagram scrap (front left): four boxes wired into a platform
    const sc = [40, 330, 220, 132] as const;
    layers.push(sheet(defs, "co-scrap", sc, -5, 31, C.cream, { screen: ["hl", 0.25] }));
    layers.push(
      onSheet(
        sc,
        -5,
        ...([[64, 350], [164, 350], [64, 410], [164, 410]] as P[]).map(([x, y], k) => rect(x, y, 70, 34, { rx: 5, fill: k === 1 ? C.note : "none", stroke: C.navy2, "stroke-width": 2.4 })),
        strokes([[[134, 367], [164, 367]], [[99, 384], [99, 410]], [[199, 384], [199, 410]], [[134, 427], [164, 427]]], { stroke: C.rust, "stroke-width": 2.4 }),
        circle(250, 368, 3, { fill: C.navy2 }),
      ),
    );
    layers.push(tape(defs, "co-t", 110, 316, 84, 24, -8, 37));
    return collageSvg(W, H, defs.join(""), base + g({ "clip-path": clip }, ...layers));
  },
};

export const chapterResearcher: Collage = {
  slug: "chapter-researcher",
  render() {
    const defs: string[] = [screens(C.navy, C.rim)];
    const [base, clip] = print(defs, "cr", 307, "#d9c3a0");
    const layers: string[] = [];
    layers.push(rect(0, 0, W, H, { fill: "url(#ht)", opacity: 0.06 }));
    // the open notebook (two pages)
    const left = [70, 70, 290, 330] as const;
    const right = [350, 64, 290, 330] as const;
    layers.push(sheet(defs, "cr-l", left, -3, 41, C.cream, { screen: ["hl", 0.2] }));
    layers.push(sheet(defs, "cr-r", right, 2, 43, C.cream, { screen: ["hl", 0.2] }));
    const hex: string[] = [];
    for (let row = 0; row < 4; row += 1) for (let col = 0; col < 5; col += 1) hex.push(circle(120 + col * 26 + (row % 2) * 13, 110 + row * 22, 10, { fill: "none", stroke: C.navy2, "stroke-width": 2 }));
    layers.push(
      onSheet(
        left,
        -3,
        ...hex,
        inkLine([[260, 110], [300, 140]], { "stroke-width": 2, stroke: C.rust }),
        circle(304, 146, 16, { fill: "none", stroke: C.rust, "stroke-width": 2.4 }),
        ruled(100, 230, 230, 140, 20, 11, { "stroke-width": 2.6 }),
      ),
      onSheet(
        right,
        2,
        // a response curve on axes with data points
        inkLine([[390, 90], [390, 240], [600, 240]], { "stroke-width": 2.4 }),
        inkLine([[396, 228], [440, 222], [480, 196], [520, 140], [560, 112], [600, 106]], { stroke: C.steel, "stroke-width": 3 }),
        ...([[420, 224], [462, 208], [500, 170], [540, 124], [584, 108]] as P[]).map(([x, y]) => circle(x, y, 5, { fill: C.rust })),
        ruled(390, 280, 220, 90, 20, 13, { "stroke-width": 2.6 }),
      ),
    );
    layers.push(line([356, 72], [350, 396], { stroke: C.shade, "stroke-width": 5, opacity: 0.18 }));
    // the microscope (right), cut from navy paper
    layers.push(
      g(
        { stroke: C.navy, "stroke-width": 3, "stroke-linejoin": "round" },
        path("M640,440L780,440L772,420L648,420Z", { fill: C.navy2 }),
        path("M690,420L706,300L730,300L724,420Z", { fill: C.navy2 }),
        path("M702,318Q640,300 650,240L674,244Q668,286 712,296Z", { fill: C.navy2 }),
        rect(662, 360, 90, 12, { rx: 3, fill: C.steel }),
        g({ transform: "rotate(-24 690 190)" }, rect(672, 110, 36, 140, { rx: 6, fill: C.dustyLight }), rect(666, 98, 48, 20, { rx: 4, fill: C.navy2 }), rect(678, 250, 24, 26, { fill: C.navy2 })),
        circle(726, 330, 14, { fill: C.kraft }),
      ),
    );
    // the pen + a sticky note
    layers.push(g({ transform: "rotate(28 470 400)" }, rect(380, 394, 190, 14, { rx: 7, fill: C.navy, stroke: C.navy, "stroke-width": 2 }), poly([[570, 394], [598, 401], [570, 408]], { fill: C.kraft, stroke: C.navy, "stroke-width": 2 }), rect(400, 390, 34, 5, { fill: C.kraft })));
    layers.push(sheet(defs, "cr-note", [560, 40, 120, 104], 6, 53, C.note, { depth: 2.5 }));
    layers.push(onSheet([560, 40, 120, 104], 6, ruled(578, 70, 84, 50, 18, 3, { stroke: C.navy2, opacity: 0.55 })));
    return collageSvg(W, H, defs.join(""), base + g({ "clip-path": clip }, ...layers));
  },
};

export const chapterScenes: readonly Collage[] = [chapterBuilder, chapterOperator, chapterResearcher];
