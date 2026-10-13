/**
 * The four bumper types (TASK-199, spec §18). Each is a different kick and a different bit of feedback; this file is the pure
 * maths (the impulse and which effects fire), shared by Arena.tsx, the headless sim and the unit tests. No three.js.
 *
 *  - pop      the normal kick (the TASK-185 bumper).
 *  - jet      a stronger kick and a ring flash that spreads out from the cap.
 *  - thumper  a heavy kick and a short table shake (the Nudge shake; none under reduced motion).
 *  - turbo    a speed boost (the gummy leaves faster than it arrived) and a short trail burst.
 *
 * All four score BUMPER_POINTS (100): the types differ in feel, not in value, so no bumper is a better farm than another.
 */
export type BumperKind = "pop" | "jet" | "thumper" | "turbo";
export const BUMPER_KINDS: readonly BumperKind[] = ["pop", "jet", "thumper", "turbo"];
export const BUMPER_POINTS = 100;

export interface BumperTune {
  /** Floor of the outgoing speed (u/s). */
  min: number;
  /** Outgoing speed = max(min, incoming speed × gain + add). */
  gain: number;
  add: number;
  /** Which effects the hit sets off. */
  ringFlash: boolean;
  shake: boolean;
  trailBurst: boolean;
}

export const BUMPER_TUNE: Record<BumperKind, BumperTune> = {
  pop: { min: 7.5, gain: 0.8, add: 3, ringFlash: false, shake: false, trailBurst: false },
  jet: { min: 10.5, gain: 0.9, add: 4.5, ringFlash: true, shake: false, trailBurst: false },
  thumper: { min: 13, gain: 1.0, add: 6, ringFlash: false, shake: true, trailBurst: false },
  turbo: { min: 9.5, gain: 1.3, add: 4, ringFlash: false, shake: false, trailBurst: true },
};

/** The speed the controller never lets the gummy exceed (mirrors gummy-controller's MAX_SPEED). */
export const BUMPER_MAX_SPEED = 28;

/** The outgoing speed (u/s) of a hit at `incoming` u/s: the kind's formula × the power-up bounce multiplier, capped. */
export function bumperSpeed(kind: BumperKind, incoming: number, bounceMul = 1): number {
  const t = BUMPER_TUNE[kind];
  return Math.min(BUMPER_MAX_SPEED, Math.max(t.min, incoming * t.gain + t.add) * bounceMul);
}

/**
 * The velocity a bumper gives the gummy: out along the line from the bumper's centre to the gummy's centre `(dx, dy)`, at
 * `bumperSpeed`. A zero offset (the centres coincide) kicks straight up.
 */
export function bumperKick(kind: BumperKind, dx: number, dy: number, incoming: number, bounceMul = 1): { x: number; y: number } {
  const len = Math.hypot(dx, dy);
  const ux = len > 1e-6 ? dx / len : 0;
  const uy = len > 1e-6 ? dy / len : 1;
  const sp = bumperSpeed(kind, incoming, bounceMul);
  return { x: ux * sp, y: uy * sp };
}
