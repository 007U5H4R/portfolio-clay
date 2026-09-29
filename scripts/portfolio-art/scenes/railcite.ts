import {
  circle,
  el,
  ellipse,
  g,
  glow,
  line,
  linear,
  mix,
  path,
  pine,
  poly,
  polyline,
  printDefs,
  printFinish,
  rect,
  star,
  ridge,
  smooth,
  svg,
  type P,
  type Scene,
} from "../kit";

/**
 * RailCite — "Research on track" (data/projects.ts: a trust-first RAG assistant that cites the right
 * railway rule or circular, never inventing one). A streamliner comes down the line at dusk; every
 * third sleeper is a ruled document page, a signal ahead shows a clear green aspect (trust,
 * correctness), and a stack of bound circulars with a magnifier sits in the foreground (research).
 * Palette: dusk teal, rust, cream, steel, one green lamp.
 */

const INK = "#13202b";
const CREAM = "#f1e4c6";
const RUST = "#b64927";
const VP: P = [980, 520]; // the rails' vanishing point, on the horizon
const HORIZON = 520;
const L1: P = [130, 900]; // left rail at the bottom edge
const R1: P = [560, 900]; // right rail at the bottom edge

/** Where the rails sit at screen row `y` (1-point perspective towards VP). */
function railsAt(y: number): { left: number; right: number } {
  const t = (y - HORIZON) / (900 - HORIZON);
  return { left: VP[0] + (L1[0] - VP[0]) * t, right: VP[0] + (R1[0] - VP[0]) * t };
}

const stroke = (color: string, width: number, opacity?: number) =>
  ({ fill: "none", stroke: color, "stroke-width": width, "stroke-linecap": "round", opacity }) as const;

function sky(): string {
  return (
    rect(0, 0, 1600, 560, { fill: "url(#sky)" }) +
    // high, low-contrast cloud streaks (the lettering band stays calm)
    path(smooth([[40, 150], [210, 132], [390, 146], [520, 140]]), stroke("#2f5e6b", 16, 0.55)) +
    path(smooth([[1120, 118], [1300, 104], [1520, 116]]), stroke("#2f5e6b", 12, 0.5)) +
    // the sun, sinking behind the far ridge, and its halo
    circle(760, 470, 420, { fill: "url(#halo)" }) +
    g(
      { fill: "url(#rayFade)", opacity: 0.5 },
      ...[-62, -38, -14, 12, 36, 62].map((deg) => {
        const a0 = ((deg - 90 - 4) * Math.PI) / 180;
        const a1 = ((deg - 90 + 4) * Math.PI) / 180;
        const r = 520;
        return poly([[760, 470], [760 + r * Math.cos(a0) * 1.6, 470 + r * Math.sin(a0) * 0.62], [760 + r * Math.cos(a1) * 1.6, 470 + r * Math.sin(a1) * 0.62]]);
      }),
    ) +
    circle(760, 470, 158, { fill: "url(#sun)" }) +
    // glowing streaks across the low sky
    path(smooth([[520, 402], [700, 392], [900, 398], [1080, 390]]), stroke("#f7c98c", 9, 0.7)) +
    path(smooth([[930, 428], [1120, 420], [1330, 430], [1500, 422]]), stroke("#e9a36d", 12, 0.55)) +
    path(smooth([[60, 436], [220, 428], [400, 436]]), stroke("#e39b68", 10, 0.45)) +
    // warm light dots in the glow (a halftone sky)
    rect(0, 250, 1600, 300, { fill: "url(#hl)", mask: "url(#skyFade)", opacity: 0.55 }) +
    // three birds heading home
    polyline([[1168, 196], [1180, 188], [1192, 196]], { ...stroke(INK, 3.5), "stroke-linejoin": "round" }) +
    polyline([[1200, 222], [1214, 212], [1228, 222]], { ...stroke(INK, 3.5), "stroke-linejoin": "round" }) +
    polyline([[1140, 232], [1150, 225], [1160, 232]], { ...stroke(INK, 3), "stroke-linejoin": "round" })
  );
}

function land(): string {
  const far = ridge([[0, 488], [110, 470], [220, 480], [320, 458], [420, 478], [520, 474], [620, 494], [760, 503], [900, 498], [1010, 490], [1090, 468], [1190, 478], [1270, 450], [1380, 470], [1470, 446], [1600, 466]], 560);
  const mid = ridge([[0, 508], [130, 494], [250, 512], [390, 500], [530, 516], [700, 522], [880, 520], [1040, 514], [1150, 500], [1260, 510], [1400, 494], [1520, 504], [1600, 492]], 580);
  const furrows = [-700, -260, 1500, 1900, 2400].map((x) => line(VP, [x, 900], { stroke: "#35483f", "stroke-width": 3, opacity: 0.9 })).join("");
  const hazePines = Array.from({ length: 16 }, (_, i) => {
    const x = 1080 + i * 34 + (i % 3) * 7;
    const h = 26 + ((i * 7) % 5) * 7;
    return pine(x, 512 + (i % 2) * 4, h, h * 0.55, { fill: "#3d5f63" });
  }).join("");
  const leftPines = (
    [
      [18, 610, 250],
      [70, 596, 200],
      [128, 584, 150],
      [176, 574, 108],
      [214, 566, 78],
      [246, 560, 58],
      [278, 556, 42],
      [306, 552, 32],
    ] as const
  )
    .map(([x, base, h]) => pine(x, base, h, h * 0.5, { fill: "#1d3431" }))
    .join("");
  return (
    path(far, { fill: "#5e8389" }) +
    hazePines +
    path(mid, { fill: "#36565c" }) +
    rect(0, 515, 1600, 385, { fill: "url(#ground)" }) +
    ellipse(760, 530, 470, 44, { fill: "#e7a565", opacity: 0.3 }) +
    furrows +
    rect(0, 520, 1600, 380, { fill: "url(#ht)", opacity: 0.14 }) +
    leftPines
  );
}

function track(trainRail: number): string {
  const parts: string[] = [];
  const bed: P[] = [[972, 520], [988, 520], [650, 900], [40, 900]];
  parts.push(poly(bed, { fill: "url(#ballast)" }));
  parts.push(poly(bed, { fill: "url(#hs)", opacity: 0.22 }));
  // sleepers, far → near so the near ones overlap; every third one is a ruled document page
  for (let k = 44; k >= 0; k -= 1) {
    const t = 1 / (1 + k * 0.2);
    const y = HORIZON + (900 - HORIZON) * t;
    if (y < trainRail - 8 && y > 560) continue; // hidden under the train
    const { left, right } = railsAt(y);
    const over = 34 * t;
    const lx = left - over;
    const rx = right + over;
    const h = 24 * t;
    const paper = k % 3 === 1 && t > 0.16;
    parts.push(rect(lx, y - h * 0.42, rx - lx, h * 0.42, { fill: paper ? "#b9a888" : "#3f2e22" }));
    parts.push(poly([[lx + 3 * t, y - h], [rx - 3 * t, y - h], [rx, y - h * 0.42], [lx, y - h * 0.42]], { fill: paper ? "#eee2c5" : "#6d5039" }));
    if (paper && t > 0.3) {
      for (const r of [0.3, 0.55, 0.8]) {
        const yy = y - h + h * 0.58 * r;
        parts.push(line([lx + 16 * t, yy], [rx - 16 * t, yy], { stroke: "#8fa4ba", "stroke-width": 1.6 * t + 0.4 }));
      }
      parts.push(line([lx + 30 * t, y - h + 1], [lx + 30 * t, y - h * 0.44], { stroke: RUST, "stroke-width": 1.4 * t + 0.3, opacity: 0.8 }));
    }
  }
  // rails: steel body + a warm sunset glint along each head
  for (const end of [L1, R1]) {
    parts.push(poly([[VP[0] - 1, VP[1]], [VP[0] + 1, VP[1]], [end[0] + 9, 900], [end[0] - 9, 900]], { fill: "#4f5b69" }));
    parts.push(line(VP, [end[0] - 2, 900], { stroke: "#f3d3a2", "stroke-width": 3.5 }));
  }
  return parts.join("");
}

function train(railY: number): string {
  const { left, right } = railsAt(railY);
  const cx = (left + right) / 2;
  const sc = (right - left) / 283;
  const w = (x: number, y: number): P => [cx + x * sc, railY + y * sc];
  const W_ = (list: readonly P[]): P[] => list.map(([x, y]) => w(x, y));
  const c = (p: P) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  const ink = { stroke: INK, "stroke-width": 4, "stroke-linejoin": "round" } as const;

  // the car bodies' right side, receding to VP
  const frontTop = w(190, -330);
  const frontBottom = w(190, -44);
  const car = (s0: number, s1: number, fill: string) => {
    const a = mix(frontTop, VP, s0);
    const b = mix(frontTop, VP, s1);
    const cc = mix(frontBottom, VP, s1);
    const e = mix(frontBottom, VP, s0);
    const out: string[] = [poly([a, b, cc, e], { fill, ...ink })];
    const band = (v: number) => [mix(a, e, v), mix(b, cc, v)] as const;
    const [b1, b2] = band(0.62);
    const [b3, b4] = band(0.74);
    out.push(poly([b1, b2, b4, b3], { fill: RUST }));
    for (let i = 0; i < 4; i += 1) {
      const u0 = 0.1 + (i / 4) * 0.84;
      const u1 = u0 + 0.13;
      const rowTop = (u: number) => mix(mix(a, e, 0.2), mix(b, cc, 0.2), u);
      const rowBottom = (u: number) => mix(mix(a, e, 0.44), mix(b, cc, 0.44), u);
      out.push(poly([rowTop(u0), rowTop(u1), rowBottom(u1), rowBottom(u0)], { fill: "#f6c872", stroke: INK, "stroke-width": 2 }));
    }
    out.push(poly([a, b, cc, e], { fill: "url(#hs)", opacity: 0.28 }));
    for (const u of [0.18, 0.4, 0.66, 0.86]) {
      const p = mix(e, cc, u);
      const r = 22 * sc * (1 - s0 * 0.9) * (1 - u * 0.25);
      out.push(ellipse(p[0], p[1] + r * 0.2, r * 0.62, r, { fill: "#1f2a35", stroke: INK, "stroke-width": 2.5 }));
      out.push(ellipse(p[0], p[1] + r * 0.2, r * 0.22, r * 0.36, { fill: "#8e9aa8" }));
    }
    return out.join("");
  };

  const [hx, hy] = w(0, -238);
  const nose = `M${c(w(-190, -44))}L${c(w(-190, -190))}C${c(w(-190, -262))} ${c(w(-142, -302))} ${c(w(-70, -308))}L${c(w(70, -308))}C${c(w(142, -302))} ${c(w(190, -262))} ${c(w(190, -190))}L${c(w(190, -44))}Z`;
  const rim = `M${c(w(-176, -214))}C${c(w(-170, -270))} ${c(w(-120, -300))} ${c(w(-60, -304))}L${c(w(60, -304))}C${c(w(120, -300))} ${c(w(170, -270))} ${c(w(180, -214))}`;
  const front = [
    // pilot (cowcatcher) with slats
    poly(W_([[-172, 0], [172, 0], [190, -44], [-190, -44]]), { fill: "#26323f", ...ink }),
    ...Array.from({ length: 9 }, (_, i) => {
      const x = -150 + i * 37.5;
      return line(w(x, -40), w(x * 0.92, -4), { stroke: "#56626f", "stroke-width": 3 });
    }),
    path(nose, { fill: "url(#noseLit)", ...ink }),
    // roundness: a shadow crescent down the right flank + a gloss band on the left
    path(
      `M${c(w(118, -300))}C${c(w(176, -280))} ${c(w(190, -240))} ${c(w(190, -190))}L${c(w(190, -44))}L${c(w(138, -44))}L${c(w(138, -190))}C${c(w(138, -236))} ${c(w(134, -276))} ${c(w(118, -300))}Z`,
      { fill: "#a9997b", opacity: 0.55 },
    ),
    poly(W_([[-150, -270], [-126, -290], [-126, -60], [-150, -60]]), { fill: "#fbf1dc", opacity: 0.55 }),
    // backlit shade across the lower nose + halftone
    poly(W_([[-190, -150], [190, -150], [190, -44], [-190, -44]]), { fill: "#b9ab8e", opacity: 0.8 }),
    poly(W_([[-190, -200], [190, -200], [190, -44], [-190, -44]]), { fill: "url(#ht)", opacity: 0.2 }),
    // warm rim light along the nose top (the sun is behind the train)
    path(rim, { ...stroke("#fbe0ae", 5 * sc, 0.9) }),
    // chevron livery
    poly(W_([[-190, -168], [0, -98], [190, -168], [190, -132], [0, -62], [-190, -132]]), { fill: RUST, stroke: INK, "stroke-width": 3 }),
    polyline(W_([[-190, -182], [0, -112], [190, -182]]), { stroke: CREAM, "stroke-width": 5 * sc }),
    // cab: windshield frame, panes, roof cap
    poly(W_([[-128, -306], [-110, -352], [110, -352], [128, -306]]), { fill: "#2a3644", ...ink }),
    poly(W_([[-112, -312], [-98, -344], [-8, -344], [-8, -312]]), { fill: "#f3c77e" }),
    poly(W_([[8, -312], [8, -344], [98, -344], [112, -312]]), { fill: "#f3c77e" }),
    poly(W_([[-100, -340], [-60, -340], [-86, -316], [-106, -316]]), { fill: "#fff1cf", opacity: 0.7 }),
    path(`M${c(w(-118, -352))}Q${c(w(0, -374))} ${c(w(118, -352))}Z`, { fill: "#dccfb2", ...ink }),
    // headlight + marker lamps
    circle(hx, hy, 40 * sc, { fill: "#26323f", ...ink }),
    circle(hx, hy, 29 * sc, { fill: "#fff4cf" }),
    circle(hx - 8 * sc, hy - 8 * sc, 9 * sc, { fill: "#ffffff", opacity: 0.85 }),
    poly(star(hx, hy, 74 * sc, 7 * sc, 4, -90), { fill: "#fff6da", opacity: 0.9 }),
    circle(...w(-150, -236), 11 * sc, { fill: "#f6b35a", stroke: INK, "stroke-width": 2.5 }),
    circle(...w(150, -236), 11 * sc, { fill: "#f6b35a", stroke: INK, "stroke-width": 2.5 }),
    // centre seam + handrails
    line(w(0, -290), w(0, -262), { stroke: INK, "stroke-width": 2.5 }),
    line(w(-176, -200), w(-176, -80), { stroke: "#8b806c", "stroke-width": 3 }),
    line(w(176, -200), w(176, -80), { stroke: "#8b806c", "stroke-width": 3 }),
  ].join("");

  return (
    poly([[hx - 26 * sc, hy], [hx + 26 * sc, hy], [hx + 330, 900], [hx - 470, 900]], { fill: "url(#beam)" }) +
    circle(hx, hy, 190 * sc, { fill: "url(#headGlow)" }) +
    ellipse(hx - 40, 868, 300, 44, { fill: "#ffe3a6", opacity: 0.18 }) +
    car(0.74, 0.86, "#c9bb9c") +
    car(0.46, 0.7, "#d3c5a6") +
    car(0, 0.42, "#d9cbad") +
    front
  );
}

function signal(): string {
  const ink = { stroke: INK, "stroke-width": 4, "stroke-linejoin": "round" } as const;
  const rungs = Array.from({ length: 14 }, (_, i) => line([1268, 468 + i * 24], [1288, 468 + i * 24], { stroke: "#2b3743", "stroke-width": 3 })).join("");
  return (
    circle(1250, 338, 120, { fill: "url(#greenGlow)" }) +
    rect(1243, 430, 14, 380, { fill: "#24303b", ...ink }) +
    line([1268, 452], [1268, 800], { stroke: "#2b3743", "stroke-width": 4 }) +
    line([1288, 452], [1288, 800], { stroke: "#2b3743", "stroke-width": 4 }) +
    rungs +
    rect(1222, 438, 80, 10, { fill: "#2b3743", ...ink }) +
    rect(1212, 296, 76, 142, { rx: 18, fill: "#1e2a35", ...ink }) +
    path("M1226,322a24,24 0 0 1 48,0", { fill: "none", stroke: "#0d151c", "stroke-width": 8 }) +
    path("M1226,382a24,24 0 0 1 48,0", { fill: "none", stroke: "#0d151c", "stroke-width": 8 }) +
    circle(1250, 338, 20, { fill: "#a6d6a2" }) +
    circle(1244, 332, 6, { fill: "#f2fff0", opacity: 0.9 }) +
    circle(1250, 398, 20, { fill: "#5b2b25" }) +
    rect(1226, 800, 48, 20, { fill: "#6b6356", ...ink })
  );
}

function signalBox(): string {
  const ink = { stroke: INK, "stroke-width": 3.5, "stroke-linejoin": "round" } as const;
  return (
    pine(1590, 660, 250, 120, { fill: "#1b302c" }) +
    pine(1530, 640, 190, 96, { fill: "#223a35" }) +
    rect(1398, 540, 150, 94, { fill: "#7c4a37", ...ink }) +
    rect(1398, 540, 150, 94, { fill: "url(#ht)", opacity: 0.22 }) +
    rect(1418, 556, 108, 44, { fill: "#f4c26f", ...ink }) +
    line([1454, 556], [1454, 600], { stroke: INK, "stroke-width": 3 }) +
    line([1490, 556], [1490, 600], { stroke: INK, "stroke-width": 3 }) +
    poly([[1384, 544], [1473, 500], [1562, 544]], { fill: "#3a2b28", ...ink }) +
    rect(1508, 494, 16, 30, { fill: "#3a2b28", ...ink })
  );
}

function books(): string {
  const ink = { stroke: INK, "stroke-width": 4, "stroke-linejoin": "round" } as const;
  return (
    // bottom (rust), middle (steel), top (kraft) — spines to the viewer, foil bands
    rect(-10, 842, 300, 70, { rx: 6, fill: "#8f3b23", ...ink }) +
    line([30, 846], [30, 908], { stroke: "#e2b574", "stroke-width": 4 }) +
    line([252, 846], [252, 908], { stroke: "#e2b574", "stroke-width": 4 }) +
    rect(24, 792, 250, 52, { rx: 6, fill: "#3f5d79", ...ink }) +
    line([60, 796], [60, 840], { stroke: "#cfd8e0", "stroke-width": 3 }) +
    line([238, 796], [238, 840], { stroke: "#cfd8e0", "stroke-width": 3 }) +
    rect(8, 752, 244, 42, { rx: 6, fill: "#d9c59b", ...ink }) +
    rect(92, 752, 60, 42, { fill: RUST, opacity: 0.85 }) +
    path("M198,794l10,52l8,-10l8,12l2,-54", { fill: RUST, stroke: INK, "stroke-width": 2.5 }) +
    rect(-10, 752, 300, 160, { fill: "url(#ht)", opacity: 0.16 }) +
    // magnifier leaning on the stack
    line([334, 792], [418, 894], { stroke: "#3b2a20", "stroke-width": 22, "stroke-linecap": "round" }) +
    circle(300, 742, 62, { fill: "#d7e6e4", opacity: 0.45 }) +
    circle(300, 742, 62, { fill: "none", stroke: "#b88b44", "stroke-width": 12 }) +
    circle(300, 742, 68, { fill: "none", stroke: INK, "stroke-width": 3 }) +
    path("M262,722a44,44 0 0 1 36,-30", stroke("#ffffff", 7, 0.8))
  );
}

function rightField(): string {
  const parts: string[] = [];
  // a second, lighter field and a gravel path from the corner to the signal box
  parts.push(poly([[990, 522], [1600, 528], [1600, 900], [652, 900]], { fill: "url(#fieldR)" }));
  parts.push(poly([[1450, 640], [1478, 640], [1640, 900], [1360, 900]], { fill: "#4b473e" }));
  parts.push(poly([[1450, 640], [1478, 640], [1640, 900], [1360, 900]], { fill: "url(#hs)", opacity: 0.25 }));
  // fence posts + two wires, receding to the vanishing point
  const base: P = [1120, 900];
  const posts: P[] = [];
  for (let k = 0; k < 9; k += 1) {
    const s = 1 - 1 / (1 + k * 0.45);
    const p = mix(base, VP, s);
    const h = (p[1] - HORIZON) * 0.34 + 4;
    posts.push([p[0], p[1]]);
    parts.push(line(p, [p[0], p[1] - h], { stroke: "#5a4331", "stroke-width": Math.max(2.5, 12 * (1 - s)), "stroke-linecap": "round" }));
  }
  for (const f of [0.55, 0.85]) {
    const wire = posts.map(([x, y]) => [x, y - (y - HORIZON) * 0.34 * f] as P);
    parts.push(polyline(wire, { stroke: "#6b5642", "stroke-width": 2.5 }));
  }
  // a platform lamp by the signal box, lit
  parts.push(circle(1368, 548, 70, { fill: "url(#lampGlow)" }));
  parts.push(line([1368, 552], [1368, 660], { stroke: "#1e2a35", "stroke-width": 6 }));
  parts.push(poly([[1354, 540], [1382, 540], [1376, 556], [1360, 556]], { fill: "#f8d98c", stroke: INK, "stroke-width": 2.5 }));
  return parts.join("");
}

function foreground(): string {
  const tuft = (x: number, s: number) =>
    poly([[x, 900], [x + 8 * s, 850], [x + 14 * s, 900], [x + 22 * s, 836], [x + 30 * s, 900], [x + 40 * s, 858], [x + 46 * s, 900]], { fill: "#16211f" });
  return tuft(560, 1.4) + tuft(640, 1) + tuft(1180, 1.6) + tuft(1300, 1.2) + tuft(1420, 1.8) + tuft(1530, 1.3);
}

export const railcite: Scene = {
  slug: "railcite",
  render() {
    const railY = 770;
    const { left, right } = railsAt(railY);
    const sc = (right - left) / 283;
    const head: P = [(left + right) / 2, railY - 238 * sc];
    const defs = [
      printDefs(INK, "#fbe6bd", 11),
      linear("sky", [
        [0, "#15303f"],
        [0.36, "#24505e"],
        [0.56, "#4a6f73"],
        [0.66, "#937a70"],
        [0.76, "#cf8c5c"],
        [0.88, "#eeb477"],
        [1, "#f5cf94"],
      ]),
      linear("ground", [
        [0, "#56614f"],
        [0.12, "#3c4c43"],
        [0.45, "#2c3b36"],
        [1, "#1b2523"],
      ]),
      linear("fieldR", [
        [0, "#5a6450"],
        [0.2, "#3d4d42"],
        [1, "#26332f"],
      ]),
      linear("ballast", [
        [0, "#3d3d38"],
        [1, "#6a6255"],
      ]),
      el("radialGradient", { id: "sun", cx: 0.45, cy: 0.42, r: 0.62 }, el("stop", { offset: 0, "stop-color": "#fff0c8" }) + el("stop", { offset: 1, "stop-color": "#f4bf78" })),
      glow("halo", "#f6c47f", [760, 470], 420, 0.75),
      glow("rayFade", "#f8d49a", [760, 470], 600, 0.55),
      linear("noseLit", [
        [0, "#eadfc5"],
        [0.55, "#d8caab"],
        [1, "#c3b393"],
      ]),
      glow("headGlow", "#ffe7ad", head, 190 * sc, 0.8),
      linear("beam", [
        [0, "#ffe9b6", 0.45],
        [1, "#ffe9b6", 0],
      ]),
      glow("greenGlow", "#a6d6a2", [1250, 338], 120, 0.6),
      glow("lampGlow", "#ffd98f", [1368, 548], 70, 0.6),
      linear("fadeUp", [
        [0, "#ffffff", 0],
        [1, "#ffffff", 1],
      ]),
      el("mask", { id: "skyFade" }, rect(0, 250, 1600, 300, { fill: "url(#fadeUp)" })),
    ];
    const body = [sky(), land(), track(railY), train(railY), rightField(), signalBox(), signal(), books(), foreground(), printFinish(0.22, 0.9)].join("");
    return svg(defs.join(""), body);
  },
};
