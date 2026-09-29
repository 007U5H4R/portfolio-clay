import {
  circle,
  el,
  ellipse,
  g,
  glow,
  line,
  linear,
  mix,
  n,
  path,
  poly,
  printDefs,
  printFinish,
  rect,
  ridge,
  smooth,
  star,
  svg,
  type P,
  type Scene,
} from "../kit";

/**
 * Token Toli — ageing-in-place care orchestration for long-distance families (data/projects.ts: a
 * team discovery PRD with 11 named respondents and three tested hypotheses; nothing was built, no
 * AI). Care from afar: a parent's cottage on a hill at dusk, its windows the only warm light, a
 * rocking chair and a pot plant on the porch, a mailbox with its flag up at the gate. A road dips
 * behind the hill and winds away to the city on the horizon where the family lives; a line of poles
 * joins the two and a paper plane rides the wire home. In front: the team's open notebook — three
 * ticked hypotheses, eleven respondent dots, sticky notes and a pair of glasses.
 * Palette: sage green, warm ochre, cream, dusty blue, terracotta roof.
 */

const INK = "#2c2824";
const CREAM = "#f4ead3";
const OCHRE = "#d9a24e";
const OCHRE_L = "#f3cd7c";
const DUSTY = "#6f8aa3";
const TERRA = "#b5553a";
const TERRA_D = "#8a3c28";
const GLOW = "#f6c56d";
const WOOD = "#8a6446";

const keyline = (width = 4) => ({ stroke: INK, "stroke-width": width }) as const;
const stroke = (color: string, width: number, opacity?: number) => ({ fill: "none", stroke: color, "stroke-width": width, opacity }) as const;

/** A tiny deterministic PRNG (Park–Miller), so every render is identical. */
function rand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** The cottage group is drawn at 1.1× around its porch, a little lower on the hill (hero scale). */
const HOME = "matrix(1.1 0 0 1.1 -54 -35.6)";
const home = ([x, y]: P): P => [x * 1.1 - 54, y * 1.1 - 35.6];

/** A hanging wire between two points (a shallow catenary, as a quadratic curve). */
const wire = (a: P, b: P, sag: number) => `M${n(a[0])},${n(a[1])}Q${n((a[0] + b[0]) / 2)},${n((a[1] + b[1]) / 2 + sag * 2)} ${n(b[0])},${n(b[1])}`;

function sky(): string {
  return (
    rect(0, 0, 1600, 640, { fill: "url(#sky)" }) +
    // faint high cloud and three first stars: the lettering band stays calm
    path(smooth([[60, 150], [260, 132], [470, 146], [600, 138]]), stroke("#90a3b4", 18, 0.5)) +
    path(smooth([[1040, 104], [1250, 92], [1480, 106]]), stroke("#90a3b4", 14, 0.45)) +
    g(
      { fill: "#eef1ea", opacity: 0.6 },
      poly(star(318, 84, 6, 2, 4)),
      poly(star(1000, 60, 5, 1.8, 4)),
      poly(star(1236, 176, 4, 1.5, 4)),
    ) +
    // low clouds catching the last of the afterglow
    path(smooth([[1110, 372], [1260, 360], [1420, 368], [1560, 356]]), stroke("#e2bc8e", 14, 0.55)) +
    path(smooth([[40, 404], [190, 394], [330, 402]]), stroke("#dcb58c", 12, 0.5)) +
    rect(0, 300, 1600, 240, { fill: "url(#hl)", opacity: 0.35, mask: "url(#skyFade)" })
  );
}

/** The distant range and the family's city on the horizon, its lights coming on. */
function horizon(): string {
  const next = rand(97);
  const towers: string[] = [];
  const lights: string[] = [];
  let x = 1262;
  while (x < 1600) {
    const w = 14 + next() * 22;
    const h = 16 + next() * 52 * (1 - Math.abs(x - 1440) / 260);
    towers.push(rect(x, 500 - h, w, h + 14));
    for (let k = 0; k < 3; k += 1) {
      if (next() < 0.55) lights.push(rect(x + 3 + next() * (w - 7), 500 - h + 5 + next() * (h - 8), 2.6, 2.6));
    }
    x += w + 2 + next() * 6;
  }
  return (
    path(ridge([[0, 498], [160, 484], [320, 494], [500, 476], [700, 490], [900, 474], [1080, 488], [1260, 478], [1440, 490], [1600, 480]], 640), { fill: "#8d9dac" }) +
    g({ fill: "#71859a" }, towers.join("")) +
    g({ fill: OCHRE_L, opacity: 0.9 }, lights.join(""))
  );
}

function land(): string {
  const back = ridge([[600, 556], [820, 546], [1000, 534], [1200, 524], [1400, 518], [1600, 522]], 900);
  const hedges = [
    [[760, 580], [980, 566], [1200, 556], [1420, 548], [1600, 546]],
    [[900, 628], [1120, 610], [1340, 598], [1600, 590]],
  ] as const;
  const hill = ridge([[-20, 592], [120, 568], [300, 548], [520, 540], [700, 550], [820, 580], [900, 622], [980, 668], [1080, 694], [1240, 704], [1420, 708], [1620, 712]], 900);
  return (
    path(back, { fill: "url(#fields)" }) +
    // patchwork fields in two more greens, receding to the horizon
    path(ridge([[900, 600], [1060, 584], [1240, 572], [1420, 566], [1600, 568]], 660), { fill: "#bdb481" }) +
    path(ridge([[980, 660], [1180, 640], [1400, 630], [1600, 628]], 720), { fill: "#7c8e6c" }) +
    rect(800, 600, 800, 200, { fill: "url(#ht)", opacity: 0.1 }) +
    hedges.map((pts) => path(smooth(pts), stroke("#7f906f", 7, 0.7))).join("") +
    // a few far trees along the lanes
    g({ fill: "#71846c" }, ...([[1060, 548, 9], [1120, 544, 7], [1290, 534, 6], [1340, 532, 5], [1500, 526, 5]] as const).map(([x, y, r]) => circle(x, y, r))) +
    path(hill, { fill: "url(#hill)" }) +
    path(hill, { fill: "url(#ht)", opacity: 0.1 })
  );
}

/** The road: from the gate down the hill's shoulder and away over the fields to the city. */
function road(): string {
  const centre: P[] = [[800, 612], [848, 626], [894, 642], [944, 656], [1004, 652], [1072, 630], [1150, 604], [1240, 580], [1330, 558], [1410, 542], [1474, 532]];
  const left: P[] = [];
  const right: P[] = [];
  centre.forEach((p, i) => {
    const q = centre[Math.min(i + 1, centre.length - 1)] ?? p;
    const o = centre[Math.max(i - 1, 0)] ?? p;
    const dx = q[0] - o[0];
    const dy = q[1] - o[1];
    const len = Math.hypot(dx, dy) || 1;
    const w = 22 * (1 - i / (centre.length - 1)) + 1.5;
    left.push([p[0] + (dy / len) * w, p[1] - (dx / len) * w]);
    right.push([p[0] - (dy / len) * w, p[1] + (dx / len) * w]);
  });
  const ribbon = `${smooth(left)}L${right
    .slice()
    .reverse()
    .map(([x, y]) => `${n(x)},${n(y)}`)
    .join("L")}Z`;
  return path(ribbon, { fill: "#e6d2a8" }) + path(smooth(centre.slice(0, 8)), { ...stroke("#f4e6c4", 2.5, 0.8), "stroke-dasharray": "10 14" });
}

/** The line of poles from the cottage to the city, and the paper plane riding the wire home. */
function poles(): string {
  const pole = (x: number, base: number, h: number, w: number) => {
    const top = base - h;
    const arm = w * 3.2;
    return (
      rect(x - w / 2, top, w, h, { fill: "#5b4a3d" }) +
      rect(x - arm, top + w * 1.2, arm * 2, w * 0.8, { fill: "#5b4a3d" }) +
      circle(x - arm * 0.8, top + w, w * 0.45, { fill: "#cbbfa6" }) +
      circle(x + arm * 0.8, top + w, w * 0.45, { fill: "#cbbfa6" })
    );
  };
  const tops: P[] = [home([870, 344]), [1170, 474], [1318, 500], [1414, 512], [1478, 516]];
  const spans = tops.slice(0, -1).map((a, i) => path(wire(a, tops[i + 1] ?? a, 18 - i * 4), stroke("#3f3a34", 2.4 - i * 0.4))).join("");
  return (
    pole(1170, 600, 126, 6) +
    pole(1318, 556, 56, 4) +
    pole(1414, 540, 28, 2.6) +
    spans
  );
}

/** The near pole by the gate and the service drop to the cottage gable (drawn in the home group). */
function nearPole(): string {
  return (
    path(wire([870, 344], [646, 412], 10), stroke("#3f3a34", 2.6)) +
    rect(865, 344, 10, 256, { fill: WOOD, ...keyline(3) }) +
    rect(840, 350, 60, 9, { fill: WOOD, ...keyline(2.5) }) +
    circle(848, 346, 4.5, { fill: "#cbbfa6", ...keyline(2) }) +
    circle(892, 346, 4.5, { fill: "#cbbfa6", ...keyline(2) })
  );
}

function plane(): string {
  const at = "translate(764 376) rotate(163)";
  return (
    g({ ...stroke(CREAM, 3, 0.75), "stroke-dasharray": "8 10" }, path("M800,364C822,358 842,352 860,348")) +
    g(
      { transform: at },
      poly([[30, 0], [-18, -16], [-9, 0]], { fill: "#fbf6e9", ...keyline(3) }),
      poly([[30, 0], [-9, 0], [-18, 12]], { fill: "#d8cbaf", ...keyline(3) }),
      line([30, 0], [-9, 0], { stroke: INK, "stroke-width": 2 }),
    )
  );
}

function cottage(): string {
  const ink = keyline(4);
  const win = (x: number, y: number) =>
    rect(x, y, 56, 50, { fill: "url(#winLit)", ...keyline(3.5) }) +
    line([x + 28, y], [x + 28, y + 50], { stroke: "#7a5230", "stroke-width": 3.5 }) +
    line([x, y + 24], [x + 56, y + 24], { stroke: "#7a5230", "stroke-width": 3.5 }) +
    rect(x - 4, y + 48, 64, 7, { fill: CREAM, ...keyline(2.5) });
  const tiles = [322, 346, 370, 394]
    .map((y) => {
      const dx = ((y - 284) / 128) * 142;
      return line([540 - dx + 8, y], [540 + dx - 8, y], { stroke: TERRA_D, "stroke-width": 3, opacity: 0.8 });
    })
    .join("");
  return (
    // the cottage's warmth spills over the hilltop and the lawn below the windows
    circle(548, 470, 400, { fill: "url(#homeGlow)" }) +
    ellipse(546, 596, 190, 34, { fill: "url(#lawnGlow)" }) +
    // a round tree behind, on the far side of the cottage
    g({ fill: "#5b7059" }, circle(360, 438, 72), circle(316, 486, 50), circle(402, 486, 54)) +
    rect(352, 480, 14, 76, { fill: "#48584a" }) +
    // chimney with a wisp of smoke
    path(smooth([[468, 290], [462, 270], [474, 252], [468, 234]]), stroke("#d9d4c6", 7, 0.28)) +
    rect(452, 290, 30, 80, { fill: "#c9b79a", ...ink }) +
    rect(446, 282, 42, 14, { fill: TERRA_D, ...ink }) +
    // gable wall, attic window
    poly([[422, 404], [540, 302], [658, 404], [658, 548], [422, 548]], { fill: "url(#wallLit)", ...ink }) +
    poly([[422, 404], [540, 302], [540, 548], [422, 548]], { fill: "url(#hs)", opacity: 0.14 }) +
    circle(540, 352, 18, { fill: OCHRE_L, ...keyline(3.5) }) +
    line([540, 334], [540, 370], { stroke: "#7a5230", "stroke-width": 3 }) +
    line([522, 352], [558, 352], { stroke: "#7a5230", "stroke-width": 3 }) +
    // terracotta roof with tile courses
    path("M398,414L540,284L682,414L664,422L540,310L416,422Z", { fill: TERRA, ...ink }) +
    tiles +
    // porch roof, porch shade, lit windows, the door and its lamp
    poly([[404, 440], [676, 440], [668, 462], [412, 462]], { fill: TERRA, ...ink }) +
    rect(414, 462, 252, 7, { fill: TERRA_D }) +
    rect(424, 469, 232, 79, { fill: "#6d5540", opacity: 0.22 }) +
    win(444, 480) +
    win(580, 480) +
    rect(514, 470, 50, 78, { rx: 3, fill: DUSTY, ...keyline(3.5) }) +
    rect(526, 482, 26, 18, { rx: 2, fill: OCHRE_L, ...keyline(2.5) }) +
    circle(555, 516, 3, { fill: OCHRE_L }) +
    circle(572, 486, 34, { fill: "url(#porchGlow)" }) +
    path("M566,478L578,478L580,496L564,496Z", { fill: "#fff1c4", ...keyline(2.5) }) +
    rect(564, 472, 16, 6, { fill: INK }) +
    rect(418, 462, 9, 86, { fill: CREAM, ...keyline(2.5) }) +
    rect(653, 462, 9, 86, { fill: CREAM, ...keyline(2.5) }) +
    // porch deck and steps
    rect(410, 544, 260, 12, { fill: "#b88a52", ...keyline(3) }) +
    rect(514, 556, 52, 10, { fill: "#a67a47", ...keyline(3) }) +
    rect(508, 566, 64, 10, { fill: "#a67a47", ...keyline(3) }) +
    // rocking chair against the lit window
    path("M452,488L478,488L480,524L450,524Z", { fill: "#4a3a2e", ...keyline(3) }) +
    g({ stroke: "#c79a5c", "stroke-width": 2.5 }, line([459, 492], [459, 520]), line([466, 492], [466, 520]), line([473, 492], [473, 520])) +
    path("M446,524L500,524L500,530L446,530Z", { fill: "#4a3a2e", ...keyline(3) }) +
    path("M452,530L448,544M494,530L500,544", stroke(INK, 3.5)) +
    path("M436,540C456,550 486,550 508,538", stroke("#4a3a2e", 5)) +
    path("M436,540C456,550 486,550 508,538", stroke(INK, 1.5, 0.7)) +
    path("M494,506L504,506L504,526", stroke("#4a3a2e", 4)) +
    // a pot plant by the door
    path("M618,520L646,520L642,546L622,546Z", { fill: TERRA, ...keyline(3) }) +
    g({ fill: "#7f9a6d", ...keyline(2.5) }, ellipse(624, 506, 7, 15, { transform: "rotate(-24 624 506)" }), ellipse(640, 504, 7, 16, { transform: "rotate(22 640 504)" }), ellipse(632, 498, 7, 18))
  );
}

/** The garden path, the picket fence, the gate and a mailbox with its flag up. */
function garden(): string {
  const pickets = Array.from({ length: 8 }, (_, i) => {
    const x = 684 + i * 11;
    return poly([[x, 594], [x, 566], [x + 3.5, 560], [x + 7, 566], [x + 7, 594]]);
  }).join("");
  return (
    path(smooth([[540, 578], [600, 590], [680, 596], [770, 592]]), stroke("#e6d2a8", 26)) +
    g({ fill: CREAM, ...keyline(2.5) }, pickets) +
    line([680, 574], [772, 574], stroke(CREAM, 4)) +
    line([680, 586], [772, 586], stroke(CREAM, 4)) +
    rect(812, 552, 9, 52, { fill: WOOD, ...keyline(3) }) +
    path("M796,560L796,538C796,526 806,520 816,520C826,520 838,526 838,538L838,560Z", { fill: DUSTY, ...keyline(3.5) }) +
    path("M802,532C804,526 810,524 816,524", stroke("#a8bccc", 3)) +
    line([838, 552], [838, 520], { stroke: INK, "stroke-width": 3 }) +
    rect(838, 518, 16, 10, { fill: TERRA, ...keyline(2.5) })
  );
}

/** The framing tree at the left edge, its right side warmed by the cottage. */
function frameTree(): string {
  return (
    path("M84,900C92,800 96,700 110,600L134,600C124,700 128,800 138,900Z", { fill: "#3f3530", ...keyline(4) }) +
    path("M112,690L84,640M120,640L150,600", stroke("#3f3530", 9)) +
    g({ fill: "#3f5143" }, circle(90, 480, 112), circle(20, 560, 92), circle(-14, 400, 92)) +
    g({ fill: "#50654f" }, circle(126, 400, 78), circle(168, 520, 82), circle(120, 580, 64)) +
    g({ fill: "#6a7d5c", opacity: 0.45 }, circle(176, 470, 40), circle(150, 372, 34), circle(206, 548, 30)) +
    rect(-20, 300, 260, 340, { fill: "url(#ht)", opacity: 0.14, mask: "url(#treeShade)" })
  );
}

/** The team's discovery notebook, open on the near bank: hypotheses, respondents, sticky notes, glasses. */
function notebook(): string {
  const [fl, fr, nr, nl] = [[160, 744], [820, 716], [880, 960], [110, 990]] as const;
  const at = (u: number, v: number): P => mix(mix(fl, fr, u), mix(nl, nr, u), v);
  const quad = (u0: number, v0: number, u1: number, v1: number) => [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)];
  const ink = keyline(4);
  const rules = Array.from({ length: 8 }, (_, i) => 0.14 + i * 0.1)
    .map((v) => line(at(0.04, v), at(0.46, v)) + line(at(0.54, v), at(0.96, v)))
    .join("");
  const hypotheses = [0.16, 0.36, 0.56]
    .map((v) => {
      const [bx, by] = at(0.07, v);
      return (
        poly(quad(0.06, v - 0.05, 0.1, v + 0.03), { fill: "#fbf6e8", ...keyline(2.5) }) +
        path(`M${n(bx)},${n(by - 2)}l6 6 12-16`, stroke(TERRA, 3.4)) +
        line(at(0.13, v), at(0.13 + 0.22 + (v * 7) % 0.1, v), stroke("#4f4a44", 3.4))
      );
    })
    .join("");
  const respondents = Array.from({ length: 11 }, (_, i) => {
    const [cx, cy] = at(0.6 + (i % 4) * 0.075, 0.18 + Math.floor(i / 4) * 0.16);
    return ellipse(cx, cy, 11, 8, { fill: ([DUSTY, "#9aae86", OCHRE] as const)[i % 3] ?? DUSTY, ...keyline(2.2) });
  }).join("");
  const sticky = (u: number, v: number, fill: string, rot: number) => {
    const [cx, cy] = at(u, v);
    return g(
      { transform: `translate(${n(cx)} ${n(cy)}) rotate(${rot})` },
      rect(-34, -26, 68, 52, { fill: INK, opacity: 0.2, transform: "translate(-4 5)" }),
      rect(-34, -26, 68, 52, { fill, ...keyline(3) }),
      line([-24, -10], [20, -10], stroke(INK, 3, 0.55)),
      line([-24, 4], [10, 4], stroke(INK, 3, 0.55)),
    );
  };
  const [gx, gy] = at(0.7, 0.62);
  return (
    poly([[fl[0] - 14, fl[1] - 8], [fr[0] + 14, fr[1] - 10], [nr[0] + 18, nr[1]], [nl[0] - 18, nl[1]]], { fill: TERRA_D, ...ink }) +
    poly([fl, fr, nr, nl].map(([x, y]) => [x - 10, y + 12] as P), { fill: INK, opacity: 0.25 }) +
    poly(quad(0, 0, 0.5, 1), { fill: "url(#pageL)", ...ink }) +
    poly(quad(0.5, 0, 1, 1), { fill: "url(#pageR)", ...ink }) +
    g({ stroke: "#9db0c0", "stroke-width": 1.6, opacity: 0.8 }, rules) +
    poly(quad(0.47, 0, 0.53, 1), { fill: INK, opacity: 0.12 }) +
    hypotheses +
    respondents +
    sticky(0.4, 0.08, OCHRE_L, 8) +
    sticky(0.86, 0.1, "#b9c9a4", -7) +
    // a pencil across the spine
    g(
      { transform: `translate(${n(at(0.3, 0.8)[0])} ${n(at(0.3, 0.8)[1])}) rotate(-16)` },
      rect(0, -8, 190, 16, { fill: OCHRE, ...keyline(3) }),
      line([6, -3], [184, -3], stroke(OCHRE_L, 3)),
      rect(-22, -8, 22, 16, { rx: 4, fill: "#d98f7e", ...keyline(3) }),
      poly([[190, -8], [214, 0], [190, 8]], { fill: "#f1d9b0", ...keyline(3) }),
      poly([[206, -3], [214, 0], [206, 3]], { fill: INK }),
    ) +
    // reading glasses, folded on the page
    g(
      { transform: `translate(${n(gx)} ${n(gy)}) rotate(-8)` },
      ellipse(-30, 10, 30, 21, { fill: INK, opacity: 0.22 }),
      ellipse(38, 10, 30, 21, { fill: INK, opacity: 0.22 }),
      ellipse(-36, 0, 30, 21, { fill: "#dfe7ea", opacity: 0.5, stroke: "#4a3b30", "stroke-width": 5 }),
      ellipse(32, 0, 30, 21, { fill: "#dfe7ea", opacity: 0.5, stroke: "#4a3b30", "stroke-width": 5 }),
      path("M-8,-4C-2,-12 4,-12 4,-4", stroke("#4a3b30", 5)),
      path("M-64,-6L-100,14M60,-6L96,16", stroke("#4a3b30", 5)),
      path("M-50,-10C-44,-16 -36,-18 -28,-16", stroke("#ffffff", 3.5, 0.8)),
      path("M18,-10C24,-16 32,-18 40,-16", stroke("#ffffff", 3.5, 0.8)),
    ) +
    poly([at(0, 0.45), at(1, 0.45), nr, nl], { fill: "url(#nearShade)" })
  );
}

function foreground(): string {
  const tuft = (x: number, s: number) =>
    poly([[x, 900], [x + 8 * s, 846], [x + 14 * s, 900], [x + 22 * s, 830], [x + 30 * s, 900], [x + 40 * s, 852], [x + 46 * s, 900]], { fill: "#34423a" });
  return (
    path(ridge([[-20, 792], [280, 778], [640, 790], [1000, 770], [1300, 786], [1620, 774]], 900), { fill: "url(#bank)" }) +
    rect(0, 770, 1600, 130, { fill: "url(#ht)", opacity: 0.16 }) +
    tuft(930, 1.3) +
    tuft(1010, 1) +
    tuft(1180, 1.6) +
    tuft(1330, 1.1) +
    tuft(1450, 1.8) +
    tuft(1540, 1.3) +
    g({ fill: OCHRE_L, opacity: 0.85 }, circle(1080, 812, 4), circle(1252, 800, 3.5), circle(1392, 822, 4.5), circle(1506, 806, 3.5))
  );
}

export const tokenToli: Scene = {
  slug: "token-toli",
  render() {
    const defs = [
      printDefs(INK, "#fbe9c4", 31),
      linear("sky", [
        [0, "#5c7591"],
        [0.38, "#8497aa"],
        [0.66, "#c3b19c"],
        [0.8, "#e5c292"],
        [1, "#edcf9c"],
      ]),
      linear("fadeUp", [
        [0, "#ffffff", 0],
        [1, "#ffffff", 1],
      ]),
      el("mask", { id: "skyFade" }, rect(0, 300, 1600, 240, { fill: "url(#fadeUp)" })),
      el("mask", { id: "treeShade" }, g({ fill: "#ffffff" }, circle(90, 480, 112), circle(20, 560, 92), circle(-14, 400, 92))),
      linear("fields", [
        [0, "#b2bb93"],
        [0.4, "#9aa986"],
        [1, "#7d8f72"],
      ]),
      linear("hill", [
        [0, "#8ea17f"],
        [0.35, "#72876a"],
        [1, "#55685a"],
      ]),
      linear("bank", [
        [0, "#4d5f50"],
        [1, "#323f37"],
      ]),
      glow("homeGlow", GLOW, [548, 470], 400, 0.42),
      glow("porchGlow", "#fff0bf", [572, 486], 34, 0.9),
      linear("winLit", [
        [0, "#fbe29e"],
        [1, "#eeb35a"],
      ]),
      linear("wallLit", [
        [0, "#e4d3b2"],
        [1, "#c9b28c"],
      ]),
      el("radialGradient", { id: "lawnGlow" }, el("stop", { offset: 0, "stop-color": GLOW, "stop-opacity": 0.45 }) + el("stop", { offset: 1, "stop-color": GLOW, "stop-opacity": 0 })),
      linear("nearShade", [
        [0, INK, 0],
        [1, INK, 0.4],
      ]),
      linear("pageL", [
        [0, "#f4ecd8"],
        [1, "#e2d6ba"],
      ]),
      linear("pageR", [
        [0, "#f8f1df"],
        [1, "#e6dbc1"],
      ]),
    ];
    const body = [sky(), horizon(), land(), road(), poles(), frameTree(), g({ transform: HOME }, cottage(), garden(), nearPole(), plane()), foreground(), notebook()].join("");
    return svg(defs.join(""), g({ "stroke-linecap": "round", "stroke-linejoin": "round" }, body) + printFinish(0.22, 0.9));
  },
};
