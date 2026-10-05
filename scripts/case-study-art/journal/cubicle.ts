import { circle, ellipse, el, g, glow, line, linear, path, poly, polyline, radial, rect, smooth, type P } from "../../portfolio-art/kit";
import type { Asset } from "../kit";
import { sceneDefs, sceneFinish, sceneSvg } from "../scene-kit";

/**
 * TASK-130 journal · Cubicle hero scene (Tushar's redesign brief §10): a 1990s startup cubicle at
 * golden hour, drawn in the TASK-127 cover's pen. The CRT's screen is left OPEN at a fixed 4:3
 * rectangle — the page lays the real Cubicle UI (an <img>) into it, so the product, not a drawing,
 * fills the monitor. Around it: navy partition fabric, venetian blinds and a low sun, pinned index
 * cards with string, a wall clock, a desk plant, a mug, and the run's four printed deliverables.
 * Every fact stays in the page's HTML; this file is decoration (aria-hidden, alt="").
 *
 * Screen opening (must match journal.css .jx-cub-screen): x 300 · y 236 · 520 × 390.
 */
export const CUBICLE_SCENE = { w: 1200, h: 960, screen: { x: 300, y: 236, w: 520, h: 390 } } as const;

const INK = "#1f1c2b";
const ORANGE = "#e07a3c";
const STEEL = "#7b95c6";
const MUSTARD = "#e6b64c";
const TEAL = "#3a9b92";
const BEIGE_SHADE = "#b9a784";
const CREAM = "#fbf1dc";
const SUN: P = [1116, 318];
const { w: W, h: H, screen: S } = CUBICLE_SCENE;

const inked = (w = 4) => ({ stroke: INK, "stroke-width": w, "stroke-linejoin": "round", "stroke-linecap": "round" }) as const;
const stroke = (color: string, width: number, opacity?: number) =>
  ({ fill: "none", stroke: color, "stroke-width": width, "stroke-linecap": "round", "stroke-linejoin": "round", opacity }) as const;

function room(): string {
  const out: string[] = [rect(0, 0, W, H, { fill: "url(#wall)" })];
  // window beyond the partition end: blinds half open on a low golden sun
  out.push(rect(1004, 110, 210, 380, { fill: "#caa87a" }));
  out.push(rect(1020, 126, 190, 348, { fill: "url(#goldSky)" }));
  out.push(circle(SUN[0], SUN[1], 56, { fill: "#fff2c6" }));
  const slats: string[] = [];
  for (let y = 132; y < 470; y += 24) {
    slats.push(rect(1020, y, 190, 10, { fill: y > 250 && y < 420 ? "#f6dfae" : "#e2c795" }));
    slats.push(line([1020, y + 10], [1210, y + 10], stroke("#a47e52", 2.5)));
  }
  out.push(g({}, ...slats));
  out.push(circle(SUN[0], SUN[1], 150, { fill: "url(#sunBurn)" }));
  out.push(circle(SUN[0], SUN[1], 900, { fill: "url(#sunGlow)" }));
  // the partition: navy fabric, beige cap, seams — the cubicle wall behind the desk
  out.push(rect(-10, 150, 1016, 560, { fill: "url(#fabric)" }));
  out.push(rect(-10, 150, 1016, 560, { fill: "url(#hs)", opacity: 0.12 }));
  out.push(rect(-10, 150, 1016, 560, { fill: "url(#partGlow)" }));
  out.push(g({ fill: "#c7b58f" }, rect(262, 150, 7, 560)));
  out.push(rect(-10, 132, 1030, 20, { rx: 6, fill: "#d9c8a3" }) + line([-10, 135], [1016, 135], stroke("#f4e4c0", 3)) + rect(-10, 152, 1016, 8, { fill: "#141a2c", opacity: 0.35 }));
  out.push(rect(994, 132, 24, 580, { rx: 6, fill: "#cdb991" }) + rect(1008, 132, 10, 580, { fill: "#f2d9a4", opacity: 0.8 }));
  // blind light falling across the partition
  out.push(g({ fill: "#ffd48c", opacity: 0.16 }, ...[0, 1, 2, 3, 4, 5, 6].map((i) => poly([[996, 190 + i * 64], [996, 210 + i * 64], [620, 290 + i * 64], [620, 270 + i * 64]]))));
  return out.join("");
}

function clock(): string {
  const [cx, cy] = [1104, 590] as const;
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const r0 = i % 3 === 0 ? 34 : 38;
    return line([cx + r0 * Math.sin(a), cy - r0 * Math.cos(a)], [cx + 44 * Math.sin(a), cy - 44 * Math.cos(a)]);
  });
  return (
    circle(cx - 8, cy + 6, 56, { fill: "#11162a", opacity: 0.3 }) +
    circle(cx, cy, 56, { fill: "#c4622f", ...inked(3) }) +
    circle(cx, cy, 48, { fill: "#f3e7c8" }) +
    g(stroke(INK, 3, 0.7), ...ticks) +
    line([cx, cy], [cx + 20, cy + 18], stroke(INK, 5)) + // ~4:40, late afternoon
    line([cx, cy], [cx + 4, cy - 36], stroke(INK, 3.5)) +
    circle(cx, cy, 4, { fill: INK }) +
    path(`M${cx + 28},${cy - 38}A48,48 0 0 1 ${cx + 48},${cy}`, stroke("#fff6dc", 4, 0.8))
  );
}

function cards(): string {
  const list = [
    [96, 222, -5, "#efe1bf", ORANGE],
    [196, 290, 4, "#ecc978", TEAL],
    [90, 366, 2, "#eeb08a", MUSTARD],
    [192, 440, -3, "#c3cee2", STEEL],
  ] as const;
  const out: string[] = [];
  for (const [x, y, a, fill] of list) {
    out.push(
      g(
        { transform: `rotate(${a} ${x} ${y})` },
        rect(x - 50, y - 28, 100, 64, { rx: 3, fill: "#10152a", opacity: 0.3 }),
        rect(x - 44, y - 34, 100, 64, { rx: 3, fill }),
        g(stroke("#7d6c58", 3, 0.7), line([x - 30, y - 10], [x + 34, y - 10]), line([x - 30, y + 4], [x + 40, y + 4]), line([x - 30, y + 18], [x + 16, y + 18])),
      ),
    );
  }
  out.push(polyline(list.map(([x, y]) => [x + 6, y - 24] as P), stroke("#c24a2a", 3)));
  for (const [x, y, , , pin] of list) out.push(circle(x + 6, y - 24, 8, { fill: pin, ...inked(2.5) }) + circle(x + 3, y - 27, 2.5, { fill: "#fff6de" }));
  return out.join("");
}

function monitor(): string {
  const k = inked(5);
  const out: string[] = [];
  // cast shadow on the fabric (low sun from the right)
  out.push(path("M232,214H850L842,716H224Z", { fill: "#12172b", opacity: 0.32 }));
  // swivel base
  out.push(ellipse(560, 748, 150, 22, { fill: BEIGE_SHADE, ...inked(4) }) + rect(500, 702, 120, 44, { fill: "#cbb994", ...inked(4) }));
  // the tube housing going back to the right, lit by the sun
  out.push(poly([[868, 214], [952, 196], [952, 616], [868, 690]], { fill: "#f0d9a6", ...k }));
  out.push(g(stroke("#c5a676", 4), ...[258, 290, 322, 354, 386].map((y) => line([888, y], [934, y - 14]))));
  // bezel with its rounded CRT face
  out.push(rect(250, 190, 620, 512, { rx: 40, fill: "url(#bezel)", ...k }));
  out.push(rect(250, 650, 620, 50, { rx: 20, fill: "url(#hs)", opacity: 0.16 }));
  // badge, grille and power LED on the chin
  out.push(g(stroke("#a8966f", 3.5), line([284, 668], [380, 668]), line([284, 680], [380, 680])));
  out.push(rect(760, 660, 60, 20, { rx: 5, fill: "#cbb994", ...inked(3) }) + circle(738, 670, 7, { fill: "#8fd17a", ...inked(2) }));
  // the recessed screen well; the opening itself stays empty for the real UI
  out.push(rect(S.x - 24, S.y - 22, S.w + 48, S.h + 44, { rx: 30, fill: "#a8966f", ...inked(4) }));
  out.push(rect(S.x - 10, S.y - 8, S.w + 20, S.h + 16, { rx: 22, fill: "#151a2e" }));
  out.push(rect(S.x - 10, S.y - 8, S.w + 20, S.h + 16, { rx: 22, fill: "none", ...inked(3) }));
  return out.join("");
}

function desk(): string {
  const parts: string[] = [];
  parts.push(rect(0, 700, W, 190, { fill: "url(#deskTop)" }));
  parts.push(rect(0, 700, W, 7, { fill: INK, opacity: 0.35 }));
  parts.push(
    g(
      { "clip-path": "url(#cDesk)", fill: "#ffdc94", opacity: 0.3 },
      ...[0, 1, 2, 3, 4].map((i) => poly([[1200, 712 + i * 32], [1200, 728 + i * 32], [480, 820 + i * 46], [480, 800 + i * 46]])),
    ),
  );
  parts.push(rect(0, 800, W, 90, { fill: "url(#hs)", opacity: 0.1 }));
  parts.push(rect(0, 888, W, 22, { fill: "#8a6947" }) + line([0, 888], [W, 888], stroke(INK, 4)) + line([0, 891], [W, 891], stroke("#e7c58c", 2.5)));
  parts.push(rect(0, 910, W, 50, { fill: "#241b17" }));
  return parts.join("");
}

function keyboard(): string {
  const k = inked(3.5);
  const top: P[] = [[392, 772], [732, 772], [772, 836], [352, 836]];
  return (
    ellipse(560, 852, 230, 12, { fill: "#2a1c14", opacity: 0.3 }) +
    poly([[352, 836], [772, 836], [772, 850], [352, 850]], { fill: "#9d8a66", ...k }) +
    poly(top, { fill: "#b9a57f" }) +
    poly(top, { fill: "url(#keys)" }) +
    poly(top, { fill: "none", ...k }) +
    path("M712,774C752,752 786,760 800,792", stroke(INK, 3))
  );
}

function plant(): string {
  const blade = (x: number, tipX: number, tipY: number, w: number, fill: string) =>
    path(`M${x - w},744C${x - w},${tipY + 160} ${tipX - 6},${tipY + 60} ${tipX},${tipY}C${tipX + 8},${tipY + 70} ${x + w},${tipY + 170} ${x + w},744Z`, { fill, ...inked(3.5) }) +
    path(`M${x + w * 0.4},734C${x + w * 0.4},${tipY + 170} ${tipX + 4},${tipY + 80} ${tipX + 2},${tipY + 20}`, stroke("#d8b34c", 3, 0.8));
  return (
    blade(84, 50, 500, 20, "#3f5b36") +
    blade(150, 196, 470, 22, "#58703a") +
    blade(118, 112, 420, 24, "#6a7f3c") +
    blade(70, 26, 560, 16, "#58703a") +
    blade(168, 236, 560, 16, "#3f5b36") +
    poly([[44, 732], [200, 732], [184, 858], [60, 858]], { fill: "#b9582c", ...inked(4) }) +
    poly([[150, 734], [200, 732], [184, 858], [154, 858]], { fill: "#e0874a", opacity: 0.55 }) +
    rect(34, 716, 176, 24, { rx: 5, fill: "#c9673a", ...inked(4) }) +
    rect(44, 742, 156, 116, { fill: "url(#ht)", opacity: 0.16 })
  );
}

function mug(): string {
  return (
    path("M830,726c26,-2 30,34 2,38", stroke(INK, 12)) +
    path("M830,726c26,-2 30,34 2,38", stroke("#2c7a73", 5)) +
    rect(776, 704, 58, 72, { rx: 9, fill: TEAL, ...inked(4) }) +
    rect(814, 708, 14, 64, { fill: "#8ed0c4", opacity: 0.55 }) +
    ellipse(805, 706, 29, 7, { fill: "#4a2c1d", ...inked(3) }) +
    path(smooth([[796, 690], [788, 668], [800, 650], [792, 628]]), stroke("#fff2d6", 5, 0.35))
  );
}

/** One printout lying on the desk, drawn flat, foreshortened onto the desk plane, with its title. */
function sheet(x: number, y: number, angle: number, title: string, accent: string): string {
  const rows = [0, 1, 2, 3].map((i) => line([-42, -132 + i * 20], [i === 3 ? 10 : 42, -132 + i * 20], stroke("#9aa3b8", 4)));
  return g(
    { transform: `translate(${x} ${y}) scale(1 0.62) rotate(${angle})` },
    rect(-62, -196, 124, 170, { rx: 3, fill: "#10152a", opacity: 0.25, transform: "translate(-6 8)" }),
    rect(-62, -196, 124, 170, { rx: 3, fill: CREAM, ...inked(3.5) }),
    g({ fill: "#d8ccb2" }, ...[0, 1, 2, 3, 4, 5, 6].map((i) => circle(-52, -182 + i * 24, 3.5)), ...[0, 1, 2, 3, 4, 5, 6].map((i) => circle(52, -182 + i * 24, 3.5))),
    rect(-42, -180, 84, 22, { rx: 2, fill: accent }),
    el("text", { x: 0, y: -163, "text-anchor": "middle", "font-family": "Courier New, monospace", "font-weight": 700, "font-size": 15, fill: INK }, title),
    ...rows,
  );
}

function printouts(): string {
  return sheet(866, 956, -10, "PRD", ORANGE) + sheet(962, 944, 5, "SCAN", STEEL) + sheet(1058, 958, -4, "COPY", MUSTARD) + sheet(1148, 946, 9, "PLAN", TEAL);
}

export function cubicleScene(): string {
  const defs = [
    sceneDefs(INK, "#ffdca0", 23, W, H),
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
    glow("sunGlow", "#ffc56e", SUN, 900, 0.46),
    glow("sunBurn", "#fff4d0", SUN, 150, 0.95),
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
    radial("glassGlow", [
      [0, "#243056"],
      [1, "#141a33"],
    ], 0.45, 0.4, 0.7),
    linear("deskTop", [
      [0, "#cfae7c"],
      [0.5, "#b08e62"],
      [1, "#8d6c48"],
    ]),
    el("pattern", { id: "keys", width: 21, height: 16, patternUnits: "userSpaceOnUse", x: 392, y: 774 }, rect(2, 2, 17, 12, { rx: 2, fill: "#efe2c3" })),
    el("clipPath", { id: "cDesk" }, rect(0, 700, W, 188)),
  ];
  const body = [room(), clock(), cards(), desk(), monitor(), keyboard(), plant(), mug(), printouts(), sceneFinish(W, H, 0.2, 0.8)].join("");
  return sceneSvg(W, H, defs.join(""), body);
}

export const cubicleJournalAssets: Asset[] = [{ file: "hero-office.svg", svg: cubicleScene() }];
