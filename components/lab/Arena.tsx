"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { BallCollider, ConvexHullCollider, CuboidCollider, RigidBody, useBeforePhysicsStep, type CollisionEnterPayload, type RapierRigidBody } from "@react-three/rapier";
import {
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Shape,
  TorusGeometry,
  TubeGeometry,
  Curve,
  Vector3,
  type Material,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { BumperSpec, GuideSpec, PadSpec, PlatformSpec, RailSpec, SlingSpec, TargetSpec } from "@/lib/lab/arena";
import { FLIPPER_THICK, FLIP_REST, FLIP_UP, flipperRotation, stepFlipper } from "@/lib/lab/flippers";
import { mix, type RGB } from "@/lib/lab/tokens";
import { BlackHole } from "./BlackHole";
import { BOARD_Z, Machine } from "./Machine";
import { col, createTintedPaper, tileUV } from "./materials";
import { cssColor, flipperShape, glowMaterial, glowTexture, neonColors, roundedRect, sheet, siteFont, starShape, textTexture } from "./paper-kit";
import { PHYSICS_DT } from "./physics-step";
import { useRuntime } from "./runtime";

/**
 * The arena (gummy-bear.md §15, §29, §33; pinball since TASK-172; a paper-cut machine since TASK-185): every collider and
 * every moving part. Colliders are fixed or kinematic and unchanged in kind from the old arena; what changed is the body
 * around them: layered cardstock, lit edges, bumpers that compress and flash, mounted targets that sit back when hit,
 * slingshots, a real plunger and the lane it fires into. The static scenery (table, cabinet, lights, drain) is Machine.tsx.
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
      for (const v of Object.values(kit)) {
        if (Array.isArray(v)) v.forEach((x) => (x as { dispose?: () => void })?.dispose?.());
        else (v as { dispose?: () => void } | null)?.dispose?.();
      }
    },
    [kit],
  );
  return kit;
}

export function Arena() {
  const rt = useRuntime();
  const { arena } = rt;
  const root = useRef<Group>(null);
  // The intro and results are product shots on a bare backdrop; the machine appears with the countdown.
  useFrame(() => {
    const st = rt.store.getState().state;
    const shown = st === "COUNTDOWN" || st === "PLAYING" || st === "DANGER" || st === "PAUSED" || st === "GAME_OVER" || st === "EXITING";
    if (root.current && root.current.visible !== shown) root.current.visible = shown;
  });
  return (
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
      {arena.bumpers.map((b, i) => (
        <Bumper key={b.id} spec={b} index={i} />
      ))}
      {arena.targets.map((t, i) => (
        <Target key={t.id} spec={t} index={i} />
      ))}
      <Plunger />
      <BlackHole />
    </group>
  );
}

/* ---- colliders for the cabinet: walls, divider, outer lane wall, ceiling, a floor under the plunger ------------------------- */

function Walls() {
  const rt = useRuntime();
  const { arena } = rt;
  const lane = arena.lane;
  const hw = arena.halfW;
  const divH = (lane.dividerTop + 8) / 2;
  const ceilW = (lane.xOut + hw) / 2 + 1;
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[0.5, 20, 1.5]} position={[-hw - 0.5, 0, 0]} restitution={0.55} friction={0.1} />
      {/* the divider between the table and the lane */}
      <CuboidCollider args={[(lane.xIn - hw) / 2, divH, 1.5]} position={[(lane.xIn + hw) / 2, lane.dividerTop - divH, 0]} restitution={0.3} friction={0.05} />
      <CuboidCollider args={[0.5, 20, 1.5]} position={[lane.xOut + 0.5, 0, 0]} restitution={0.4} friction={0.05} />
      <CuboidCollider args={[ceilW, 0.5, 1.5]} position={[(lane.xOut - hw) / 2, arena.ceilingY + 0.5, 0]} restitution={0.5} friction={0.2} />
      {/* No floor under the table: the gap between the flippers is the drain. This only catches a gummy that fell through. */}
      <CuboidCollider args={[hw + 3, 0.5, 1.5]} position={[0, arena.floorY - 12, 0]} restitution={0.05} friction={0.9} />
      {/* The lane has a solid floor well below the plunger's lowest point. */}
      <CuboidCollider args={[(lane.xOut - lane.xIn) / 2, 0.3, 1.5]} position={[lane.x, lane.restY - lane.travel - 0.55, 0]} restitution={0.05} friction={0.4} />
    </RigidBody>
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
    const inlayMat = createTintedPaper(tint(tok.ivory, tok.kraft, 0.25), { lift: 0.06 });
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
    const lit = 0.42 + 0.58 * raised;
    kit.edgeMat.color.copy(neon.amber).multiplyScalar(lit);
    kit.glowMat.opacity = 0.06 + 0.16 * raised;
  });
  const rest = flipperRotation(layout.side, f.state.angle);
  const theta = 2 * Math.atan2(rest.z, rest.w);
  return (
    <RigidBody ref={rb} type="kinematicPosition" colliders={false} position={[layout.pivot.x, layout.pivot.y, 0]} rotation={[0, 0, theta]} name={`flipper-${layout.side}`}>
      <CuboidCollider args={[layout.len / 2 + 0.15, FLIPPER_THICK / 2, DEPTH / 2 + 0.2]} position={[layout.len / 2, 0, 0]} restitution={0.3} friction={0.1} />
      <group ref={visual}>
        <mesh geometry={kit.glow} material={kit.glowMat} position={[layout.len / 2, 0, -0.35]} renderOrder={2} />
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

const BUMPER_TINTS = ["rust", "steel", "sage", "note"] as const;

/**
 * A pinball bumper (spec §11, §18): a paper skirt, a coloured ring, a raised button with a star, and a recessed lit ring.
 * On a hit the button presses in and the ring flashes, then both ease back over about 300 ms. At rest the ring only glows softly.
 */
function Bumper({ spec, index }: { spec: BumperSpec; index: number }) {
  const rt = useRuntime();
  const rb = useRef<RapierRigidBody>(null);
  const group = useRef<Group>(null);
  const button = useRef<Group>(null);
  const hit = useRef(0);
  const cooldown = useRef(0);
  const angle = useRef(0);
  const appear = useRef(spec.minPhase === 0 ? 1 : 0);
  const neon = useMemo(() => neonColors(rt.palette), [rt.palette]);
  const lightCol = [neon.amber, neon.cyan, neon.magenta, neon.amber][index % 4]!;
  const kit = useOwned(() => {
    const tok = rt.palette.tok;
    const R = spec.r;
    const base = tok[BUMPER_TINTS[index % BUMPER_TINTS.length]!];
    const rotX = (g: { rotateX(a: number): unknown }) => g.rotateX(Math.PI / 2);
    const skirt = new CylinderGeometry(R * 1.2, R * 1.26, 0.2, 36);
    rotX(skirt);
    const ring = new CylinderGeometry(R * 1.0, R * 1.04, 0.32, 36);
    rotX(ring);
    const btn = new CylinderGeometry(R * 0.66, R * 0.72, 0.3, 32);
    rotX(btn);
    const star = sheet(starShape(R * 0.42, 0.46), 0.04, 0.01);
    const lit = new TorusGeometry(R * 1.1, 0.034, 8, 48);
    const barGeo = spec.spin ? new RoundedBoxGeometry(spec.spin.len, 0.22, 0.5, 3, 0.1) : null;
    const skirtMat = createTintedPaper(tint(tok.ivory, tok.kraft, 0.3), { lift: 0.05 });
    const ringMat = createTintedPaper(tint(base, tok.ivory, 0.18), { lift: 0.05 });
    const btnMat = createTintedPaper(tint(base, tok.ivory, 0.34), { lift: 0.07 });
    const starMat = createTintedPaper(tint(tok.ivory, tok.note, 0.3), { lift: 0.1 });
    const litMat = new MeshBasicMaterial({ color: lightCol.clone(), toneMapped: false });
    const tex = glowTexture(128, 2);
    const halo = new PlaneGeometry(R * 4.4, R * 4.4);
    const haloMat = glowMaterial(lightCol, tex, 0.16);
    return { skirt, ring, btn, star, lit, barGeo, skirtMat, ringMat, btnMat, starMat, litMat, tex, halo, haloMat };
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
      group.current.scale.setScalar(appear.current * (1 + 0.05 * press));
      group.current.visible = appear.current > 0.03;
    }
    if (button.current) button.current.position.z = 0.18 - 0.12 * press;
    // ambient glow at rest, a bright pulse on a hit, then a smooth decay
    kit.litMat.color.copy(lightCol).multiplyScalar(0.5 + 1.1 * h * h);
    kit.haloMat.opacity = 0.12 + 0.5 * h;
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
    const len = Math.hypot(dx, dy) || 1;
    const speed = Math.max(7.5, Math.hypot(b.vx, b.vy) * 0.8 + 3) * rt.bounceMul;
    body.setLinvel({ x: (dx / len) * speed, y: (dy / len) * speed, z: 0 }, true);
    b.sinceBounce = 0;
    rt.jelly.impact(-dx / len, -dy / len, 14);
    rt.hooks.bumper(spec.id, spec.x, spec.y);
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
            <mesh geometry={kit.halo} material={kit.haloMat} position={[0, 0, -0.3]} renderOrder={2} />
            <mesh geometry={kit.skirt} material={kit.skirtMat} position={[0, 0, -0.34]} />
            <mesh geometry={kit.ring} material={kit.ringMat} position={[0, 0, -0.1]} />
            <mesh geometry={kit.lit} material={kit.litMat} position={[0, 0, 0.1]} />
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

/* ---- targets ------------------------------------------------------------------------------------------------------------------- */

const TARGET_TINT: Record<string, (typeof BUMPER_TINTS)[number] | "terracotta" | "forest"> = { AI: "steel", DESIGN: "sage", PRODUCT: "rust", BUILD: "terracotta" };

/**
 * A mounted pinball target (spec §19): a raised, slightly angled plate on two posts with its name in Fraunces and a lit edge
 * beneath it. A hit pushes the plate back, flashes its light, and the score pops (the hook); it springs forward again.
 */
function Target({ spec, index }: { spec: TargetSpec; index: number }) {
  const rt = useRuntime();
  const { palette } = rt;
  const plate = useRef<Group>(null);
  const hit = useRef(0);
  const cooldown = useRef(0);
  const done = useRef(false);
  const neon = useMemo(() => neonColors(palette), [palette]);
  const W = spec.hw * 2;
  const H = spec.hh * 2;
  const kit = useOwned(() => {
    const tok = palette.tok;
    const base = tok[TARGET_TINT[spec.id] ?? "steel"];
    const g = new RoundedBoxGeometry(W, H, 0.32, 3, 0.07);
    tileUV(g, W, H);
    const rimG = new RoundedBoxGeometry(W + 0.14, H + 0.14, 0.2, 3, 0.09);
    const bodyMat = createTintedPaper(tint(base, tok.ivory, 0.12), { lift: 0.06 });
    const rimMat = createTintedPaper(tint(tok.ivory, tok.kraft, 0.4), { lift: 0.04 });
    const post = new CylinderGeometry(0.07, 0.09, 0.7, 10);
    post.rotateX(Math.PI / 2);
    const postMat = new MeshStandardMaterial({ color: col(tint(tok.kraft, tok.ivory, 0.5)), metalness: 0.7, roughness: 0.35 });
    const label = textTexture(320, 160, (g2, w, h) => {
      g2.textAlign = "center";
      g2.textBaseline = "middle";
      g2.fillStyle = cssColor(tok.ivory);
      const size = spec.id.length > 5 ? 54 : spec.id.length > 3 ? 62 : 80;
      g2.font = `700 ${size}px ${siteFont("display")}`;
      g2.fillText(spec.id, w / 2, h * 0.54);
    });
    const labelGeo = new PlaneGeometry(W * 0.92, H * 0.92);
    const labelMat = new MeshBasicMaterial({ map: label.tex, transparent: true, toneMapped: false });
    const strip = new RoundedBoxGeometry(W * 0.84, 0.05, 0.05, 1, 0.02);
    const stripMat = new MeshBasicMaterial({ color: neon.cyan.clone(), toneMapped: false });
    const tex = glowTexture(128, 2);
    const halo = new PlaneGeometry(W * 1.9, H * 3);
    const haloMat = glowMaterial(neon.cyan, tex, 0.1);
    return { g, rimG, bodyMat, rimMat, post, postMat, label, labelGeo, labelMat, strip, stripMat, tex, halo, haloMat };
  });
  const runId = rt.store((s) => s.runId);
  useEffect(() => {
    done.current = false;
  }, [runId]);
  useFrame((_, dt) => {
    cooldown.current = Math.max(0, cooldown.current - dt);
    hit.current = Math.max(0, hit.current - dt * 2.6);
    const rm = rt.reducedMotion;
    const h = rm ? (hit.current > 0.35 ? 1 : 0) : hit.current;
    // back ~0.22 u and spring home (a little overshoot on the way back); a reduced-motion plate stays put and only its light changes
    const back = !rm && h > 0 ? Math.sin(Math.min(1, h) * Math.PI) * 0.22 * (h > 0.5 ? 1 : 0.8) : 0;
    if (plate.current) plate.current.position.z = 0.1 - back;
    const idle = done.current ? 0.8 : 0.45;
    kit.stripMat.color.copy(neon.cyan).multiplyScalar(idle + 1.3 * h);
    kit.haloMat.opacity = 0.06 + (done.current ? 0.06 : 0) + 0.4 * h;
  });
  const onEnter = (p: CollisionEnterPayload) => {
    if (!isBear(p) || cooldown.current > 0) return;
    const body = rt.bearBody.current;
    if (!body) return;
    cooldown.current = 0.5;
    hit.current = 1;
    done.current = true;
    const b = rt.bear;
    const dx = b.x - spec.x;
    const dy = b.y + 0.5 - spec.y;
    const len = Math.hypot(dx, dy) || 1;
    const speed = Math.max(6, Math.hypot(b.vx, b.vy) * 0.7 + 2.5);
    body.setLinvel({ x: (dx / len) * speed, y: (dy / len) * speed + 1, z: 0 }, true);
    b.sinceBounce = 0;
    rt.jelly.impact(-dx / len, -dy / len, 12);
    rt.hooks.target(spec.id, spec.x, spec.y);
  };
  void index;
  return (
    <RigidBody type="fixed" colliders={false} position={[spec.x, spec.y, 0]} rotation={[0, 0, spec.angle]} onCollisionEnter={onEnter}>
      <CuboidCollider args={[spec.hw, spec.hh, 0.6]} restitution={0.8} />
      <mesh geometry={kit.halo} material={kit.haloMat} position={[0, 0, -0.45]} renderOrder={2} />
      <mesh geometry={kit.post} material={kit.postMat} position={[-spec.hw * 0.6, -spec.hh * 0.4, -0.3]} />
      <mesh geometry={kit.post} material={kit.postMat} position={[spec.hw * 0.6, -spec.hh * 0.4, -0.3]} />
      <group ref={plate} position={[0, 0, 0.1]}>
        <mesh geometry={kit.rimG} material={kit.rimMat} position={[0, 0, -0.1]} />
        <mesh geometry={kit.g} material={kit.bodyMat} />
        <mesh geometry={kit.labelGeo} material={kit.labelMat} position={[0, 0, 0.17]} />
        <mesh geometry={kit.strip} material={kit.stripMat} position={[0, -spec.hh - 0.06, 0.05]} />
      </group>
    </RigidBody>
  );
}

/* ---- slingshots ---------------------------------------------------------------------------------------------------------------- */

/**
 * A slingshot (spec §20): a paper triangle on the in-lane guide. A gummy that hits the kicking face is pushed away along its
 * normal; the face's lit strip flashes and the trim presses in for a beat, then releases.
 */
function Sling({ spec }: { spec: SlingSpec }) {
  const rt = useRuntime();
  const trim = useRef<Group>(null);
  const hit = useRef(0);
  const cooldown = useRef(0);
  const neon = useMemo(() => neonColors(rt.palette), [rt.palette]);
  const [a, b, apex] = spec.pts;
  const kit = useOwned(() => {
    const tok = rt.palette.tok;
    const local = (p: { x: number; y: number }) => [p.x - spec.mid.x, p.y - spec.mid.y] as const;
    const s = new Shape();
    const [ax, ay] = local(a);
    const [bx, by] = local(b);
    const [cx, cy] = local(apex);
    s.moveTo(ax, ay);
    s.lineTo(bx, by);
    s.lineTo(cx, cy);
    s.closePath();
    const depth = 0.75;
    const body = sheet(s, depth, 0.04);
    body.translate(0, 0, -depth / 2);
    const faceLen = Math.hypot(apex.x - b.x, apex.y - b.y);
    const bar = new RoundedBoxGeometry(faceLen, 0.1, 0.34, 2, 0.04);
    const strip = new RoundedBoxGeometry(faceLen * 0.82, 0.05, 0.05, 1, 0.02);
    const button = new CylinderGeometry(0.1, 0.1, 0.12, 14);
    button.rotateX(Math.PI / 2);
    const bodyMat = createTintedPaper(tint(tok.rust, tok.ivory, 0.2), { lift: 0.08 });
    const barMat = createTintedPaper(tint(tok.ivory, tok.kraft, 0.25), { lift: 0.06 });
    const stripMat = new MeshBasicMaterial({ color: neon.amber.clone(), toneMapped: false });
    const buttonMat = new MeshBasicMaterial({ color: neon.amber.clone(), toneMapped: false });
    // hull for the collider: the prism, in world coordinates
    const hull = new Float32Array(
      [a, b, apex].flatMap((p) => [
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
    const side = (bear.x - spec.mid.x) * spec.normal.x + (bear.y + 0.5 - spec.mid.y) * spec.normal.y;
    if (side <= 0.05) return;
    cooldown.current = 0.22;
    hit.current = 1;
    const speed = Math.max(9, Math.hypot(bear.vx, bear.vy) * 0.6 + 5) * rt.bounceMul;
    body.setLinvel({ x: spec.normal.x * speed, y: spec.normal.y * speed + 1, z: 0 }, true);
    bear.sinceBounce = 0;
    rt.jelly.impact(-spec.normal.x, -spec.normal.y, 12);
    rt.hooks.sling(spec.id, spec.mid.x, spec.mid.y);
  };
  // the face runs apex → b; angle of that edge
  const faceAng = Math.atan2(b.y - apex.y, b.x - apex.x);
  return (
    <RigidBody type="fixed" colliders={false} onCollisionEnter={onEnter}>
      <ConvexHullCollider args={[kit.hull]} restitution={0.5} friction={0.05} />
      <group position={[spec.mid.x, spec.mid.y, 0]}>
        <mesh geometry={kit.body} material={kit.bodyMat} />
        <group ref={trim}>
          <group rotation={[0, 0, faceAng]} position={[spec.normal.x * 0.02, spec.normal.y * 0.02, 0.38]}>
            <mesh geometry={kit.bar} material={kit.barMat} />
            <mesh geometry={kit.strip} material={kit.stripMat} position={[0, 0.06, 0.2]} />
          </group>
        </group>
        <mesh geometry={kit.button} material={kit.buttonMat} position={[(apex.x + b.x) / 2 - spec.mid.x - spec.normal.x * 0.0, (apex.y + b.y) / 2 - spec.mid.y, 0.42]} />
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

export type { Material };
void Color;
void Mesh;
void roundedRect;
