import type { LabHooks, LabRuntime } from "./runtime";

/**
 * Impact feedback that does not depend on the rules (gummy-bear.md §14, §25): jelly energy, sparkles,
 * droplets, camera shake. The engine driver layers scoring on top of these in `useEngine`.
 */
export function createFxHooks(rt: LabRuntime): LabHooks {
  const burst = (x: number, y: number, kind: "sparkle" | "droplet" | "star", count: number, color = 0) =>
    rt.particles.emit({ x, y, kind, count, color });
  return {
    impact(speed, dirX, dirY, x, y) {
      rt.jelly.impact(dirX, dirY, speed);
      burst(x + dirX * 0.3, y + dirY * 0.3, "sparkle", Math.min(8, Math.round(speed / 3)), 3);
      if (speed > 15) rt.shake = Math.min(1, (speed - 15) / 10);
    },
    pad(_spec, x, y) {
      burst(x, y + 0.2, "droplet", 8, 1);
      rt.zoom = Math.max(rt.zoom, 0.4);
    },
    bumper(_id, x, y) {
      burst(x, y, "sparkle", 8, 4);
    },
    target(_id, x, y) {
      burst(x, y, "star", 10, 2);
    },
    portal() {},
    pickup() {},
    squish(charge) {
      burst(rt.bear.x, rt.bear.y + 0.1, "droplet", Math.round(2 + charge * 8), 0);
    },
    drag() {},
    flick() {
      burst(rt.bear.x, rt.bear.y + 0.5, "sparkle", 6, 3);
    },
    tap() {
      burst(rt.bear.x, rt.bear.y + 0.1, "droplet", 3, 0);
    },
  };
}
