import { circle, ellipse, g, line, path, poly, polyline, rect, smooth, star, type P } from "../kit";
import { box, collageSvg, piece, ridgePts, ring, screens, strokes, torn, type Collage } from "../collage";

/**
 * Slag City — Featured Work, top-right card (TASK-133, spec §6). The game's ruined foundry city as a
 * cut-paper collage (industrial, not "industrial intelligence" — the data calls it a coin-op
 * beat-'em-up in the browser): a charcoal foundry skyline — sawtooth sheds, two banded stacks, a
 * blast furnace and a crane — in front of a muted rust sun and an industrial-blue far city, a torn
 * map fragment of the district, a slag heap with a glowing run-off and the cover's forge hammer, dark
 * water with ochre reflections, and a punched arcade ticket stub + a blank token (the coin-op cabinet).
 * No characters, no game art, no lettering. Transparent background.
 */

const W = 1000;
const H = 860;
const NAVY = "#0d1735";
const CHAR = "#2b2f3a";
const CHAR2 = "#3a3f4c";
const RUST = "#b64927";
const SUN = "#c0613f";
const OCHRE = "#d99a3e";
const BLUE = "#6f83a6";
const RIM = "#fffbf2";
const SHADE = "#1b1a2e";

function map(defs: string[]): string {
  const c: P = [800, 200];
  const grid: [P, P][] = [];
  for (let x = 674; x <= 930; x += 28) grid.push([[x, 74], [x, 326]]);
  for (let y = 80; y <= 326; y += 28) grid.push([[666, y], [936, y]]);
  return (
    piece(defs, "sc-map", torn(box(660, 64, 280, 270, 6), 91, 5, 10), { fill: "#ebe1ca", rim: RIM }, SHADE) +
    g(
      { transform: `rotate(6 ${c[0]} ${c[1]})` },
      strokes(grid, { stroke: "#63799e", "stroke-width": 1.2, opacity: 0.3 }),
      path(smooth([[670, 150], [740, 120], [820, 160], [930, 120]]), { fill: "none", stroke: "#8a7f68", "stroke-width": 2, opacity: 0.45 }),
      path(smooth([[670, 270], [760, 230], [850, 262], [930, 220]]), { fill: "none", stroke: "#8a7f68", "stroke-width": 2, opacity: 0.45 }),
      path(smooth([[676, 310], [740, 250], [800, 214], [880, 150], [930, 110]]), { fill: "none", stroke: CHAR2, "stroke-width": 4, "stroke-dasharray": "12 8" }),
      rect(760, 236, 46, 30, { fill: BLUE, opacity: 0.55 }),
      rect(818, 180, 34, 42, { fill: BLUE, opacity: 0.55 }),
      poly(star(846, 262, 14, 5, 5), { fill: RUST }),
    )
  );
}

function skyline(defs: string[]): string {
  // industrial-blue far city: blocks, a gas holder, a chimney
  const far: P[] = [[250, 530], [250, 430], [300, 430], [300, 400], [352, 400], [352, 452], [396, 452], [396, 372], [410, 372], [410, 452], [470, 452], [470, 418], [540, 418], [540, 470], [600, 470], [600, 436], [660, 436], [660, 400], [700, 400], [700, 470], [760, 470], [760, 430], [830, 430], [830, 480], [900, 480], [900, 440], [960, 440], [960, 530]];
  return piece(defs, "sc-far", torn(far, 101, 3, 12), { fill: BLUE, rim: RIM, rimWidth: 4, screen: ["hs", 0.16] }, SHADE);
}

function ground(defs: string[]): string {
  // the works yard the foundry and crane stand on
  return piece(defs, "sc-yard", torn(ridgePts([[-20, 640], [200, 628], [420, 646], [640, 630], [1020, 644]], 800), 105, 4, 12, 3), { fill: CHAR2, rim: RIM, rimWidth: 4, screen: ["ht", 0.1] }, SHADE);
}

function foundry(defs: string[]): string {
  // charcoal foundry: sawtooth sheds (left), two banded stacks, blast furnace (centre-right), crane
  const shed: P[] = [
    [80, 640], [80, 520], [140, 470], [140, 520], [200, 470], [200, 520], [260, 470], [260, 520], [290, 520],
    [290, 300], [322, 300], [322, 520], [350, 520], [350, 340], [380, 340], [380, 520],
    [430, 520], [430, 470], [470, 470], [470, 420], [520, 420], [520, 470], [560, 470],
    [566, 330], [578, 292], [610, 292], [622, 330], [628, 470], [660, 470], [660, 440], [740, 440], [740, 500], [780, 500], [780, 640],
  ];
  const out = [piece(defs, "sc-foundry", torn(shed, 111, 2.5, 12), { fill: CHAR, rim: RIM, rimWidth: 4, screen: ["ht", 0.1], extra: { stroke: NAVY, "stroke-width": 2 } }, SHADE)];
  // stack bands + furnace hoops + lit windows
  out.push(rect(290, 330, 32, 9, { fill: RUST }), rect(290, 352, 32, 6, { fill: RUST }), rect(350, 366, 30, 8, { fill: RUST }));
  out.push(strokes([[[570, 360], [618, 360]], [[568, 404], [622, 404]], [[566, 446], [626, 446]]], { stroke: "#56607a", "stroke-width": 5 }));
  const lit: string[] = [];
  for (const [x, y] of [[100, 560], [124, 560], [148, 560], [100, 590], [148, 590], [440, 490], [462, 490], [680, 470], [704, 470], [728, 470], [704, 500]] as const) {
    lit.push(rect(x, y, 14, 16, { fill: OCHRE, opacity: 0.9 }));
  }
  out.push(...lit);
  // downcomer pipe from the furnace + a gantry crane
  out.push(path("M610,300 C660,300 668,340 668,380 L668,440", { fill: "none", stroke: CHAR2, "stroke-width": 12, "stroke-linecap": "round" }));
  out.push(path("M610,300 C660,300 668,340 668,380 L668,440", { fill: "none", stroke: NAVY, "stroke-width": 2, opacity: 0.6 }));
  const lattice: [P, P][] = [];
  for (let x = 812; x < 960; x += 22) lattice.push([[x, 262], [x + 11, 276]], [[x + 11, 276], [x + 22, 262]]);
  out.push(
    strokes([[[860, 640], [860, 270]], [[884, 640], [884, 270]], [[800, 262], [966, 262]], [[800, 276], [966, 276]], ...lattice], { stroke: CHAR, "stroke-width": 5, "stroke-linecap": "round" }),
    line([930, 276], [930, 360], { stroke: CHAR, "stroke-width": 2.5 }),
    rect(920, 360, 20, 16, { fill: RUST, stroke: NAVY, "stroke-width": 2 }),
  );
  return out.join("");
}

function smoke(defs: string[]): string {
  const puffs: [number, number, number, number][] = [[312, 260, 30, 1], [330, 214, 40, 2], [362, 170, 48, 3], [404, 136, 38, 4], [594, 250, 26, 5], [620, 212, 34, 6]];
  return puffs.map(([x, y, r, s]) => piece(defs, `sc-puff${s}`, torn(ring(x, y, r, 18), 120 + s, 2.5, 9), { fill: "#c9c4bd", rim: RIM, rimWidth: 3, shadow: 0.5, extra: { opacity: 0.92 } }, SHADE)).join("");
}

function slag(defs: string[]): string {
  const heap: P[] = [[270, 800], [340, 716], [430, 660], [500, 640], [560, 650], [650, 700], [760, 800]];
  const out = [piece(defs, "sc-heap", torn(ridgePts(heap, 870), 131, 4, 10, 3), { fill: "#3a2e2a", rim: RIM, rimWidth: 4, screen: ["ht", 0.12] }, SHADE)];
  // glowing run-off down the heap, then the lip of the ladle trough
  out.push(path(smooth([[520, 648], [506, 690], [470, 720], [420, 746], [384, 772]]), { fill: "none", stroke: RUST, "stroke-width": 16, "stroke-linecap": "round" }));
  out.push(path(smooth([[520, 648], [506, 690], [470, 720], [420, 746], [384, 772]]), { fill: "none", stroke: OCHRE, "stroke-width": 7, "stroke-linecap": "round" }));
  out.push(path(smooth([[516, 660], [504, 690], [478, 712]]), { fill: "none", stroke: "#f6d487", "stroke-width": 3, "stroke-linecap": "round" }));
  // slag lumps
  for (const [x, y, s] of [[590, 690, 1], [640, 716, 0.8], [440, 700, 0.9]] as const) {
    out.push(poly([[x - 20 * s, y + 6 * s], [x - 12 * s, y - 12 * s], [x + 10 * s, y - 14 * s], [x + 22 * s, y + 2 * s], [x + 8 * s, y + 14 * s]], { fill: "#5a4638", stroke: NAVY, "stroke-width": 2 }));
  }
  // the forge hammer, head-down in the heap
  out.push(g(
    { transform: "rotate(18 560 600)" },
    rect(552, 470, 16, 170, { rx: 6, fill: "#8a5a32", stroke: NAVY, "stroke-width": 3 }),
    circle(560, 470, 11, { fill: OCHRE, stroke: NAVY, "stroke-width": 3 }),
    rect(512, 628, 96, 46, { rx: 5, fill: "#5e6f8c", stroke: NAVY, "stroke-width": 3.5 }),
    rect(512, 628, 96, 12, { fill: "#8fa0bd", opacity: 0.6 }),
    rect(546, 618, 28, 12, { fill: "#3b4458", stroke: NAVY, "stroke-width": 2.5 }),
  ));
  return out.join("");
}

function water(defs: string[]): string {
  return (
    piece(defs, "sc-water", torn(box(-20, 760, 1040, 120), 141, 4, 14), { fill: "#2e3854", rim: RIM, rimWidth: 4, screen: ["hs", 0.18] }, SHADE) +
    strokes([[[120, 790], [230, 788]], [[640, 796], [760, 792]], [[300, 820], [360, 819]], [[820, 814], [900, 812]]], { stroke: OCHRE, "stroke-width": 4, "stroke-linecap": "round", opacity: 0.75 })
  );
}

function arcade(defs: string[]): string {
  // a punched arcade ticket stub + a blank token — the coin-op cabinet, no lettering
  const c: P = [150, 700];
  const holes = [90, 118, 146, 174, 202].map((x) => circle(x, 682, 5, { fill: CHAR }));
  return (
    piece(defs, "sc-ticket", torn(box(60, 660, 180, 80, -8), 151, 2.5, 8), { fill: "#eedca9", rim: RIM }, SHADE) +
    g(
      { transform: `rotate(-8 ${c[0]} ${c[1]})` },
      ...holes,
      line([70, 700], [230, 700], { stroke: RUST, "stroke-width": 2, "stroke-dasharray": "6 6" }),
      rect(90, 712, 90, 8, { rx: 3, fill: RUST, opacity: 0.75 }),
      rect(190, 710, 26, 12, { rx: 3, fill: "none", stroke: RUST, "stroke-width": 2 }),
    ) +
    circle(252, 648, 30, { fill: OCHRE, stroke: NAVY, "stroke-width": 3 }) +
    circle(252, 648, 21, { fill: "none", stroke: "#8a5a32", "stroke-width": 2.5 }) +
    ellipse(244, 638, 8, 5, { fill: "#f6d487", opacity: 0.8 }) +
    polyline([[236, 676], [252, 680], [268, 676]], { stroke: SHADE, "stroke-width": 3, opacity: 0.25, "stroke-linecap": "round" })
  );
}

export const slagCityFeatured: Collage = {
  slug: "slag-city",
  render() {
    const defs: string[] = [screens(NAVY, "#fff6df")];
    const body = [
      piece(defs, "sc-sun", torn(ring(520, 330, 170, 36), 83, 4, 14), { fill: SUN, screen: ["hl", 0.22] }, SHADE),
      map(defs),
      skyline(defs),
      ground(defs),
      smoke(defs),
      foundry(defs),
      slag(defs),
      water(defs),
      arcade(defs),
    ];
    return collageSvg(W, H, defs.join(""), body.join(""));
  },
};
