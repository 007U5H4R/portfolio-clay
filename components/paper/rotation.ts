import type { CSSProperties } from "react";

/** Rotation caps, degrees (Design.md §3.1 / §2.3 — "never more"). */
export const ROTATION_CAP = { sticky: 5, annotation: 4, note: 6, tape: 12 } as const;

/**
 * `--rot` for a paper decoration, clamped to ±`cap` (S70.02). Always set inline — never left to
 * inherit — so a decoration inside a rotated host never picks up the host's `--rot`.
 */
export function rotationStyle(rotate: number | undefined, fallback: number, cap: number): CSSProperties {
  const value = rotate !== undefined && Number.isFinite(rotate) ? rotate : fallback;
  const clamped = Math.max(-cap, Math.min(cap, value));
  return { "--rot": `${clamped}deg` } as CSSProperties;
}
