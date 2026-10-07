/**
 * Pinball flipper maths (TASK-172). Pure functions, no three/rapier: the arena places two flippers either side of a
 * central drain gap, the controller steps their angle from input, and a flipper that swings into the gummy hands it
 * an impulse along the flipper's surface normal. Units are arena world units and seconds.
 *
 * Angle convention: `angle` is the raise angle in radians, the same sign for both flippers (rest < 0 < up). The left
 * flipper points toward +x, the right toward -x (a mirror image), so the tip rises as the angle grows.
 */
export type FlipperSide = "left" | "right";

export interface Vec2 {
  x: number;
  y: number;
}

/** Rest angle (tip down toward the gap) and fully raised angle. */
export const FLIP_REST = -0.46;
export const FLIP_UP = 0.26;
/** Seconds to swing rest → up on press, up → rest on release. */
export const FLIP_RISE_S = 0.075;
export const FLIP_FALL_S = 0.11;
export const FLIPPER_THICK = 0.3;
/** Width of the drain between the two resting tips; wider than the gummy (about 0.7). */
export const DRAIN_GAP = 1.05;
/** Centre-of-gummy to flipper-axis distance within which a swing counts as a hit. */
export const FLIP_REACH = 0.82;
/** Below this raise speed (rad/s) the flipper is not swinging, so it hands over no impulse. */
export const FLIP_MIN_OMEGA = 1.5;
/** Impulse along the normal: the floor at the pivot and at the tip, the cap, and the surface restitution. */
export const FLIP_KICK_BASE = 13.5;
export const FLIP_KICK_TIP = 19;
export const FLIP_MAX_SPEED = 22;
export const FLIP_RESTITUTION = 0.35;
/** Seconds after a hit during which the same flipper cannot hit again (the normal turns as it swings). */
export const FLIP_COOLDOWN_S = 0.14;

export interface FlipperLayout {
  side: FlipperSide;
  pivot: Vec2;
  len: number;
}

export interface FlipperState {
  angle: number;
  /** Signed raise speed (rad/s): positive while rising. */
  omega: number;
}

export const newFlipperState = (): FlipperState => ({ angle: FLIP_REST, omega: 0 });

/** Left/right flippers for an arena of half-width `hw`, pivots at `pivotY`. Both fit inside the walls. */
export function flipperLayouts(hw: number, pivotY: number): { left: FlipperLayout; right: FlipperLayout } {
  const len = hw > 4 ? 2.2 : 1.55;
  const px = DRAIN_GAP / 2 + len * Math.cos(FLIP_REST);
  return {
    left: { side: "left", pivot: { x: -px, y: pivotY }, len },
    right: { side: "right", pivot: { x: px, y: pivotY }, len },
  };
}

const sign = (side: FlipperSide) => (side === "left" ? 1 : -1);

/** Unit vector from the pivot to the tip. */
export function flipperDir(side: FlipperSide, angle: number): Vec2 {
  return { x: sign(side) * Math.cos(angle), y: Math.sin(angle) };
}

/** Unit normal of the upper (playing) surface. */
export function flipperNormal(side: FlipperSide, angle: number): Vec2 {
  return { x: -sign(side) * Math.sin(angle), y: Math.cos(angle) };
}

/** World position of the tip of the flipper's axis. */
export function flipperTip(l: FlipperLayout, angle: number): Vec2 {
  const d = flipperDir(l.side, angle);
  return { x: l.pivot.x + d.x * l.len, y: l.pivot.y + d.y * l.len };
}

/** Quaternion (rotation about z) for a kinematic body whose local +x runs pivot → tip. */
export function flipperRotation(side: FlipperSide, angle: number): { x: number; y: number; z: number; w: number } {
  const theta = side === "left" ? angle : Math.PI - angle;
  return { x: 0, y: 0, z: Math.sin(theta / 2), w: Math.cos(theta / 2) };
}

/** Advance a flipper toward its target angle at a fixed rate (rise and fall times above); sets `omega`. */
export function stepFlipper(s: FlipperState, pressed: boolean, dt: number): FlipperState {
  const range = FLIP_UP - FLIP_REST;
  const target = pressed ? FLIP_UP : FLIP_REST;
  const rate = range / (pressed ? FLIP_RISE_S : FLIP_FALL_S);
  const delta = target - s.angle;
  const move = Math.sign(delta) * Math.min(Math.abs(delta), rate * dt);
  s.angle += move;
  s.omega = dt > 0 ? move / dt : 0;
  return s;
}

export interface FlipHit {
  /** New gummy velocity. */
  vx: number;
  vy: number;
  /** Outgoing speed along the normal. */
  speed: number;
  /** 0 at the pivot … 1 at the tip. */
  along: number;
  normal: Vec2;
}

/**
 * The impulse a swinging flipper gives a gummy whose centre is at `ball` moving at `vel`: the velocity component along
 * the surface normal becomes the flipper's own surface speed at the contact point (bounced by FLIP_RESTITUTION) but never
 * less than a kick that grows from pivot to tip; the tangential part is kept (damped). `power` scales the kick (the
 * Super Squish power-up). Null when the flipper is not swinging up, the gummy is out of reach, below the surface, or
 * already leaving faster than the surface.
 */
export function flipImpulse(l: FlipperLayout, s: FlipperState, ball: Vec2, vel: Vec2, power = 1): FlipHit | null {
  if (s.omega < FLIP_MIN_OMEGA) return null;
  const d = flipperDir(l.side, s.angle);
  const n = flipperNormal(l.side, s.angle);
  const rx = ball.x - l.pivot.x;
  const ry = ball.y - l.pivot.y;
  const along = Math.min(l.len, Math.max(0, rx * d.x + ry * d.y));
  const height = rx * n.x + ry * n.y;
  if (height <= 0) return null;
  const dx = rx - d.x * along;
  const dy = ry - d.y * along;
  if (Math.hypot(dx, dy) > FLIP_REACH) return null;
  const surface = along * s.omega;
  const vn = vel.x * n.x + vel.y * n.y;
  if (vn - surface > 0.5) return null;
  const t = along / l.len;
  const kick = (FLIP_KICK_BASE + (FLIP_KICK_TIP - FLIP_KICK_BASE) * t) * power;
  const out = Math.min(FLIP_MAX_SPEED * power, Math.max(surface * (1 + FLIP_RESTITUTION) - FLIP_RESTITUTION * vn, kick));
  const tx = (vel.x - vn * n.x) * 0.7;
  const ty = (vel.y - vn * n.y) * 0.7;
  return { vx: tx + n.x * out, vy: ty + n.y * out, speed: out, along: t, normal: n };
}

/** Is the gummy resting on or touching a flipper (used so the anti-stall nudge never disturbs a cradled gummy)? */
export function nearFlipper(l: FlipperLayout, s: FlipperState, ball: Vec2): boolean {
  const d = flipperDir(l.side, s.angle);
  const n = flipperNormal(l.side, s.angle);
  const rx = ball.x - l.pivot.x;
  const ry = ball.y - l.pivot.y;
  const along = Math.min(l.len, Math.max(0, rx * d.x + ry * d.y));
  return rx * n.x + ry * n.y > 0 && Math.hypot(rx - d.x * along, ry - d.y * along) <= FLIP_REACH + 0.2;
}

/**
 * Anti-stall (TASK-184). A gummy that stays inside a small area for STALL_AFTER_S anywhere but on a flipper is stuck
 * (a soft-lock: the player can only reach it with the flippers). Judged by POSITION, not speed: wind and the LAB
 * UNSTABLE low-gravity wobble keep a trapped gummy twitching above any speed threshold (Tushar's 2026-10-08 screenshot:
 * wedged between the green ball and the blue rail, never freed). Each nudge flips direction and grows, and every second
 * try pushes DOWN, so a gummy pinned under a rail is pulled out instead of being driven further into it.
 */
export const STALL_AFTER_S = 1.1;
export const STALL_RADIUS = 0.35;
/** Distance from the last stuck point beyond which the gummy counts as freed. */
export const STALL_ESCAPED = 1.2;
const NUDGE_BASE = 3.2;
const NUDGE_GROWTH = 1.35;
const NUDGE_MAX_TRIES = 4;

export class StallWatch {
  private anchor: Vec2 | null = null;
  private still = 0;
  private tries = 0;
  /** Where the last nudge fired: escalation resets once the gummy is clearly away from it (it escaped). */
  private stuckAt: Vec2 | null = null;

  /** One fixed physics step. Returns a velocity to set when the gummy is judged stuck, otherwise null. */
  step(dt: number, pos: Vec2, onFlipper: boolean): Vec2 | null {
    if (onFlipper || (this.stuckAt && Math.hypot(pos.x - this.stuckAt.x, pos.y - this.stuckAt.y) > STALL_ESCAPED)) {
      this.tries = 0;
      this.stuckAt = null;
    }
    if (onFlipper || !this.anchor || Math.hypot(pos.x - this.anchor.x, pos.y - this.anchor.y) > STALL_RADIUS) {
      this.anchor = { x: pos.x, y: pos.y };
      this.still = 0;
      return null;
    }
    this.still += dt;
    if (this.still <= STALL_AFTER_S) return null;
    const k = Math.min(this.tries, NUDGE_MAX_TRIES);
    const away = pos.x >= 0 ? -1 : 1;
    const side = k % 2 === 0 ? away : -away;
    const mag = NUDGE_BASE * Math.pow(NUDGE_GROWTH, k);
    const nudge = { x: side * mag, y: k % 2 === 0 ? mag * 0.9 : -mag * 0.6 };
    this.tries += 1;
    this.still = 0;
    this.anchor = { x: pos.x, y: pos.y };
    this.stuckAt = { x: pos.x, y: pos.y };
    return nudge;
  }

  reset() {
    this.anchor = null;
    this.still = 0;
    this.tries = 0;
    this.stuckAt = null;
  }
}
