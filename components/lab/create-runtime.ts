import { buildArena, portraitHalfWidth } from "@/lib/lab/arena";
import { NudgeState } from "@/lib/lab/nudge";
import { newFlipperState } from "@/lib/lab/flippers";
import { LabAudio } from "./audio";
import { GameEngine } from "@/lib/lab/engine";
import { Spawner } from "@/lib/lab/spawner";
import { Jelly } from "@/lib/lab/jelly";
import { ParticlePool } from "@/lib/lab/particles";
import { Plunger } from "@/lib/lab/plunger";
import { TrailBuffer } from "@/lib/lab/trail";
import type { LabStoreApi } from "@/lib/lab/store";
import { detectTier, readDevice, tierConfig } from "@/lib/lab/tiers";
import { readPalette } from "@/lib/lab/tokens";
import { createBear, createEnv, createTuning, noopHooks, type LabRuntime } from "./runtime";

/** Build the per-mount runtime (browser only): palette from the live theme, tier from the device. */
export function createRuntime(store: LabStoreApi): LabRuntime {
  const device = readDevice();
  const reducedMotion = device.reducedMotion ?? false;
  const tier = tierConfig(detectTier(device), reducedMotion);
  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  const arena = buildArena(portraitHalfWidth(aspect), tier.simplifiedArena);
  return {
    palette: readPalette(),
    tier,
    reducedMotion,
    arena,
    store,
    engine: new GameEngine(store.getState().machine),
    audio: new LabAudio(),
    spawner: new Spawner(arena.anchors),
    requestExit: () => {},
    jelly: new Jelly(),
    // Reduced motion: no particles at all (capacity 0 draws and emits nothing) and a trail that records nothing.
    particles: new ParticlePool(reducedMotion ? 0 : tier.particles),
    plunger: new Plunger(),
    touchPlunger: false,
    syncInput: () => {},
    trail: Object.assign(new TrailBuffer(), { enabled: !reducedMotion }),
    sinceLaunch: Infinity,
    launched: false,
    laneGateShut: false,
    nudge: new NudgeState(),
    nudgeRequested: false,
    popup: () => {},
    trailFlash: 0,
    scene: null,
    renderInfo: () => ({ calls: 0, triangles: 0 }),
    dom: { portal: null, plunger: null, plaque: null },
    blackHoleHover: false,
    bear: createBear(),
    flippers: arena.flippers.map((layout) => ({ layout, state: newFlipperState(), pressed: false, cooldown: 0, flash: 0, body: { current: null } })) as LabRuntime["flippers"],
    env: createEnv(),
    hooks: { ...noopHooks },
    bearBody: { current: null },
    time: 0,
    shake: 0,
    zoom: 0,
    introBlend: 0,
    project: (x, y) => ({ x, y }),
    resultsScale: 1.15,
    melt: 0,
    reform: 0,
    exit: null,
    pointer: { x: 0, y: 0, active: false },
    poke: 0,
    tune: createTuning(),
    gummyMaterial: { current: null },
    bounceMul: 1,
    superSquish: false,
    onAsset: () => {},
  };
}
