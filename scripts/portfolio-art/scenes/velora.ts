import {
  circle,
  el,
  ellipse,
  g,
  glow,
  line,
  linear,
  n,
  path,
  poly,
  polyline,
  printDefs,
  printFinish,
  pt,
  radial,
  rect,
  smooth,
  svg,
  type P,
  type Scene,
} from "../kit";

/**
 * Velora — "Vendor onboarding, take two" (data/projects.ts: a B2B apparel sourcing marketplace where
 * fashion brands and garment manufacturers swipe to connect and matches turn into bids; no AI).
 * A sunset atelier: a dress form in a draped rose gown stands before a garment rack; an arched window
 * shows a violet → peach sunset over a low skyline of workshops (the manufacturers); on the worktable
 * a fan of fabric swatches, two cards tied together with thread (a match), spools, a tape measure and
 * tailor's shears. Palette: soft violet, dusty rose, peach, cream, plum ink, a touch of gold.
 */

type Attrs = Record<string, string | number | undefined>;

const INK = "#2a1631";
const CREAM = "#f6e7d4";
const GOLD = "#d8a44f";
const GOLD_D = "#b98636";
const ROSE = "#c27888";
const ROSE_D = "#8e4c66";
const ROSE_L = "#eca99c";
const PEACH = "#f2b184";
const PEACH_L = "#fcd9b0";
const VIOLET = "#7d64a0";
const PLUM = "#4a2542";
const FRAME = "#3c2953";
const SUN: P = [1352, 534];
const RAIL = 318;

const ink = (w = 4): Attrs => ({ stroke: INK, "stroke-width": w });
const stroke = (color: string, w: number, opacity?: number): Attrs => ({ fill: "none", stroke: color, "stroke-width": w, opacity });
const ref = (id: string, values: Attrs = {}) => el("use", { href: `#${id}`, ...values });
const clip = (id: string, ...children: string[]) => g({ "clip-path": `url(#${id})` }, ...children);
/** Many straight segments as one path (one set of stroke attributes). */
const segs = (list: readonly (readonly [P, P])[]): string => list.map(([a, b]) => `M${pt(a)}L${pt(b)}`).join("");

function arch(x0: number, x1: number, spring: number, bottom: number): string {
  const r = (x1 - x0) / 2;
  return `M${n(x0)},${n(bottom)}V${n(spring)}A${n(r)},${n(r)} 0 0 1 ${n(x1)},${n(spring)}V${n(bottom)}Z`;
}

const GLASS = arch(1204, 1456, 420, 604);
const TORSO = smooth([[578, 318], [536, 326], [494, 338], [474, 360], [478, 392], [490, 418], [514, 462], [526, 492], [510, 530], [488, 570], [494, 604], [600, 616], [706, 604], [712, 570], [690, 530], [674, 492], [686, 462], [710, 418], [722, 392], [726, 360], [706, 338], [664, 326], [622, 318]], true, 0.9);
const BODICE = smooth([[560, 322], [522, 330], [490, 342], [472, 362], [476, 394], [488, 420], [510, 462], [520, 496], [600, 502], [680, 496], [690, 464], [708, 422], [716, 404], [682, 398], [642, 382], [604, 358], [578, 336]], true, 0.8);
const SKIRT = smooth([[522, 490], [506, 530], [484, 574], [464, 632], [440, 694], [414, 762], [462, 774], [516, 764], [566, 776], [614, 766], [664, 776], [712, 766], [756, 772], [786, 762], [762, 694], [738, 632], [716, 574], [694, 530], [678, 490], [600, 486]], true, 0.9);
const CASCADE = smooth([[534, 496], [612, 502], [664, 566], [716, 648], [762, 730], [790, 768], [752, 774], [736, 742], [708, 730], [694, 690], [664, 676], [650, 634], [620, 620], [606, 580], [578, 566], [566, 530], [540, 520]], true, 0.85);
const CURTAIN = `M-20,-10L214,-10${smooth([[214, -10], [204, 130], [182, 290], [150, 420], [118, 486], [140, 566], [176, 664], [196, 760], [200, 800]]).replace(/^M[^C]*/, "")}L-20,800Z`;

/** Sawtooth factory roofs between x0 and x1 (sloped face up, vertical drop). */
function teeth(x0: number, x1: number, low: number, high: number, w: number): P[] {
  const out: P[] = [];
  for (let x = x0; x < x1 - 1; x += w) out.push([x, low], [x + w, high], [x + w, low]);
  return out;
}

function room(): string {
  const panels = Array.from({ length: 11 }, (_, i) => `M${16 + i * 148},620h120v56h-120z`).join("");
  const seams = segs(Array.from({ length: 15 }, (_, i) => [[-260 + i * 150, 704], [800 + (-260 + i * 150 - 800) * 1.24, 764]] as const));
  return (
    rect(0, 0, 1600, 900, { fill: "url(#wall)" }) +
    rect(0, 250, 1600, 348, { fill: "url(#stripes)" }) +
    rect(0, 604, 1600, 88, { fill: "#433058" }) +
    path(panels, stroke("#57406f", 3)) +
    rect(0, 596, 1600, 10, { fill: "#6b5387" }) +
    rect(0, 690, 1600, 14, { fill: "#2a1b39" }) +
    rect(0, 704, 1600, 60, { fill: "url(#floor)" }) +
    path(seams, stroke("#23142a", 2, 0.5)) +
    // the sunset spilling in from the window, as light and as a light-dot screen
    rect(0, 0, 1600, 900, { fill: "url(#winGlow)" }) +
    circle(1330, 470, 470, { fill: "url(#hl)", mask: "url(#glowFade)", opacity: 0.4 }) +
    poly([[1204, 704], [1456, 704], [1560, 764], [1080, 764]], { fill: PEACH, opacity: 0.3 }) +
    // warm light pooling on the wall behind the form
    circle(650, 440, 460, { fill: "url(#pool)" })
  );
}

function windowView(): string {
  const polar = (r: number, deg: number): P => [1330 + r * Math.cos((deg * Math.PI) / 180), 420 - r * Math.sin((deg * Math.PI) / 180)];
  const near: P[] = [[1204, 604], ...teeth(1204, 1292, 566, 548, 22), [1296, 566], [1296, 500], [1308, 500], [1308, 572], [1382, 572], ...teeth(1382, 1456, 560, 542, 18.5), [1456, 604]];
  const far: P[] = [[1204, 604], [1204, 576], [1236, 576], [1236, 562], [1284, 562], [1284, 572], [1352, 572], [1352, 556], [1400, 556], [1400, 566], [1424, 566], [1424, 514], [1434, 514], [1434, 566], [1456, 566], [1456, 604]];
  const lit = [[1222, 584], [1248, 584], [1274, 584], [1400, 578], [1424, 578]] as const;
  return (
    path(GLASS, { fill: "url(#sunset)" }) +
    clip(
      "gl",
      circle(SUN[0], SUN[1], 190, { fill: "url(#sunGlow)" }),
      circle(SUN[0], SUN[1], 34, { fill: "#ffe8c4" }),
      path(smooth([[1212, 352], [1262, 344], [1318, 350]]), stroke("#c29ab8", 6, 0.55)),
      path(smooth([[1372, 470], [1414, 463], [1456, 468]]), stroke("#f7c7a2", 5, 0.75)),
      poly(far, { fill: "#b88ba6" }),
      g(
        { fill: "#6d5488" },
        poly(near),
        rect(1330, 518, 26, 22, { rx: 3 }),
        path("M1328,518l15,-12l15,12z"),
        path("M1334,540l-2,32M1352,540l2,32", { stroke: "#6d5488", "stroke-width": 3 }),
      ),
      path(smooth([[1302, 496], [1316, 478], [1342, 470], [1380, 456]]), stroke("#d8acb8", 8, 0.45)),
      g({ fill: "#f7c98f", opacity: 0.85 }, ...lit.map(([x, y]) => rect(x, y, 10, 8))),
    ) +
    g(
      { fill: FRAME },
      path(arch(1190, 1470, 420, 604) + GLASS, { "fill-rule": "evenodd" }),
      rect(1325, 294, 10, 310),
      rect(1204, 415, 252, 10),
      rect(1204, 508, 252, 8),
    ) +
    path("M1272,420A58,58 0 0 1 1388,420" + segs([30, 60, 120, 150].map((deg) => [polar(58, deg), polar(126, deg)] as const)), stroke(FRAME, 7)) +
    path(GLASS, stroke(PEACH_L, 3, 0.45)) +
    rect(1176, 604, 308, 14, { fill: "#8a6fa3" }) +
    rect(1184, 618, 292, 8, { fill: "#2c1d3d" }) +
    // a bud vase of pampas on the sill
    path(smooth([[1226, 548], [1236, 520], [1250, 500]]) + smooth([[1232, 560], [1224, 526], [1206, 506]]), stroke("#b99366", 3)) +
    ellipse(1252, 494, 11, 24, { fill: "#f3dcc0", transform: "rotate(28 1252 494)" }) +
    ellipse(1204, 500, 10, 22, { fill: "#ecd0b4", transform: "rotate(-30 1204 500)" }) +
    path("M1226,604c-9,-10 -7,-24 4,-28v-8h10v8c11,4 13,18 4,28z", { fill: "#e8d3c2", ...ink(2.5) })
  );
}

function garment(x: number, kind: "coat" | "dress" | "shirt", color: string, len: number): string {
  const t = RAIL + 20;
  let body: P[];
  if (kind === "dress") body = [[x - 16, t], [x + 16, t], [x + 22, t + 70], [x + 14, t + 100], [x + 46, t + len], [x - 46, t + len], [x - 14, t + 100], [x - 22, t + 70]];
  else if (kind === "shirt") body = [[x - 14, t - 4], [x + 14, t - 4], [x + 34, t + 4], [x + 46, t + 96], [x + 34, t + 100], [x + 32, t + len], [x - 32, t + len], [x - 34, t + 100], [x - 46, t + 96], [x - 34, t + 4]];
  else body = [[x - 16, t - 4], [x + 16, t - 4], [x + 38, t + 6], [x + 48, t + len - 30], [x + 40, t + len], [x - 40, t + len], [x - 48, t + len - 30], [x - 38, t + 6]];
  const shade = body.map(([px, py]) => [Math.min(px, x - 6), py] as P);
  return (
    path(`M${x},${t - 8}v-12a7,7 0 1 1 7,-7`, stroke("#a58a6c", 3)) +
    poly(body, { fill: color }) +
    poly(shade, { fill: INK, opacity: 0.22 }) +
    (kind === "coat" ? poly([[x - 16, t - 4], [x, t + 70], [x + 16, t - 4]], { fill: INK, opacity: 0.25 }) : "") +
    polyline([[x - 30, t + 4], [x, t - 9], [x + 30, t + 4]], stroke("#b0916a", 3.5))
  );
}

function rack(): string {
  const items = [
    [288, "coat", "#54446d", 300],
    [344, "dress", "#6f546c", 330],
    [400, "shirt", "#846572", 250],
    [452, "dress", "#5b4a76", 300],
    [752, "shirt", "#786482", 240],
    [806, "dress", "#86646e", 340],
    [860, "coat", "#624a64", 290],
  ] as const;
  const parts: string[] = [];
  for (const x of [252, 896]) {
    parts.push(rect(x - 5, RAIL, 10, 414), rect(x - 44, 730, 88, 9, { rx: 4 }), circle(x - 36, 744, 7), circle(x + 36, 744, 7));
  }
  parts.push(rect(240, RAIL - 5, 668, 10, { rx: 5 }));
  return (
    g({ fill: "#2b1d3a" }, ...parts) +
    line([246, RAIL - 4], [902, RAIL - 4], { stroke: "#c99a98", "stroke-width": 2, opacity: 0.5 }) +
    items.map(([x, kind, color, len]) => garment(x, kind, color, len)).join("") +
    rect(230, 290, 690, 450, { fill: "url(#hs)", opacity: 0.12 })
  );
}

function bolts(): string {
  const bolt = (x: number, top: number, w: number, color: string, shade: string, rot: number) =>
    g(
      { transform: `rotate(${rot} ${x} 744)` },
      rect(x - w / 2, top, w, 744 - top, { fill: color }),
      rect(x - w / 2, top, w * 0.38, 744 - top, { fill: shade }),
      rect(x + w * 0.18, top, w * 0.12, 744 - top, { fill: "#fff", opacity: 0.22 }),
      ellipse(x, top, w / 2, w * 0.2, { fill: shade }),
      ellipse(x, top, w * 0.3, w * 0.12, { fill: color }),
      ellipse(x, top, w * 0.1, w * 0.05, { fill: INK }),
    );
  return bolt(1530, 400, 50, "#a08ab8", "#6f5a8a", -7) + bolt(1572, 356, 56, "#e7a888", "#b47662", -4) + bolt(1612, 420, 52, "#b86f86", "#86506a", -9);
}

function beam(): string {
  // an airbrushed shaft of low sun from the window across the room to the form
  return poly([[1206, 318], [1210, 596], [800, 748], [560, 748], [600, 420]], { fill: "url(#beam)", filter: "url(#soft)" });
}

function dressForm(): string {
  const pins = [[586, 346], [620, 368], [656, 386]] as const;
  // pleats radiating from the draped shoulder to the waist
  const pleatsDark = [[[560, 340], [530, 494]], [[568, 344], [590, 498]], [[590, 356], [650, 494]], [[624, 374], [690, 470]]] as const;
  const pleatsLight = [[[566, 340], [558, 496]], [[580, 350], [622, 498]], [[606, 364], [676, 486]]] as const;
  const bend = (list: readonly (readonly [P, P])[], dx: number) =>
    list.map(([a, b]) => `M${pt(a)}Q${n((a[0] + b[0]) / 2 + dx)},${n((a[1] + b[1]) / 2)} ${pt(b)}`).join("");
  return (
    // the form: linen-covered torso, neck, cap and brass knob
    ref("torso", { fill: "#eadacb", ...ink(8) }) +
    clip("tc", rect(460, 300, 90, 330, { fill: "#b9a0a8", opacity: 0.8 }), ellipse(600, 326, 34, 10, { fill: "#9c8290", opacity: 0.7 }), path(smooth([[660, 328], [704, 340], [722, 362], [718, 394]]), stroke(PEACH_L, 7))) +
    g(
      ink(4),
      path("M578,322L574,298Q600,292 626,298L622,322Z", { fill: "#e6d4c3" }),
      ellipse(600, 298, 26, 7, { fill: "#f7ebdd", "stroke-width": 3 }),
      rect(596, 276, 8, 20, { fill: GOLD, "stroke-width": 3 }),
      circle(600, 272, 11, { fill: GOLD }),
    ) +
    rect(575, 300, 11, 20, { fill: "#b9a0a8", opacity: 0.8 }) +
    circle(596, 268, 4, { fill: "#fbe6ae" }) +
    // the skirt: rose silk falling in folds, lit from the window side
    ref("skirt", { fill: ROSE, ...ink(8) }) +
    clip(
      "sc",
      poly([[414, 480], [552, 480], [532, 800], [396, 800]], { fill: ROSE_D, opacity: 0.6 }),
      rect(414, 480, 140, 320, { fill: "url(#ht)", opacity: 0.25 }),
      poly([[560, 560], [576, 560], [578, 800], [540, 800]], { fill: ROSE_D, opacity: 0.45 }),
      poly([[520, 560], [532, 560], [494, 800], [478, 800]], { fill: ROSE_L, opacity: 0.35 }),
      path(smooth([[700, 530], [726, 600], [748, 680], [772, 764]]), stroke(PEACH_L, 8, 0.9)),
    ) +
    // the wrap cascade sweeping from the bow at the hip to the far hem
    ref("cascade", { fill: "#d98f96", ...ink(7) }) +
    clip(
      "kc",
      path(smooth([[560, 520], [600, 560], [640, 610], [690, 680], [740, 760]]), stroke(ROSE_D, 14, 0.5)),
      path(smooth([[600, 506], [648, 562], [700, 640], [752, 730]]), stroke(PEACH_L, 9, 0.8)),
      path(smooth([[540, 520], [580, 570], [626, 626], [674, 690], [724, 750]]), stroke(ROSE_D, 6, 0.6)),
    ) +
    // the one-shoulder bodice, pleated from the shoulder
    ref("bodice", { fill: ROSE, ...ink(8) }) +
    clip(
      "bc",
      rect(460, 320, 76, 190, { fill: ROSE_D, opacity: 0.55 }),
      rect(460, 320, 76, 190, { fill: "url(#ht)", opacity: 0.22 }),
      path(bend(pleatsDark, -8), stroke(ROSE_D, 5, 0.7)),
      path(bend(pleatsLight, -8), stroke(ROSE_L, 4, 0.8)),
      path(smooth([[690, 408], [704, 436], [690, 478]]), stroke(PEACH_L, 7, 0.9)),
      path(smooth([[566, 338], [604, 366], [648, 388], [700, 402]]), stroke("#f3b9aa", 5, 0.8)),
    ) +
    // gold sash and bow at the hip
    g(
      ink(3),
      poly([[518, 482], [682, 482], [680, 502], [520, 502]], { fill: GOLD }),
      path("M528,498C520,532 512,562 498,600L514,596C524,562 534,532 540,500Z", { fill: GOLD }),
      path("M538,500C542,536 542,572 536,614L550,608C554,572 554,534 548,500Z", { fill: GOLD_D }),
      path("M532,492C500,470 478,494 500,512Z", { fill: GOLD }),
      path("M532,492C524,460 498,462 504,488Z", { fill: "#e7b65c" }),
      circle(532, 492, 8, { fill: GOLD_D }),
    ) +
    line([546, 487], [672, 487], { stroke: "#fbe0a0", "stroke-width": 3, opacity: 0.8 }) +
    // a tape measure hung round the neck, both tails falling over the gown
    neckTape() +
    // pins along the neckline (a garment in progress)
    path(segs(pins.map(([x, y]) => [[x, y], [x + 10, y - 12]] as const)), stroke("#a39bb0", 2)) +
    g({ fill: GOLD, stroke: INK, "stroke-width": 1.5 }, ...pins.map(([x, y]) => circle(x + 10, y - 12, 3.5)))
  );
}

function neckTape(): string {
  const left = smooth([[586, 312], [568, 334], [556, 384], [552, 430], [554, 466]]);
  const right = smooth([[616, 312], [636, 336], [650, 380], [654, 420], [652, 446]]);
  const band = (d: string) =>
    path(d, stroke(INK, 19)) +
    path(d, stroke("#f0d49a", 13)) +
    path(d, { ...stroke(INK, 13, 0.6), "stroke-dasharray": "1.4 5.6", "stroke-linecap": "butt" }) +
    path(d, stroke("#f0d49a", 6));
  return path("M584,312Q600,300 618,312", stroke(INK, 17)) + band(right) + band(left) + rect(545, 462, 18, 14, { rx: 2, fill: "#b8b0c2", ...ink(3) });
}

function curtain(): string {
  const q = (list: readonly (readonly [number, number])[], y0: number, y1: number, dx: number) =>
    list.map(([a, b]) => `M${a},${y0}Q${n((a + b) / 2 + dx)},${(y0 + y1) / 2} ${b},${y1}`).join("");
  return (
    ref("curtain", { fill: PLUM, ...ink(8) }) +
    clip(
      "cc",
      path(q([[30, 60], [86, 88], [140, 104], [190, 116]], -10, 486, 12) + q([[88, 64], [110, 130]], 494, 800, 0), stroke("#2c1229", 12, 0.55)),
      path(q([[60, 76], [116, 98], [166, 110]], -10, 486, 10) + q([[76, 36], [100, 96], [118, 160]], 494, 800, -6), stroke("#8a4a6c", 7, 0.75)),
      rect(0, 0, 220, 800, { fill: "url(#hs)", opacity: 0.22 }),
    ) +
    // the gold tieback and tassel
    g(
      { fill: GOLD, ...ink(3) },
      path("M-10,474C40,462 100,466 132,480C100,500 40,502 -10,494Z"),
      path("M120,522h16l8,40h-32z"),
      circle(128, 518, 7, { fill: GOLD_D }),
    ) +
    path("M18,472l10,24M44,468l10,28M70,468l10,28M96,470l8,24", stroke(GOLD_D, 3))
  );
}

function table(): string {
  const grain = [[40, 800, 520, 796], [300, 842, 900, 848], [700, 790, 1260, 786], [980, 874, 1560, 868], [1180, 820, 1600, 824]] as const;
  return (
    rect(0, 748, 1600, 152, { fill: "url(#table)" }) +
    rect(0, 748, 1600, 8, { fill: "#94606e" }) +
    path(grain.map(([x1, y1, x2, y2]) => `M${x1},${y1}Q${(x1 + x2) / 2},${(y1 + y2) / 2 + 6} ${x2},${y2}`).join(""), stroke("#2a1522", 3, 0.45)) +
    rect(0, 756, 1600, 144, { fill: "url(#ht)", opacity: 0.14 }) +
    poly([[980, 756], [1490, 756], [1640, 900], [860, 900]], { fill: PEACH, opacity: 0.16, filter: "url(#soft)" }) +
    g(
      { fill: INK, opacity: 0.35 },
      ellipse(1160, 850, 44, 10),
      ellipse(1216, 832, 42, 10),
      ellipse(1272, 860, 46, 11),
      ellipse(1040, 872, 70, 12),
      ellipse(806, 886, 120, 14),
    ) +
    line([0, 748], [1600, 748], ink(4))
  );
}

function fabricStack(): string {
  const layer = (x: number, y: number, w: number, h: number, color: string, fold: string) =>
    rect(x, y, w, h, { rx: 12, fill: color, ...ink(4) }) + rect(x + 10, y + h * 0.55, w - 20, h * 0.3, { rx: 6, fill: fold, opacity: 0.8 });
  return (
    layer(-20, 846, 250, 64, "#6f5890", "#4f3d6c") +
    layer(-10, 806, 226, 46, PEACH, "#d18d6b") +
    layer(0, 772, 200, 40, CREAM, "#e1c9b5") +
    path("M20,776v14M44,776v14M68,776v14M92,776v14M116,776v14M140,776v14M164,776v14", stroke(ROSE, 5)) +
    rect(-20, 772, 250, 140, { fill: "url(#hs)", opacity: 0.12 })
  );
}

function tape(): string {
  const d = smooth([[268, 904], [300, 858], [360, 826], [430, 832], [452, 866], [410, 890], [364, 868], [384, 826], [450, 800], [528, 806], [566, 828]]);
  return (
    path(d, stroke(INK, 23)) +
    path(d, stroke("#f0d49a", 17)) +
    path(d, { ...stroke(INK, 17, 0.7), "stroke-dasharray": "1.6 6.4", "stroke-linecap": "butt" }) +
    path(d, stroke("#f0d49a", 8)) +
    rect(560, 818, 16, 22, { rx: 2, fill: "#b8b0c2", ...ink(3), transform: "rotate(30 568 829)" })
  );
}

function swatchFan(): string {
  const fabrics = [
    ["#6f5890", 0],
    ["#b77a8e", 1],
    [PEACH, 0],
    [GOLD, 2],
    ["#4f3a68", 0],
    ["#e8c6bc", 3],
    [ROSE, 0],
  ] as const;
  const zig = (y: number): P[] => Array.from({ length: 9 }, (_, i) => [20 - i * 5, y + (i % 2) * 5] as P);
  const cards = fabrics.map(([color, motif], i) => {
    const extra =
      motif === 1
        ? g({ fill: "#f6dccf" }, ...[-10, 10].flatMap((x) => [-146, -118, -92].map((y) => circle(x + (y === -118 ? 5 : 0), y, 3.5))))
        : motif === 2
          ? path("M-20,-144h40M-20,-128h40M-20,-112h40M-20,-96h40M-20,-80h40", stroke("#8e5f22", 3))
          : motif === 3
            ? path("M-8,-160v88M8,-160v88M-20,-136h40M-20,-110h40M-20,-86h40", stroke(ROSE_D, 2.5))
            : "";
    return g(
      { transform: `rotate(${-74 + i * 13})` },
      rect(-27, -168, 54, 168, { rx: 6, fill: CREAM, ...ink(3.5) }),
      poly([[-20, -160], [20, -160], ...zig(-70)], { fill: color }),
      extra,
      rect(-20, -52, 26, 5, { fill: "#cbb6a8" }),
    );
  });
  return g({ transform: "translate(846 892) scale(1 .7)" }, ...cards, circle(0, -14, 9, { fill: GOLD, ...ink(3) }));
}

function tiedPair(): string {
  const card = (dx: number, dy: number, a: number, color: string) =>
    g(
      { transform: `translate(${dx} ${dy}) rotate(${a})` },
      rect(-34, -52, 68, 104, { rx: 6, fill: CREAM, ...ink(3.5) }),
      rect(-27, -45, 54, 64, { fill: color }),
      polyline(Array.from({ length: 12 }, (_, i) => [-27 + i * 4.9, 19 + (i % 2) * 5] as P), stroke(color, 4)),
    );
  const wrap = "M-60,-6C-20,-14 22,-12 62,-2";
  return (
    path(smooth([[1196, 832], [1168, 856], [1130, 850], [1094, 836], [1074, 830]]), stroke(GOLD, 2.5)) +
    g(
      { transform: "translate(1060 834) scale(1 .8)" },
      card(-16, 2, -15, "#7d64a0"),
      card(18, -4, 9, ROSE),
      path(wrap, stroke(INK, 7)),
      path(wrap + "M0,-12C-24,-40 -40,-16 -4,-10C-20,-34 10,-40 4,-10C30,-34 40,-10 6,-8M-2,-10l-14,26M4,-10l18,24", stroke(GOLD, 3.5)),
    )
  );
}

function spool(x: number, base: number, h: number, thread: string): string {
  return (
    g(
      ink(3),
      ellipse(x, base, 30, 9, { fill: "#8a5a46" }),
      rect(x - 22, base - h, 44, h, { fill: thread }),
      rect(x - 22, base - h, 44, h, { fill: "url(#tl)", stroke: "none", opacity: 0.3 }),
      rect(x + 6, base - h + 5, 7, h - 10, { fill: "#fff", stroke: "none", opacity: 0.3 }),
      ellipse(x, base - h, 30, 9, { fill: "#c08a64" }),
    ) + ellipse(x, base - h, 7, 2.6, { fill: INK })
  );
}

function shears(): string {
  const handles = "M1508,852C1540,840 1560,822 1580,818M1508,860C1540,874 1556,884 1574,886";
  return (
    g(
      ink(3.5),
      poly([[1508, 846], [1352, 820], [1506, 862]], { fill: "#aca6bd" }),
      poly([[1506, 850], [1360, 868], [1508, 866]], { fill: "#8d86a2" }),
    ) +
    line([1500, 848], [1364, 824], { stroke: "#f1ecf3", "stroke-width": 3, opacity: 0.9 }) +
    // bent tailor's handles, cropped by the frame edge
    g(
      stroke(INK, 18),
      path(handles),
      ellipse(1592, 812, 34, 20),
      ellipse(1600, 880, 40, 22),
    ) +
    g(
      stroke("#3b2342", 11),
      path(handles),
      ellipse(1592, 812, 34, 20),
      ellipse(1600, 880, 40, 22),
    ) +
    path("M1560,800a34,20 0 0 1 36,-8", stroke("#9a6a88", 3, 0.8)) +
    circle(1508, 856, 9, { fill: GOLD, ...ink(3) })
  );
}

export const velora: Scene = {
  slug: "velora",
  render() {
    const defs = [
      printDefs(INK, "#fde3c6", 7),
      linear("wall", [
        [0, "#2d1d42"],
        [0.3, "#402c5a"],
        [0.62, "#57417a"],
        [1, "#614a7f"],
      ]),
      el("pattern", { id: "stripes", width: 46, height: 46, patternUnits: "userSpaceOnUse" }, rect(0, 0, 20, 46, { fill: "#b89ad0", opacity: 0.035 })),
      el("pattern", { id: "tl", width: 8, height: 5, patternUnits: "userSpaceOnUse" }, rect(0, 0, 8, 1.5, { fill: INK })),
      el("filter", { id: "soft", x: -0.2, y: -0.2, width: 1.4, height: 1.4 }, el("feGaussianBlur", { stdDeviation: 9 })),
      glow("winGlow", "#f3a386", [1330, 460], 980, 0.5),
      glow("pool", "#f6ae8e", [650, 440], 460, 0.6),
      radial("fadeR", [
        [0, "#fff", 1],
        [1, "#fff", 0],
      ]),
      el("mask", { id: "glowFade" }, circle(1330, 470, 470, { fill: "url(#fadeR)" })),
      linear("sunset", [
        [0, "#7c67a7"],
        [0.34, "#a67aa7"],
        [0.6, "#dd978c"],
        [0.82, "#f4bd93"],
        [1, "#fbd8a8"],
      ]),
      glow("sunGlow", "#ffe4b8", SUN, 190, 0.85),
      linear("beam", [
        [0, PEACH_L, 0],
        [0.25, PEACH_L, 0.12],
        [1, PEACH_L, 0.4],
      ], 0, 0, 1, 0),
      linear("floor", [
        [0, "#3d2538"],
        [1, "#2a1829"],
      ]),
      linear("table", [
        [0, "#5c3446"],
        [0.3, "#4a2838"],
        [1, "#321a28"],
      ]),
      path(TORSO, { id: "torso" }),
      path(BODICE, { id: "bodice" }),
      path(SKIRT, { id: "skirt" }),
      path(CASCADE, { id: "cascade" }),
      path(CURTAIN, { id: "curtain" }),
      el("clipPath", { id: "tc" }, ref("torso")),
      el("clipPath", { id: "bc" }, ref("bodice")),
      el("clipPath", { id: "sc" }, ref("skirt")),
      el("clipPath", { id: "kc" }, ref("cascade")),
      el("clipPath", { id: "cc" }, ref("curtain")),
      el("clipPath", { id: "gl" }, path(GLASS)),
    ];
    const body = g(
      { "stroke-linecap": "round", "stroke-linejoin": "round" },
      room(),
      windowView(),
      bolts(),
      rack(),
      beam(),
      dressForm(),
      curtain(),
      table(),
      fabricStack(),
      tape(),
      swatchFan(),
      tiedPair(),
      spool(1180, 846, 64, ROSE),
      spool(1238, 828, 56, GOLD),
      spool(1294, 856, 70, VIOLET),
      shears(),
      printFinish(0.22, 0.9),
    );
    return svg(defs.join(""), body);
  },
};
