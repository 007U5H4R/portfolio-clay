import type { Anchor } from "./arena";
import type { PowerUpType } from "./engine";

/**
 * Collectible + power-up spawning (gummy-bear.md §21–23): few at a time, always on a hand-placed arena
 * anchor, expiring if ignored. Rings reward trajectory skill, stars exploration, droplets rescue;
 * power-ups arrive every ~14–20 s (Time Freeze is rare and only after 30 s). Pure + seeded for tests.
 */
export type PickupKind = "ring" | "star" | "droplet" | PowerUpType;

export interface Pickup {
  id: number;
  kind: PickupKind;
  x: number;
  y: number;
  /** seconds left before it fades away */
  ttl: number;
}

const TTL: Record<string, number> = { ring: 14, star: 10, droplet: 10, power: 11 };

interface Ctx {
  inDanger: boolean;
  bearX: number;
  bearY: number;
}

export class Spawner {
  items: Pickup[] = [];
  private nextId = 1;
  private ringIn = 0.5;
  private starIn = 6;
  private dropletIn = 16;
  private powerIn = 9;
  private wasInDanger = false;

  constructor(
    private readonly anchors: readonly Anchor[],
    private readonly rng: () => number = Math.random,
  ) {}

  reset() {
    this.items = [];
    this.ringIn = 0.5;
    this.starIn = 6;
    this.dropletIn = 16;
    this.powerIn = 9;
    this.wasInDanger = false;
  }

  remove(id: number) {
    this.items = this.items.filter((i) => i.id !== id);
  }

  private count(pred: (k: PickupKind) => boolean) {
    return this.items.filter((i) => pred(i.kind)).length;
  }

  private freeAnchor(ctx: Ctx, near?: Anchor): Anchor | null {
    const free = this.anchors.filter((a) => !this.items.some((i) => i.x === a.x && i.y === a.y) && Math.hypot(a.x - ctx.bearX, a.y - ctx.bearY) > 1.2);
    const pool = near
      ? [...free].sort((p, q) => Math.hypot(p.x - near.x, p.y - near.y) - Math.hypot(q.x - near.x, q.y - near.y)).slice(0, 4)
      : free;
    return pool.length ? pool[Math.floor(this.rng() * pool.length)]! : null;
  }

  private pickPower(time: number): PowerUpType {
    const table: [PowerUpType, number][] = [
      ["SUPER_SQUISH", 3],
      ["LOW_GRAVITY", 3],
      ["RAINBOW", 2],
      ["GOLDEN", 2],
    ];
    if (time >= 30) table.push(["TIME_FREEZE", 1]);
    const total = table.reduce((n, [, w]) => n + w, 0);
    let r = this.rng() * total;
    for (const [k, w] of table) {
      r -= w;
      if (r <= 0) return k;
    }
    return "GOLDEN";
  }

  private add(kind: PickupKind, a: Anchor, ttl: number, spawned: Pickup[]) {
    const p: Pickup = { id: this.nextId++, kind, x: a.x, y: a.y, ttl };
    this.items.push(p);
    spawned.push(p);
  }

  update(dt: number, time: number, ctx: Ctx): { spawned: Pickup[]; expired: number[] } {
    const spawned: Pickup[] = [];
    const expired: number[] = [];
    for (const i of this.items) i.ttl -= dt;
    this.items = this.items.filter((i) => {
      if (i.ttl > 0) return true;
      expired.push(i.id);
      return false;
    });

    const maxRings = time < 10 ? 2 : 3;
    this.ringIn -= dt;
    if (this.ringIn <= 0) {
      this.ringIn = 1.5 + this.rng() * 2;
      if (this.count((k) => k === "ring") < maxRings) {
        const a = this.freeAnchor(ctx);
        if (a) this.add("ring", a, TTL.ring!, spawned);
      }
    }

    this.starIn -= dt;
    if (this.starIn <= 0) {
      this.starIn = 9 + this.rng() * 5;
      if (this.count((k) => k === "star") < 1) {
        const a = this.freeAnchor(ctx);
        if (a) this.add("star", a, TTL.star!, spawned);
      }
    }

    // Rescue droplet: offered right as the bear drops into danger, near it so it can be reached.
    if (ctx.inDanger && !this.wasInDanger && this.count((k) => k === "droplet") < 1) {
      const a = this.freeAnchor(ctx, { x: ctx.bearX, y: ctx.bearY });
      if (a) this.add("droplet", a, TTL.droplet!, spawned);
    }
    this.wasInDanger = ctx.inDanger;
    this.dropletIn -= dt;
    if (this.dropletIn <= 0) {
      this.dropletIn = 14 + this.rng() * 8;
      if (this.count((k) => k === "droplet") < 1) {
        const a = this.freeAnchor(ctx);
        if (a) this.add("droplet", a, TTL.droplet!, spawned);
      }
    }

    this.powerIn -= dt;
    if (this.powerIn <= 0) {
      this.powerIn = 14 + this.rng() * 6;
      const hasPower = this.count((k) => k !== "ring" && k !== "star" && k !== "droplet") > 0;
      if (!hasPower) {
        const a = this.freeAnchor(ctx);
        if (a) this.add(this.pickPower(time), a, TTL.power!, spawned);
      }
    }
    return { spawned, expired };
  }
}
