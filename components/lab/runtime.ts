import { createContext, useContext } from "react";
import type { RapierRigidBody } from "@react-three/rapier";
import type { ArenaSpec, PadSpec, TargetName } from "@/lib/lab/arena";
import type { GummyPhysicsState } from "@/lib/lab/gummy-state";
import type { Jelly } from "@/lib/lab/jelly";
import type { ParticlePool } from "@/lib/lab/particles";
import type { LabStoreApi } from "@/lib/lab/store";
import type { TierConfig } from "@/lib/lab/tiers";
import type { CandyPalette } from "@/lib/lab/tokens";

/**
 * Per-mount mutable state shared by the scene parts (gummy-bear.md §39: per-frame values live in
 * refs, never in React state). One `LabRuntime` is created when the scene mounts and dropped with it,
 * so repeated enter/exit cycles leave nothing behind.
 */
export interface BearKinematics {
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
  dragged: boolean;
  squishing: boolean;
  charge: number;
  /** seconds since the last launch/bounce */
  sinceBounce: number;
  /** seconds airborne without a contact */
  fallTime: number;
  inDanger: boolean;
  state: GummyPhysicsState;
}

/** Difficulty-driven environment knobs (written by the engine driver, read by arena parts). */
export interface EnvKnobs {
  phase: number;
  /** Platform slide amplitude scale (0 = static). */
  motion: number;
  gravityMul: number;
  windX: number;
  dangerRise: number;
  /** Disappearing platforms active. */
  vanish: boolean;
  /** Visual power-up/mode flags. */
  rainbow: number;
  gold: number;
  lowGravity: number;
  tpGlow: number;
}

export interface LabHooks {
  impact(speed: number, dirX: number, dirY: number, x: number, y: number): void;
  pad(spec: PadSpec, x: number, y: number): void;
  bumper(id: string, x: number, y: number): void;
  target(id: TargetName, x: number, y: number): void;
  portal(): void;
  /** A rapier sensor overlap with a collectible. */
  pickup(id: number): void;
  squish(charge: number, super_: boolean): void;
  drag(): void;
  flick(): void;
  tap(): void;
}

export interface ExitSequence {
  via: "portal" | "button";
  t: number;
}

export interface LabRuntime {
  palette: CandyPalette;
  tier: TierConfig;
  reducedMotion: boolean;
  arena: ArenaSpec;
  store: LabStoreApi;
  jelly: Jelly;
  particles: ParticlePool;
  bear: BearKinematics;
  env: EnvKnobs;
  hooks: LabHooks;
  bearBody: { current: RapierRigidBody | null };
  /** Seconds of simulated scene time (drives shader time / ambient motion). */
  time: number;
  /** Screen-shake amount 0–1 (ignored under reduced motion). */
  shake: number;
  /** Camera zoom pulse 0–1 for special moments. */
  zoom: number;
  /** 0 = intro framing, 1 = play framing; eased by the camera rig. */
  introBlend: number;
  /** Melt (game over) progress 0–1 and reform progress 0–1. */
  melt: number;
  reform: number;
  exit: ExitSequence | null;
  /** Pointer in world units (z = 0 plane), for the eyes. */
  pointer: { x: number; y: number; active: boolean };
  /** Intro poke pulse 0–1 (decays). */
  poke: number;
  /** Boost multipliers set by power-ups. */
  bounceMul: number;
  superSquish: boolean;
  /** Called once when the intro bear is poked, etc. */
  onAsset(status: "ready" | "failed"): void;
}

export const RuntimeContext = createContext<LabRuntime | null>(null);

export function useRuntime(): LabRuntime {
  const rt = useContext(RuntimeContext);
  if (!rt) throw new Error("useRuntime outside <GameScene>");
  return rt;
}

export function createBear(): BearKinematics {
  return {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    grounded: false,
    dragged: false,
    squishing: false,
    charge: 0,
    sinceBounce: Infinity,
    fallTime: 0,
    inDanger: false,
    state: "AIRBORNE",
  };
}

export function createEnv(): EnvKnobs {
  return { phase: 0, motion: 0, gravityMul: 1, windX: 0, dangerRise: 0, vanish: false, rainbow: 0, gold: 0, lowGravity: 0, tpGlow: 0 };
}

export const noopHooks: LabHooks = {
  impact() {},
  pad() {},
  bumper() {},
  target() {},
  portal() {},
  pickup() {},
  squish() {},
  drag() {},
  flick() {},
  tap() {},
};
