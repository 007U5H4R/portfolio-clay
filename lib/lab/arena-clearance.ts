import type { Anchor, ArenaSpec, SlingSpec } from "./arena";

/**
 * Clearance maths for the arena layout (TASK-185 mobile pass). The gummy's hull is about 0.65 wide, and a gap narrower than
 * 1.5 of those can wedge it (Tushar's phone screenshots), so bumpers, side slingshots, walls and pickup spawns must keep MIN_CLEAR
 * between their edges. Pure geometry, used by tests/unit/lab-arena-clearance.test.ts and the layout tuning.
 */
export const GUMMY_W = 0.65;
export const MIN_CLEAR = 1.5 * GUMMY_W;

type P = [number, number];

/** A sling's corners as points (for the polygon maths below). */
export function slingPoly(s: SlingSpec): P[] {
  return s.pts.map((p) => [p.x, p.y] as P);
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

/** The side (wall) slingshots: the ones that stand out into the open table. */
const wallSlings = (a: ArenaSpec) => a.slings.filter((s) => s.kind === "wall");

/** Edge-to-edge clearance of a point (a pickup's centre, radius 0) from everything solid in the table: bumpers, side slingshots, walls, the spinner's sweep. */
export function pointClearance(a: ArenaSpec, p: Anchor): number {
  let d = Math.min(p.x + a.halfW, a.halfW - p.x);
  for (const b of a.bumpers) d = Math.min(d, Math.hypot(p.x - b.x, p.y - b.y) - (b.spin ? b.spin.len / 2 + 0.11 : b.r));
  for (const s of wallSlings(a)) d = Math.min(d, pointToPoly([p.x, p.y], slingPoly(s)));
  d = Math.min(d, Math.hypot(p.x - a.portal.x, p.y - a.portal.y) - a.portal.r);
  return d;
}

export interface Clearances {
  bumperBumper: number;
  bumperWall: number;
  bumperSling: number;
  /** Spinner's swept circle to the nearest bumper's edge (Infinity when there is no spinner). */
  spinnerBumper: number;
  slingSling: number;
}
/** The smallest edge-to-edge gaps in the layout (Infinity when there is no such pair). */
export function layoutClearances(a: ArenaSpec): Clearances {
  const bumpers = a.bumpers.filter((b) => !b.spin);
  const out: Clearances = { bumperBumper: Infinity, bumperWall: Infinity, bumperSling: Infinity, spinnerBumper: Infinity, slingSling: Infinity };
  const walls = wallSlings(a);
  bumpers.forEach((b, i) => {
    for (const o of bumpers.slice(i + 1)) out.bumperBumper = Math.min(out.bumperBumper, Math.hypot(b.x - o.x, b.y - o.y) - b.r - o.r);
    out.bumperWall = Math.min(out.bumperWall, a.halfW - Math.abs(b.x) - b.r);
    for (const s of walls) out.bumperSling = Math.min(out.bumperSling, pointToPoly([b.x, b.y], slingPoly(s)) - b.r);
  });
  for (const sp of a.bumpers.filter((b) => b.spin)) for (const b of bumpers) out.spinnerBumper = Math.min(out.spinnerBumper, Math.hypot(sp.x - b.x, sp.y - b.y) - b.r - (sp.spin!.len / 2 + 0.11));
  walls.forEach((s, i) => {
    for (const o of walls.slice(i + 1)) out.slingSling = Math.min(out.slingSling, polyToPoly(slingPoly(s), slingPoly(o)));
  });
  return out;
}
