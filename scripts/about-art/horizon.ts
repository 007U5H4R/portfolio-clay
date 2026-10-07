/**
 * `mountains` (TASK-136, spec §4 "subtle mountain/horizon", §35): a layered cut-paper mountain horizon with
 * snow caps and a stand of pines, transparent, 1000 × 380. Closes the page at the right end of the dark
 * Experience strip and sits in the Recognition corner. Text-free.
 */
import { g, path, pine } from "../portfolio-art/kit";
import { collageSvg, piece, ridgePts, screens, torn, type Collage } from "../portfolio-art/collage";
import { C } from "./shared";

export const horizon: Collage = {
  slug: "mountains",
  render() {
    const W = 1000;
    const H = 380;
    const defs: string[] = [screens(C.navy, C.rim)];
    const out: string[] = [];
    out.push(
      piece(defs, "mh-far", torn(ridgePts([[0, 250], [110, 150], [200, 196], [330, 70], [430, 170], [540, 110], [660, 190], [780, 96], [900, 160], [1000, 120]], 400), 3, 4, 12, 3), { fill: C.dustyLight, rim: C.rim, rimWidth: 4, screen: ["hs", 0.08] }, C.shade),
      // snow caps on the far peaks
      path("M300,98L330,70L362,104L346,98L334,110L318,100Z", { fill: C.rim }),
      path("M752,122L780,96L808,126L794,120L780,130L766,120Z", { fill: C.rim }),
      piece(defs, "mh-mid", torn(ridgePts([[0, 300], [140, 214], [260, 262], [380, 196], [520, 268], [640, 214], [780, 262], [900, 210], [1000, 250]], 400), 7, 4, 12, 3), { fill: C.steel, rim: C.rim, rimWidth: 4, screen: ["hs", 0.1] }, C.shade),
      piece(defs, "mh-near", torn(ridgePts([[0, 340], [160, 292], [320, 330], [480, 300], [640, 336], [820, 296], [1000, 326]], 400), 11, 4, 12, 3), { fill: C.navy2, rim: C.rim, rimWidth: 4 }, C.shade),
    );
    const trees: [number, number, number][] = [
      [690, 330, 110],
      [730, 322, 150],
      [772, 328, 120],
      [812, 318, 176],
      [856, 326, 138],
      [900, 316, 190],
      [946, 324, 150],
      [986, 318, 170],
      [60, 340, 90],
      [96, 334, 120],
    ];
    out.push(g({}, ...trees.map(([x, base, h]) => pine(x, base, h, h * 0.44, { fill: C.forest, stroke: C.navy, "stroke-width": 2.4, "stroke-linejoin": "round" }))));
    return collageSvg(W, H, defs.join(""), out.join(""));
  },
};
