/**
 * Jelly deformation model (gummy-bear.md §14): impact → compression → overshoot → oscillation →
 * damping → rest, as a handful of damped springs that drive the GLB's morph targets. The body stays
 * a rigid collider; softness is this model + the shader ripple. Pure maths so it can be tested and
 * run per frame from a ref without any React state.
 */
export const MORPH_NAMES = [
  "SquishVertical",
  "StretchVertical",
  "SquishHorizontal",
  "BellyImpact",
  "HeadWobbleLeft",
  "HeadWobbleRight",
  "EarBounceLeft",
  "EarBounceRight",
  "ArmLagLeft",
  "ArmLagRight",
  "Happy",
  "Surprised",
  "Worried",
  "Panic",
  "Blink",
] as const;
export type MorphName = (typeof MORPH_NAMES)[number];
export type MorphWeights = Record<MorphName, number>;

/** Runtime caps: the mouth-opening faces read as a scream above this (asset notes, Dev-158). */
export const FACE_OPEN_CAP = 0.6;
export const JELLY_MAX_IMPACT_SPEED = 22;

interface Spring {
  x: number;
  v: number;
  /** stiffness (rad/s)^2 */
  k: number;
  /** damping coefficient */
  c: number;
}

const spring = (freq: number, damping: number): Spring => ({ x: 0, v: 0, k: freq * freq, c: damping });

export function emptyWeights(): MorphWeights {
  return Object.fromEntries(MORPH_NAMES.map((n) => [n, 0])) as MorphWeights;
}

export class Jelly {
  /** Overall energy (0–~1.5) of the last impacts; decays on its own. Also drives the shader ripple. */
  energy = 0;
  /** Direction of the last impact (unit-ish) for the ripple and lean. */
  impactX = 0;
  impactY = 1;
  /** Seconds since the last impact. */
  sinceImpact = 10;
  /** Wobble amplitude scale: 1, or ~0.4 under reduced motion (§40). */
  amplitude = 1;

  private body = spring(16, 5.5); // vertical compress/stretch (+ = compressed)
  private belly = spring(13, 4);
  private head = spring(11, 3.2); // sideways head wobble (signed)
  private earL = spring(14, 2.6);
  private earR = spring(14.5, 2.6);
  private armL = spring(9, 2.4);
  private armR = spring(9.5, 2.4);
  private wide = spring(15, 5); // horizontal squash (+ = widened)

  /** A collision: `speed` along `dir` (unit vector, the direction the bear was moving into the surface). */
  impact(dirX: number, dirY: number, speed: number) {
    const s = Math.min(1, Math.max(0, speed) / JELLY_MAX_IMPACT_SPEED);
    if (s <= 0) return;
    const len = Math.hypot(dirX, dirY) || 1;
    const nx = dirX / len;
    const ny = dirY / len;
    this.energy = Math.min(1.5, this.energy + s * 1.1);
    this.impactX = nx;
    this.impactY = ny;
    this.sinceImpact = 0;
    const a = this.amplitude;
    // Compression along the impact axis: vertical hits squash the body, sideways hits widen/shear it.
    this.body.v += Math.abs(ny) * s * 22 * a;
    this.wide.v += Math.abs(ny) * s * 14 * a - Math.abs(nx) * s * 6 * a;
    this.belly.v += s * 26 * a;
    this.head.v += nx * s * 20 * a + (ny < 0 ? 0 : 0);
    // Follow-through: ears and arms lag the body and keep moving after it stops.
    this.earL.v += (Math.abs(ny) * s * 24 + s * 8) * a;
    this.earR.v += (Math.abs(ny) * s * 22 + s * 9) * a;
    this.armL.v += (-nx * s * 18 + Math.abs(ny) * s * 10) * a;
    this.armR.v += (nx * s * 18 + Math.abs(ny) * s * 10) * a;
  }

  /** Continuous push (e.g. dragging): a sustained offset the springs settle around. */
  nudge(stretch: number) {
    this.body.v -= stretch * 4 * this.amplitude;
  }

  step(dt: number) {
    const d = Math.min(dt, 0.05);
    for (const s of [this.body, this.belly, this.head, this.earL, this.earR, this.armL, this.armR, this.wide]) {
      const a = -s.k * s.x - s.c * s.v;
      s.v += a * d;
      s.x += s.v * d;
    }
    this.sinceImpact += d;
    this.energy *= Math.exp(-2.4 * d);
    if (this.energy < 1e-3) this.energy = 0;
  }

  /** Current morph weights: compress/stretch are the two signs of the body spring. All within [0, 1]. */
  weights(out: MorphWeights = emptyWeights()): MorphWeights {
    const clamp = (x: number, max = 1) => Math.min(max, Math.max(0, x));
    out.SquishVertical = clamp(this.body.x * 0.5);
    out.StretchVertical = clamp(-this.body.x * 0.5);
    out.SquishHorizontal = clamp(this.wide.x * 0.45);
    out.BellyImpact = clamp(Math.abs(this.belly.x) * 0.5);
    out.HeadWobbleLeft = clamp(-this.head.x * 0.5);
    out.HeadWobbleRight = clamp(this.head.x * 0.5);
    out.EarBounceLeft = clamp(Math.abs(this.earL.x) * 0.5);
    out.EarBounceRight = clamp(Math.abs(this.earR.x) * 0.5);
    out.ArmLagLeft = clamp(Math.abs(this.armL.x) * 0.5);
    out.ArmLagRight = clamp(Math.abs(this.armR.x) * 0.5);
    return out;
  }

  /** True once the bear has fully settled (useful to skip work). */
  get resting(): boolean {
    return this.energy === 0 && Math.abs(this.body.x) < 1e-3 && Math.abs(this.body.v) < 1e-3 && Math.abs(this.head.x) < 1e-3;
  }

  reset() {
    this.energy = 0;
    this.sinceImpact = 10;
    for (const s of [this.body, this.belly, this.head, this.earL, this.earR, this.armL, this.armR, this.wide]) {
      s.x = 0;
      s.v = 0;
    }
  }
}
