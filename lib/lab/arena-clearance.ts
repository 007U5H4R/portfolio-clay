import type { Anchor, ArenaSpec, TargetSpec } from "./arena";

/**
 * Clearance maths for the arena layout (TASK-185 mobile pass). The gummy's hull is about 0.65 wide, and a gap narrower than
 * 1.5 of those can wedge it (Tushar's phone screenshots), so bumpers, targets, walls and pickup spawns must keep MIN_CLEAR
 * between their edges. Pure geometry, used by tests/unit/lab-arena-clearance.test.ts and the layout tuning.
 */
export const GUMMY_W = 0.65;
export const MIN_CLEAR = 1.5 * GUMMY_W;

type P = [number, number];

/** The four corners of a target plate in world space. */
export function plateCorners(t: TargetSpec): P[] {
  const c = Math.cos(t.angle);
  const s = Math.sin(t.angle);
  return ([[-1, -1], [1, -1], [1, 1], [-1, 1]] as P[]).map(([ux, uy]) => [t.x + ux * t.hw * c - uy * t.hh * s, t.y + ux * t.hw * s + uy * t.hh * c] as P);
}

function segDist(p: P, a: P, b: P): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const k = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p[0] - (a[0] + k * dx), p[1] - (a[1] + k * dy));
}
function inside(p: P, poly: P[]): boolean {
  let neg = false;
  let pos = false;
  for (let i = 0; i < poly.length; i += 1) {
    const a = poly[i]!;
    const b = poly[(i + 1) % poly.length]!;
    const cr = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    if (cr < 0) neg = true;
    else if (cr > 0) pos = true;
  }
  return !(neg && pos);
}
/** Distance from a point to a convex polygon (0 inside). */
export function pointToPoly(p: P, poly: P[]): number {
  if (inside(p, poly)) return 0;
  let d = Infinity;
  for (let i = 0; i < poly.length; i += 1) d = Math.min(d, segDist(p, poly[i]!, poly[(i + 1) % poly.length]!));
  return d;
}
/** Distance between two convex polygons (0 when they touch or overlap). */
export function polyToPoly(a: P[], b: P[]): number {
  let d = Infinity;
  for (const p of a) d = Math.min(d, pointToPoly(p, b));
  for (const p of b) d = Math.min(d, pointToPoly(p, a));
  return d;
}

/** Edge-to-edge clearance of a point (a pickup's centre, radius 0) from everything solid in the table: bumpers, plates, side walls. */
export function pointClearance(a: ArenaSpec, p: Anchor): number {
  let d = Math.min(p.x + a.halfW, a.halfW - p.x);
  for (const b of a.bumpers) if (!b.spin) d = Math.min(d, Math.hypot(p.x - b.x, p.y - b.y) - b.r);
  for (const t of a.targets) d = Math.min(d, pointToPoly([p.x, p.y], plateCorners(t)));
  return d;
}

export interface Clearances {
  bumperBumper: number;
  bumperWall: number;
  bumperTarget: number;
  targetTarget: number;
}
/** The smallest edge-to-edge gaps in the layout (Infinity when there is no such pair). */
export function layoutClearances(a: ArenaSpec): Clearances {
  const bumpers = a.bumpers.filter((b) => !b.spin);
  const out: Clearances = { bumperBumper: Infinity, bumperWall: Infinity, bumperTarget: Infinity, targetTarget: Infinity };
  bumpers.forEach((b, i) => {
    for (const o of bumpers.slice(i + 1)) out.bumperBumper = Math.min(out.bumperBumper, Math.hypot(b.x - o.x, b.y - o.y) - b.r - o.r);
    out.bumperWall = Math.min(out.bumperWall, a.halfW - Math.abs(b.x) - b.r);
    for (const t of a.targets) out.bumperTarget = Math.min(out.bumperTarget, pointToPoly([b.x, b.y], plateCorners(t)) - b.r);
  });
  a.targets.forEach((t, i) => {
    for (const o of a.targets.slice(i + 1)) out.targetTarget = Math.min(out.targetTarget, polyToPoly(plateCorners(t), plateCorners(o)));
  });
  return out;
}
