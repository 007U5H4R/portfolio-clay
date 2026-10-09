/**
 * The manual nudge (TASK-185, Tushar 2026-10-08: "when the gummy bear is stuck, there has to be some button ... which vibrates
 * the pinball"). Real pinball lets you shove the cabinet; here it gives the gummy a physical kick (up, with a random sideways
 * lean) and a short table shake. Pure state: a cooldown so it cannot be spammed into a cheat, and a playful TILT when it is
 * pressed three times inside 3.5 seconds (no penalty beyond the cooldown). The controller steps it once per fixed physics
 * step and applies the kick to the body; the scene and HUD read `cooling` / `progress`.
 */
export const NUDGE_COOLDOWN_S = 1.5;
/** Upward speed a nudge adds, and the most it leans sideways (fraction of that speed). */
export const NUDGE_UP = 7;
export const NUDGE_LEAN_MIN = 0.15;
export const NUDGE_LEAN_MAX = 0.8;
export const TILT_COUNT = 3;
/** 3 nudges inside this window tilt. The cooldown alone makes three presses take 3 s, so a player mashing the button as soon as it recharges gets there. */
export const TILT_WINDOW_S = 3.5;

export interface NudgeKick {
  /** Velocity to add (x) and the floor-then-add speed upward (y). */
  x: number;
  y: number;
  /** True when this press is the third inside the tilt window. */
  tilt: boolean;
}

export class NudgeState {
  /** Seconds left before the next nudge is allowed. */
  cooldown = 0;
  private clock = 0;
  private readonly presses: number[] = [];

  /** Advance by one physics step. */
  step(dt: number) {
    this.clock += dt;
    this.cooldown = Math.max(0, this.cooldown - dt);
  }

  get cooling(): boolean {
    return this.cooldown > 0;
  }

  /** 0 just after a nudge … 1 when it is ready again (the recharge the button shows). */
  get progress(): number {
    return 1 - this.cooldown / NUDGE_COOLDOWN_S;
  }

  /** Try to nudge. Returns the kick, or null while cooling down. `rand` is 0..1 (injected so tests are deterministic). */
  fire(rand: () => number = Math.random): NudgeKick | null {
    if (this.cooldown > 0) return null;
    this.cooldown = NUDGE_COOLDOWN_S;
    this.presses.push(this.clock);
    while (this.presses.length && this.clock - this.presses[0]! > TILT_WINDOW_S) this.presses.shift();
    const tilt = this.presses.length >= TILT_COUNT;
    if (tilt) this.presses.length = 0;
    const side = rand() < 0.5 ? -1 : 1;
    return { x: side * NUDGE_UP * (NUDGE_LEAN_MIN + (NUDGE_LEAN_MAX - NUDGE_LEAN_MIN) * rand()), y: NUDGE_UP, tilt };
  }

  reset() {
    this.cooldown = 0;
    this.clock = 0;
    this.presses.length = 0;
  }
}
