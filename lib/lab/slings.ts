import type { SlingSpec } from "./arena";

/**
 * The slingshot kick (TASK-185 spec §20; side slingshots TASK-199), pure maths shared by Arena.tsx, the headless sim and the tests.
 * A gummy that touches a sling's kicking face from the table side is pushed out along the face's normal, a little faster than it
 * arrived, with an upward bias (the lower triangles nudge it up by 1 u/s; the wall trapezia, whose face is vertical, by 2.5 so a
 * kick never drives the gummy flat across the table). Every sling scores ACTION_POINTS.sling (30).
 */
export const SLING_MIN_SPEED = 9;
export const SLING_LIFT = { flipper: 1, wall: 2.5 } as const;

/** Is the gummy's centre on the kicking face's side (so it is a real hit, not a clip of the back or the base)? */
export function slingFacing(s: SlingSpec, cx: number, cy: number): boolean {
  return (cx - s.mid.x) * s.normal.x + (cy - s.mid.y) * s.normal.y > 0.05;
}

/** The velocity a sling gives a gummy that arrived at `incoming` u/s. */
export function slingKick(s: SlingSpec, incoming: number, bounceMul = 1): { x: number; y: number } {
  const speed = Math.max(SLING_MIN_SPEED, incoming * 0.6 + 5) * bounceMul;
  return { x: s.normal.x * speed, y: s.normal.y * speed + SLING_LIFT[s.kind] };
}
