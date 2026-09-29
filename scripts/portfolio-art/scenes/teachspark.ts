import {
  circle,
  el,
  ellipse,
  g,
  glow,
  line,
  linear,
  linearUser,
  path,
  poly,
  polyline,
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
 * TeachSpark — "AI worksheets for teachers" (data/projects.ts: a WhatsApp bot that helps a time-poor
 * Indian K–12 teacher make a differentiated worksheet in about two minutes). A friendly cream helper
 * robot on the teacher's desk holds out a fan of three worksheets (three header colours — three
 * levels), a plain green chat bubble with a page inside floats beside it, a navy chalkboard of chalk
 * doodles behind, a desk lamp as the one warm light, and a dusk window, globe and phone on the stage.
 * Palette: navy, chalk teal-navy, amber, cream, muted chat-green, rust.
 */

const INK = "#121a2d";
const CREAM = "#efe3c7";
const SHADE = "#c7b999";
const PAPER = "#fbf4e3";
const RUST = "#b64927";
const AMBER = "#f2a33a";
const GREEN = "#5a9e72";
const CHALK = "#dfe9e2";
const RIM = "#9fb3c6"; // cool dusk rim light from the window
const LAMP: P = [244, 604]; // the bulb — the scene's one warm light
const HINGE: P = [190, 544]; // where the lamp's shade meets its arm
const PIVOT: P = [458, 654]; // the robot's hand, where the worksheet fan pivots

const inked = (w = 4) => ({ stroke: INK, "stroke-width": w, "stroke-linejoin": "round", "stroke-linecap": "round" }) as const;
const stroke = (color: string, width: number, opacity?: number) =>
  ({ fill: "none", stroke: color, "stroke-width": width, "stroke-linecap": "round", "stroke-linejoin": "round", opacity }) as const;

/** An ink-outlined tube (robot arms, the lamp arm): a wide ink stroke under a coloured one. */
const tube = (points: readonly P[], width: number, color: string, ribs?: string) =>
  polyline(points, stroke(INK, width + 8)) +
  polyline(points, stroke(color, width)) +
  (ribs ? polyline(points, { ...stroke(ribs, width - 6), "stroke-linecap": "butt", "stroke-dasharray": "3 9" }) : "");

function room(): string {
  const parts: string[] = [rect(0, 0, 1600, 900, { fill: "url(#wall)" })];
  // the dusk window (stage only): deep blue above, a thin apricot band behind the rooftops
  parts.push(rect(1190, 114, 310, 480, { fill: "#ad9f83" }));
  parts.push(rect(1208, 132, 274, 444, { fill: "url(#dusk)" }));
  parts.push(g({ fill: "#f3e6c4", opacity: 0.7 }, circle(1252, 176, 2.5), circle(1306, 226, 2), circle(1448, 164, 3), circle(1392, 250, 2), circle(1236, 300, 2)));
  parts.push(path("M1422,286A17,17 0 1,0 1422,320A13,17 0 1,1 1422,286Z", { fill: "#eadcb8", opacity: 0.85 }));
  parts.push(path("M1208,576V528H1236L1262,506L1288,528H1310V512H1322V494L1330,482L1338,494V512H1352V536H1482V576Z", { fill: "#2a3350" }));
  parts.push(g({ fill: "#2a3350" }, circle(1400, 530, 22), circle(1432, 522, 27), circle(1462, 534, 18)));
  parts.push(g({ fill: "#ad9f83" }, rect(1339, 132, 12, 444), rect(1208, 340, 274, 12)));
  parts.push(g(stroke("#ffffff", 7, 0.07), line([1236, 330], [1320, 170]), line([1370, 560], [1462, 380])));
  parts.push(polyline([[1208, 576], [1208, 132], [1482, 132]], stroke("#1b2335", 8, 0.35)));
  parts.push(rect(1176, 588, 338, 16, { fill: "#d6c9ad" }) + rect(1182, 604, 326, 10, { fill: "#111a2a", opacity: 0.35 }));

  // wainscot and chair rail below the board (seen beside it on the stage)
  parts.push(rect(0, 644, 1600, 100, { fill: "#222d40" }) + rect(0, 636, 1600, 10, { fill: "#5a3d2b" }) + rect(0, 646, 1600, 30, { fill: "url(#hs)", opacity: 0.18 }));
  // the chalkboard in its wooden frame, with a chalk tray
  parts.push(rect(116, 70, 818, 544, { rx: 6, fill: "#6d4630" }));
  parts.push(line([120, 73], [930, 73], stroke("#9a6a45", 4)));
  parts.push(rect(134, 88, 782, 508, { fill: "url(#board)" }));
  // erased chalk haze
  parts.push(path(smooth([[190, 520], [360, 490], [560, 512], [760, 478], [900, 500]]), stroke("#9db3bb", 54, 0.035)));
  parts.push(rect(122, 596, 806, 16, { fill: "#7c5337" }) + line([124, 598], [926, 598], stroke("#a4744c", 3)));
  parts.push(rect(812, 586, 38, 9, { rx: 3, fill: "#efe8d8" }) + rect(862, 588, 26, 8, { rx: 3, fill: "#e8c9a0" }));
  parts.push(rect(742, 578, 62, 18, { rx: 3, fill: "#8a6a4b" }) + rect(742, 590, 62, 6, { fill: "#d9cdb8" }));
  return parts.join("");
}

function doodles(): string {
  const c = stroke(CHALK, 4.5, 0.55);
  const faint = stroke(CHALK, 3.5, 0.2);
  return g(
    {},
    // top band: only a few faint little stars
    poly(star(262, 150, 11, 5), faint),
    poly(star(862, 128, 9, 4), faint),
    poly(star(690, 232, 8, 3.5), faint),
    // left: a big star, a squiggle, a circle, a little sun
    poly(star(204, 336, 42, 18), c),
    path(smooth([[256, 298], [274, 284], [292, 300], [310, 288], [328, 298], [344, 291], [360, 296], [374, 294]]), c),
    circle(356, 386, 20, c),
    circle(222, 450, 14, c),
    ...Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      return line([222 + 22 * Math.cos(a), 450 + 22 * Math.sin(a)], [222 + 32 * Math.cos(a), 450 + 32 * Math.sin(a)], c);
    }),
    // right, under the bubble: a triangle and a small star
    poly([[836, 560], [872, 496], [908, 560]], c),
    poly(star(880, 450, 14, 6), c),
  );
}

function lampLight(): string {
  return circle(LAMP[0], LAMP[1], 640, { fill: "url(#lampGlow)" }) + rect(0, 60, 1000, 700, { fill: "url(#hl)", mask: "url(#nearLamp)", opacity: 0.28 });
}

function robot(): string {
  const k = inked(4);
  const out: string[] = [];
  // soft cast shadow on the board — the lamp is on the left, so it falls right
  out.push(g({ fill: "#0a121c", opacity: 0.33 }, rect(532, 334, 244, 172, { rx: 46 }), rect(544, 520, 220, 220, { rx: 42 })));
  // legs + feet
  out.push(rect(542, 728, 38, 36, { fill: "#b5aa93", ...k }) + rect(620, 728, 38, 36, { fill: "#a89d86", ...k }));
  out.push(rect(524, 756, 70, 22, { rx: 10, fill: "#d8cbad", ...k }) + rect(606, 756, 70, 22, { rx: 10, fill: SHADE, ...k }));
  // body
  out.push(rect(490, 504, 220, 234, { rx: 42, fill: CREAM }));
  out.push(
    g(
      { "clip-path": "url(#cBody)" },
      rect(668, 504, 50, 234, { fill: SHADE }),
      rect(640, 504, 80, 234, { fill: "url(#hs)", opacity: 0.22 }),
      rect(699, 504, 12, 234, { fill: RIM, opacity: 0.85 }),
      rect(490, 504, 20, 234, { fill: "#ffe6b0" }),
      rect(490, 688, 220, 60, { fill: "#cdbf9f", opacity: 0.85 }),
      rect(490, 504, 220, 234, { fill: "url(#warmSide)" }),
    ),
  );
  out.push(rect(490, 504, 220, 234, { rx: 42, fill: "none", ...k }));
  out.push(rect(562, 528, 122, 64, { rx: 14, fill: "#d8cbad", ...inked(3) }));
  out.push(g(inked(2.5), circle(588, 560, 9, { fill: GREEN }), circle(614, 560, 9, { fill: AMBER }), circle(640, 560, 9, { fill: RUST })));
  out.push(g(stroke("#a89d86", 4), line([586, 612], [664, 612]), line([586, 628], [664, 628]), line([586, 644], [664, 644])));
  // neck
  out.push(rect(572, 486, 56, 24, { rx: 6, fill: "#b9ae98", ...k }));
  // ears, then head
  out.push(rect(458, 378, 24, 52, { rx: 10, fill: RUST, ...k }) + rect(718, 378, 24, 52, { rx: 10, fill: "#8f3a20", ...k }));
  out.push(rect(478, 318, 244, 172, { rx: 46, fill: CREAM }));
  out.push(
    g(
      { "clip-path": "url(#cHead)" },
      rect(684, 318, 50, 172, { fill: SHADE }),
      rect(654, 318, 80, 172, { fill: "url(#hs)", opacity: 0.22 }),
      rect(711, 318, 12, 172, { fill: RIM, opacity: 0.85 }),
      rect(478, 318, 20, 172, { fill: "#ffe6b0" }),
      rect(478, 452, 244, 40, { fill: "#d6c8aa", opacity: 0.8 }),
      rect(478, 318, 244, 172, { fill: "url(#warmSide)" }),
    ),
  );
  out.push(rect(478, 318, 244, 172, { rx: 46, fill: "none", ...k }));
  // the screen face: warm smile, glowing eyes
  out.push(rect(504, 342, 192, 122, { rx: 30, fill: "#d6c8aa", ...inked(3) }));
  out.push(rect(516, 354, 168, 98, { rx: 24, fill: "url(#screen)", ...inked(3) }));
  out.push(g({ fill: "#ffd98c" }, ellipse(566, 394, 11, 16), ellipse(634, 394, 11, 16)));
  out.push(path("M568,422Q600,448 632,422", stroke("#ffd98c", 7)));
  out.push(g({ fill: "#f08d5c", opacity: 0.5 }, ellipse(544, 424, 10, 6), ellipse(656, 424, 10, 6)));
  out.push(rect(516, 354, 168, 98, { rx: 24, fill: "url(#scan)" }));
  out.push(path("M530,380Q532,366 548,362", stroke("#ffffff", 5, 0.3)));
  // antenna with a warm tip
  out.push(line([600, 318], [600, 298], stroke(INK, 12)) + line([600, 318], [600, 298], stroke("#b7ad98", 5)));
  out.push(circle(600, 288, 34, { fill: "url(#tipGlow)" }) + circle(600, 288, 12, { fill: AMBER, ...k }) + circle(596, 284, 4, { fill: "#fff1c9" }));
  // raised arm (a wave), then shoulders
  out.push(tube([[706, 562], [770, 540], [800, 486]], 24, "#d8cbad", "#b9ad94"));
  out.push(circle(804, 470, 23, { fill: CREAM, ...k }) + ellipse(782, 478, 8, 11, { fill: CREAM, ...inked(3) }));
  out.push(g(stroke(INK, 2.5), line([796, 452], [794, 462]), line([808, 450], [808, 461]), line([820, 456], [817, 465])));
  out.push(tube([[494, 562], [456, 604], [446, 642]], 24, "#d8cbad", "#b9ad94"));
  out.push(circle(494, 558, 22, { fill: "#d8cbad", ...k }) + circle(706, 558, 22, { fill: SHADE, ...k }));
  return out.join("");
}

/** One worksheet of the fan: a header bar in its level colour, ruled lines and tick boxes. */
function sheet(angle: number, fill: string, header: string, boxes: number): string {
  const [px, py] = PIVOT;
  const x = px - 72;
  const y = py - 190;
  const lines = [0, 1, 2, 3].map((i) => line([x + 18, y + 48 + i * 20], [x + (i === 3 ? 90 : 126), y + 48 + i * 20]));
  const ticks = Array.from({ length: boxes }, (_, i) => {
    const by = y + 132 + i * 22;
    return (
      rect(x + 18, by, 14, 14, { fill: "none", stroke: INK, "stroke-width": 2.2 }) +
      path(`M${x + 20},${by + 7}l4,5l9,-12`, stroke(GREEN, 3)) +
      line([x + 42, by + 7], [x + 110, by + 7], stroke("#9aabbf", 3))
    );
  });
  return g(
    { transform: `rotate(${angle} ${px} ${py})` },
    rect(x, y, 144, 190, { rx: 4, fill, ...inked(3.5) }),
    rect(x + 18, y + 18, 72, 13, { rx: 4, fill: header }),
    g(stroke("#9aabbf", 3), ...lines),
    ...ticks,
  );
}

function worksheets(): string {
  const [px, py] = PIVOT;
  return (
    sheet(-30, "#e6dcc4", GREEN, 1) +
    sheet(-16, "#f1e8d3", AMBER, 2) +
    sheet(-2, PAPER, RUST, 3) +
    poly(star(px - 136, py - 196, 13, 3.5, 4), { fill: "#ffe3a3" }) +
    poly(star(px - 24, py - 236, 9, 2.5, 4), { fill: "#ffe3a3", opacity: 0.85 }) +
    // the hand that holds them
    circle(px, py - 2, 22, { fill: CREAM, ...inked(4) }) +
    ellipse(px + 18, py - 14, 9, 12, { fill: CREAM, ...inked(3) })
  );
}

const BUBBLE = { x: 730, y: 278, w: 170, h: 118, r: 42 } as const;

/** The chat bubble's outline: a rounded box with a short tail towards the robot's head. */
function bubblePath(): string {
  const { x, y, w, h, r } = BUBBLE;
  return `M${x + r},${y}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${y + r}V${y + h - r}A${r},${r} 0 0 1 ${x + w - r},${y + h}H${x + 78}L${x + 8},${y + h + 44}L${x + 34},${y + h - 8}A${r},${r} 0 0 1 ${x},${y + h - r}V${y + r}A${r},${r} 0 0 1 ${x + r},${y}Z`;
}

function bubble(): string {
  const { x, y, w, h } = BUBBLE;
  const d = bubblePath();
  const px = x + w / 2 - 31;
  const py = y + (h - 80) / 2;
  return (
    path(d, { fill: "#3f7f58" }) +
    g({ "clip-path": "url(#cBubble)" }, path(d, { fill: GREEN, transform: "translate(-9 -9)" }), rect(x + w - 60, y, 70, h + 50, { fill: "url(#ht)", opacity: 0.18 })) +
    path(`M${x + 22},${y + 58}Q${x + 26},${y + 20} ${x + 64},${y + 16}`, stroke("#a6d6b2", 6, 0.8)) +
    path(d, { fill: "none", ...inked(4) }) +
    // the page inside (centred): folded corner, three lines, one ticked box
    poly([[px, py], [px + 44, py], [px + 62, py + 18], [px + 62, py + 80], [px, py + 80]], { fill: PAPER, ...inked(3) }) +
    poly([[px + 44, py], [px + 44, py + 18], [px + 62, py + 18]], { fill: "#d9cdb3", ...inked(2.5) }) +
    g(stroke("#8fa2b6", 4), line([px + 10, py + 28], [px + 48, py + 28]), line([px + 10, py + 42], [px + 52, py + 42]), line([px + 10, py + 56], [px + 40, py + 56])) +
    path(`M${px + 12},${py + 68}l5,6l10,-12`, stroke(GREEN, 4)) +
    // a small spark beside it
    poly(star(x - 14, y + 4, 16, 4.5, 4), { fill: AMBER, ...inked(2.5) })
  );
}

function lamp(): string {
  const k = inked(4);
  const [bx, by] = LAMP;
  const [hx, hy] = HINGE;
  const len = Math.hypot(bx - hx, by - hy);
  const ax = (bx - hx) / len;
  const ay = (by - hy) / len;
  const at = (along: number, across: number): P => [hx + ax * along - ay * across, hy + ay * along + ax * across];
  const mouth = len + 6;
  const top = at(mouth, -60);
  const bottom = at(mouth, 60);
  const [mx, my] = at(mouth, 0);
  const deg = (Math.atan2(ay, ax) * 180) / Math.PI;
  return (
    // the beam falling across the desk and the robot
    poly([top, bottom, [420, 800], [800, 800]], { fill: "url(#beam)" }) +
    ellipse(226, 782, 58, 14, { fill: "#2f3547", ...k }) +
    tube([[226, 772], [158, 666], HINGE], 12, "#3b4255") +
    circle(158, 666, 9, { fill: AMBER, ...inked(3) }) +
    // the shade: a rust cone opening towards the lower right, the lit bulb inside
    poly([at(12, -20), top, bottom, at(12, 20)], { fill: RUST, ...k }) +
    poly([at(12, -20), top, at(mouth - 10, -38), at(14, -10)], { fill: "#d9744a", opacity: 0.7 }) +
    ellipse(mx, my, 18, 60, { transform: `rotate(${deg} ${mx} ${my})`, fill: "#6e2716", ...k }) +
    circle(bx + 2, by + 2, 20, { fill: "#fff3cf" }) +
    circle(bx, by, 120, { fill: "url(#bulbGlow)" }) +
    circle(hx, hy, 10, { fill: "#3b4255", ...inked(3) })
  );
}

function desk(): string {
  const parts: string[] = [];
  parts.push(rect(0, 742, 1600, 66, { fill: "url(#deskTop)" }));
  parts.push(g(stroke("#5a3820", 2.5, 0.35), path(smooth([[0, 760], [300, 756], [700, 762], [1100, 757], [1600, 761]])), path(smooth([[0, 786], [420, 781], [900, 788], [1300, 783], [1600, 787]]))));
  parts.push(ellipse(470, 778, 420, 34, { fill: "#ffcf86", opacity: 0.28 }));
  parts.push(rect(0, 742, 1600, 5, { fill: INK, opacity: 0.4 }));
  parts.push(ellipse(652, 778, 104, 9, { fill: INK, opacity: 0.35 }));
  parts.push(rect(0, 806, 1600, 94, { fill: "url(#deskFront)" }));
  parts.push(rect(0, 802, 1600, 8, { fill: "#c08a55" }) + line([0, 810], [1600, 810], stroke(INK, 4)));
  parts.push(rect(470, 832, 330, 90, { fill: "none", stroke: "#24160e", "stroke-width": 3, opacity: 0.7 }));
  parts.push(ellipse(635, 860, 26, 7, { fill: "#c9973e", ...inked(2.5) }));
  parts.push(rect(0, 810, 1600, 90, { fill: "url(#ht)", opacity: 0.2 }));
  return parts.join("");
}

function books(x: number, list: readonly (readonly [number, number, number, string])[]): string {
  // [x offset, width, height, colour], stacked upward from the desk
  let y = 792;
  return list
    .map(([dx, w, h, color]) => {
      y -= h;
      return (
        rect(x + dx, y, w, h, { rx: 5, fill: color, ...inked(3.5) }) +
        line([x + dx + 22, y + 4], [x + dx + 22, y + h - 4], stroke("#f0d9a8", 3, 0.8)) +
        line([x + dx + w - 22, y + 4], [x + dx + w - 22, y + h - 4], stroke("#f0d9a8", 3, 0.8)) +
        rect(x + dx + w * 0.55, y, w * 0.45, h, { fill: "url(#ht)", opacity: 0.18 })
      );
    })
    .join("");
}

function deskProps(): string {
  const k = inked(4);
  const parts: string[] = [];
  // a stack of books and the teacher's apple (left, framing)
  parts.push(books(-8, [[0, 200, 36, "#9c3b25"], [18, 168, 32, "#2e6468"], [6, 184, 30, "#c9973e"], [24, 150, 28, "#e3d3b0"]]));
  parts.push(circle(104, 640, 25, { fill: "#a8432c", ...k }) + path("M104,616q2,-12 10,-16", stroke(INK, 4)) + path("M110,606q16,-10 26,2q-14,8 -26,-2Z", { fill: GREEN, ...inked(2.5) }) + path("M90,630q2,-8 10,-10", stroke("#f3b28e", 4, 0.8)));
  // the phone on a little stand, a chat bubble on its screen (stage)
  parts.push(poly([[1064, 794], [1156, 794], [1146, 770], [1074, 770]], { fill: "#3b4255", ...k }));
  parts.push(rect(1068, 636, 84, 152, { rx: 14, fill: "#2c3348", ...k }));
  parts.push(rect(1076, 648, 68, 126, { rx: 8, fill: "#e6ece2" }));
  parts.push(rect(1092, 662, 44, 18, { rx: 7, fill: "#c9d1cb" }));
  parts.push(path("M1082,700h48a8,8 0 0 1 8,8v12a8,8 0 0 1 -8,8h-38l-10,8v-8a8,8 0 0 1 0,-16Z", { fill: GREEN }));
  parts.push(rect(1090, 704, 12, 16, { fill: PAPER }) + rect(1092, 742, 40, 16, { rx: 7, fill: "#c9d1cb" }));
  // the globe on its stand (stage), lit from the lamp side
  parts.push(ellipse(1330, 790, 62, 13, { fill: "#2f3547", ...k }) + rect(1321, 742, 18, 46, { fill: "#3b4255", ...k }));
  parts.push(circle(1330, 646, 92, { fill: "#4a7d8c" }));
  parts.push(
    g(
      { "clip-path": "url(#cGlobe)" },
      path(smooth([[1262, 600], [1300, 582], [1330, 604], [1318, 640], [1286, 662], [1262, 640]], true), { fill: "#8fa56c" }),
      path(smooth([[1340, 660], [1380, 646], [1402, 680], [1376, 716], [1346, 704]], true), { fill: "#c9a45e" }),
      path(smooth([[1300, 700], [1322, 690], [1330, 716], [1308, 728]], true), { fill: "#8fa56c" }),
      g(stroke("#d8e6e2", 2.5, 0.3), ellipse(1330, 646, 92, 30), ellipse(1330, 646, 40, 92)),
      circle(1352, 660, 92, { fill: "none", stroke: "#1d3342", "stroke-width": 44, opacity: 0.55 }),
      circle(1360, 668, 92, { fill: "url(#ht)", opacity: 0.25 }),
      ellipse(1296, 606, 30, 20, { fill: "#ffffff", opacity: 0.18 }),
    ),
  );
  parts.push(path("M1392,578A92,92 0 0 1 1398,708", stroke("#a9bfd4", 6, 0.8)));
  parts.push(circle(1330, 646, 92, { fill: "none", ...k }));
  parts.push(path("M1270,560A112,112 0 0 1 1398,744", stroke(INK, 14)) + path("M1270,560A112,112 0 0 1 1398,744", stroke("#c9973e", 7)));
  // a pencil lying on the desk (stage)
  parts.push(
    g(
      { transform: "rotate(-4 900 792)" },
      rect(820, 784, 150, 16, { fill: "#d9a441", ...inked(3) }),
      line([822, 792], [968, 792], stroke("#f0c46a", 3)),
      poly([[970, 784], [1000, 792], [970, 800]], { fill: "#eccb95", ...inked(3) }),
      poly([[990, 789], [1000, 792], [990, 795]], { fill: INK }),
      rect(800, 784, 22, 16, { rx: 4, fill: "#c86a55", ...inked(3) }),
    ),
  );
  // more books (stage, cropped by the frame)
  parts.push(books(1452, [[0, 170, 34, "#2e6468"], [14, 150, 30, "#e3d3b0"], [4, 162, 30, RUST]]));
  return parts.join("");
}

export const teachspark: Scene = {
  slug: "teachspark",
  render() {
    const [bx, by] = LAMP;
    const defs = [
      printDefs(INK, "#ffe2ad", 7),
      linear("wall", [
        [0, "#2b394f"],
        [0.55, "#34435b"],
        [1, "#29344a"],
      ]),
      linear("board", [
        [0, "#172737"],
        [0.5, "#1c3243"],
        [1, "#1a2c3b"],
      ]),
      linear("dusk", [
        [0, "#1f2a4a"],
        [0.45, "#33406a"],
        [0.7, "#665f80"],
        [0.86, "#bb8a6f"],
        [1, "#e2b27f"],
      ]),
      radial("screen", [
        [0, "#2f6a6c"],
        [1, "#122834"],
      ], 0.5, 0.45, 0.62),
      glow("lampGlow", "#ffbf6a", LAMP, 640, 0.62),
      glow("bulbGlow", "#fff0c4", LAMP, 120, 0.9),
      glow("tipGlow", "#ffc46e", [600, 288], 34, 0.8),
      glow("nearLampG", "#ffffff", LAMP, 420, 1),
      el("mask", { id: "nearLamp" }, rect(0, 0, 1600, 900, { fill: "url(#nearLampG)" })),
      linearUser("beam", [
        [0, "#ffe2a6", 0.42],
        [1, "#ffe2a6", 0],
      ], [bx, by], [700, 800]),
      linear("warmSide", [
        [0, "#ffb65c", 0.42],
        [0.55, "#ffb65c", 0],
      ], 0, 0, 1, 0),
      glow("warmCast", "#ffb45a", LAMP, 380, 0.4),
      linear("deskTop", [
        [0, "#8e5f38"],
        [1, "#6d4529"],
      ]),
      linear("deskFront", [
        [0, "#4b2f1f"],
        [1, "#2b1b12"],
      ]),
      el("pattern", { id: "scan", width: 8, height: 6, patternUnits: "userSpaceOnUse" }, rect(0, 0, 8, 2, { fill: "#0b1a22", opacity: 0.45 })),
      el("clipPath", { id: "cHead" }, rect(478, 318, 244, 172, { rx: 46 })),
      el("clipPath", { id: "cBody" }, rect(490, 504, 220, 234, { rx: 42 })),
      el("clipPath", { id: "cBubble" }, path(bubblePath())),
      el("clipPath", { id: "cGlobe" }, circle(1330, 646, 92)),
    ];
    const body = [
      room(),
      doodles(),
      lampLight(),
      desk(),
      robot(),
      worksheets(),
      circle(bx, by, 380, { fill: "url(#warmCast)" }),
      bubble(),
      lamp(),
      deskProps(),
      printFinish(0.22, 0.9),
    ].join("");
    return svg(defs.join(""), body);
  },
};
