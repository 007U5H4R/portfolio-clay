/** Capability + exclusion gating for the Paper Trail cursor (S29, EVAL-028). Pure; tiny enough for first-load. */
export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export interface CursorEnv {
  finePointer: boolean;
  reducedMotion: boolean;
  /** The window `load` event has fired. */
  loaded: boolean;
}

export function shouldMountCursor(env: CursorEnv): boolean {
  return env.finePointer && !env.reducedMotion && env.loaded;
}

/** cursor.md §33 zones, plus an open modal dialog (the Ask drawer; §44 — the cursor never sits above it). */
export const ZONE_SELECTOR =
  "input, textarea, select, button, video, iframe, [contenteditable], [data-no-trail], dialog[open]";

export function isExcludedTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(ZONE_SELECTOR) !== null;
}

export function isPrimaryMouseDown(e: { pointerType: string; isPrimary: boolean; button: number }): boolean {
  return e.pointerType === "mouse" && e.isPrimary && e.button === 0;
}
