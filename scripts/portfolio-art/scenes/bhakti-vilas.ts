import {
  circle,
  el,
  ellipse,
  g,
  glow,
  linear,
  n,
  path,
  poly,
  printDefs,
  printFinish,
  pt,
  radial,
  rect,
  ridge,
  smooth,
  svg,
  type P,
  type Scene,
} from "../kit";

/**
 * Bhakti Vilas — "Devotion as wellness" (data/projects.ts: an elder-focused wellness prototype built
 * around bhajan — devotion as behavioural health, not a clinical app; a team prototype, no AI).
 * Dawn on a riverside temple courtyard: a harmonium with its bellows open rests on a woven rug on the
 * stone ghat, a brass diya burning beside it and a pair of manjira cymbals in front; across the misty
 * river a temple spire and the rising sun; lotuses float by, temple bells hang from a pillar.
 * Palette: deep teal, saffron, cream, brass, soft rose.
 */

type Attrs = Record<string, string | number | undefined>;

const INK = "#10292b";
const CREAM = "#f7ecd6";
const SAFFRON = "#eb9a38";
const SAFFRON_D = "#c0681f";
const SAFFRON_L = "#fcca72";
const TEAL = "#2f6466";
const TEAL_D = "#1c4446";
const ROSE = "#d98f8c";
const ROSE_L = "#f3c3b3";
const BRASS = "#d6a44a";
const BRASS_D = "#9a6e26";
const BRASS_L = "#f7dc8e";
const WOOD = "#7e3a28";
const WOOD_L = "#a4553a";
const WOOD_D = "#5a2618";
const HAZE = "#5f7f7c";
const SUN: P = [330, 424];
const BANK = 432;
const DIYA: P = [372, 600];

const ink = (w = 4): Attrs => ({ stroke: INK, "stroke-width": w });
const stroke = (color: string, w: number, opacity?: number): Attrs => ({ fill: "none", stroke: color, "stroke-width": w, opacity });
const ref = (id: string, values: Attrs = {}) => el("use", { href: `#${id}`, ...values });
const mixP = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

function sky(): string {
  const rays = Array.from({ length: 11 }, (_, i) => {
    const a0 = ((-168 + i * 15) * Math.PI) / 180;
    const a1 = a0 + (2.4 * Math.PI) / 180;
    const r = 900;
    return `M${pt(SUN)}L${pt([SUN[0] + r * Math.cos(a0), SUN[1] + r * Math.sin(a0)])}L${pt([SUN[0] + r * Math.cos(a1), SUN[1] + r * Math.sin(a1)])}Z`;
  }).join("");
  const bird = (x: number, y: number, s: number) => `M${n(x - 12 * s)},${y}q${n(6 * s)},${n(-7 * s)} ${n(12 * s)},0q${n(6 * s)},${n(-7 * s)} ${n(12 * s)},0`;
  return (
    rect(0, 0, 1600, 460, { fill: "url(#sky)" }) +
    path(smooth([[40, 150], [220, 138], [420, 150]]) + smooth([[1080, 128], [1280, 116], [1500, 126]]), stroke("#6c958f", 14, 0.4)) +
    path(smooth([[520, 330], [700, 318], [900, 326]]) + smooth([[1060, 352], [1260, 342], [1480, 350]]), stroke("#f0c2ae", 10, 0.5)) +
    circle(SUN[0], SUN[1], 560, { fill: "url(#halo)" }) +
    path(rays, { fill: "url(#rayFade)", opacity: 0.18 }) +
    rect(0, 250, 1000, 200, { fill: "url(#hl)", mask: "url(#sunFade)", opacity: 0.5 }) +
    circle(SUN[0], SUN[1], 52, { fill: "url(#sun)" }) +
    path(bird(1190, 214, 1) + bird(1228, 240, 0.8) + bird(1160, 248, 0.7) + bird(1262, 206, 0.6), stroke("#244a4c", 3.5, 0.7))
  );
}

function temple(): string {
  // a generic nagara temple: curvilinear spire, a smaller hall spire and a porch, trees either side
  return g(
    { id: "temple", fill: HAZE },
    path("M788,434C784,380 800,332 816,304L860,304C876,332 892,380 888,434Z"),
    ellipse(838, 300, 26, 8),
    ellipse(838, 292, 12, 5),
    path("M832,288q6,-14 12,0z"),
    path("M736,434C734,410 744,388 752,376L776,376C784,388 792,410 790,434Z"),
    rect(704, 408, 40, 26),
    rect(700, 402, 48, 8),
    ellipse(690, 420, 22, 18),
    ellipse(672, 428, 18, 12),
    ellipse(914, 414, 22, 22),
    ellipse(934, 426, 16, 12),
    rect(690, 432, 260, 8),
  );
}

function farBank(): string {
  const shrine = "M1392,436C1390,418 1398,402 1404,394L1418,394C1424,402 1432,418 1430,436Z";
  return (
    path(ridge([[0, 430], [70, 420], [150, 428], [230, 416], [300, 424], [380, 420], [460, 428], [540, 418], [620, 426], [960, 428], [1040, 420], [1120, 428], [1200, 414], [1280, 424], [1360, 418], [1460, 426], [1540, 416], [1600, 424]], 450), { fill: "#78958f" }) +
    temple() +
    // sunlit left edges of the spires
    path("M788,434C784,380 800,332 816,304M736,434C734,410 744,388 752,376", stroke("#f3cfa9", 3, 0.8)) +
    path("M806,352h62M798,384h80M792,410h92", stroke("#4c6b68", 3)) +
    path("M838,288V262", stroke("#4c6b68", 2.5)) +
    path("M838,262l24,6l-24,6z", { fill: SAFFRON }) +
    path(shrine, { fill: "#6d8c88" }) +
    g({ fill: "#6a8a86" }, ellipse(1340, 424, 30, 16), ellipse(1476, 420, 34, 20), ellipse(1150, 426, 26, 12))
  );
}

function water(): string {
  const ripples = Array.from({ length: 30 }, (_, i) => {
    const y = 448 + ((i * 37) % 160);
    const x = (i * 263) % 1600;
    const w = 40 + ((i * 29) % 90);
    return Math.hypot(x + w / 2 - 1024, y - 470) < 130 ? "" : `M${x},${y}h${w}`;
  }).join("");
  const glints = Array.from({ length: 10 }, (_, i) => {
    const y = 442 + i * 17;
    const hw = 16 + i * 6;
    const jx = ((i * 13) % 9) - 4;
    return `M${n(SUN[0] - hw + jx)},${y}h${n(hw * 0.8)}M${n(SUN[0] + hw * 0.1 + jx)},${y}h${n(hw * 0.7)}`;
  }).join("");
  return (
    rect(0, BANK, 1600, 190, { fill: "url(#water)" }) +
    ref("temple", { transform: `matrix(1 0 0 -0.62 0 ${n(BANK * 1.62)})`, opacity: 0.28 }) +
    path(ripples, stroke("#f6dcc6", 2.5, 0.35)) +
    path(glints, stroke(SAFFRON_L, 5, 0.75)) +
    rect(0, 470, 1600, 150, { fill: "url(#hs)", opacity: 0.08 }) +
    // mist lying on the river
    g({ fill: CREAM, filter: "url(#soft)" }, ellipse(500, 440, 520, 12, { opacity: 0.45 }), ellipse(1250, 446, 460, 10, { opacity: 0.4 }), ellipse(900, 500, 600, 9, { opacity: 0.22 }))
  );
}

function lotus(x: number, y: number, s: number, bloom: boolean): string {
  const pad = ellipse(x, y, 40 * s, 12 * s, { fill: "#3f7a66", ...ink(2.5) }) + path(`M${n(x)},${n(y)}l${n(30 * s)},${n(-8 * s)}`, stroke(INK, 2));
  if (!bloom) return pad;
  const petal = (dx: number, rot: number, color: string) =>
    ellipse(x + dx * s, y - 16 * s, 8 * s, 20 * s, { fill: color, transform: `rotate(${rot} ${n(x + dx * s)} ${n(y - 6 * s)})` });
  return (
    pad +
    g(
      ink(2),
      petal(-14, -38, ROSE),
      petal(14, 38, ROSE),
      petal(-7, -16, ROSE_L),
      petal(7, 16, ROSE_L),
      petal(0, 0, "#f8d6c8"),
    ) +
    circle(x, y - 10 * s, 4 * s, { fill: SAFFRON_L })
  );
}

function floatingDiya(x: number, y: number, s: number): string {
  return (
    circle(x, y - 12 * s, 34 * s, { fill: "url(#flameGlow)" }) +
    path(`M${n(x - 22 * s)},${y}Q${x},${n(y + 12 * s)} ${n(x + 22 * s)},${y}Q${x},${n(y - 5 * s)} ${n(x - 22 * s)},${y}Z`, { fill: "#4f7a4c", ...ink(2) }) +
    path(`M${x},${n(y - 3 * s)}c${n(-5 * s)},${n(-6 * s)} ${n(-2 * s)},${n(-14 * s)} ${n(2 * s)},${n(-20 * s)}c${n(1 * s)},${n(8 * s)} ${n(6 * s)},${n(14 * s)} ${n(-2 * s)},${n(20 * s)}z`, { fill: SAFFRON_L }) +
    path(`M${n(x - 8 * s)},${n(y + 10 * s)}h${n(16 * s)}M${n(x - 5 * s)},${n(y + 18 * s)}h${n(10 * s)}`, stroke(SAFFRON_L, 3, 0.6))
  );
}

function pujaPlate(): string {
  return (
    ellipse(1236, 712, 116, 20, { fill: INK, opacity: 0.2 }) +
    ellipse(1210, 700, 100, 24, { fill: BRASS, ...ink(3.5) }) +
    ellipse(1210, 696, 82, 16, { fill: BRASS_D }) +
    path("M1152,696h116", { fill: "none", stroke: SAFFRON, "stroke-width": 15, "stroke-dasharray": "0 14" }) +
    path("M1156,692h108", { fill: "none", stroke: SAFFRON_L, "stroke-width": 5, "stroke-dasharray": "0 14" }) +
    path("M1296,694l28,-64", stroke("#6b3e17", 3)) +
    path(smooth([[1324, 630], [1312, 602], [1332, 572], [1318, 540], [1338, 508]]), stroke(CREAM, 4, 0.5))
  );
}

function lota(): string {
  return (
    ellipse(262, 890, 70, 12, { fill: INK, opacity: 0.25 }) +
    g(
      ink(3.5),
      path("M226,884C200,860 204,822 238,806L236,792H290L288,806C322,822 326,860 300,884Z", { fill: BRASS }),
      ellipse(263, 790, 34, 8, { fill: BRASS_D }),
    ) +
    path("M232,816C218,832 220,860 236,874", stroke(BRASS_L, 5, 0.9)) +
    path("M246,790c-6,-18 2,-30 16,-34M270,790c8,-16 20,-22 32,-20", stroke("#3f7a4c", 5))
  );
}

function boat(): string {
  return (
    g({ opacity: 0.3 }, path("M1262,584C1300,604 1470,606 1522,588", stroke(INK, 10))) +
    path("M1250,560C1300,590 1460,592 1528,562L1512,582C1460,598 1310,598 1266,580Z", { fill: "#6a3e2a", ...ink(3) }) +
    path("M1256,562C1310,584 1456,586 1524,564", stroke("#c48a5c", 4)) +
    path("M1330,570L1392,532", stroke("#4a2c1e", 5))
  );
}

function step(): string {
  const joints = [120, 330, 540, 760, 980, 1200, 1420].map((x) => `M${x},614L${n(600 + (x - 600) * 1.41)},782`).join("");
  return (
    rect(0, 612, 1600, 172, { fill: "url(#stepMid)" }) +
    path(joints, stroke("#8f7766", 3, 0.6)) +
    rect(0, 612, 1600, 172, { fill: "url(#ht)", opacity: 0.12 }) +
    rect(0, 610, 1600, 6, { fill: "#f6d9ba" }) +
    // the dawn catching the lip of the step; the diya's warm pool on the stone
    circle(DIYA[0], 700, 260, { fill: "url(#diyaPool)" })
  );
}

function rug(): string {
  const at = (u: number, v: number): P => mixP(mixP([330, 740], [882, 740], u), mixP([362, 650], [902, 650], u), v);
  const band = (v0: number, v1: number, fill: string) => poly([at(0, v0), at(1, v0), at(1, v1), at(0, v1)], { fill });
  const fringe = Array.from({ length: 28 }, (_, i) => {
    const p = at((i + 0.5) / 28, 0);
    return `M${pt(p)}l-2,12`;
  }).join("");
  return (
    poly([at(0, 0), at(1, 0), at(1, 1), at(0, 1)], { fill: TEAL_D, ...ink(4) }) +
    band(0.08, 0.92, SAFFRON) +
    band(0.2, 0.3, ROSE) +
    band(0.46, 0.54, CREAM) +
    band(0.7, 0.8, ROSE) +
    band(0.34, 0.38, TEAL) +
    band(0.62, 0.66, TEAL) +
    poly([at(0, 0), at(0.3, 0), at(0.3, 1), at(0, 1)], { fill: "url(#hs)", opacity: 0.18 }) +
    path(fringe, stroke(CREAM, 3))
  );
}

function harmonium(): string {
  // box: front face 420–780 × 580–670, depth vector (30, -70)
  const front: P[] = [[420, 580], [780, 580], [780, 670], [420, 670]];
  const top: P[] = [[420, 580], [780, 580], [810, 510], [450, 510]];
  const side: P[] = [[780, 580], [810, 510], [810, 600], [780, 670]];
  const kb = (u: number, v: number): P => mixP(mixP([432, 578], [768, 578], u), mixP([447, 543], [783, 543], u), v);
  const whites = Array.from({ length: 27 }, (_, i) => `M${pt(kb((i + 1) / 28, 0))}L${pt(kb((i + 1) / 28, 1))}`).join("");
  const blackAt = [1, 2, 4, 5, 6, 8, 9, 11, 12, 13, 15, 16, 18, 19, 20, 22, 23, 25, 26];
  const blacks = blackAt.map((i) => poly([kb(i / 28 - 0.011, 0.42), kb(i / 28 + 0.011, 0.42), kb(i / 28 + 0.011, 1), kb(i / 28 - 0.011, 1)])).join("");
  const stops = Array.from({ length: 9 }, (_, i) => mixP([478, 524], [786, 524], i / 8));
  // bellows hinged at the left end, opened like a fan at the back
  const hinge: P = [452, 508];
  const edge = (t: number): P => mixP([810, 510], [826, 424], t);
  const pleats = Array.from({ length: 6 }, (_, i) => poly([hinge, edge(i / 6), edge((i + 0.5) / 6)], { fill: i % 2 ? ROSE : SAFFRON_D, opacity: 0.55 })).join("");
  const jali = Array.from({ length: 7 }, (_, i) => circle(478 + i * 40, 625, 11)).join("");
  return (
    // cast shadow thrown forward-right (the sun is low behind, to the left)
    poly([[520, 672], [790, 672], [900, 716], [640, 724]], { fill: INK, opacity: 0.25 }) +
    // bellows
    poly([hinge, [810, 510], [826, 424]], { fill: SAFFRON, ...ink(4) }) +
    pleats +
    path(Array.from({ length: 6 }, (_, i) => `M${pt(hinge)}L${pt(edge((i + 1) / 6))}`).join(""), stroke(INK, 2.5, 0.8)) +
    poly([[450, 506], [828, 420], [834, 430], [454, 514]], { fill: WOOD_D, ...ink(3) }) +
    path(`M${pt(edge(0))}` + Array.from({ length: 12 }, (_, i) => `L${pt(mixP(edge((i + 0.5) / 12), [edge((i + 0.5) / 12)[0] + 12, edge((i + 0.5) / 12)[1] + 2], 1))}L${pt(edge((i + 1) / 12))}`).join(""), { fill: SAFFRON_D, ...ink(3) }) +
    // the box
    poly(side, { fill: WOOD_D, ...ink(4) }) +
    poly(top, { fill: WOOD_L, ...ink(4) }) +
    poly(front, { fill: WOOD, ...ink(4) }) +
    rect(436, 596, 328, 58, { rx: 6, fill: WOOD_D, ...ink(2.5) }) +
    g({ fill: "#caa25a", ...ink(2) }, ...[jali]) +
    g({ fill: WOOD_D }, ...Array.from({ length: 7 }, (_, i) => circle(478 + i * 40, 625, 4))) +
    // the diya lights the front; the dawn rims the left edges; the far side falls into dot-screen shade
    poly(front, { fill: "url(#frontLit)" }) +
    poly(side, { fill: "url(#ht)", opacity: 0.3 }) +
    poly([[620, 580], [780, 580], [780, 670], [620, 670]], { fill: "url(#hs)", opacity: 0.22 }) +
    path("M420,670V580L450,510", stroke(SAFFRON_L, 3, 0.9)) +
    // keyboard: ivory keys, black keys, a row of drone stops behind
    poly([kb(0, 0), kb(1, 0), kb(1, 1), kb(0, 1)], { fill: CREAM, ...ink(3) }) +
    path(whites, stroke("#8f7c66", 1.6)) +
    g({ fill: INK }, ...[blacks]) +
    g({ fill: CREAM, ...ink(2.5) }, ...stops.map(([x, y]) => ellipse(x, y, 7, 4))) +
    g({ fill: BRASS, ...ink(2) }, rect(426, 586, 14, 14, { rx: 2 }), rect(760, 586, 14, 14, { rx: 2 }), rect(426, 650, 14, 14, { rx: 2 }), rect(760, 650, 14, 14, { rx: 2 }))
  );
}

function diya(): string {
  const [x, y] = DIYA;
  return (
    circle(x + 14, y - 22, 150, { fill: "url(#flameGlow)" }) +
    g(
      ink(3.5),
      ellipse(x, y + 96, 40, 11, { fill: BRASS_D }),
      path(`M${x - 10},${y + 94}L${x - 6},${y + 58}L${x + 6},${y + 58}L${x + 10},${y + 94}Z`, { fill: BRASS }),
      ellipse(x, y + 58, 20, 6, { fill: BRASS_D }),
      // the bowl with its leaf-shaped spout
      path(`M${x - 44},${y + 30}C${x - 40},${y + 58} ${x + 20},${y + 62} ${x + 40},${y + 38}L${x + 62},${y + 22}L${x + 34},${y + 26}Z`, { fill: BRASS }),
      ellipse(x - 4, y + 30, 40, 9, { fill: BRASS_D }),
    ) +
    path(`M${x - 36},${y + 40}C${x - 24},${y + 52} ${x + 6},${y + 54} ${x + 24},${y + 44}`, stroke(BRASS_L, 4, 0.9)) +
    ellipse(x - 4, y + 29, 30, 5, { fill: "#6b3e17" }) +
    // flame: saffron outer, cream heart
    path(`M${x + 50},${y + 22}C${x + 30},${y + 6} ${x + 38},${y - 22} ${x + 56},${y - 44}C${x + 58},${y - 20} ${x + 76},${y + 2} ${x + 50},${y + 22}Z`, { fill: SAFFRON, ...ink(3) }) +
    path(`M${x + 52},${y + 16}C${x + 42},${y + 6} ${x + 46},${y - 10} ${x + 56},${y - 24}C${x + 58},${y - 8} ${x + 64},${y + 6} ${x + 52},${y + 16}Z`, { fill: "#fff3cf" })
  );
}

function manjira(): string {
  const cymbal = (x: number, y: number, rot: number) =>
    g(
      { transform: `rotate(${rot} ${x} ${y})` },
      ellipse(x, y, 30, 12, { fill: BRASS, ...ink(3.5) }),
      ellipse(x, y - 3, 11, 6, { fill: BRASS_D, ...ink(2.5) }),
      path(`M${x - 22},${y + 3}q22,10 44,0`, stroke(BRASS_L, 3, 0.9)),
    );
  return (
    g({ fill: INK, opacity: 0.25 }, ellipse(846, 724, 40, 8), ellipse(916, 714, 36, 7)) +
    path("M840,705C856,684 884,680 902,696", stroke(INK, 7)) +
    path("M840,705C856,684 884,680 902,696", stroke("#b8413a", 4)) +
    cymbal(836, 708, -8) +
    cymbal(908, 698, 10)
  );
}

function notes(): string {
  const note = (x: number, y: number, s: number) =>
    ellipse(x, y, 9 * s, 6.5 * s, { transform: `rotate(-24 ${x} ${y})` }) + path(`M${n(x + 8 * s)},${y}v${n(-32 * s)}q${n(12 * s)},${n(6 * s)} ${n(14 * s)},${n(18 * s)}`, { fill: "none", stroke: CREAM, "stroke-width": 3.5 * s });
  return g({ fill: CREAM, opacity: 0.75 }, note(560, 470, 0.9), note(620, 430, 0.75), note(676, 404, 0.6));
}

function pillarAndBells(): string {
  const bell = (y: number, s: number) =>
    path(`M${n(190 - 16 * s)},${n(y + 20 * s)}C${n(190 - 16 * s)},${n(y - 4 * s)} ${n(190 - 10 * s)},${n(y - 14 * s)} 190,${n(y - 14 * s)}C${n(190 + 10 * s)},${n(y - 14 * s)} ${n(190 + 16 * s)},${n(y - 4 * s)} ${n(190 + 16 * s)},${n(y + 20 * s)}L${n(190 + 22 * s)},${n(y + 26 * s)}H${n(190 - 22 * s)}Z`, { fill: BRASS, ...ink(3) }) +
    path(`M${n(190 + 6 * s)},${n(y - 8 * s)}C${n(190 + 12 * s)},${n(y)} ${n(190 + 13 * s)},${n(y + 10 * s)} ${n(190 + 14 * s)},${n(y + 20 * s)}`, stroke(BRASS_L, 3, 0.9)) +
    circle(190, y + 30 * s, 5 * s, { fill: BRASS_D, ...ink(2) });
  return (
    path("M32,-20H130V226H146V282H130V462C150,488 150,580 130,606V790H150V920H12V790H32V606C12,580 12,488 32,462V282H16V226H32Z", { fill: "#6f5a50", ...ink(4) }) +
    rect(28, -20, 40, 940, { fill: "#54433b" }) +
    path("M112,-20V226M112,282V466C128,490 128,578 112,602V790M132,800V920", stroke("#f0c8a2", 6, 0.75)) +
    path("M16,244H146M16,264H146M22,500H140M22,568H140M12,812H150M12,834H150M68,-20V226M68,282V462M68,606V790", stroke("#3c2e28", 3)) +
    path("M40,512c24,-10 58,-10 82,0M40,556c24,10 58,10 82,0", stroke("#8a7266", 4, 0.8)) +
    rect(10, -20, 150, 940, { fill: "url(#hs)", opacity: 0.2 }) +
    // a carved bracket and the string of bells
    path("M140,266h66v14h-20l-6,10h-40z", { fill: "#806a5e", ...ink(3.5) }) +
    path("M190,296V548", stroke(BRASS_D, 3)) +
    bell(344, 0.7) +
    bell(414, 0.85) +
    bell(500, 1.05)
  );
}

function nearStep(): string {
  const petals = [[430, 850, 9, SAFFRON], [470, 870, 7, ROSE], [640, 842, 8, SAFFRON], [690, 876, 7, ROSE_L], [880, 834, 7, SAFFRON], [980, 868, 8, ROSE], [1040, 846, 7, SAFFRON], [1480, 872, 9, SAFFRON], [1530, 846, 7, ROSE], [560, 890, 8, SAFFRON]] as const;
  return (
    rect(0, 782, 1600, 120, { fill: "url(#stepNear)" }) +
    rect(0, 782, 1600, 8, { fill: "#d9bfa6" }) +
    path("M0,782H1600", stroke(INK, 4)) +
    path("M260,790L200,900M760,790L800,900M1240,790L1330,900", stroke("#5c4a40", 3, 0.6)) +
    rect(0, 790, 1600, 112, { fill: "url(#ht)", opacity: 0.18 }) +
    g(ink(2), ...petals.map(([x, y, r, c]) => ellipse(x, y, r, r * 0.55, { fill: c }))) +
    // a marigold garland left on the step, running out of frame
    path("M1330,900C1360,846 1420,826 1480,846C1530,862 1560,850 1612,818", { fill: "none", stroke: "#8a3f12", "stroke-width": 20, "stroke-dasharray": "0 14" }) +
    path("M1330,900C1360,846 1420,826 1480,846C1530,862 1560,850 1612,818", { fill: "none", stroke: SAFFRON, "stroke-width": 14, "stroke-dasharray": "0 14" }) +
    path("M1330,900C1360,846 1420,826 1480,846C1530,862 1560,850 1612,818", { fill: "none", stroke: SAFFRON_L, "stroke-width": 5, "stroke-dasharray": "0 14", transform: "translate(2 -2)" })
  );
}

export const bhaktiVilas: Scene = {
  slug: "bhakti-vilas",
  render() {
    const defs = [
      printDefs(INK, "#fff0d2", 41),
      linear("sky", [
        [0, "#3b6968"],
        [0.26, "#5a8580"],
        [0.5, "#a6a19f"],
        [0.7, "#dcaaa3"],
        [0.88, "#f2c597"],
        [1, "#f8dcaa"],
      ]),
      linear("water", [
        [0, "#f2c7a4"],
        [0.12, "#d9ab9c"],
        [0.36, "#8fa8a1"],
        [0.7, "#4b7b79"],
        [1, "#2c5a5b"],
      ]),
      linear("stepMid", [
        [0, "#d8bda5"],
        [0.4, "#c2a792"],
        [1, "#a58c7a"],
      ]),
      linear("stepNear", [
        [0, "#957d6c"],
        [1, "#5f4c42"],
      ]),
      linearFrontLit(),
      glow("halo", "#fbd49a", SUN, 560, 0.72),
      glow("rayFade", "#fde2b0", SUN, 640, 0.62),
      glow("flameGlow", "#ffd08a", [DIYA[0] + 14, DIYA[1] - 22], 150, 0.75),
      glow("diyaPool", "#ffc98a", [DIYA[0], 700], 260, 0.5),
      el("radialGradient", { id: "sun", cx: 0.42, cy: 0.4, r: 0.62 }, el("stop", { offset: 0, "stop-color": "#fff8e0" }) + el("stop", { offset: 1, "stop-color": "#fbc977" })),
      radial("fadeR", [
        [0, "#fff", 1],
        [1, "#fff", 0],
      ]),
      el("mask", { id: "sunFade" }, circle(SUN[0], SUN[1], 420, { fill: "url(#fadeR)" })),
      el("filter", { id: "soft", x: -0.2, y: -1, width: 1.4, height: 3 }, el("feGaussianBlur", { stdDeviation: 8 })),
    ];
    const body = g(
      { "stroke-linecap": "round", "stroke-linejoin": "round" },
      sky(),
      farBank(),
      water(),
      lotus(1130, 600, 0.9, false),
      lotus(1190, 590, 1, true),
      lotus(1420, 612, 1.1, true),
      lotus(1500, 598, 0.8, false),
      lotus(250, 598, 0.8, true),
      boat(),
      floatingDiya(1160, 548, 1),
      floatingDiya(1290, 528, 0.8),
      floatingDiya(1556, 556, 1.1),
      step(),
      pujaPlate(),
      rug(),
      harmonium(),
      notes(),
      manjira(),
      diya(),
      nearStep(),
      lota(),
      pillarAndBells(),
      printFinish(0.22, 0.9),
    );
    return svg(defs.join(""), body);
  },
};

/** The diya's warm light across the harmonium's front, strongest on its left. */
function linearFrontLit(): string {
  return linear("frontLit", [
    [0, "#ffcf8a", 0.42],
    [0.5, "#ffcf8a", 0.1],
    [1, "#ffcf8a", 0],
  ], 0, 0, 1, 0);
}
