import { Plane, Raycaster, Vector2, Vector3, type Camera } from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import {
  DRAG_MAX_SPEED,
  TAP_BOUNCE_SPEED,
  bounceSpeed,
  clampSpeed,
  dragAcceleration,
  flickLaunch,
  isTap,
  squishCharge,
  tapKick,
  type PointerSample,
} from "@/lib/lab/controls";
import { SUPER_SQUISH_MULTIPLIER } from "@/lib/lab/engine";
import type { LabRuntime } from "./runtime";

/**
 * Pointer + keyboard control of the gummy (gummy-bear.md §17). Attached to the canvas element.
 *   tap    quick squish: a bounce + sideways kick from where it was poked
 *   drag   the bear is pulled by a spring toward the pointer (never teleported) and stretches toward it
 *   flick  pointer velocity at release becomes a capped launch
 *   hold   squish: the bear compresses while held; releasing launches it by the stored charge
 * Touch, mouse and pen all use pointer events; nothing needs hover. Keyboard: ← → nudge, Space bounce.
 */
export const GRAB_RADIUS = 1.15;
const MAX_SPEED = 24;

type Mode = "idle" | "pending" | "drag" | "squish";

export class GummyController {
  private mode: Mode = "idle";
  private pointerId = -1;
  private downT = 0;
  private downPx = { x: 0, y: 0 };
  private movedPx = 0;
  private grab = { x: 0, y: 0 };
  private world = { x: 0, y: 0 };
  private samples: PointerSample[] = [];
  private keyLeft = false;
  private keyRight = false;
  private keyCooldown = 0;
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

  /** Drop any gesture in progress (pause, game over, exit). */
  cancel = () => {
    this.mode = "idle";
    this.pointerId = -1;
    this.keyLeft = this.keyRight = false;
    const b = this.rt.bear;
    b.dragged = false;
    b.squishing = false;
    b.charge = 0;
  };

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
    if (!e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return;
    this.toWorld(e.clientX, e.clientY, this.world);
    const b = this.rt.bear;
    const cx = b.x;
    const cy = b.y + 0.5;
    const near = Math.hypot(this.world.x - cx, this.world.y - cy) <= GRAB_RADIUS * (this.isIntro() ? 1.7 : 1);
    if (!near) return;
    if (this.isIntro()) {
      // The intro bear can be poked: a squish and a wobble (a small hidden delight, §46).
      this.rt.jelly.impact(0, -1, 14);
      this.rt.poke = 1;
      this.rt.hooks.tap();
      return;
    }
    if (!this.isLive()) return;
    this.pointerId = e.pointerId;
    try {
      this.el.setPointerCapture(e.pointerId);
    } catch {
      /* capture is best-effort */
    }
    this.mode = "pending";
    this.downT = performance.now();
    this.downPx = { x: e.clientX, y: e.clientY };
    this.movedPx = 0;
    this.grab = { x: cx - this.world.x, y: cy - this.world.y };
    this.samples = [{ t: this.downT, x: this.world.x, y: this.world.y }];
    this.rt.pointer.active = true;
  }

  private onMove(e: PointerEvent) {
    this.toWorld(e.clientX, e.clientY, this.rt.pointer);
    this.rt.pointer.active = true;
    if (e.pointerId !== this.pointerId || this.mode === "idle") return;
    this.world.x = this.rt.pointer.x;
    this.world.y = this.rt.pointer.y;
    const now = performance.now();
    this.samples.push({ t: now, x: this.world.x, y: this.world.y });
    if (this.samples.length > 12) this.samples.shift();
    this.movedPx = Math.max(this.movedPx, Math.hypot(e.clientX - this.downPx.x, e.clientY - this.downPx.y));
    if ((this.mode === "pending" || this.mode === "squish") && this.movedPx > 12) {
      this.mode = "drag";
      this.rt.hooks.drag();
    }
  }

  private onUp(e: PointerEvent) {
    if (e.pointerId !== this.pointerId) return;
    const rb = this.rt.bearBody.current;
    const held = performance.now() - this.downT;
    const b = this.rt.bear;
    const mode = this.mode;
    this.mode = "idle";
    this.pointerId = -1;
    b.dragged = false;
    b.squishing = false;
    if (!rb || !this.isLive()) return;
    if (mode === "drag") {
      const launch = flickLaunch(this.samples, performance.now());
      if (launch) {
        rb.setLinvel({ x: launch.x, y: launch.y, z: 0 }, true);
        b.sinceBounce = 0;
        this.rt.jelly.impact(launch.x, launch.y, Math.hypot(launch.x, launch.y) * 0.6);
        this.rt.hooks.flick();
      }
    } else if (mode === "squish") {
      const mul = this.rt.superSquish ? SUPER_SQUISH_MULTIPLIER : 1;
      const v = rb.linvel();
      rb.setLinvel({ x: v.x * 0.3, y: bounceSpeed(b.charge, mul), z: 0 }, true);
      b.sinceBounce = 0;
      this.rt.jelly.impact(0, 1, 8 + 12 * b.charge);
      this.rt.hooks.squish(b.charge, this.rt.superSquish);
    } else if (mode === "pending" && isTap(held, this.movedPx)) {
      const mul = this.rt.superSquish ? SUPER_SQUISH_MULTIPLIER : 1;
      const k = tapKick(this.world.x - b.x, mul);
      const v = rb.linvel();
      rb.setLinvel({ x: v.x * 0.5 + k.x, y: Math.max(v.y, 0) * 0.3 + k.y, z: 0 }, true);
      b.sinceBounce = 0;
      this.rt.jelly.impact(0, -1, 10);
      this.rt.hooks.tap();
      if (this.rt.superSquish) this.rt.hooks.squish(1, true);
    }
    b.charge = 0;
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat && (e.key === " " || e.key === "ArrowUp")) return;
    if (!this.isLive()) return;
    const active = document.activeElement;
    const typing = active instanceof HTMLElement && active.matches("input, textarea, select, [contenteditable]");
    if (typing) return;
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") this.keyLeft = true;
    else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") this.keyRight = true;
    else if ((e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") && !(active instanceof HTMLButtonElement || active instanceof HTMLAnchorElement)) {
      e.preventDefault();
      this.keyBounce();
    } else return;
    if (e.key.startsWith("Arrow")) e.preventDefault();
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") this.keyLeft = false;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") this.keyRight = false;
  };

  private keyBounce() {
    const rb = this.rt.bearBody.current;
    if (!rb || this.keyCooldown > 0) return;
    this.keyCooldown = 0.38;
    const mul = this.rt.superSquish ? SUPER_SQUISH_MULTIPLIER : 1;
    const v = rb.linvel();
    rb.setLinvel({ x: v.x * 0.6, y: Math.max(v.y * 0.2, 0) + TAP_BOUNCE_SPEED * 1.15 * mul, z: 0 }, true);
    this.rt.bear.sinceBounce = 0;
    this.rt.jelly.impact(0, -1, 10);
    this.rt.hooks.tap();
  }

  /** Per-frame: spring drag, squish hold, keyboard nudges. Reads/writes the body only while live. */
  update(dt: number, rb: RapierRigidBody) {
    const b = this.rt.bear;
    this.keyCooldown = Math.max(0, this.keyCooldown - dt);
    const arena = this.rt.arena;
    const v = rb.linvel();
    let vx = v.x;
    let vy = v.y;
    let changed = false;

    if (this.mode === "pending" && performance.now() - this.downT > 160) {
      this.mode = "squish";
    }
    if (this.mode === "squish") {
      const held = performance.now() - this.downT;
      b.squishing = true;
      b.charge = squishCharge(held);
      // Held in place: the bear sinks into its squish rather than falling.
      vx *= Math.exp(-10 * dt);
      vy *= Math.exp(-10 * dt);
      changed = true;
    } else if (this.mode === "drag") {
      b.dragged = true;
      const tx = Math.max(-arena.halfW + 0.45, Math.min(arena.halfW - 0.45, this.world.x + this.grab.x));
      const ty = Math.max(arena.floorY + 0.55, Math.min(arena.ceilingY - 0.7, this.world.y + this.grab.y));
      const a = dragAcceleration({ x: b.x, y: b.y + 0.5 }, { x: vx, y: vy }, { x: tx, y: ty });
      const nv = clampSpeed({ x: vx + a.x * dt, y: vy + a.y * dt }, DRAG_MAX_SPEED);
      vx = nv.x;
      vy = nv.y;
      changed = true;
    }
    const dir = (this.keyRight ? 1 : 0) - (this.keyLeft ? 1 : 0);
    if (dir !== 0 && this.mode === "idle") {
      vx += dir * 30 * dt;
      changed = true;
    }
    if (this.rt.env.windX !== 0) {
      vx += this.rt.env.windX * dt;
      changed = true;
    }
    if (changed) {
      const c = clampSpeed({ x: vx, y: vy }, MAX_SPEED);
      rb.setLinvel({ x: c.x, y: c.y, z: 0 }, true);
    }
  }

  get gravityFactor(): number {
    if (this.mode === "squish") return 0.1;
    if (this.mode === "drag") return 0.25;
    return 1;
  }

  /** Normalised direction the bear is being pulled while dragged (for the stretch/lean), else null. */
  dragVector(b: { x: number; y: number }): { x: number; y: number; len: number } | null {
    if (this.mode !== "drag") return null;
    const dx = this.world.x + this.grab.x - b.x;
    const dy = this.world.y + this.grab.y - (b.y + 0.5);
    return { x: dx, y: dy, len: Math.hypot(dx, dy) };
  }
}
