import { difficultyAt, type Difficulty, type Phase } from "./difficulty";
import type { TargetName } from "./arena";
import type { GameMachine } from "./state-machine";
import { recordRun, unlock, type AchievementId } from "./storage";
import type { PowerChip, RunSummary } from "./store";

/**
 * The Gummy Lab rules engine (gummy-bear.md §15–23, §32–35): survival clock, danger countdown and
 * rescue, score + combo, power-ups, the four meta targets and TP MODE, achievements, results. Pure
 * TypeScript with no three.js — the scene feeds it `{ inDanger }` every frame and calls `action()` /
 * `collect()` / `hitTarget()` on physics events, and reads `snapshot()` / `env()` back. Unit-tested
 * (tests/unit/lab-engine.test.ts).
 */
export const DANGER_SECONDS = 1.2;
export const COMBO_MAX = 10;
export const COMBO_HOLD_S = 3;
export const SURVIVAL_POINTS_PER_S = 10;
export const COUNTDOWN_S = 3;
const DANGER_RECOVERY_PER_S = 0.6;
const FARM_WINDOW_S = 2;

export type ActionKind = "pad" | "ring" | "bumper" | "star" | "target" | "save" | "droplet";
export const ACTION_POINTS: Record<ActionKind, number> = { pad: 25, ring: 100, bumper: 30, star: 150, target: 200, save: 100, droplet: 50 };

export type PowerUpType = "SUPER_SQUISH" | "LOW_GRAVITY" | "RAINBOW" | "GOLDEN" | "TIME_FREEZE";
export const POWER_SECONDS: Record<PowerUpType, number> = { SUPER_SQUISH: 8, LOW_GRAVITY: 7, RAINBOW: 7, GOLDEN: 6, TIME_FREEZE: 3 };
export const SUPER_SQUISH_MULTIPLIER = 2.1;

export type EngineEvent =
  | { type: "phase"; phase: Phase; label: string }
  | { type: "danger" }
  | { type: "save" }
  | { type: "powerup"; power: PowerUpType }
  | { type: "powerup-end"; power: PowerUpType }
  | { type: "tp-mode" }
  | { type: "achievement"; id: AchievementId }
  | { type: "game-over" }
  | { type: "combo"; combo: number };

export interface EngineEnv extends Difficulty {
  rainbow: number;
  gold: number;
  lowGravity: number;
  tpGlow: number;
  bounceMul: number;
  superSquish: boolean;
}

export interface EngineSnapshot {
  score: number;
  combo: number;
  timeS: number;
  dangerLeft: number | null;
  countdown: number;
  powers: PowerChip[];
  tpMode: boolean;
}

export function statusFor({ timeS, tpMode }: { timeS: number; tpMode: boolean }): string {
  if (tpMode) return "TP-certified. The gummy is thrilled.";
  if (timeS >= 45) return "Certified Gummy Operator";
  if (timeS >= 25) return "A solid wobble.";
  if (timeS >= 10) return "The gummy survived... mostly.";
  return "The gummy survived... briefly.";
}

export class GameEngine {
  onEvent: ((e: EngineEvent) => void) | undefined;

  private time = 0;
  private survival = 0;
  private bonus = 0;
  private chain = 0;
  private maxCombo = 1;
  private sinceAction = 0;
  private decay = 0;
  private lastActionId: string | number | undefined;
  private lastActionAt = -Infinity;
  private dangerLeft = DANGER_SECONDS;
  private inDangerFor = 0;
  private saves = 0;
  private powerUps = 0;
  private powers = new Map<PowerUpType, number>();
  private targets = new Set<TargetName>();
  private tpMode = false;
  private phase: Phase = 0;
  private countdownLeft = COUNTDOWN_S;
  private diff: Difficulty = difficultyAt(0);

  constructor(private readonly machine: GameMachine) {}

  private emit(e: EngineEvent) {
    this.onEvent?.(e);
  }

  private achieve(id: AchievementId) {
    if (unlock(id)) this.emit({ type: "achievement", id });
  }

  /** The visitor arrived: CURIOUS MIND (once). */
  discover() {
    this.achieve("CURIOUS_MIND");
  }

  /** The hidden in-world portal (or other secret) was used: YOU REALLY FOUND IT. */
  foundHiddenInteraction() {
    this.achieve("YOU_REALLY_FOUND_IT");
  }

  /** Reset every run-scoped value (the stored best/achievements stay). Call after PLAY/REPLAY → COUNTDOWN. */
  beginRun() {
    this.time = 0;
    this.survival = 0;
    this.bonus = 0;
    this.chain = 0;
    this.maxCombo = 1;
    this.sinceAction = 0;
    this.decay = 0;
    this.lastActionId = undefined;
    this.lastActionAt = -Infinity;
    this.dangerLeft = DANGER_SECONDS;
    this.inDangerFor = 0;
    this.saves = 0;
    this.powerUps = 0;
    this.powers.clear();
    this.targets.clear();
    this.tpMode = false;
    this.phase = 0;
    this.countdownLeft = COUNTDOWN_S;
    this.diff = difficultyAt(0);
  }

  get combo(): number {
    return Math.max(1, Math.min(COMBO_MAX, this.chain));
  }

  scoreMultiplier(): number {
    return (this.powers.has("GOLDEN") ? 2 : 1) * (this.powers.has("RAINBOW") ? 1.5 : 1) * (this.tpMode ? 1.5 : 1);
  }

  update(rawDt: number, input: { inDanger: boolean }) {
    const dt = Math.min(rawDt, 0.1);
    const state = this.machine.state;
    if (state === "COUNTDOWN") {
      this.countdownLeft -= rawDt;
      if (this.countdownLeft <= 0) this.machine.send("COUNTDOWN_DONE");
      return;
    }
    if (!this.machine.running) return;

    this.time += dt;
    this.survival += dt * SURVIVAL_POINTS_PER_S;
    this.diff = difficultyAt(this.time);
    if (this.diff.phase !== this.phase) {
      this.phase = this.diff.phase;
      this.emit({ type: "phase", phase: this.phase, label: this.diff.label });
    }
    if (this.time >= 30) this.achieve("GUMMY_OPERATOR");

    for (const [type, left] of this.powers) {
      const next = left - dt;
      if (next <= 0) {
        this.powers.delete(type);
        this.emit({ type: "powerup-end", power: type });
      } else this.powers.set(type, next);
    }

    this.sinceAction += dt;
    if (this.chain > 0 && this.sinceAction > COMBO_HOLD_S) {
      this.decay += dt;
      while (this.decay >= 1 && this.chain > 0) {
        this.chain -= 1;
        this.decay -= 1;
      }
    } else this.decay = 0;

    if (input.inDanger) {
      if (this.machine.state === "PLAYING") {
        this.machine.send("DANGER_ENTER");
        this.inDangerFor = 0;
        this.emit({ type: "danger" });
      }
      this.inDangerFor += dt;
      this.dangerLeft -= dt * this.diff.dangerRate;
      if (this.dangerLeft <= 0) {
        this.dangerLeft = 0;
        this.machine.send("TIME_UP");
        this.emit({ type: "game-over" });
      }
    } else {
      if (this.machine.state === "DANGER") {
        this.machine.send("DANGER_EXIT");
        // A real rescue: it was a close call (under 75% of the timer left) after a moment in the zone.
        if (this.inDangerFor >= 0.3 && this.dangerLeft < DANGER_SECONDS * 0.75) {
          this.saves += 1;
          this.emit({ type: "save" });
          this.action("save", `save-${this.saves}`);
        }
        this.inDangerFor = 0;
      }
      this.dangerLeft = Math.min(DANGER_SECONDS, this.dangerLeft + dt * DANGER_RECOVERY_PER_S);
    }
  }

  /** A useful action (pad, bumper, ring, star, target, save). Returns the points awarded. */
  action(kind: ActionKind, id?: string | number): number {
    const farm = id !== undefined && id === this.lastActionId && this.time - this.lastActionAt < FARM_WINDOW_S;
    this.lastActionId = id;
    this.lastActionAt = this.time;
    if (!farm) {
      this.chain = Math.min(COMBO_MAX, this.chain + 1);
      this.sinceAction = 0;
      this.decay = 0;
      const c = this.combo;
      if (c > this.maxCombo) {
        this.maxCombo = c;
        this.emit({ type: "combo", combo: c });
      }
      if (this.chain >= COMBO_MAX) this.achieve("WOBBLE_MASTER");
    }
    const points = ACTION_POINTS[kind] * (farm ? 0.2 : this.combo) * this.scoreMultiplier();
    this.bonus += points;
    return points;
  }

  /** Rings and stars chain; droplets are a small bonus and top up the danger timer (no chain). */
  collect(kind: "ring" | "star" | "droplet", id: string | number) {
    if (kind === "droplet") {
      this.bonus += ACTION_POINTS.droplet * this.scoreMultiplier();
      if (this.machine.state === "DANGER") this.dangerLeft = Math.min(DANGER_SECONDS, this.dangerLeft + 0.6);
      return;
    }
    this.action(kind, id);
  }

  hitTarget(name: TargetName) {
    this.action("target", name);
    this.targets.add(name);
    if (this.targets.size === 4 && !this.tpMode) {
      this.tpMode = true;
      this.bonus += 500;
      this.emit({ type: "tp-mode" });
      this.achieve("PRODUCT_SENSE");
    }
  }

  activate(type: PowerUpType) {
    this.powers.set(type, POWER_SECONDS[type]);
    this.powerUps += 1;
    this.emit({ type: "powerup", power: type });
  }

  /** The next squish/bounce: the Super Squish multiplier once, then back to 1. */
  consumeSuperSquish(): number {
    if (!this.powers.has("SUPER_SQUISH")) return 1;
    this.powers.delete("SUPER_SQUISH");
    this.emit({ type: "powerup-end", power: "SUPER_SQUISH" });
    return SUPER_SQUISH_MULTIPLIER;
  }

  env(): EngineEnv {
    const d = this.diff;
    const low = this.powers.has("LOW_GRAVITY");
    const freeze = this.powers.has("TIME_FREEZE");
    const rainbow = this.powers.has("RAINBOW");
    return {
      ...d,
      gravityMul: d.gravityMul * (low ? 0.4 : 1),
      motion: d.motion * (freeze ? 0.15 : 1),
      windX: d.windX * (freeze ? 0.15 : 1),
      vanish: d.vanish && !freeze,
      rainbow: rainbow ? 1 : 0,
      gold: this.powers.has("GOLDEN") ? 1 : 0,
      lowGravity: low ? 1 : 0,
      tpGlow: this.tpMode ? 1 : 0,
      bounceMul: rainbow ? 1.15 : 1,
      superSquish: this.powers.has("SUPER_SQUISH"),
    };
  }

  snapshot(): EngineSnapshot {
    return {
      score: Math.floor(this.survival + this.bonus),
      combo: this.combo,
      timeS: this.time,
      dangerLeft: this.machine.state === "DANGER" ? this.dangerLeft : null,
      countdown: Math.max(0, Math.ceil(this.countdownLeft)),
      powers: [...this.powers].map(([type, left]) => ({ type, left })),
      tpMode: this.tpMode,
    };
  }

  summary(): Omit<RunSummary, "newBest" | "best" | "status"> {
    return {
      score: Math.floor(this.survival + this.bonus),
      timeS: Math.floor(this.time),
      combo: this.maxCombo,
      targets: this.targets.size,
      powerUps: this.powerUps,
      saves: this.saves,
    };
  }

  /** GAME_OVER → RESULTS: persist the best (localStorage only) and build the results summary. */
  finish(): RunSummary {
    this.machine.send("SHOW_RESULTS");
    const base = this.summary();
    const { stored, newBest } = recordRun({ score: base.score, timeS: base.timeS, combo: base.combo });
    return {
      ...base,
      newBest,
      best: { score: stored.bestScore, timeS: stored.bestTime, combo: stored.maxCombo },
      status: statusFor({ timeS: this.time, tpMode: this.tpMode }),
    };
  }
}

