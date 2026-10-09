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
  /**
   * The black hole (TASK-185 follow-up): a pocket cut into the cabinet's left wall. `x`/`y`/`r` place the drawn hole; `y0`/`y1` are
   * the opening's lower and upper edge on the wall (the gummy is 0.9 tall, so the gap is a shot to line up); `depth` is how far the
   * pocket reaches into the cabinet. A sensor in the pocket sends the gummy to the portfolio.
   */
  portal: { x: number; y: number; r: number; y0: number; y1: number; depth: number };
  /** The one-way gate on the shooter lane's open side: a thin vertical panel from (x1, y1) up to (x2, y2) that stands only once the gummy has left the lane. */
  gate: { x1: number; y1: number; x2: number; y2: number; thick: number };
  anchors: Anchor[];
}

/** A box collider of the cabinet shell (centre + half extents, z is always ±1.5). `sensor` boxes only report a touch. */
export interface WallBox {
  id: string;
  cx: number;
  cy: number;
  hx: number;
  hy: number;
  restitution: number;
  friction: number;
}

/**
 * The black-hole opening's lower edge and height (u), tuned per layout with the headless Rapier scan in
 * tests/unit/lab-portal-sim.test.ts. The gummy's hull is 0.98 tall, so 1.3-1.4 leaves a little play. The opening is a skill shot:
 * on the wide table only a launch within a few percent of full power (arriving down the top) lines up with it; on the
 * narrow phone table the same shot arrives higher, so the opening sits under the ceiling.
 */
const PORTAL_PIECES = { wide: { y0: 4.1, h: 1.2 }, narrow: { y0: 4.8, h: 1.4 } };
const PORTAL_DEPTH = 0.8;

/** The phone table's bumper and target positions (tuned with tests/unit/lab-arena-clearance.test.ts). */
const NARROW = { b1: { x: 1.05, y: 4.8 }, b2: { x: -0.55, y: 3.9 }, t: { AI: 2.0, DESIGN: 0.7, PRODUCT: 2.9, BUILD: 1.4 } };

/**
 * Every box that makes up the cabinet shell (walls, divider, ceiling, floors). The left wall is split around the black hole's
 * opening and closed by a back plate, so the board stays sealed. Arena.tsx builds its colliders from this list and the
 * headless physics tests build theirs from it too, so the two cannot drift apart.
 */
export function wallBoxes(a: ArenaSpec): WallBox[] {
  const hw = a.halfW;
  const lane = a.lane;
  const { y0, y1, depth } = a.portal;
  const divH = (lane.dividerTop + 8) / 2;
  const ceilW = (lane.xOut + hw) / 2 + 1;
  const lowH = (y0 + 20) / 2;
  const upH = (20 - y1) / 2;
  return [
    { id: "wall-left-low", cx: -hw - 0.5, cy: y0 - lowH, hx: 0.5, hy: lowH, restitution: 0.55, friction: 0.1 },
    { id: "wall-left-high", cx: -hw - 0.5, cy: y1 + upH, hx: 0.5, hy: upH, restitution: 0.55, friction: 0.1 },
    // the pocket's back plate: closes the opening 0.8 deep so nothing leaves the cabinet
    { id: "wall-left-back", cx: -hw - depth - 0.1, cy: (y0 + y1) / 2, hx: 0.1, hy: (y1 - y0) / 2, restitution: 0.2, friction: 0.1 },
    { id: "divider", cx: (lane.xIn + hw) / 2, cy: lane.dividerTop - divH, hx: (lane.xIn - hw) / 2, hy: divH, restitution: 0.3, friction: 0.05 },
    { id: "wall-lane", cx: lane.xOut + 0.5, cy: 0, hx: 0.5, hy: 20, restitution: 0.4, friction: 0.05 },
    { id: "ceiling", cx: (lane.xOut - hw) / 2, cy: a.ceilingY + 0.5, hx: ceilW, hy: 0.5, restitution: 0.5, friction: 0.2 },
    // No floor under the table: the gap between the flippers is the drain. This only catches a gummy that fell through.
    { id: "catch", cx: 0, cy: a.floorY - 12, hx: hw + 3, hy: 0.5, restitution: 0.05, friction: 0.9 },
    // The lane has a solid floor well below the plunger's lowest point.
    { id: "lane-floor", cx: lane.x, cy: lane.restY - lane.travel - 0.55, hx: (lane.xOut - lane.xIn) / 2, hy: 0.3, restitution: 0.05, friction: 0.4 },
  ];
}

/**
 * The black-hole sensor: a box in the pocket's deep end, 0.2 inside the wall line. The gummy's hull is 0.98 tall, so only a body
 * that has really gone through the opening reaches it; a head poking in at the opening's edge does not (the lower body is still
 * stopped by the wall face).
 */
export function portalSensor(a: ArenaSpec): { cx: number; cy: number; hx: number; hy: number } {
  const { y0, y1, depth } = a.portal;
  const near = 0.2;
  const far = depth;
  return { cx: -a.halfW - (near + far) / 2, cy: (y0 + y1) / 2, hx: (far - near) / 2, hy: (y1 - y0) / 2 };
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
  const pp = wide ? PORTAL_PIECES.wide : PORTAL_PIECES.narrow;
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
  // The phone table (hw 2.7) gets fewer, smaller bumpers than the wide one (TASK-185, Tushar's phone screenshots): two domes of
  // about 72 % of the desktop radius, high on the table with a clear lane between them and the flippers, and no spinner.
  const br = wide ? 0.58 : 0.42;
  const bumpers: BumperSpec[] = wide
    ? [
        { id: "B1", x: 0, y: 3.95, r: br, minPhase: 0 },
        { id: "B2", x: -2.0, y: 2.55, r: br, minPhase: 0 },
        { id: "B3", x: 2.0, y: 2.55, r: br, minPhase: 0 },
        { id: "B4", x: 0, y: 1.25, r: br, minPhase: 0 },
        { id: "RB", x: 0, y: 5.35, r: 0.3, spin: { len: 1.5, speed: 1.6 }, minPhase: 1 },
      ]
    : [
        { id: "B1", x: NARROW.b1.x, y: NARROW.b1.y, r: br, minPhase: 0 },
        { id: "B2", x: NARROW.b2.x, y: NARROW.b2.y, r: br, minPhase: 0 },
      ];

  // Targets (spec §19): four mounted plates, two a side, tilted into the table. Tests and tools read x/y.
  const tw = wide ? 0.78 : 0.5;
  const th = wide ? 0.37 : 0.26;
  const tx = hw - (wide ? 0.98 : 0.62);
  const mk = (id: TargetName, side: -1 | 1, y: number): TargetSpec => ({ id, x: side * tx, y, hw: tw, hh: th, angle: side * 0.55, r: Math.hypot(tw, th) });
  const targets: TargetSpec[] = wide ? [mk("AI", -1, 3.25), mk("DESIGN", -1, 1.3), mk("PRODUCT", 1, 3.3), mk("BUILD", 1, 1.4)] : [mk("AI", -1, NARROW.t.AI), mk("DESIGN", -1, NARROW.t.DESIGN), mk("PRODUCT", 1, NARROW.t.PRODUCT), mk("BUILD", 1, NARROW.t.BUILD)];

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
  // The one-way gate (TASK-185): a thin panel that closes the lane's open side (the window between the divider's top and the arch) once
  // the launched gummy is out in the field, so it can never drop back into the lane. It stands on the divider's right edge and
  // reaches up into the arch's underside.
  const gx = lane.xIn - 0.02;
  const archAtGate = archCy + Math.sqrt(ARCH_R * ARCH_R - (gx - archCx) * (gx - archCx));
  const gate = { x1: gx, y1: lane.dividerTop - 0.05, x2: gx, y2: archAtGate + 0.1, thick: 0.14 };
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
    : // Phone table: only open spots with 1.5 gummy-widths of clearance from the bumpers, plates and walls, none in the feed from the
      // bumpers to the flippers (tests/unit/lab-arena-clearance.test.ts).
      [
        { x: -1.4, y: 5.5 },
        { x: -0.6, y: 5.5 },
        { x: 0.5, y: 2.2 },
        { x: 0.5, y: 1.0 },
        { x: -0.35, y: 0.45 },
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
    portal: { x: -hw - 0.5, y: pp.y0 + pp.h / 2, r: 0.55, y0: pp.y0, y1: pp.y0 + pp.h, depth: PORTAL_DEPTH },
    gate,
    anchors,
  };
}
