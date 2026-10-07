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
  r: number;
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
  const fx = (f: number) => f * hw;
  const flip = flipperLayouts(hw, FLIPPER_PIVOT_Y);
  const px = Math.abs(flip.left.pivot.x);
  const guideTop = Math.min(-1.7, FLIPPER_PIVOT_Y + (hw - px) * GUIDE_SLOPE);
  const guides: GuideSpec[] = [
    { id: "GL", x1: -hw, y1: guideTop, x2: -px - 0.12, y2: FLIPPER_PIVOT_Y + 0.08 },
    { id: "GR", x1: hw, y1: guideTop, x2: px + 0.12, y2: FLIPPER_PIVOT_Y + 0.08 },
  ];
  // The old flat shelves are gone: every platform is a tilted rail, so the gummy rolls on instead of stalling.
  const platforms: PlatformSpec[] = [
    { id: "S2", x: fx(0.5), y: -0.9, w: 1.9, h: 0.34, angle: 0.24, minPhase: 0 },
    { id: "M2", x: fx(-0.3), y: 1.0, w: 1.7, h: 0.34, angle: -0.26, slide: { amp: fx(0.42), speed: 0.7, phase: 1.6 }, minPhase: 0 },
    { id: "S3", x: fx(0.4), y: 2.9, w: 1.8, h: 0.34, angle: 0.28, vanishes: { period: 6, offset: 0 }, minPhase: 0 },
    { id: "S4", x: fx(0.45), y: 4.8, w: 1.5, h: 0.34, angle: -0.3, minPhase: 0 },
  ];
  const s2 = platforms[0]!;
  const padAlong = 0.55;
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
  const bumpers: BumperSpec[] = [
    { id: "B1", x: fx(0.05), y: 2.0, r: 0.42, minPhase: 0 },
    { id: "B2", x: fx(-0.62), y: -1.2, r: 0.38, minPhase: 0 },
    { id: "RB", x: fx(-0.1), y: 4.1, r: 0.3, spin: { len: 1.6, speed: 1.6 }, minPhase: 1 },
  ];
  const wall = hw - 0.12;
  const targets: TargetSpec[] = [
    { id: "AI", x: -wall, y: 3.4, r: 0.5 },
    { id: "PRODUCT", x: wall, y: 1.1, r: 0.5 },
    { id: "DESIGN", x: -wall, y: -0.3, r: 0.5 },
    { id: "BUILD", x: wall, y: -0.8, r: 0.5 },
  ];
  // Collectible anchors: none below the shelves, where the flippers and in-lane guides live.
  const anchors: Anchor[] = [
    { x: fx(-0.55), y: -1.2 },
    { x: fx(0.1), y: -1.3 },
    { x: fx(0.6), y: 0.7 },
    { x: fx(-0.65), y: 2.4 },
    { x: fx(0.05), y: 3.4 },
    { x: fx(-0.3), y: -0.2 },
    { x: fx(0.35), y: 0.3 },
    { x: fx(0.7), y: 3.7 },
    { x: fx(0.0), y: 0.2 },
    { x: fx(0.75), y: -0.1 },
    { x: fx(-0.15), y: 5.3 },
  ];
  return {
    halfW: hw,
    floorY: FLOOR_Y,
    ceilingY: CEILING_Y,
    dangerTop: DANGER_TOP_REST,
    spawn: { x: fx(0.4), y: 4.0 },
    introPos: { x: 0, y: -1.9 },
    platforms: simplified ? platforms.filter((p) => p.id !== "S4") : platforms,
    guides,
    flippers: [flip.left, flip.right],
    pads,
    bumpers: simplified ? bumpers.filter((b) => !b.spin) : bumpers,
    targets,
    portal: { x: -hw * 0.72, y: 5.45, r: 0.55 },
    anchors,
  };
}
