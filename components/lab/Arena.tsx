"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BallCollider, CuboidCollider, RigidBody, useBeforePhysicsStep, type CollisionEnterPayload, type RapierRigidBody } from "@react-three/rapier";
import { CanvasTexture, SRGBColorSpace, CylinderGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SphereGeometry, TorusGeometry } from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { BumperSpec, GuideSpec, PadSpec, PlatformSpec, TargetSpec } from "@/lib/lab/arena";
import { FLIPPER_THICK, flipperRotation, stepFlipper } from "@/lib/lab/flippers";
import { col, createLiquidMaterial, createPaperMaterial, tileUV, type PaperKey } from "./materials";
import { PHYSICS_DT } from "./physics-step";
import { useRuntime } from "./runtime";

/**
 * The arena (gummy-bear.md §15, §29, §33; pinball since TASK-172): soft resin walls, two flippers either side
 * of the drain with in-lane guides, tilted rails (static, sliding, vanishing), a spring pad, bumpers (one
 * spinning), four hidden-meta targets, the in-world gummy portal and the glowing jelly drain. All colliders are fixed or kinematic; all
 * per-frame motion reads the runtime's env knobs (difficulty) — no React state per frame.
 */
const isBear = (p: CollisionEnterPayload) => p.other.rigidBodyObject?.name === "gummy";
const DEPTH = 1.2;

export function Arena() {
  const rt = useRuntime();
  const { arena } = rt;
  const root = useRef<Group>(null);
  // The intro and results are product shots on a bare backdrop; the play field appears with the countdown.
  useFrame(() => {
    const st = rt.store.getState().state;
    const shown = st === "COUNTDOWN" || st === "PLAYING" || st === "DANGER" || st === "PAUSED" || st === "GAME_OVER" || st === "EXITING";
    if (root.current && root.current.visible !== shown) root.current.visible = shown;
  });
  return (
    <group ref={root} visible={false}>
      <Walls />
      <DangerFloor />
      {arena.guides.map((g) => (
        <Guide key={g.id} spec={g} />
      ))}
      <Flipper index={0} />
      <Flipper index={1} />
      {arena.platforms.map((p, i) => (
        <Platform key={p.id} spec={p} tint={i} />
      ))}
      {arena.pads.map((p) => (
        <Pad key={p.id} spec={p} />
      ))}
      {arena.bumpers.map((b) => (
        <Bumper key={b.id} spec={b} />
      ))}
      {arena.targets.map((t) => (
        <Target key={t.id} spec={t} />
      ))}
      <Portal />
    </group>
  );
}

function Walls() {
  const rt = useRuntime();
  const { arena } = rt;
  const h = arena.ceilingY - arena.floorY;
  const geo = useMemo(() => new RoundedBoxGeometry(0.22, h + 0.6, DEPTH + 0.2, 3, 0.08), [h]);
  const mat = useMemo(() => createPaperMaterial("rose", { opacity: 0.88 }), []);
  const topGeo = useMemo(() => new RoundedBoxGeometry(arena.halfW * 2 + 0.9, 0.3, DEPTH + 0.4, 3, 0.1), [arena.halfW]);
  const topMat = useMemo(() => createPaperMaterial("rose", { opacity: 0.88 }), []);
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
      topGeo.dispose();
      topMat.dispose();
    },
    [geo, mat, topGeo, topMat],
  );
  const cy = (arena.ceilingY + arena.floorY) / 2;
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.5, 20, 1.5]} position={[-arena.halfW - 0.5, 0, 0]} restitution={0.55} friction={0.1} />
        <CuboidCollider args={[0.5, 20, 1.5]} position={[arena.halfW + 0.5, 0, 0]} restitution={0.55} friction={0.1} />
        <CuboidCollider args={[arena.halfW + 1, 0.5, 1.5]} position={[0, arena.ceilingY + 0.5, 0]} restitution={0.5} friction={0.2} />
        {/* No floor at the bottom: the gap between the flippers is the drain. This only catches a gummy that fell through. */}
        <CuboidCollider args={[arena.halfW + 1, 0.5, 1.5]} position={[0, arena.floorY - 12, 0]} restitution={0.05} friction={0.9} />
      </RigidBody>
      <mesh geometry={geo} material={mat} position={[-arena.halfW - 0.15, cy, 0]} />
      <mesh geometry={geo} material={mat} position={[arena.halfW + 0.15, cy, 0]} />
      <mesh geometry={topGeo} material={topMat} position={[0, arena.ceilingY + 0.15, 0]} />
    </>
  );
}

function DangerFloor() {
  const rt = useRuntime();
  const { arena, palette } = rt;
  const { material, uniforms } = useMemo(() => createLiquidMaterial(palette), [palette]);
  const geo = useMemo(() => new PlaneGeometry(arena.halfW * 2 + 3, 2.6, 48, 1), [arena.halfW]);
  const mesh = useRef<Mesh>(null);
  useEffect(
    () => () => {
      material.dispose();
      geo.dispose();
    },
    [material, geo],
  );
  useFrame(() => {
    uniforms.uTime.value = rt.time;
    const danger = rt.bear.inDanger && rt.store.getState().machine.running ? 1 : 0;
    uniforms.uDanger.value += (danger - uniforms.uDanger.value) * 0.15;
    if (mesh.current) mesh.current.position.y = arena.dangerTop + rt.env.dangerRise - 1.3;
  });
  return <mesh ref={mesh} geometry={geo} material={material} position={[0, arena.dangerTop - 1.3, 0.45]} renderOrder={5} />;
}

/** Restrained cardstock for the platforms, cycled by index (TASK-168). */
const PAPERS: PaperKey[] = ["cream", "sage", "blue", "terracotta"];

function Platform({ spec, tint }: { spec: PlatformSpec; tint: number }) {
  const rt = useRuntime();
  const rb = useRef<RapierRigidBody>(null);
  const group = useRef<Group>(null);
  const geo = useMemo(() => {
    const g = new RoundedBoxGeometry(spec.w, spec.h, DEPTH, 3, Math.min(0.14, spec.h * 0.45));
    tileUV(g, spec.w, spec.h);
    return g;
  }, [spec.w, spec.h]);
  const mat = useMemo(() => createPaperMaterial(PAPERS[tint % PAPERS.length]!, { opacity: spec.vanishes ? 0.9 : 1 }), [tint, spec.vanishes]);
  const phase = useRef(spec.slide?.phase ?? 0);
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );
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
        <mesh geometry={geo} material={mat} />
      </group>
    </RigidBody>
  );
}

/** An in-lane rail: a fixed slope from the wall down to a flipper pivot. */
function Guide({ spec }: { spec: GuideSpec }) {
  const len = Math.hypot(spec.x2 - spec.x1, spec.y2 - spec.y1);
  const angle = Math.atan2(spec.y2 - spec.y1, spec.x2 - spec.x1);
  const geo = useMemo(() => {
    const g = new RoundedBoxGeometry(len, 0.3, DEPTH, 3, 0.12);
    tileUV(g, len, 0.3);
    return g;
  }, [len]);
  const mat = useMemo(() => createPaperMaterial("sage"), []);
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );
  return (
    <RigidBody type="fixed" colliders={false} position={[(spec.x1 + spec.x2) / 2, (spec.y1 + spec.y2) / 2, 0]} rotation={[0, 0, angle]}>
      <CuboidCollider args={[len / 2, 0.15, DEPTH / 2 + 0.2]} restitution={0.25} friction={0.1} />
      <mesh geometry={geo} material={mat} />
    </RigidBody>
  );
}

/**
 * A flipper (TASK-172): a kinematic paper card pivoting at its inner end. Its angle is stepped once per fixed physics
 * step from the runtime's `pressed` flag (set by the controller from touch / mouse / keyboard); hits are handled in
 * the gummy controller from the same state, so the swing and the impulse always agree.
 */
function Flipper({ index }: { index: 0 | 1 }) {
  const rt = useRuntime();
  const f = rt.flippers[index];
  const { layout } = f;
  const rb = useRef<RapierRigidBody>(null);
  const geo = useMemo(() => {
    const g = new RoundedBoxGeometry(layout.len + 0.3, FLIPPER_THICK, DEPTH, 3, 0.13);
    tileUV(g, layout.len, FLIPPER_THICK);
    g.translate(layout.len / 2, 0, 0);
    return g;
  }, [layout.len]);
  const hubGeo = useMemo(() => new CylinderGeometry(0.26, 0.26, DEPTH + 0.1, 20), []);
  const mat = useMemo(() => createPaperMaterial("terracotta"), []);
  const hubMat = useMemo(() => createPaperMaterial("cream"), []);
  useEffect(() => {
    f.body = rb;
    return () => {
      f.body = { current: null };
    };
  }, [f]);
  useEffect(
    () => () => {
      geo.dispose();
      hubGeo.dispose();
      mat.dispose();
      hubMat.dispose();
    },
    [geo, hubGeo, mat, hubMat],
  );
  useBeforePhysicsStep(() => {
    stepFlipper(f.state, f.pressed && rt.store.getState().machine.running, PHYSICS_DT);
    f.cooldown = Math.max(0, f.cooldown - PHYSICS_DT);
    f.body.current?.setNextKinematicRotation(flipperRotation(layout.side, f.state.angle));
  });
  const rest = flipperRotation(layout.side, f.state.angle);
  const theta = 2 * Math.atan2(rest.z, rest.w);
  return (
    <RigidBody ref={rb} type="kinematicPosition" colliders={false} position={[layout.pivot.x, layout.pivot.y, 0]} rotation={[0, 0, theta]} name={`flipper-${layout.side}`}>
      <CuboidCollider args={[layout.len / 2 + 0.15, FLIPPER_THICK / 2, DEPTH / 2 + 0.2]} position={[layout.len / 2, 0, 0]} restitution={0.3} friction={0.1} />
      <mesh geometry={geo} material={mat} />
      <mesh geometry={hubGeo} material={hubMat} rotation-x={Math.PI / 2} position={[0, 0, 0.05]} />
    </RigidBody>
  );
}

function Pad({ spec }: { spec: PadSpec }) {
  const rt = useRuntime();
  const rb = useRef<RapierRigidBody>(null);
  const top = useRef<Group>(null);
  const hit = useRef(0);
  const cooldown = useRef(0);
  const geoBase = useMemo(() => new CylinderGeometry(spec.w * 0.5, spec.w * 0.55, 0.12, 24), [spec.w]);
  const geoTop = useMemo(() => new CylinderGeometry(spec.w * 0.46, spec.w * 0.46, 0.1, 24), [spec.w]);
  const baseMat = useMemo(() => createPaperMaterial("cream"), []);
  const topMat = useMemo(() => createPaperMaterial(spec.kind === "launch" ? "blue" : "ochre"), [spec.kind]);
  useEffect(
    () => () => {
      geoBase.dispose();
      geoTop.dispose();
      baseMat.dispose();
      topMat.dispose();
    },
    [geoBase, geoTop, baseMat, topMat],
  );
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
      <mesh geometry={geoBase} material={baseMat} position={[0, 0.06, 0]} />
      <group ref={top} position={[0, 0.09, 0]}>
        <mesh geometry={geoTop} material={topMat} position={[0, 0.06, 0]} />
      </group>
    </RigidBody>
  );
}

function Bumper({ spec }: { spec: BumperSpec }) {
  const rt = useRuntime();
  const rb = useRef<RapierRigidBody>(null);
  const group = useRef<Group>(null);
  const hit = useRef(0);
  const cooldown = useRef(0);
  const angle = useRef(0);
  const appear = useRef(spec.minPhase === 0 ? 1 : 0);
  const geo = useMemo(() => new SphereGeometry(spec.r, 24, 16), [spec.r]);
  const barGeo = useMemo(() => (spec.spin ? new RoundedBoxGeometry(spec.spin.len, 0.22, 0.5, 3, 0.1) : null), [spec.spin]);
  const mat = useMemo(() => createPaperMaterial(spec.spin ? "rose" : "sage"), [spec.spin]);
  useEffect(
    () => () => {
      geo.dispose();
      barGeo?.dispose();
      mat.dispose();
    },
    [geo, barGeo, mat],
  );
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    cooldown.current = Math.max(0, cooldown.current - dt);
    hit.current = Math.max(0, hit.current - dt * 3);
    const active = rt.env.phase >= spec.minPhase;
    appear.current += ((active ? 1 : 0) - appear.current) * 0.12;
    if (group.current) {
      group.current.scale.setScalar(appear.current * (1 + 0.18 * Math.sin(hit.current * Math.PI)));
      group.current.visible = appear.current > 0.03;
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
    const len = Math.hypot(dx, dy) || 1;
    const speed = Math.max(7.5, Math.hypot(b.vx, b.vy) * 0.8 + 3) * rt.bounceMul;
    body.setLinvel({ x: (dx / len) * speed, y: (dy / len) * speed, z: 0 }, true);
    b.sinceBounce = 0;
    rt.jelly.impact(-dx / len, -dy / len, 14);
    rt.hooks.bumper(spec.id, spec.x, spec.y);
  };
  return (
    <RigidBody ref={rb} type={spec.spin ? "kinematicPosition" : "fixed"} colliders={false} position={[spec.x, spec.y, 0]} onCollisionEnter={onEnter}>
      {spec.spin ? (
        <CuboidCollider args={[spec.spin.len / 2, 0.11, 0.5]} restitution={0.9} />
      ) : (
        <BallCollider args={[spec.r]} restitution={1} />
      )}
      <group ref={group}>
        <mesh geometry={geo} material={mat} />
        {barGeo ? <mesh geometry={barGeo} material={mat} /> : null}
      </group>
    </RigidBody>
  );
}

function labelTexture(text: string, ink: [number, number, number], fontFamily: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = `color(srgb ${ink[0]} ${ink[1]} ${ink[2]})`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const size = text.length > 4 ? 26 : 38;
  g.font = `700 ${size}px ${fontFamily}`;
  g.fillText(text, 64, 66);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function Target({ spec }: { spec: TargetSpec }) {
  const rt = useRuntime();
  const { palette } = rt;
  const group = useRef<Group>(null);
  const hit = useRef(0);
  const cooldown = useRef(0);
  const done = useRef(false);
  const geo = useMemo(() => new CylinderGeometry(spec.r, spec.r, 0.5, 28), [spec.r]);
  const mat = useMemo(() => {
    const m = createPaperMaterial("blue");
    m.emissive = col(palette.cream); // the hit flash below lifts the card toward cream, never a glow colour
    return m;
  }, [palette]);
  const labelGeo = useMemo(() => new PlaneGeometry(spec.r * 1.5, spec.r * 1.5), [spec.r]);
  const labelMat = useMemo(() => {
    const font = getComputedStyle(document.documentElement).getPropertyValue("--font-body") || "sans-serif";
    return new MeshBasicMaterial({ map: labelTexture(spec.id, palette.face, font), transparent: true });
  }, [spec.id, palette]);
  const ring = useMemo(() => new TorusGeometry(spec.r * 1.08, 0.04, 8, 32), [spec.r]);
  const ringMat = useMemo(() => createPaperMaterial("rose"), []);
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
      labelGeo.dispose();
      labelMat.map?.dispose();
      labelMat.dispose();
      ring.dispose();
      ringMat.dispose();
    },
    [geo, mat, labelGeo, labelMat, ring, ringMat],
  );
  const runId = rt.store((s) => s.runId);
  useEffect(() => {
    done.current = false;
  }, [runId]);
  useFrame((_, dt) => {
    cooldown.current = Math.max(0, cooldown.current - dt);
    hit.current = Math.max(0, hit.current - dt * 2.5);
    if (group.current) group.current.scale.setScalar(1 + 0.14 * Math.sin(hit.current * Math.PI));
    mat.emissiveIntensity = 0.05 + (done.current ? 0.35 : 0) + hit.current * 0.4;
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
  return (
    <RigidBody type="fixed" colliders={false} position={[spec.x, spec.y, 0]} onCollisionEnter={onEnter}>
      <BallCollider args={[spec.r]} restitution={0.9} />
      <group ref={group}>
        <mesh geometry={geo} material={mat} rotation-x={Math.PI / 2} />
        <mesh geometry={ring} material={ringMat} position={[0, 0, 0.26]} />
        <mesh geometry={labelGeo} material={labelMat} position={[0, 0, 0.27]} />
      </group>
    </RigidBody>
  );
}

function Portal() {
  const rt = useRuntime();
  const { arena } = rt;
  const g1 = useRef<Mesh>(null);
  const g2 = useRef<Mesh>(null);
  const torus = useMemo(() => new TorusGeometry(arena.portal.r, 0.07, 10, 40), [arena.portal.r]);
  const torus2 = useMemo(() => new TorusGeometry(arena.portal.r * 0.66, 0.05, 10, 32), [arena.portal.r]);
  const disc = useMemo(() => new CylinderGeometry(arena.portal.r * 0.62, arena.portal.r * 0.62, 0.05, 28), [arena.portal.r]);
  const mat = useMemo(() => createPaperMaterial("rose"), []);
  const mat2 = useMemo(() => createPaperMaterial("blue"), []);
  const discMat = useMemo(() => createPaperMaterial("cream", { opacity: 0.6 }), []);
  useEffect(
    () => () => {
      torus.dispose();
      torus2.dispose();
      disc.dispose();
      mat.dispose();
      mat2.dispose();
      discMat.dispose();
    },
    [torus, torus2, disc, mat, mat2, discMat],
  );
  useFrame((_, dt) => {
    if (g1.current) g1.current.rotation.z += dt * 1.4;
    if (g2.current) g2.current.rotation.z -= dt * 2.1;
  });
  return (
    <RigidBody type="fixed" colliders={false} position={[arena.portal.x, arena.portal.y, 0]}>
      <BallCollider
        args={[arena.portal.r * 0.7]}
        sensor
        onIntersectionEnter={(p) => {
          if (p.other.rigidBodyObject?.name === "gummy") rt.hooks.portal();
        }}
      />
      <mesh ref={g1} geometry={torus} material={mat} />
      <mesh ref={g2} geometry={torus2} material={mat2} />
      <mesh geometry={disc} material={discMat} rotation-x={Math.PI / 2} />
    </RigidBody>
  );
}
