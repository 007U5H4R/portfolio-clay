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
 * Pratyasa — a static record of granted patent IN 429867, a point-of-care sepsis-biomarker
 * biosensor (data/projects.ts; Tushar is one of five co-inventors: analyser electronics and firmware,
 * the Android app, sensor preparation, validation in blood and food samples). A lab bench at blue
 * hour under one brass lamp: the handheld analyser with a sensor strip and a single drop of sample,
 * its curve on the screen, the phone app plotting the readings, glassware (a flask; tubes of blood-red
 * and food-gold samples), a microscope silhouetted against the window, and the patent certificate
 * rolled and sealed in the foreground. A research prototype — no clinic, no patient, no AI.
 * Palette: steel blue, lab teal, cream, brass, a touch of rust red.
 */

const INK = "#17222f";
const CREAM = "#efe6cf";
const STEEL = "#4d6985";
const TEAL = "#3f8a86";
const BRASS = "#c9a15a";
const BRASS_L = "#efd28f";
const BRASS_D = "#8a6832";
const RUST = "#a8432c";
const LAMP = "#f7d58f";
const RIM = "#a9c6d8";

const Y_BENCH = 556;

const keyline = (width = 4) => ({ stroke: INK, "stroke-width": width }) as const;
const stroke = (color: string, width: number, opacity?: number) => ({ fill: "none", stroke: color, "stroke-width": width, opacity }) as const;

function wall(): string {
  return (
    rect(0, 0, 1600, Y_BENCH + 4, { fill: "url(#wall)" }) +
    rect(0, 0, 1600, Y_BENCH, { fill: "url(#grid)", opacity: 0.42, mask: "url(#gridFade)" }) +
    // a steel ledge where the bench meets the wall
    rect(0, Y_BENCH - 18, 1600, 18, { fill: "#6f8aa1" }) +
    rect(0, Y_BENCH - 18, 1600, 4, { fill: "#a5bccc", opacity: 0.7 }) +
    // warm spill from the lamp across the wall behind the bench
    ellipse(500, 480, 520, 290, { fill: "url(#spill)" })
  );
}

/** A coconut palm silhouette: a leaning trunk and a crown of drooping fronds. */
function palm(x: number, base: number, h: number, lean: number, fill: string): string {
  const top: P = [x + lean, base - h];
  const trunk = path(`M${x - 7},${base}Q${n(x + lean * 0.2)},${n(base - h * 0.5)} ${n(top[0] - 3)},${n(top[1])}L${n(top[0] + 3)},${n(top[1])}Q${n(x + lean * 0.2 + 12)},${n(base - h * 0.5)} ${x + 7},${base}Z`);
  const fronds = [-170, -140, -112, -80, -50, -18, 12].map((deg) => {
    const a = (deg * Math.PI) / 180;
    const len = h * 0.42;
    const tip: P = [top[0] + Math.cos(a) * len, top[1] + Math.sin(a) * len * 0.6 + len * 0.42];
    const mid: P = [top[0] + Math.cos(a) * len * 0.55, top[1] + Math.sin(a) * len * 0.55 - 8];
    const w = 9;
    return `M${n(top[0])},${n(top[1])}Q${n(mid[0] - Math.sin(a) * w)},${n(mid[1] + Math.cos(a) * w)} ${n(tip[0])},${n(tip[1])}Q${n(mid[0] + Math.sin(a) * w)},${n(mid[1] - Math.cos(a) * w)} ${n(top[0])},${n(top[1])}Z`;
  });
  return g({ fill }, trunk, path(fronds.join("")));
}

/** Blue hour through the window: a deep sky, a last warm band, palms, the first stars. */
function window_(): string {
  const [x0, y0, x1, y1] = [1212, 132, 1560, 520];
  const stars = (
    [
      [1268, 186, 5],
      [1352, 226, 3.5],
      [1512, 176, 4],
    ] as const
  )
    .map(([x, y, r]) => poly(star(x, y, r, r * 0.35, 4), { fill: "#dfe8ee", opacity: 0.75 }))
    .join("");
  return (
    circle(1386, 330, 330, { fill: "url(#coolGlow)" }) +
    rect(x0 - 16, y0 - 16, x1 - x0 + 32, y1 - y0 + 30, { fill: "#6f879b" }) +
    g(
      { "clip-path": "url(#glass)" },
      rect(x0, y0, x1 - x0, y1 - y0, { fill: "url(#dusk)" }),
      stars,
      path(ridge([[x0, 476], [1270, 466], [1340, 474], [1420, 460], [1500, 470], [x1, 462]], y1), { fill: "#44657b" }),
      palm(1296, 520, 150, -26, "#35536a"),
      palm(1460, 524, 260, 34, "#203a4d"),
      poly([[x0, y0 + 40], [x0 + 60, y0], [x0 + 110, y0], [x0, y0 + 150]], { fill: "#ffffff", opacity: 0.07 }),
    ) +
    g({ fill: "#a9bccb" }, rect(1380, y0, 12, y1 - y0), rect(x0, 318, x1 - x0, 12)) +
    rect(x0 - 30, y1, x1 - x0 + 60, 18, { fill: "#b8c8d4" }) +
    rect(x0 - 30, y1 + 18, x1 - x0 + 60, 8, { fill: "#5f7788" })
  );
}

/** The microscope, silhouetted against the window, with a cool rim of blue-hour light. */
function microscope(): string {
  const body =
    "M1262,600L1262,578C1262,566 1272,560 1286,560L1392,560C1404,560 1410,566 1410,578L1410,600Z" +
    "M1352,560L1352,470C1352,420 1328,392 1300,372L1318,350C1356,378 1384,420 1384,474L1384,560Z" +
    "M1286,396L1322,338L1348,354L1312,414Z" +
    "M1300,346L1336,276L1360,290L1326,358Z" +
    "M1272,470L1368,470L1368,484L1272,484Z";
  return (
    path(body, { fill: "#1f3346" }) +
    path("M1384,474C1384,420 1356,378 1318,350M1360,290L1326,358", stroke(RIM, 3, 0.7)) +
    rect(1331, 268, 34, 16, { rx: 4, fill: "#1f3346", transform: "rotate(28 1348 276)" }) +
    circle(1370, 500, 14, { fill: "#2b4558" }) +
    circle(1370, 500, 6, { fill: RIM, opacity: 0.5 })
  );
}

function bench(): string {
  return (
    rect(0, Y_BENCH, 1600, 900 - Y_BENCH, { fill: "url(#bench)" }) +
    line([0, Y_BENCH + 1], [1600, Y_BENCH + 1], stroke("#7f9aa9", 3, 0.8)) +
    ellipse(560, 690, 440, 110, { fill: "url(#pool)" }) +
    rect(0, 740, 1600, 160, { fill: "url(#ht)", opacity: 0.18 })
  );
}

/** The brass lamp at the left edge, its cone of warm light falling across the bench. */
function lamp(): string {
  const ink = keyline(3.5);
  const arm = (pts: readonly P[]) => path(smooth(pts), stroke(INK, 22)) + path(smooth(pts), stroke(BRASS, 13)) + path(smooth(pts), stroke(BRASS_L, 3.5, 0.8));
  return (
    poly([[232, 319], [131, 404], [250, 900], [990, 700]], { fill: "url(#cone)" }) +
    poly([[232, 319], [131, 404], [250, 900], [990, 700]], { fill: "url(#hl)", opacity: 0.3, mask: "url(#beamFade)" }) +
    circle(186, 364, 280, { fill: "url(#lampGlow)" }) +
    ellipse(104, 792, 96, 20, { fill: INK, opacity: 0.4 }) +
    arm([[104, 770], [70, 650], [58, 526]]) +
    arm([[58, 526], [88, 414], [130, 300]]) +
    circle(58, 526, 15, { fill: BRASS_D, ...ink }) +
    circle(58, 526, 5, { fill: BRASS_L }) +
    path("M14,792C14,758 54,742 104,742C154,742 194,758 194,792Z", { fill: BRASS, ...ink }) +
    path("M34,778C44,760 74,752 104,752", stroke(BRASS_L, 6)) +
    rect(88, 726, 32, 22, { rx: 5, fill: BRASS_D, ...ink }) +
    g(
      { transform: "translate(130 300) rotate(50)" },
      path("M-20,-26C-20,-42 4,-46 18,-44L80,-66L80,66L18,44C4,46 -20,42 -20,26Z", { fill: "#9a7536", ...ink }),
      path("M-10,-30L44,-50", stroke(BRASS_L, 7, 0.8)),
      path("M24,40L78,60", stroke("#6f5227", 7, 0.7)),
      ellipse(80, 0, 17, 66, { fill: "#fff4d2", ...ink }),
      ellipse(83, 0, 9, 44, { fill: "#fffbea" }),
      circle(0, 0, 14, { fill: BRASS_D, ...ink }),
      circle(0, 0, 5, { fill: BRASS_L }),
    )
  );
}

function flask(): string {
  const ink = keyline(4);
  const glass = "M338,462L338,542L276,642C266,660 276,674 296,674L436,674C456,674 466,660 456,642L394,542L394,462Z";
  return (
    ellipse(366, 672, 110, 16, { fill: INK, opacity: 0.25 }) +
    path(glass, { fill: "#dbe8e8", opacity: 0.55 }) +
    path("M306,594L426,594L456,642C466,660 456,674 436,674L296,674C276,674 266,660 276,642Z", { fill: TEAL }) +
    path("M306,594L426,594", stroke("#8fcfc4", 4)) +
    circle(334, 640, 7, { fill: "#8fcfc4", opacity: 0.8 }) +
    circle(388, 624, 5, { fill: "#8fcfc4", opacity: 0.7 }) +
    circle(360, 652, 3.5, { fill: "#8fcfc4", opacity: 0.7 }) +
    path("M394,462L394,542L456,642C466,660 456,674 436,674L380,674L380,462Z", { fill: "url(#ht)", opacity: 0.16 }) +
    path(glass, { fill: "none", ...ink }) +
    rect(328, 448, 76, 16, { rx: 5, fill: "#dbe8e8", ...ink }) +
    path("M350,474L350,544L298,628", stroke("#ffffff", 6, 0.75))
  );
}

function tubes(): string {
  const ink = keyline(3);
  const fills = ["#b8433a", "#d8b35c", "#7fc0b4", "#b8433a"] as const;
  const out: string[] = [ellipse(306, 712, 78, 11, { fill: INK, opacity: 0.3 })];
  fills.forEach((fill, i) => {
    const x = 272 + i * 22;
    const top = 540 + (i % 2) * 10;
    out.push(rect(x - 8, top, 16, 150, { rx: 8, fill: "#e4ecec", opacity: 0.75 }));
    out.push(rect(x - 8, top + 64, 16, 86, { rx: 8, fill }));
    out.push(rect(x - 8, top, 16, 150, { rx: 8, fill: "none", ...ink }));
    out.push(line([x - 3, top + 8], [x - 3, top + 120], stroke("#ffffff", 3, 0.6)));
  });
  return (
    out.join("") +
    rect(252, 606, 110, 16, { rx: 3, fill: "#8aa0b3", ...keyline(3) }) +
    rect(252, 674, 110, 16, { rx: 3, fill: "#6d8499", ...keyline(3) }) +
    rect(256, 622, 8, 70, { fill: "#5a7085", ...keyline(2.5) }) +
    rect(350, 622, 8, 70, { fill: "#5a7085", ...keyline(2.5) })
  );
}

/** The analyser: a cream handheld, steel bezel, a teal screen drawing its response curve, a strip on top. */
function analyser(): string {
  const ink = keyline(4);
  const curve = smooth([[488, 498], [516, 496], [540, 486], [560, 448], [578, 424], [598, 432], [616, 442], [632, 444]]);
  const screw = (x: number, y: number) => circle(x, y, 5, { fill: BRASS, ...keyline(2) }) + line([x - 3, y - 3], [x + 3, y + 3], { stroke: BRASS_D, "stroke-width": 1.6 });
  return (
    // cast shadow falls right, away from the lamp
    poly([[680, 690], [800, 700], [752, 640], [700, 632]], { fill: INK, opacity: 0.3 }) +
    ellipse(562, 692, 150, 16, { fill: INK, opacity: 0.35 }) +
    // right side face in shade, with a cool rim from the window
    path("M650,366L698,382L698,674L650,690Z", { fill: "#b3a98f", ...ink }) +
    path("M650,366L698,382L698,674L650,690Z", { fill: "url(#ht)", opacity: 0.22 }) +
    line([696, 388], [696, 668], stroke(RIM, 4, 0.9)) +
    // the sensor strip with gold electrode tracks, the sample pad, and one drop
    rect(546, 290, 32, 72, { rx: 3, fill: "#f4efe2", ...ink }) +
    g({ stroke: BRASS, "stroke-width": 3.2 }, line([554, 312], [554, 358]), line([562, 318], [562, 358]), line([570, 312], [570, 358])) +
    rect(546, 290, 32, 22, { rx: 3, fill: "#e8c0ae", ...keyline(3) }) +
    path("M562,262C562,262 547,280 547,290C547,299 554,305 562,305C570,305 577,299 577,290C577,280 562,262 562,262Z", { fill: "#b3392b", ...keyline(3) }) +
    circle(556, 290, 3.6, { fill: "#f6d6c8" }) +
    // the body
    rect(430, 352, 234, 340, { rx: 36, fill: "url(#shell)", ...ink }) +
    rect(530, 346, 64, 14, { rx: 4, fill: "#2c3b4c", ...keyline(3) }) +
    path("M446,400L446,650", stroke("#fff8e6", 8, 0.8)) +
    rect(452, 378, 190, 172, { rx: 18, fill: STEEL, ...keyline(3) }) +
    rect(452, 378, 190, 172, { rx: 18, fill: "url(#lcdGlow)" }) +
    rect(468, 394, 158, 138, { rx: 8, fill: "url(#lcd)", ...keyline(3) }) +
    g({ stroke: "#5fa39a", "stroke-width": 1.6, opacity: 0.45, "stroke-dasharray": "3 5" }, line([478, 420], [616, 420]), line([478, 452], [616, 452]), line([478, 484], [616, 484])) +
    path(curve, stroke("#9fe3cf", 10, 0.25)) +
    path(curve, stroke("#d8f6e6", 3.8)) +
    circle(578, 424, 5.5, { fill: "#f3b778" }) +
    g({ fill: "#7ec2b3", opacity: 0.8 }, rect(480, 508, 30, 12, { rx: 2 }), rect(516, 508, 44, 12, { rx: 2 }), rect(598, 404, 18, 9, { rx: 2 })) +
    // buttons, a status lamp, brass screws
    circle(547, 610, 30, { fill: TEAL, ...ink }) +
    path("M528,599C533,590 541,585 550,585", stroke("#9fdccf", 4.5, 0.9)) +
    circle(478, 610, 17, { fill: "#d6ccb2", ...keyline(3) }) +
    circle(616, 610, 17, { fill: "#d6ccb2", ...keyline(3) }) +
    circle(628, 562, 5, { fill: "#8ff0c9" }) +
    g({ fill: "#8f866f" }, circle(532, 664, 2.8), circle(547, 664, 2.8), circle(562, 664, 2.8)) +
    screw(452, 370) +
    screw(642, 370) +
    screw(452, 674) +
    screw(642, 674)
  );
}

/** The phone app: readings plotted as a line graph, cabled to the analyser. */
function phone(): string {
  const ink = keyline(4);
  const pts: P[] = [[748, 604], [768, 590], [786, 596], [804, 566], [822, 548], [838, 552]];
  return (
    path(smooth([[636, 690], [664, 718], [708, 726], [742, 716]]), { ...stroke(INK, 10) }) +
    path(smooth([[636, 690], [664, 718], [708, 726], [742, 716]]), { ...stroke("#34485c", 5) }) +
    poly([[826, 712], [902, 718], [862, 668], [834, 664]], { fill: INK, opacity: 0.3 }) +
    poly([[700, 700], [818, 712], [806, 728], [690, 716]], { fill: "#5c738a", ...keyline(3) }) +
    g(
      { transform: "translate(-30 46) rotate(6 792 557)" },
      circle(792, 556, 150, { fill: "url(#phoneHalo)" }),
      rect(726, 448, 132, 218, { rx: 18, fill: "#243449", ...ink }),
      line([854, 470], [854, 640], stroke(RIM, 4, 0.8)),
      rect(736, 462, 112, 190, { rx: 10, fill: "url(#screen)" }),
      rect(744, 472, 96, 18, { rx: 5, fill: TEAL }),
      g({ stroke: "#b8cbc6", "stroke-width": 1.5 }, line([748, 520], [836, 520]), line([748, 552], [836, 552]), line([748, 584], [836, 584]), line([748, 612], [836, 612])),
      path(`M${pts.map(([x, y]) => `${x},${y}`).join("L")}`, stroke("#2f7b76", 4)),
      pts.map(([x, y]) => circle(x, y, 4, { fill: CREAM, stroke: RUST, "stroke-width": 2.4 })).join(""),
      rect(746, 624, 40, 10, { rx: 3, fill: "#c9d8d4" }),
      rect(792, 624, 46, 10, { rx: 3, fill: "#e0c68f" }),
    )
  );
}

/** The certificate, rolled and tied with a rust ribbon and a wax seal (an abstract emboss). */
function certificate(): string {
  const ink = keyline(4);
  const emboss = poly(star(0, 0, 18, 8, 8, -90), { fill: "#8a2f20" });
  return g(
    { transform: "translate(600 868) rotate(-7)" },
    ellipse(310, 44, 330, 16, { fill: INK, opacity: 0.35 }),
    rect(0, -40, 640, 80, { fill: "url(#roll)", ...ink }),
    line([16, -28], [620, -28], stroke("#f6ecd6", 5, 0.7)),
    rect(0, -40, 640, 80, { fill: "url(#hs)", opacity: 0.2 }),
    ellipse(640, 0, 14, 40, { fill: "#e9dcbd", ...ink }),
    path("M640,-6C646,-6 648,4 640,8C632,12 628,-4 638,-16C648,-26 654,4 646,22", stroke("#b8a57e", 3)),
    ellipse(0, 0, 14, 40, { fill: "#e9dcbd", ...ink }),
    rect(290, -42, 36, 84, { fill: RUST, ...ink }),
    line([290, -36], [326, -36], stroke(BRASS_L, 3)),
    path("M300,40L284,96L300,88L310,102L312,42Z", { fill: RUST, ...keyline(3) }),
    path("M316,40L338,94L322,88L316,104L306,44Z", { fill: "#8f3522", ...keyline(3) }),
    g(
      { transform: "translate(306 46)" },
      path("M-34,-4C-36,-22 -20,-36 0,-35C18,-36 36,-22 34,-2C38,14 22,34 0,34C-18,36 -38,18 -34,-4Z", { fill: "#a33a28", ...ink }),
      circle(0, 0, 24, { fill: "none", stroke: "#7d2a1c", "stroke-width": 3 }),
      emboss,
      path("M-22,-18C-14,-28 -2,-30 8,-28", stroke("#e0806a", 4, 0.8)),
    ),
  );
}

export const pratyasa: Scene = {
  slug: "pratyasa",
  render() {
    const grid =
      "M0 .5H120M0 24.5H120M0 48.5H120M0 72.5H120M0 96.5H120M.5 0V120M24.5 0V120M48.5 0V120M72.5 0V120M96.5 0V120";
    const defs = [
      printDefs(INK, "#f8e7c0", 23),
      linear("wall", [
        [0, "#22364d"],
        [0.55, "#3a5570"],
        [1, "#4b6781"],
      ]),
      el(
        "pattern",
        { id: "grid", width: 120, height: 120, patternUnits: "userSpaceOnUse" },
        path(grid, { fill: "none", stroke: "#9cb2c4", "stroke-width": 1.2, opacity: 0.55 }) + path("M0 .5H120M.5 0V120", { fill: "none", stroke: "#b3c6d4", "stroke-width": 2.2 }),
      ),
      linear("gridRamp", [
        [0, "#ffffff", 0.25],
        [0.5, "#ffffff", 0.7],
        [1, "#ffffff", 1],
      ]),
      radial("hole", [
        [0, "#000000", 0.75],
        [1, "#000000", 0],
      ]),
      el("mask", { id: "gridFade" }, rect(0, 0, 1600, Y_BENCH, { fill: "url(#gridRamp)" }) + circle(1024, 470, 190, { fill: "url(#hole)" })),
      linearUser("beamRamp", [
        [0, "#ffffff", 1],
        [1, "#ffffff", 0],
      ], [190, 350], [640, 760]),
      el("mask", { id: "beamFade" }, rect(0, 0, 1600, 900, { fill: "url(#beamRamp)" })),
      radial("spill", [
        [0, LAMP, 0.42],
        [0.5, LAMP, 0.16],
        [1, LAMP, 0],
      ]),
      glow("coolGlow", RIM, [1386, 330], 330, 0.18),
      glow("lcdGlow", "#86dcc8", [547, 463], 130, 0.3),
      el("clipPath", { id: "glass" }, rect(1212, 132, 348, 388)),
      linear("dusk", [
        [0, "#1c3152"],
        [0.5, "#33587b"],
        [0.82, "#7fa0b8"],
        [1, "#cdb59b"],
      ]),
      linear("bench", [
        [0, "#35494d"],
        [0.25, "#29393c"],
        [1, "#151f22"],
      ]),
      radial("pool", [
        [0, LAMP, 0.5],
        [0.5, LAMP, 0.18],
        [1, LAMP, 0],
      ]),
      linearUser("cone", [
        [0, LAMP, 0.34],
        [1, LAMP, 0],
      ], [190, 350], [700, 820]),
      glow("lampGlow", LAMP, [186, 360], 260, 0.8),
      linearUser("shell", [
        [0, "#fbf3df"],
        [1, "#d9ceb3"],
      ], [430, 0], [664, 0]),
      linear("lcd", [
        [0, "#215a5d"],
        [1, "#163c40"],
      ]),
      radial("phoneHalo", [
        [0, "#dfeee8", 0.22],
        [1, "#dfeee8", 0],
      ]),
      linear("screen", [
        [0, "#f6f1e3"],
        [1, "#dfe8e3"],
      ]),
      linear("roll", [
        [0, "#eadcbc"],
        [0.5, "#cfbd97"],
        [1, "#a18d69"],
      ]),
    ];
    const body = [wall(), window_(), bench(), microscope(), lamp(), flask(), analyser(), tubes(), phone(), certificate()].join("");
    return svg(defs.join(""), g({ "stroke-linecap": "round", "stroke-linejoin": "round" }, body) + printFinish(0.22, 0.9));
  },
};
