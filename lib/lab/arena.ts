import { flipperLayouts, type FlipperLayout } from "./flippers";
import type { BumperKind } from "./bumpers";

/**
 * The arena layout (gummy-bear.md §15, §29, §33): a side-on, one-screen play field in the z = 0
 * plane. Pure data, built for a given half-width so portrait phones get a narrower, taller room
 * (the bear stays big under the thumb) and tablets/phones a simplified one (§38). Units: the bear is
 * 1 unit tall. `minPhase` gates parts that arrive with the difficulty ramp (§20).
 */
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
  /** Pop, jet, thumper or turbo (lib/lab/bumpers.ts). The spinner is a pop that turns. */
  kind: BumperKind;
  x: number;
  y: number;
  r: number;
  /** A spinning bar instead of a dome (arrives with phase 1). */
  spin?: { len: number; speed: number };
  minPhase: number;
}
/**
 * A slingshot (TASK-185, spec §20; the side ones TASK-199): a convex paper shape, one edge of which (`face`) kicks the gummy.
 * "flipper" slings are the triangles standing on the in-lane guides; "wall" slings are the unlabelled trapezia on the side walls
 * (long edge on the wall, short edge facing the table).
 */
export interface SlingSpec {
  id: string;
  kind: "flipper" | "wall";
  side: "left" | "right";
  /** The polygon's corners, in order (a triangle for a flipper sling, four for a wall sling). */
  pts: Anchor[];
  /** The kicking edge's two ends. */
  face: [Anchor, Anchor];
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
  /**
   * The black hole (TASK-199): a sensor pocket at the playfield's top-left. `x`/`y`/`r` place the drawn hole; `catchR` is the radius
   * of the sensor circle (a little under the drawn hole, so the gummy has to reach it, not just pass near). A gummy touching the
   * sensor spirals in and leaves for the portfolio.
   */
  portal: { x: number; y: number; r: number; catchR: number };
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
 * The black hole's place on each table (TASK-199, tuned with the headless Rapier scan in tests/unit/lab-portal-sim.test.ts): in the
 * top-left corner of the playfield, where a hard shot from the plunger runs along the ceiling. It is a skill shot: only a launch
 * within a few percent of full power gets there, and a flipper shot up the left side can too.
 */
const PORTAL = { wide: { dx: 1.1, y: 5.35, r: 0.55, catchR: 0.46 }, narrow: { dx: 0.4, y: 0.8, r: 0.4, catchR: 0.3 } };

/** Phone table's bumper positions and the two it keeps (pop + turbo; tuned with tests/unit/lab-arena-clearance.test.ts). */
const NARROW = { pop: { x: -0.6, y: 4.5 }, turbo: { x: 0.6, y: 3.0 } };

/**
 * Every box that makes up the cabinet shell (walls, divider, ceiling, floors). Arena.tsx builds its colliders from this list and
 * the headless physics tests build theirs from it too, so the two cannot drift apart.
 */
export function wallBoxes(a: ArenaSpec): WallBox[] {
  const hw = a.halfW;
  const lane = a.lane;
  const divH = (lane.dividerTop + 8) / 2;
  const ceilW = (lane.xOut + hw) / 2 + 1;
  return [
    { id: "wall-left", cx: -hw - 0.5, cy: 0, hx: 0.5, hy: 20, restitution: 0.55, friction: 0.1 },
    { id: "divider", cx: (lane.xIn + hw) / 2, cy: lane.dividerTop - divH, hx: (lane.xIn - hw) / 2, hy: divH, restitution: 0.3, friction: 0.05 },
    { id: "wall-lane", cx: lane.xOut + 0.5, cy: 0, hx: 0.5, hy: 20, restitution: 0.4, friction: 0.05 },
    { id: "ceiling", cx: (lane.xOut - hw) / 2, cy: a.ceilingY + 0.5, hx: ceilW, hy: 0.5, restitution: 0.5, friction: 0.2 },
    // No floor under the table: the gap between the flippers is the drain. This only catches a gummy that fell through.
    { id: "catch", cx: 0, cy: a.floorY - 12, hx: hw + 3, hy: 0.5, restitution: 0.05, friction: 0.9 },
    // The lane has a solid floor well below the plunger's lowest point.
    { id: "lane-floor", cx: lane.x, cy: lane.restY - lane.travel - 0.55, hx: (lane.xOut - lane.xIn) / 2, hy: 0.3, restitution: 0.05, friction: 0.4 },
  ];
}

/** The black-hole sensor: a ball (centre and radius) in the playfield's top-left corner. Only the gummy's body reaches it. */
export function portalSensor(a: ArenaSpec): { x: number; y: number; r: number } {
  return { x: a.portal.x, y: a.portal.y, r: a.portal.catchR };
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
  const pt = wide ? PORTAL.wide : PORTAL.narrow;
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

  // Bumpers (spec §18; four types since TASK-199): a tight diamond of big circles in the middle of the table, edge to edge at least
  // MIN_CLEAR (1.5 gummy widths) apart so nothing can wedge between them. Top jet, left thumper, right turbo, bottom pop: the
  // gentlest kick is the one nearest the flippers. The spinner turns just below the diamond, centred (from phase 1).
  // The phone table (hw 2.7) keeps two smaller domes (about 72 % of the desktop radius), pop + turbo, and no spinner.
  const br = wide ? 0.58 : 0.42;
  const DIA = { cy: 2.9, dv: 1.55, dh: 1.55 };
  const bumpers: BumperSpec[] = wide
    ? [
        { id: "B1", kind: "jet", x: 0, y: DIA.cy + DIA.dv, r: br, minPhase: 0 },
        { id: "B2", kind: "thumper", x: -DIA.dh, y: DIA.cy, r: br, minPhase: 0 },
        { id: "B3", kind: "turbo", x: DIA.dh, y: DIA.cy, r: br, minPhase: 0 },
        { id: "B4", kind: "pop", x: 0, y: DIA.cy - DIA.dv, r: br, minPhase: 0 },
        { id: "RB", kind: "pop", x: 0, y: -0.55, r: 0.3, spin: { len: 1.2, speed: 1.6 }, minPhase: 1 },
      ]
    : [
        { id: "B1", kind: "pop", x: NARROW.pop.x, y: NARROW.pop.y, r: br, minPhase: 0 },
        { id: "B2", kind: "turbo", x: NARROW.turbo.x, y: NARROW.turbo.y, r: br, minPhase: 0 },
      ];

  // Slingshots (spec §20): right-angle triangles standing on the in-lane guides, the long edge facing the table.
  const flipperSlings: SlingSpec[] = (["left", "right"] as const).map((side) => {
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
    return { id: side === "left" ? "SL" : "SR", kind: "flipper", side, pts: [a, b, apex], face: [apex, b], normal: n, mid: { x: (apex.x + b.x) / 2, y: (apex.y + b.y) / 2 } };
  });
  // The side slingshots (TASK-199, unlabelled trapezia that replaced the AI / DESIGN / PRODUCT / BUILD bricks): long edge on the wall at
  // mid-height, short edge (the kicking face) toward the table. The upper edge slopes down toward the table and the lower one slopes up
  // away from the wall, so a gummy that lands on either rolls off (no pocket against the wall). The right one stands on the lane's
  // divider, just left of the shooter-lane wall.
  const WS = wide ? { y: 3.0, hy: 1.05, fy: 0.5, depth: 0.8 } : { y: 2.5, hy: 0.8, fy: 0.42, depth: 0.55 };
  const wallSlings: SlingSpec[] = (["left", "right"] as const).map((side) => {
    const sgn = side === "left" ? -1 : 1;
    const wx = sgn * hw;
    const fxp = sgn * (hw - WS.depth);
    const pts: Anchor[] = [
      { x: wx, y: WS.y + WS.hy },
      { x: fxp, y: WS.y + WS.fy },
      { x: fxp, y: WS.y - WS.fy },
      { x: wx, y: WS.y - WS.hy },
    ];
    return { id: side === "left" ? "WL" : "WR", kind: "wall", side, pts, face: [pts[1]!, pts[2]!], normal: { x: -sgn, y: 0 }, mid: { x: fxp, y: WS.y } };
  });
  const slings: SlingSpec[] = [...flipperSlings, ...wallSlings];

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
  // (The wall slingshot standing on the divider's top covers it, so nothing can balance there.)
  // The one-way gate (TASK-185): a thin panel that closes the lane's open side (the window between the divider's top and the arch) once
  // the launched gummy is out in the field, so it can never drop back into the lane. It stands on the divider's right edge and
  // reaches up into the arch's underside.
  const gx = lane.xIn - 0.02;
  const archAtGate = archCy + Math.sqrt(ARCH_R * ARCH_R - (gx - archCx) * (gx - archCx));
  const gate = { x1: gx, y1: lane.dividerTop - 0.05, x2: gx, y2: archAtGate + 0.1, thick: 0.14 };
  // Collectible anchors: open space between the bumpers, ramps and slingshots (never in the lane, below the shelves or under a rail, and
  // clear of the black hole's sensor).
  const anchors: Anchor[] = wide
    ? [
        { x: 0, y: 2.9 },
        { x: -2.5, y: 5.1 },
        { x: 2.3, y: 5.0 },
        { x: -1.2, y: 5.6 },
        { x: 1.2, y: 5.6 },
        { x: -3.2, y: 1.0 },
        { x: 3.2, y: 1.0 },
        { x: -2.2, y: 0.4 },
        { x: 2.2, y: 0.4 },
      ]
    : // Phone table: only open spots with 1.5 gummy-widths of clearance from the bumpers, slingshots and walls, none in the feed from the
      // bumpers to the flippers (tests/unit/lab-arena-clearance.test.ts).
      [
        { x: 1.2, y: 5.4 },
        { x: 1.2, y: 4.5 },
        { x: -0.9, y: 1.3 },
        { x: 1.0, y: 1.2 },
        { x: -1.0, y: 0.2 },
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
    minX: -hw - 0.65,
    maxX: lane.xOut + panel + 0.2,
    cx: (lane.xOut + panel + 0.2 - hw - 0.65) / 2,
    panel,
    topY: CEILING_Y + 1.25,
    bottomY: -6.55,
    pads,
    bumpers: simplified ? bumpers.filter((b) => !b.spin) : bumpers,
    portal: { x: -hw + pt.dx, y: pt.y, r: pt.r, catchR: pt.catchR },
    gate,
    anchors,
  };
}
