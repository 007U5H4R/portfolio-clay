import {
  circle,
  el,
  ellipse,
  g,
  glow,
  line,
  linear,
  linearUser,
  n,
  path,
  poly,
  polyline,
  printDefs,
  printFinish,
  pt,
  radial,
  rect,
  ridge,
  star,
  svg,
  type P,
  type Scene,
} from "../kit";

/**
 * Cinematic Portfolio — "A portfolio, on film" (data/projects.ts: a scroll-driven film portfolio,
 * Apple-product-page style, no build step). A dusky screening room: a vintage two-reel projector on
 * a wooden stand throws a warm beam full of dust motes across the room onto a curtained screen showing
 * mountains at sunrise (no person), over a row of empty seats. A film strip curls through the
 * foreground like a scroll, its frames running the sunrise frame by frame; a blank clapperboard and a
 * director's chair frame the edges. Palette: deep indigo navy, film amber, cream, rust, teal-grey.
 */

const INK = "#161a2e";
const CREAM = "#f2e6c8";
const RUST = "#a6442b";
const TEAL = "#5e7a79";
const LENS: P = [842, 522];
const SCR = { x: 1200, y: 302, w: 360, h: 270 } as const;
const PLAY: P = [1024, 470];
const BEAM_TOP: P = [SCR.x, SCR.y];
const BEAM_BOTTOM: P = [SCR.x, SCR.y + SCR.h];

// round caps and joins are set once on the scene's wrapper group (smaller file), so these only colour
const inked = (width = 4) => ({ stroke: INK, "stroke-width": width }) as const;
const stroke = (color: string, width: number, opacity?: number) => ({ fill: "none", stroke: color, "stroke-width": width, opacity }) as const;
const int = (p: P): P => [Math.round(p[0]), Math.round(p[1])];

/** A tiny deterministic PRNG (mulberry32): the dust motes land in the same place on every build. */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smoothstep = (x: number): number => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

/** The crescent of a disc left uncovered by the same disc shifted by (ox, oy): a form shadow. */
function crescent(cx: number, cy: number, r: number, ox: number, oy: number): string {
  const d = Math.hypot(ox, oy);
  const h = Math.sqrt(r * r - (d * d) / 4);
  const m: P = [cx + ox / 2, cy + oy / 2];
  const a: P = [m[0] - (oy / d) * h, m[1] + (ox / d) * h];
  const b: P = [m[0] + (oy / d) * h, m[1] - (ox / d) * h];
  return `M${pt(a)}A${n(r)},${n(r)} 0 1,1 ${pt(b)}A${n(r)},${n(r)} 0 0,0 ${pt(a)}Z`;
}

function room(): string {
  // broad acoustic panels (barely lighter), the screen's light washing the wall, a dark rust carpet
  const panels = Array.from({ length: 9 }, (_, i) => rect(i * 192 - 40, 0, 96, 690, { fill: "#3a3056", opacity: 0.2 })).join("");
  return (
    rect(0, 0, 1600, 690, { fill: "url(#wall)" }) +
    panels +
    circle(1380, 437, 700, { fill: "url(#spill)" }) +
    circle(600, 490, 360, { fill: "url(#lampHaze)" }) +
    rect(0, 686, 1600, 214, { fill: "url(#floor)" }) +
    rect(0, 598, 1600, 88, { fill: "#161226", opacity: 0.5 }) +
    rect(0, 590, 1600, 10, { fill: "#3c3454" }) +
    rect(0, 590, 1600, 2, { fill: "#e6b16c", opacity: 0.35 }) +
    rect(0, 600, 1600, 4, { fill: INK, opacity: 0.5 }) +
    rect(0, 682, 1600, 9, { fill: "#10131f", opacity: 0.75 }) +
    ellipse(1380, 742, 380, 56, { fill: "#f3c47f", opacity: 0.12 }) +
    rect(0, 690, 1600, 210, { fill: "url(#ht)", opacity: 0.1 })
  );
}

function screen(): string {
  const { x, y, w, h } = SCR;
  const sun: P = [x + w * 0.53, y + h * 0.66];
  // a peak with jagged flanks; the flank turned to the sun catches the light
  const peak = (cx: number, top: number, half: number, base: number, fill: string, lit: string) => {
    const s = cx < sun[0] ? 1 : -1;
    const hh = base - top;
    const at = (fx: number, fy: number): P => [cx + fx * half, top + fy * hh];
    const near = [at(s * 0.22, 0.26), at(s * 0.3, 0.36), at(s * 0.52, 0.46), at(s, 1)];
    const far = [at(-s, 1), at(-s * 0.46, 0.5), at(-s * 0.3, 0.34), at(-s * 0.14, 0.2)];
    return poly([...far, [cx, top], ...near], { fill }) + poly([[cx, top], ...near, at(s * 0.34, 1), at(s * 0.2, 0.7), at(s * 0.26, 0.5), at(s * 0.08, 0.3)], { fill: lit });
  };
  const rays = [-150, -118, -90, -62, -30].map((deg) => {
    const a0 = ((deg - 5) * Math.PI) / 180;
    const a1 = ((deg + 5) * Math.PI) / 180;
    return poly([sun, [sun[0] + 300 * Math.cos(a0), sun[1] + 300 * Math.sin(a0)], [sun[0] + 300 * Math.cos(a1), sun[1] + 300 * Math.sin(a1)]]);
  });
  const near = ridge([[x - 10, y + 228], [x + 60, y + 216], [x + 150, y + 230], [x + 250, y + 214], [x + 330, y + 224], [x + w + 10, y + 218]], y + h);
  const glints = [0, 1, 2, 3, 4]
    .map((i) => line([sun[0] - 30 + i * 5, y + 246 + i * 6], [sun[0] + 30 - i * 5, y + 246 + i * 6], stroke("#fff1cf", 3, 0.8 - i * 0.12)))
    .join("");
  return (
    rect(x - 18, y - 18, w + 36, h + 36, { fill: "#0f121d" }) +
    g(
      { "clip-path": "url(#scr)" },
      rect(x, y, w, h, { fill: "url(#scrSky)" }),
      circle(sun[0], sun[1], 190, { fill: "url(#scrSun)" }),
      g({ fill: "#fff2cc", opacity: 0.2 }, ...rays),
      circle(sun[0], sun[1], 36, { fill: "#fff5da" }),
      peak(x + 74, y + 100, 150, y + 210, "#b88f7c", "#e2b389"),
      peak(x + 300, y + 88, 150, y + 210, "#b48a79", "#dfae86"),
      peak(x + 6, y + 148, 118, y + 238, "#667c7a", "#8ea297"),
      peak(x + 190, y + 172, 96, y + 238, "#627775", "#869a92"),
      peak(x + 352, y + 146, 118, y + 238, "#667c7a", "#8ea297"),
      path(near, { fill: "#3d5255" }),
      rect(x, y + 238, w, 40, { fill: "#8b9e98" }),
      glints,
      rect(x, y, w, h, { fill: "url(#hl)", opacity: 0.3 }),
      rect(x, y, w, h, { fill: "url(#scrVig)" }),
    ) +
    rect(x, y, w, h, { fill: "none", stroke: "#f7dfae", "stroke-width": 2, opacity: 0.45 })
  );
}

function drapes(): string {
  const scallops = Array.from({ length: 9 }, (_, i) => `Q${1572 - i * 56},318 ${1544 - i * 56},296`).join("");
  return (
    // left drape, gathered at a gold tie-back
    path("M1128,290L1208,290C1206,380 1190,470 1186,520C1192,580 1200,640 1202,690L1138,690C1142,640 1148,580 1152,520C1144,450 1132,370 1128,290Z", { fill: "#7a2f24" }) +
    path("M1194,292C1190,390 1176,470 1176,520C1180,590 1190,640 1192,688", stroke("#a8472d", 9, 0.85)) +
    path("M1150,292C1152,390 1160,470 1164,520C1160,590 1154,640 1154,688", stroke("#56211b", 7, 0.8)) +
    rect(1150, 514, 38, 12, { rx: 5, fill: "#c89245" }) +
    // right drape (mostly beyond the frame)
    path("M1600,290L1556,290C1558,380 1574,470 1580,520C1572,580 1564,640 1562,690L1600,690Z", { fill: "#7a2f24" }) +
    path("M1568,292C1572,390 1584,470 1588,520C1582,590 1574,640 1574,688", stroke("#a8472d", 8, 0.8)) +
    // the valance with its scalloped hem
    path(`M1600,262V296${scallops}H1090V262Z`, { fill: "#6a281f" }) +
    path("M1096,276H1600", stroke("#8e3a28", 4, 0.7))
  );
}

function seats(): string {
  const far: string[] = [];
  const near: string[] = [];
  for (let x = 1134; x < 1640; x += 72) far.push(el("use", { href: "#seat", transform: `translate(${x} 620) scale(.72)` }));
  for (let x = 990; x < 1640; x += 100) near.push(el("use", { href: "#seat", transform: `translate(${x} 662)` }));
  return g({ fill: "#1e233a" }, ...far) + g({ fill: "#151a2b" }, ...near);
}

function beam(): string {
  const r = rng(7);
  const buckets: string[][] = [[], [], []];
  const sparks: string[] = [];
  for (let i = 0; i < 88; i += 1) {
    const u = Math.pow(r(), 1.5);
    const v = r();
    const top: P = [LENS[0] + (BEAM_TOP[0] - LENS[0]) * u, LENS[1] - 16 + (BEAM_TOP[1] - LENS[1] + 16) * u];
    const bottom: P = [LENS[0] + (BEAM_BOTTOM[0] - LENS[0]) * u, LENS[1] + 16 + (BEAM_BOTTOM[1] - LENS[1] - 16) * u];
    const x = top[0] + (bottom[0] - top[0]) * v;
    const y = top[1] + (bottom[1] - top[1]) * (0.08 + v * 0.84);
    const size = 1.1 + r() * 2.6;
    const level = Math.floor(r() * 3);
    if (Math.hypot(x - PLAY[0], y - PLAY[1]) < 112 || x < 862) continue;
    if (i % 14 === 5) sparks.push(poly(star(x, y, 7 + size * 1.6, 1.4, 4, -90), { fill: "#fff3d2", opacity: 0.8 }));
    else buckets[level]?.push(`M${Math.round(x - size)},${Math.round(y)}a${n(size)},${n(size)} 0 1,0 ${n(size * 2)},0a${n(size)},${n(size)} 0 1,0 ${n(-size * 2)},0`);
  }
  const outer: P[] = [[838, 496], [SCR.x, SCR.y - 22], [SCR.x, SCR.y + SCR.h + 22], [838, 548]];
  const main: P[] = [[838, 504], BEAM_TOP, BEAM_BOTTOM, [838, 540]];
  const core: P[] = [[838, 512], [SCR.x, 402], [SCR.x, 474], [838, 532]];
  return (
    poly(outer, { fill: "url(#beamSoft)" }) +
    poly(main, { fill: "url(#beamFill)" }) +
    poly(core, { fill: "url(#beamCore)" }) +
    rect(836, 280, 372, 322, { fill: "url(#hl)", opacity: 0.24, "clip-path": "url(#beamClip)" }) +
    buckets.map((list, i) => path(list.join(""), { fill: "#fff1cf", opacity: 0.35 + i * 0.25 })).join("") +
    sparks.join("")
  );
}

/** One film reel: back flange (depth), lit front flange with five cut-outs, form shadow, rim light, hub. */
function reel(cx: number, cy: number, r: number, spin: number): string {
  const holes = Array.from({ length: 5 }, (_, i) => {
    const a = ((spin + i * 72) * Math.PI) / 180;
    const hx = cx + Math.cos(a) * r * 0.55;
    const hy = cy + Math.sin(a) * r * 0.55;
    return (
      circle(hx, hy, r * 0.19, { fill: "#2a1f1c", ...inked(3) }) +
      path(`M${n(hx - r * 0.12)},${n(hy - r * 0.05)}A${n(r * 0.13)},${n(r * 0.13)} 0 0,1 ${n(hx + r * 0.05)},${n(hy - r * 0.12)}`, stroke("#d99a55", 2.5, 0.75))
    );
  }).join("");
  const a0 = (-78 * Math.PI) / 180;
  const a1 = (18 * Math.PI) / 180;
  const rr = r - 6;
  const rim = `M${n(cx + rr * Math.cos(a0))},${n(cy + rr * Math.sin(a0))}A${n(rr)},${n(rr)} 0 0,1 ${n(cx + rr * Math.cos(a1))},${n(cy + rr * Math.sin(a1))}`;
  const shade = crescent(cx, cy, r, r * 0.24, -r * 0.2);
  return (
    circle(cx - 11, cy + 6, r, { fill: "#8c8169", ...inked(4) }) +
    circle(cx, cy, r, { fill: "url(#reelMetal)", ...inked(4) }) +
    circle(cx, cy, r * 0.9, { fill: "none", stroke: "#b3a483", "stroke-width": 3 }) +
    path(shade, { fill: "#a3957a", opacity: 0.55 }) +
    path(shade, { fill: "url(#ht)", opacity: 0.35 }) +
    holes +
    path(rim, stroke("#fff3d4", 5, 0.9)) +
    circle(cx, cy, r, { fill: "none", ...inked(4) }) +
    circle(cx, cy, r * 0.17, { fill: "#3a4446", ...inked(3) }) +
    circle(cx, cy, r * 0.065, { fill: CREAM })
  );
}

function projector(): string {
  const can = (cx: number, top: number, rx: number, h: number, fill: string, band: string) =>
    path(`M${cx - rx},${top}V${top + h}A${rx},10 0 0,0 ${cx + rx},${top + h}V${top}Z`, { fill, ...inked(3) }) +
    rect(cx - rx, top + h * 0.35, rx * 2, h * 0.3, { fill: band, opacity: 0.9 }) +
    ellipse(cx, top, rx, 10, { fill, ...inked(3) }) +
    ellipse(cx, top, rx * 0.35, 3.5, { fill: INK, opacity: 0.5 });
  const table =
    rect(396, 646, 24, 270, { fill: "#48291f", ...inked(4) }) +
    rect(760, 646, 24, 270, { fill: "#48291f", ...inked(4) }) +
    rect(384, 792, 412, 16, { fill: "#5b3527", ...inked(3) }) +
    can(500, 766, 66, 18, TEAL, "#86a19c") +
    can(506, 744, 58, 16, "#8a3a26", "#c0603c") +
    rect(366, 620, 448, 30, { fill: "#5b3527", ...inked(4) }) +
    rect(366, 620, 448, 30, { fill: "url(#ht)", opacity: 0.25 }) +
    poly([[374, 604], [806, 604], [814, 620], [366, 620]], { fill: "#8d5536", ...inked(4) }) +
    line([560, 607], [804, 607], stroke("#e09a5a", 3, 0.8)) +
    ellipse(598, 606, 168, 5, { fill: INK, opacity: 0.45 });
  const body =
    rect(474, 594, 34, 12, { fill: "#2c3a3e", ...inked(3) }) +
    rect(690, 594, 34, 12, { fill: "#2c3a3e", ...inked(3) }) +
    rect(452, 468, 292, 132, { rx: 24, fill: "url(#bodyFill)", ...inked(4) }) +
    g(
      { "clip-path": "url(#bodyClip)" },
      rect(452, 468, 76, 132, { fill: "#3b5152", opacity: 0.45 }),
      rect(452, 552, 292, 48, { fill: "url(#ht)", opacity: 0.24 }),
    ) +
    path("M720,470Q744,470 744,494V576", stroke("#f6c77e", 4, 0.85)) +
    rect(478, 490, 240, 90, { rx: 14, fill: "#66827f", stroke: "#3c5253", "stroke-width": 2.5 }) +
    circle(604, 536, 34, { fill: "#7f9993", ...inked(3) }) +
    circle(604, 536, 13, { fill: "#3a4d4f", ...inked(2.5) }) +
    circle(599, 531, 4, { fill: "#d7e4da", opacity: 0.8 }) +
    rect(492, 506, 30, 18, { rx: 4, fill: "#2e3b3f", ...inked(2.5) }) +
    circle(514, 515, 5, { fill: RUST });
  const filmPath = "M700,486C690,500 684,512 690,524C700,540 728,526 732,540C736,556 722,566 700,568L548,568C520,568 506,540 490,500";
  const film =
    path(filmPath, stroke("#2b1f1b", 10)) +
    path(filmPath, { ...stroke("#e2b06e", 2.4, 0.75), "stroke-dasharray": "0.5 6" }) +
    circle(690, 520, 11, { fill: "#c9b88f", ...inked(2.5) }) +
    circle(548, 568, 11, { fill: "#c9b88f", ...inked(2.5) }) +
    rect(724, 506, 14, 32, { fill: "#f7d38a", ...inked(2.5) });
  const chimney =
    rect(566, 404, 64, 70, { fill: "url(#chimFill)", ...inked(4) }) +
    rect(556, 392, 84, 16, { rx: 7, fill: "#3f5556", ...inked(4) }) +
    circle(598, 440, 120, { fill: "url(#ventGlow)" }) +
    [0, 1, 2, 3].map((i) => rect(578, 418 + i * 13, 40, 6, { rx: 3, fill: "#f8cd78" })).join("");
  const arm = (a: P, b: P) => line(a, b, { stroke: INK, "stroke-width": 26 }) + line(a, b, { stroke: "#44595a", "stroke-width": 18 });
  const lens =
    rect(736, 490, 24, 64, { rx: 4, fill: "#3f5556", ...inked(4) }) +
    rect(756, 498, 72, 48, { fill: "#343b45", ...inked(4) }) +
    rect(772, 498, 7, 48, { fill: "#c79d55" }) +
    rect(798, 498, 7, 48, { fill: "#c79d55" }) +
    line([760, 502], [826, 502], stroke("#f3c77d", 3, 0.8)) +
    rect(824, 494, 12, 56, { rx: 3, fill: "#2a3039", ...inked(3.5) }) +
    circle(LENS[0], LENS[1], 190, { fill: "url(#lensGlow)" }) +
    ellipse(LENS[0] - 2, LENS[1], 8, 23, { fill: "#fff3cf" }) +
    circle(LENS[0], LENS[1], 9, { fill: "#ffffff", opacity: 0.9 }) +
    poly(star(LENS[0], LENS[1], 74, 5, 4, -90), { fill: "#fff6da", opacity: 0.85 });
  return (
    ellipse(590, 896, 330, 34, { fill: INK, opacity: 0.4 }) +
    table +
    body +
    film +
    chimney +
    arm([500, 474], [436, 392]) +
    arm([700, 474], [748, 384]) +
    reel(436, 392, 106, 16) +
    reel(748, 384, 104, 52) +
    lens
  );
}

/** The director's chair seen from behind, a dark framing silhouette rim-lit from the screen side. */
function chair(): string {
  const wood = "#241e2d";
  const bar = (a: P, b: P, w: number) => line(a, b, { stroke: INK, "stroke-width": w + 7 }) + line(a, b, { stroke: wood, "stroke-width": w });
  return (
    bar([50, 742], [194, 904], 12) +
    bar([194, 742], [50, 904], 12) +
    bar([40, 520], [40, 904], 14) +
    bar([200, 512], [200, 904], 14) +
    path("M32,538L208,530L208,600Q120,618 32,610Z", { fill: "#7b2f24", ...inked(4) }) +
    path("M32,586Q120,594 208,580L208,600Q120,618 32,610Z", { fill: "url(#ht)", opacity: 0.35 }) +
    line([40, 548], [200, 541], stroke("#c46a44", 3, 0.6)) +
    poly([[32, 712], [208, 706], [208, 728], [32, 734]], { fill: "#5a241d", ...inked(3.5) }) +
    bar([22, 672], [226, 666], 11) +
    line([206, 524], [206, 700], stroke("#e9ad62", 3, 0.55)) +
    line([214, 661], [228, 660], stroke("#e9ad62", 3, 0.6))
  );
}

function clapper(): string {
  const chalk = stroke("#e9dfc6", 2.5, 0.7);
  const stripes = (id: string, y0: number, h: number) =>
    g({ "clip-path": `url(#${id})` }, rect(0, y0, 220, h, { fill: CREAM }), ...[0, 1, 2, 3, 4, 5].map((i) => poly([[i * 44 - 10, y0 + h], [i * 44 + 12, y0], [i * 44 + 34, y0], [i * 44 + 12, y0 + h]], { fill: INK })));
  return g(
    { transform: "translate(1354 756) rotate(-7)" },
    rect(0, 0, 220, 150, { rx: 6, fill: "#20263a", ...inked(4) }),
    rect(0, 0, 220, 150, { fill: "url(#hs)", opacity: 0.18 }),
    stripes("clapTop", 0, 26),
    rect(0, 0, 220, 26, { fill: "none", ...inked(4) }),
    line([14, 58], [206, 58], chalk),
    line([14, 98], [206, 98], chalk),
    line([110, 58], [110, 98], chalk),
    line([76, 98], [76, 140], chalk),
    line([146, 98], [146, 140], chalk),
    g({ transform: "rotate(-17)" }, stripes("clapBar", -30, 28), rect(0, -30, 220, 28, { fill: "none", ...inked(4) })),
    circle(8, -3, 6, { fill: "#c79d55", ...inked(2.5) }),
  );
}

/**
 * The film strip across the foreground: a ribbon along a spline that flips over twice (showing its
 * matte back) and curls up at its end like a scroll, with sprocket holes and frames whose tiny
 * landscapes run the sunrise frame by frame.
 */
function filmStrip(): string {
  const ctrl: readonly P[] = [[-70, 872], [150, 812], [380, 806], [600, 846], [830, 850], [1010, 832], [1130, 838], [1238, 818], [1310, 760], [1302, 682], [1236, 650], [1174, 678], [1168, 736]];
  const samples: P[] = [];
  const count = ctrl.length;
  const at = (i: number): P => ctrl[Math.max(0, Math.min(count - 1, i))]!;
  const steps = 500;
  for (let s = 0; s <= steps; s += 1) {
    const f = (s / steps) * (count - 1);
    const i = Math.min(count - 2, Math.floor(f));
    const t = f - i;
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const cr = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
    samples.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])]);
  }
  const lengths = [0];
  for (let i = 1; i < samples.length; i += 1) {
    const a = samples[i - 1]!;
    const b = samples[i]!;
    lengths.push(lengths[i - 1]! + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = lengths[lengths.length - 1]!;
  const HW = 31;
  const twist = (u: number) => Math.cos(Math.PI * (smoothstep((u - 420) / 110) + smoothstep((u - 610) / 110)));
  const map = (u: number, v: number): P => {
    let lo = 0;
    let hi = lengths.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (lengths[mid]! < u) lo = mid;
      else hi = mid;
    }
    const a = samples[lo]!;
    const b = samples[hi]!;
    const k = Math.max(0, Math.min(1, (u - lengths[lo]!) / (lengths[hi]! - lengths[lo]! || 1)));
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const s = twist(u) * HW * v;
    return int([a[0] + dx * k - (dy / len) * s, a[1] + dy * k + (dx / len) * s]);
  };
  const quad = (u0: number, u1: number, v0: number, v1: number) => `M${[map(u0, v0), map(u1, v0), map(u1, v1), map(u0, v1)].map(([x, y]) => `${x} ${y}`).join("L")}Z`;
  const breaks = [0];
  for (let u = 4; u < total; u += 4) if (twist(u) >= 0 !== twist(u - 4) >= 0) breaks.push(u);
  breaks.push(total);
  const out: string[] = [];
  let frame = 0;
  for (let r = 0; r + 1 < breaks.length; r += 1) {
    const u0 = breaks[r]!;
    const u1 = breaks[r + 1]!;
    const front = twist((u0 + u1) / 2) >= 0;
    const us: number[] = [];
    for (let u = u0; u < u1; u += 18) us.push(u);
    us.push(u1);
    out.push(poly([...us.map((u) => map(u, -1)), ...us.slice().reverse().map((u) => map(u, 1))], { fill: front ? "#2b1f1c" : "#7a5239", ...inked(3.5) }));
    // sprocket holes: dashed tracks along both edges where the strip faces us enough
    for (const v of [-0.8, 0.8]) {
      const track: P[] = [];
      for (let u = u0; u <= u1; u += 20) if (Math.abs(twist(u)) > 0.5) track.push(map(u, v));
      if (track.length > 1) out.push(polyline(track, { stroke: front ? "#d9c49f" : "#c8a684", "stroke-width": 5, "stroke-dasharray": "3 12" }));
    }
    const sky: string[] = [];
    const low: string[] = [];
    const hills: string[] = [];
    const suns: string[] = [];
    for (let u = 16; u + 60 < total; u += 64) {
      if (u < u0 || u + 60 > u1) continue;
      const tw = Math.abs(twist(u + 30));
      if (tw < 0.35) continue;
      if (!front) {
        sky.push(quad(u + 4, u + 60, -0.6, 0.6));
        continue;
      }
      sky.push(quad(u + 4, u + 60, -0.6, 0.6));
      low.push(quad(u + 4, u + 60, 0.1, 0.6));
      const sp = map(u + 34, 0.34 - (frame % 6) * 0.13);
      suns.push(`M${sp[0] - 5},${sp[1]}a5,5 0 1,0 10,0a5,5 0 1,0 -10,0`);
      hills.push(`M${[map(u + 4, 0.6), map(u + 20, -0.02), map(u + 30, 0.24), map(u + 44, -0.14), map(u + 60, 0.6)].map(([x, y]) => `${x} ${y}`).join("L")}Z`);
      frame += 1;
    }
    if (front) {
      out.push(path(sky.join(""), { fill: "#d88f56" }), path(low.join(""), { fill: "#f1c383" }), path(suns.join(""), { fill: "#fff2d0" }), path(hills.join(""), { fill: "#4d6566" }), path(sky.join(""), { fill: "none", stroke: INK, "stroke-width": 1.5 }));
    } else out.push(path(sky.join(""), { fill: "#8a6045", stroke: "#5e3d2a", "stroke-width": 2 }));
  }
  return out.join("");
}

export const cinematicPortfolio: Scene = {
  slug: "cinematic-portfolio",
  render() {
    const sun: P = [SCR.x + SCR.w * 0.53, SCR.y + SCR.h * 0.66];
    const defs = [
      printDefs(INK, "#fbe4b4", 23),
      linear("wall", [
        [0, "#1a1730"],
        [0.45, "#242042"],
        [0.85, "#2e2a4a"],
        [1, "#342e4e"],
      ]),
      linear("floor", [
        [0, "#2a1d22"],
        [0.35, "#1e1720"],
        [1, "#120f18"],
      ]),
      glow("spill", "#efbd78", [1380, 437], 700, 0.34),
      glow("lampHaze", "#e8a458", [600, 490], 360, 0.3),
      linear("scrSky", [
        [0, "#6f8c8e"],
        [0.4, "#d4a37a"],
        [0.68, "#f1c68d"],
        [1, "#fbe6b8"],
      ]),
      glow("scrSun", "#fff0c8", sun, 190, 0.9),
      radial("scrVig", [
        [0.6, INK, 0],
        [1, INK, 0.32],
      ]),
      el("clipPath", { id: "scr" }, rect(SCR.x, SCR.y, SCR.w, SCR.h)),
      linearUser("beamFill", [
        [0, "#ffe7b0", 0.62],
        [0.35, "#f8d08a", 0.34],
        [1, "#f5c47c", 0.2],
      ], LENS, [SCR.x, 437]),
      linearUser("beamSoft", [
        [0, "#ffe2a6", 0.3],
        [1, "#f3c07a", 0.08],
      ], LENS, [SCR.x, 437]),
      linearUser("beamCore", [
        [0, "#fff4d6", 0.75],
        [0.22, "#fff0c8", 0],
      ], LENS, [SCR.x, 437]),
      el("clipPath", { id: "beamClip" }, poly([[838, 504], BEAM_TOP, BEAM_BOTTOM, [838, 540]])),
      radial("reelMetal", [
        [0, "#f4ead0"],
        [0.7, "#d9ceb2"],
        [1, "#bfb294"],
      ], 0.62, 0.36, 0.75),
      linear("bodyFill", [
        [0, "#87a29c"],
        [0.16, "#6d8986"],
        [0.7, "#5b7675"],
        [1, "#465e5f"],
      ]),
      el("clipPath", { id: "bodyClip" }, rect(452, 468, 292, 132, { rx: 24 })),
      linear("chimFill", [
        [0, "#4a6162"],
        [0.6, "#6f8a86"],
        [1, "#90a9a0"],
      ], 0, 0, 1, 0),
      glow("ventGlow", "#f8c66f", [598, 440], 120, 0.55),
      glow("lensGlow", "#ffe4a8", LENS, 190, 0.85),
      el("clipPath", { id: "clapTop" }, rect(0, 0, 220, 26)),
      el("clipPath", { id: "clapBar" }, rect(0, -30, 220, 28)),
      g(
        { id: "seat" },
        path("M0,150V26Q0,0 26,0H60Q86,0 86,26V150Z"),
        path("M5,26Q5,4 26,4H60Q81,4 81,26", stroke("#eab66a", 3.5, 0.7)),
      ),
    ];
    const body = g({ "stroke-linecap": "round", "stroke-linejoin": "round" }, room(), screen(), drapes(), seats(), beam(), chair(), projector(), filmStrip(), clapper()) + printFinish(0.22, 0.9);
    return svg(defs.join(""), body);
  },
};
