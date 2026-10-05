/** Paper Trail tunables (cursor.md §7) — one place, so tuning never touches the logic. */
export const SPACING = 110;
export const LIFETIME = 1150;
export const MAX_PER_MOVE = 5;
export const MAX_ACTIVE = 18;
export const MIN_WIDTH = 72;
export const MAX_WIDTH = 125;
/** Pointer speed (px/ms) that maps to the slow / fast ends of the velocity response (§25). */
export const SLOW_SPEED = 0.35;
export const FAST_SPEED = 2.2;
/** Cursor lerp factor (§19): high enough that the ring never visibly trails the pointer. */
export const FOLLOW = 0.45;
