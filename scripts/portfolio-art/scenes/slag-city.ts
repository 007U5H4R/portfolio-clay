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
  radial,
  rect,
  ridge,
  smooth,
  svg,
  type P,
  type Scene,
} from "../kit";

/**
 * Slag City — "Coin-op brawler, in the browser" (data/projects.ts: an original arcade beat-'em-up that
 * runs in the browser; its README: "the machines … turned Earth to slag, and you crawl out of the
 * rubble with a forge hammer"; the stage is a foundry of conveyor floors, a molten channel and ladle
 * pours). A ruined industrial city at smoggy dusk: a sawtooth foundry shed with a blazing furnace arch
 * (the one light source), two smokestacks trailing smoke, a blast-furnace tower and its skip bridge,
 * a gutted skyline, a leaning gantry crane and a verdigris dome. Molten slag runs out of the arch
 * towards us; on a heap of slag in front of it a forge hammer stands head-down, backlit. No characters
 * (none are named or drawn), no machines-as-enemies, no game art, no text. Palette: sepia-ochre smog,
 * umber and ash, molten orange, one verdigris accent — warm and printed, not neon.
 */

const INK = "#1b1315";
const RIM = "#ffc46a";
const HOT = "#fff1c2";
const EMBER = "#e0662c";
const RUST = "#8e4529";
const VERDI = "#5f8778";
const MID = "#43322e"; // the mid plane (foundry, ruins)
const MOUTH: P = [600, 540]; // the furnace arch — the scene's one light source
const PLAY: P = [1024, 470];
const GROUND = 640;

// round caps and joins are set once on the scene's wrapper group, so these only colour
const inked = (width = 4) => ({ stroke: INK, "stroke-width": width }) as const;
const stroke = (color: string, width: number, opacity?: number) => ({ fill: "none", stroke: color, "stroke-width": width, opacity }) as const;
const dot = (x: number, y: number, r: number) => `M${n(x - r)},${n(y)}a${n(r)},${n(r)} 0 1,0 ${n(r * 2)},0a${n(r)},${n(r)} 0 1,0 ${n(-r * 2)},0`;

/** A tiny deterministic PRNG (mulberry32): ash and sparks land in the same place on every build. */
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

/** A block of wall with a flat or broken (jagged) top, as one path segment. */
function block(x: number, w: number, top: number, broken: boolean, base = GROUND + 4): string {
  const topEdge: P[] = broken
    ? [[x, top + 10], [x + w * 0.22, top - 4], [x + w * 0.4, top + 16], [x + w * 0.58, top + 2], [x + w * 0.8, top + 24], [x + w, top + 12]]
    : [[x, top], [x + w, top]];
  return `M${n(x)},${n(base)}${topEdge.map(([px, py]) => `L${n(px)},${n(py)}`).join("")}L${n(x + w)},${n(base)}Z`;
}

/** A variable-width ribbon along a smooth centreline (the molten channel). */
function ribbon(points: readonly P[], widths: readonly number[], scale = 1): string {
  const left: P[] = [];
  const right: P[] = [];
  points.forEach((p, i) => {
    const a = points[Math.max(0, i - 1)]!;
    const b = points[Math.min(points.length - 1, i + 1)]!;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const w = (widths[i]! * scale) / 2;
    left.push([p[0] - (dy / len) * w, p[1] + (dx / len) * w]);
    right.push([p[0] + (dy / len) * w, p[1] - (dx / len) * w]);
  });
  return smooth([...left, ...right.reverse()], true, 0.9);
}

function sky(): string {
  // smoke: two plumes leave the stacks and drift left on the wind, so the centre sky stays calm
  const puffs = (x0: number, y0: number, count: number, grow: number) =>
    Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1);
      return [x0 - t * (x0 + 60), y0 - 40 - Math.sin(t * 2.2) * 80 - t * 30, 22 + t * grow] as const;
    });
  const plumeA = puffs(384, 262, 9, 64);
  const plumeB = puffs(448, 292, 8, 50).map(([x, y, r]) => [x + 30, y + 40, r * 0.85] as const);
  const puffPath = (list: readonly (readonly [number, number, number])[], dy = 0) => list.map(([x, y, r]) => dot(x, y + dy, r)).join("");
  return (
    rect(0, 0, 1600, GROUND + 10, { fill: "url(#sky)" }) +
    circle(MOUTH[0], MOUTH[1] + 60, 820, { fill: "url(#skyGlow)" }) +
    rect(0, 250, 1600, 400, { fill: "url(#hl)", mask: "url(#nearGlow)", opacity: 0.4 }) +
    // long smog streaks, low-contrast in the lettering band
    path(smooth([[860, 150], [1060, 136], [1280, 146], [1560, 132]]), stroke("#4d3f3c", 22, 0.45)) +
    path(smooth([[1000, 214], [1200, 204], [1440, 214], [1620, 206]]), stroke("#6a5040", 14, 0.35)) +
    path(puffPath([...plumeA, ...plumeB], 8), { fill: "#a8704a", opacity: 0.22 }) +
    path(puffPath([...plumeA, ...plumeB]), { fill: "#34333a", opacity: 0.4 })
  );
}

function farCity(): string {
  const blocks: readonly (readonly [number, number, number, boolean])[] = [
    [-10, 64, 500, true], [50, 48, 540, false], [96, 76, 452, true], [168, 50, 516, false], [214, 70, 470, true], [278, 60, 530, false],
    [760, 70, 566, false], [826, 64, 584, true], [886, 120, 602, false], [1002, 90, 596, true], [1088, 78, 580, false],
    [1150, 64, 506, false], [1210, 86, 452, true], [1292, 52, 522, false], [1340, 72, 424, true], [1408, 56, 488, false], [1460, 84, 446, true], [1540, 70, 504, false],
  ];
  const d = blocks.map(([x, w, top, broken]) => block(x, w, top, broken)).join("");
  // a far lattice mast and a snapped bridge span, hazy
  return (
    path(d, { fill: "#86706c" }) +
    path(d, { fill: "url(#hs)", opacity: 0.12 }) +
    g(stroke("#86706c", 4), line([1380, 424], [1380, 330]), line([1366, 424], [1380, 330]), line([1394, 424], [1380, 330])) +
    path("M1040,600Q1080,556 1128,560L1136,574Q1090,572 1054,606Z", { fill: "#86706c" }) +
    rect(0, 596, 1600, 50, { fill: "url(#haze)" })
  );
}

function gasholder(): string {
  // a gutted gasholder frame: posts, guide rings, cross-bracing; one post snapped
  const posts = [40, 96, 152, 208];
  return g(
    stroke("#5c463b", 7),
    ...posts.map((x, i) => line([x, GROUND], [x, i === 3 ? 470 : 404])),
    path("M40,414H152M40,488H208M40,562H208", { "stroke-width": 5 }),
    path("M40,488L96,562M96,488L40,562M152,488L208,562M208,488L152,562M96,414L152,488M152,414L96,488", { "stroke-width": 3 }),
    path("M152,414Q180,420 196,446", { "stroke-width": 5 }),
  );
}

function foundry(): string {
  const parts: string[] = [];
  // smokestacks behind the roof; the right one broken off
  parts.push(poly([[362, 470], [370, 256], [398, 256], [406, 470]], { fill: "#3a2b28", ...inked(3.5) }));
  parts.push(path("M366,294H402M364,340H404", stroke(RUST, 7)));
  parts.push(poly([[430, 470], [436, 300], [446, 290], [452, 302], [460, 292], [466, 470]], { fill: "#3a2b28", ...inked(3.5) }));
  parts.push(path("M434,330H464", stroke(RUST, 6)));
  parts.push(line([371, 262], [371, 460], stroke(RIM, 3, 0.55)));
  // the sawtooth shed: teeth rise to the right; a stretch of roof has fallen in (bare trusses)
  parts.push(poly([[290, GROUND + 4], [290, 440], [354, 400], [354, 440], [418, 400], [418, 440], [482, 400], [482, 440], [546, 400], [546, 440], [566, 426], [590, 452], [616, 430], [642, 456], [674, 432], [674, 440], [738, 400], [738, GROUND + 4]], { fill: MID }));
  parts.push(g(stroke("#2a1f1e", 4), path("M546,440L610,404L674,440M578,422V452M642,422V452"), line([546, 440], [674, 440])));
  parts.push(g(stroke(RIM, 3, 0.6), polyline([[290, 440], [354, 400], [354, 440], [418, 400], [418, 440], [482, 400], [482, 440], [546, 400]])));
  parts.push(rect(290, 440, 448, 204, { fill: "url(#ht)", opacity: 0.16 }));
  // the furnace arch: brick voussoirs round a blazing mouth
  const [mx] = MOUTH;
  parts.push(circle(mx, 560, 330, { fill: "url(#mouthGlow)" }));
  parts.push(path(`M${mx - 132},${GROUND + 4}V526A132,122 0 0 1 ${mx + 132},526V${GROUND + 4}Z`, { fill: "#6b3524", ...inked(4) }));
  parts.push(path(`M${mx - 104},${GROUND + 4}V530A104,98 0 0 1 ${mx + 104},530V${GROUND + 4}Z`, { fill: "url(#mouth)" }));
  const bricks: string[] = [];
  for (let i = 0; i <= 10; i += 1) {
    const a = Math.PI + (i / 10) * Math.PI;
    bricks.push(`M${n(mx + Math.cos(a) * 106)},${n(526 + Math.sin(a) * 100)}L${n(mx + Math.cos(a) * 130)},${n(526 + Math.sin(a) * 120)}`);
  }
  parts.push(path(bricks.join(""), stroke("#3a1d15", 3)));
  parts.push(path(`M${mx - 118},${GROUND}V528A118,110 0 0 1 ${mx},418`, stroke(RIM, 4, 0.7)));
  parts.push(rect(mx - 104, 440, 208, 204, { fill: "url(#hl)", opacity: 0.35, mask: "url(#mouthMask)" }));
  // the blast-furnace tower, its bustle ring and downcomer, and the inclined skip bridge
  parts.push(path("M806,336V290M786,336V300", stroke(INK, 11)) + path("M806,336V290M786,336V300", stroke("#5a4038", 5)));
  parts.push(path("M826,392L884,420", stroke(INK, 20)) + path("M826,392L884,420", stroke("#5a4038", 12)));
  parts.push(rect(862, 410, 46, 88, { rx: 12, fill: "#3d2d2a", ...inked(3.5) }) + path("M866,420V490", stroke(RIM, 3, 0.5)));
  parts.push(g(stroke("#3d2d2a", 5), line([868, 498], [860, GROUND]), line([902, 498], [910, GROUND])));
  parts.push(poly([[760, GROUND + 4], [752, 430], [770, 368], [822, 368], [840, 430], [832, GROUND + 4]], { fill: "#4d3832", ...inked(4) }));
  parts.push(poly([[770, 368], [778, 330], [814, 330], [822, 368]], { fill: "#3a2a27", ...inked(3.5) }));
  parts.push(path("M752,452H840M756,520H836M760,588H834", stroke("#2c201e", 5)));
  parts.push(ellipse(796, 430, 58, 12, stroke(RUST, 7)));
  parts.push(path("M756,640L752,430L770,368", stroke(RIM, 3.5, 0.7)));
  parts.push(poly([[760, 440], [840, 440], [832, GROUND], [760, GROUND]], { fill: "url(#ht)", opacity: 0.2 }));
  const skip: string[] = ["M816,372L968,640M836,366L992,636"];
  for (let t = 0.08; t < 1; t += 0.13) {
    const a: P = [816 + 152 * t, 372 + 268 * t];
    const b: P = [836 + 156 * (t + 0.065), 366 + 270 * (t + 0.065)];
    skip.push(`M${n(a[0])},${n(a[1])}L${n(b[0])},${n(b[1])}`);
  }
  parts.push(path(skip.join(""), stroke("#3a2b28", 5)));
  return parts.join("");
}

function ruins(): string {
  const parts: string[] = [];
  // a gutted tenement with sky through its window holes
  parts.push(path(block(1170, 124, 416, true), { fill: MID }));
  const holes: string[] = [];
  for (let r = 0; r < 4; r += 1)
    for (let c = 0; c < 3; c += 1) if ((r * 3 + c) % 5 !== 2) holes.push(`M${1186 + c * 38},${448 + r * 44}h20v26h-20Z`);
  parts.push(path(holes.join(""), { fill: "#c48f58", opacity: 0.75 }));
  // a block collapsed on the diagonal, its floor slabs and rebar sticking out
  parts.push(poly([[1294, GROUND + 4], [1294, 384], [1330, 400], [1420, 510], [1420, GROUND + 4]], { fill: "#3b2c2a" }));
  parts.push(g(stroke("#5a463f", 7), line([1300, 440], [1356, 440]), line([1300, 492], [1398, 492]), line([1300, 544], [1420, 544])));
  parts.push(path("M1356,440l14,-18M1398,492l18,-14l4,10M1420,544l20,-10", stroke("#6d5a50", 2.5)));
  // a domed hall, the dome's verdigris copper half fallen in
  parts.push(path(block(1424, 176, 470, false), { fill: MID }));
  // a copper dome on a drum, gone green; a bite has fallen out of its far side, showing the ribs
  parts.push(rect(1436, 446, 152, 26, { fill: "#4d3a35", ...inked(3) }));
  parts.push(path("M1444,448A68,68 0 0 1 1580,448H1560L1552,422L1566,404L1544,396L1540,380L1520,384Z", { fill: VERDI, ...inked(3.5) }));
  parts.push(path("M1466,448Q1470,406 1506,384M1492,448Q1494,414 1516,392M1520,448Q1522,420 1530,402", stroke("#3f6358", 3)));
  parts.push(path("M1560,448L1552,422L1566,404L1544,396L1540,380", stroke("#33262a", 3)));
  parts.push(path("M1450,440A62,62 0 0 1 1500,388", stroke("#a9cbb8", 3, 0.75)));
  // the leaning gantry crane: lattice mast, jib, counter-jib and a hanging hook
  const lattice = (a: P, b: P, w: number, steps: number) => {
    const out: string[] = [];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    const nx = (-dy / len) * w;
    const ny = (dx / len) * w;
    out.push(`M${n(a[0])},${n(a[1])}L${n(b[0])},${n(b[1])}M${n(a[0] + nx)},${n(a[1] + ny)}L${n(b[0] + nx)},${n(b[1] + ny)}`);
    for (let i = 0; i < steps; i += 1) {
      const t0 = i / steps;
      const t1 = (i + 1) / steps;
      out.push(`M${n(a[0] + dx * t0)},${n(a[1] + dy * t0)}L${n(a[0] + dx * t1 + nx)},${n(a[1] + dy * t1 + ny)}`);
    }
    return out.join("");
  };
  parts.push(path(lattice([1484, GROUND], [1462, 292], 20, 12) + lattice([1466, 300], [1232, 338], 14, 10) + lattice([1476, 296], [1566, 282], 12, 4), stroke("#33262a", 4)));
  parts.push(rect(1540, 280, 40, 30, { fill: "#33262a" }));
  parts.push(path("M1252,340V428", stroke("#33262a", 2.5)) + path("M1246,428h12v10q0,12 -12,10", stroke("#33262a", 4)));
  parts.push(path(lattice([1484, GROUND], [1462, 292], 20, 12).split("M").slice(1, 2).map((s) => `M${s}`).join(""), stroke(RIM, 2.5, 0.45)));
  // rim light on the edges that face the furnace
  parts.push(g(stroke(RIM, 3, 0.5), line([1170, 640], [1170, 426]), line([1294, 640], [1294, 384]), line([1424, 640], [1424, 470])));
  parts.push(rect(1170, 380, 430, 264, { fill: "url(#ht)", opacity: 0.14 }));
  return parts.join("");
}

function ground(): string {
  return (
    path(ridge([[0, 632], [300, 640], [700, 636], [1100, 644], [1600, 634]], 900), { fill: "url(#ground)" }) +
    ellipse(560, 690, 640, 190, { fill: "url(#pool)" }) +
    rect(0, 632, 1600, 268, { fill: "url(#ht)", opacity: 0.16 }) +
    conveyor()
  );
}

function conveyor(): string {
  const rollers: string[] = [];
  for (let x = 1000; x <= 1150; x += 30) rollers.push(`M${x - 5},628a5,5 0 1,0 10,0a5,5 0 1,0 -10,0`);
  const lumps = ([[1012, 20], [1052, 14], [1096, 22], [1134, 16]] as const)
    .map(([x, w]) => `M${x},612l${n(w * 0.3)},${n(-w * 0.55)}l${n(w * 0.5)},${n(w * 0.1)}l${n(w * 0.2)},${n(w * 0.45)}Z`)
    .join("");
  return (
    path("M1004,634V676M1070,634V682M1140,634V686", stroke("#2a1f1f", 7)) +
    path(`M990,612H1162V632H990Z`, { fill: "#4a3a36", ...inked(3.5) }) +
    path(rollers.join(""), { fill: "#2a1f1f" }) +
    path(lumps, { fill: "#2e2423", ...inked(2.5) }) +
    path("M990,612H1162", stroke(RIM, 3, 0.55))
  );
}

function channel(): string {
  const pts: P[] = [[512, 652], [452, 690], [372, 734], [282, 790], [184, 850], [96, 912]];
  const widths = [16, 30, 44, 58, 72, 86];
  const crust: string[] = [];
  const r = rng(3);
  pts.slice(1, -1).forEach(([x, y], i) => {
    const s = 5 + i * 2.2;
    const ox = (r() - 0.5) * 18;
    crust.push(`M${n(x + ox - s)},${n(y + 2)}l${n(s * 0.8)},${n(-s * 0.5)}l${n(s * 1.1)},${n(s * 0.2)}l${n(-s * 0.4)},${n(s * 0.6)}Z`);
  });
  return (
    path(ribbon(pts, widths, 2.1), { fill: EMBER, opacity: 0.28 }) +
    path(ribbon(pts, widths, 1.25), { fill: "#2a1b1a" }) +
    path(ribbon(pts, widths), { fill: "url(#molten)" }) +
    path(ribbon(pts, widths), { fill: "url(#hl)", opacity: 0.35 }) +
    path(smooth(pts), stroke(HOT, 5, 0.8)) +
    path(crust.join(""), { fill: "#5a2a1c", opacity: 0.85 })
  );
}

function heap(): string {
  // the slag heap in front of the arch: a dark crusted mound, rim-lit, veined with hot cracks
  const outline = ridge([[372, 900], [420, 796], [486, 712], [560, 628], [640, 618], [716, 640], [792, 716], [860, 810], [908, 900]], 904, 0.9);
  const rocks: string[] = [];
  const faces: string[] = [];
  const list: readonly (readonly [number, number, number, number])[] = [[470, 760, 46, 0.2], [712, 690, 36, -0.3], [772, 780, 50, 0.4], [590, 800, 58, -0.1], [480, 870, 60, 0.3], [690, 880, 62, -0.2], [836, 868, 44, 0.1]];
  for (const [x, y, s, tilt] of list) {
    const q = (dx: number, dy: number) => `${n(x + dx * s - dy * s * tilt * 0.3)},${n(y + dy * s + dx * s * tilt * 0.3)}`;
    rocks.push(`M${q(-1.1, 0.5)}L${q(-0.9, -0.3)}L${q(-0.2, -0.55)}L${q(0.7, -0.45)}L${q(1.05, 0.1)}L${q(0.7, 0.6)}Z`);
    faces.push(`M${q(-0.9, -0.3)}L${q(-0.2, -0.55)}L${q(0.7, -0.45)}L${q(0.5, -0.12)}L${q(-0.5, -0.05)}Z`);
  }
  return (
    path(outline, { fill: "#33251f" }) +
    path(outline, { fill: "url(#heapLit)" }) +
    path(rocks.join(""), { fill: "#40302a", ...inked(3) }) +
    path(faces.join(""), { fill: "#8a5434" }) +
    path(faces.join(""), { fill: "url(#hl)", opacity: 0.18 }) +
    path(outline, { fill: "url(#ht)", opacity: 0.22 }) +
    path("M420,796L486,712L560,628L640,618", stroke(RIM, 4, 0.85)) +
    path("M492,784l26,20l-8,24l20,18M650,712l-14,30l22,18l-6,26M752,796l18,22l-10,20", stroke(EMBER, 3.5, 0.85)) +
    path("M492,784l26,20l-8,24l20,18M650,712l-14,30l22,18l-6,26", stroke(HOT, 1.5, 0.7))
  );
}

function hammer(): string {
  const k = inked(4);
  return g(
    { transform: "translate(622 616) rotate(13) scale(1.22)" },
    // the handle: long ash wood swelling to a knob, rim-lit on the furnace side
    poly([[-10, -38], [10, -38], [8, -282], [-8, -282]], { fill: "url(#wood)", ...k }),
    ellipse(0, -290, 12, 15, { fill: "#b07d45", ...inked(3.5) }),
    path("M-3,-60V-250M4,-90V-270", stroke("#6b4527", 2, 0.55)),
    line([-8, -50], [-6, -276], stroke(RIM, 3, 0.9)),
    // the head: a long, low forged block with flared striking faces; the bevel facing the glow is lit
    poly([[-80, -24], [-72, -32], [72, -32], [80, -24], [80, 18], [72, 26], [-72, 26], [-80, 18]], { fill: "#474a54", ...k }),
    poly([[-72, -32], [72, -32], [66, -24], [-66, -24]], { fill: "#8a8c97" }),
    poly([[-66, -24], [-8, -24], [-8, 20], [-72, 12], [-72, -16]], { fill: "#f0a254", opacity: 0.22 }),
    poly([[-80, -24], [-72, -32], [-66, -24], [-72, -16], [-72, 12], [-80, 18]], { fill: RIM, opacity: 0.85 }),
    poly([[8, -24], [66, -24], [72, -16], [72, 12], [66, 20], [8, 20]], { fill: "url(#hs)", opacity: 0.35 }),
    path("M-56,-24V20M56,-24V20", stroke("#2a2b31", 3)),
    rect(-15, -44, 30, 14, { rx: 3, fill: "#55575f", ...inked(3.5) }),
    path("M-70,24H70", stroke(EMBER, 4, 0.8)),
  );
}

/** Slag chunks heaped against the hammer head, so it stands planted rather than balanced. */
function heapFront(): string {
  return g(
    { transform: "translate(0 12)" },
    path("M548,642L566,616L600,610L612,628L596,648Z", { fill: "#40302a", ...inked(3) }),
    path("M566,616L600,610L604,622L572,628Z", { fill: "#8a5434" }),
    path("M654,650L668,622L700,618L716,640L690,656Z", { fill: "#40302a", ...inked(3) }),
    path("M668,622L700,618L704,630L674,634Z", { fill: "#8a5434" }),
    path("M556,640L592,626", stroke(RIM, 2.5, 0.7))
  );
}

function scrap(): string {
  // stage-right foreground: a half-buried cog, a dented drum and scattered bricks, lit from the left
  const teeth: P[] = [];
  const [cx, cy, R] = [1402, 842, 96];
  for (let i = 0; i < 24; i += 1) {
    const a = (i / 24) * Math.PI * 2;
    const r = i % 2 === 0 ? R : R - 18;
    teeth.push([cx + Math.cos(a - 0.1) * r, cy + Math.sin(a - 0.1) * r], [cx + Math.cos(a + 0.1) * r, cy + Math.sin(a + 0.1) * r]);
  }
  return (
    path(ridge([[1160, 900], [1240, 820], [1340, 790], [1460, 780], [1560, 800], [1640, 840]], 904), { fill: "#221819" }) +
    poly(teeth, { fill: "#4a3a36", ...inked(4) }) +
    circle(cx, cy, 44, { fill: "#2f2426", ...inked(3.5) }) +
    circle(cx, cy, 18, { fill: "#6a5850", ...inked(3) }) +
    path(`M${cx - R + 6},${cy - 20}A${R - 8},${R - 8} 0 0 1 ${cx - 20},${cy - R + 8}`, stroke(RIM, 4, 0.8)) +
    path(ridge([[1300, 904], [1340, 872], [1420, 860], [1500, 870], [1560, 904]], 904), { fill: "#1d1516" }) +
    g(
      { transform: "rotate(-8 1248 790)" },
      path("M1206,744V836Q1248,852 1290,836V744Z", { fill: RUST, ...inked(4) }),
      path("M1206,774Q1248,788 1290,774M1206,808Q1248,822 1290,808", stroke("#5e2c1c", 5)),
      path("M1212,752V832", stroke(RIM, 7, 0.6)),
      path("M1250,760l12,26l-6,18", stroke("#5e2c1c", 3)),
      path("M1206,744V836Q1248,852 1290,836V744Z", { fill: "url(#ht)", opacity: 0.25 }),
      ellipse(1248, 744, 42, 12, { fill: "#a4583a", ...inked(3.5) }),
      ellipse(1262, 742, 7, 3, { fill: "#3a1d15" }),
    ) +
    g({ fill: "#7a3b27", ...inked(3) }, rect(1082, 848, 52, 24, { rx: 3 }), rect(1112, 824, 52, 24, { rx: 3, transform: "rotate(-12 1138 836)" }), rect(1024, 872, 52, 24, { rx: 3 }))
  );
}

function foreground(): string {
  const r = rng(11);
  const ash: string[] = [];
  const sparks: string[] = [];
  for (let i = 0; i < 90; i += 1) {
    const x = Math.round(r() * 1600);
    const y = Math.round(230 + r() * 640);
    const s = 1 + r() * 1.8;
    if (Math.hypot(x - PLAY[0], y - PLAY[1]) < 140) continue;
    ash.push(dot(x, y, s));
  }
  for (let i = 0; i < 18; i += 1) {
    const x = MOUTH[0] - 170 + r() * 340;
    const y = 400 + r() * 150;
    sparks.push(dot(x, y, 1.4 + r() * 1.8));
  }
  return (
    path("M-20,904L-20,808L60,790L130,812L196,860L230,904Z", { fill: "#150f10" }) +
    path("M1540,904L1560,850L1610,836L1620,904Z", { fill: "#150f10" }) +
    path(ash.join(""), { fill: "#e9d8b6", opacity: 0.4 }) +
    path(sparks.join(""), { fill: RIM, opacity: 0.9 })
  );
}

export const slagCity: Scene = {
  slug: "slag-city",
  render() {
    const defs = [
      printDefs(INK, "#ffe3ad", 53),
      linear("sky", [
        [0, "#262d38"],
        [0.26, "#3b3f47"],
        [0.5, "#6a5a52"],
        [0.7, "#a9794f"],
        [0.87, "#d69d5c"],
        [1, "#eabc74"],
      ]),
      glow("skyGlow", "#ffae5a", [MOUTH[0], MOUTH[1] + 60], 820, 0.5),
      glow("nearGlowG", "#ffffff", MOUTH, 560, 1),
      el("mask", { id: "nearGlow" }, rect(0, 0, 1600, 900, { fill: "url(#nearGlowG)" })),
      linear("haze", [
        [0, "#e8b56a", 0],
        [1, "#e8b56a", 0.45],
      ]),
      glow("mouthGlow", "#ffb24f", [MOUTH[0], 560], 330, 0.6),
      el(
        "radialGradient",
        { id: "mouth", cx: 0.5, cy: 0.7, r: 0.75 },
        el("stop", { offset: 0, "stop-color": HOT }) + el("stop", { offset: 0.45, "stop-color": "#ffc15a" }) + el("stop", { offset: 1, "stop-color": EMBER }),
      ),
      el("mask", { id: "mouthMask" }, path(`M${MOUTH[0] - 104},644V530A104,98 0 0 1 ${MOUTH[0] + 104},530V644Z`, { fill: "#fff" })),
      linear("ground", [
        [0, "#6e4a38"],
        [0.3, "#4a342d"],
        [1, "#221819"],
      ]),
      radial("pool", [
        [0, "#f59a48", 0.62],
        [0.55, "#d06a33", 0.18],
        [1, "#d06a33", 0],
      ]),
      linear("heapLit", [
        [0, "#f08a40", 0.42],
        [0.45, "#f08a40", 0.08],
        [1, "#f08a40", 0],
      ], 0, 0, 1, 0),
      linear("molten", [
        [0, "#fff0bc"],
        [0.35, "#ffc253"],
        [1, "#e8702e"],
      ]),
      linear("wood", [
        [0, "#d9a769"],
        [0.5, "#a5733f"],
        [1, "#6a4424"],
      ], 0, 0, 1, 0),
    ];
    const body =
      g(
        { "stroke-linecap": "round", "stroke-linejoin": "round" },
        sky(),
        farCity(),
        gasholder(),
        ruins(),
        foundry(),
        ground(),
        channel(),
        heap(),
        hammer(),
        heapFront(),
        scrap(),
        foreground(),
      ) + printFinish(0.22, 0.9);
    return svg(defs.join(""), body);
  },
};
