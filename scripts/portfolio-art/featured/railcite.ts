import { circle, ellipse, g, line, path, pine, poly, polyline, rect, smooth, type P } from "../kit";
import { box, collageSvg, piece, prng, ridgePts, ring, screens, strokes, torn, type Collage } from "../collage";

/**
 * RailCite — the home Featured Work anchor (TASK-133 fidelity pass: Tushar's reference image is the
 * visual spec). A FULL-CARD cut-paper collage (1450 × 1000, the reference card's 1.45 aspect) laid
 * behind the card copy: the upper-left ~48 % × 62 % is kept calm for the title, tagline, proof points
 * and CTA; the landscape bleeds under it along the bottom.
 *
 * Layers, back to front: the muted rust circle · a slate-blue torn peak · a grid-paper route map with
 * stops · a second circular page · the railway circular (round seal, heading bars, a "No." / date
 * line, ruled body, a rust approval stamp — NO readable text or emblem) · a sepia photo of a viaduct ·
 * pale and slate mountain ridges with a river (left) · a dark forest mass (right) · the stone viaduct ·
 * the curving track · a navy / cream / rust streamliner in three-quarter view coming off the viaduct
 * towards the viewer (lower right) · framing pines and an evidence scrap.
 * Transparent background: it lies on the card's paper.
 */

const W = 1450;
const H = 1000;
const NAVY = "#12203a";
const NAVY2 = "#2b3a57";
const SLATE = "#5a6b8a";
const PALE = "#a9b3c3";
const RUST = "#b0502c";
const SUN = "#bf5d3a";
const CREAM = "#f1e8d5";
const STONE = "#d6cab2";
const FOREST = "#1d2e2c";
const FOREST2 = "#2c4540";
const RIM = "#fffaf0";
const SHADE = "#2a2218";
const RULE = "#8f96a6";

/* ── perspective: the train and the viaduct recede to VP (left of the loco, on the horizon) ─────── */
const VP: P = [409, 758];
const FRONT_X = 1180; // the loco's front-left edge
const TOP0 = 512; // roof line at the front
const BOT0 = 800; // wheel line at the front
const topAt = (x: number) => TOP0 + ((VP[1] - TOP0) * (FRONT_X - x)) / (FRONT_X - VP[0]);
const botAt = (x: number) => BOT0 + ((VP[1] - BOT0) * (FRONT_X - x)) / (FRONT_X - VP[0]);
/** A point on the train's side: `x` along it, `v` 0 (roof) → 1 (wheels). */
const side = (x: number, v: number): P => [x, topAt(x) + (botAt(x) - topAt(x)) * v];
const quad = (xa: number, xb: number, va: number, vb: number): P[] => [side(xa, va), side(xb, va), side(xb, vb), side(xa, vb)];

function documents(defs: string[]): string {
  const out: string[] = [];
  // slate-blue torn peak behind the papers
  out.push(piece(defs, "rc-peak", torn([[742, 300], [790, 200], [826, 232], [866, 150], [910, 210], [936, 300]], 3, 4, 12), { fill: SLATE, rim: RIM, rimWidth: 4, screen: ["hs", 0.18] }, SHADE));

  // the route map: a tall grid-paper strip, a winding dotted rust line, stops
  const mapC: P = [822, 440];
  out.push(piece(defs, "rc-map", torn(box(750, 262, 150, 360, -3), 21, 4, 12), { fill: "#e9e0c9", rim: RIM }, SHADE));
  const grid: [P, P][] = [];
  for (let x = 762; x <= 892; x += 22) grid.push([[x, 272], [x, 612]]);
  for (let y = 276; y <= 612; y += 22) grid.push([[756, y], [896, y]]);
  const route: P[] = [[780, 600], [822, 552], [792, 500], [844, 452], [810, 402], [858, 352], [828, 296]];
  out.push(
    g(
      { transform: `rotate(-3 ${mapC[0]} ${mapC[1]})` },
      strokes(grid, { stroke: "#63799e", "stroke-width": 1.1, opacity: 0.3 }),
      path(smooth([[756, 520], [812, 490], [896, 512]]), { fill: "none", stroke: "#8a7f68", "stroke-width": 1.6, opacity: 0.45 }),
      path(smooth(route, false, 0.9), { fill: "none", stroke: RUST, "stroke-width": 4.5, "stroke-dasharray": "2 7", "stroke-linecap": "round" }),
      ...route.filter((_, i) => i % 2 === 0).map(([x, y]) => circle(x, y, 6.5, { fill: RIM, stroke: RUST, "stroke-width": 3 })),
    ),
  );

  // a second circular page peeking out behind the first
  out.push(piece(defs, "rc-page2", torn(box(836, 112, 170, 470, -4), 27, 4, 12), { fill: "#ebe1cb", rim: RIM, screen: ["hl", 0.3] }, SHADE));
  out.push(g({ transform: "rotate(-4 921 347)" }, strokes([150, 176, 202, 228, 254].map((y) => [[852, y], [900, y]] as [P, P]), { stroke: RULE, "stroke-width": 3, opacity: 0.7 })));

  // the railway circular
  const docC: P = [1127, 373];
  out.push(piece(defs, "rc-doc", torn(box(912, 96, 430, 554, 5), 33, 5, 12), { fill: CREAM, rim: RIM, screen: ["hl", 0.35] }, SHADE));
  const rand = prng(7);
  const body: [P, P][] = [];
  for (let y = 360; y <= 610; y += 20) body.push([[952, y], [y > 590 ? 1160 : 1230 + rand() * 70, y]]);
  out.push(
    g(
      { transform: `rotate(5 ${docC[0]} ${docC[1]})` },
      // round seal: rings, a dotted band, a small station-building silhouette (no lettering)
      circle(1000, 176, 46, { fill: "none", stroke: NAVY2, "stroke-width": 3.5 }),
      circle(1000, 176, 37, { fill: "none", stroke: NAVY2, "stroke-width": 1.6, "stroke-dasharray": "2 4" }),
      path("M978,196 L978,172 L990,172 L990,160 L1000,150 L1010,160 L1010,172 L1022,172 L1022,196 Z", { fill: NAVY2 }),
      rect(994, 180, 12, 16, { fill: CREAM }),
      // heading bars (masthead + title — shapes, not words)
      rect(1070, 150, 230, 11, { rx: 3, fill: NAVY2, opacity: 0.78 }),
      rect(1086, 182, 196, 16, { rx: 3, fill: NAVY2, opacity: 0.88 }),
      rect(1130, 212, 100, 7, { rx: 3, fill: NAVY2, opacity: 0.5 }),
      // the number and the date
      rect(952, 262, 84, 9, { rx: 3, fill: NAVY2, opacity: 0.7 }),
      rect(1210, 262, 100, 9, { rx: 3, fill: NAVY2, opacity: 0.7 }),
      line([950, 290], [1316, 290], { stroke: NAVY2, "stroke-width": 2.2 }),
      rect(952, 312, 190, 9, { rx: 3, fill: NAVY2, opacity: 0.62 }),
      strokes(body, { stroke: RULE, "stroke-width": 3, "stroke-linecap": "round", opacity: 0.85 }),
      g(
        { transform: "rotate(-10 1250 540)", opacity: 0.85 },
        rect(1196, 514, 112, 50, { rx: 5, fill: "none", stroke: RUST, "stroke-width": 4 }),
        rect(1205, 523, 94, 32, { rx: 3, fill: "none", stroke: RUST, "stroke-width": 1.6 }),
        rect(1220, 532, 56, 6, { rx: 2, fill: RUST }),
        rect(1220, 543, 40, 5, { rx: 2, fill: RUST, opacity: 0.8 }),
      ),
    ),
  );

  // a sepia photo fragment: a stone viaduct across a valley
  const phC: P = [930, 520];
  out.push(piece(defs, "rc-photo", torn(box(836, 410, 190, 220, -6), 45, 3, 10), { fill: "#efe6d2", rim: RIM }, SHADE));
  out.push(
    g(
      { transform: `rotate(-6 ${phC[0]} ${phC[1]})` },
      rect(850, 426, 162, 150, { fill: "#c9b692" }),
      path("M850,520 L884,470 L912,500 L946,452 L984,494 L1012,470 L1012,576 L850,576 Z", { fill: "#9c8762" }),
      path("M850,536 L1012,528 L1012,546 L850,554 Z", { fill: "#6f5d42" }),
      path(
        [0, 1, 2, 3, 4].map((i) => `M${862 + i * 30},576 L${862 + i * 30},558 A11,11 0 0 1 ${884 + i * 30},558 L${884 + i * 30},576 Z`).join(""),
        { fill: "#c9b692" },
      ),
      rect(850, 426, 162, 150, { fill: "url(#hs)", opacity: 0.2 }),
    ),
  );
  out.push(piece(defs, "rc-tape1", torn(box(1050, 66, 118, 34, -5), 41, 2.5, 6), { fill: "#d8c29c", extra: { opacity: 0.8 }, shadow: 0.3 }, SHADE));
  return out.join("");
}

function landscape(defs: string[]): string {
  const out: string[] = [];
  // a kraft torn scrap at the left edge (a paper layer under the landscape)
  out.push(piece(defs, "rc-kraft", torn([[-20, 770], [60, 760], [110, 800], [100, 880], [130, 940], [-20, 960]], 51, 5, 12), { fill: "#d9c39c", rim: RIM, screen: ["hs", 0.12] }, SHADE));
  // pale far ridge, then the slate ridge — kept low on the left, below the copy
  out.push(piece(defs, "rc-far", torn(ridgePts([[-20, 830], [80, 790], [170, 812], [270, 752], [360, 800], [450, 766], [550, 796], [640, 720], [720, 700], [800, 690]], 1020), 13, 4, 14, 3), { fill: PALE, rim: RIM, rimWidth: 4, screen: ["hs", 0.14] }, SHADE));
  out.push(piece(defs, "rc-mid", torn(ridgePts([[-20, 880], [90, 846], [190, 866], [300, 826], [420, 862], [540, 812], [660, 790], [800, 760]], 1020), 17, 4, 14, 3), { fill: SLATE, rim: RIM, rimWidth: 4, screen: ["hs", 0.2] }, SHADE));
  // the river winding out of the hills
  out.push(path("M170,1010 C200,960 250,940 246,906 C242,880 290,866 350,860 L384,864 C326,874 292,888 296,912 C300,946 262,970 256,1010 Z", { fill: "#b9c6d6" }));
  out.push(strokes([[[222, 968], [244, 964]], [[282, 900], [302, 897]]], { stroke: RIM, "stroke-width": 3, opacity: 0.8 }));
  // the dark forest mass on the right, rising behind the loco and over the circular's foot
  const right: [number, number, number][] = [
    [1080, 820, 230], [1122, 800, 300], [1168, 790, 340], [1400, 800, 420], [1444, 790, 450], [1360, 800, 360],
  ];
  for (const [x, b, h] of right) out.push(pine(x, b, h, h * 0.36, { fill: FOREST }));
  out.push(path("M1060,1000 L1060,790 L1450,760 L1450,1000 Z", { fill: FOREST }));
  // lower-left pines along the river
  const left: [number, number, number][] = [[40, 950, 120], [84, 960, 90], [340, 960, 90], [376, 966, 110], [416, 960, 80]];
  for (const [x, b, h] of left) out.push(pine(x, b, h, h * 0.42, { fill: FOREST2 }));
  out.push(path("M-20,1010 L-20,950 C80,936 160,950 220,968 C300,988 380,962 470,968 L470,1010 Z", { fill: FOREST }));
  return out.join("");
}

function viaduct(defs: string[]): string {
  // stone viaduct under the train's wheel line from x 452 to the loco; arches shrink with distance
  const deckTop = (x: number) => botAt(x) + 6;
  const thick = (x: number) => 26 * ((botAt(x) - topAt(x)) / (BOT0 - TOP0));
  const x0 = 452;
  const x1 = 1120;
  const outer: P[] = [[x0, deckTop(x0)], [x1, deckTop(x1)], [x1 + 10, 1012], [x0 - 6, 1012]];
  const piers = [470, 522, 582, 650, 728, 818, 922, 1040];
  const holes: string[] = [];
  for (let i = 0; i < piers.length - 1; i += 1) {
    const a = piers[i]!;
    const b = piers[i + 1]!;
    const gap = (b - a) * 0.18;
    const l = a + gap;
    const r = b - gap;
    const rad = (r - l) / 2;
    const spring = deckTop((l + r) / 2) + thick((l + r) / 2) + rad + 6;
    holes.push(`M${Math.round(l)},1004L${Math.round(l)},${Math.round(spring)}A${Math.round(rad)},${Math.round(rad)} 0 0 1 ${Math.round(r)},${Math.round(spring)}L${Math.round(r)},1004Z`);
  }
  // what the arches look through: a slate valley wall and the forest floor
  const parts = [
    path(`M${x0},${Math.round(deckTop(x0) + 20)} L${x1},${Math.round(deckTop(x1) + 20)} L${x1},1004 L${x0},1004 Z`, { fill: "#46567a" }),
    path(`M${x0},930 C600,900 760,940 900,910 C980,896 1060,910 ${x1},900 L${x1},1004 L${x0},1004 Z`, { fill: FOREST2 }),
    piece(defs, "rc-viaduct", torn(outer, 71, 2.5, 14) + holes.join(""), { fill: STONE, rim: RIM, rimWidth: 4, screen: ["ht", 0.14], shape: { "fill-rule": "evenodd" } }, SHADE),
  ];
  // parapet shadow, then stone courses on the piers
  parts.push(poly([[x0, deckTop(x0) + thick(x0) * 0.8], [x1, deckTop(x1) + thick(x1) * 0.8], [x1, deckTop(x1) + thick(x1)], [x0, deckTop(x0) + thick(x0)]], { fill: NAVY2, opacity: 0.35 }));
  const courses: [P, P][] = [];
  for (const x of piers) for (let y = Math.round(deckTop(x) + thick(x) + 20); y < 1000; y += 26) courses.push([[x - 10, y], [x + 10, y]]);
  parts.push(strokes(courses, { stroke: NAVY2, "stroke-width": 1.4, opacity: 0.35 }));
  return parts.join("");
}

function track(): string {
  // the curve off the viaduct: ballast, sleepers and two rails sweeping to the lower-right corner
  const bed = "M1120,818 C1240,826 1330,850 1380,880 C1420,904 1450,930 1470,960 L1470,1012 L1300,1012 C1280,960 1230,900 1120,852 Z";
  const out: string[] = [path(bed, { fill: "#8a8170" }), path(bed, { fill: "url(#ht)", opacity: 0.2 })];
  const ties: [P, P][] = [];
  for (let i = 0; i < 10; i += 1) {
    const t = i / 9;
    ties.push([[1150 + t * t * 170 + t * 30, 846 + t * 150], [1160 + t * 250 + t * t * 60, 824 + t * 110]]);
  }
  out.push(strokes(ties, { stroke: "#4a3a2a", "stroke-width": 7, "stroke-linecap": "round" }));
  out.push(path("M1140,840 C1230,860 1290,920 1318,1012", { fill: "none", stroke: NAVY, "stroke-width": 4 }));
  out.push(path("M1160,824 C1280,832 1380,880 1470,944", { fill: "none", stroke: NAVY, "stroke-width": 4 }));
  // the rail along the viaduct deck, receding to VP
  out.push(polyline([[452, botAt(452) + 4], [1180, botAt(1180) + 4]], { stroke: NAVY, "stroke-width": 3 }));
  return out.join("");
}

function train(): string {
  const ink = { stroke: NAVY, "stroke-width": 3, "stroke-linejoin": "round" } as const;
  const out: string[] = [];
  // coaches, back to front: [back x, front x]
  const cars: [number, number][] = [[640, 700], [708, 790], [798, 902], [910, 1040]];
  for (const [xb, xa] of cars) {
    out.push(poly(quad(xa, xb, 0, 1), { fill: "#e6dcc6", ...ink }));
    out.push(poly(quad(xa, xb, 0, 0.12), { fill: NAVY2 })); // roof
    out.push(poly(quad(xa, xb, 0.56, 0.64), { fill: RUST })); // livery stripe
    out.push(poly(quad(xa, xb, 0.7, 1), { fill: NAVY2 })); // skirt
    const count = Math.max(3, Math.round((xa - xb) / 26));
    for (let i = 0; i < count; i += 1) {
      const wa = xa - ((xa - xb) * (i + 0.2)) / count;
      const wb = xa - ((xa - xb) * (i + 0.8)) / count;
      out.push(poly(quad(wa, wb, 0.2, 0.44), { fill: "#34466a" }));
    }
    out.push(poly(quad(xa, xb, 0, 1), { fill: "url(#hs)", opacity: 0.1 }));
    for (const f of [0.18, 0.82]) {
      const [wx, wy] = side(xb + (xa - xb) * f, 1);
      const r = (botAt(wx) - topAt(wx)) * 0.045;
      out.push(ellipse(wx, wy - r * 0.6, r * 1.3, r, { fill: NAVY }));
    }
  }
  // the loco's side: long hood, cab window, louvres
  out.push(poly(quad(FRONT_X, 1046, 0, 1), { fill: "#ece3cf", ...ink }));
  out.push(poly(quad(FRONT_X, 1046, 0, 0.1), { fill: NAVY2 }));
  out.push(poly(quad(FRONT_X, 1046, 0.56, 0.65), { fill: RUST }));
  out.push(poly(quad(FRONT_X, 1046, 0.7, 1), { fill: NAVY2 }));
  out.push(poly(quad(1164, 1112, 0.16, 0.42), { fill: "#34466a", stroke: NAVY, "stroke-width": 2 }));
  for (let i = 0; i < 5; i += 1) out.push(poly(quad(1100 - i * 10, 1096 - i * 10, 0.22, 0.46), { fill: NAVY2, opacity: 0.6 }));
  out.push(poly(quad(FRONT_X, 1046, 0, 1), { fill: "url(#hs)", opacity: 0.12 }));
  for (const f of [0.2, 0.45, 0.8]) {
    const [wx, wy] = side(1046 + (FRONT_X - 1046) * f, 1);
    out.push(ellipse(wx, wy - 4, 12, 8, { fill: NAVY }));
  }
  // the streamlined front, three-quarter on: cream nose, navy windscreen band, rust chevron, headlight
  const nose = "M1180,800 L1180,556 C1182,522 1214,508 1262,506 C1312,506 1342,522 1346,560 L1352,806 Z";
  out.push(path(nose, { fill: "#efe6d2", ...ink }));
  out.push(path("M1184,560 C1188,530 1216,516 1262,515 C1308,515 1334,528 1340,560 L1342,600 L1184,600 Z", { fill: NAVY2 }));
  out.push(path("M1196,590 L1198,560 C1204,538 1226,530 1256,529 L1256,590 Z", { fill: "#5f7394" }));
  out.push(path("M1268,590 L1268,529 C1300,530 1322,540 1328,562 L1330,590 Z", { fill: "#5f7394" }));
  out.push(path("M1206,584 L1214,544 L1226,540 L1218,584 Z", { fill: "#c9d3e2", opacity: 0.55 }));
  out.push(path("M1181,690 L1262,730 L1350,690 L1350,716 L1262,756 L1181,716 Z", { fill: RUST, stroke: NAVY, "stroke-width": 2.5 }));
  out.push(path("M1181,742 L1262,774 L1351,742 L1352,806 L1180,800 Z", { fill: NAVY2 }));
  out.push(circle(1263, 648, 25, { fill: NAVY }));
  out.push(circle(1263, 648, 17, { fill: "#fff2cc" }));
  out.push(circle(1257, 642, 5, { fill: "#ffffff", opacity: 0.9 }));
  out.push(circle(1204, 764, 7, { fill: "#f4c56d", stroke: NAVY, "stroke-width": 2 }));
  out.push(circle(1324, 766, 7, { fill: "#f4c56d", stroke: NAVY, "stroke-width": 2 }));
  out.push(path("M1184,610 C1186,650 1190,690 1192,720", { fill: "none", stroke: RIM, "stroke-width": 5, opacity: 0.55, "stroke-linecap": "round" }));
  out.push(poly([[1172, 806], [1360, 812], [1344, 842], [1186, 836]], { fill: NAVY, ...ink }));
  out.push(strokes([0, 1, 2, 3, 4, 5, 6].map((i) => [[1196 + i * 24, 812], [1200 + i * 22, 836]] as [P, P]), { stroke: "#56627a", "stroke-width": 3 }));
  out.push(path(nose, { fill: "url(#ht)", opacity: 0.1 }));
  return out.join("");
}

function scraps(defs: string[]): string {
  // one small evidence scrap below the viaduct's far end: a check stamp and three ruled lines
  return (
    piece(defs, "rc-scrap1", torn(box(560, 848, 120, 70, -8), 61, 3, 8), { fill: "#efe3c1", rim: RIM }, SHADE) +
    g(
      { transform: "rotate(-8 620 883)" },
      circle(588, 882, 14, { fill: "none", stroke: "#214f43", "stroke-width": 3.5 }),
      polyline([[581, 882], [587, 889], [597, 876]], { stroke: "#214f43", "stroke-width": 3.5, "stroke-linecap": "round", "stroke-linejoin": "round" }),
      strokes([[[612, 872], [664, 872]], [[612, 886], [654, 886]], [[612, 900], [640, 900]]], { stroke: RULE, "stroke-width": 2.6, "stroke-linecap": "round" }),
    )
  );
}

export const railciteFeatured: Collage = {
  slug: "railcite",
  render() {
    const defs: string[] = [screens(NAVY, "#fff6df")];
    const body = [
      piece(defs, "rc-sun", torn(ring(1300, 214, 188, 40), 5, 4, 14), { fill: SUN, screen: ["hl", 0.22] }, SHADE),
      documents(defs),
      landscape(defs),
      viaduct(defs),
      track(),
      train(),
      scraps(defs),
    ];
    return collageSvg(W, H, defs.join(""), body.join(""));
  },
};
