/**
 * The gummy's light trail (TASK-185, spec §7–9, §27): a FIXED-SIZE ring buffer of recent positions. Nothing here
 * allocates after construction: `push` overwrites the oldest slot, `update` ages the live ones, and a sample expires
 * by itself once its age passes a life that was set by how fast the gummy was going when it was recorded, so the
 * trail is longest at speed and shortens and fades naturally as the gummy slows. Pure data (no three.js).
 */
export const TRAIL_CAPACITY = 56;
/** Seconds a sample recorded at full speed lives; a crawling gummy's samples live MIN_LIFE_S. */
export const MAX_LIFE_S = 0.27;
export const MIN_LIFE_S = 0.05;
/** Speed (u/s) at which the trail reaches its full length. */
export const FULL_SPEED = 20;
/** Below this speed no new samples are recorded (a resting gummy leaves nothing). */
export const MIN_TRAIL_SPEED = 3.2;
/** Minimum travel (u) between two samples so a slow frame never stacks identical points. */
const MIN_STEP = 0.05;
/** Samples are at most this far apart: a long frame's travel is filled in, so the ribbon stays smooth at any frame rate. */
export const SPACING = 0.16;
/** A jump longer than this (a teleport, a launch from the lane) starts a fresh trail instead of a streak across the table. */
const MAX_JUMP = 3.5;
const MAX_INSERT = 12;

/** The fade gradient of spec §7: 100% → 70% → 40% → 15% → 0% over a sample's life (t = age / life). */
const STOPS: readonly (readonly [number, number])[] = [
  [0, 1],
  [0.25, 0.7],
  [0.5, 0.4],
  [0.75, 0.15],
  [1, 0],
];
export function trailFade(t: number): number {
  if (t <= 0) return 1;
  if (t >= 1) return 0;
  for (let i = 1; i < STOPS.length; i += 1) {
    const [t1, a1] = STOPS[i]!;
    if (t <= t1) {
      const [t0, a0] = STOPS[i - 1]!;
      return a0 + ((a1 - a0) * (t - t0)) / (t1 - t0);
    }
  }
  return 0;
}

export function lifeForSpeed(speed: number): number {
  const k = Math.min(1, Math.max(0, speed / FULL_SPEED));
  return MIN_LIFE_S + (MAX_LIFE_S - MIN_LIFE_S) * k;
}

export class TrailBuffer {
  readonly capacity: number;
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly age: Float32Array;
  readonly life: Float32Array;
  readonly speed: Float32Array;
  /** Reduced motion: nothing is ever recorded. */
  enabled = true;
  private head = 0;
  private live = 0;
  private lastX = Infinity;
  private lastY = Infinity;

  constructor(capacity = TRAIL_CAPACITY) {
    this.capacity = capacity;
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.age = new Float32Array(capacity);
    this.life = new Float32Array(capacity);
    this.speed = new Float32Array(capacity);
  }

  /** Number of samples still visible. */
  get count(): number {
    return this.live;
  }

  /**
   * Record the gummy's position this frame (a no-op while disabled or slow). `dt` is the frame's duration: the points filled
   * in between the last sample and this one are given the ages they would have had, so the fade is the same at any frame rate.
   */
  push(x: number, y: number, speed: number, dt = 0): void {
    if (!this.enabled) return;
    if (speed < MIN_TRAIL_SPEED) {
      this.lastX = Infinity;
      this.lastY = Infinity;
      return;
    }
    const has = Number.isFinite(this.lastX);
    const dx = x - this.lastX;
    const dy = y - this.lastY;
    const dist = has ? Math.hypot(dx, dy) : 0;
    if (has && dist < MIN_STEP) return;
    const n = has && dist <= MAX_JUMP ? Math.min(MAX_INSERT, Math.max(1, Math.ceil(dist / SPACING))) : 1;
    for (let k = 1; k <= n; k += 1) {
      const t = k / n;
      this.write(n === 1 ? x : this.lastX + dx * t, n === 1 ? y : this.lastY + dy * t, speed, dt * (1 - t));
    }
    this.lastX = x;
    this.lastY = y;
  }

  private write(x: number, y: number, speed: number, age: number): void {
    const i = this.head;
    this.head = (this.head + 1) % this.capacity;
    this.x[i] = x;
    this.y[i] = y;
    this.age[i] = age;
    this.life[i] = lifeForSpeed(speed);
    this.speed[i] = speed;
    this.live = Math.min(this.capacity, this.live + 1);
  }

  /** Age every live sample; expired ones drop off the old end. */
  update(dt: number): void {
    for (let k = 0; k < this.live; k += 1) {
      const i = this.slot(k);
      this.age[i] = this.age[i]! + dt;
    }
    while (this.live > 0) {
      const oldest = this.slot(this.live - 1);
      if (this.age[oldest]! < this.life[oldest]!) break;
      this.live -= 1;
    }
    if (this.live === 0) {
      this.lastX = Infinity;
      this.lastY = Infinity;
    }
  }

  /** Buffer slot of the k-th newest live sample (k = 0 is the newest). */
  slot(k: number): number {
    return (this.head - 1 - k + this.capacity * 2) % this.capacity;
  }

  /** 0–1 opacity of the k-th newest sample (the spec §7 gradient over its own life). */
  alpha(k: number): number {
    const i = this.slot(k);
    return trailFade(this.age[i]! / this.life[i]!);
  }

  clear(): void {
    this.live = 0;
    this.lastX = Infinity;
    this.lastY = Infinity;
  }
}
