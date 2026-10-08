import { createContext, useContext } from "react";
import type { RapierRigidBody } from "@react-three/rapier";
import type { MeshPhysicalMaterial } from "three";
import type { ArenaSpec, PadSpec, TargetName } from "@/lib/lab/arena";
import type { FlipperLayout, FlipperSide, FlipperState } from "@/lib/lab/flippers";
import type { LabAudio } from "./audio";
import type { GameEngine } from "@/lib/lab/engine";
import type { Spawner } from "@/lib/lab/spawner";
import type { GummyPhysicsState } from "@/lib/lab/gummy-state";
import type { Jelly } from "@/lib/lab/jelly";
import type { ParticlePool } from "@/lib/lab/particles";
import type { Plunger } from "@/lib/lab/plunger";
import type { TrailBuffer } from "@/lib/lab/trail";
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
  /** Bounce-pad sideways drift in [-1, 1] (phase ≥ 3). */
  padShift: number;
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
  /** A flipper swung into the gummy: `speed` out along the surface normal (nx, ny) at (x, y). */
  flip(side: FlipperSide, speed: number, nx: number, ny: number, x: number, y: number): void;
  /** The intro bear was poked. */
  poke(): void;
  /** The plunger fired: `force` is the launch speed given to the gummy, `progress` the 0–1 charge it was released at. */
  launch(force: number, progress: number, x: number, y: number): void;
  /** A slingshot kicked the gummy. */
  sling(id: string, x: number, y: number): void;
}

/** One flipper: its layout, live swing state, whether it is held, and the kinematic body the arena mounts for it. */
export interface FlipperRuntime {
  layout: FlipperLayout;
  state: FlipperState;
  pressed: boolean;
  /** Seconds until this flipper can hand the gummy another impulse. */
  cooldown: number;
  body: { current: RapierRigidBody | null };
}

/** Live tuning knobs for the `?debug` panel (§47); all 1 by default. */
export interface Tuning {
  gravity: number;
  bounce: number;
  jelly: number;
  flick: number;
  follow: number;
  spawn: number;
  morph: number;
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
  engine: GameEngine;
  audio: LabAudio;
  spawner: Spawner;
  /** Asks the shell to leave the lab (portal / button / ESC) with the exit animation. */
  requestExit(via: "portal" | "button"): void;
  jelly: Jelly;
  particles: ParticlePool;
  bear: BearKinematics;
  /** Left and right flippers (TASK-172). */
  flippers: [FlipperRuntime, FlipperRuntime];
  /** The launch plunger's charge state (TASK-185); the controller steps it, the scene draws it. */
  plunger: Plunger;
  /** A touch is holding the on-screen plunger (set by LaunchControl, read by the controller's `sync`). */
  touchPlunger: boolean;
  /** Re-reads every input source into the flippers and plunger (the controller installs it). */
  syncInput(): void;
  /** The gummy's light trail: a fixed-size ring buffer, off under reduced motion. */
  trail: TrailBuffer;
  /** Seconds since the last launch (Infinity before the first): the lane light and launch streak read it. */
  sinceLaunch: number;
  /** True once this run has launched the gummy at least once (the start plaque is only for before that). */
  launched: boolean;
  /** Show a floating "+100" at a world point. Installed by the HUD overlay; a no-op until then. */
  popup(text: string, x: number, y: number): void;
  /** Draw calls and triangles of the last frame (set by GameScene; read by `?debug` and the profiling notes). */
  renderInfo: () => { calls: number; triangles: number };
  /** 0–1 flash on the trail (a bumper hit or a launch); decays by itself. */
  trailFlash: number;
  /** Elements the HUD overlay registers so the scene can place them over the canvas each frame (no extra rAF loop). */
  dom: { portal: HTMLElement | null; plunger: HTMLElement | null; plaque: HTMLElement | null };
  /** Black-hole exit hover/focus (0/1) the scene eases toward; set by the Back link, read by the scene. */
  blackHoleHover: boolean;
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
  /** World (z = 0) → viewport CSS pixels (canvas offset included), for DOM overlays and tests. Set by the camera rig. */
  project(x: number, y: number): { x: number; y: number };
  /** World scale of the bear on the results screen (set by the camera so it clears the card). */
  resultsScale: number;
  /** Melt (game over) progress 0–1 and reform progress 0–1. */
  melt: number;
  reform: number;
  exit: ExitSequence | null;
  /** Pointer in world units (z = 0 plane), for the eyes. */
  pointer: { x: number; y: number; active: boolean };
  /** Intro poke pulse 0–1 (decays). */
  poke: number;
  tune: Tuning;
  /** The gummy's physical material, exposed so the debug panel can tune transmission/roughness/thickness/IOR. */
  gummyMaterial: { current: MeshPhysicalMaterial | null };
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

export function createTuning(): Tuning {
  return { gravity: 1, bounce: 1, jelly: 1, flick: 1, follow: 1, spawn: 1, morph: 1 };
}

export function createEnv(): EnvKnobs {
  return { phase: 0, motion: 0, gravityMul: 1, windX: 0, dangerRise: 0, vanish: false, padShift: 0, rainbow: 0, gold: 0, lowGravity: 0, tpGlow: 0 };
}

export const noopHooks: LabHooks = {
  impact() {},
  pad() {},
  bumper() {},
  target() {},
  portal() {},
  pickup() {},
  squish() {},
  flip() {},
  poke() {},
  launch() {},
  sling() {},
};
