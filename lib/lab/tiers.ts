/**
 * Device quality tiers (gummy-bear.md §38–39): the same game everywhere, with the expensive extras
 * (transmission, shadows, particle count, DPR ceiling, arena complexity) scaled to the device.
 */
export type Tier = "high" | "mid" | "low";

export interface TierConfig {
  tier: Tier;
  /** Upper bound for the canvas device-pixel-ratio (adaptive DPR drops below it under load). */
  maxDpr: number;
  /** Real screen-space refraction (`transmission`) vs the cheap translucent look. */
  transmission: boolean;
  /** Maximum live particles. */
  particles: number;
  /** Tablet/phone arena: fewer moving parts. */
  simplifiedArena: boolean;
  antialias: boolean;
}

export interface DeviceInfo {
  coarsePointer: boolean;
  /** CSS px of the short viewport side. */
  shortSide: number;
  cores?: number | undefined;
  memoryGb?: number | undefined;
  reducedMotion?: boolean | undefined;
}

export function detectTier(d: DeviceInfo): Tier {
  const weak = (d.cores !== undefined && d.cores <= 4) || (d.memoryGb !== undefined && d.memoryGb <= 4);
  if (d.coarsePointer && d.shortSide < 600) return "low";
  if (d.coarsePointer) return weak ? "low" : "mid";
  return weak ? "mid" : "high";
}

export function tierConfig(tier: Tier, reducedMotion = false): TierConfig {
  const base: Record<Tier, TierConfig> = {
    high: { tier, maxDpr: 2, transmission: true, particles: 64, simplifiedArena: false, antialias: true },
    mid: { tier, maxDpr: 1.5, transmission: false, particles: 40, simplifiedArena: true, antialias: true },
    low: { tier, maxDpr: 1.25, transmission: false, particles: 24, simplifiedArena: true, antialias: false },
  };
  const cfg = { ...base[tier] };
  // Reduced motion (§40): fewer particles. The game stays fully playable.
  if (reducedMotion) cfg.particles = Math.max(8, Math.round(cfg.particles * 0.35));
  return cfg;
}

/** Reads the live device (browser only). */
export function readDevice(): DeviceInfo {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    coarsePointer: window.matchMedia?.("(pointer: coarse)").matches ?? false,
    shortSide: Math.min(window.innerWidth, window.innerHeight),
    cores: nav.hardwareConcurrency,
    memoryGb: nav.deviceMemory,
    reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  };
}

/** Adaptive DPR step: lower on a slow average frame, recover when there is headroom. */
export function nextDpr(current: number, avgFrameMs: number, min: number, max: number): number {
  if (avgFrameMs > 22 && current > min) return Math.max(min, +(current - 0.25).toFixed(2));
  if (avgFrameMs < 14 && current < max) return Math.min(max, +(current + 0.25).toFixed(2));
  return current;
}
