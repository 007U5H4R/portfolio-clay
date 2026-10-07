import { Plane, Raycaster, Vector2, Vector3, type Camera } from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import { clampSpeed } from "@/lib/lab/controls";
import { SUPER_SQUISH_MULTIPLIER } from "@/lib/lab/engine";
import { FLIP_COOLDOWN_S, StallWatch, flipImpulse, nearFlipper } from "@/lib/lab/flippers";
import type { LabRuntime } from "./runtime";

/**
 * Pinball controls (TASK-172). The player only works the two flippers; the gummy is the ball.
 *   touch / mouse / pen   hold the left half of the play area for the left flipper, the right half for the right one
 *                         (multi-touch: both at once); the half is decided where the press begins
 *   keyboard              ← or Z = left, → or M = right, Space = both
 * Nothing grabs, drags or flicks the gummy any more. The intro bear can still be poked (a small hidden delight).
 * Attached to the canvas element; the key handlers live on window. The flippers themselves are stepped in Arena.tsx.
 */
const MAX_SPEED = 24;

type Side = 0 | 1;
const LEFT_KEYS = new Set(["ArrowLeft", "z", "Z"]);
const RIGHT_KEYS = new Set(["ArrowRight", "m", "M"]);

export class GummyController {
  private keyLeft = false;
  private keyRight = false;
  private keySpace = false;
  /** pointerId → side it holds */
  private readonly held = new Map<number, Side>();
  private stall = new StallWatch();
  private readonly ray = new Raycaster();
  private readonly plane = new Plane(new Vector3(0, 0, 1), 0);
  private readonly hit = new Vector3();
  private readonly ndc = new Vector2();
  private readonly bound: [string, EventListener][];

  constructor(
    private readonly rt: LabRuntime,
    private readonly el: HTMLElement,
    private readonly getCamera: () => Camera,
    private readonly isLive: () => boolean,
    private readonly isIntro: () => boolean,
  ) {
    this.bound = [
      ["pointerdown", (e) => this.onDown(e as PointerEvent)],
      ["pointermove", (e) => this.onMove(e as PointerEvent)],
      ["pointerup", (e) => this.onUp(e as PointerEvent)],
      ["pointercancel", (e) => this.onUp(e as PointerEvent)],
      ["lostpointercapture", (e) => this.onUp(e as PointerEvent)],
    ];
  }

  attach() {
    for (const [type, fn] of this.bound) this.el.addEventListener(type, fn);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.cancel);
  }

  detach() {
    for (const [type, fn] of this.bound) this.el.removeEventListener(type, fn);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.cancel);
  }

  /** Release every input (pause, game over, exit, window blur). */
  cancel = () => {
    this.keyLeft = this.keyRight = this.keySpace = false;
    this.held.clear();
    this.sync();
  };

  /** The flippers' `pressed` flags are the one place input becomes game state. */
  private sync() {
    const [l, r] = this.rt.flippers;
    let pl = this.keyLeft || this.keySpace;
    let pr = this.keyRight || this.keySpace;
    for (const side of this.held.values()) {
      if (side === 0) pl = true;
      else pr = true;
    }
    l.pressed = pl;
    r.pressed = pr;
  }

  private sideOf(clientX: number): Side {
    const r = this.el.getBoundingClientRect();
    return clientX < r.left + r.width / 2 ? 0 : 1;
  }

  private toWorld(clientX: number, clientY: number, out: { x: number; y: number }) {
    const r = this.el.getBoundingClientRect();
    this.ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.getCamera());
    if (this.ray.ray.intersectPlane(this.plane, this.hit)) {
      out.x = this.hit.x;
      out.y = this.hit.y;
    }
  }

  private onDown(e: PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (this.isIntro()) {
      if (!e.isPrimary) return;
      // The intro bear can be poked: a squish and a wobble (a small hidden delight, §46).
      const w = { x: 0, y: 0 };
      this.toWorld(e.clientX, e.clientY, w);
      if (Math.hypot(w.x - this.rt.bear.x, w.y - (this.rt.bear.y + 0.5)) <= 1.15 * 1.7) {
        this.rt.jelly.impact(0, -1, 14);
        this.rt.poke = 1;
        this.rt.hooks.poke();
      }
      return;
    }
    if (!this.isLive()) return;
    this.held.set(e.pointerId, this.sideOf(e.clientX));
    try {
      this.el.setPointerCapture(e.pointerId);
    } catch {
      /* capture is best-effort */
    }
    this.sync();
  }

  private onMove(e: PointerEvent) {
    if (e.isPrimary) {
      this.toWorld(e.clientX, e.clientY, this.rt.pointer);
      this.rt.pointer.active = true;
    }
  }

  private onUp(e: PointerEvent) {
    if (this.held.delete(e.pointerId)) this.sync();
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.isLive()) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && active.matches("input, textarea, select, [contenteditable]")) return;
    if (LEFT_KEYS.has(e.key)) this.keyLeft = true;
    else if (RIGHT_KEYS.has(e.key)) this.keyRight = true;
    else if (e.key === " " && !(active instanceof HTMLButtonElement || active instanceof HTMLAnchorElement)) this.keySpace = true;
    else return;
    if (e.key.startsWith("Arrow") || e.key === " ") e.preventDefault();
    this.sync();
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (LEFT_KEYS.has(e.key)) this.keyLeft = false;
    else if (RIGHT_KEYS.has(e.key)) this.keyRight = false;
    else if (e.key === " ") this.keySpace = false;
    else return;
    this.sync();
  };

  /**
   * Flipper hits, wind, the speed cap and the anti-stall nudge. Reads/writes the body only while live, once per fixed
   * physics step. The body's own position is read here: `rt.bear` is only refreshed once per rendered frame.
   */
  update(dt: number, rb: RapierRigidBody) {
    const pos = rb.translation();
    const v = rb.linvel();
    let vx = v.x;
    let vy = v.y;
    let changed = false;
    const centre = { x: pos.x, y: pos.y + 0.5 };

    for (const f of this.rt.flippers) {
      if (f.cooldown > 0) continue;
      const mul = this.rt.superSquish ? SUPER_SQUISH_MULTIPLIER : 1;
      const hit = flipImpulse(f.layout, f.state, centre, { x: vx, y: vy }, mul);
      if (!hit) continue;
      vx = hit.vx;
      vy = hit.vy;
      f.cooldown = FLIP_COOLDOWN_S;
      changed = true;
      this.rt.bear.sinceBounce = 0;
      this.rt.hooks.flip(f.layout.side, hit.speed, hit.normal.x, hit.normal.y, centre.x, centre.y);
      if (this.rt.superSquish) this.rt.hooks.squish(1, true);
    }

    if (this.rt.env.windX !== 0) {
      vx += this.rt.env.windX * dt;
      changed = true;
    }

    // A gummy stuck anywhere but on a flipper is a soft-lock (the player cannot reach it): judged by position, so wind
    // and the low-gravity wobble can't hide it (TASK-184), then nudged on with an escalating, alternating kick.
    const onFlipper = this.rt.flippers.some((f) => nearFlipper(f.layout, f.state, centre));
    const n = this.stall.step(dt, { x: pos.x, y: pos.y }, onFlipper);
    if (n) {
      vx = n.x;
      vy = n.y;
      changed = true;
    }

    if (changed) {
      const c = clampSpeed({ x: vx, y: vy }, MAX_SPEED);
      rb.setLinvel({ x: c.x, y: c.y, z: 0 }, true);
    }
  }
}
