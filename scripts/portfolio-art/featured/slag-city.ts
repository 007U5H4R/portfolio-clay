import { g, path, pine, rect, smooth, type P } from "../kit";
import { box, collageSvg, piece, ridgePts, ring, screens, strokes, torn, type Collage } from "../collage";

/**
 * Slag City — Featured Work, top-right card (TASK-133 fidelity pass). A FULL-CARD cut-paper collage
 * (1240 × 620, the reference card's 2 : 1) behind the copy: the left ~42 % is calm for the name, cover
 * line and CTA; the industrial city rises from the bottom-right. The data calls Slag City a coin-op
 * beat-'em-up set in a ruined foundry city — so the art is that city (never "industrial intelligence").
 *
 * Layers, back to front: a torn grid-paper district map in the top-right corner (contours, a dashed
 * route, a rust marker) · the rust sun · an industrial-blue far skyline · two tall banded stacks ·
 * the charcoal / navy foundry (sheds, blast furnace, brick-rust block, lit windows) · a steel conveyor
 * truss running up to it · a cream torn landscape layer · the molten slag run-off · dark water with
 * ochre reflections · a kraft torn scrap (bottom-left) · a lone pine (right).
 * No characters, no game art, no lettering. Transparent background.
 */

const W = 1240;
const H = 620;
const NAVY = "#12203a";
const CHAR = "#262c3b";
const CHAR2 = "#353d52";
const BLUE = "#6c7fa1";
const RUST = "#b0502c";
const SUN = "#c0613f";
const OCHRE = "#d99a3e";
const RIM = "#fffaf0";
const SHADE = "#2a2218";

function map(defs: string[]): string {
  const c: P = [1100, 200];
  const grid: [P, P][] = [];
  for (let x = 980; x <= 1240; x += 24) grid.push([[x, 20], [x, 380]]);
  for (let y = 30; y <= 380; y += 24) grid.push([[968, y], [1250, y]]);
  return (
    piece(defs, "sc-map", torn(box(962, 6, 300, 384, 4), 91, 5, 12), { fill: "#ebe2cc", rim: RIM }, SHADE) +
    g(
      { transform: `rotate(4 ${c[0]} ${c[1]})` },
      strokes(grid, { stroke: "#63799e", "stroke-width": 1.1, opacity: 0.3 }),
      path(smooth([[970, 110], [1040, 80], [1120, 120], [1250, 90]]), { fill: "none", stroke: "#8a7f68", "stroke-width": 1.8, opacity: 0.5 }),
      path(smooth([[970, 180], [1050, 150], [1140, 196], [1250, 160]]), { fill: "none", stroke: "#8a7f68", "stroke-width": 1.8, opacity: 0.5 }),
      path(smooth([[980, 330], [1040, 280], [1090, 250], [1150, 190], [1200, 120], [1240, 70]]), { fill: "none", stroke: CHAR2, "stroke-width": 3.5, "stroke-dasharray": "10 7" }),
      path("M1150,190 m-9,0 a9,9 0 1 0 18,0 a9,9 0 1 0 -18,0", { fill: "none", stroke: RUST, "stroke-width": 3.5 }),
      rect(1020, 250, 40, 26, { fill: BLUE, opacity: 0.5 }),
      rect(1170, 250, 30, 38, { fill: BLUE, opacity: 0.5 }),
    )
  );
}

function city(defs: string[]): string {
  const out: string[] = [];
  // industrial-blue far skyline
  const far: P[] = [
    [470, 470], [470, 400], [520, 400], [520, 360], [566, 360], [566, 420], [600, 420], [600, 330], [612, 330], [612, 420], [700, 420], [700, 384],
    [770, 384], [770, 430], [990, 430], [990, 372], [1040, 372], [1040, 420], [1110, 420], [1110, 392], [1180, 392], [1180, 470],
  ];
  out.push(piece(defs, "sc-far", torn(far, 101, 3, 12), { fill: BLUE, rim: RIM, rimWidth: 4, screen: ["hs", 0.18] }, SHADE));
  // two tall banded stacks (one standing in front of the sun)
  out.push(rect(636, 132, 30, 340, { fill: CHAR, stroke: NAVY, "stroke-width": 2 }));
  out.push(rect(630, 124, 42, 14, { fill: CHAR, stroke: NAVY, "stroke-width": 2 }));
  out.push(rect(636, 170, 30, 7, { fill: RUST }), rect(636, 186, 30, 5, { fill: RUST }));
  out.push(rect(884, 168, 24, 300, { fill: CHAR2, stroke: NAVY, "stroke-width": 2 }));
  out.push(rect(884, 200, 24, 6, { fill: RUST }));
  // the foundry: sheds, a blast furnace, a rust brick block, a tall hall
  // the right-hand hall block (a lighter navy, behind) and the front works (charcoal)
  const hall: P[] = [[840, 520], [840, 330], [880, 330], [880, 280], [960, 280], [960, 340], [1030, 340], [1030, 300], [1090, 300], [1090, 380], [1150, 380], [1150, 520]];
  out.push(piece(defs, "sc-hall", torn(hall, 109, 2.5, 12), { fill: "#3a4764", rim: RIM, rimWidth: 4, screen: ["hs", 0.16], extra: { stroke: NAVY, "stroke-width": 2 } }, SHADE));
  const works: P[] = [
    [452, 520], [452, 440], [500, 410], [500, 440], [548, 410], [548, 440], [596, 410], [596, 440], [630, 440],
    [630, 300], [690, 300], [690, 250], [744, 250], [744, 330], [770, 330],
    [778, 240], [790, 214], [820, 214], [832, 240], [846, 330], [846, 520],
  ];
  out.push(piece(defs, "sc-works", torn(works, 111, 2.5, 12), { fill: CHAR, rim: RIM, rimWidth: 4, screen: ["ht", 0.1], extra: { stroke: NAVY, "stroke-width": 2 } }, SHADE));
  out.push(piece(defs, "sc-brick", torn(box(962, 346, 70, 120), 113, 1.5, 10), { fill: RUST, shadow: 0.4, screen: ["hs", 0.25] }, SHADE));
  out.push(strokes([[[782, 270], [828, 270]], [[780, 300], [832, 300]]], { stroke: "#56607a", "stroke-width": 5 }));
  const lit: [number, number][] = [[648, 330], [668, 330], [648, 356], [700, 280], [720, 280], [904, 360], [924, 360], [904, 386], [1046, 330], [1066, 330], [1046, 356], [974, 368], [1000, 368], [974, 396], [1000, 396]];
  out.push(g({}, ...lit.map(([x, y]) => rect(x, y, 11, 14, { fill: OCHRE, opacity: 0.9 }))));
  // the conveyor truss climbing to the furnace
  const lattice: [P, P][] = [[[440, 506], [800, 344]], [[450, 526], [806, 364]]];
  for (let i = 0; i < 12; i += 1) {
    const t = i / 12;
    const t2 = (i + 1) / 12;
    const a: P = [440 + 360 * t, 506 - 162 * t];
    const b: P = [450 + 356 * t2, 526 - 162 * t2];
    lattice.push([a, b], [[a[0], a[1]], [a[0] + 10, a[1] + 20]]);
  }
  out.push(strokes(lattice, { stroke: "#8590a6", "stroke-width": 3.5, "stroke-linecap": "round" }));
  out.push(strokes([[[520, 474], [520, 560]], [[640, 420], [640, 540]]], { stroke: "#8590a6", "stroke-width": 5 }));
  return out.join("");
}

function ground(defs: string[]): string {
  const out: string[] = [];
  // cream torn landscape layer, then the dark works yard in front of it
  out.push(piece(defs, "sc-cream", torn(ridgePts([[400, 520], [520, 470], [660, 500], [820, 462], [980, 492], [1110, 460], [1260, 486]], 640), 121, 5, 12, 3), { fill: "#e4d8bf", rim: RIM, rimWidth: 4, screen: ["hs", 0.08] }, SHADE));
  out.push(piece(defs, "sc-yard", torn(ridgePts([[440, 540], [600, 520], [780, 532], [960, 516], [1260, 530]], 640), 105, 3, 12, 3), { fill: CHAR2, rim: RIM, rimWidth: 3, screen: ["ht", 0.1] }, SHADE));
  // molten slag running from the furnace foot down to the water
  const flow: P[] = [[812, 486], [790, 526], [738, 556], [690, 590]];
  out.push(path(smooth(flow), { fill: "none", stroke: RUST, "stroke-width": 22, "stroke-linecap": "round" }));
  out.push(path(smooth(flow), { fill: "none", stroke: OCHRE, "stroke-width": 10, "stroke-linecap": "round" }));
  out.push(path(smooth([[810, 492], [792, 524], [752, 548]]), { fill: "none", stroke: "#f6d487", "stroke-width": 3.5, "stroke-linecap": "round" }));
  // dark water with ochre + light reflections
  out.push(piece(defs, "sc-water", torn(box(430, 566, 840, 80), 141, 3, 16), { fill: "#26324c", rim: RIM, rimWidth: 3, screen: ["hs", 0.2] }, SHADE));
  out.push(strokes([[[640, 588], [720, 586]], [[760, 596], [800, 595]], [[900, 588], [980, 587]], [[1060, 600], [1130, 598]]], { stroke: OCHRE, "stroke-width": 3.5, "stroke-linecap": "round", opacity: 0.8 }));
  out.push(strokes([[[520, 600], [580, 598]], [[1150, 584], [1210, 583]]], { stroke: RIM, "stroke-width": 2.5, opacity: 0.6 }));
  // a kraft torn scrap along the bottom-left (the reference's layered paper), a pine at the right edge
  out.push(piece(defs, "sc-kraft", torn([[-20, 574], [160, 560], [330, 578], [470, 566], [480, 640], [-20, 640]], 131, 4, 14), { fill: "#d6c29e", rim: RIM, screen: ["hs", 0.1] }, SHADE));
  out.push(pine(1214, 540, 170, 70, { fill: "#1d2e2c" }));
  return out.join("");
}

export const slagCityFeatured: Collage = {
  slug: "slag-city",
  render() {
    const defs: string[] = [screens(NAVY, "#fff6df")];
    const body = [
      map(defs),
      piece(defs, "sc-sun", torn(ring(850, 250, 112, 32), 83, 4, 14), { fill: SUN, screen: ["hl", 0.22] }, SHADE),
      city(defs),
      ground(defs),
    ];
    return collageSvg(W, H, defs.join(""), body.join(""));
  },
};
