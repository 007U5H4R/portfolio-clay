import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildArena, portalSensor, wallBoxes, type ArenaSpec } from "@/lib/lab/arena";
import { clampSpeed } from "@/lib/lab/controls";
import { clearedLane } from "@/lib/lab/gate";
import { NudgeState } from "@/lib/lab/nudge";
import { FLIPPER_THICK, FLIP_COOLDOWN_S, NUDGE_SHIFT, StallWatch, flipImpulse, flipperRotation, newFlipperState, nearFlipper, stepFlipper, type FlipperState } from "@/lib/lab/flippers";
import { bumperKick } from "@/lib/lab/bumpers";
import { slingFacing, slingKick } from "@/lib/lab/slings";
import { GRAVITY, PHYSICS_DT } from "@/components/lab/physics-step";

/**
 * A headless copy of the lab's physics (TASK-185): the same colliders Arena.tsx builds, the gummy's body from Gummy.tsx, and the
 * controller's per-step rules (flipper hits, launch impulse, speed cap, stall watch, the lane gate latch) with the kicks the
 * bumpers (all four kinds), slings (flipper and wall) and pad give. The cabinet shell comes from `wallBoxes()` (shared with Arena.tsx); the other parts are
 * mirrored by hand, so if a part's collider changes in Arena.tsx change it here too. Moving ramps and the phase-1 spinner are
 * left out (they only arrive later in a run). The gummy's collider is the GummyCollider hull read straight from public/lab/gummy.glb.
 */

/** The convex hull the game gives the gummy's body (the GLB's GummyCollider mesh, no node transform). */
function gummyHull(): Float32Array {
  const b = readFileSync(resolve(process.cwd(), "public/lab/gummy.glb"));
  const jl = b.readUInt32LE(12);
  const j = JSON.parse(b.subarray(20, 20 + jl).toString("utf8"));
  const mesh = j.meshes[j.nodes.find((n: { name?: string }) => n.name === "GummyCollider").mesh];
  const acc = j.accessors[mesh.primitives[0].attributes.POSITION];
  const view = j.bufferViews[acc.bufferView];
  const start = 20 + jl + 8 + (view.byteOffset ?? 0) + (acc.byteOffset ?? 0);
  const out = new Float32Array(acc.count * 3);
  for (let i = 0; i < out.length; i += 1) out[i] = b.readFloatLE(start + i * 4);
  return out;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = any;
const here = createRequire(import.meta.url);
const RAPIER: R = createRequire(here.resolve("@react-three/rapier"))("@dimforge/rapier3d-compat");
let ready: Promise<void> | null = null;
export const initRapier = () => (ready ??= RAPIER.init());

const rotZ = (a: number) => ({ x: 0, y: 0, z: Math.sin(a / 2), w: Math.cos(a / 2) });
const MAX_SPEED = 28;

export interface SimInput {
  left: boolean;
  right: boolean;
}

export class LabSim {
  readonly arena: ArenaSpec;
  readonly world: R;
  readonly gummy: R;
  readonly flippers: { state: FlipperState; cooldown: number; body: R; side: 0 | 1 }[];
  t = 0;
  launched = false;
  gateShut = false;
  /** Sim time at which the gummy first touched the black-hole sensor (null = never). */
  portalAt: number | null = null;
  /** Times the sensor reported an entry (to prove "once" at the physics level, not the app level). */
  portalHits = 0;
  private readonly queue: R;
  private readonly gate: R;
  private readonly kinds = new Map<number, { kind: "sensor" | "bumper" | "sling" | "pad"; i: number }>();
  private readonly cool = new Map<string, number>();
  private pending: number | null = null;
  private readonly stall = new StallWatch();
  private plungerCap: R;
  private spinBody: R = null;
  private spinAngle = 0;
  maxY = -Infinity;
  /** Every bumper and sling kick the sim gave (for the scoring and "all four get hit" checks). */
  bumperHits: { id: string; kind: string; t: number }[] = [];
  slingHits: { id: string; t: number }[] = [];
  /** Every anti-stall nudge the controller applied. */
  nudges: { t: number; x: number; y: number; vx: number; vy: number }[] = [];
  /** Switch the anti-stall off (to find where a gummy really rests). */
  stallOff = false;
  /** The manual nudge, and a press waiting for the next step (as the controller does it). */
  readonly nudgeState = new NudgeState();
  private nudgeAsked = false;
  nudgeFired = 0;
  nudgeRand: () => number = Math.random;
  /** True if the gummy ever stood back inside the lane (x past the divider, below its top) after it had cleared the lane. */
  reenteredLane = false;

  /**
   * `portal` overrides the black hole's place (for tuning scans; the game's own layout is `buildArena`'s); `extraPosts` adds fixed round
   * posts (tests only); `spinner` builds the phase-1 spinning bar too (it turns at the game's rate, `spin.speed` rad/s).
   */
  constructor(halfW = 5, portal?: { x: number; y: number; r: number; catchR: number }, extraPosts: { x: number; y: number; r: number }[] = [], spinner = false) {
    const a = (this.arena = buildArena(halfW));
    if (portal) a.portal = { ...a.portal, ...portal };
    const w = (this.world = new RAPIER.World({ x: 0, y: GRAVITY, z: 0 }));
    w.timestep = PHYSICS_DT;
    this.queue = new RAPIER.EventQueue(true);
    const fixed = (x = 0, y = 0, ang = 0) => w.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, 0).setRotation(rotZ(ang)));
    const box = (body: R, hx: number, hy: number, hz: number, e: number, f: number, x = 0, y = 0) =>
      w.createCollider(RAPIER.ColliderDesc.cuboid(hx, hy, hz).setTranslation(x, y, 0).setRestitution(e).setFriction(f), body);
    const tag = (c: R, kind: "sensor" | "bumper" | "sling" | "pad", i: number) => {
      c.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
      this.kinds.set(c.handle, { kind, i });
    };

    const shell = fixed();
    for (const b of wallBoxes(a)) box(shell, b.hx, b.hy, 1.5, b.restitution, b.friction, b.cx, b.cy);
    const s = portalSensor(a);
    const sensor = w.createCollider(RAPIER.ColliderDesc.ball(s.r).setTranslation(s.x, s.y, 0).setSensor(true), fixed());
    tag(sensor, "sensor", 0);

    for (const r of a.rails) {
      const len = Math.hypot(r.x2 - r.x1, r.y2 - r.y1);
      box(fixed((r.x1 + r.x2) / 2, (r.y1 + r.y2) / 2, Math.atan2(r.y2 - r.y1, r.x2 - r.x1)), len / 2 + 0.02, r.thick / 2, 1.0, 0.3, 0.05);
    }
    for (const g of a.guides) {
      const len = Math.hypot(g.x2 - g.x1, g.y2 - g.y1);
      box(fixed((g.x1 + g.x2) / 2, (g.y1 + g.y2) / 2, Math.atan2(g.y2 - g.y1, g.x2 - g.x1)), len / 2, 0.15, 1.0, 0.25, 0.1);
    }
    const gt = a.gate;
    const glen = Math.hypot(gt.x2 - gt.x1, gt.y2 - gt.y1);
    this.gate = fixed((gt.x1 + gt.x2) / 2, (gt.y1 + gt.y2) / 2, Math.atan2(gt.y2 - gt.y1, gt.x2 - gt.x1));
    box(this.gate, glen / 2 + 0.03, gt.thick / 2, 1.0, 0.2, 0.05);
    this.gate.setEnabled(false);
    for (const p of a.platforms) box(fixed(p.x, p.y, p.angle ?? 0), p.w / 2, p.h / 2, 1.0, 0.2, 0.1);
    a.pads.forEach((p, i) => tag(box(fixed(p.x, p.y, p.angle ?? 0), p.w / 2, 0.1, 0.6, 0, 0.5, 0, 0.1), "pad", i));
    a.bumpers.forEach((b, i) => {
      if (b.spin) {
        if (!spinner) return;
        this.spinBody = w.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(b.x, b.y, 0));
        tag(box(this.spinBody, b.spin.len / 2, 0.11, 0.5, 0.9, 0.5), "bumper", i);
        return;
      }
      const c = w.createCollider(RAPIER.ColliderDesc.ball(b.r).setTranslation(b.x, b.y, 0).setRestitution(1), fixed());
      tag(c, "bumper", i);
    });
    a.slings.forEach((sl, i) => {
      const verts: number[] = [];
      for (const z of [-0.6, 0.6]) for (const p of sl.pts) verts.push(p.x, p.y, z);
      const c = w.createCollider(RAPIER.ColliderDesc.convexHull(new Float32Array(verts)).setRestitution(0.5).setFriction(0.05), fixed());
      tag(c, "sling", i);
    });
    // test-only posts (a deliberately too-narrow gap, to make a wedge on purpose for the anti-stall tests)
    for (const p of extraPosts) w.createCollider(RAPIER.ColliderDesc.ball(p.r).setTranslation(p.x, p.y, 0).setRestitution(0.5), fixed());
    this.plungerCap = w.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(a.lane.x, a.lane.restY - 0.1, 0));
    box(this.plungerCap, 0.5, 0.1, 0.6, 0.05, 0.5);

    this.flippers = a.flippers.map((layout, side) => {
      const body = w.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(layout.pivot.x, layout.pivot.y, 0));
      body.setRotation({ x: 0, y: 0, z: flipperRotation(layout.side, newFlipperState().angle).z, w: flipperRotation(layout.side, newFlipperState().angle).w }, true);
      box(body, layout.len / 2 + 0.15, FLIPPER_THICK / 2, 1.0, 0.3, 0.1, layout.len / 2, 0);
      return { state: newFlipperState(), cooldown: 0, body, side: side as 0 | 1 };
    });

    this.gummy = w.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic().setTranslation(a.spawn.x, a.spawn.y, 0).lockRotations().enabledTranslations(true, true, false).setLinearDamping(0.08).setCanSleep(false).setCcdEnabled(true),
    );
    const gc = w.createCollider(RAPIER.ColliderDesc.convexHull(gummyHull()).setRestitution(0.32).setFriction(0.12).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS), this.gummy);
    void gc;
  }

  /** Put the gummy somewhere with a velocity (it counts as launched: the gate logic is live). */
  place(x: number, y: number, vx = 0, vy = 0, launched = true) {
    this.gummy.setTranslation({ x, y, z: 0 }, true);
    this.gummy.setLinvel({ x: vx, y: vy, z: 0 }, true);
    this.launched = launched;
    this.stall.reset();
  }

  /** Fire the plunger at `force` (the controller's launch rules: only from the plunger). */
  launch(force: number) {
    this.pending = force;
  }

  /** Serve a new ball: back on the plunger, gate open. */
  serve() {
    this.place(this.arena.spawn.x, this.arena.spawn.y, 0, 0, false);
    this.gateShut = false;
    this.gate.setEnabled(false);
    this.portalAt = null;
    this.reenteredLane = false;
  }

  get x() {
    return this.gummy.translation().x;
  }
  get y() {
    return this.gummy.translation().y;
  }
  get onPlunger() {
    const a = this.arena;
    return this.x > a.lane.xIn && this.y < a.lane.restY + 0.6 && this.y > a.lane.restY - 1;
  }

  /** One fixed step with the given flipper input. Mirrors the controller's order: flippers, controller rules, world step, kicks. */
  step(input: SimInput = { left: false, right: false }) {
    const dt = PHYSICS_DT;
    const a = this.arena;
    this.flippers.forEach((f, i) => {
      stepFlipper(f.state, i === 0 ? input.left : input.right, dt);
      f.cooldown = Math.max(0, f.cooldown - dt);
      const q = flipperRotation(a.flippers[i]!.side, f.state.angle);
      f.body.setNextKinematicRotation(q);
    });
    // controller
    const pos = this.gummy.translation();
    const v = this.gummy.linvel();
    let vx = v.x;
    let vy = v.y;
    let changed = false;
    const lane = a.lane;
    const inLane = pos.x > lane.xIn - 0.05 && pos.y < lane.dividerTop - 0.3;
    if (this.launched && !this.gateShut && clearedLane(a, pos)) {
      this.gateShut = true;
      this.gate.setEnabled(true);
    }
    if (this.pending !== null) {
      const force = this.pending;
      this.pending = null;
      if (inLane && pos.y < lane.restY + 1.4) {
        this.gummy.setLinvel({ x: 0, y: 0, z: 0 }, true);
        this.gummy.applyImpulse({ x: 0, y: this.gummy.mass() * force, z: 0 }, true);
        this.launched = true;
        this.stall.reset();
        this.advance();
        return;
      }
    }
    this.nudgeState.step(dt);
    if (this.nudgeAsked) {
      this.nudgeAsked = false;
      const k = inLane ? null : this.nudgeState.fire(this.nudgeRand);
      if (k) {
        this.nudgeFired += 1;
        vx += k.x;
        vy = Math.max(vy, 0) + k.y;
        changed = true;
        this.shift(pos, k);
        this.stall.reset();
      }
    }
    const centre = { x: pos.x, y: pos.y + 0.5 };
    this.flippers.forEach((f, i) => {
      if (f.cooldown > 0) return;
      const hit = flipImpulse(a.flippers[i]!, f.state, centre, { x: vx, y: vy }, 1);
      if (!hit) return;
      vx = hit.vx;
      vy = hit.vy;
      f.cooldown = FLIP_COOLDOWN_S;
      changed = true;
    });
    const inHole = Math.hypot(pos.x - a.portal.x, centre.y - a.portal.y) < a.portal.r;
    const onFlipper = inLane || inHole || this.flippers.some((f, i) => nearFlipper(a.flippers[i]!, f.state, centre));
    const n = this.stallOff ? null : this.stall.step(dt, { x: pos.x, y: pos.y }, onFlipper);
    if (n) {
      this.nudges.push({ t: this.t, x: pos.x, y: pos.y, vx: n.x, vy: n.y });
      vx = n.x;
      vy = n.y;
      changed = true;
      this.shift(pos, n);
    }
    if (changed) {
      const c = clampSpeed({ x: vx, y: vy }, MAX_SPEED);
      this.gummy.setLinvel({ x: c.x, y: c.y, z: 0 }, true);
    }
    this.advance();
  }

  /** Press Nudge (applied on the next step if the cooldown allows). */
  pressNudge() {
    this.nudgeAsked = true;
  }

  private shift(pos: { x: number; y: number }, d: { x: number; y: number }) {
    const l = Math.hypot(d.x, d.y) || 1;
    this.gummy.setTranslation({ x: pos.x + (d.x / l) * NUDGE_SHIFT, y: pos.y + (d.y / l) * NUDGE_SHIFT, z: 0 }, true);
  }

  private advance() {
    if (this.spinBody) {
      const spin = this.arena.bumpers.find((b) => b.spin)!.spin!;
      this.spinAngle += PHYSICS_DT * spin.speed;
      this.spinBody.setNextKinematicRotation(rotZ(this.spinAngle));
    }
    this.world.step(this.queue);
    this.t += PHYSICS_DT;
    this.queue.drainCollisionEvents((h1: number, h2: number, started: boolean) => {
      if (!started) return;
      const other = this.kinds.get(h1) ?? this.kinds.get(h2);
      if (!other) return;
      const k = `${other.kind}${other.i}`;
      const until = this.cool.get(k) ?? -1;
      if (other.kind === "sensor") {
        this.portalHits += 1;
        this.portalAt ??= this.t;
        return;
      }
      if (this.t < until) return;
      const p = this.gummy.translation();
      const v = this.gummy.linvel();
      const speed0 = Math.hypot(v.x, v.y);
      const a = this.arena;
      if (other.kind === "bumper") {
        const b = a.bumpers[other.i]!;
        const v2 = bumperKick(b.kind, p.x - b.x, p.y + 0.5 - b.y, speed0);
        this.gummy.setLinvel({ x: v2.x, y: v2.y, z: 0 }, true);
        this.bumperHits.push({ id: b.id, kind: b.kind, t: this.t });
        this.cool.set(k, this.t + 0.2);
      } else if (other.kind === "sling") {
        const sl = a.slings[other.i]!;
        if (!slingFacing(sl, p.x, p.y + 0.5)) return;
        const v2 = slingKick(sl, speed0);
        this.gummy.setLinvel({ x: v2.x, y: v2.y, z: 0 }, true);
        this.slingHits.push({ id: sl.id, t: this.t });
        this.cool.set(k, this.t + 0.22);
      } else {
        const pd = a.pads[other.i]!;
        const len = Math.hypot(pd.dir.x, pd.dir.y);
        const c = Math.cos(pd.angle ?? 0);
        const sn = Math.sin(pd.angle ?? 0);
        this.gummy.setLinvel({ x: ((pd.dir.x * c - pd.dir.y * sn) / len) * pd.speed, y: ((pd.dir.x * sn + pd.dir.y * c) / len) * pd.speed, z: 0 }, true);
        this.cool.set(k, this.t + 0.25);
      }
    });
    const { x, y } = this.gummy.translation();
    this.maxY = Math.max(this.maxY, y);
    if (this.gateShut && x > this.arena.lane.xIn + 0.1 && y < this.arena.lane.dividerTop - 0.3) this.reenteredLane = true;
  }

  /** Run until `done` or `seconds`. `input(t)` gives the flipper keys at sim time t (since this call began). */
  run(seconds: number, input: (t: number) => SimInput = () => ({ left: false, right: false }), done?: () => boolean) {
    const t0 = this.t;
    while (this.t - t0 < seconds) {
      this.step(input(this.t - t0));
      if (done?.()) break;
    }
  }
}
