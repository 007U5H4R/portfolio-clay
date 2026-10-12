"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { BallCollider, ConvexHullCollider, CuboidCollider, RigidBody, useBeforePhysicsStep, type CollisionEnterPayload, type RapierRigidBody } from "@react-three/rapier";
import {
  AdditiveBlending,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RingGeometry,
  Shape,
  TorusGeometry,
  TubeGeometry,
  Curve,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { portalSensor, wallBoxes, type BumperSpec, type GuideSpec, type PadSpec, type PlatformSpec, type RailSpec, type SlingSpec } from "@/lib/lab/arena";
import { BUMPER_TUNE, bumperKick, type BumperKind } from "@/lib/lab/bumpers";
import { slingFacing, slingKick } from "@/lib/lab/slings";
import { FLIPPER_THICK, FLIP_REST, FLIP_UP, flipperRotation, stepFlipper } from "@/lib/lab/flippers";
import { mix, type RGB } from "@/lib/lab/tokens";
import { BlackHole } from "./BlackHole";
import { BOARD_Z, Machine } from "./Machine";
import { col, createTintedPaper, tileUV } from "./materials";
import { creamRGB, disposeAll, flipperShape, glowMaterial, glowTexture, neonColors, shadowMaterial, shadowTextures, sheet, starShape } from "./paper-kit";
import { PHYSICS_DT } from "./physics-step";
import { useRuntime } from "./runtime";

/**
 * The arena (gummy-bear.md §15, §29, §33; pinball since TASK-172; a paper-cut machine since TASK-185): every collider and
 * every moving part. Colliders are fixed or kinematic and unchanged in kind from the old arena; what changed is the body
 * around them: layered cardstock, lit edges, four kinds of bumper that compress and flash, slingshots, a real plunger and the
 * lane it fires into. The static scenery (table, cabinet, lights, drain) is Machine.tsx.
 * All per-frame motion reads the runtime's env knobs (difficulty) and refs: no React state per frame.
 */
const isBear = (p: CollisionEnterPayload) => p.other.rigidBodyObject?.name === "gummy";
const DEPTH = 1.2;
const tint = (a: RGB, b: RGB, t: number) => mix(a, b, t);

/** Frees whatever a part builds (geometries, materials, textures) when it unmounts. */
function useOwned<T extends object>(build: () => T): T {
  const [kit] = useState(build);
  useEffect(
    () => () => {
      for (const v of Object.values(kit)) disposeAll(Array.isArray(v) ? v : [v]);
    },
    [kit],
  );
  return kit;
}

/** The soft contact shadows every part shares (spec §3): a blob for round things, and a flat dark material for outlines. */
const ShadowCtx = createContext<{ unit: PlaneGeometry; blobMat: MeshBasicMaterial; flatMat: MeshBasicMaterial } | null>(null);
const useShadows = () => {
  const v = useContext(ShadowCtx);
  if (!v) throw new Error("useShadows outside <Arena>");
  return v;
};

export function Arena() {
  const rt = useRuntime();
  const { arena } = rt;
  const root = useRef<Group>(null);
  const shadows = useOwned(() => {
    const { blob, edge } = shadowTextures();
    const k = rt.palette.isDark ? 0.5 : 0.36;
    return { blob, edge, unit: new PlaneGeometry(1, 1), blobMat: shadowMaterial(blob, k), flatMat: new MeshBasicMaterial({ color: col(tint(rt.palette.tok.navy, [0, 0, 0] as RGB, 0.6)), transparent: true, opacity: k * 0.55, depthWrite: false, toneMapped: false }) };
  });
  // The intro and results are product shots on a bare backdrop; the machine appears with the countdown.
  useFrame(() => {
    const st = rt.store.getState().state;
    const shown = st === "COUNTDOWN" || st === "PLAYING" || st === "DANGER" || st === "PAUSED" || st === "GAME_OVER" || st === "EXITING";
    if (root.current && root.current.visible !== shown) root.current.visible = shown;
  });
  return (
    <ShadowCtx.Provider value={shadows}>
    <group ref={root} visible={false}>
      <Machine />
      <Walls />
      {arena.rails.map((r) => (
        <Rail key={r.id} spec={r} />
      ))}
      {arena.guides.map((g) => (
        <Guide key={g.id} spec={g} />
      ))}
      <Flipper index={0} />
      <Flipper index={1} />
      {arena.slings.map((s) => (
        <Sling key={s.id} spec={s} />
      ))}
      {arena.platforms.map((p, i) => (
        <Platform key={p.id} spec={p} tint={i} />
      ))}
      {arena.pads.map((p) => (
        <Pad key={p.id} spec={p} />
      ))}
      {arena.bumpers.map((b) => (
        <Bumper key={b.id} spec={b} />
      ))}
      <Plunger />
      <LaneGate />
      <BlackHole />
    </group>
    </ShadowCtx.Provider>
  );
}

/* ---- colliders for the cabinet: walls, divider, outer lane wall, ceiling, a floor under the plunger ------------------------- */

function Walls() {
  const rt = useRuntime();
  const { arena } = rt;
  const sensor = portalSensor(arena);
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        {wallBoxes(arena).map((w) => (
          <CuboidCollider key={w.id} args={[w.hx, w.hy, 1.5]} position={[w.cx, w.cy, 0]} restitution={w.restitution} friction={w.friction} />
        ))}
      </RigidBody>
      {/* the black hole in the playfield's top-left: touching it sends the gummy back to the portfolio (a sensor, so it never pushes) */}
      <RigidBody type="fixed" colliders={false}>
        <BallCollider
          args={[sensor.r]}
          position={[sensor.x, sensor.y, 0]}
          sensor
          onIntersectionEnter={(p) => {
            if (p.other.rigidBodyObject?.name === "gummy") rt.hooks.portal();
          }}
        />
      </RigidBody>
    </>
  );
}

/* ---- the lane's one-way gate -------------------------------------------------------------------------------------------------- */

/** Seconds the gate takes to drop shut. */
const GATE_SHUT_S = 0.16;

/**
 * The one-way gate on the shooter lane's open side (TASK-185 follow-up): a paper panel that rolls up into the arch while the lane
 * is live (collider off, so any launch passes) and drops down in ~160 ms (a snap under reduced motion) once the launched gummy
 * is clear of the lane (`rt.laneGateShut`, latched by the controller), turning its collider on: the gummy can never drop back
 * into the lane. A new serve reopens it.
 */
function LaneGate() {
  const rt = useRuntime();
  const { gate } = rt.arena;
  const rb = useRef<RapierRigidBody>(null);
  const flap = useRef<Group>(null);
  const swing = useRef(0);
  const len = gate.y2 - gate.y1;
  const enabled = useRef<boolean | null>(null);
  const kit = useOwned(() => {
    const tok = rt.palette.tok;
    const g = new RoundedBoxGeometry(gate.thick * 2.2, len, 0.9, 3, 0.05);
    tileUV(g, gate.thick, len);
    const strip = new RoundedBoxGeometry(gate.thick * 0.8, len * 0.9, 0.05, 1, 0.02);
    return {
      g,
      strip,
      m: createTintedPaper(tint(tok.terracotta, tok.rust, 0.4), { lift: 0.06 }),
      stripMat: new MeshBasicMaterial({ color: col(tint(tok.ivory, tok.kraft, 0.4)) }),
    };
  });
  useBeforePhysicsStep(() => {
    const on = rt.laneGateShut;
    if (enabled.current !== on) {
      enabled.current = on;
      rb.current?.setEnabled(on);
    }
  });
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const target = rt.laneGateShut ? 1 : 0;
    // 0 = rolled up, 1 = shut. Shutting takes GATE_SHUT_S; reduced motion snaps. Reopening (a new serve) is instant.
    if (rt.reducedMotion || target === 0) swing.current = target;
    else swing.current = Math.min(1, swing.current + dt / GATE_SHUT_S);
    const ease = 1 - Math.pow(1 - swing.current, 3);
    if (flap.current) {
      flap.current.scale.y = Math.max(0.02, ease);
      flap.current.visible = swing.current > 0;
    }
  });
  return (
    <>
      <RigidBody ref={rb} type="fixed" colliders={false} position={[gate.x1, (gate.y1 + gate.y2) / 2, 0]}>
        <CuboidCollider args={[gate.thick / 2, len / 2, DEPTH / 2 + 0.2]} restitution={0.35} friction={0.05} />
      </RigidBody>
      {/* hinged at the top (under the arch), hanging down */}
      <group position={[gate.x1, gate.y2, 0.05]}>
        <group ref={flap} visible={false}>
          <mesh geometry={kit.g} material={kit.m} position={[0, -len / 2, 0]} />
          <mesh geometry={kit.strip} material={kit.stripMat} position={[0, -len / 2, 0.47]} />
        </group>
      </group>
    </>
  );
}

/** A fixed paper rail (the lane's arch, the divider's cap, the top-left corner): a collider and a sheet of kraft. */
function Rail({ spec }: { spec: RailSpec }) {
  const rt = useRuntime();
  const len = Math.hypot(spec.x2 - spec.x1, spec.y2 - spec.y1);
  const angle = Math.atan2(spec.y2 - spec.y1, spec.x2 - spec.x1);
  const kit = useOwned(() => {
    const g = new RoundedBoxGeometry(len + 0.04, spec.thick, 1.0, 3, Math.min(0.1, spec.thick * 0.4));
    tileUV(g, len, spec.thick);
    const tok = rt.palette.tok;
    return { g, m: createTintedPaper(tint(tok.kraft, tok.ivory, 0.3), { lift: 0.03 }) };
  });
  return (
    <RigidBody type="fixed" colliders={false} position={[(spec.x1 + spec.x2) / 2, (spec.y1 + spec.y2) / 2, 0]} rotation={[0, 0, angle]}>
      <CuboidCollider args={[len / 2 + 0.02, spec.thick / 2, DEPTH / 2 + 0.2]} restitution={0.3} friction={0.05} />
      <mesh geometry={kit.g} material={kit.m} />
    </RigidBody>
  );
}

/** An in-lane rail: a fixed slope from the wall down to a flipper pivot. */
function Guide({ spec }: { spec: GuideSpec }) {
  const rt = useRuntime();
  const len = Math.hypot(spec.x2 - spec.x1, spec.y2 - spec.y1);
  const angle = Math.atan2(spec.y2 - spec.y1, spec.x2 - spec.x1);
  const kit = useOwned(() => {
    const g = new RoundedBoxGeometry(len, 0.3, DEPTH * 0.8, 3, 0.1);
    tileUV(g, len, 0.3);
    const tok = rt.palette.tok;
    return { g, m: createTintedPaper(tint(tok.kraft, tok.ivory, 0.3), { lift: 0.03 }) };
  });
  return (
    <RigidBody type="fixed" colliders={false} position={[(spec.x1 + spec.x2) / 2, (spec.y1 + spec.y2) / 2, 0]} rotation={[0, 0, angle]}>
      <CuboidCollider args={[len / 2, 0.15, DEPTH / 2 + 0.2]} restitution={0.25} friction={0.1} />
      <mesh geometry={kit.g} material={kit.m} />
    </RigidBody>
  );
}

/* ---- flippers ---------------------------------------------------------------------------------------------------------------- */

/**
 * A flipper (TASK-172, redrawn TASK-185): a kinematic paper paddle pivoting at its inner end. Its angle is stepped once per
 * fixed physics step from the runtime's `pressed` flag; hits are handled in the gummy controller from the same state, so the
 * swing and the impulse always agree. The paddle is a tapered cardstock body with a cream inlay, a steel pivot screw and a
 * lit edge that brightens while it is raised. The visual alone overshoots a hair on the way up and settles on the way down.
 */
function Flipper({ index }: { index: 0 | 1 }) {
  const rt = useRuntime();
  const f = rt.flippers[index];
  const { layout } = f;
  const shadows = useShadows();
  const rb = useRef<RapierRigidBody>(null);
  const visual = useRef<Group>(null);
  const neon = useMemo(() => neonColors(rt.palette), [rt.palette]);
  const kit = useOwned(() => {
    const tok = rt.palette.tok;
    const depth = 0.8;
    const body = sheet(flipperShape(layout.len, 0.25, 0.165), depth, 0.03);
    body.translate(0, 0, -depth / 2);
    const inlay = sheet(flipperShape(layout.len * 0.9, 0.105, 0.052), 0.05, 0.015);
    inlay.translate(layout.len * 0.04, 0, depth / 2 + 0.01);
    const bodyMat = createTintedPaper(tint(tok.rust, tok.terracotta, 0.35), { lift: 0.07 });
    const inlayMat = createTintedPaper(tint(creamRGB(rt.palette), tok.kraft, 0.08), { lift: 0.1 });
    const screw = new CylinderGeometry(0.1, 0.1, 0.1, 14);
    const screwMat = new MeshStandardMaterial({ color: col(tint(tok.kraft, tok.ivory, 0.5)), metalness: 0.8, roughness: 0.3, envMapIntensity: 1 });
    const edge = new RoundedBoxGeometry(layout.len * 0.78, 0.05, 0.05, 1, 0.02);
    const edgeMat = new MeshBasicMaterial({ color: neon.amber.clone(), toneMapped: false });
    const tex = glowTexture(128, 2);
    const glow = new PlaneGeometry(layout.len + 1.0, 1.5);
    const glowMat = glowMaterial(neon.amber, tex, 0.1);
    return { body, inlay, bodyMat, inlayMat, screw, screwMat, edge, edgeMat, tex, glow, glowMat, depth };
  });
  useEffect(() => {
    f.body = rb;
    return () => {
      f.body = { current: null };
    };
  }, [f]);
  const spring = useRef({ x: 0, v: 0, up: false, down: true });
  useBeforePhysicsStep(() => {
    stepFlipper(f.state, f.pressed && rt.store.getState().machine.running, PHYSICS_DT);
    f.cooldown = Math.max(0, f.cooldown - PHYSICS_DT);
    f.body.current?.setNextKinematicRotation(flipperRotation(layout.side, f.state.angle));
  });
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const s = spring.current;
    const a = f.state.angle;
    // overshoot / settle: kick the visual spring when the paddle arrives at either end
    if (!s.up && a >= FLIP_UP - 0.004) {
      s.up = true;
      s.down = false;
      s.v += 7;
    } else if (!s.down && a <= FLIP_REST + 0.004) {
      s.down = true;
      s.up = false;
      s.v -= 3.2;
    }
    if (a < FLIP_UP - 0.05) s.up = false;
    if (a > FLIP_REST + 0.05) s.down = false;
    s.v += (-460 * s.x - 17 * s.v) * dt;
    s.x += s.v * dt;
    if (visual.current) visual.current.rotation.z = rt.reducedMotion ? 0 : (layout.side === "left" ? 1 : -1) * s.x * 0.09;
    // the lit edge: a soft warm line at rest, brighter while raised (a flash lives on the hit hook)
    const raised0 = Math.min(1, Math.max(0, (a - FLIP_REST) / (FLIP_UP - FLIP_REST)));
    const raised = rt.reducedMotion ? (raised0 > 0.5 ? 1 : 0) : raised0;
    // a hit on the gummy flashes the edge (a beat, about 250 ms; a reduced-motion edge just goes on and off)
    f.flash = Math.max(0, f.flash - dt * 4);
    const flash = rt.reducedMotion ? (f.flash > 0.4 ? 1 : 0) : f.flash;
    const lit = 0.42 + 0.58 * raised + 1.1 * flash;
    kit.edgeMat.color.copy(neon.white).lerp(neon.amber, Math.max(0, 1 - flash * 1.4)).multiplyScalar(lit);
    kit.glowMat.opacity = 0.06 + 0.16 * raised + 0.3 * flash;
  });
  const rest = flipperRotation(layout.side, f.state.angle);
  const theta = 2 * Math.atan2(rest.z, rest.w);
  return (
    <RigidBody ref={rb} type="kinematicPosition" colliders={false} position={[layout.pivot.x, layout.pivot.y, 0]} rotation={[0, 0, theta]} name={`flipper-${layout.side}`}>
      <CuboidCollider args={[layout.len / 2 + 0.15, FLIPPER_THICK / 2, DEPTH / 2 + 0.2]} position={[layout.len / 2, 0, 0]} restitution={0.3} friction={0.1} />
      {/* the contact shadow on the table, to the lower right of the upper-left light (the right paddle's frame is turned half a turn, so its offset flips) */}
      <mesh geometry={kit.body} material={shadows.flatMat} position={[(layout.side === "left" ? 1 : -1) * 0.1, (layout.side === "left" ? -1 : 1) * 0.14, -0.58]} scale={[1, 1, 0.02]} />
      <group ref={visual}>
        {rt.tier.tier === "low" ? null : <mesh geometry={kit.glow} material={kit.glowMat} position={[layout.len / 2, 0, -0.35]} renderOrder={2} />}
        <mesh geometry={kit.body} material={kit.bodyMat} />
        <mesh geometry={kit.inlay} material={kit.inlayMat} />
        <mesh geometry={kit.screw} material={kit.screwMat} position={[0, 0, kit.depth / 2 + 0.08]} rotation-x={Math.PI / 2} />
        {[-1, 1].map((sgn) => (
          <mesh key={sgn} geometry={kit.edge} material={kit.edgeMat} position={[layout.len * 0.5, sgn * 0.215, kit.depth / 2 - 0.04]} rotation-z={sgn * -0.035} />
        ))}
      </group>
    </RigidBody>
  );
}

/* ---- ramps and the spring pad ------------------------------------------------------------------------------------------------- */

const PLATFORM_TINTS = ["kraft", "sage", "steel", "terracotta"] as const;

function Platform({ spec, tint: ti }: { spec: PlatformSpec; tint: number }) {
  const rt = useRuntime();
  const rb = useRef<RapierRigidBody>(null);
  const group = useRef<Group>(null);
  const neon = useMemo(() => neonColors(rt.palette), [rt.palette]);
  const kit = useOwned(() => {
    const g = new RoundedBoxGeometry(spec.w, spec.h, DEPTH * 0.85, 3, Math.min(0.12, spec.h * 0.42));
    tileUV(g, spec.w, spec.h);
    const tok = rt.palette.tok;
    const base = tok[PLATFORM_TINTS[ti % PLATFORM_TINTS.length]!];
    const m = createTintedPaper(tint(base, tok.ivory, 0.32), { lift: 0.04 });
    if (spec.vanishes) {
      m.transparent = true;
      m.opacity = 0.9;
    }
    const edge = new RoundedBoxGeometry(spec.w * 0.86, 0.04, 0.04, 1, 0.015);
    const edgeMat = new MeshBasicMaterial({ color: neon.amber.clone().multiplyScalar(0.65), toneMapped: false });
    return { g, m, edge, edgeMat };
  });
  const phase = useRef(spec.slide?.phase ?? 0);
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const body = rb.current;
    if (!body) return;
    const motion = rt.env.motion;
    let x = spec.x;
    if (spec.slide) {
      phase.current += dt * spec.slide.speed * Math.min(2, motion);
      x = spec.x + spec.slide.amp * Math.min(1, motion) * Math.sin(phase.current);
    }
    body.setNextKinematicTranslation({ x, y: spec.y, z: 0 });
    if (spec.vanishes && group.current) {
      const period = spec.vanishes.period;
      const t = (rt.time + spec.vanishes.offset) % period;
      const solid = !rt.env.vanish || t < period * 0.68;
      const warning = rt.env.vanish && t > period * 0.68 - 0.9 && t < period * 0.68;
      body.setEnabled(solid);
      const k = solid ? (warning ? 0.85 + 0.15 * Math.sin(rt.time * 30) : 1) : 0.0;
      const s = group.current.scale.x;
      group.current.scale.setScalar(s + (k - s) * 0.25);
      group.current.visible = group.current.scale.x > 0.04;
    }
  });
  return (
    <RigidBody ref={rb} type="kinematicPosition" colliders={false} position={[spec.x, spec.y, 0]} rotation={[0, 0, spec.angle ?? 0]}>
      <CuboidCollider args={[spec.w / 2, spec.h / 2, DEPTH / 2 + 0.2]} restitution={0.2} friction={0.1} />
      <group ref={group}>
        <mesh geometry={kit.g} material={kit.m} />
        <mesh geometry={kit.edge} material={kit.edgeMat} position={[0, spec.h / 2 - 0.01, DEPTH * 0.42 + 0.0]} />
      </group>
    </RigidBody>
  );
}

function Pad({ spec }: { spec: PadSpec }) {
  const rt = useRuntime();
  const rb = useRef<RapierRigidBody>(null);
  const top = useRef<Group>(null);
  const hit = useRef(0);
  const cooldown = useRef(0);
  const kit = useOwned(() => {
    const tok = rt.palette.tok;
    return {
      geoBase: new CylinderGeometry(spec.w * 0.5, spec.w * 0.55, 0.12, 24),
      geoTop: new CylinderGeometry(spec.w * 0.46, spec.w * 0.46, 0.1, 24),
      baseMat: createTintedPaper(tint(tok.ivory, tok.kraft, 0.3)),
      topMat: createTintedPaper(tint(tok.note, tok.rust, 0.55), { lift: 0.08 }),
    };
  });
  useFrame((_, dt) => {
    cooldown.current = Math.max(0, cooldown.current - dt);
    hit.current = Math.max(0, hit.current - dt * 3);
    if (top.current) {
      const k = hit.current;
      top.current.scale.y = 1 - 0.5 * Math.sin(k * Math.PI) + 0.25 * Math.sin(k * 9) * k;
      top.current.position.y = 0.09 + 0.1 * (top.current.scale.y - 1);
    }
  });
  const onEnter = (p: CollisionEnterPayload) => {
    if (!isBear(p) || cooldown.current > 0) return;
    const body = rt.bearBody.current;
    if (!body) return;
    cooldown.current = 0.25;
    hit.current = 1;
    const len = Math.hypot(spec.dir.x, spec.dir.y);
    const mul = rt.bounceMul;
    const c = Math.cos(spec.angle ?? 0);
    const sn = Math.sin(spec.angle ?? 0);
    const dx = (spec.dir.x * c - spec.dir.y * sn) / len;
    const dy = (spec.dir.x * sn + spec.dir.y * c) / len;
    body.setLinvel({ x: dx * spec.speed * mul, y: dy * spec.speed * mul, z: 0 }, true);
    rt.bear.sinceBounce = 0;
    rt.jelly.impact(0, -1, 16);
    rt.hooks.pad(spec, spec.x, spec.y);
  };
  return (
    <RigidBody ref={rb} type="fixed" colliders={false} position={[spec.x, spec.y, 0]} rotation={[0, 0, spec.angle ?? 0]} onCollisionEnter={onEnter}>
      <CuboidCollider args={[spec.w / 2, 0.1, 0.6]} position={[0, 0.1, 0]} restitution={0} />
      <mesh geometry={kit.geoBase} material={kit.baseMat} position={[0, 0.06, 0]} />
      <group ref={top} position={[0, 0.09, 0]}>
        <mesh geometry={kit.geoTop} material={kit.topMat} position={[0, 0.06, 0]} />
      </group>
    </RigidBody>
  );
}

/* ---- bumpers ------------------------------------------------------------------------------------------------------------------- */

/** Each kind's paper: the colour of its ring and cap (a role token), its lit ring's light, and the cap's silhouette (sides: 36 = round). */
const BUMPER_LOOK: Record<BumperKind, { tint: "note" | "rust" | "steel" | "sage"; sides: number; light: "amber" | "magenta" | "cyan" | "white" }> = {
  pop: { tint: "note", sides: 36, light: "amber" },
  jet: { tint: "rust", sides: 8, light: "magenta" },
  thumper: { tint: "steel", sides: 4, light: "cyan" },
  turbo: { tint: "sage", sides: 3, light: "white" },
};

/** The mark on a cap: pop a five-point star, jet an eight-point burst, thumper a ring (a target), turbo a pair of chevrons. */
function capMark(kind: BumperKind, R: number) {
  if (kind === "pop") return sheet(starShape(R * 0.42, 0.46), 0.04, 0.01);
  if (kind === "jet") return sheet(starShape(R * 0.44, 0.55, 8), 0.04, 0.01);
  if (kind === "thumper") {
    const ring = new Shape();
    ring.absarc(0, 0, R * 0.34, 0, Math.PI * 2, false);
    const hole = new Shape();
    hole.absarc(0, 0, R * 0.2, 0, Math.PI * 2, true);
    ring.holes.push(hole);
    return sheet(ring, 0.04, 0.01);
  }
  // turbo: two stacked chevrons pointing up (the way it throws you)
  const w = R * 0.4;
  const t = R * 0.16;
  const chevron = (y: number) => {
    const c = new Shape();
    c.moveTo(-w, y);
    c.lineTo(0, y + w * 0.8);
    c.lineTo(w, y);
    c.lineTo(w, y - t);
    c.lineTo(0, y + w * 0.8 - t * 1.4);
    c.lineTo(-w, y - t);
    c.closePath();
    return sheet(c, 0.04, 0.01).toNonIndexed();
  };
  return mergeGeometries([chevron(-R * 0.22), chevron(R * 0.18)], false)!;
}

/**
 * A pinball bumper (spec §11, §18; four kinds since TASK-199): a round paper skirt, a ring and a raised cap whose shape says what it does
 * (pop round, jet eight-sided, thumper square, turbo three-sided), a mark on the cap and a recessed lit ring. On a hit the cap presses in
 * and the ring flashes, then both ease back over about 300 ms; a jet also throws a ring of light out from the cap. At rest the ring only
 * glows softly. The kick and the extra effects come from lib/lab/bumpers.ts; the table shake (thumper) and the trail burst (turbo) are
 * the fx hook's. Everything is built once; per frame only existing meshes' scale and opacity change (no allocation).
 */
function Bumper({ spec }: { spec: BumperSpec }) {
  const rt = useRuntime();
  const rb = useRef<RapierRigidBody>(null);
  const group = useRef<Group>(null);
  const button = useRef<Group>(null);
  const flash = useRef<Mesh>(null);
  const hit = useRef(0);
  const cooldown = useRef(0);
  const angle = useRef(0);
  const appear = useRef(spec.minPhase === 0 ? 1 : 0);
  const shadows = useShadows();
  const neon = useMemo(() => neonColors(rt.palette), [rt.palette]);
  const look = BUMPER_LOOK[spec.kind];
  const tune = BUMPER_TUNE[spec.kind];
  const lightCol = look.light === "white" ? neon.white.clone().lerp(neon.amber, 0.35) : neon[look.light];
  const kit = useOwned(() => {
    const tok = rt.palette.tok;
    const R = spec.r;
    const base = tok[look.tint];
    const rotX = (g: { rotateX(a: number): unknown }) => g.rotateX(Math.PI / 2);
    // square: turn the 4-sided cylinder an eighth so it has flat sides to the table's axes; the others have a vertex up
    const turn = (g: { rotateY(a: number): unknown }) => (look.sides === 4 ? g.rotateY(Math.PI / 4) : look.sides === 3 ? g.rotateY(Math.PI) : g);
    const skirt = new CylinderGeometry(R * 1.2, R * 1.26, 0.2, 36);
    rotX(skirt);
    const ring = new CylinderGeometry(R * 1.0, R * 1.04, spec.kind === "thumper" ? 0.4 : 0.32, look.sides);
    turn(ring);
    rotX(ring);
    const btn = new CylinderGeometry(R * 0.66, R * 0.72, 0.3, look.sides);
    turn(btn);
    rotX(btn);
    const star = capMark(spec.kind, R);
    const lit = new TorusGeometry(R * 1.1, 0.034, 8, 48);
    const barGeo = spec.spin ? new RoundedBoxGeometry(spec.spin.len, 0.22, 0.5, 3, 0.1) : null;
    const skirtMat = createTintedPaper(tint(tok.ivory, tok.kraft, 0.3), { lift: 0.05 });
    const ringMat = createTintedPaper(tint(base, tok.ivory, spec.kind === "pop" ? 0.18 : 0.12), { lift: 0.05 });
    const btnMat = createTintedPaper(tint(base, tok.ivory, 0.34), { lift: 0.07 });
    const starMat = createTintedPaper(creamRGB(rt.palette), { lift: 0.14 });
    const litMat = new MeshBasicMaterial({ color: lightCol.clone(), toneMapped: false });
    const tex = glowTexture(128, 2);
    const halo = new PlaneGeometry(R * 4.4, R * 4.4);
    const haloMat = glowMaterial(lightCol, tex, 0.16);
    // the jet's ring flash: a thin additive ring that spreads out from the cap and fades (hidden at rest)
    const flashGeo = tune.ringFlash ? new RingGeometry(R * 1.14, R * 1.26, 48) : null;
    const flashMat = tune.ringFlash ? new MeshBasicMaterial({ color: lightCol.clone(), transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, toneMapped: false }) : null;
    return { skirt, ring, btn, star, lit, barGeo, skirtMat, ringMat, btnMat, starMat, litMat, tex, halo, haloMat, flashGeo, flashMat };
  });
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    cooldown.current = Math.max(0, cooldown.current - dt);
    // snappy: out in ~330 ms (the spec's 200–350 ms)
    hit.current = Math.max(0, hit.current - dt * 3.1);
    const active = rt.env.phase >= spec.minPhase;
    appear.current += ((active ? 1 : 0) - appear.current) * 0.12;
    // Reduced motion: the lights change state (lit for a beat, then off) without easing or pulsing, and nothing compresses.
    const rm = rt.reducedMotion;
    const h = rm ? (hit.current > 0.35 ? 1 : 0) : hit.current;
    const press = rm ? 0 : Math.sin(Math.min(1, h * 1.15) * Math.PI * 0.5);
    if (group.current) {
      group.current.scale.setScalar(appear.current * (1 + (spec.kind === "thumper" ? 0.08 : 0.05) * press));
      group.current.visible = appear.current > 0.03;
    }
    if (button.current) button.current.position.z = 0.18 - (spec.kind === "thumper" ? 0.16 : 0.12) * press;
    // ambient glow at rest, a bright pulse on a hit, then a smooth decay
    kit.litMat.color.copy(lightCol).multiplyScalar(0.5 + 1.1 * h * h);
    kit.haloMat.opacity = 0.12 + 0.5 * h;
    const fl = flash.current;
    if (fl && kit.flashMat) {
      // the ring leaves the cap and widens as `h` falls from 1 to 0; a reduced-motion ring just lights and goes out where it is
      const k = rm ? 0.35 : 1 - h;
      fl.scale.setScalar(rm ? 1.3 : 1 + k * 0.9);
      kit.flashMat.opacity = h > 0 ? 0.85 * h : 0;
      fl.visible = h > 0.02;
    }
    rb.current?.setEnabled(active);
    if (spec.spin && rb.current) {
      angle.current += dt * spec.spin.speed * (0.6 + 0.4 * Math.min(2, Math.max(1, rt.env.motion)));
      const a = angle.current / 2;
      rb.current.setNextKinematicRotation({ x: 0, y: 0, z: Math.sin(a), w: Math.cos(a) });
    }
  });
  const onEnter = (p: CollisionEnterPayload) => {
    if (!isBear(p) || cooldown.current > 0) return;
    const body = rt.bearBody.current;
    if (!body) return;
    cooldown.current = 0.2;
    hit.current = 1;
    const b = rt.bear;
    const dx = b.x - spec.x;
    const dy = b.y + 0.5 - spec.y;
    const incoming = Math.hypot(b.vx, b.vy);
    const v = bumperKick(spec.kind, dx, dy, incoming, rt.bounceMul);
    body.setLinvel({ x: v.x, y: v.y, z: 0 }, true);
    b.sinceBounce = 0;
    const len = Math.hypot(dx, dy) || 1;
    rt.jelly.impact(-dx / len, -dy / len, 14 + Math.max(0, Math.hypot(v.x, v.y) - 9) * 0.5);
    rt.hooks.bumper(spec.id, spec.kind, spec.x, spec.y);
  };
  return (
    <RigidBody ref={rb} type={spec.spin ? "kinematicPosition" : "fixed"} colliders={false} position={[spec.x, spec.y, 0]} onCollisionEnter={onEnter}>
      {spec.spin ? <CuboidCollider args={[spec.spin.len / 2, 0.11, 0.5]} restitution={0.9} /> : <BallCollider args={[spec.r]} restitution={1} />}
      <group ref={group}>
        {kit.barGeo ? (
          <>
            <mesh geometry={kit.barGeo} material={kit.ringMat} />
            <mesh geometry={kit.btn} material={kit.btnMat} scale={[0.5, 1, 0.5]} />
          </>
        ) : (
          <>
            {rt.tier.tier === "low" ? null : <mesh geometry={kit.halo} material={kit.haloMat} position={[0, 0, -0.3]} renderOrder={2} />}
            <mesh geometry={shadows.unit} material={shadows.blobMat} position={[spec.r * 0.3, -spec.r * 0.36, -0.5]} scale={[spec.r * 3.1, spec.r * 3.1, 1]} />
            <mesh geometry={kit.skirt} material={kit.skirtMat} position={[0, 0, -0.34]} />
            <mesh geometry={kit.ring} material={kit.ringMat} position={[0, 0, -0.1]} />
            <mesh geometry={kit.lit} material={kit.litMat} position={[0, 0, 0.1]} />
            {kit.flashGeo && kit.flashMat ? <mesh ref={flash} geometry={kit.flashGeo} material={kit.flashMat} position={[0, 0, 0.14]} visible={false} renderOrder={3} /> : null}
            <group ref={button} position={[0, 0, 0.18]}>
              <mesh geometry={kit.btn} material={kit.btnMat} />
              <mesh geometry={kit.star} material={kit.starMat} position={[0, 0, 0.16]} />
            </group>
          </>
        )}
      </group>
    </RigidBody>
  );
}

/* ---- slingshots ---------------------------------------------------------------------------------------------------------------- */

/**
 * A slingshot (spec §20; the side trapezia TASK-199): a paper shape on a guide or against a wall. A gummy that hits the kicking face is
 * pushed away along its normal (lib/lab/slings.ts); the face's lit strip flashes and the trim presses in for a beat, then releases. The
 * wall ones carry no label: green cardstock (so they stand out from the orange cabinet), a cream face and a lit strip.
 */
function Sling({ spec }: { spec: SlingSpec }) {
  const rt = useRuntime();
  const shadows = useShadows();
  const trim = useRef<Group>(null);
  const hit = useRef(0);
  const cooldown = useRef(0);
  const neon = useMemo(() => neonColors(rt.palette), [rt.palette]);
  const [f0, f1] = spec.face;
  const kit = useOwned(() => {
    const tok = rt.palette.tok;
    const s = new Shape();
    spec.pts.forEach((p, i) => {
      const x = p.x - spec.mid.x;
      const y = p.y - spec.mid.y;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    });
    s.closePath();
    const depth = 0.75;
    const body = sheet(s, depth, 0.04);
    body.translate(0, 0, -depth / 2);
    const faceLen = Math.hypot(f1.x - f0.x, f1.y - f0.y);
    const bar = new RoundedBoxGeometry(faceLen, 0.1, 0.34, 2, 0.04);
    const strip = new RoundedBoxGeometry(faceLen * 0.82, 0.05, 0.05, 1, 0.02);
    const button = new CylinderGeometry(0.1, 0.1, 0.12, 14);
    button.rotateX(Math.PI / 2);
    const bodyMat = createTintedPaper(spec.kind === "wall" ? tint(tok.forest, tok.sage, 0.3) : tint(tok.rust, tok.ivory, 0.2), { lift: 0.08 });
    const barMat = createTintedPaper(tint(creamRGB(rt.palette), tok.kraft, 0.1), { lift: 0.1 });
    const stripMat = new MeshBasicMaterial({ color: neon.amber.clone(), toneMapped: false });
    const buttonMat = new MeshBasicMaterial({ color: neon.amber.clone(), toneMapped: false });
    // hull for the collider: the prism, in world coordinates
    const hull = new Float32Array(
      spec.pts.flatMap((p) => [
        [p.x, p.y, -0.6],
        [p.x, p.y, 0.6],
      ]).flat(),
    );
    return { body, bar, strip, button, bodyMat, barMat, stripMat, buttonMat, hull, faceLen };
  });
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    cooldown.current = Math.max(0, cooldown.current - dt);
    hit.current = Math.max(0, hit.current - dt * 3.4);
    const rm = rt.reducedMotion;
    const h = rm ? (hit.current > 0.35 ? 1 : 0) : hit.current;
    const press = rm ? 0 : Math.sin(Math.min(1, h * 1.1) * Math.PI * 0.5);
    if (trim.current) {
      trim.current.position.set(-spec.normal.x * 0.1 * press, -spec.normal.y * 0.1 * press, 0);
    }
    kit.stripMat.color.copy(neon.amber).multiplyScalar(0.55 + 1.2 * h);
    kit.buttonMat.color.copy(neon.amber).multiplyScalar(0.7 + 1.0 * h);
  });
  const onEnter = (p: CollisionEnterPayload) => {
    if (!isBear(p) || cooldown.current > 0) return;
    const body = rt.bearBody.current;
    if (!body) return;
    const bear = rt.bear;
    // only a gummy on the kicking face's side is kicked (never one that clipped the back or the base)
    if (!slingFacing(spec, bear.x, bear.y + 0.5)) return;
    cooldown.current = 0.22;
    hit.current = 1;
    const v = slingKick(spec, Math.hypot(bear.vx, bear.vy), rt.bounceMul);
    body.setLinvel({ x: v.x, y: v.y, z: 0 }, true);
    bear.sinceBounce = 0;
    rt.jelly.impact(-spec.normal.x, -spec.normal.y, 12);
    rt.hooks.sling(spec.id, spec.mid.x, spec.mid.y);
  };
  // the face runs f0 → f1; angle of that edge
  const faceAng = Math.atan2(f1.y - f0.y, f1.x - f0.x);
  return (
    <RigidBody type="fixed" colliders={false} onCollisionEnter={onEnter}>
      <ConvexHullCollider args={[kit.hull]} restitution={0.5} friction={0.05} />
      <group position={[spec.mid.x, spec.mid.y, 0]}>
        <mesh geometry={kit.body} material={shadows.flatMat} position={[0.1, -0.14, -0.58]} scale={[1, 1, 0.02]} />
        <mesh geometry={kit.body} material={kit.bodyMat} />
        <group ref={trim}>
          <group rotation={[0, 0, faceAng]} position={[spec.normal.x * 0.02, spec.normal.y * 0.02, 0.38]}>
            <mesh geometry={kit.bar} material={kit.barMat} />
            <mesh geometry={kit.strip} material={kit.stripMat} position={[0, 0.06, 0.2]} />
          </group>
        </group>
        <mesh geometry={kit.button} material={kit.buttonMat} position={[0, 0, 0.42]} />
      </group>
    </RigidBody>
  );
}

/* ---- the plunger --------------------------------------------------------------------------------------------------------------- */

/** A coil spring along y: `turns` loops of wire, height 1, radius `r`. The mesh is scaled in y as the spring squeezes. */
class Helix extends Curve<Vector3> {
  constructor(
    private readonly turns: number,
    private readonly r: number,
  ) {
    super();
  }
  override getPoint(t: number, target = new Vector3()) {
    const a = t * this.turns * Math.PI * 2;
    return target.set(Math.cos(a) * this.r, -t, Math.sin(a) * this.r);
  }
}

/**
 * The plunger (spec §13–17): a kinematic cap the gummy rests on, a visible steel spring beneath it and a knob on a rod, all
 * inside a layered cardboard housing. `rt.plunger` (the charge) drives how far it is pulled back; a released plunger snaps
 * forward fast while the gummy controller fires the real impulse. While charging the cap trembles a hair (visual only).
 */
function Plunger() {
  const rt = useRuntime();
  const { arena } = rt;
  const lane = arena.lane;
  const rb = useRef<RapierRigidBody>(null);
  const moving = useRef<Group>(null);
  const spring = useRef<Group>(null);
  const neon = useMemo(() => neonColors(rt.palette), [rt.palette]);
  const capY = lane.restY - 0.1;
  const floorY = lane.restY - 1.12;
  const kit = useOwned(() => {
    const tok = rt.palette.tok;
    const cap = new RoundedBoxGeometry(0.96, 0.2, 0.9, 3, 0.07);
    const capMat = createTintedPaper(tint(tok.terracotta, tok.rust, 0.45), { lift: 0.06 });
    const coil = new TubeGeometry(new Helix(8, 0.27), 160, 0.042, 6, false);
    const steel = new MeshStandardMaterial({ color: col(tint(tok.kraft, tok.ivory, 0.6)), metalness: 0.9, roughness: 0.28, envMapIntensity: 1.2 });
    const rod = new CylinderGeometry(0.09, 0.09, 1.0, 12);
    const knob = new CylinderGeometry(0.34, 0.34, 0.46, 24);
    const knobRing = new CylinderGeometry(0.37, 0.37, 0.07, 24);
    const frameOuter = new RoundedBoxGeometry(lane.xOut - lane.xIn, 1.75, 0.3, 3, 0.07);
    tileUV(frameOuter, 1.2, 1.7);
    const frameMat = createTintedPaper(tint(tok.kraft, tok.ivory, 0.3));
    const back = new PlaneGeometry(lane.xOut - lane.xIn - 0.2, 1.6);
    const backMat = new MeshBasicMaterial({ color: col(tint(tok.navy, tok.paper, rt.palette.isDark ? 0.55 : 0.15)) });
    const guide = new RoundedBoxGeometry(0.08, 1.2, 0.5, 1, 0.03);
    const guideMat = new MeshBasicMaterial({ color: neon.cyan.clone().multiplyScalar(0.8), toneMapped: false });
    return { cap, capMat, coil, steel, rod, knob, knobRing, frameOuter, frameMat, back, backMat, guide, guideMat };
  });
  useBeforePhysicsStep(() => {
    const p = rt.plunger;
    rb.current?.setNextKinematicTranslation({ x: lane.x, y: capY - p.pull * lane.travel, z: 0 });
  });
  useFrame(() => {
    const p = rt.plunger;
    // a charge never survives a pause or the end of the run
    if (p.charging && !rt.store.getState().machine.running) p.cancel();
    const pull = p.pull;
    if (spring.current) spring.current.scale.y = Math.max(0.05, (lane.restY - 0.2 - pull * lane.travel - floorY) / (lane.restY - 0.2 - floorY));
    // the tension: a tiny tremble that grows with the charge (visual only; the collider never moves sideways)
    if (moving.current) moving.current.position.x = rt.reducedMotion || !p.charging ? 0 : Math.sin(rt.time * 70) * 0.012 * p.progress;
    kit.guideMat.color.copy(neon.cyan).multiplyScalar(0.55 + (p.charging ? p.progress * 0.9 : 0));
  });
  return (
    <group>
      {/* the housing: a dark well in the cabinet with a layered cardboard frame round the plunger's travel */}
      <mesh geometry={kit.back} material={kit.backMat} position={[lane.x, floorY - 0.2, BOARD_Z + 0.2]} />
      <mesh geometry={kit.frameOuter} material={kit.frameMat} position={[lane.x, floorY - 0.65, 0.42]} />
      <mesh geometry={kit.guide} material={kit.guideMat} position={[lane.xIn + 0.1, -4.6, 0.3]} />
      {/* spring: anchored at the well's floor, its top follows the cap */}
      <group ref={spring} position={[lane.x, lane.restY - 0.2, 0.0]}>
        <mesh geometry={kit.coil} material={kit.steel} scale={[1, 1.0, 1]} />
      </group>
      <RigidBody ref={rb} type="kinematicPosition" colliders={false} position={[lane.x, capY, 0]}>
        <CuboidCollider args={[0.5, 0.1, 0.6]} restitution={0.05} friction={0.5} />
        <group ref={moving}>
          <mesh geometry={kit.cap} material={kit.capMat} />
          <mesh geometry={kit.rod} material={kit.steel} position={[0, -0.7, 0]} />
          <mesh geometry={kit.knob} material={kit.steel} position={[0, -1.42, 0.15]} />
          <mesh geometry={kit.knobRing} material={kit.steel} position={[0, -1.17, 0.15]} />
        </group>
      </RigidBody>
    </group>
  );
}
