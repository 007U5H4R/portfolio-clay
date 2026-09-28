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
  pine,
  poly,
  polyline,
  printDefs,
  printFinish,
  pt,
  radial,
  rect,
  ridge,
  smooth,
  star,
  svg,
  type P,
  type Scene,
} from "../kit";

/**
 * Campfire Board — "One dashboard, every project" (data/projects.ts: a local-first, multi-project
 * management dashboard — Kanban board, hours-axis Gantt, a project switcher; a personal fork of
 * Backlog.md). A night campsite: a campfire of layered flames throws sparks and warm light across a
 * wooden A-frame easel that holds a kanban of pinned paper cards in three columns, over a plank painted
 * with staggered Gantt bars. Three small tents (the projects) in the column colours wait under the
 * pines by a hanging lantern; a crescent moon, a log seat and a mug. Palette: navy night, ember orange,
 * kraft wood, forest green, cream.
 */

const INK = "#101b21";
const CREAM = "#f3e6c6";
const EMBER = "#d65a2a";
const MUSTARD = "#d3a046";
const GREEN = "#4b7a5b";
const FIRE: P = [455, 668];
const PLAY: P = [1024, 470];
const MOON: P = [1372, 318];

// round caps and joins are set once on the scene's wrapper group (smaller file), so these only colour
const inked = (width = 4) => ({ stroke: INK, "stroke-width": width }) as const;
const stroke = (color: string, width: number, opacity?: number) => ({ fill: "none", stroke: color, "stroke-width": width, opacity }) as const;
const dot = (x: number, y: number, r: number) => `M${n(x - r)},${n(y)}a${n(r)},${n(r)} 0 1,0 ${n(r * 2)},0a${n(r)},${n(r)} 0 1,0 ${n(-r * 2)},0`;

/** A pine, instanced from the one in <defs> (a 100-tall, 50-wide unit) — dozens of trees stay light. */
const tree = (x: number, base: number, h: number, w: number) =>
  el("use", { href: "#pn", transform: `translate(${Math.round(x)} ${Math.round(base)}) scale(${n(w / 50)} ${n(h / 100)})` });

/** A tiny deterministic PRNG (mulberry32): stars and sparks land in the same place on every build. */
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

/** The crescent of a disc left uncovered by the same disc shifted by (ox, oy). */
function crescent(cx: number, cy: number, r: number, ox: number, oy: number): string {
  const d = Math.hypot(ox, oy);
  const h = Math.sqrt(r * r - (d * d) / 4);
  const m: P = [cx + ox / 2, cy + oy / 2];
  const a: P = [m[0] - (oy / d) * h, m[1] + (ox / d) * h];
  const b: P = [m[0] + (oy / d) * h, m[1] - (ox / d) * h];
  return `M${pt(a)}A${n(r)},${n(r)} 0 1,1 ${pt(b)}A${n(r)},${n(r)} 0 0,0 ${pt(a)}Z`;
}

/** Linear interpolation through (x, y) control points — where a ridge line sits at column x. */
function heightAt(points: readonly P[], x: number): number {
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1]!;
    const b = points[i]!;
    if (x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0] || 1);
  }
  return points[points.length - 1]![1];
}

function sky(): string {
  const r = rng(5);
  const faint: string[] = [];
  const bright: string[] = [];
  for (let i = 0; i < 72; i += 1) {
    const x = Math.round(r() * 1600);
    const y = Math.round(14 + r() * 470);
    const size = 0.9 + r() * 1.5;
    const keep = r();
    if (Math.hypot(x - PLAY[0], y - PLAY[1]) < 124 || Math.hypot(x - MOON[0], y - MOON[1]) < 96) continue;
    if (Math.hypot(x - FIRE[0], (y - 420) * 1.4) < 330) continue; // the fire's glow drowns them
    if (y < 262) {
      if (keep < 0.5) faint.push(dot(x, y, size * 0.8));
    } else bright.push(dot(x, y, size));
  }
  const twinkles = ([[1188, 318], [1548, 402], [1262, 404], [918, 300]] as const).map(([x, y]) => poly(star(x, y, 9, 1.5, 4, -90), { fill: CREAM, opacity: 0.8 })).join("");
  return (
    rect(0, 0, 1600, 640, { fill: "url(#sky)" }) +
    circle(MOON[0], MOON[1], 190, { fill: "url(#moonGlow)" }) +
    path(faint.join(""), { fill: CREAM, opacity: 0.45 }) +
    path(bright.join(""), { fill: CREAM, opacity: 0.8 }) +
    twinkles +
    path(smooth([[1150, 372], [1290, 362], [1430, 370], [1570, 358]]), stroke("#2b4169", 18, 0.35)) +
    path(smooth([[1240, 396], [1360, 390], [1480, 398]]), stroke("#2b4169", 12, 0.3)) +
    path(crescent(MOON[0], MOON[1], 40, 17, -11), { fill: "#f1e8cc" }) +
    path(crescent(MOON[0], MOON[1], 40, 17, -11), { fill: "url(#hs)", opacity: 0.12 })
  );
}

function land(): string {
  const farPts: readonly P[] = [[0, 520], [160, 488], [330, 506], [520, 480], [700, 500], [880, 514], [1040, 534], [1200, 502], [1380, 488], [1600, 508]];
  let saw = "M0,640";
  for (let x = 4; x < 1612; x += 17) {
    const b = Math.round(heightAt(farPts, Math.min(x, 1600)) + 26);
    // keep the play-button sky clear: no trees there, just the soft ridge
    saw += x > 890 && x < 1150 ? `L${x},${b}` : `L${x - 9},${b}L${x},${b - 30 - ((x * 7) % 26)}`;
  }
  const nearLeft = ([[20, 300], [70, 250], [118, 280], [168, 214], [214, 232], [262, 186], [306, 200], [352, 160], [394, 132], [520, 118], [560, 150], [612, 110]] as const)
    .map(([x, h]) => tree(x, 616, h, h * 0.46))
    .join("");
  const nearRight = ([[1162, 128], [1204, 170], [1246, 142], [1290, 196], [1330, 160], [1414, 188], [1456, 226], [1498, 172], [1540, 250]] as const)
    .map(([x, h]) => tree(x, 624, h, h * 0.46))
    .join("");
  return (
    path(ridge(farPts, 640), { fill: "#1b2c49" }) +
    path(`${saw}L1600,640Z`, { fill: "#172a3e" }) +
    g({ fill: "#12241f" }, nearLeft, nearRight) +
    path(ridge([[0, 606], [300, 596], [640, 608], [1000, 598], [1300, 610], [1600, 600]], 900), { fill: "url(#ground)" }) +
    rect(0, 596, 1600, 304, { fill: "url(#ht)", opacity: 0.12 }) +
    ellipse(FIRE[0], FIRE[1] + 26, 520, 170, { fill: "url(#pool)" }) +
    path(`${smooth([[944, 904], [1036, 800], [1126, 716], [1198, 652]])}${smooth([[1246, 652], [1196, 726], [1150, 808], [1228, 904]]).replace("M", "L")}Z`, { fill: "#34302a", opacity: 0.55 })
  );
}

function tent(x0: number, x1: number, apex: P, depth: number, base: number, fill: string, shade: string, lit: string): string {
  const back: P = [apex[0] + depth, apex[1] - 5];
  return (
    line(apex, [x0 - 34, base + 4], stroke("#7d857f", 1.6, 0.45)) +
    line(back, [x1 + depth + 30, base - 2], stroke("#7d857f", 1.6, 0.45)) +
    poly([apex, back, [x1 + depth, base - 7], [x1, base]], { fill: shade }) +
    poly([[x0, base], apex, [x1, base]], { fill }) +
    poly([[x0, base], apex, [apex[0] - (apex[0] - x0) * 0.1, base]], { fill: lit, opacity: 0.75 }) +
    poly([[apex[0], apex[1] + 26], [apex[0] - 17, base], [apex[0] + 15, base]], { fill: shade }) +
    line([apex[0], apex[1] + 26], [apex[0] - 1, base], stroke(INK, 2, 0.5))
  );
}

function camp(): string {
  const [lx, ly] = [1250, 462];
  return (
    tent(1118, 1236, [1176, 556], 44, 640, "#94462c", "#61301f", "#c96a3c") +
    tent(1302, 1384, [1342, 576], 30, 628, "#b58a47", "#7a5c30", "#d9a95e") +
    tent(1450, 1572, [1510, 552], 46, 644, "#3f6a50", "#294735", "#5f8c63") +
    // a lantern hanging from a shepherd's hook between the tents
    circle(lx, ly + 10, 130, { fill: "url(#lanternGlow)" }) +
    path(`M1276,652V432Q1276,414 1258,414Q${lx},414 ${lx},424`, stroke("#3a2a1e", 5)) +
    line([lx, 424], [lx, 440], stroke("#3a2a1e", 2.5)) +
    rect(lx - 13, 440, 26, 8, { rx: 3, fill: "#3a3027" }) +
    rect(lx - 11, 448, 22, 26, { rx: 8, fill: "#ffd98c" }) +
    rect(lx - 5, 452, 10, 18, { rx: 4, fill: "#fff3cf" }) +
    rect(lx - 13, 474, 26, 7, { rx: 3, fill: "#3a3027" }) +
    ellipse(lx, 640, 70, 12, { fill: "#f3b561", opacity: 0.16 })
  );
}

/** One flame layer: pointed tongues rising from a rounded base, leaning a little with the breeze. */
function flame(cx: number, base: number, half: number, tips: readonly (readonly [number, number])[], lean: number): string {
  let d = `M${n(cx - half)},${n(base)}`;
  let prev: P = [cx - half, base];
  tips.forEach(([fx, h], i) => {
    const tip: P = [cx + fx * half + lean * h * 0.16, base - h];
    const next = tips[i + 1];
    const valley: P = next ? [cx + ((fx + next[0]) / 2) * half + lean * 6, base - Math.min(h, next[1]) * 0.5] : [cx + half, base];
    d += `C${n(prev[0])},${n(prev[1] - (prev[1] - tip[1]) * 0.55)} ${n(tip[0] - 10 * lean)},${n(tip[1] + (prev[1] - tip[1]) * 0.32)} ${pt(tip)}`;
    d += `C${n(tip[0] + 5)},${n(tip[1] + (valley[1] - tip[1]) * 0.38)} ${n(valley[0])},${n(valley[1] - (valley[1] - tip[1]) * 0.3)} ${pt(valley)}`;
    prev = valley;
  });
  return `${d}Q${n(cx)},${n(base + 24)} ${n(cx - half)},${n(base)}Z`;
}

function fire(): string {
  const [fx, fy] = FIRE;
  const stones: { x: number; y: number; back: boolean; rx: number }[] = [];
  for (let i = 0; i < 11; i += 1) {
    const a = (i / 11) * Math.PI * 2 + 0.2;
    stones.push({ x: fx + Math.cos(a) * 124, y: fy + 10 + Math.sin(a) * 26, back: Math.sin(a) < 0, rx: 24 + ((i * 5) % 9) });
  }
  const stone = (s: { x: number; y: number; rx: number }, front: boolean) =>
    ellipse(s.x, s.y, s.rx, 15, { fill: front ? "#3f444c" : "#565a60", ...inked(3.5) }) +
    ellipse(s.x + (fx - s.x) * 0.06, s.y - 6, s.rx * 0.62, 5.5, { fill: "#e0853f", opacity: front ? 0.55 : 0.85 });
  // a log: dark bark, a warm rim where the flames lick it, and (for the front ones) a cut end
  const log = (a: P, b: P, reach: number, end: boolean) => {
    const e: P = [a[0] + (b[0] - a[0]) * reach, a[1] + (b[1] - a[1]) * reach];
    return (
      line(a, e, { stroke: INK, "stroke-width": 32 }) +
      line(a, e, { stroke: "#6a4128", "stroke-width": 24 }) +
      line([a[0] + (e[0] - a[0]) * 0.15, a[1] + (e[1] - a[1]) * 0.15], e, stroke("#f2a24f", 4, 0.75)) +
      (end ? ellipse(a[0], a[1], 12, 14, { fill: "#d8ae76", ...inked(3) }) + ellipse(a[0], a[1], 5, 6, { fill: "none", stroke: "#a0703f", "stroke-width": 2 }) : "")
    );
  };
  const front: [P, P][] = [[[fx - 70, fy + 22], [fx + 10, fy - 96]], [[fx + 76, fy + 20], [fx - 6, fy - 94]], [[fx + 4, fy + 28], [fx + 2, fy - 84]]];
  const r = rng(19);
  const sparks: string[] = [];
  const embers: string[] = [];
  const streaks: string[] = [];
  for (let i = 0; i < 50; i += 1) {
    const rise = Math.pow(r(), 0.8);
    const y = fy - 200 - rise * 200;
    const x = fx - 60 + r() * 120 + rise * 170 + Math.sin(rise * 9) * 14;
    if (y < 266) continue;
    const size = 3.8 - rise * 2.6;
    const [ix, iy] = [Math.round(x), Math.round(y)];
    if (i % 6 === 0) streaks.push(`M${ix},${iy}l${Math.round(4 + size * 2)},${Math.round(-8 - size * 3)}`);
    else if (size > 2.6 && i % 2 === 0) embers.push(dot(ix, iy, size * 2.6));
    sparks.push(dot(ix, iy, size));
  }
  return (
    circle(fx, fy - 60, 200, { fill: "url(#fireCore)" }) +
    stones.filter((s) => s.back).map((s) => stone(s, false)).join("") +
    log([fx - 104, fy + 4], [fx + 20, fy - 108], 1, false) +
    log([fx + 106, fy + 2], [fx - 22, fy - 106], 1, false) +
    front.map(([a, b]) => log(a, b, 1, false)).join("") +
    path(flame(fx, fy - 4, 102, [[-0.86, 110], [-0.56, 192], [-0.22, 262], [0.1, 320], [0.42, 238], [0.7, 172], [0.9, 104]], 0.7), { fill: EMBER, ...inked(4) }) +
    path(flame(fx + 4, fy - 6, 80, [[-0.7, 130], [-0.3, 226], [0.08, 272], [0.45, 180], [0.76, 112]], 0.7), { fill: "#ee8832" }) +
    path(flame(fx + 6, fy - 8, 56, [[-0.45, 140], [0.05, 206], [0.5, 120]], 0.7), { fill: "#f6bb52" }) +
    path(flame(fx + 8, fy - 10, 30, [[-0.15, 112], [0.42, 72]], 0.7), { fill: "#fde6a8" }) +
    ellipse(fx, fy + 6, 98, 17, { fill: "#ffcf7a", opacity: 0.85 }) +
    front.map(([a, b]) => log(a, b, 0.42, true)).join("") +
    stones.filter((s) => !s.back).map((s) => stone(s, true)).join("") +
    path(embers.join(""), { fill: "#ffb45a", opacity: 0.22 }) +
    path(sparks.join(""), { fill: "#ffd27e" }) +
    path(streaks.join(""), stroke("#f59a3c", 3, 0.9))
  );
}

function easel(): string {
  const r = rng(3);
  const legL: P[] = [[704, 282], [720, 282], [622, 778], [602, 778]];
  const legR: P[] = [[728, 282], [744, 282], [848, 778], [828, 778]];
  const cols = [
    { x: 616, color: EMBER, cards: 4, done: false },
    { x: 695, color: MUSTARD, cards: 2, done: false },
    { x: 774, color: GREEN, cards: 3, done: true },
  ] as const;
  const pins = [EMBER, "#63799e", MUSTARD, GREEN];
  const cards: string[] = [];
  for (const col of cols) {
    cards.push(rect(col.x, 338, 62, 16, { rx: 3, fill: col.color, ...inked(2.5) }));
    for (let k = 0; k < col.cards; k += 1) {
      const y = 366 + k * 54;
      const rot = (r() - 0.5) * 6;
      const ink = r() > 0.5 ? 44 : 34;
      cards.push(
        g(
          { transform: `rotate(${n(rot)} ${col.x + 31} ${y})` },
          rect(col.x + 5, y + 5, 62, 42, { rx: 3, fill: INK, opacity: 0.35 }),
          rect(col.x, y, 62, 42, { rx: 3, fill: CREAM, ...inked(2.5) }),
          path(`M${col.x + 9},${y + 15}h41M${col.x + 9},${y + 25}h${ink - 9}`, stroke("#9a8466", 2.4, 0.75)),
          col.done ? polyline([[col.x + 40, y + 31], [col.x + 46, y + 36], [col.x + 56, y + 24]], stroke(GREEN, 4)) : circle(col.x + 51, y + 32, 4, { fill: col.color }),
          circle(col.x + 31, y + 3, 5.5, { fill: pins[(k + col.cards) % 4], ...inked(2) }),
        ),
      );
    }
  }
  const ticks = Array.from({ length: 7 }, (_, i) => `M${604 + i * 40},609v6`).join("");
  const bar = (x: number, y: number, w: number, fill: string) => rect(x, y, w, 12, { rx: 4, fill, ...inked(2.5) });
  return (
    // the easel's shadow thrown away from the fire
    poly([[606, 776], [846, 776], [1090, 818], [860, 836]], { fill: INK, opacity: 0.32 }) +
    poly([[716, 298], [730, 298], [776, 780], [760, 780]], { fill: "#553621", ...inked(3.5) }) +
    poly(legL, { fill: "url(#wood)", ...inked(4) }) +
    poly(legR, { fill: "url(#wood)", ...inked(4) }) +
    line([622, 722], [828, 722], { stroke: INK, "stroke-width": 13 }) +
    line([622, 722], [828, 722], { stroke: "#8f6038", "stroke-width": 7 }) +
    rect(700, 274, 48, 18, { rx: 6, fill: "#7a5231", ...inked(4) }) +
    // the board: a framed cork panel lit from the fire side
    rect(592, 318, 264, 282, { rx: 6, fill: "#8a5c34", ...inked(4) }) +
    rect(604, 330, 240, 258, { fill: "url(#cork)" }) +
    rect(604, 330, 240, 258, { fill: "url(#hs)", opacity: 0.12 }) +
    cards.join("") +
    rect(604, 330, 240, 258, { fill: "url(#boardShade)" }) +
    line([596, 322], [596, 596], stroke("#f2b36a", 3, 0.7)) +
    // the Gantt plank: an hours axis and staggered bars with their dependency hooks
    rect(582, 602, 284, 60, { rx: 5, fill: "url(#plank)", ...inked(4) }) +
    path(ticks, stroke("#5a3a22", 2, 0.8)) +
    bar(598, 620, 92, EMBER) +
    bar(664, 634, 108, MUSTARD) +
    bar(746, 648, 90, GREEN) +
    path("M690,626h6v8M772,640h6v8", stroke(INK, 2.5, 0.75)) +
    rect(582, 602, 284, 60, { fill: "url(#boardShade)" }) +
    line([586, 606], [586, 658], stroke("#f2b36a", 3, 0.7))
  );
}

function seat(): string {
  return (
    poly([[288, 770], [40, 770], [-60, 800], [210, 800]], { fill: INK, opacity: 0.35 }) +
    rect(-30, 716, 320, 76, { rx: 36, fill: "url(#logFill)", ...inked(4) }) +
    path("M0,736H240M20,754H270M-10,772H200", stroke("#3c2618", 3, 0.7)) +
    ellipse(288, 754, 16, 37, { fill: "#d9ae74", ...inked(3.5) }) +
    ellipse(288, 754, 9, 22, { fill: "none", stroke: "#a3713f", "stroke-width": 2.5 }) +
    ellipse(288, 754, 3.5, 9, { fill: "none", stroke: "#a3713f", "stroke-width": 2.5 }) +
    line([10, 720], [262, 720], stroke("#f0a653", 3, 0.6)) +
    // an enamel mug with a little steam
    path("M192,696c-16,0 -16,26 0,26", stroke(INK, 11)) +
    path("M192,696c-16,0 -16,26 0,26", stroke("#e6d8b5", 5)) +
    path("M190,684h40v38q0,8 -8,8h-24q-8,0 -8,-8Z", { fill: "url(#mugFill)", ...inked(3.5) }) +
    ellipse(210, 684, 20, 5, { fill: "#2a3b4c", ...inked(3) }) +
    path("M204,672c-8,-10 8,-16 0,-28M216,670c-6,-8 6,-14 0,-24", stroke(CREAM, 3, 0.4))
  );
}

/** Split firewood stacked end-on in the bottom-right corner, its cut faces warm from the fire. */
function woodpile(): string {
  const logs: string[] = [];
  const rows = [[1318, 876, 4], [1349, 822, 3], [1380, 768, 2]] as const;
  for (const [x0, y, count] of rows) for (let i = 0; i < count; i += 1) logs.push(el("use", { href: "#le", x: x0 + i * 62, y }));
  return logs.join("");
}

function foreground(): string {
  const tuft = (x: number, s: number) =>
    poly([[x, 900], [x + 8 * s, 852], [x + 14 * s, 900], [x + 22 * s, 838], [x + 30 * s, 900], [x + 40 * s, 860], [x + 46 * s, 900]], { fill: "#0b1512" });
  return (
    g({ fill: "#0b1714" }, tree(-40, 900, 760, 250), tree(1646, 900, 700, 240)) +
    woodpile() +
    tuft(330, 1.3) +
    tuft(560, 1) +
    tuft(900, 1.5) +
    tuft(1040, 1.1) +
    tuft(1250, 1.6) +
    tuft(1380, 1.2)
  );
}

export const campfireBoard: Scene = {
  slug: "campfire-board",
  render() {
    const defs = [
      printDefs(INK, "#ffe2b0", 41),
      pine(0, 0, 100, 50, { id: "pn" }),
      g(
        { id: "le" },
        circle(0, 0, 30, { fill: "#4a3020", ...inked(4) }),
        circle(-2, 1, 23, { fill: "#a47a4a" }),
        path("M-16,1a14,14 0 1,0 28,0a14,14 0 1,0 -28,0M-7,1a5,5 0 1,0 10,0a5,5 0 1,0 -10,0", stroke("#7a5632", 2.5)),
        path(crescent(0, 0, 28, -12, -10), { fill: "url(#ht)", opacity: 0.35 }),
      ),
      el("mask", { id: "vFade" }, rect(0, 262, 920, 400, { fill: "url(#fadeIn)" })),
      linear("fadeIn", [
        [0, "#ffffff", 0],
        [0.4, "#ffffff", 1],
      ]),
      el("mask", { id: "glowFade" }, circle(FIRE[0], FIRE[1] - 150, 460, { fill: "url(#fadeOut)" })),
      radial("fadeOut", [
        [0, "#ffffff", 0.9],
        [1, "#ffffff", 0],
      ]),
      linear("sky", [
        [0, "#0d1735"],
        [0.4, "#142349"],
        [0.75, "#1c3056"],
        [1, "#263b5c"],
      ]),
      glow("moonGlow", "#dfe6d6", MOON, 190, 0.24),
      linear("ground", [
        [0, "#1c2c29"],
        [0.3, "#142220"],
        [1, "#0b1412"],
      ]),
      radial("pool", [
        [0, "#f39b4a", 0.6],
        [0.5, "#e07a36", 0.22],
        [1, "#e07a36", 0],
      ]),
      glow("fireGlow", "#f2954a", [FIRE[0], FIRE[1] - 120], 560, 0.42),
      glow("fireCore", "#ffd98a", [FIRE[0], FIRE[1] - 60], 190, 0.75),
      glow("lanternGlow", "#ffc76e", [1250, 472], 130, 0.5),
      linear("wood", [
        [0, "#cf955a"],
        [0.5, "#9c6a3d"],
        [1, "#6f4829"],
      ], 0, 0, 1, 0),
      linear("cork", [
        [0, "#dcb173"],
        [0.55, "#c49658"],
        [1, "#a67a47"],
      ], 0, 0, 1, 0),
      linear("boardShade", [
        [0, INK, 0],
        [0.5, INK, 0.06],
        [1, INK, 0.3],
      ], 0, 0, 1, 0),
      linear("plank", [
        [0, "#d5a466"],
        [1, "#a8773f"],
      ]),
      linear("logFill", [
        [0, "#7a4c2c"],
        [0.5, "#5a3820"],
        [1, "#3a2415"],
      ]),
      linear("mugFill", [
        [0, "#cfc2a2"],
        [0.6, "#efe4c8"],
        [1, "#fff4dc"],
      ], 0, 0, 1, 0),
    ];
    const body =
      g(
        { "stroke-linecap": "round", "stroke-linejoin": "round" },
        sky(),
        land(),
        camp(),
        circle(FIRE[0], FIRE[1] - 120, 560, { fill: "url(#fireGlow)" }),
        g({ mask: "url(#vFade)" }, rect(0, 262, 920, 400, { fill: "url(#hl)", opacity: 0.3, mask: "url(#glowFade)" })),
        easel(),
        fire(),
        seat(),
        foreground(),
      ) + printFinish(0.22, 0.9);
    return svg(defs.join(""), body);
  },
};
