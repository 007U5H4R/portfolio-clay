/**
 * Paper-cut landscape geometry for the /card front (TASK-146.2, Dev-185). Every layer is a polygon
 * in card units (420 x 680, origin top-left); `roughen` adds the small deterministic wobble of a
 * hand-cut edge so two layers never share an identical line. Pure and seeded — the server and the
 * client render the same path, and tests can pin it.
 */
export const CARD_W = 420;
export const CARD_H = 680;
/** Layers overshoot the card by this much per side so parallax never exposes a gap (§62). */
export const BLEED = 20;

export type Pt = readonly [number, number];

/** Small deterministic PRNG (mulberry32) in [0, 1). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Subdivide each segment and jitter the interior points: imperfect cut edges. */
export function roughen(points: readonly Pt[], seed: number, jitter = 1.6, step = 14): Pt[] {
  const r = rng(seed);
  const out: Pt[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i]!;
    const [x1, y1] = points[i + 1]!;
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const j = k === 0 ? 0 : (r() - 0.5) * 2 * jitter;
      out.push([x0 + (x1 - x0) * t + j * 0.4, y0 + (y1 - y0) * t + j]);
    }
  }
  out.push(points[points.length - 1]!);
  return out;
}

const f = (n: number) => Math.round(n * 10) / 10;

/** Polygon path in layer space (card units shifted by BLEED so the layer box starts at -BLEED). */
export function polyPath(points: readonly Pt[]): string {
  return points.map(([x, y], i) => `${i ? "L" : "M"}${f(x + BLEED)} ${f(y + BLEED)}`).join("") + "Z";
}

/** A ridge line closed down to `bottom` across the full bleed width. */
function ridge(line: readonly Pt[], bottom: number, seed: number, jitter?: number): string {
  const rough = roughen(line, seed, jitter);
  const first = rough[0]!;
  const last = rough[rough.length - 1]!;
  return polyPath([...rough, [last[0], bottom], [first[0], bottom]]);
}

/** A little cut-paper pine: stacked triangles, base centred on (x, y), height h. */
export function pine(x: number, y: number, h: number): Pt[] {
  const w = h * 0.34;
  return [
    [x, y - h],
    [x + w * 0.55, y - h * 0.62],
    [x + w * 0.28, y - h * 0.62],
    [x + w * 0.8, y - h * 0.3],
    [x + w * 0.4, y - h * 0.3],
    [x + w, y],
    [x - w, y],
    [x - w * 0.4, y - h * 0.3],
    [x - w * 0.8, y - h * 0.3],
    [x - w * 0.28, y - h * 0.62],
    [x - w * 0.55, y - h * 0.62],
  ];
}

export interface Layer {
  id: string;
  /** Spec section 45 z value (starting points, tuned); drives each layer's shadow size. */
  z: number;
  /** Spec section 49 parallax multiplier. */
  k: number;
  d: string;
}

const PINES: Array<[number, number, number]> = [
  [24, 500, 44], [46, 492, 56], [70, 488, 40], [92, 498, 50], [114, 504, 36],
  [136, 514, 44], [158, 526, 34], [180, 538, 30], [34, 530, 40], [62, 524, 46],
];

function treeCluster(): string {
  return PINES.map(([x, y, h]) => polyPath(pine(x, y, h))).join("");
}

export function landscapeLayers(): Layer[] {
  return [
    {
      id: "far",
      z: 12,
      k: 1,
      d: ridge(
        [[-20, 392], [30, 368], [78, 376], [122, 398], [180, 424], [232, 376], [286, 346], [336, 330], [384, 322], [440, 352]],
        560,
        11,
      ),
    },
    {
      id: "peak",
      z: 20,
      k: 2,
      d: ridge(
        [[-20, 410], [40, 380], [96, 352], [136, 328], [168, 308], [190, 298], [214, 320], [250, 352], [300, 388], [360, 424], [440, 446]],
        610,
        23,
      ),
    },
    {
      id: "mid",
      z: 28,
      k: 2.5,
      d: ridge(
        [[-20, 452], [48, 428], [110, 414], [170, 424], [232, 448], [296, 474], [352, 492], [440, 498]],
        640,
        37,
      ),
    },
    {
      id: "shore",
      z: 32,
      k: 2.8,
      d: ridge([[300, 494], [346, 480], [402, 472], [440, 474]], 520, 41, 1.1),
    },
    {
      id: "water",
      z: 44,
      k: 3.5,
      d: ridge([[-20, 492], [120, 490], [260, 492], [440, 490]], 720, 53, 0.9),
    },
    {
      id: "land",
      z: 36,
      k: 3,
      d:
        polyPath(
          roughen(
            [[-20, 478], [34, 470], [86, 486], [130, 506], [176, 528], [220, 552], [262, 574], [300, 592], [262, 602], [200, 618], [140, 640], [84, 660], [30, 670], [-20, 674], [-20, 478]],
            67,
            1.8,
          ),
        ) + treeCluster(),
    },
    {
      id: "ripples",
      z: 60,
      k: 4.5,
      d: [
        [150, 668, 74, 5],
        [236, 650, 96, 5],
        [262, 634, 60, 4],
        [302, 662, 82, 5],
        [330, 604, 56, 4],
      ]
        .map(([x, y, w, h]) => polyPath([[x!, y!], [x! + w!, y! - 1], [x! + w! - 6, y! + h!], [x! + 5, y! + h!]]))
        .join(""),
    },
  ];
}

/** The back's low landscape edge (decoration along the bottom, §56). */
export function backEdgeLayers(): Layer[] {
  return [
    { id: "back-far", z: 8, k: 1, d: ridge([[-20, 616], [70, 598], [140, 612], [220, 592], [300, 606], [380, 590], [440, 604]], 720, 71) },
    { id: "back-near", z: 16, k: 2, d: ridge([[-20, 646], [60, 632], [150, 648], [240, 630], [330, 646], [440, 634]], 720, 83) },
  ];
}

/**
 * Panther Origami (TASK-180): the restrained folded-paper corner accents, same card units and the
 * same BLEED overshoot as the layers above. The front carries a top-right and a bottom-right fold plus
 * the back carries a top-left and a bottom-right fold. Each is an independent sheet.
 */
export function foldLayers(side: "front" | "back"): Layer[] {
  const p = (pts: Pt[]) => polyPath(pts);
  if (side === "front") {
    return [
      { id: "fold-tr-navy", z: 30, k: 5, d: p([[300, -20], [440, -20], [440, 176], [408, 100], [356, 46]]) },
      { id: "fold-tr-kraft", z: 26, k: 5, d: p([[236, -20], [300, -20], [356, 46], [326, 50]]) },
      { id: "fold-tr-ivory", z: 36, k: 5, d: p([[366, -20], [440, -20], [440, 58], [404, 24]]) },
      { id: "fold-br-navy", z: 30, k: 5, d: p([[440, 566], [440, 700], [304, 700]]) },
      { id: "fold-br-kraft", z: 36, k: 5, d: p([[440, 548], [440, 590], [372, 700], [352, 700]]) },
    ];
  }
  return [
    { id: "fold-tl-kraft", z: 26, k: 5, d: p([[-20, -20], [138, -20], [-20, 156]]) },
    { id: "fold-tl-navy", z: 32, k: 5, d: p([[-20, -20], [76, -20], [-20, 100]]) },
    { id: "fold-br-navy", z: 30, k: 5, d: p([[440, 560], [440, 700], [296, 700]]) },
    { id: "fold-br-kraft", z: 36, k: 5, d: p([[440, 536], [440, 580], [370, 700], [350, 700]]) },
  ];
}
