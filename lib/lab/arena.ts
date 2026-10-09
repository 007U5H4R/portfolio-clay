import { flipperLayouts, type FlipperLayout } from "./flippers";

/**
 * The arena layout (gummy-bear.md §15, §29, §33): a side-on, one-screen play field in the z = 0
 * plane. Pure data, built for a given half-width so portrait phones get a narrower, taller room
 * (the bear stays big under the thumb) and tablets/phones a simplified one (§38). Units: the bear is
 * 1 unit tall. `minPhase` gates parts that arrive with the difficulty ramp (§20).
 */
export type TargetName = "AI" | "PRODUCT" | "DESIGN" | "BUILD";

export interface PlatformSpec {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Tilt in radians (positive = rising to the right). Every surface is sloped so a gummy never rests on one (pinball). */
  angle?: number;
  /** Horizontal travel (units) once the arena starts moving (phase ≥ 1). */
  slide?: { amp: number; speed: number; phase: number };
  /** Blinks out of existence from phase 2 (a "disappearing platform"); period in seconds. */
  vanishes?: { period: number; offset: number };
  minPhase: number;
}
export interface PadSpec {
  id: string;
  x: number;
  y: number;
  w: number;
  kind: "spring" | "launch";
  /** Tilt in radians; the pad sits on a sloped platform and launches relative to it. */
  angle?: number;
  /** Launch direction (unit-ish) and speed (u/s). */
  dir: { x: number; y: number };
  speed: number;
}
export interface BumperSpec {
  id: string;
  x: number;
  y: number;
  r: number;
  /** A spinning bar instead of a dome (arrives with phase 1). */
  spin?: { len: number; speed: number };
  minPhase: number;
}
export interface TargetSpec {
  id: TargetName;
  x: number;
  y: number;
  /** Half-extents of the mounted plate (u) and its tilt (radians, CCW). The plate is the collider. */
  hw: number;
  hh: number;
  angle: number;
  /** Radius of the circle that encloses the plate (kept for spawn/overlap checks). */
  r: number;
}
/** A classic triangular slingshot above a flipper (TASK-185, spec §20): `base` sits on the in-lane guide, `face` is the kicking edge. */
export interface SlingSpec {
  id: string;
  side: "left" | "right";
  /** Triangle corners: base start (at the wall), base end (toward the flipper), apex (above the base start). */
  pts: [Anchor, Anchor, Anchor];
  /** Unit normal of the kicking face (pointing out into the table) and the face's midpoint. */
  normal: Anchor;
  mid: Anchor;
}
/** A fixed paper rail / deflector: a thick segment (the lane's top bend, the arch). */
export interface RailSpec {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thick: number;
}
/** The right-hand launch lane (spec §13): the gummy starts on the plunger and is shot up to the lane's top bend. */
export interface LaneSpec {
  /** Inner (divider side) and outer wall faces. */
  xIn: number;
  xOut: number;
  /** Lane centre line, where the gummy sits. */
  x: number;
  /** Top of the divider wall that separates the lane from the table. */
  dividerTop: number;
  /** World y of the plunger cap's top at rest (the gummy's feet sit here) and how far it retracts. */
  restY: number;
  travel: number;
  /** The arch that turns a shot over the divider: centre and inner radius of its quarter circle. */
  arch: { cx: number; cy: number; r: number };
}
/** A fixed rail: the in-lane slope that carries the gummy from the wall down to a flipper. */
export interface GuideSpec {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
export interface Anchor {
  x: number;
  y: number;
}
export interface ArenaSpec {
  halfW: number;
  floorY: number;
  ceilingY: number;
  /** World y of the danger line at rest (the liquid's surface). */
  dangerTop: number;
  spawn: Anchor;
  introPos: Anchor;
  platforms: PlatformSpec[];
  guides: GuideSpec[];
  /** Left and right flippers either side of the drain. */
  flippers: [FlipperLayout, FlipperLayout];
  slings: SlingSpec[];
  rails: RailSpec[];
  lane: LaneSpec;
  /** Centre of the drain's mouth between the flipper tips. */
  drain: Anchor;
  /** Horizontal extent of the whole machine (table + lane + cabinet) and its centre, for the camera. */
  minX: number;
  maxX: number;
  cx: number;
  /** Width of the cabinet's right-hand panel (the power meter), and the world y of the cabinet's top and bottom edges. */
  panel: number;
  topY: number;
  bottomY: number;
  pads: PadSpec[];
  bumpers: BumperSpec[];
  targets: TargetSpec[];
  portal: { x: number; y: number; r: number };
  anchors: Anchor[];
}

export const FLOOR_Y = -5;
export const CEILING_Y = 6.3;
export const DANGER_TOP_REST = -4.5;

/** World y of the flipper pivots; resting tips stay above the danger line so a gummy on a flipper is never "in the drain". */
export const FLIPPER_PIVOT_Y = -3.3;
const GUIDE_SLOPE = Math.tan(0.5);

export function portraitHalfWidth(aspect: number): number {
  return aspect < 0.9 ? 2.7 : 5;
}

export function buildArena(halfW: number, simplified = false): ArenaSpec {
  const hw = halfW;
  const wide = hw > 4;
  const fx = (f: number) => f * hw;
  const flip = flipperLayouts(hw, FLIPPER_PIVOT_Y);
  const px = Math.abs(flip.left.pivot.x);
  const guideTop = Math.min(-1.7, FLIPPER_PIVOT_Y + (hw - px) * GUIDE_SLOPE);
  const guides: GuideSpec[] = [
    { id: "GL", x1: -hw, y1: guideTop, x2: -px - 0.12, y2: FLIPPER_PIVOT_Y + 0.08 },
    { id: "GR", x1: hw, y1: guideTop, x2: px + 0.12, y2: FLIPPER_PIVOT_Y + 0.08 },
  ];

  // Two tilted ramps (kept from the old shelves, TASK-168): every platform is sloped so the gummy rolls on instead of stalling.
  const platforms: PlatformSpec[] = [
    // Out near the walls, above the slingshots: a shot from a flipper (which drifts a little outward) clears them.
    { id: "S2", x: fx(wide ? 0.68 : 0.62), y: -0.45, w: wide ? 1.5 : 1.2, h: 0.3, angle: 0.22, minPhase: 0 },
    { id: "M2", x: fx(wide ? -0.68 : -0.62), y: -0.35, w: wide ? 1.5 : 1.2, h: 0.3, angle: -0.24, slide: { amp: fx(0.06), speed: 0.7, phase: 1.6 }, minPhase: 0 },
  ];
  const s2 = platforms[0]!;
  const padAlong = 0.5;
  const padAngle = s2.angle ?? 0;
  const pads: PadSpec[] = [
    {
      id: "PB",
      x: s2.x + Math.cos(padAngle) * padAlong - Math.sin(padAngle) * (s2.h / 2 + 0.02),
      y: s2.y + Math.sin(padAngle) * padAlong + Math.cos(padAngle) * (s2.h / 2 + 0.02),
      w: 0.9,
      kind: "spring",
      angle: padAngle,
      dir: { x: -0.25, y: 1 },
      speed: 13.5,
    },
  ];

  // Bumpers (spec §18): a diamond of three or four big circles in the middle of the table, plus the spinner from phase 1.
  const br = wide ? 0.58 : 0.5;
  const bumpers: BumperSpec[] = wide
    ? [
        { id: "B1", x: 0, y: 3.95, r: br, minPhase: 0 },
        { id: "B2", x: -2.0, y: 2.55, r: br, minPhase: 0 },
        { id: "B3", x: 2.0, y: 2.55, r: br, minPhase: 0 },
        { id: "B4", x: 0, y: 1.25, r: br, minPhase: 0 },
        { id: "RB", x: 0, y: 5.35, r: 0.3, spin: { len: 1.5, speed: 1.6 }, minPhase: 1 },
      ]
    : [
        { id: "B1", x: 0, y: 3.9, r: br, minPhase: 0 },
        { id: "B2", x: -1.15, y: 2.4, r: br, minPhase: 0 },
        { id: "B3", x: 1.15, y: 2.4, r: br, minPhase: 0 },
        { id: "RB", x: 0, y: 5.35, r: 0.3, spin: { len: 1.2, speed: 1.6 }, minPhase: 1 },
      ];

  // Targets (spec §19): four mounted plates, two a side, tilted into the table. Tests and tools read x/y.
  const tw = wide ? 0.78 : 0.62;
  const th = wide ? 0.37 : 0.31;
  const tx = hw - (wide ? 0.98 : 0.78);
  const mk = (id: TargetName, side: -1 | 1, y: number): TargetSpec => ({ id, x: side * tx, y, hw: tw, hh: th, angle: -side * 0.55, r: Math.hypot(tw, th) });
  const targets: TargetSpec[] = wide ? [mk("AI", -1, 4.0), mk("DESIGN", -1, 2.1), mk("PRODUCT", 1, 3.7), mk("BUILD", 1, 1.8)] : [mk("AI", -1, 3.7), mk("DESIGN", -1, 1.75), mk("PRODUCT", 1, 3.45), mk("BUILD", 1, 1.5)];

  // Slingshots (spec §20): right-angle triangles standing on the in-lane guides, the long edge facing the table.
  const slings: SlingSpec[] = (["left", "right"] as const).map((side) => {
    const sgn = side === "left" ? -1 : 1;
    const g = guides[side === "left" ? 0 : 1]!;
    const gl = Math.hypot(g.x2 - g.x1, g.y2 - g.y1);
    const d = { x: (g.x2 - g.x1) / gl, y: (g.y2 - g.y1) / gl };
    const up = { x: -d.y * (side === "left" ? 1 : -1), y: d.x * (side === "left" ? 1 : -1) };
    const at = (t: number, off: number) => ({ x: g.x1 + d.x * gl * t + up.x * off, y: g.y1 + d.y * gl * t + up.y * off });
    const a = at(0.03, 0.42);
    const b = at(wide ? 0.7 : 0.66, 0.42);
    const apex = { x: a.x, y: a.y + (wide ? 1.55 : 1.3) };
    // Face = apex → b. Its normal points into the table (toward x = 0 and up).
    const fx2 = b.x - apex.x;
    const fy2 = b.y - apex.y;
    const fl = Math.hypot(fx2, fy2);
    let n = { x: fy2 / fl, y: -fx2 / fl };
    if (n.x * sgn > 0) n = { x: -n.x, y: -n.y };
    if (n.y < 0) n = { x: -n.x, y: -n.y };
    return { id: side === "left" ? "SL" : "SR", side, pts: [a, b, apex], normal: n, mid: { x: (apex.x + b.x) / 2, y: (apex.y + b.y) / 2 } };
  });

  // The launch lane (spec §13): a divider along the table's right wall, the lane beside it, and a quarter-circle arch at the
  // top that carries the shot over the divider and into the table (the way a real machine's lane does). The cap's rest
  // height keeps the gummy's feet above the danger line.
  const ARCH_R = 3.0;
  const ARCH_THICK = 0.3;
  const xOut = hw + 1.36;
  const archCx = xOut - ARCH_R;
  const archCy = CEILING_Y - 0.1 - ARCH_R;
  const lane: LaneSpec = {
    xIn: hw + 0.22,
    xOut,
    x: hw + 0.79,
    dividerTop: archCy - 0.7,
    restY: -4.0,
    travel: 0.55,
    arch: { cx: archCx, cy: archCy, r: ARCH_R },
  };
  const panel = wide ? 1.8 : 1.3;
  const rails: RailSpec[] = [];
  const ARCH_SEGS = 6;
  const rc = ARCH_R + ARCH_THICK / 2;
  for (let i = 0; i < ARCH_SEGS; i += 1) {
    const a0 = (i / ARCH_SEGS) * (Math.PI / 2);
    const a1 = ((i + 1) / ARCH_SEGS) * (Math.PI / 2);
    // Slightly longer than the chord so neighbours overlap (no crack a gummy can find).
    rails.push({ id: `ARCH-${i}`, x1: archCx + rc * Math.cos(a0), y1: archCy + rc * Math.sin(a0), x2: archCx + rc * Math.cos(a1), y2: archCy + rc * Math.sin(a1), thick: ARCH_THICK });
  }
  // A low wedge on the divider's top: anything that lands on it rolls toward the table, nothing balances there.
  rails.push({ id: "DIV-CAP", x1: lane.xIn - 0.1, y1: lane.dividerTop + 0.2, x2: hw - 0.6, y2: lane.dividerTop - 0.05, thick: 0.16 });
  // The top-left corner is cut off by a 45° deflector so a hard shot across the top is turned back down into the table.
  rails.push({ id: "CORNER-L", x1: -hw, y1: CEILING_Y - 1.7, x2: -hw + 1.7, y2: CEILING_Y - 0.12, thick: 0.3 });

  // Collectible anchors: open space between the bumpers, ramps and targets (never in the lane, below the shelves or under a rail).
  const anchors: Anchor[] = wide
    ? [
        { x: -1.0, y: 3.3 },
        { x: 1.0, y: 3.3 },
        { x: 0, y: 2.55 },
        { x: -2.9, y: 4.6 },
        { x: 2.9, y: 5.0 },
        { x: -2.9, y: 0.95 },
        { x: 2.9, y: 0.95 },
        { x: -1.3, y: 0.3 },
        { x: 1.3, y: 0.3 },
        { x: 0, y: -0.6 },
        { x: -1.4, y: 5.0 },
      ]
    : [
        { x: 0, y: 2.5 },
        { x: -0.9, y: 0.45 },
        { x: 0.9, y: 0.45 },
        { x: 0, y: 1.2 },
        { x: -1.0, y: 4.8 },
        { x: 1.0, y: 4.8 },
        { x: 0, y: -0.6 },
      ];
  return {
    halfW: hw,
    floorY: FLOOR_Y,
    ceilingY: CEILING_Y,
    dangerTop: DANGER_TOP_REST,
    spawn: { x: lane.x, y: lane.restY + 0.02 },
    introPos: { x: 0, y: -1.9 },
    platforms: simplified ? platforms.filter((p) => p.id !== "S4") : platforms,
    guides,
    flippers: [flip.left, flip.right],
    slings,
    rails,
    lane,
    drain: { x: 0, y: -4.45 },
    minX: -hw - 1.45,
    maxX: lane.xOut + panel + 0.2,
    cx: (lane.xOut + panel + 0.2 - hw - 1.45) / 2,
    panel,
    topY: CEILING_Y + 1.25,
    bottomY: -6.55,
    pads,
    bumpers: simplified ? bumpers.filter((b) => !b.spin) : bumpers,
    targets,
    portal: { x: -hw - 0.2, y: CEILING_Y + 0.1, r: 0.72 },
    anchors,
  };
}
