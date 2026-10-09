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
      burst(x + dirX * 0.3, y + dirY * 0.3, "sparkle", Math.min(6, Math.round(speed / 4)), 3);
      if (speed > 15) rt.shake = Math.min(1, (speed - 15) / 10);
    },
    pad(_spec, x, y) {
      burst(x, y + 0.2, "droplet", 8, 1);
      rt.zoom = Math.max(rt.zoom, 0.4);
    },
    // A bumper hit (spec §10): the trail flashes and a few tiny sparks fly; the bumper itself compresses and glows.
    bumper(_id, x, y) {
      burst(x, y, "sparkle", 7, 0);
      rt.trailFlash = 1;
    },
    target(_id, x, y) {
      burst(x, y, "star", 8, 4);
      rt.trailFlash = 1;
    },
    sling(_id, x, y) {
      burst(x, y, "sparkle", 5, 0);
      rt.trailFlash = 0.8;
    },
    // The plunger fires: a bright, short streak up the lane (the trail flashes), a few warm sparks, a small camera nudge.
    launch(_force, progress, x, y) {
      rt.trailFlash = 1;
      rt.shake = Math.max(rt.shake, 0.12 + 0.2 * progress);
      for (let i = 0; i < 4; i += 1) rt.particles.emit({ x, y: y + 0.5 + i * 0.4, kind: "streak", count: 2, color: 2, dirX: 0, dirY: 1 });
    },
    portal() {},
    pickup() {},
    squish(charge) {
      burst(rt.bear.x, rt.bear.y + 0.1, "droplet", Math.round(2 + charge * 8), 0);
    },
    // Visual only: a squash against the flipper (the jelly never feeds back into the physics).
    flip(side, speed, nx, ny, x, y) {
      rt.flippers[side === "left" ? 0 : 1].flash = 1;
      rt.jelly.impact(-nx, -ny, 10 + speed * 0.5);
      burst(x - nx * 0.4, y - ny * 0.4, "sparkle", 5, 0);
    },
    poke() {},
    // The cabinet is shoved: a short shake (the camera ignores it under reduced motion), a few sparks, and a buzz where supported (iOS ignores it).
    nudge() {
      rt.shake = Math.max(rt.shake, 0.55);
      burst(rt.bear.x, rt.bear.y + 0.3, "sparkle", 4, 0);
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(40);
    },
  };
}
