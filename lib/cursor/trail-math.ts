import { FAST_SPEED, MAX_ACTIVE, MAX_PER_MOVE, MAX_WIDTH, MIN_WIDTH, SLOW_SPEED, SPACING } from "./trail-config";

export interface Point {
  x: number;
  y: number;
}

export interface SpawnPlan {
  /** Evenly spaced points along prev→next, `SPACING` apart, at most `MAX_PER_MOVE`. */
  points: Point[];
  /** Where the next measurement starts: the last spawn, or `prev` when nothing spawned. */
  anchor: Point;
  /** Unit travel direction (0,0 when the pointer did not move). */
  dir: Point;
}

/** cursor.md §22–§24: spawn by distance travelled, never per pointer event. */
export function planSpawns(prev: Point, next: Point, spacing = SPACING, maxPerMove = MAX_PER_MOVE): SpawnPlan {
  const dx = next.x - prev.x;
  const dy = next.y - prev.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) return { points: [], anchor: prev, dir: { x: 0, y: 0 } };
  const dir = { x: dx / distance, y: dy / distance };
  const count = Math.min(Math.floor(distance / spacing), maxPerMove);
  const points: Point[] = [];
  for (let i = 1; i <= count; i++) points.push({ x: prev.x + dir.x * spacing * i, y: prev.y + dir.y * spacing * i });
  return { points, anchor: points.length ? points[points.length - 1]! : prev, dir };
}

export interface SpawnStyle {
  width: number;
  /** Max |rotation| in degrees. */
  maxTilt: number;
  /** Forward nudge in px (§24 base 8–16, stronger when fast). */
  nudge: number;
}

/** cursor.md §25: speed (px/ms) only nudges size, tilt and nudge — never the count. */
export function styleForSpeed(speed: number): SpawnStyle {
  const t = Math.min(1, Math.max(0, (speed - SLOW_SPEED) / (FAST_SPEED - SLOW_SPEED)));
  return {
    width: Math.round(MIN_WIDTH + 18 + t * (MAX_WIDTH - MIN_WIDTH - 18)), // 90 → 125
    maxTilt: 8 + t * 12, // ±8 → ±20
    nudge: 12 + t * 10,
  };
}

/** Oldest-first items that must go so at most `max` remain (§26). */
export function capActive<T>(items: readonly T[], max = MAX_ACTIVE): T[] {
  return items.slice(0, Math.max(0, items.length - max));
}
