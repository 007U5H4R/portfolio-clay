/**
 * The difficulty ramp (gummy-bear.md §20): a pure function of survival time, so it is trivial to test
 * and to keep fair. Phases: 0 calm · 1 the arena moves · 2 dynamic physics · 3 chaos · 4 LAB UNSTABLE.
 * Everything is eased and bounded — the ramp never makes survival impossible.
 */
export type Phase = 0 | 1 | 2 | 3 | 4;

export interface Difficulty {
  phase: Phase;
  label: string;
  /** Platform slide scale: 0 static … ≤ 2. */
  motion: number;
  /** Multiplier on the arena gravity (0.5–1.45). */
  gravityMul: number;
  /** Horizontal wind acceleration (u/s²). */
  windX: number;
  /** How far the danger floor has risen (world units, ≤ 0.95). */
  dangerRise: number;
  /** Disappearing platforms are active. */
  vanish: boolean;
  /** Bounce pads drift sideways (−1…1 of a quarter-arena), repositioning them in phase ≥ 3. */
  padShift: number;
  /** Danger countdown speed (1 = real time). */
  dangerRate: number;
}

const LABELS = ["CALM", "THE ARENA MOVES", "DYNAMIC", "CHAOS", "LAB UNSTABLE"] as const;

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

export function phaseAt(t: number): Phase {
  return t < 10 ? 0 : t < 20 ? 1 : t < 35 ? 2 : t < 50 ? 3 : 4;
}

export function difficultyAt(t: number): Difficulty {
  const phase = phaseAt(t);
  let motion = 0;
  if (phase === 1) motion = 0.8 * smooth((t - 10) / 3);
  else if (phase === 2) motion = 0.9;
  else if (phase === 3) motion = 1.2;
  else if (phase === 4) motion = Math.min(2, 1.3 + (t - 50) * 0.01);

  let gravityMul = 1;
  if (phase === 2) {
    // stronger gravity pulses
    gravityMul = 1 + 0.35 * Math.max(0, Math.sin(((t - 20) / 6) * Math.PI * 2));
  } else if (phase >= 3) {
    // low-gravity shifts: seconds 3–7 of each 10 s cycle float, with a slow wobble on top in unstable
    const cyc = (t - 35) % 10;
    const float = smooth((cyc - 2.5) / 1.5) * (1 - smooth((cyc - 7) / 1.5));
    gravityMul = 1 - 0.45 * float;
    if (phase === 4) gravityMul += 0.12 * Math.sin(t / 2.5);
    gravityMul = Math.min(1.45, Math.max(0.5, gravityMul));
  }

  const windX = phase >= 2 ? (phase >= 3 ? 1.8 : 1.2) * Math.sin(t * 0.5) : 0;

  let dangerRise = 0;
  if (t >= 35 && t < 50) dangerRise = 0.5 * ((t - 35) / 15);
  else if (t >= 50) dangerRise = Math.min(0.95, 0.5 + (t - 50) * 0.01);

  return {
    phase,
    label: LABELS[phase],
    motion,
    gravityMul,
    windX,
    dangerRise,
    vanish: phase >= 2,
    padShift: phase >= 3 ? Math.sin((t - 35) / 10 * Math.PI) : 0,
    dangerRate: 1 + Math.min(0.3, phase * 0.05 + Math.max(0, t - 50) * 0.002),
  };
}
