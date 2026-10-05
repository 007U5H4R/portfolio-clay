/**
 * Pure control maths for the gummy (gummy-bear.md §17): drag as a spring (never a teleport), flick
 * velocity from the last ~100 ms of pointer samples with a hard cap, tap kick, and the squish
 * charge → bounce speed curve. Units are arena world units (the bear is 1 unit tall) and seconds.
 */
export interface Vec2 {
  x: number;
  y: number;
}
export interface PointerSample extends Vec2 {
  /** ms timestamp */
  t: number;
}

export const DRAG_STIFFNESS = 70;
export const DRAG_DAMPING = 11;
export const DRAG_MAX_SPEED = 15;
export const FLICK_WINDOW_MS = 100;
export const FLICK_MULTIPLIER = 0.8;
export const FLICK_MAX_SPEED = 17;
export const FLICK_MIN_SPEED = 2.2;
export const TAP_MAX_MS = 190;
export const TAP_MAX_MOVE_PX = 10;
export const SQUISH_START_MS = 160;
export const SQUISH_FULL_MS = 900;
export const BOUNCE_BASE_SPEED = 6.5;
export const BOUNCE_CHARGE_SPEED = 9.5;
export const TAP_BOUNCE_SPEED = 6;

export function clampSpeed(v: Vec2, max: number): Vec2 {
  const s = Math.hypot(v.x, v.y);
  if (s <= max || s === 0) return { x: v.x, y: v.y };
  const k = max / s;
  return { x: v.x * k, y: v.y * k };
}

/** Spring-damper acceleration pulling `pos` toward `target` (critically-ish damped: a soft catch-up). */
export function dragAcceleration(pos: Vec2, vel: Vec2, target: Vec2, k = DRAG_STIFFNESS, c = DRAG_DAMPING): Vec2 {
  return { x: (target.x - pos.x) * k - vel.x * c, y: (target.y - pos.y) * k - vel.y * c };
}

/** Pointer velocity (world units / s) over the trailing window; zero with fewer than two samples. */
export function flickVelocity(samples: readonly PointerSample[], now: number, windowMs = FLICK_WINDOW_MS): Vec2 {
  const recent = samples.filter((s) => now - s.t <= windowMs);
  if (recent.length < 2) return { x: 0, y: 0 };
  const a = recent[0]!;
  const b = recent[recent.length - 1]!;
  const dt = (b.t - a.t) / 1000;
  if (dt <= 0) return { x: 0, y: 0 };
  return { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt };
}

/** Launch velocity for a release: scaled and capped; below the minimum it is a plain drop (no launch). */
export function flickLaunch(samples: readonly PointerSample[], now: number, scale = 1): Vec2 | null {
  const v = flickVelocity(samples, now);
  if (Math.hypot(v.x, v.y) < FLICK_MIN_SPEED) return null;
  const k = FLICK_MULTIPLIER * scale;
  return clampSpeed({ x: v.x * k, y: v.y * k }, FLICK_MAX_SPEED);
}

/** 0 until the hold passes SQUISH_START_MS, then eases to 1 at SQUISH_FULL_MS. */
export function squishCharge(heldMs: number): number {
  if (heldMs <= SQUISH_START_MS) return 0;
  const t = Math.min(1, (heldMs - SQUISH_START_MS) / (SQUISH_FULL_MS - SQUISH_START_MS));
  return t * t * (3 - 2 * t);
}

/** Upward launch speed on releasing a squish; `mul` is the Super Squish factor. */
export function bounceSpeed(charge: number, mul = 1): number {
  return (BOUNCE_BASE_SPEED + BOUNCE_CHARGE_SPEED * Math.min(1, Math.max(0, charge))) * mul;
}

/** A quick tap: a bounce plus a sideways kick away from where the bear was poked (offset in units). */
export function tapKick(offsetX: number, mul = 1): Vec2 {
  const side = Math.max(-1, Math.min(1, offsetX / 0.5));
  return { x: -side * 2.4, y: TAP_BOUNCE_SPEED * mul };
}

export function isTap(heldMs: number, movedPx: number): boolean {
  return heldMs <= TAP_MAX_MS && movedPx <= TAP_MAX_MOVE_PX;
}
