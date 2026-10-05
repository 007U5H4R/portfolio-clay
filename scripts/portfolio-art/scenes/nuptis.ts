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
  printDefs,
  printFinish,
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
 * Nuptis — "Wedding vendor ops" (data/projects.ts: vendor ops for wedding-planning agencies —
 * verification status, work orders, payment milestones and backup coverage in one place; no AI).
 * A wedding mandap being set up at golden hour: a floral canopy on four pillars wound with marigold,
 * garland swags, strings of small lights, crates of flowers waiting on the lawn, a haveli glowing in
 * the haze; on the planner's table a checklist clipboard, a walkie-talkie and vendor ribbon badges.
 * Palette: terracotta, marigold, blush, deep leaf green, cream, a little gold.
 */

type Attrs = Record<string, string | number | undefined>;

const INK = "#2e1a12";
const CREAM = "#f6ead2";
const MARIGOLD = "#f0a02a";
const MARIGOLD_D = "#c9651a";
const MARIGOLD_L = "#fdd76e";
const TERRA = "#b5553a";
const TERRA_D = "#86381f";
const BLUSH = "#eab2a3";
const BLUSH_L = "#f8d8ca";
const BLUSH_D = "#c4867c";
const LEAF = "#2f5a3a";
const LEAF_D = "#1c3a26";
const LEAF_L = "#5a8a5a";
const GOLD = "#d6a548";
const GOLD_D = "#a4772c";
const STONE = "#f4e5c8";
const SUN: P = [1400, 452];

const ink = (w = 4): Attrs => ({ stroke: INK, "stroke-width": w });
const stroke = (color: string, w: number, opacity?: number): Attrs => ({ fill: "none", stroke: color, "stroke-width": w, opacity });
/** A chain of round dots along `d` (round caps on zero-length dashes) — garlands, bulbs, flowers. */
const dots = (d: string, color: string, size: number, gap: number, extra: Attrs = {}) =>
  path(d, { fill: "none", stroke: color, "stroke-width": size, "stroke-dasharray": `0 ${gap}`, ...extra });
/** A marigold garland: dark rim, orange heads, a lit dot on each head (light from the right). */
const garland = (d: string, size = 15, gap = 11, tones: readonly [string, string, string] = [MARIGOLD_D, MARIGOLD, MARIGOLD_L]) =>
  dots(d, tones[0], size, gap) + dots(d, tones[1], size * 0.72, gap) + dots(d, tones[2], size * 0.3, gap, { transform: `translate(${n(size * 0.14)} ${n(-size * 0.14)})` });

/** An onion dome (ogee point) standing on `base`. */
function onion(cx: number, base: number, w: number, h: number): string {
  const x = (f: number) => n(cx + w * f);
  const y = (f: number) => n(base - h * f);
  return `M${x(-0.46)},${n(base)}C${x(-0.56)},${y(0.35)} ${x(-0.42)},${y(0.72)} ${x(-0.12)},${y(0.86)}Q${x(-0.02)},${y(0.92)} ${n(cx)},${y(1)}Q${x(0.02)},${y(0.92)} ${x(0.12)},${y(0.86)}C${x(0.42)},${y(0.72)} ${x(0.56)},${y(0.35)} ${x(0.46)},${n(base)}Z`;
}

function dome(cx: number, base: number, w: number, h: number): string {
  const l = cx - w / 2;
  const r = cx + w / 2;
  return `M${n(l)},${n(base)}C${n(l - w * 0.04)},${n(base - h * 0.62)} ${n(cx - w * 0.2)},${n(base - h * 0.92)} ${n(cx)},${n(base - h)}C${n(cx + w * 0.2)},${n(base - h * 0.92)} ${n(r + w * 0.04)},${n(base - h * 0.62)} ${n(r)},${n(base)}Z`;
}

function sky(): string {
  const bird = (x: number, y: number, s: number) => `M${x - 12 * s},${y}q${6 * s},${-7 * s} ${12 * s},0q${6 * s},${-7 * s} ${12 * s},0`;
  return (
    rect(0, 0, 1600, 600, { fill: "url(#sky)" }) +
    // faint high streaks — the lettering band stays calm
    path(smooth([[60, 170], [240, 158], [420, 168]]) + smooth([[1100, 150], [1300, 138], [1520, 148]]), stroke("#c77452", 14, 0.3)) +
    circle(SUN[0], SUN[1], 620, { fill: "url(#halo)" }) +
    circle(SUN[0], SUN[1], 360, { fill: "url(#hl)", mask: "url(#sunFade)", opacity: 0.55 }) +
    circle(SUN[0], SUN[1], 62, { fill: "url(#sun)" }) +
    // low golden haze
    path(smooth([[1150, 398], [1290, 392], [1420, 398]]) + smooth([[1290, 424], [1450, 416], [1610, 422]]), stroke("#fde3a6", 8, 0.6)) +
    path(smooth([[-10, 440], [180, 432], [330, 440]]), stroke("#f7c67c", 10, 0.45)) +
    path(bird(1190, 236, 1) + bird(1226, 262, 0.8) + bird(1160, 270, 0.7), stroke(TERRA_D, 3.5, 0.75))
  );
}

function distance(): string {
  const haze = "#d28c62";
  const arches = Array.from({ length: 11 }, (_, i) => `M${1160 + i * 36},542v-16a8,8 0 0 1 16,0v16z`).join("");
  return (
    g(
      { fill: haze },
      rect(1140, 486, 450, 80),
      rect(1216, 462, 176, 26),
      path(dome(1292, 462, 72, 58) + dome(1170, 486, 34, 24) + dome(1450, 486, 34, 24) + dome(1540, 486, 34, 24)),
      rect(1289, 390, 6, 18),
      rect(1150, 480, 40, 6),
      rect(1430, 480, 40, 6),
      rect(1520, 480, 40, 6),
    ) +
    path(arches, { fill: "#b9724d", opacity: 0.7 }) +
    // the tree line in the golden haze, in front of the haveli's base
    path(ridge([[0, 536], [60, 520], [130, 530], [200, 512], [290, 528], [380, 516], [470, 530], [560, 518], [650, 530], [740, 514], [840, 528], [930, 520], [1010, 530], [1090, 516], [1170, 532], [1260, 526], [1350, 536], [1440, 528], [1530, 534], [1600, 524]], 600), { fill: "#8f8752" }) +
    rect(0, 552, 1600, 348, { fill: "url(#lawn)" }) +
    g({ fill: "#e3cf78", opacity: 0.32 }, ellipse(1290, 590, 300, 7), ellipse(1080, 618, 240, 6), ellipse(1420, 652, 220, 8), ellipse(260, 606, 200, 6)) +
    rect(0, 560, 1600, 340, { fill: "url(#ht)", opacity: 0.14 }) +
    // the mandap's long shadow, thrown left by the low sun
    poly([[312, 706], [312, 744], [-20, 796], [-20, 736], [120, 700]], { fill: INK, opacity: 0.28 })
  );
}

function pillar(x: number, top: number, bottom: number, w: number, back: boolean): string {
  const h = bottom - top;
  const turns = Math.floor((h - 60) / 34);
  const wrap = Array.from({ length: turns }, (_, i) => `M${n(x - w / 2)},${n(top + 30 + i * 34)}L${n(x + w / 2)},${n(top + 48 + i * 34)}`).join("");
  return (
    rect(x - w / 2, top, w, h, { fill: back ? "#d6bd98" : STONE }) +
    rect(x - w / 2, top, w * 0.36, h, { fill: back ? "#a88b69" : "#d3b287" }) +
    rect(x - w / 2, top, w * 0.36, h, { fill: "url(#hs)", opacity: 0.3 }) +
    rect(x + w * 0.14, top, w * 0.16, h, { fill: "#fff8e6", opacity: back ? 0.35 : 0.85 }) +
    garland(wrap, back ? 10 : 13, back ? 8 : 10) +
    (back ? "" : line([x + w / 2 - 4, top + 8], [x + w / 2 - 4, bottom - 44], { stroke: "#fff3c6", "stroke-width": 3 })) +
    rect(x - w / 2, top, w, h, { fill: "none", ...ink(back ? 3 : 4) }) +
    g(
      { fill: GOLD, ...ink(back ? 2.5 : 3.5) },
      rect(x - w / 2 - 7, top - 6, w + 14, 16, { rx: 3 }),
      rect(x - w / 2 - 4, bottom - 42, w + 8, 14, { fill: GOLD_D }),
      rect(x - w / 2 - 9, bottom - 28, w + 18, 28, { rx: 3 }),
    )
  );
}

function kalash(x: number, base: number): string {
  return (
    g(
      ink(3),
      path(`M${x - 4},${base - 50}l-26,-24l20,6zM${x + 4},${base - 50}l26,-24l-20,6zM${x - 2},${base - 50}l-10,-32l12,14zM${x + 2},${base - 50}l10,-32l-12,14z`, { fill: LEAF_L }),
      ellipse(x, base - 56, 13, 16, { fill: "#8a5230" }),
      rect(x - 10, base - 48, 20, 10, { fill: GOLD_D }),
      path(`M${x - 10},${base - 38}C${x - 30},${base - 30} ${x - 26},${base} ${x},${base}C${x + 26},${base} ${x + 30},${base - 30} ${x + 10},${base - 38}Z`, { fill: GOLD }),
    ) + path(`M${x + 8},${base - 30}q10,8 6,22`, stroke("#fbe3a0", 3.5, 0.9))
  );
}

function mandap(): string {
  const pleats = [350, 425, 500, 575, 650, 725, 800, 850].map((x) => `M600,428L${x},404`).join("") + [422, 500, 600, 700, 778].map((x) => `M600,428L${x},449`).join("");
  const drapeFolds = Array.from({ length: 11 }, (_, i) => `M${430 + i * 34},449V664`).join("");
  const jasmine = [446, 480, 514, 548, 582, 618, 652, 686, 720, 754].map((x, i) => `M${x},454V${540 + ((i * 53) % 80)}`).join("");
  const strands = [[470, 520], [536, 494], [664, 494], [730, 520]] as const;
  const scallops = `M356,404${"a15,20 0 0 0 30,0".repeat(16)}Z`;
  const diamonds = Array.from({ length: 13 }, (_, i) => `M${372 + i * 38},376l10,10l-10,10l-10,-10z`).join("");
  return (
    // canopy underside: blush cloth pleated to a centre rosette
    poly([[350, 404], [850, 404], [778, 449], [422, 449]], { fill: BLUSH_D }) +
    path(pleats, stroke(BLUSH_L, 3, 0.55)) +
    // the backdrop: deep green drape with jasmine strands
    rect(412, 449, 376, 216, { fill: LEAF }) +
    path(drapeFolds, stroke(LEAF_D, 12, 0.55)) +
    path(drapeFolds, { ...stroke(LEAF_L, 3, 0.5), transform: "translate(10 0)" }) +
    rect(412, 449, 376, 216, { fill: "url(#ht)", opacity: 0.2 }) +
    dots(jasmine, CREAM, 7, 10) +
    pillar(455, 460, 664, 23, true) +
    pillar(745, 460, 664, 23, true) +
    // the plinth, the havan kund (unlit — still being set up) and two kalash
    poly([[394, 664], [806, 664], [890, 706], [310, 706]], { fill: STONE, ...ink(4) }) +
    rect(310, 706, 580, 38, { fill: "#e3c9a0", ...ink(4) }) +
    rect(312, 716, 576, 10, { fill: TERRA }) +
    dots("M322,721H880", GOLD, 5, 16) +
    rect(310, 706, 190, 38, { fill: "url(#hs)", opacity: 0.22 }) +
    g(ink(3.5), rect(528, 744, 144, 14, { fill: STONE }), rect(512, 758, 176, 14, { fill: "#e3c9a0" })) +
    g(
      { fill: INK, opacity: 0.22 },
      poly([[380, 700], [412, 700], [360, 676], [318, 690]]),
      poly([[788, 700], [820, 700], [760, 674], [720, 684]]),
      poly([[548, 688], [652, 688], [600, 672], [500, 676]]),
    ) +
    g(
      ink(3),
      rect(550, 664, 100, 24, { fill: "#a4472d" }),
      rect(562, 650, 76, 16, { fill: TERRA }),
      rect(574, 640, 52, 12, { fill: "#c7684a" }),
    ) +
    path("M552,676h96M564,658h72", stroke("#6f2c19", 2.5, 0.6)) +
    kalash(510, 690) +
    kalash(690, 690) +
    pillar(396, 422, 702, 32, false) +
    pillar(804, 422, 702, 32, false) +
    // hanging strands (ladi) behind the swags, each ending in a rose
    garland(strands.map(([x, y]) => `M${x},424V${y}`).join("") + "M600,424V506", 12, 9) +
    g({ fill: BLUSH, ...ink(3) }, ...strands.map(([x, y]) => circle(x, y + 10, 9)), circle(600, 518, 12)) +
    // fascia with gold diamonds, the blush valance and the marigold swags
    rect(342, 356, 516, 12, { fill: GOLD, ...ink(3.5) }) +
    rect(350, 368, 500, 36, { fill: TERRA, ...ink(4) }) +
    rect(350, 368, 150, 36, { fill: "url(#hs)", opacity: 0.25 }) +
    path(diamonds, { fill: GOLD }) +
    path(scallops, { fill: BLUSH, ...ink(3) }) +
    garland("M396,424Q498,524 600,424M600,424Q702,524 804,424M350,412Q373,454 396,424M804,424Q827,454 850,412") +
    // the floral roofline: a blush onion dome under marigold, gold ribs and finials, corner chhatris
    g(
      ink(3),
      rect(504, 342, 192, 14, { fill: GOLD_D }),
      rect(328, 344, 44, 12, { fill: GOLD_D }),
      rect(828, 344, 44, 12, { fill: GOLD_D }),
    ) +
    path(onion(600, 342, 176, 70) + onion(350, 344, 50, 40) + onion(850, 344, 50, 40), { fill: BLUSH, ...ink(4) }) +
    path("M519,340C504,318 512,296 540,286C552,282 560,280 566,280L562,340Z", { fill: BLUSH_D, opacity: 0.55 }) +
    path("M640,286C670,294 690,312 684,338L668,338C672,316 660,298 640,286Z", { fill: BLUSH_L, opacity: 0.9 }) +
    path("M562,341Q560,300 600,273M638,341Q640,300 600,273M530,341Q526,296 600,273M670,341Q674,296 600,273", stroke(GOLD_D, 2.5)) +
    garland("M512,318Q600,304 688,318", 12, 9) +
    path("M358,312C368,316 374,326 372,340L364,340C366,328 364,320 358,312ZM858,312C868,316 874,326 872,340L864,340C866,328 864,320 858,312Z", { fill: BLUSH_L }) +
    dots("M512,349H690", MARIGOLD_L, 5, 12) +
    path("M600,262V272M350,296V304M850,296V304", stroke(INK, 4)) +
    g({ fill: GOLD, ...ink(2.5) }, circle(600, 267, 6), circle(350, 300, 5), circle(850, 300, 5))
  );
}

function lights(): string {
  const d = "M342,362Q170,440 -10,310M858,362Q1230,440 1610,300M600,272Q470,330 350,304M600,272Q730,330 850,304";
  return path(d, stroke("#4a2c1a", 2.5)) + path(d, stroke("#ffd98a", 16, 0.2)) + dots(d, "#fff2c4", 8, 26)
}

function bananaLeaf(x: number, y: number, angle: number, len: number, w: number): string {
  const blade = `M0,0C${n(len * 0.3)},${n(-w)} ${n(len * 0.8)},${n(-w * 0.8)} ${len},0C${n(len * 0.8)},${n(w * 0.7)} ${n(len * 0.3)},${n(w * 0.9)} 0,0Z`;
  const slits = [0.3, 0.46, 0.62, 0.78].map((t) => `M${n(len * t)},${n(-w * 0.72)}l${n(len * 0.06)},${n(w * 0.5)}`).join("");
  return g(
    { transform: `translate(${x} ${y}) rotate(${angle})` },
    path(blade, { fill: LEAF, ...ink(4) }),
    path(`M0,0C${n(len * 0.3)},${n(-w)} ${n(len * 0.8)},${n(-w * 0.8)} ${len},0Z`, { fill: LEAF_L, opacity: 0.55 }),
    path(slits, stroke(LEAF_D, 3)),
    path(`M0,0L${len},0`, stroke("#cfd9a0", 3.5, 0.7)),
  );
}

function leftFrame(): string {
  const lens = [250, 360, 200, 310] as const;
  const strands = lens.map((len, i) => `M${18 + i * 36},-10V${len}`).join("");
  const ends = lens.map((len, i) => circle(18 + i * 36, len + 12, 9));
  return (
    garland(strands, 15, 11, ["#8a3f12", "#cf7a1f", "#eaa640"]) +
    g({ fill: BLUSH, ...ink(3) }, ...ends) +
    bananaLeaf(70, 830, -118, 430, 70) +
    bananaLeaf(60, 850, -92, 420, 64) +
    bananaLeaf(40, 860, -70, 300, 56)
  );
}

function crate(x: number, y: number, w: number, h: number, flower: string, lit: string): string {
  const heads = `M${x + 12},${y - 2}H${x + w - 10}`;
  return (
    dots(heads, INK, 22, 15) +
    dots(heads, flower, 17, 15) +
    dots(heads, lit, 7, 15, { transform: "translate(3 -3)" }) +
    rect(x, y, w, h, { fill: "#b27b45", ...ink(3.5) }) +
    path(`M${x},${y + h / 3}h${w}M${x},${y + (2 * h) / 3}h${w}`, stroke("#6e4524", 3)) +
    rect(x, y, 12, h, { fill: "#8e5d32", ...ink(3) }) +
    rect(x + w - 12, y, 12, h, { fill: "#d19a5e", ...ink(3) }) +
    rect(x + 12, y, w * 0.4, h, { fill: "url(#hs)", opacity: 0.25 })
  );
}

function stageRight(): string {
  return (
    g({ fill: INK, opacity: 0.3 }, poly([[1120, 780], [1120, 700], [960, 760], [940, 792]]), poly([[1282, 786], [1282, 716], [1150, 770], [1140, 798]])) +
    crate(1120, 704, 150, 80, MARIGOLD, MARIGOLD_L) +
    crate(1140, 632, 128, 72, BLUSH, BLUSH_L) +
    crate(1282, 718, 124, 70, MARIGOLD, MARIGOLD_L) +
    garland("M1150,640C1170,690 1236,690 1262,648M1262,648C1276,690 1300,730 1296,772", 13, 10) +
    // the light pole the strings are tied to
    rect(1556, 290, 12, 520, { fill: "#5a3a24", ...ink(3) }) +
    g({ fill: MARIGOLD, opacity: 0.9 }, ...[[1010, 812, 6, 3], [1050, 830, 5, 3], [1330, 812, 6, 3], [1480, 850, 7, 3], [1210, 864, 6, 3], [1420, 800, 5, 2.5]].map(([x, y, rx, ry]) => ellipse(x ?? 0, y ?? 0, rx ?? 0, ry ?? 0)))
  );
}

function table(): string {
  return (
    rect(-20, 776, 1032, 130, { fill: "url(#wood)", ...ink(4) }) +
    rect(-20, 776, 1032, 9, { fill: "#b57d4c" }) +
    rect(1012, 776, 14, 130, { fill: "#4a2a17", ...ink(3.5) }) +
    path("M40,820Q300,826 560,818M200,866Q500,872 900,862M620,806Q800,810 990,802", stroke("#3e2313", 3, 0.45)) +
    rect(-20, 785, 1032, 121, { fill: "url(#ht)", opacity: 0.16 })
  );
}

function clipboard(): string {
  const rows = [0, 1, 2, 3].map((i) => 832 + i * 26);
  return g(
    { transform: "rotate(-7 420 850)" },
    ellipse(412, 930, 110, 20, { fill: INK, opacity: 0.3 }),
    rect(326, 790, 196, 150, { rx: 10, fill: "#a8743f", ...ink(4) }),
    rect(342, 806, 164, 140, { fill: CREAM, ...ink(3) }),
    rect(342, 806, 164, 140, { fill: "url(#hs)", opacity: 0.08 }),
    g(ink(2.5), ...rows.map((y) => rect(354, y - 8, 14, 14, { fill: "#fffaf0" }))),
    path(rows.map((y, i) => `M380,${y}h${[92, 70, 104, 60][i] ?? 80}`).join(""), stroke("#8d7a66", 4)),
    path(rows.slice(0, 3).map((y) => `M356,${y - 1}l5,6l11,-14`).join(""), stroke(TERRA, 4)),
    rect(392, 780, 64, 24, { rx: 6, fill: GOLD, ...ink(3.5) }),
    rect(410, 772, 28, 12, { rx: 5, fill: GOLD_D, ...ink(3) }),
  );
}

function walkie(): string {
  return g(
    { transform: "rotate(24 606 842)" },
    ellipse(596, 900, 50, 12, { fill: INK, opacity: 0.3 }),
    rect(596, 740, 12, 50, { rx: 6, fill: "#3a3029", ...ink(3) }),
    rect(572, 786, 68, 116, { rx: 12, fill: "#3d5a44", ...ink(4) }),
    rect(572, 786, 24, 116, { rx: 10, fill: LEAF_D, opacity: 0.6 }),
    rect(584, 800, 44, 22, { rx: 3, fill: "#d7c98f", ...ink(2.5) }),
    path("M586,838h40M586,848h40M586,858h40M586,868h40", stroke(LEAF_D, 4)),
    circle(622, 780, 5, { fill: MARIGOLD, ...ink(2) }),
    rect(630, 808, 8, 30, { rx: 3, fill: "#6d8a6a", opacity: 0.7 }),
  );
}

function badge(x: number, y: number, color: string, tail: string): string {
  return (
    g(
      ink(3.5),
      poly([[x - 16, y + 12], [x - 30, y + 66], [x - 18, y + 58], [x - 10, y + 72], [x - 2, y + 16]], { fill: tail }),
      poly([[x + 2, y + 16], [x + 12, y + 72], [x + 20, y + 58], [x + 32, y + 66], [x + 16, y + 12]], { fill: tail }),
      poly(star(x, y, 34, 27, 14), { fill: color }),
      circle(x, y, 20, { fill: CREAM }),
    ) +
    circle(x, y, 13, { fill: "none", stroke: GOLD, "stroke-width": 3 }) +
    path(`M${x - 8},${y - 12}a16,16 0 0 1 20,2`, stroke("#fff", 3, 0.7))
  );
}

export const nuptis: Scene = {
  slug: "nuptis",
  render() {
    const defs = [
      printDefs(INK, "#fff0c8", 29),
      linear("sky", [
        [0, "#9c4b37"],
        [0.24, "#bb6243"],
        [0.48, "#d98b50"],
        [0.7, "#eeb462"],
        [0.88, "#f6d38b"],
        [1, "#f9e1a6"],
      ]),
      linear("lawn", [
        [0, "#98955a"],
        [0.08, "#6e7d46"],
        [0.42, "#4a6436"],
        [1, "#2a4026"],
      ]),
      linear("wood", [
        [0, "#8a5530"],
        [0.4, "#6a3e22"],
        [1, "#4a2a16"],
      ]),
      glow("halo", "#fcd98c", SUN, 620, 0.75),
      el("radialGradient", { id: "sun", cx: 0.42, cy: 0.4, r: 0.62 }, el("stop", { offset: 0, "stop-color": "#fff6d8" }) + el("stop", { offset: 1, "stop-color": "#f9cf7a" })),
      radial("fadeR", [
        [0, "#fff", 1],
        [1, "#fff", 0],
      ]),
      el("mask", { id: "sunFade" }, circle(SUN[0], SUN[1], 360, { fill: "url(#fadeR)" })),
    ];
    const body = g(
      { "stroke-linecap": "round", "stroke-linejoin": "round" },
      sky(),
      distance(),
      stageRight(),
      lights(),
      mandap(),
      leftFrame(),
      table(),
      clipboard(),
      walkie(),
      badge(720, 826, TERRA, TERRA_D),
      badge(808, 858, MARIGOLD, MARIGOLD_D),
      badge(900, 822, LEAF_L, LEAF),
      printFinish(0.22, 0.9),
    );
    return svg(defs.join(""), body);
  },
};

