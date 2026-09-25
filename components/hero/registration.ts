import type { CSSProperties } from "react";

/**
 * Registration of the 1280×684 hero clip on the 3168×1344 banner (TKT-93; decision EXE-15). The
 * orchestrator's masked-overlay prototype measured the clip sitting on the outpaint at scale 1.912,
 * offset x 362 / y 6 (character diff 7.8/255; first, mid and last frames composite without a seam).
 * This module is the ONE place those numbers live: `Hero` turns them into `--clip-*` inline variables
 * on the clip slot inside the banner canvas (app/globals.css `.hero-clip-slot`), and
 * `tests/e2e/eval-019.spec.ts` imports them to assert the video's bounding box against the canvas
 * (±2 px at 1024 / 1440 / 1920 — the registration regression guard). Pure TypeScript, no JSX or
 * image imports, so Playwright can load it.
 */
export const BANNER_SIZE = { width: 3168, height: 1344 } as const;
export const CLIP_SIZE = { width: 1280, height: 684 } as const;
export const CLIP_PLACEMENT = { scale: 1.912, x: 362, y: 6 } as const;

/** The clip's box as percentages of the banner canvas: left 11.4268 · top 0.4464 · width 77.2525 · height 97.3071. */
export const CLIP_REGISTRATION = {
  left: (CLIP_PLACEMENT.x / BANNER_SIZE.width) * 100,
  top: (CLIP_PLACEMENT.y / BANNER_SIZE.height) * 100,
  width: ((CLIP_SIZE.width * CLIP_PLACEMENT.scale) / BANNER_SIZE.width) * 100,
  height: ((CLIP_SIZE.height * CLIP_PLACEMENT.scale) / BANNER_SIZE.height) * 100,
} as const;

const pct = (value: number): string => `${value.toFixed(4)}%`;

/** Inline `--clip-*` variables for `.hero-clip-slot` (four decimals — sub-pixel at 1920). */
export function clipSlotStyle(): CSSProperties {
  return {
    "--clip-left": pct(CLIP_REGISTRATION.left),
    "--clip-top": pct(CLIP_REGISTRATION.top),
    "--clip-width": pct(CLIP_REGISTRATION.width),
    "--clip-height": pct(CLIP_REGISTRATION.height),
  } as CSSProperties;
}
