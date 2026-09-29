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
  polyline,
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
 * Cubicle — "four AI teammates, one debate" (data/projects.ts: four AI teammates — PM, researcher,
 * designer, developer — debate visibly, then produce a PRD, competitor scan, landing copy and build
 * plan in ~90 seconds; a ten-day team buildathon, never deployed). A beige 1990s CRT in a navy-fabric
 * cubicle at golden hour: four coloured panes on its screen, four matching speech bubbles rising from
 * it (lines, bars, a layout, ticks), pinned index cards joined by string, and on the desk the four
 * fresh printouts. The low sun through venetian blinds (stage right) is the one warm light.
 * Palette: orange, navy, mustard, beige, one teal accent.
 */

const INK = "#1f1c2b";
const ORANGE = "#e07a3c";
const STEEL = "#7b95c6";
const MUSTARD = "#e6b64c";
const TEAL = "#3a9b92";
const BEIGE = "#e4d4b0";
const BEIGE_SHADE = "#b9a784";
const CREAM = "#fbf1dc";
const SUN: P = [1530, 520];

const inked = (w = 4) => ({ stroke: INK, "stroke-width": w, "stroke-linejoin": "round", "stroke-linecap": "round" }) as const;
const stroke = (color: string, width: number, opacity?: number) =>
  ({ fill: "none", stroke: color, "stroke-width": width, "stroke-linecap": "round", "stroke-linejoin": "round", opacity }) as const;

/** The four teammates: [pane colour, dark pane ground, bubble centre, bubble size, tail tip, content]. */
const TEAM = [
  { color: ORANGE, ground: "#6d3a22", c: [452, 352], s: [150, 86], tip: [514, 430], mark: "lines" },
  { color: STEEL, ground: "#2b3a5f", c: [590, 308], s: [140, 80], tip: [606, 404], mark: "bars" },
  { color: MUSTARD, ground: "#6b5222", c: [736, 332], s: [150, 84], tip: [690, 420], mark: "layout" },
  { color: TEAL, ground: "#1d4c48", c: [842, 382], s: [112, 74], tip: [790, 446], mark: "ticks" },
] as const;

function bubblePath(i: number): string {
  const t = TEAM[i]!;
  const [cx, cy] = t.c;
  const [w, h] = t.s;
  const x = cx - w / 2;
  const y = cy - h / 2;
  const r = 30;
  const [tx, ty] = t.tip;
  const mid = Math.max(x + r + 16, Math.min(x + w - r - 16, tx));
  return `M${x + r},${y}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${y + r}V${y + h - r}A${r},${r} 0 0 1 ${x + w - r},${y + h}H${mid + 16}L${tx},${ty}L${mid - 16},${y + h}H${x + r}A${r},${r} 0 0 1 ${x},${y + h - r}V${y + r}A${r},${r} 0 0 1 ${x + r},${y}Z`;
}

function office(): string {
  const parts: string[] = [rect(0, 0, 1600, 900, { fill: "url(#wall)" })];
  // the window beyond the partition end (stage only): blinds half open on a low golden sun
  parts.push(rect(1380, 280, 240, 372, { fill: "#caa87a" }));
  parts.push(rect(1398, 298, 220, 338, { fill: "url(#goldSky)" }));
  parts.push(circle(SUN[0], SUN[1], 60, { fill: "#fff2c6" }));
  const slats: string[] = [];
  for (let y = 304; y < 632; y += 24) {
    slats.push(rect(1398, y, 220, 10, { fill: y > 440 && y < 600 ? "#f6dfae" : "#e2c795" }));
    slats.push(line([1398, y + 10], [1618, y + 10], stroke("#a47e52", 2.5)));
  }
  parts.push(g({}, ...slats));
  parts.push(circle(SUN[0], SUN[1], 170, { fill: "url(#sunBurn)" }));
  parts.push(line([1420, 298], [1420, 560], stroke("#8a6a48", 2)) + rect(1414, 560, 12, 22, { rx: 5, fill: "#8a6a48" }));
  parts.push(circle(SUN[0], SUN[1], 900, { fill: "url(#sunGlow)", "clip-path": "url(#cLow)" }));
  parts.push(rect(0, 0, 1600, 262, { fill: "url(#wallWash)" }));

  // the cubicle partition: navy fabric, beige cap and seams
  parts.push(rect(-10, 256, 1352, 414, { fill: "url(#fabric)" }));
  parts.push(rect(-10, 256, 1352, 414, { fill: "url(#hs)", opacity: 0.12 }));
  parts.push(rect(-10, 256, 1352, 414, { fill: "url(#partGlow)" }));
  parts.push(g({ fill: "#c7b58f" }, rect(146, 256, 8, 414), rect(1146, 256, 8, 414)));
  parts.push(rect(-10, 238, 1364, 20, { rx: 6, fill: "#d9c8a3" }) + line([-10, 241], [1352, 241], stroke("#f4e4c0", 3)) + rect(-10, 258, 1352, 8, { fill: "#141a2c", opacity: 0.35 }));
  parts.push(rect(1332, 238, 24, 432, { rx: 6, fill: "#cdb991" }) + rect(1346, 238, 10, 432, { fill: "#f2d9a4", opacity: 0.8 }));
  // the low sun throws the blinds onto the right bay (beyond the play-button zone)
  parts.push(g({ fill: "#ffd48c", opacity: 0.2, "clip-path": "url(#cBay)" }, ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => poly([[1340, 300 + i * 40], [1340, 322 + i * 40], [1150, 356 + i * 40], [1150, 334 + i * 40]]))));
  parts.push(
    g(
      { fill: "#fff0c8", opacity: 0.55 },
      ...([[1190, 430, 2.5], [1236, 470, 2], [1284, 440, 3], [1312, 520, 2], [1262, 560, 2.5], [1360, 470, 2], [1222, 620, 2], [1300, 610, 3], [1376, 580, 2]] as const).map(([x, y, r]) => circle(x, y, r)),
    ),
  );
  // blind light falling across the lower partition, below the play-button zone
  parts.push(g({ fill: "#ffcf86", opacity: 0.16 }, ...[586, 616, 646].map((y) => poly([[1332, y], [1332, y + 12], [760, y + 70], [760, y + 58]]))));
  return parts.join("");
}

function clock(): string {
  const [cx, cy] = [1232, 352] as const;
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const r0 = i % 3 === 0 ? 36 : 40;
    return line([cx + r0 * Math.sin(a), cy - r0 * Math.cos(a)], [cx + 46 * Math.sin(a), cy - 46 * Math.cos(a)]);
  });
  return (
    circle(cx - 8, cy + 6, 58, { fill: "#11162a", opacity: 0.3 }) +
    circle(cx, cy, 58, { fill: "#c4622f" }) +
    circle(cx, cy, 50, { fill: "#f3e7c8" }) +
    g(stroke(INK, 3, 0.7), ...ticks) +
    line([cx, cy], [cx + 16, cy + 22], stroke(INK, 5)) +
    line([cx, cy], [cx - 2, cy + 38], stroke(INK, 3.5)) +
    circle(cx, cy, 4, { fill: INK }) +
    path(`M${cx + 30},${cy - 40}A50,50 0 0 1 ${cx + 50},${cy}`, stroke("#fff6dc", 4, 0.8))
  );
}

function cards(): string {
  const list = [
    [212, 318, -4, "#efe1bf", ORANGE],
    [314, 388, 3, "#ecc978", TEAL],
    [206, 462, 2, "#eeb08a", MUSTARD],
    [310, 536, -3, "#c3cee2", STEEL],
  ] as const;
  const out: string[] = [];
  for (const [x, y, a, fill] of list) {
    out.push(
      g(
        { transform: `rotate(${a} ${x} ${y})` },
        rect(x - 52, y - 28, 104, 66, { rx: 3, fill: "#10152a", opacity: 0.3 }),
        rect(x - 46, y - 34, 104, 66, { rx: 3, fill }),
        g(stroke("#7d6c58", 3, 0.7), line([x - 32, y - 10], [x + 36, y - 10]), line([x - 32, y + 4], [x + 42, y + 4]), line([x - 32, y + 18], [x + 18, y + 18])),
      ),
    );
  }
  out.push(polyline(list.map(([x, y]) => [x + 6, y - 24] as P), stroke("#c24a2a", 3)));
  for (const [x, y, , , pin] of list) out.push(circle(x + 6, y - 24, 8, { fill: pin, ...inked(2.5) }) + circle(x + 3, y - 27, 2.5, { fill: "#fff6de" }));
  return out.join("");
}

function monitor(): string {
  const k = inked(4);
  const out: string[] = [];
  // cast shadow on the fabric — the sun is low on the right
  out.push(path("M392,428H706L700,690H384Z", { fill: "#12172b", opacity: 0.34 }));
  // swivel base
  out.push(ellipse(600, 690, 118, 18, { fill: BEIGE_SHADE, ...k }) + rect(556, 652, 88, 34, { fill: "#cbb994", ...k }));
  // the tube housing going back to the right, lit by the low sun
  out.push(poly([[752, 424], [830, 404], [830, 586], [752, 660]], { fill: "#f0d9a6", ...k }));
  out.push(poly([[446, 420], [592, 404], [830, 404], [752, 424]], { fill: "#f5e3b8", ...k }));
  out.push(g(stroke("#c5a676", 3.5), ...[450, 474, 498, 522, 546].map((y) => line([770, y], [814, y - 12]))));
  // bezel
  out.push(rect(432, 420, 336, 244, { rx: 26, fill: "url(#bezel)", ...k }));
  out.push(rect(432, 632, 336, 30, { fill: "url(#hs)", opacity: 0.18 }));
  out.push(g(stroke("#a8966f", 3), line([458, 640], [520, 640]), line([458, 650], [520, 650])));
  out.push(rect(700, 638, 40, 14, { rx: 4, fill: "#cbb994", ...inked(2.5) }) + circle(684, 645, 5, { fill: "#8fd17a" }));
  // the screen: a 2 × 2 call grid of four teammates, CRT curve, scanlines, glare
  out.push(rect(458, 444, 284, 180, { rx: 22, fill: "#a8966f", ...inked(3) }));
  out.push(rect(466, 452, 268, 164, { rx: 18, fill: "url(#glass)" }));
  TEAM.forEach((t, i) => {
    const x = 478 + (i % 2) * 126;
    const y = 462 + Math.floor(i / 2) * 76;
    const cx = x + 59;
    out.push(rect(x, y, 118, 68, { rx: 7, fill: t.ground }));
    out.push(circle(cx, y + 26, 13, { fill: t.color }) + path(`M${cx - 28},${y + 68}A28,24 0 0 1 ${cx + 28},${y + 68}Z`, { fill: t.color }));
    out.push(rect(x, y, 118, 68, { rx: 7, fill: "none", stroke: t.color, "stroke-width": 2, opacity: 0.6 }));
  });
  out.push(rect(466, 452, 268, 164, { rx: 18, fill: "url(#scan)" }));
  out.push(path("M486,500Q490,466 530,462", stroke("#ffffff", 7, 0.25)));
  out.push(rect(466, 452, 268, 164, { rx: 18, fill: "none", ...inked(3) }));
  return out.join("");
}

function bubbleMark(i: number): string {
  const t = TEAM[i]!;
  const [cx, cy] = t.c;
  const ink = stroke(CREAM, 7);
  if (t.mark === "lines") return g(ink, line([cx - 44, cy - 14], [cx + 44, cy - 14]), line([cx - 44, cy + 2], [cx + 30, cy + 2]), line([cx - 44, cy + 18], [cx + 8, cy + 18]));
  if (t.mark === "bars")
    return g({ fill: CREAM }, rect(cx - 40, cy + 2, 14, 18, { rx: 2 }), rect(cx - 18, cy - 12, 14, 32, { rx: 2 }), rect(cx + 4, cy - 4, 14, 24, { rx: 2 }), rect(cx + 26, cy - 22, 14, 42, { rx: 2 }));
  if (t.mark === "layout")
    return (
      rect(cx - 48, cy - 24, 96, 14, { rx: 4, fill: CREAM }) +
      rect(cx - 48, cy - 2, 38, 28, { rx: 4, ...stroke(CREAM, 5) }) +
      g(stroke(CREAM, 5), line([cx + 2, cy + 2], [cx + 48, cy + 2]), line([cx + 2, cy + 20], [cx + 36, cy + 20]))
    );
  return g(stroke(CREAM, 6), path(`M${cx - 40},${cy - 10}l7,8l13,-16`), line([cx - 8, cy - 8], [cx + 40, cy - 8]), path(`M${cx - 40},${cy + 16}l7,8l13,-16`), line([cx - 8, cy + 18], [cx + 30, cy + 18]));
}

function bubbles(): string {
  const out: string[] = [];
  // drop shadows on the partition (light from the right)
  out.push(g({ fill: "#12172b", opacity: 0.28, transform: "translate(-16 12)" }, ...TEAM.map((_, i) => path(bubblePath(i)))));
  TEAM.forEach((t, i) => {
    const d = bubblePath(i);
    const [cx, cy] = t.c;
    const [w, h] = t.s;
    out.push(path(d, { fill: t.color }));
    out.push(
      g(
        { "clip-path": `url(#cb${i})` },
        rect(cx - w / 2 - 10, cy + h / 2 - 18, w + 20, 80, { fill: INK, opacity: 0.13 }),
        rect(cx - w / 2 - 10, cy - h / 2, 20, h + 80, { fill: INK, opacity: 0.1 }),
        rect(cx - w / 2, cy - h / 2, w, h + 60, { fill: "url(#ht)", opacity: 0.12 }),
      ),
    );
    out.push(path(`M${cx + w / 2 - 44},${cy - h / 2 + 10}Q${cx + w / 2 - 12},${cy - h / 2 + 10} ${cx + w / 2 - 10},${cy - 6}`, stroke("#fff4dc", 5, 0.7)));
    out.push(path(d, { fill: "none", ...inked(4) }));
    out.push(bubbleMark(i));
  });
  return out.join("");
}

function desk(): string {
  const parts: string[] = [];
  parts.push(rect(0, 668, 1600, 166, { fill: "url(#deskTop)" }));
  parts.push(rect(0, 668, 1600, 7, { fill: INK, opacity: 0.35 }));
  // blind stripes of low sun across the desk
  parts.push(
    g(
      { "clip-path": "url(#cDesk)", fill: "#ffdc94", opacity: 0.34 },
      ...[0, 1, 2, 3, 4, 5].map((i) => poly([[1400, 676 + i * 30], [1400, 692 + i * 30], [560, 800 + i * 44], [560, 778 + i * 44]])),
    ),
  );
  parts.push(rect(0, 760, 1600, 74, { fill: "url(#hs)", opacity: 0.12 }));
  parts.push(
    g(
      { fill: "#2a1c14", opacity: 0.3 },
      ellipse(560, 694, 130, 16),
      poly([[420, 780], [760, 780], [740, 796], [400, 796]]),
      ellipse(880, 722, 40, 8),
      ellipse(1036, 792, 50, 8),
      ellipse(1206, 778, 60, 10),
    ),
  );
  parts.push(rect(0, 832, 1600, 26, { fill: "#8a6947" }) + line([0, 832], [1600, 832], stroke(INK, 4)) + line([0, 835], [1600, 835], stroke("#e7c58c", 2.5)));
  parts.push(rect(0, 858, 1600, 42, { fill: "#241b17" }));
  return parts.join("");
}

function keyboard(): string {
  const k = inked(3.5);
  const top: P[] = [[478, 710], [756, 710], [792, 774], [442, 774]];
  return (
    poly([[442, 774], [792, 774], [792, 788], [442, 788]], { fill: "#9d8a66", ...k }) +
    poly(top, { fill: "#b9a57f" }) +
    poly(top, { fill: "url(#keys)" }) +
    poly(top, { fill: "none", ...k }) +
    path("M760,712C800,690 830,700 846,736", stroke(INK, 3)) +
    // mouse on a navy pad
    poly([[808, 728], [918, 728], [934, 784], [798, 784]], { fill: "#34406a", ...inked(3) }) +
    ellipse(860, 752, 24, 17, { fill: BEIGE, ...inked(3) }) +
    line([850, 740], [870, 740], stroke("#a8966f", 2.5)) +
    ellipse(868, 746, 9, 5, { fill: "#fff3d6", opacity: 0.7 })
  );
}

function mug(): string {
  return (
    path("M960,672c26,-2 30,34 2,38", stroke(INK, 12)) +
    path("M960,672c26,-2 30,34 2,38", stroke("#2c7a73", 5)) +
    rect(906, 650, 58, 72, { rx: 9, fill: TEAL, ...inked(4) }) +
    rect(944, 654, 14, 64, { fill: "#8ed0c4", opacity: 0.55 }) +
    rect(906, 650, 26, 72, { rx: 9, fill: "url(#ht)", opacity: 0.22 }) +
    ellipse(935, 652, 29, 7, { fill: "#4a2c1d", ...inked(3) }) +
    path(smooth([[926, 636], [918, 614], [930, 596], [922, 574]]), stroke("#fff2d6", 5, 0.35)) +
    path(smooth([[944, 632], [952, 612], [942, 594]]), stroke("#fff2d6", 4, 0.28))
  );
}

/** One printout lying on the desk, drawn flat and then foreshortened onto the desk plane. */
function page(angle: number, content: string): string {
  return g(
    { transform: `translate(338 872) scale(1 0.6) rotate(${angle})` },
    rect(-66, -196, 132, 176, { rx: 3, fill: CREAM, ...inked(4) }),
    content,
  );
}

function printouts(): string {
  const lines = g(stroke("#9aa3b8", 5), ...[0, 1, 2, 3, 4, 5].map((i) => line([-46, -170 + i * 22], [i % 3 === 2 ? 20 : 46, -170 + i * 22])));
  const chart =
    line([-44, -40], [46, -40], stroke(INK, 3)) +
    rect(-38, -96, 16, 56, { fill: ORANGE }) +
    rect(-16, -126, 16, 86, { fill: STEEL }) +
    rect(6, -80, 16, 40, { fill: MUSTARD }) +
    rect(28, -146, 16, 106, { fill: TEAL }) +
    line([-44, -172], [20, -172], stroke("#9aa3b8", 5));
  const layout =
    rect(-46, -178, 92, 18, { rx: 3, fill: "#c9d3e3" }) +
    rect(-46, -148, 44, 44, stroke("#9aa3b8", 4)) +
    path("M-46,-148l44,44m0,-44l-44,44", stroke("#9aa3b8", 3)) +
    g(stroke("#9aa3b8", 5), line([6, -144], [46, -144]), line([6, -126], [40, -126]), line([-46, -84], [46, -84]), line([-46, -64], [26, -64])) +
    rect(-20, -48, 40, 14, { rx: 7, fill: ORANGE });
  const checklist = [0, 1, 2, 3]
    .map((i) => {
      const y = -170 + i * 36;
      return rect(-46, y - 10, 18, 18, stroke(INK, 3)) + (i < 3 ? path(`M-43,${y}l6,7l12,-14`, stroke(TEAL, 4)) : "") + line([-16, y], [46, y], stroke("#9aa3b8", 5));
    })
    .join("");
  return page(-52, lines) + page(-22, chart) + page(8, layout) + page(38, checklist);
}

function lamp(): string {
  const k = inked(4);
  return (
    ellipse(1236, 772, 52, 12, { fill: "#2b3354", ...k }) +
    polyline([[1236, 764], [1184, 660], [1250, 604]], stroke(INK, 18)) +
    polyline([[1236, 764], [1184, 660], [1250, 604]], stroke("#34406a", 10)) +
    circle(1184, 660, 8, { fill: MUSTARD, ...inked(3) }) +
    poly([[1238, 590], [1266, 612], [1236, 676], [1180, 640]], { fill: "#34406a", ...k }) +
    path("M1266,612L1236,676", stroke("#ffd48c", 5, 0.9)) +
    ellipse(1208, 658, 34, 12, { transform: "rotate(-58 1208 658)", fill: "#1b2238", ...inked(3) })
  );
}

function floppies(): string {
  const disk = (x: number, y: number, a: number, fill: string) =>
    g(
      { transform: `rotate(${a} ${x} ${y})` },
      rect(x - 34, y - 12, 68, 22, { rx: 3, fill, ...inked(3) }),
      rect(x - 14, y - 12, 28, 8, { fill: "#b9bfc6", ...inked(2) }),
      rect(x - 22, y + 1, 44, 7, { fill: CREAM }),
    );
  return disk(1062, 784, -4, "#34406a") + disk(1058, 766, 3, ORANGE) + disk(1066, 750, -2, MUSTARD);
}

function plant(): string {
  const k = inked(4);
  const blade = (x: number, tipX: number, tipY: number, w: number, fill: string) =>
    path(`M${x - w},660C${x - w},${tipY + 160} ${tipX - 6},${tipY + 60} ${tipX},${tipY}C${tipX + 8},${tipY + 70} ${x + w},${tipY + 170} ${x + w},660Z`, { fill, ...inked(3.5) }) +
    path(`M${x + w * 0.4},650C${x + w * 0.4},${tipY + 170} ${tipX + 4},${tipY + 80} ${tipX + 2},${tipY + 20}`, stroke("#d8b34c", 3, 0.8));
  return (
    blade(70, 40, 400, 22, "#3f5b36") +
    blade(150, 196, 380, 24, "#58703a") +
    blade(112, 104, 330, 26, "#6a7f3c") +
    blade(64, 20, 470, 18, "#58703a") +
    blade(170, 238, 470, 18, "#3f5b36") +
    poly([[34, 648], [206, 648], [188, 790], [52, 790]], { fill: "#b9582c", ...k }) +
    poly([[150, 650], [206, 648], [188, 790], [156, 790]], { fill: "#e0874a", opacity: 0.55 }) +
    rect(24, 632, 192, 26, { rx: 5, fill: "#c9673a", ...k }) +
    rect(34, 660, 172, 130, { fill: "url(#ht)", opacity: 0.16 })
  );
}

function chair(): string {
  return (
    path("M1352,900V772C1352,720 1392,690 1446,690H1640V900Z", { fill: "#262d45", ...inked(4) }) +
    path("M1352,900V772C1352,720 1392,690 1446,690H1640V900Z", { fill: "url(#ht)", opacity: 0.25 }) +
    path("M1362,770C1364,726 1396,700 1446,700H1600", stroke("#ffcf86", 6, 0.75))
  );
}

export const cubicle: Scene = {
  slug: "cubicle",
  render() {
    const defs = [
      printDefs(INK, "#ffdca0", 23),
      linear("wall", [
        [0, "#40291f"],
        [0.3, "#5b3a2a"],
        [1, "#7a4d33"],
      ]),
      linear("goldSky", [
        [0, "#f4c178"],
        [0.55, "#fad99a"],
        [1, "#f0a25a"],
      ]),
      glow("sunGlow", "#ffc56e", SUN, 900, 0.5),
      linear("wallWash", [
        [0.3, "#ffb865", 0],
        [1, "#ffb865", 0.22],
      ], 0, 0, 1, 0.4),
      linear("fabric", [
        [0, "#34406a"],
        [1, "#2a3354"],
      ]),
      linear("partGlow", [
        [0.35, "#ffd58a", 0],
        [1, "#ffd58a", 0.2],
      ], 0, 0, 1, 0),
      linear("bezel", [
        [0, "#d4c29c"],
        [0.7, "#e2d1aa"],
        [1, "#f3e2b9"],
      ], 0, 0, 1, 0),
      radial("glass", [
        [0, "#243056"],
        [1, "#141a33"],
      ], 0.45, 0.4, 0.7),
      linear("deskTop", [
        [0, "#cfae7c"],
        [0.5, "#b08e62"],
        [1, "#8d6c48"],
      ]),
      el("pattern", { id: "scan", width: 8, height: 5, patternUnits: "userSpaceOnUse" }, rect(0, 0, 8, 1.6, { fill: "#0a0e1c", opacity: 0.45 })),
      el("pattern", { id: "keys", width: 21, height: 16, patternUnits: "userSpaceOnUse", x: 478, y: 712 }, rect(2, 2, 17, 12, { rx: 2, fill: "#efe2c3" })),
      el("clipPath", { id: "cDesk" }, rect(0, 668, 1600, 164)),
      el("clipPath", { id: "cLow" }, rect(0, 262, 1600, 638)),
      el("clipPath", { id: "cBay" }, rect(1154, 266, 178, 402)),
      glow("sunBurn", "#fff4d0", SUN, 170, 0.95),
      ...TEAM.map((_, i) => el("clipPath", { id: `cb${i}` }, path(bubblePath(i)))),
    ];
    const body = [
      office(),
      clock(),
      cards(),
      desk(),
      monitor(),
      bubbles(),
      printouts(),
      keyboard(),
      mug(),
      floppies(),
      lamp(),
      plant(),
      chair(),
      printFinish(0.22, 0.9),
    ].join("");
    return svg(defs.join(""), body);
  },
};
