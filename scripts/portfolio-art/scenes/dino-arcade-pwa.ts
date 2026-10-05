import {
  circle,
  el,
  ellipse,
  g,
  glow,
  line,
  linear,
  path,
  poly,
  printDefs,
  printFinish,
  radial,
  rect,
  smooth,
  star,
  svg,
  type P,
  type Scene,
} from "../kit";

/**
 * Dino Arcade — "your phone is the cabinet" (data/projects.ts: a mobile PWA that turns your phone
 * into an arcade cabinet — marquee, recessed bezel, CRT look, on-screen controller — strictly
 * BYO-ROM, no game data ships or uploads; no AI). A teal phone dressed as a little cabinet stands on
 * a shelf in front of a printed desert dusk: layered mesas, pixel cacti and a big striped low sun
 * that backlights it. On its screen a friendly pixel sauropod walks a pixel desert; on the shelf a
 * blank memory card slides towards it (bring your own file) beside two coins.
 * Palette: teal, warm orange, amber, cream, navy, rust.
 */

const INK = "#22192b";
const TEAL = "#2f7f7a";
const TEAL_D = "#1e5754";
const CREAM = "#f7e6bf";
const NAVY = "#1c2238";
const ORANGE = "#e2803f";
const AMBER = "#f2b94f";
const RUST = "#b64927";
const BRASS = "#d6a24a";
const RIM = "#ffd08a"; // the low sun's rim light
const SUN: P = [610, 488];
const SUN_R = 220;
const PX = 7; // one pixel of the in-game picture

const inked = (w = 4) => ({ stroke: INK, "stroke-width": w, "stroke-linejoin": "round", "stroke-linecap": "round" }) as const;
const stroke = (color: string, width: number, opacity?: number) =>
  ({ fill: "none", stroke: color, "stroke-width": width, "stroke-linecap": "round", "stroke-linejoin": "round", opacity }) as const;

/** Pixel art from rows of characters: each run of one character becomes one rect of that colour. */
function sprite(rows: readonly string[], x0: number, y0: number, size: number, colors: Readonly<Record<string, string>>): string {
  const out: string[] = [];
  rows.forEach((row, r) => {
    let c = 0;
    while (c < row.length) {
      const ch = row[c]!;
      let end = c;
      while (end < row.length && row[end] === ch) end += 1;
      const fill = colors[ch];
      if (fill) out.push(rect(x0 + c * size, y0 + r * size, (end - c) * size, size, { fill }));
      c = end;
    }
  });
  return out.join("");
}

const CACTUS = ["..#..", "..#.#", "#.#.#", "#.###", "###..", "..#..", "..#.."] as const;
/** A friendly sauropod walking right — long neck, round body, stubby legs (not any real game's sprite). */
const DINO = [
  "............###.",
  "...........#####",
  "...........#o###",
  "...........###..",
  "..........###...",
  ".........###....",
  ".....########...",
  "...###########..",
  ".#############..",
  "#####bbbbbbbb#..",
  ".....##...##....",
  ".....##...##....",
] as const;

function sky(): string {
  const stars = ([[118, 76, 2.5], [262, 150, 1.8], [980, 58, 2], [1330, 92, 2.5], [1478, 182, 1.8], [56, 222, 1.8], [1540, 58, 2], [742, 34, 1.6], [420, 60, 1.6], [1180, 170, 1.6]] as const).map(([x, y, r]) => circle(x, y, r));
  return (
    rect(0, 0, 1600, 720, { fill: "url(#sky)" }) +
    path(smooth([[40, 176], [200, 164], [380, 172]]), stroke("#8a3a36", 10, 0.35)) +
    path(smooth([[1080, 206], [1280, 194], [1520, 204]]), stroke("#8a3a36", 12, 0.3)) +
    g({ fill: CREAM, opacity: 0.55 }, ...stars) +
    poly(star(1400, 128, 9, 2.4, 4), { fill: CREAM, opacity: 0.6 }) +
    poly(star(196, 110, 7, 2, 4), { fill: CREAM, opacity: 0.5 }) +
    circle(SUN[0], SUN[1], 640, { fill: "url(#sunGlow)" }) +
    rect(0, 270, 1600, 440, { fill: "url(#hl)", mask: "url(#nearSun)", opacity: 0.45 }) +
    circle(SUN[0], SUN[1], SUN_R, { fill: "url(#sun)", mask: "url(#sunCut)" })
  );
}

function desert(): string {
  const parts: string[] = [];
  // far mesas, hazy in the glow
  parts.push(poly([[0, 700], [0, 590], [90, 588], [118, 566], [260, 562], [290, 590], [480, 600], [700, 606], [860, 600], [892, 578], [1006, 574], [1034, 598], [1240, 602], [1300, 584], [1420, 580], [1452, 600], [1600, 598], [1600, 700]], { fill: "#c9694a" }));
  parts.push(rect(0, 598, 1600, 112, { fill: "url(#floor)" }));
  parts.push(g(stroke("#e08a52", 3, 0.35), path(smooth([[380, 622], [520, 618], [700, 624]])), path(smooth([[760, 640], [940, 634], [1120, 642]])), path(smooth([[300, 664], [480, 658], [640, 666]])), path(smooth([[860, 680], [1040, 674], [1160, 682]]))));
  // mid mesas, backlit, with strata and a rim on the sun side
  const left: P[] = [[-20, 710], [-20, 468], [70, 460], [252, 462], [298, 482], [336, 540], [404, 604], [446, 710]];
  const right: P[] = [[1160, 710], [1196, 590], [1232, 510], [1252, 440], [1424, 432], [1462, 470], [1540, 472], [1600, 462], [1600, 710]];
  parts.push(poly(left, { fill: "#8a372c" }) + poly(right, { fill: "#8a372c" }));
  parts.push(g(stroke("#6e2b26", 5, 0.8), line([-20, 504], [290, 506]), line([-20, 548], [334, 546]), line([1230, 520], [1600, 516]), line([1212, 566], [1600, 560])));
  parts.push(poly(left, { fill: "url(#ht)", opacity: 0.2 }) + poly(right, { fill: "url(#ht)", opacity: 0.2 }));
  parts.push(path("M252,462L298,482L336,540L404,604", stroke(RIM, 4, 0.85)) + path("M1424,432L1252,440L1232,510L1196,590", stroke(RIM, 4, 0.85)));
  // pixel cacti: distant ones small and hazy, near ones dark with a rim on the side facing the sun
  parts.push(g({ opacity: 0.55 }, sprite(CACTUS, 874, 578, 6, { "#": "#5a2a2a" }), sprite(CACTUS, 330, 596, 7, { "#": "#5a2a2a" })));
  parts.push(sprite(CACTUS, 120, 546, 22, { "#": "#1f4a44" }) + sprite(CACTUS, 1196, 532, 24, { "#": "#1f4a44" }) + sprite(CACTUS, 1506, 612, 13, { "#": "#28544c" }));
  parts.push(g({ fill: RIM, opacity: 0.7 }, rect(180, 546, 6, 154), rect(1244, 532, 6, 168)));
  return parts.join("");
}

function shelf(): string {
  return (
    rect(0, 700, 1600, 74, { fill: "url(#shelfTop)" }) +
    line([0, 702], [1600, 702], stroke("#f3b36a", 3)) +
    g(stroke("#5a3022", 2.5, 0.35), path(smooth([[0, 726], [400, 722], [900, 728], [1600, 724]])), path(smooth([[0, 752], [500, 748], [1000, 754], [1600, 750]]))) +
    rect(0, 772, 1600, 128, { fill: "url(#shelfFront)" }) +
    rect(0, 772, 1600, 10, { fill: "#8f5536" }) +
    line([0, 772], [1600, 772], stroke(INK, 4)) +
    g(stroke("#6a3a2a", 3, 0.4), path(smooth([[0, 820], [500, 814], [1100, 822], [1600, 816]])), path(smooth([[0, 858], [600, 852], [1200, 860], [1600, 854]]))) +
    rect(0, 782, 1600, 118, { fill: "url(#ht)", opacity: 0.2 })
  );
}

function screen(): string {
  const x = 518;
  const y = 366;
  const w = 164;
  const h = 170;
  const ground = y + h - 4 * PX;
  const sun = ["..###..", ".#####.", "#######", "#######", ".#####.", "..###.."];
  const mesa = ["....####....", "...######...", "..########..", ".##########."];
  const cloud = ["..###...", ".######.", "########"];
  return (
    rect(x, y, w, h, { fill: "#a9dccb" }) +
    rect(x, y + 52, w, 40, { fill: "#c7e7c8" }) +
    rect(x, y + 92, w, 50, { fill: "#f1e0a6" }) +
    sprite(sun, x + 14, y + 14, PX, { "#": "#f4a947" }) +
    sprite(cloud, x + 98, y + 16, PX, { "#": "#f3f5e8" }) +
    sprite(mesa, x + 80, ground - 4 * PX, PX, { "#": "#c5583a" }) +
    rect(x, ground, w, 4 * PX, { fill: "#e0a458" }) +
    rect(x, ground, w, PX, { fill: "#b9763a" }) +
    rect(x + 28, ground + 2 * PX, 2 * PX, PX, { fill: "#c98a45" }) +
    rect(x + 104, ground + 3 * PX, 3 * PX, PX, { fill: "#c98a45" }) +
    sprite(DINO, x + 18, ground - 12 * PX, PX, { "#": "#3a8f6c", b: "#f3e3b3", o: INK }) +
    rect(x, y, w, h, { fill: "url(#scan)" }) +
    rect(x, y, w, h, { fill: "url(#crt)" }) +
    path(`M${x + 12},${y + 66}Q${x + 14},${y + 14} ${x + 66},${y + 10}`, stroke("#ffffff", 7, 0.3))
  );
}

function phone(): string {
  const k = inked(4);
  const out: string[] = [];
  // shadow on the shelf, cast towards us by the sun behind
  out.push(poly([[470, 738], [730, 738], [800, 774], [400, 774]], { fill: INK, opacity: 0.4 }));
  // the phone: a thin teal body, a side button, the dark glass of its display
  out.push(rect(716, 420, 8, 54, { rx: 3, fill: TEAL_D, ...inked(3) }));
  out.push(rect(484, 300, 232, 414, { rx: 34, fill: TEAL }));
  out.push(
    g(
      { "clip-path": "url(#cBody)" },
      rect(484, 300, 232, 414, { fill: "url(#bodyShade)" }),
      rect(484, 300, 6, 414, { fill: RIM, opacity: 0.9 }),
      rect(710, 300, 6, 414, { fill: RIM, opacity: 0.9 }),
    ),
  );
  out.push(rect(484, 300, 232, 414, { rx: 34, fill: "none", ...k }));
  out.push(rect(499, 314, 202, 388, { rx: 22, fill: NAVY, ...inked(3) }));
  // the app draws the cabinet: a recessed bezel round the game, and the controller on the glass
  out.push(rect(506, 354, 188, 194, { rx: 12, fill: "#2c3552" }));
  out.push(path("M508,546H692", stroke("#56668e", 4)) + path("M510,356H690", stroke("#0b0e1a", 6)));
  out.push(screen());
  out.push(rect(518, 366, 164, 170, { rx: 4, fill: "none", ...inked(3) }));
  out.push(path("M530,586h24v24h24v24h-24v24h-24v-24h-24v-24h24Z", { fill: "#2e3a5e", stroke: "#efdcb4", "stroke-width": 3, "stroke-linejoin": "round" }));
  out.push(circle(542, 622, 6, { fill: "#efdcb4", opacity: 0.5 }));
  out.push(circle(644, 640, 19, { fill: RUST, stroke: "#efdcb4", "stroke-width": 3 }) + circle(672, 604, 19, { fill: AMBER, stroke: "#efdcb4", "stroke-width": 3 }));
  out.push(circle(644, 640, 28, stroke(RUST, 3, 0.35)) + circle(672, 604, 28, stroke(AMBER, 3, 0.35)));
  out.push(line([570, 690], [630, 690], stroke("#efdcb4", 4, 0.5)));
  // a sheen across the glass
  out.push(poly([[560, 312], [620, 312], [510, 520], [496, 520], [496, 430]], { fill: "#ffffff", opacity: 0.05 }));
  // the marquee cap clipped over the top: backlit cream panel with sunset stripes
  out.push(ellipse(600, 308, 240, 100, { fill: "url(#marqGlow)" }));
  out.push(rect(462, 270, 276, 74, { rx: 16, fill: TEAL_D, ...k }));
  out.push(rect(478, 282, 244, 50, { rx: 10, fill: "#fbeac2" }));
  out.push(
    g(
      { "clip-path": "url(#cMarq)" },
      rect(478, 306, 244, 6, { fill: AMBER }),
      rect(478, 315, 244, 6, { fill: ORANGE }),
      rect(478, 324, 244, 8, { fill: RUST }),
      ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => poly([[490 + i * 30, 282], [502 + i * 30, 282], [492 + i * 30, 302], [480 + i * 30, 302]], { fill: TEAL, opacity: 0.8 })),
    ),
  );
  out.push(rect(478, 282, 244, 50, { rx: 10, fill: "none", ...inked(3) }));
  out.push(line([486, 286], [714, 286], stroke("#ffffff", 3, 0.6)));
  // the cabinet plinth the phone stands in, with two lit coin slots
  out.push(rect(462, 694, 276, 46, { rx: 8, fill: TEAL_D, ...k }) + rect(466, 698, 268, 7, { fill: "#5fa89b", opacity: 0.6 }));
  out.push(rect(566, 706, 68, 26, { rx: 4, fill: "#2c3552", ...inked(3) }));
  out.push(g({ fill: "#f2a14a" }, rect(574, 711, 20, 16, { rx: 2 }), rect(606, 711, 20, 16, { rx: 2 })) + g(stroke(INK, 3), line([584, 713], [584, 725]), line([616, 713], [616, 725])));
  return out.join("");
}

function coins(): string {
  return (
    ellipse(372, 756, 30, 10, { fill: "#9c6a2a", ...inked(3.5) }) +
    ellipse(372, 750, 30, 10, { fill: BRASS, ...inked(3.5) }) +
    ellipse(372, 750, 19, 6, { fill: "none", stroke: "#f3d08a", "stroke-width": 3 }) +
    ellipse(424, 742, 22, 5, { fill: INK, opacity: 0.3 }) +
    circle(426, 716, 25, { fill: BRASS, ...inked(3.5) }) +
    circle(426, 716, 16, { fill: "none", stroke: "#a8752f", "stroke-width": 3 }) +
    path("M410,706a18,18 0 0 1 14,-10", stroke("#fff0c0", 4, 0.9))
  );
}

function memoryCard(): string {
  const card = "M-42,-54H24L42,-36V54H-42Z";
  return (
    g(stroke(CREAM, 4, 0.7), line([906, 728], [954, 728]), line([916, 744], [976, 744]), line([906, 760], [944, 760])) +
    ellipse(826, 764, 62, 8, { fill: INK, opacity: 0.35 }) +
    g(
      { transform: "translate(830 742) rotate(-8) scale(1.25 0.56)" },
      path(card, { fill: "#e9dcc2", ...inked(4), "vector-effect": "non-scaling-stroke" }),
      ...[0, 1, 2, 3, 4, 5].map((i) => rect(-32 + i * 11, -48, 7, 20, { fill: BRASS })),
      rect(-30, -14, 60, 52, { rx: 5, fill: "#f7eedb" }),
      path("M-42,40H42", stroke("#b9aa8c", 6)),
    )
  );
}

function pottedCactus(): string {
  const k = inked(4);
  return (
    ellipse(1400, 612, 44, 50, { fill: "#3f7d62", ...k }) +
    g(stroke("#2b5a47", 3.5), path("M1400,564V660"), path("M1382,568Q1370,612 1382,656"), path("M1418,568Q1430,612 1418,656")) +
    path("M1360,590Q1364,566 1384,560", stroke(RIM, 5, 0.9)) +
    circle(1404, 566, 10, { fill: ORANGE, ...inked(3) }) +
    circle(1404, 566, 4, { fill: AMBER }) +
    poly([[1356, 654], [1446, 654], [1436, 740], [1366, 740]], { fill: "#b9582c", ...k }) +
    rect(1348, 644, 106, 20, { rx: 5, fill: "#c9673a", ...k }) +
    rect(1356, 664, 90, 76, { fill: "url(#ht)", opacity: 0.18 })
  );
}

export const dinoArcadePwa: Scene = {
  slug: "dino-arcade-pwa",
  render() {
    const [sx, sy] = SUN;
    const cuts = [
      [2, 5],
      [24, 7],
      [44, 9],
      [62, 11],
      [78, 13],
      [92, 15],
    ] as const;
    const defs = [
      printDefs(INK, "#ffe6b3", 31),
      linear("sky", [
        [0, "#33182a"],
        [0.22, "#4d1f30"],
        [0.42, "#7a2d2e"],
        [0.58, "#b04a30"],
        [0.7, "#da773b"],
        [0.8, "#efa455"],
        [1, "#f6c777"],
      ]),
      linear("sun", [
        [0, "#fff0bd"],
        [0.5, "#f8c860"],
        [1, "#ee8a3a"],
      ]),
      glow("sunGlow", "#ffb257", SUN, 640, 0.6),
      glow("nearSunG", "#ffffff", SUN, 520, 1),
      el("mask", { id: "nearSun" }, rect(0, 0, 1600, 900, { fill: "url(#nearSunG)" })),
      el("mask", { id: "sunCut" }, rect(0, 0, 1600, 900, { fill: "#fff" }) + cuts.map(([dy, hh]) => rect(sx - SUN_R, sy + dy, SUN_R * 2, hh, { fill: "#000" })).join("")),
      linear("floor", [
        [0, "#c5623b"],
        [0.4, "#9a4430"],
        [1, "#6a2a26"],
      ]),
      linear("shelfTop", [
        [0, "#b8764a"],
        [1, "#6e3e2b"],
      ]),
      linear("shelfFront", [
        [0, "#4a2822"],
        [1, "#261415"],
      ]),
      linear("bodyShade", [
        [0, "#2f7f7a", 0],
        [0.55, "#123a3a", 0.25],
        [1, "#0d2a2c", 0.5],
      ]),
      glow("marqGlow", "#ffe7b0", [600, 312], 230, 0.55),
      radial("crt", [
        [0.6, "#0c1a1a", 0],
        [1, "#0c1a1a", 0.35],
      ]),
      el("pattern", { id: "scan", width: 8, height: 4, patternUnits: "userSpaceOnUse" }, rect(0, 0, 8, 1.4, { fill: "#10262a", opacity: 0.35 })),
      el("clipPath", { id: "cBody" }, rect(484, 300, 232, 414, { rx: 34 })),
      el("clipPath", { id: "cMarq" }, rect(478, 282, 244, 50, { rx: 10 })),
    ];
    const body = [sky(), desert(), shelf(), phone(), coins(), memoryCard(), pottedCactus(), printFinish(0.22, 0.9)].join("");
    return svg(defs.join(""), body);
  },
};
