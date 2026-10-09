/**
 * The launch plunger (TASK-185, spec §15–17). Pure maths + a tiny state machine, no three/rapier: Space (or a held
 * touch on the plunger) charges for up to MAX_CHARGE_MS, releasing launches the gummy with a force that grows with the
 * charge, and the scene turns that force into an impulse on the gummy's physics body (never just an animation).
 *
 * Units: `force` is the launch speed the impulse gives the gummy (impulse per unit mass, u/s). MIN_FORCE is tuned so a
 * 0% launch still clears the lane and rolls onto the table, MAX_FORCE so a 100% launch reaches the top ramp with energy
 * to spare (lib/lab/arena.ts builds the lane; tests/unit/lab-plunger.test.ts holds the ballistic check).
 */
export const MAX_CHARGE_MS = 1500;
export const MIN_FORCE = 21;
export const MAX_FORCE = 27.5;
/** Seconds the plunger takes to snap forward after a release (the visual follows the real launch). */
export const SNAP_S = 0.09;
/** Charge above which the meter shows MAX POWER. */
export const MAX_POWER_AT = 0.995;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** 0 → 1 over MAX_CHARGE_MS. */
export function chargeProgress(elapsedMs: number): number {
  return clamp01(elapsedMs / MAX_CHARGE_MS);
}

/** MIN_FORCE at 0% … MAX_FORCE at 100%. */
export function launchForce(progress: number): number {
  return MIN_FORCE + clamp01(progress) * (MAX_FORCE - MIN_FORCE);
}

/** The height (u) a gummy leaving the plunger at `force` rises under gravity `g` (frictionless): v² / 2g. */
export function launchApex(force: number, g: number): number {
  return (force * force) / (2 * Math.abs(g));
}

/** Meter segments lit for a charge: 0 at rest, `segments` at full. */
export function litSegments(progress: number, segments: number): number {
  return Math.min(segments, Math.max(0, Math.ceil(clamp01(progress) * segments - 1e-9)));
}

/** Seconds the meter keeps showing the launched value after a release, fading, so the eye can read it. */
export const METER_HOLD_S = 0.7;

export type PlungerPhase = "idle" | "charging" | "snapping";

export class Plunger {
  phase: PlungerPhase = "idle";
  /** Milliseconds held so far. */
  elapsedMs = 0;
  /** How far back the plunger was when it was released (for the snap animation). */
  releasedAt = 0;
  /** The 0–1 charge the last release launched with, and the seconds since (the meter's afterglow). */
  releasedProgress = 0;
  sinceRelease = Infinity;
  private snap = 0;

  get progress(): number {
    return chargeProgress(this.elapsedMs);
  }

  /** How far the plunger is pulled back, 0 (extended) … 1 (fully compressed), eased like a spring being squeezed. */
  get pull(): number {
    if (this.phase === "snapping") return this.releasedAt * Math.max(0, 1 - this.snap / SNAP_S);
    const p = this.progress;
    return p * (2 - p) * 0.6 + p * 0.4;
  }

  /** What the power meter shows: the live charge while held, then the launched value fading out. */
  get meter(): number {
    if (this.phase === "charging") return this.progress;
    return this.releasedProgress * clamp01(1 - this.sinceRelease / METER_HOLD_S);
  }

  get charging(): boolean {
    return this.phase === "charging";
  }

  /** Start (or keep) charging. A press during the snap-forward is ignored until it lands. */
  press(): void {
    if (this.phase === "idle") {
      this.phase = "charging";
      this.elapsedMs = 0;
    }
  }

  /** Advance by `dtMs` of simulated time. */
  step(dtMs: number): void {
    if (this.phase !== "charging") this.sinceRelease += dtMs / 1000;
    if (this.phase === "charging") this.elapsedMs = Math.min(MAX_CHARGE_MS, this.elapsedMs + dtMs);
    else if (this.phase === "snapping") {
      this.snap += dtMs / 1000;
      if (this.snap >= SNAP_S) {
        this.phase = "idle";
        this.snap = 0;
        this.releasedAt = 0;
      }
    }
  }

  /** Let go: the launch force for the charge held (null if nothing was charging). */
  release(): number | null {
    if (this.phase !== "charging") return null;
    const p = this.progress;
    this.releasedAt = this.pull;
    this.releasedProgress = p;
    this.sinceRelease = 0;
    this.phase = "snapping";
    this.snap = 0;
    this.elapsedMs = 0;
    return launchForce(p);
  }

  /** Abandon a charge with no launch (pause, blur, game over). */
  cancel(): void {
    this.phase = "idle";
    this.elapsedMs = 0;
    this.snap = 0;
    this.releasedAt = 0;
    this.releasedProgress = 0;
    this.sinceRelease = Infinity;
  }
}
