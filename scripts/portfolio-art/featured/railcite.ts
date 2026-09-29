import { circle, g, line, path, pine, poly, polyline, rect, smooth, star, type P } from "../kit";
import { box, collageSvg, piece, prng, ridgePts, ring, screens, strokes, torn, type Collage } from "../collage";

/**
 * RailCite — the home Featured Work anchor (TASK-133, spec §4–§5, §20). A cut-paper collage of the
 * product's world: a navy / cream / railway-red streamliner crossing a stone viaduct, a muted rust sun,
 * layered torn-paper hills, a circular (a document fragment: round stamp, heading bars, ruled lines, a
 * rust approval stamp — no readable text), a station-map strip with a route line and stops, and one
 * small evidence slip with a check stamp. Reads as research → evidence → trust, on track.
 * Transparent background: it lies on the card's cream paper. No emblems, logos or lettering.
 */

const W = 1000;
const H = 1040;
const NAVY = "#0d1735";
const NAVY2 = "#2e3854";
const RUST = "#b64927";
const SUN = "#c0613f";
const FOREST = "#214f43";
const CREAM = "#f3ead6";
const RIM = "#fffbf2";
const STONE = "#d9ccb1";
const SHADE = "#1b1a2e";

/** The viaduct deck's top edge: rises gently to the right. */
const deckY = (x: number) => 812 - x * 0.096;
const DECK_ANGLE = (Math.atan2(-0.096, 1) * 180) / Math.PI;

function documents(defs: string[]): string {
  const out: string[] = [];
  // the station-map strip (behind): grid paper, a route with stops, a dashed branch, faint contours
  const mapC: P = [415, 385];
  out.push(piece(defs, "rc-map", torn(box(250, 170, 330, 430, -9), 21, 5, 11), { fill: "#ede3cb", rim: RIM }, SHADE));
  const grid: [P, P][] = [];
  for (let x = 270; x <= 560; x += 30) grid.push([[x, 186], [x, 584]]);
  for (let y = 190; y <= 584; y += 30) grid.push([[262, y], [568, y]]);
  const route: P[] = [[292, 566], [334, 506], [304, 446], [372, 396], [350, 328], [420, 280], [404, 214]];
  out.push(
    g(
      { transform: `rotate(-9 ${mapC[0]} ${mapC[1]})` },
      strokes(grid, { stroke: "#63799e", "stroke-width": 1.2, opacity: 0.28 }),
      path(smooth([[262, 520], [330, 470], [420, 500], [560, 450]]), { fill: "none", stroke: "#8a7f68", "stroke-width": 2, opacity: 0.4 }),
      path(smooth([[262, 300], [340, 250], [450, 290], [560, 240]]), { fill: "none", stroke: "#8a7f68", "stroke-width": 2, opacity: 0.4 }),
      polyline([[372, 396], [450, 430], [520, 470]], { stroke: NAVY2, "stroke-width": 4, "stroke-dasharray": "10 8", "stroke-linecap": "round" }),
      path(smooth(route, false, 0.9), { fill: "none", stroke: RUST, "stroke-width": 7, "stroke-linecap": "round" }),
      ...route.filter((_, i) => i % 2 === 0 || i === route.length - 1).map(([x, y]) => circle(x, y, 9, { fill: RIM, stroke: NAVY2, "stroke-width": 3.5 })),
      circle(520, 470, 7, { fill: NAVY2 }),
    ),
  );

  // the circular (front): stamp, heading bars, double rule, ruled body, rust approval stamp
  const docC: P = [610, 350];
  out.push(piece(defs, "rc-doc", torn(box(420, 110, 380, 480, 5), 33, 5, 11), { fill: CREAM, rim: RIM, screen: ["hl", 0.35] }, SHADE));
  const rand = prng(7);
  const body: [P, P][] = [];
  for (let y = 276; y <= 470; y += 21) body.push([[452, y], [y > 460 ? 620 : 700 + rand() * 72, y]]);
  out.push(
    g(
      { transform: `rotate(5 ${docC[0]} ${docC[1]})` },
      circle(482, 176, 38, { fill: "none", stroke: NAVY2, "stroke-width": 3.5 }),
      circle(482, 176, 29, { fill: "none", stroke: NAVY2, "stroke-width": 1.6, "stroke-dasharray": "3 4" }),
      poly(star(482, 176, 17, 7, 8), { fill: NAVY2 }),
      rect(540, 150, 206, 12, { rx: 3, fill: NAVY2, opacity: 0.82 }),
      rect(566, 174, 154, 8, { rx: 3, fill: NAVY2, opacity: 0.55 }),
      rect(590, 192, 106, 6, { rx: 3, fill: NAVY2, opacity: 0.4 }),
      line([450, 222], [772, 222], { stroke: NAVY2, "stroke-width": 2.4 }),
      line([450, 228], [772, 228], { stroke: NAVY2, "stroke-width": 1.2 }),
      rect(452, 244, 70, 7, { rx: 3, fill: NAVY2, opacity: 0.6 }),
      rect(690, 244, 80, 7, { rx: 3, fill: NAVY2, opacity: 0.6 }),
      strokes(body, { stroke: "#8e97ab", "stroke-width": 3.2, "stroke-linecap": "round", opacity: 0.85 }),
      g(
        { transform: "rotate(-9 700 520)", opacity: 0.88 },
        rect(636, 494, 128, 54, { rx: 6, fill: "none", stroke: RUST, "stroke-width": 4.5 }),
        rect(645, 503, 110, 36, { rx: 3, fill: "none", stroke: RUST, "stroke-width": 1.8 }),
        rect(662, 512, 58, 7, { rx: 3, fill: RUST }),
        rect(662, 525, 76, 5, { rx: 2, fill: RUST, opacity: 0.8 }),
      ),
    ),
  );
  // tape across the circular's top edge
  out.push(piece(defs, "rc-tape1", torn(box(560, 88, 120, 38, -4), 41, 2.5, 5), { fill: "#d7be93", extra: { opacity: 0.78 }, shadow: 0.3 }, SHADE));

  // the evidence slip: a check stamp + three ruled lines, taped on
  const slipC: P = [200, 495];
  out.push(piece(defs, "rc-slip", torn(box(166, 452, 210, 128, -7), 55, 4, 9), { fill: "#f1e2b8", rim: RIM }, SHADE));
  out.push(
    g(
      { transform: `translate(70 20) rotate(-7 ${slipC[0]} ${slipC[1]})` },
      circle(146, 494, 25, { fill: "none", stroke: FOREST, "stroke-width": 4.5 }),
      polyline([[134, 494], [143, 504], [160, 484]], { stroke: FOREST, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }),
      line([188, 474], [284, 474], { stroke: "#8e97ab", "stroke-width": 3.2, "stroke-linecap": "round" }),
      line([188, 494], [272, 494], { stroke: "#8e97ab", "stroke-width": 3.2, "stroke-linecap": "round" }),
      line([188, 514], [258, 514], { stroke: RUST, "stroke-width": 3.2, "stroke-linecap": "round" }),
    ),
  );
  out.push(piece(defs, "rc-tape2", torn(box(220, 438, 92, 30, 9), 61, 2, 5), { fill: "#d7be93", extra: { opacity: 0.78 }, shadow: 0.3 }, SHADE));
  return out.join("");
}

function viaduct(defs: string[]): string {
  // outer silhouette (lightly torn) with scissor-cut arch openings (even-odd holes)
  const outer = torn([[-20, deckY(-20)], [1020, deckY(1020)], [1020, 1062], [-20, 1062]], 71, 2.5, 12, 3);
  const holes: string[] = [];
  const piers = Array.from({ length: 8 }, (_, i) => -40 + i * 150);
  for (let i = 0; i < piers.length - 1; i += 1) {
    const l = piers[i]! + 26;
    const r = piers[i + 1]! - 26;
    const top = deckY((l + r) / 2) + 58;
    const rad = (r - l) / 2;
    holes.push(`M${l},1052L${l},${Math.round(top + rad)}A${rad},${rad} 0 0 1 ${r},${Math.round(top + rad)}L${r},1052Z`);
  }
  const parts = [
    piece(defs, "rc-viaduct", outer + holes.join(""), { fill: STONE, rim: RIM, rimWidth: 4, screen: ["ht", 0.12], shape: { "fill-rule": "evenodd" } }, SHADE),
    // parapet + string course
    line([-20, deckY(-20) + 30], [1020, deckY(1020) + 30], { stroke: NAVY2, "stroke-width": 3, opacity: 0.55 }),
    line([-20, deckY(-20) + 36], [1020, deckY(1020) + 36], { stroke: NAVY2, "stroke-width": 1.5, opacity: 0.4 }),
  ];
  // stone courses on the piers
  const courses: [P, P][] = [];
  for (const x of piers) for (let y = Math.round(deckY(x)) + 70; y < 1040; y += 34) courses.push([[x - 18, y], [x + 18, y]]);
  parts.push(strokes(courses, { stroke: NAVY2, "stroke-width": 1.4, opacity: 0.3 }));
  // track: sleepers + a rail along the deck
  const ties: [P, P][] = [];
  for (let x = -10; x < 1010; x += 16) ties.push([[x, deckY(x) - 1], [x + 7, deckY(x + 7) - 1]]);
  parts.push(strokes(ties, { stroke: "#5a4331", "stroke-width": 6 }));
  parts.push(line([-20, deckY(-20) - 5], [1020, deckY(1020) - 5], { stroke: NAVY, "stroke-width": 3.5 }));
  return parts.join("");
}

/** A side-on streamliner in local coordinates (rail top at y = 0, heading +x), placed on the deck. */
function train(): string {
  const ink = { stroke: NAVY, "stroke-width": 3.2, "stroke-linejoin": "round" } as const;
  const parts: string[] = [];
  const car = (x0: number, len: number) => {
    const out = [
      rect(x0, -82, len, 72, { rx: 12, fill: "#efe5cf", ...ink }),
      rect(x0, -82, len, 72, { rx: 12, fill: "url(#hs)", opacity: 0.12 }),
      path(`M${x0 + 2},-36L${x0 + len - 2},-36L${x0 + len - 2},-22Q${x0 + len - 2},-10 ${x0 + len - 14},-10L${x0 + 14},-10Q${x0 + 2},-10 ${x0 + 2},-22Z`, { fill: NAVY2 }),
      rect(x0 + 2, -44, len - 4, 8, { fill: RUST }),
      rect(x0 + 6, -86, len - 12, 10, { rx: 5, fill: NAVY2 }),
    ];
    for (let i = 0; i < 5; i += 1) {
      const wx = x0 + 18 + i * ((len - 36) / 5);
      out.push(rect(wx, -70, (len - 36) / 5 - 10, 20, { rx: 4, fill: "#3b4a6b", stroke: NAVY, "stroke-width": 2 }));
      out.push(rect(wx + 3, -67, 6, 13, { rx: 2, fill: "#c9d3e2", opacity: 0.7 }));
    }
    for (const bx of [x0 + 30, x0 + len - 30]) {
      out.push(rect(bx - 22, -12, 44, 8, { rx: 3, fill: NAVY }));
      out.push(circle(bx - 12, -4, 7, { fill: "#39435b", ...ink }));
      out.push(circle(bx + 12, -4, 7, { fill: "#39435b", ...ink }));
    }
    return out.join("");
  };
  parts.push(car(0, 176), car(186, 176));
  // the locomotive: long hood, rounded streamlined nose, cab glass, headlight, livery sweep
  const lx = 372;
  const nose = `M${lx},-86L${lx + 170},-86C${lx + 214},-86 ${lx + 244},-60 ${lx + 250},-22L${lx + 252},-10L${lx},-10Z`;
  parts.push(path(nose, { fill: "#efe5cf", ...ink }));
  parts.push(path(nose, { fill: "url(#hs)", opacity: 0.12 }));
  parts.push(path(`M${lx + 2},-36L${lx + 247},-36L${lx + 250},-22L${lx + 252},-10L${lx + 2},-10Z`, { fill: NAVY2 }));
  parts.push(path(`M${lx + 2},-44L${lx + 150},-44C${lx + 190},-44 ${lx + 222},-50 ${lx + 244},-64L${lx + 247},-52C${lx + 222},-40 ${lx + 190},-36 ${lx + 150},-36L${lx + 2},-36Z`, { fill: RUST }));
  parts.push(path(`M${lx + 176},-80C${lx + 206},-78 ${lx + 226},-66 ${lx + 236},-50L${lx + 196},-50L${lx + 176},-66Z`, { fill: "#3b4a6b", stroke: NAVY, "stroke-width": 2.5, "stroke-linejoin": "round" }));
  parts.push(path(`M${lx + 184},-74C${lx + 200},-72 ${lx + 212},-66 ${lx + 220},-58`, { fill: "none", stroke: "#c9d3e2", "stroke-width": 3, opacity: 0.7, "stroke-linecap": "round" }));
  parts.push(rect(lx + 6, -90, 150, 10, { rx: 5, fill: NAVY2 }));
  for (let i = 0; i < 4; i += 1) parts.push(rect(lx + 20 + i * 36, -70, 26, 20, { rx: 4, fill: "#3b4a6b", stroke: NAVY, "stroke-width": 2 }));
  parts.push(circle(lx + 243, -28, 8, { fill: "#fff1c4", stroke: NAVY, "stroke-width": 2.5 }));
  parts.push(poly([[lx + 251, -28], [lx + 330, -46], [lx + 330, -8]], { fill: "#fff1c4", opacity: 0.28 }));
  for (const bx of [lx + 40, lx + 200]) {
    parts.push(rect(bx - 30, -12, 60, 8, { rx: 3, fill: NAVY }));
    for (const o of [-18, 0, 18]) parts.push(circle(bx + o, -4, 7, { fill: "#39435b", ...ink }));
  }
  const at: P = [96, deckY(96) - 5];
  return g({ transform: `translate(${at[0]} ${at[1]}) rotate(${DECK_ANGLE.toFixed(2)}) scale(1.3)` }, ...parts);
}

function trees(): string {
  const out: string[] = [];
  const back: [number, number, number][] = [[842, 690, 230], [900, 676, 300], [960, 688, 260], [1000, 670, 320], [800, 706, 170]];
  for (const [x, base, h] of back) out.push(pine(x, base, h, h * 0.46, { fill: "#2c4a44" }));
  const front: [number, number, number][] = [[870, 760, 250], [936, 752, 330], [990, 744, 290]];
  for (const [x, base, h] of front) out.push(pine(x, base, h, h * 0.44, { fill: FOREST, stroke: NAVY, "stroke-width": 2.5, "stroke-linejoin": "round" }));
  return out.join("");
}

export const railciteFeatured: Collage = {
  slug: "railcite",
  render() {
    const defs: string[] = [screens(NAVY, "#fff6df")];
    const body: string[] = [];
    // the muted rust sun, cut from paper
    body.push(piece(defs, "rc-sun", torn(ring(770, 262, 226, 40), 5, 4, 14), { fill: SUN, screen: ["hl", 0.22] }, SHADE));
    // far hills (pale steel), then the documents pinned over them
    body.push(
      piece(defs, "rc-far", torn(ridgePts([[-20, 650], [80, 578], [170, 616], [290, 512], [390, 596], [500, 548], [610, 628], [740, 566], [860, 612], [1020, 548]], 1062), 13, 5, 12, 3), { fill: "#a9b2c2", rim: RIM, rimWidth: 4, screen: ["hs", 0.1] }, SHADE),
    );
    body.push(documents(defs));
    // mid hills (steel-navy) with a river strip under the viaduct
    body.push(
      piece(defs, "rc-mid", torn(ridgePts([[-20, 772], [90, 704], [200, 748], [330, 668], [460, 740], [590, 700], [700, 752], [820, 694], [1020, 742]], 1062), 17, 5, 12, 3), { fill: "#56668a", rim: RIM, rimWidth: 4, screen: ["hs", 0.14] }, SHADE),
    );
    body.push(piece(defs, "rc-river", torn(box(-20, 972, 1040, 90), 19, 4, 14), { fill: "#8a9dbb", rim: RIM, rimWidth: 4 }, SHADE));
    body.push(line([60, 1000], [260, 996], { stroke: RIM, "stroke-width": 3, opacity: 0.7 }), line([420, 1010], [700, 1004], { stroke: RIM, "stroke-width": 3, opacity: 0.6 }));
    body.push(trees());
    body.push(viaduct(defs));
    body.push(train());
    // two small framing pines, bottom-left, in front of the viaduct
    body.push(pine(34, 1060, 250, 110, { fill: NAVY2, stroke: NAVY, "stroke-width": 2.5, "stroke-linejoin": "round" }));
    body.push(pine(96, 1066, 170, 80, { fill: "#1f2b45" }));
    return collageSvg(W, H, defs.join(""), body.join(""));
  },
};
