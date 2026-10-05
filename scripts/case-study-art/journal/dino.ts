import { circle, el, ellipse, g, glow, line, linear, path, poly, rect, type P } from "../../portfolio-art/kit";
import { ringText, type Asset } from "../kit";
import { sceneDefs, sceneFinish, sceneSvg } from "../scene-kit";

/**
 * TASK-130 journal · Dino Arcade hero scene (Tushar's redesign brief §23): a retro arcade poster on a
 * desert road-trip postcard. A striped sunset, mesas and a road to the horizon; a phone dressed as a
 * backlit cabinet (the page lays the REAL captured cabinet screen into its screen opening); a lit
 * marquee with the app's own name (never the licensed game's); a control panel echoing the on-screen
 * joystick and buttons; coins; "your file" sliding in; a works-offline postmark. The pixel dinosaur is
 * a generic sauropod (no trademarked characters). Decorative: aria-hidden, alt="".
 *
 * Screen opening (must match journal.css .jx-dn-screen): x 280 · y 492 · 640 × 270.
 */
const W = 1200;
const H = 960;
const S = { x: 280, y: 492, w: 640, h: 270 } as const;

const INK = "#1b1a2c";
const CHAR = "#1d2030";
const TEAL = "#2f8f8a";
const ORANGE = "#e4672d";
const SUNSET = "#c2463a";
const CREAM = "#fbf1dc";
const GOLD = "#f2b544";

const inked = (w = 4) => ({ stroke: INK, "stroke-width": w, "stroke-linejoin": "round", "stroke-linecap": "round" }) as const;
const stroke = (color: string, width: number, opacity?: number) =>
  ({ fill: "none", stroke: color, "stroke-width": width, "stroke-linecap": "round", "stroke-linejoin": "round", opacity }) as const;

function sky(): string {
  const bands = [
    [0, 110, "#1d2447"],
    [110, 196, "#352a5a"],
    [196, 268, "#6a2f58"],
    [268, 330, "#a83a48"],
    [330, 388, "#d45535"],
    [388, 446, "#ea7c32"],
    [446, 600, "#f3a53f"],
  ] as const;
  const out = bands.map(([y0, y1, fill]) => rect(0, y0, W, y1 - y0 + 1, { fill }));
  // thin poster gaps between the bands
  out.push(g({ fill: "#fbe6c4", opacity: 0.18 }, ...bands.slice(1).map(([y0]) => rect(0, y0 - 2, W, 3))));
  // stars in the dark band
  out.push(g({ fill: "#fbe6c4", opacity: 0.75 }, ...([[80, 40, 2.5], [240, 70, 2], [410, 30, 2.5], [690, 56, 2], [820, 24, 2.5], [980, 84, 2]] as const).map(([x, y, r]) => circle(x, y, r))));
  // the striped retro sun, sliced as it sinks behind the horizon
  const slices: string[] = [];
  for (let i = 0; i < 7; i++) slices.push(rect(360, 470 + i * 20 + i * i * 1.2, 480, 6 + i * 1.6, { fill: "#f3a53f" }));
  out.push(g({ "clip-path": "url(#cSky)" }, circle(600, 590, 230, { fill: "url(#sunFill)" }), ...slices));
  out.push(circle(600, 590, 420, { fill: "url(#sunHalo)", "clip-path": "url(#cSky)" }));
  return out.join("");
}

function desert(): string {
  const out: string[] = [];
  // mesas
  out.push(path("M-10,600V512L40,498 70,470H330L352,500 404,520 420,600Z", { fill: "#9a3d2a", ...inked(3) }));
  out.push(path("M70,470H330L340,486H80Z", { fill: "#c9573b" }));
  out.push(path("M770,600V520L792,506 836,452H1090L1116,486 1140,500 1210,512V600Z", { fill: "#86362a", ...inked(3) }));
  out.push(path("M836,452H1090L1100,468H846Z", { fill: "#b8503a" }));
  out.push(path("M560,600V568L586,552H660L680,570V600Z", { fill: "#7b3128", ...inked(3) }));
  // desert floor and the road to the horizon
  out.push(rect(0, 596, W, H - 596, { fill: "url(#sand)" }));
  out.push(poly([[560, 598], [640, 598], [930, H], [270, H]], { fill: "#4a3a44" }));
  out.push(poly([[560, 598], [640, 598], [930, H], [270, H]], { fill: "url(#hs)", opacity: 0.18 }));
  out.push(g({ fill: "#f6d27a" }, ...[0, 1, 2, 3, 4].map((i) => {
    const t = i / 5;
    const y = 610 + t * t * 360 + i * 12;
    const w = 4 + t * 16;
    return poly([[600 - w / 2, y], [600 + w / 2, y], [600 + w * 0.7, y + 18 + t * 40], [600 - w * 0.7, y + 18 + t * 40]]);
  })));
  // scrub and rocks
  out.push(g({ fill: "#7a4a2e", opacity: 0.55 }, ellipse(150, 700, 60, 8), ellipse(1030, 720, 70, 9), ellipse(420, 660, 34, 5), ellipse(840, 650, 40, 6)));
  return out.join("");
}

function cactus(x: number, base: number, h: number, flip = false): string {
  const s = flip ? -1 : 1;
  const trunk = rect(x - 16, base - h, 32, h, { rx: 16, fill: "#2b2238", ...inked(3) });
  const armL = path(`M${x - 16 * s},${base - h * 0.45}H${x - 44 * s}a14,14 0 0 1 -14,-14V${base - h * 0.78}`, { fill: "none", stroke: "#2b2238", "stroke-width": 26, "stroke-linecap": "round", "stroke-linejoin": "round" });
  const armR = path(`M${x + 16 * s},${base - h * 0.6}H${x + 40 * s}a14,14 0 0 0 14,-14V${base - h * 0.88}`, { fill: "none", stroke: "#2b2238", "stroke-width": 24, "stroke-linecap": "round", "stroke-linejoin": "round" });
  return armL + armR + trunk + line([x - 4, base - h + 20], [x - 4, base - 10], stroke("#4b3d5c", 3));
}

function sauropod(x: number, y: number): string {
  // a generic long-neck pixel dinosaur, 8 px cells
  const cells: Array<[number, number]> = [
    [7, 0], [8, 0], [7, 1], [8, 1], [9, 1], [6, 2], [7, 2], [6, 3], [5, 4], [6, 4], [4, 5], [5, 5],
    [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7],
    [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [1, 9], [2, 9], [5, 9], [6, 9], [1, 10], [5, 10], [-1, 8], [-2, 9], [-3, 9],
  ];
  return g({ fill: "#1d2447" }, ...cells.map(([cx, cy]) => rect(x + cx * 8, y + cy * 8, 8, 8)));
}

function cabinet(): string {
  const out: string[] = [];
  // glow behind the phone
  out.push(ellipse(600, 628, 470, 200, { fill: "url(#cabGlow)" }));
  // marquee on its posts
  out.push(rect(452, 450, 12, 22, { fill: "#2c2f44", ...inked(3) }) + rect(736, 450, 12, 22, { fill: "#2c2f44", ...inked(3) }));
  out.push(rect(396, 384, 408, 68, { rx: 14, fill: "url(#marquee)", ...inked(4) }));
  out.push(g({ fill: "#fff3cf", opacity: 0.55 }, ...[0, 1, 2, 3, 4, 5].map((i) => rect(410 + i * 66, 391, 32, 5, { rx: 2.5 }))));
  out.push(el("text", { x: 600, y: 434, "text-anchor": "middle", "font-family": "Courier New, monospace", "font-weight": 700, "font-size": 38, "letter-spacing": 5, fill: INK }, "DINO ARCADE"));
  // the phone, landscape, dressed as a cabinet
  out.push(rect(230, 468, 740, 318, { rx: 44, fill: "#0f1019", opacity: 0.35, transform: "translate(9 12)" }));
  out.push(rect(230, 468, 740, 318, { rx: 44, fill: CHAR, ...inked(5) }));
  out.push(rect(239, 477, 722, 300, { rx: 37, fill: "none", stroke: TEAL, "stroke-width": 5 }));
  // recessed bezel well around the screen (the opening itself stays empty)
  out.push(rect(S.x - 16, S.y - 14, S.w + 32, S.h + 28, { rx: 20, fill: "#0b0c14", ...inked(3) }));
  // camera at the left end, side buttons on top
  out.push(rect(246, 596, 12, 62, { rx: 6, fill: "#0b0c14" }) + circle(252, 627, 4, { fill: "#2c3a55" }));
  out.push(rect(470, 458, 70, 10, { rx: 4, fill: "#34384f", ...inked(2) }) + rect(556, 458, 46, 10, { rx: 4, fill: "#34384f", ...inked(2) }));
  // control panel under the phone: joystick + three buttons
  out.push(path("M352,786H848L884,852H316Z", { fill: "#2c2f44", ...inked(4) }));
  out.push(path("M352,786H848L855,798H345Z", { fill: "#474b66" }));
  out.push(ellipse(430, 826, 38, 10, { fill: "#16182a" }) + line([430, 826], [420, 792], stroke(INK, 9)) + circle(418, 786, 17, { fill: SUNSET, ...inked(3) }) + circle(412, 781, 5, { fill: "#ffb39d" }));
  out.push(g({}, ...([[664, ORANGE], [724, TEAL], [784, GOLD]] as const).map(([x, fill]) => ellipse(x, 826, 22, 12, { fill: "#16182a" }) + ellipse(x, 820, 20, 11, { fill, ...inked(3) }) + ellipse(x - 5, 816, 7, 3.5, { fill: "#fff3e0", opacity: 0.6 }))));
  return out.join("");
}

function coins(): string {
  const coin = (x: number, y: number, r: number, tilt = 0) =>
    g(
      { transform: `rotate(${tilt} ${x} ${y})` },
      ellipse(x, y + 6, r, r * 0.34, { fill: "#8a5a17", ...inked(3) }),
      ellipse(x, y, r, r * 0.34, { fill: GOLD, ...inked(3) }),
      ellipse(x, y, r * 0.66, r * 0.2, { fill: "none", stroke: "#b77d1f", "stroke-width": 3 }),
    );
  const standing =
    circle(236, 842, 38, { fill: GOLD, ...inked(4) }) +
    circle(236, 842, 26, { fill: "none", stroke: "#b77d1f", "stroke-width": 4 }) +
    el("text", { x: 236, y: 856, "text-anchor": "middle", "font-family": "Courier New, monospace", "font-weight": 700, "font-size": 36, fill: "#8a5a17" }, "¢") +
    path("M216,816Q226,808 240,810", stroke("#fff4cc", 4, 0.8));
  return coin(130, 900, 44, -4) + coin(170, 872, 40, 6) + standing;
}

function fileCard(): string {
  return g(
    { transform: "rotate(-12 990 862)" },
    rect(906, 800, 170, 120, { rx: 8, fill: "#0f1019", opacity: 0.3, transform: "translate(8 10)" }),
    rect(906, 800, 170, 120, { rx: 8, fill: "#c9ccd6", ...inked(4) }),
    rect(1034, 800, 42, 34, { fill: "#9aa0b2", ...inked(3) }),
    rect(926, 848, 130, 52, { rx: 4, fill: CREAM, ...inked(3) }),
    el("text", { x: 991, y: 882, "text-anchor": "middle", "font-family": "Courier New, monospace", "font-weight": 700, "font-size": 21, fill: INK }, "YOUR FILE"),
    g(stroke("#6b7087", 4), line([930, 814], [930, 836]), line([946, 814], [946, 836]), line([962, 814], [962, 836]), line([978, 814], [978, 836])),
  );
}

function postmark(): string {
  const [cx, cy] = [950, 128] as const;
  const waves = [0, 1, 2, 3].map((i) => path(`M${cx - 190},${cy - 30 + i * 20}q24,-12 48,0t48,0t48,0t48,0`, stroke("#fbe6c4", 3.5, 0.75)));
  return (
    g({}, ...waves) +
    circle(cx, cy, 74, { fill: "none", stroke: "#fbe6c4", "stroke-width": 4, opacity: 0.85 }) +
    circle(cx, cy, 56, { fill: "none", stroke: "#fbe6c4", "stroke-width": 2, opacity: 0.85 }) +
    ringText("pm", cx, cy, 64, "WORKS OFFLINE · NO SERVER · WORKS OFFLINE ·", `font-family="Courier New, monospace" font-weight="700" font-size="15" letter-spacing="1.5" fill="#fbe6c4" opacity="0.9"`) +
    // a cloud with a slash: offline
    path(`M${cx - 26},${cy + 12}h44a14,14 0 0 0 0,-28a20,20 0 0 0 -38,-4a13,13 0 0 0 -6,32Z`, { fill: "none", stroke: "#fbe6c4", "stroke-width": 4, "stroke-linejoin": "round" }) +
    line([cx - 30, cy + 26], [cx + 30, cy - 34], stroke("#fbe6c4", 4))
  );
}

function postcardEdge(): string {
  // the card's cream border
  return path(`M0,0H${W}V${H}H0Z M22,22V${H - 22}H${W - 22}V22Z`, { fill: CREAM, "fill-rule": "evenodd" }) + rect(22, 22, W - 44, H - 44, { fill: "none", stroke: INK, "stroke-width": 3 });
}

export function dinoScene(): string {
  const sunCenter: P = [600, 590];
  const defs = [
    sceneDefs(INK, "#ffe2a8", 17, W, H),
    linear("sunFill", [
      [0, "#fde08a"],
      [0.6, "#f6b24a"],
      [1, "#ec7a33"],
    ]),
    glow("sunHalo", "#ffd27a", sunCenter, 420, 0.4),
    glow("cabGlow", "#ffb36b", [600, 628], 470, 0.42),
    linear("sand", [
      [0, "#e19a5a"],
      [0.5, "#cf7d45"],
      [1, "#a95a35"],
    ]),
    linear("marquee", [
      [0, "#ffe79a"],
      [0.55, "#f7b64c"],
      [1, "#e98a32"],
    ]),
    el("clipPath", { id: "cSky" }, rect(0, 0, W, 600)),
  ];
  const body = [sky(), desert(), sauropod(150, 390), cactus(92, 900, 250), cactus(1110, 880, 220, true), cabinet(), coins(), fileCard(), postmark(), sceneFinish(W, H, 0.2, 0.7), postcardEdge()].join("");
  return sceneSvg(W, H, defs.join(""), body);
}

export const dinoJournalAssets: Asset[] = [{ file: "hero-postcard.svg", svg: dinoScene() }];
