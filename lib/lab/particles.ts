/**
 * A tiny CPU particle pool (gummy-bear.md §25): 20–80 live particles, rendered as one instanced mesh.
 * Pure data + maths (no three.js) so the cap and lifetimes are unit-testable. Kinds are visual only:
 * sparkles on impacts, gummy droplets, star bursts, power-up trails.
 */
export type ParticleKind = "sparkle" | "droplet" | "star" | "trail" | "streak";

export interface Emit {
  x: number;
  y: number;
  kind: ParticleKind;
  count: number;
  /** Initial speed scale. */
  speed?: number;
  /** Palette slot 0–4 (index into the renderer's colour list). */
  color?: number;
  /** Unit direction the gummy is travelling: "streak" particles drift back along it (the trail's micro-sparks). */
  dirX?: number;
  dirY?: number;
}

export class ParticlePool {
  readonly capacity: number;
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly vx: Float32Array;
  readonly vy: Float32Array;
  readonly life: Float32Array;
  readonly maxLife: Float32Array;
  readonly size: Float32Array;
  readonly color: Uint8Array;
  private readonly gravity: Float32Array;
  private cursor = 0;
  private rng: () => number;

  constructor(capacity: number, rng: () => number = Math.random) {
    this.capacity = capacity;
    this.rng = rng;
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.vx = new Float32Array(capacity);
    this.vy = new Float32Array(capacity);
    this.life = new Float32Array(capacity);
    this.maxLife = new Float32Array(capacity);
    this.size = new Float32Array(capacity);
    this.color = new Uint8Array(capacity);
    this.gravity = new Float32Array(capacity);
  }

  /** Capacity 0 (reduced motion, TASK-185) is a pool that never holds anything. */
  emit({ x, y, kind, count, speed = 1, color = 0, dirX = 0, dirY = 0 }: Emit) {
    if (this.capacity === 0) return;
    for (let n = 0; n < count; n += 1) {
      // Ring buffer: the oldest particle is recycled when the pool is full (hard cap, no growth).
      const i = this.cursor;
      this.cursor = (this.cursor + 1) % this.capacity;
      const a = this.rng() * Math.PI * 2;
      const r = (0.4 + this.rng() * 0.8) * speed;
      this.x[i] = x;
      this.y[i] = y;
      this.color[i] = color;
      if (kind === "droplet") {
        this.vx[i] = Math.cos(a) * r * 1.6;
        this.vy[i] = Math.abs(Math.sin(a)) * r * 2.2 + 1;
        this.gravity[i] = 9;
        this.maxLife[i] = 0.7 + this.rng() * 0.4;
        this.size[i] = 0.07 + this.rng() * 0.05;
      } else if (kind === "star") {
        this.vx[i] = Math.cos(a) * r * 2.4;
        this.vy[i] = Math.sin(a) * r * 2.4;
        this.gravity[i] = 1.5;
        this.maxLife[i] = 0.6 + this.rng() * 0.3;
        this.size[i] = 0.09 + this.rng() * 0.05;
      } else if (kind === "streak") {
        // Tiny, quick sparks that fall behind the gummy's path and are gone within a fraction of a second.
        const spread = (this.rng() - 0.5) * 1.4;
        this.vx[i] = -dirX * (1.2 + this.rng() * 1.4) - dirY * spread;
        this.vy[i] = -dirY * (1.2 + this.rng() * 1.4) + dirX * spread;
        this.gravity[i] = 0;
        this.maxLife[i] = 0.16 + this.rng() * 0.16;
        this.size[i] = 0.025 + this.rng() * 0.03;
      } else if (kind === "trail") {
        this.vx[i] = (this.rng() - 0.5) * 0.5;
        this.vy[i] = (this.rng() - 0.5) * 0.5;
        this.gravity[i] = 0;
        this.maxLife[i] = 0.45 + this.rng() * 0.2;
        this.size[i] = 0.06 + this.rng() * 0.03;
      } else {
        this.vx[i] = Math.cos(a) * r * 1.8;
        this.vy[i] = Math.sin(a) * r * 1.8;
        this.gravity[i] = 3;
        this.maxLife[i] = 0.35 + this.rng() * 0.25;
        this.size[i] = 0.05 + this.rng() * 0.04;
      }
      this.life[i] = this.maxLife[i]!;
    }
  }

  update(dt: number) {
    for (let i = 0; i < this.capacity; i += 1) {
      if (this.life[i]! <= 0) continue;
      this.life[i] = this.life[i]! - dt;
      this.vy[i] = this.vy[i]! - this.gravity[i]! * dt;
      this.x[i] = this.x[i]! + this.vx[i]! * dt;
      this.y[i] = this.y[i]! + this.vy[i]! * dt;
    }
  }

  /** Number of live particles. */
  get active(): number {
    let n = 0;
    for (let i = 0; i < this.capacity; i += 1) if (this.life[i]! > 0) n += 1;
    return n;
  }

  /** 0–1 remaining life of slot i (0 = dead). */
  alpha(i: number): number {
    return this.life[i]! <= 0 ? 0 : Math.min(1, this.life[i]! / this.maxLife[i]!);
  }

  clear() {
    this.life.fill(0);
  }
}
