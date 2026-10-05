import {
  circle,
  el,
  ellipse,
  g,
  glow,
  line,
  linear,
  linearUser,
  mix,
  n,
  path,
  poly,
  printDefs,
  printFinish,
  radial,
  rect,
  smooth,
  svg,
  type P,
  type Scene,
} from "../kit";

/**
 * Tegaki — "What your handwriting suggests about you — read and written by hand" (data/projects.ts:
 * a D2C pilot that productizes a fully manual handwriting-analysis practice; no AI anywhere). A
 * writing desk by lantern light: a page of looping cursive under a brass magnifier (the reading), the
 * analyst's vermilion marks, a lacquer fountain pen resting at the end of a fresh line (the writing),
 * and the finished report folded, tied with cord and stamped with a seal. Behind: an indigo sliding
 * panel painted with a vermilion sun over a seigaiha sea. Palette: indigo, washi cream, vermilion,
 * sumi ink, pale gold, walnut.
 */

const INK = "#1d1b2a";
const CREAM = "#f3e8cf";
const VERM = "#cf4b2c";
const GOLD = "#dcb66c";
const GOLD_L = "#f3dca0";
const LAMP = "#f8d992";
const LACQ = "#28232f";
const WOOD_D = "#3a2821";
const BLOSSOM = "#f4e0d2";

const Y_DESK = 446;
const SUN: P = [600, 382];
const SUN_R = 126;
const WAVE_TOP = 388;
const R = 24;
const FL: P = [372, 488];
const FR: P = [872, 474];
const NR: P = [920, 746];
const NL: P = [328, 768];
const LENS: P = [694, 588];
const LRX = 112;
const LRY = 92;
const LAMP_C: P = [1466, 436];

// every stroke in the scene is round-capped and round-joined (set once on the root group)
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

/** A point on the page (u across, v from the far edge to the near edge), in desk perspective. */
const onPage = (u: number, v: number): P => mix(mix(FL, FR, u), mix(NL, NR, u), v);

/** Integer relative polylines — handwriting needs hundreds of points, so keep each one short. */
function inkPath(strokes: readonly (readonly P[])[]): string {
  let d = "";
  for (const pts of strokes) {
    let px = 0;
    let py = 0;
    pts.forEach(([x, y], i) => {
      const rx = Math.round(x);
      const ry = Math.round(y);
      if (i === 0) d += `M${rx} ${ry}l`;
      else {
        const dx = rx - px;
        const dy = ry - py;
        d += `${i === 1 || dx < 0 ? "" : " "}${dx}${dy < 0 ? "" : " "}${dy}`;
      }
      px = rx;
      py = ry;
    });
  }
  return d;
}

/**
 * One line of asemic cursive: a single pen path that drifts forward while it oscillates. Its swing
 * and height wander slowly, so it loops, ripples, dips below the line and flattens into joins; tall
 * strokes always loop and every word starts on the line with a joining stroke. It has the rhythm of
 * handwriting without ever settling into a letter or a word.
 */
function cursiveRow(next: () => number, vb: number, u0: number, u1: number, flourish = false): P[][] {
  const words: P[][] = [];
  const total = (u1 - u0) * 500;
  const [p0, p1, p2, p3] = [next() * 6, next() * 6, next() * 6, next() * 6];
  let s = 4;
  while (s < total - 36) {
    const len = 15 * Math.min(3 + Math.floor(next() * 6), Math.floor((total - s) / 15));
    if (len < 30) break;
    const pts: P[] = [onPage(u0 + (s - 7) / 500, vb + 3 / 272)];
    const steps = Math.round(len / 2.3);
    for (let k = 0; k <= steps; k += 1) {
      const t = s + (k / steps) * len;
      const w = ((t - s) * 2 * Math.PI) / 15;
      const amp = 6 + 14 * Math.sin(t * 0.047 + p1) * (0.62 + 0.38 * Math.sin(t * 0.17 + p2));
      const swing = 3.1 + 3.3 * Math.sin(t * 0.083 + p0);
      const back = swing + Math.max(0, 4.8 - swing) * Math.min(1, Math.max(0, (Math.abs(amp) - 10) / 5));
      const h = amp * (0.5 - 0.5 * Math.cos(w)) + 2.5 * Math.sin(t * 0.03 + p3);
      pts.push(onPage(u0 + (t + back * Math.sin(w) + h * 0.3) / 500, vb - h / 272));
    }
    words.push(pts);
    s += len + 17 + next() * 11;
  }
  const last = words[words.length - 1];
  if (flourish && last) {
    // a closing sweep that loops up and trails off to where the pen nib now rests
    const sx = s - 17;
    for (let k = 1; k <= 12; k += 1) {
      const t = (k / 12) * Math.PI * 2;
      const h = 32 * Math.sin(t / 2) ** 2;
      last.push(onPage(u0 + (sx + 30 * (k / 12) + 10 * Math.sin(t) + h * 0.3) / 500, vb - h / 272));
    }
  }
  return words;
}

function wall(): string {
  const kasumi = (x: number, y: number, w: number, h: number) =>
    rect(x, y, w, h, { rx: h / 2 }) + rect(x + w * 0.16, y - h * 0.62, w * 0.44, h, { rx: h / 2 }) + rect(x + w * 0.66, y + h * 0.5, w * 0.3, h * 0.8, { rx: h * 0.4 });
  return (
    rect(0, 0, 1600, Y_DESK + 4, { fill: "url(#wall)" }) +
    // faint mist bands only: the lettering band stays calm
    g({ fill: "#26366a", opacity: 0.75 }, kasumi(40, 150, 430, 28), kasumi(1070, 120, 400, 24), kasumi(760, 218, 250, 18))
  );
}

function sun(): string {
  return (
    circle(SUN[0], SUN[1], 300, { fill: "url(#sunHalo)" }) +
    circle(SUN[0], SUN[1], SUN_R, { fill: "url(#sunFill)" }) +
    circle(SUN[0], SUN[1], SUN_R, { fill: "url(#hl)", opacity: 0.24, mask: "url(#sunLit)" }) +
    // cloud bars in the panel's own tone: they only show where they cross the disc
    g({ fill: "#21315d" }, rect(456, 310, 214, 17, { rx: 8.5 }), rect(500, 297, 100, 17, { rx: 8.5 }), rect(584, 342, 196, 11, { rx: 5.5 }))
  );
}

/** The seigaiha band: overlapping wave scales from a pattern tile, with a scalloped top edge. */
function waves(): string {
  const x0 = SUN[0] - R * 2 * Math.ceil(SUN[0] / (R * 2)) - R;
  const arcs = `a${R} ${R} 0 0 1 ${R * 2} 0`.repeat(Math.ceil((1640 - x0) / (R * 2)));
  const clip = `M${n(x0)} ${Y_DESK + 6}V${WAVE_TOP + R}${arcs}V${Y_DESK + 6}Z`;
  return (
    path(clip, { fill: "url(#sei)" }) +
    // a long stepped mist bank veils the sea behind the play-button zone, as on a painted screen
    g(
      { fill: "#2c3e72" },
      rect(836, 398, 560, 48, { rx: 24 }),
      rect(900, 378, 250, 36, { rx: 18 }),
      rect(1210, 386, 150, 30, { rx: 15 }),
    )
  );
}

function desk(): string {
  const grain = Array.from({ length: 9 }, (_, i) => {
    const y = Y_DESK + 20 + i * i * 5.6 + i * 14;
    const wob = 4 + i * 1.5;
    return path(smooth([[-20, y], [300, y + wob], [700, y - wob * 0.6], [1100, y + wob * 0.8], [1620, y - wob * 0.4]]), stroke("#4b2e21", 1.6 + i * 0.35, 0.45));
  }).join("");
  return (
    rect(0, Y_DESK, 1600, 900 - Y_DESK, { fill: "url(#desk)" }) +
    grain +
    line([0, Y_DESK + 1], [1600, Y_DESK + 1], stroke(GOLD_L, 3, 0.5)) +
    ellipse(1440, 600, 330, 70, { fill: "url(#pool)" }) +
    rect(0, 700, 1600, 200, { fill: "url(#ht)", opacity: 0.16 })
  );
}

/** The calligrapher's felt under-mat: a dark stage for the cream page. */
function mat(): string {
  const quad: P[] = [[286, 468], [952, 456], [1016, 916], [196, 916]];
  return poly(quad, { fill: "url(#felt)" }) + poly(quad, { fill: "url(#hs)", opacity: 0.22 }) + line([286, 468], [952, 456], stroke("#9a4c38", 3, 0.8));
}

function lampLight(): string {
  return ellipse(LAMP_C[0], LAMP_C[1] + 30, 820, 430, { fill: "url(#lampE)" });
}

function andon(): string {
  const ink = keyline(3);
  return (
    circle(LAMP_C[0], LAMP_C[1], 230, { fill: "url(#lampCore)" }) +
    ellipse(LAMP_C[0], LAMP_C[1] + 40, 380, 250, { fill: "url(#hl)", opacity: 0.4, mask: "url(#lampDots)" }) +
    rect(1392, 540, 12, 46, { fill: WOOD_D, ...ink }) +
    rect(1528, 540, 12, 46, { fill: WOOD_D, ...ink }) +
    ellipse(1466, 590, 112, 10, { fill: INK, opacity: 0.3 }) +
    poly([[1372, 334], [1398, 326], [1398, 548], [1372, 540]], { fill: "#e7b866", ...ink }) +
    rect(1398, 326, 138, 222, { fill: "url(#washiGlow)", ...ink }) +
    g(
      { stroke: "#8a5a36", "stroke-width": 3, opacity: 0.75 },
      line([1467, 330], [1467, 544]),
      line([1402, 400], [1532, 400]),
      line([1402, 474], [1532, 474]),
    ) +
    rect(1392, 320, 150, 12, { fill: WOOD_D, ...ink }) +
    rect(1392, 542, 150, 12, { fill: WOOD_D, ...ink }) +
    poly([[1380, 322], [1554, 322], [1538, 302], [1396, 302]], { fill: WOOD_D, ...ink }) +
    rect(1392, 326, 10, 222, { fill: WOOD_D }) +
    rect(1532, 326, 10, 222, { fill: WOOD_D })
  );
}

/** A plum blossom (radius 20 at the origin), drawn once in defs and placed with <use>. */
function blossomDef(): string {
  const petals = Array.from({ length: 5 }, (_, k) => {
    const a = ((k * 72 - 90) * Math.PI) / 180;
    return circle(Math.cos(a) * 12.4, Math.sin(a) * 12.4, 11);
  }).join("");
  const stamens = Array.from({ length: 5 }, (_, k) => {
    const a = ((k * 72 - 54) * Math.PI) / 180;
    return circle(Math.cos(a) * 8.4, Math.sin(a) * 8.4, 1.8);
  }).join("");
  return el("g", { id: "bl" }, g({ fill: BLOSSOM, stroke: INK, "stroke-width": 2.6 }, petals) + circle(0, 0, 6, { fill: VERM }) + g({ fill: GOLD }, stamens));
}

const blossom = (x: number, y: number, r: number, turn = 0): string =>
  el("use", { href: "#bl", transform: `translate(${x} ${y}) rotate(${turn}) scale(${n(r / 20)})` });

/** The finished report: folded washi, a vermilion seal (an abstract plum mark) and a cord. */
function report(): string {
  const q = (u: number, v: number): P => mix(mix([1086, 600], [1322, 590], u), mix([1066, 714], [1346, 702], u), v);
  const ink = keyline(3.5);
  const box = [q(0, 0), q(1, 0), q(1, 1), q(0, 1)];
  const [sx, sy] = q(0.17, 0.66);
  const crest = Array.from({ length: 5 }, (_, k) => {
    const a = ((k * 72 - 90) * Math.PI) / 180;
    return circle(sx + Math.cos(a) * 8, sy + Math.sin(a) * 7, 3.4);
  }).join("");
  const knot = (u: number, color: string, w: number, rot: number) => {
    const [kx, ky] = q(u, 0.42);
    return ellipse(kx, ky, 20, 11, { ...stroke(color, w), transform: `rotate(${rot} ${n(kx)} ${n(ky)})` });
  };
  return (
    poly(box.map(([x, y]) => [x - 12, y + 9] as P), { fill: INK, opacity: 0.3 }) +
    poly(box, { fill: "#efe2c6", ...ink }) +
    // the folded flap (a diagonal wrap) catching the lamp light
    poly([q(0.34, 0), q(1, 0), q(1, 0.62)], { fill: "#fbf2de", ...ink }) +
    poly([q(0, 0.02), q(0.3, 0.02), q(0.02, 0.98)], { fill: "url(#hs)", opacity: 0.18 }) +
    rect(sx - 19, sy - 18, 38, 36, { rx: 4, fill: VERM, stroke: "#a3361f", "stroke-width": 2, transform: `rotate(-3 ${n(sx)} ${n(sy)})` }) +
    g({ fill: CREAM }, crest, circle(sx, sy, 2.6)) +
    // the cord: three strands wrapped round the fold, knotted in two loops
    line(q(0.64, -0.02), q(0.6, 1.02), stroke(VERM, 5)) +
    line(q(0.675, -0.02), q(0.635, 1.02), stroke(GOLD, 4)) +
    line(q(0.71, -0.02), q(0.67, 1.02), stroke(VERM, 5)) +
    knot(0.6, VERM, 5, -24) +
    knot(0.74, GOLD, 4, 24)
  );
}

function inkBottle(): string {
  const ink = keyline(4);
  return (
    ellipse(240, 540, 74, 12, { fill: INK, opacity: 0.35 }) +
    path("M232,538C214,538 210,528 212,504C214,482 228,472 258,468L302,468C332,472 346,482 348,504C350,528 346,538 328,538Z", { fill: "#2c2b48", ...ink }) +
    path("M324,482C338,488 342,504 340,524", stroke("#9aa0c6", 6, 0.8)) +
    path("M224,488C218,500 218,518 222,528", stroke("#11101c", 6, 0.6)) +
    ellipse(280, 498, 30, 6, { fill: "#3e3d63", opacity: 0.8 }) +
    rect(260, 450, 40, 20, { fill: "#1f1e33", ...ink }) +
    rect(254, 424, 52, 30, { rx: 5, fill: GOLD, ...ink }) +
    g({ stroke: "#a9853f", "stroke-width": 2.5 }, line([268, 428], [268, 450]), line([280, 428], [280, 450]), line([292, 428], [292, 450])) +
    line([300, 429], [300, 448], stroke(GOLD_L, 3))
  );
}

/** The sample page: deckled washi edges, tape at the far corners, the handwriting on top. */
function page(hw: string): string {
  const next = rand(71);
  const edge: P[] = [];
  const corners = [FL, FR, NR, NL] as const;
  corners.forEach((a, i) => {
    const b = corners[(i + 1) % 4] ?? FL;
    for (let k = 0; k < 12; k += 1) {
      const p = mix(a, b, k / 12);
      edge.push(k === 0 ? p : [p[0] + (next() - 0.5) * 3, p[1] + (next() - 0.5) * 3]);
    }
  });
  const tape = (c: P, angle: number, fill: string, dots: boolean) => {
    const zig = [[-13, 0], [-7, 4], [-1, -2], [6, 4], [13, 0]] as const;
    const shape: P[] = [...zig.map(([y, dx]) => [-46 + dx, y] as P), ...zig.map(([y, dx]) => [46 + dx, -y] as P)];
    const marks = dots
      ? [-30, -12, 6, 24].map((x) => circle(x, 0, 3.4, { fill: CREAM, opacity: 0.9 })).join("")
      : [-26, -8, 10, 28].map((x) => line([x, -13], [x - 8, 13], stroke("#b58c47", 3, 0.8))).join("");
    return g({ transform: `translate(${n(c[0])} ${n(c[1])}) rotate(${angle})`, opacity: 0.92 }, poly(shape, { fill, stroke: INK, "stroke-width": 2 }), marks);
  };
  return (
    poly(edge.map(([x, y]) => [x - 15, y + 12] as P), { fill: "#0c0b16", opacity: 0.45 }) +
    poly(edge, { fill: "url(#pageLit)", ...keyline(4) }) +
    poly([FL, mix(FL, FR, 0.5), mix(NL, NR, 0.45), NL], { fill: "url(#hs)", opacity: 0.08 }) +
    hw +
    tape(mix(FR, [848, 496], 0.25), 38, VERM, true) +
    tape(mix(FL, [396, 510], 0.25), -36, GOLD, false)
  );
}

function handwriting(): { svg: string; nib: P } {
  const next = rand(4242);
  const rows = [0.17, 0.33, 0.49, 0.65, 0.81];
  const rules = rows.map((v) => line(onPage(0.04, v + 0.012), onPage(0.96, v + 0.012))).join("");
  const strokes: P[][] = [];
  rows.forEach((v, i) => {
    const last = i === rows.length - 1;
    strokes.push(...cursiveRow(next, v, 0.06 + next() * 0.03, last ? 0.42 : 0.94, last));
  });
  const lastStroke = strokes[strokes.length - 1];
  const nib = lastStroke?.[lastStroke.length - 1] ?? onPage(0.5, 0.81);
  const svgOut = g(
    {},
    g({ stroke: VERM, "stroke-width": 1.5, opacity: 0.32 }, rules) +
      path(inkPath(strokes), stroke(INK, 3.4)) +
      // the analyst's vermilion ticks in the margin
      [0.17, 0.49].map((v) => path(`M${onPage(0.94, v - 0.03).map(n).join(",")}l5 7 11-15`, stroke(VERM, 3))).join(""),
  );
  return { svg: svgOut, nib };
}

function pen(nib: P): string {
  const angle = 39;
  const len = 244;
  const a = (angle * Math.PI) / 180;
  const end: P = [nib[0] - len * Math.cos(a), nib[1] - len * Math.sin(a)];
  const ink = keyline(3.5);
  return (
    g({ transform: `translate(${n(end[0] - 10)} ${n(end[1] + 10)}) rotate(${angle})` }, rect(0, -12, len - 6, 24, { rx: 12, fill: "#0c0b16", opacity: 0.4 })) +
    g(
      { transform: `translate(${n(end[0])} ${n(end[1])}) rotate(${angle})` },
      rect(0, -13, 114, 26, { rx: 12, fill: LACQ, ...ink }),
      line([10, -6], [104, -6], stroke("#5c5673", 4, 0.9)),
      rect(106, -13, 10, 26, { fill: GOLD, ...ink }),
      rect(116, -11, 58, 22, { rx: 2, fill: LACQ, ...ink }),
      line([120, -5], [170, -5], stroke("#5c5673", 3.5, 0.9)),
      rect(172, -10, 8, 20, { fill: GOLD, ...ink }),
      poly([[180, -9], [198, -8], [198, 8], [180, 9]], { fill: LACQ, ...ink }),
      path("M196,-9C216,-9 230,-5 244,0C230,5 216,9 196,9Z", { fill: GOLD, ...ink }),
      path("M200,-6C214,-6 226,-3 236,0", stroke(GOLD_L, 2.5)),
      line([216, 0], [244, 0], { stroke: INK, "stroke-width": 1.8 }),
      circle(214, 0, 2.4, { fill: INK }),
      rect(16, -18, 78, 7, { rx: 3.5, fill: GOLD, ...keyline(2.5) }),
      circle(92, -14.5, 5, { fill: GOLD, ...keyline(2.5) }),
    ) +
    circle(nib[0] + 1, nib[1] + 1, 4.5, { fill: INK }) +
    circle(nib[0] + 2.4, nib[1] - 0.2, 1.4, { fill: GOLD_L })
  );
}

/**
 * What the glass shows: the writing at about 2.5×, where it stops looking like writing at all — two
 * bold ink strokes cut by the rim (a tall loop's crossing, a descender), the ruling, and the
 * analyst's vermilion circle and dashed baseline gauge.
 */
function lensView(): string {
  const [cx, cy] = LENS;
  const at = (pts: readonly P[]) => smooth(pts.map(([x, y]) => [x + cx, y + cy] as P));
  return (
    g({ stroke: VERM, "stroke-width": 3.4, opacity: 0.3 }, line([cx - 120, cy - 78], [cx + 120, cy - 84]), line([cx - 120, cy + 32], [cx + 120, cy + 26])) +
    g(
      { fill: "none", stroke: INK, "stroke-width": 8.5 },
      path(at([[-140, 26], [-112, 18], [-90, 0], [-74, 10], [-56, 20], [-34, 12], [-14, -24], [8, -74], [6, -112], [-14, -104], [-18, -60], [-4, -12], [16, 16], [42, 22], [62, 8], [78, -6], [90, 8], [106, 20], [140, 12]])),
      path(at([[-140, 118], [-104, 126], [-78, 112], [-62, 76], [-64, 52], [-82, 58], [-80, 96], [-60, 124], [-20, 128], [20, 122], [48, 104], [62, 70], [56, 50], [40, 58], [44, 96], [68, 124], [140, 120]])),
    ) +
    path(at([[-26, -8], [-12, -30], [4, -70]]), stroke("#5b5873", 3, 0.6)) +
    ellipse(cx - 10, cy - 40, 34, 30, { ...stroke(VERM, 4), transform: `rotate(-10 ${cx - 10} ${cy - 40})` }) +
    line([cx - 92, cy + 30], [cx + 110, cy + 25], { ...stroke(VERM, 3.4), "stroke-dasharray": "10 10" })
  );
}

function magnifier(): string {
  const [cx, cy] = LENS;
  const a = (30 * Math.PI) / 180;
  const r0: P = [cx + LRX * Math.cos(a), cy + LRY * Math.sin(a)];
  const dir: P = [Math.cos((26 * Math.PI) / 180), Math.sin((26 * Math.PI) / 180)];
  const at = (d: number): P => [r0[0] + dir[0] * d, r0[1] + dir[1] * d];
  return (
    // the raised lens throws a ring of shadow on the page
    ellipse(cx - 20, cy + 15, LRX + 2, LRY + 2, { ...stroke("#0c0b16", 15, 0.28) }) +
    line([at(0)[0] - 20, at(0)[1] + 15], [at(150)[0] - 20, at(150)[1] + 15], stroke("#0c0b16", 26, 0.3)) +
    // handle: gold ferrule + vermilion lacquer grip
    line(at(24), at(152), { ...stroke(INK, 34) }) +
    line(at(24), at(152), { ...stroke("#9b3a24", 26) }) +
    line(at(40), at(146), { ...stroke("#cf6a45", 6, 0.85), transform: "translate(0 -7)" }) +
    line(at(-4), at(34), { ...stroke(INK, 38), "stroke-linecap": "butt" }) +
    line(at(-2), at(32), { ...stroke(GOLD, 30), "stroke-linecap": "butt" }) +
    line(at(4), at(26), { ...stroke(GOLD_L, 5), transform: "translate(0 -8)" }) +
    // the glass: magnified page + handwriting, a cool tint and a reflection
    g(
      { "clip-path": "url(#lensClip)" },
      rect(cx - LRX, cy - LRY, LRX * 2, LRY * 2, { fill: "url(#pageLit)" }),
      lensView(),
      ellipse(cx, cy, LRX, LRY, { fill: "url(#glass)" }),
      path(`M${cx + 18},${cy - LRY + 16}C${cx + 66},${cy - LRY + 18} ${cx + LRX - 14},${cy - 38} ${cx + LRX - 12},${cy + 4}`, stroke("#ffffff", 9, 0.55)),
    ) +
    ellipse(cx, cy, LRX, LRY, { fill: "none", stroke: GOLD, "stroke-width": 14 }) +
    path(`M${cx - LRX},${cy}A${LRX} ${LRY} 0 0 0 ${n(cx + LRX * 0.2)},${n(cy + LRY * 0.98)}`, stroke("#a07c3c", 7, 0.9)) +
    path(`M${n(cx + LRX * 0.1)},${n(cy - LRY * 0.99)}A${LRX} ${LRY} 0 0 1 ${cx + LRX},${cy}`, stroke(GOLD_L, 5)) +
    ellipse(cx, cy, LRX + 7, LRY + 7, { fill: "none", ...keyline(4) }) +
    ellipse(cx, cy, LRX - 7, LRY - 7, { fill: "none", ...keyline(3) })
  );
}

function plum(): string {
  const branch = (pts: readonly P[], w: number) => path(smooth(pts), { ...stroke(INK, w + 6) }) + path(smooth(pts), { ...stroke("#4a2d27", w) });
  const buds = (
    [
      [236, 318],
      [58, 392],
      [258, 404],
      [150, 366],
      [22, 572],
    ] as const
  )
    .map(([x, y]) => circle(x, y, 6.5, { fill: "#e7a28e", ...keyline(2.5) }))
    .join("");
  return (
    branch([[118, 732], [104, 650], [128, 566], [116, 486], [150, 408], [192, 342], [230, 314]], 14) +
    branch([[122, 530], [84, 476], [48, 430], [26, 392]], 8) +
    branch([[150, 410], [202, 414], [252, 400]], 6) +
    branch([[112, 640], [64, 606], [24, 576]], 7) +
    buds +
    blossom(194, 340, 22) +
    blossom(46, 428, 20, 20) +
    blossom(126, 470, 18, 40) +
    blossom(216, 412, 17, 10) +
    blossom(78, 604, 19, 30) +
    blossom(140, 560, 15) +
    // the jar it stands in, cropped by the frame
    path("M84,726C72,742 60,756 38,778C12,806 4,850 14,912L204,912C214,850 206,806 180,778C158,756 146,742 136,726Z", { fill: "#2b2a44", ...keyline(4) }) +
    path("M156,752C178,776 196,812 196,860", stroke("#5a5b85", 8, 0.8)) +
    path("M28,812C22,838 22,866 26,900", stroke("#161525", 10, 0.6)) +
    rect(80, 716, 60, 14, { rx: 4, fill: "#3b3a5c", ...keyline(3.5) }) +
    path("M20,800C70,812 150,812 200,800", stroke(GOLD, 4, 0.7))
  );
}

/** A roll of the same vermilion washi tape, a strip pulled out across the felt. */
function tapeRoll(): string {
  const ink = keyline(3.5);
  const dots = [-40, -14, 12, 38].map((dx, i) => circle(860 + dx, 842 + (i % 2) * 4 - Math.abs(dx) * 0.12, 4, { fill: CREAM, opacity: 0.9 })).join("");
  return (
    poly([[620, 874], [804, 850], [810, 880], [626, 906]], { fill: VERM, opacity: 0.9, ...keyline(2.5) }) +
    [650, 690, 730, 770].map((x) => circle(x, 884 - (x - 620) * 0.13, 3.4, { fill: CREAM, opacity: 0.85 })).join("") +
    path("M796,846V872A64,34 0 0 0 924,872V846Z", { fill: "#9c3822", ...ink }) +
    ellipse(860, 846, 64, 34, { fill: VERM, ...ink }) +
    dots +
    ellipse(860, 846, 36, 18, { fill: "#3a1614", ...keyline(3) }) +
    path("M826,840A36,18 0 0 1 894,840", stroke("#7a2e22", 5, 0.8))
  );
}

function teacup(): string {
  const ink = keyline(4);
  return (
    ellipse(1444, 900, 110, 20, { fill: INK, opacity: 0.3 }) +
    path("M1414,762L1428,912L1546,912L1560,762Z", { fill: "#2f3e6c", ...ink }) +
    path("M1414,762C1416,786 1420,800 1432,800C1446,800 1446,784 1460,784C1474,784 1476,806 1492,806C1508,806 1510,786 1524,786C1538,786 1544,800 1558,790L1560,762Z", { fill: "#e9dcc0", ...keyline(3) }) +
    path("M1418,812L1428,900", stroke("#1c2749", 12, 0.6)) +
    path("M1546,800L1540,900", stroke("#6b7db0", 6, 0.7)) +
    ellipse(1487, 762, 73, 17, { fill: "#e9dcc0", ...ink }) +
    ellipse(1487, 764, 62, 12, { fill: "#a88e4c" }) +
    ellipse(1500, 762, 22, 4, { fill: GOLD_L, opacity: 0.7 }) +
    path(smooth([[1470, 744], [1458, 716], [1478, 690], [1466, 660]]), stroke(CREAM, 5, 0.35)) +
    path(smooth([[1500, 742], [1512, 712], [1494, 682], [1506, 648]]), stroke(CREAM, 4, 0.28))
  );
}

export const tegaki: Scene = {
  slug: "tegaki",
  render() {
    const hw = handwriting();
    const [cx, cy] = LENS;
    const defs = [
      printDefs(INK, "#f7e4b8", 17),
      linear("wall", [
        [0, "#131c39"],
        [0.5, "#1c2a54"],
        [1, "#293c6c"],
      ]),
      glow("sunHalo", "#d9563a", SUN, 300, 0.3),
      el("radialGradient", { id: "sunFill", cx: 0.4, cy: 0.36, r: 0.7 }, el("stop", { offset: 0, "stop-color": "#e46a41" }) + el("stop", { offset: 1, "stop-color": "#c2412a" })),
      linear("fadeDown", [
        [0, "#ffffff", 0.9],
        [0.55, "#ffffff", 0],
      ]),
      el("mask", { id: "sunLit" }, rect(SUN[0] - SUN_R, SUN[1] - SUN_R, SUN_R * 2, SUN_R * 2, { fill: "url(#fadeDown)" })),
      el(
        "pattern",
        { id: "sei", width: R * 2, height: R, patternUnits: "userSpaceOnUse", x: SUN[0] - R * 2 * Math.ceil(SUN[0] / (R * 2)), y: WAVE_TOP + R },
        (
          [
            [0, 0],
            [R * 2, 0],
            [R, R / 2],
            [0, R],
            [R * 2, R],
            [R, R * 1.5],
          ] as const
        )
          .map(
            ([x, y]) =>
              circle(x, y, R, { fill: "#1d2b56" }) +
              g({ fill: "none", stroke: "#3a5188", "stroke-width": 2.4 }, circle(x, y, R * 0.84), circle(x, y, R * 0.6), circle(x, y, R * 0.36)) +
              circle(x, y, R * 0.13, { fill: "#3a5188" }),
          )
          .join(""),
      ),
      linear("desk", [
        [0, "#8f5d3b"],
        [0.3, "#76492f"],
        [0.7, "#553322"],
        [1, "#3b2319"],
      ]),
      linear("felt", [
        [0, "#6a2a23"],
        [1, "#3e1716"],
      ]),
      radial("lampE", [
        [0, LAMP, 0.5],
        [0.4, LAMP, 0.2],
        [1, LAMP, 0],
      ]),
      radial("pool", [
        [0, LAMP, 0.45],
        [1, LAMP, 0],
      ]),
      glow("lampCore", "#fbe3a6", LAMP_C, 230, 0.75),
      linear("washiGlow", [
        [0, "#f6d58c"],
        [0.45, "#fff3cf"],
        [1, "#f1c778"],
      ]),
      linearUser("pageLit", [
        [0, "#e2d0ad"],
        [1, "#fbf3e0"],
      ], [330, 0], [930, 0]),
      radial("glass", [
        [0, "#ffffff", 0],
        [0.7, "#e8efe6", 0.08],
        [1, "#9fb3b0", 0.35],
      ]),
      el("clipPath", { id: "lensClip" }, ellipse(cx, cy, LRX - 6, LRY - 6)),
      radial("fadeOut", [
        [0, "#ffffff", 1],
        [1, "#ffffff", 0],
      ]),
      el("mask", { id: "lampDots" }, ellipse(LAMP_C[0], LAMP_C[1] + 40, 380, 250, { fill: "url(#fadeOut)" })),
      blossomDef(),
    ];
    const body = [
      wall(),
      sun(),
      waves(),
      desk(),
      lampLight(),
      mat(),
      andon(),
      report(),
      inkBottle(),
      page(hw.svg),
      pen(hw.nib),
      magnifier(),
      blossom(1000, 780, 12, 15),
      blossom(1372, 690, 11, 40),
      plum(),
      tapeRoll(),
      teacup(),
    ].join("");
    return svg(defs.join(""), g({ "stroke-linecap": "round", "stroke-linejoin": "round" }, body) + printFinish(0.22, 0.9));
  },
};
