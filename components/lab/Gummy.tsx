"use client";

import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { ConvexHullCollider, CuboidCollider, RigidBody, useBeforePhysicsStep, useRapier, type RapierRigidBody } from "@react-three/rapier";
import {
  CanvasTexture,
  SRGBColorSpace,
  CircleGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  type Material,
  type Object3D,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { physicsState } from "@/lib/lab/gummy-state";
import { pickFace } from "@/lib/lab/expressions";
import { FACE_OPEN_CAP, MORPH_NAMES, emptyWeights, type MorphName } from "@/lib/lab/jelly";
import { createFaceMaterial, createGummyMaterial } from "./materials";
import { GummyController } from "./gummy-controller";
import { PHYSICS_DT } from "./physics-step";
import { useRuntime } from "./runtime";

import { GUMMY_URL } from "./gummy-url";
export { GUMMY_URL };

interface Prepared {
  root: Object3D;
  morphMeshes: { mesh: Mesh; index: Partial<Record<MorphName, number>> }[];
  hull: Float32Array | null;
}

/** Clone the loaded scene, hide the collider proxy, and index every mesh's morph targets by name. */
function prepare(scene: Object3D): Prepared {
  scene.updateMatrixWorld(true);
  const root = scene.clone(true);
  let hull: Float32Array | null = null;
  const morphMeshes: Prepared["morphMeshes"] = [];
  scene.traverse((o) => {
    if (o.name === "GummyCollider" && (o as Mesh).isMesh) {
      const g = (o as Mesh).geometry.clone().applyMatrix4(o.matrixWorld);
      hull = new Float32Array(g.getAttribute("position").array);
      g.dispose();
    }
  });
  root.traverse((o) => {
    if (o.name === "GummyCollider") o.visible = false;
    const mesh = o as Mesh;
    if (mesh.isMesh && mesh.morphTargetDictionary && mesh.morphTargetInfluences && o.name !== "GummyCollider") {
      const index: Partial<Record<MorphName, number>> = {};
      for (const n of MORPH_NAMES) {
        const at = mesh.morphTargetDictionary[n];
        if (at !== undefined) index[n] = at;
      }
      morphMeshes.push({ mesh, index });
    }
  });
  return { root, morphMeshes, hull };
}

/** A procedural stand-in so the game still plays when the GLB fails to load (§49: fallback works). */
function buildFallback(bodyMat: Material, faceMat: Material): Prepared {
  const root = new Group();
  const part = (r: number, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, m = bodyMat) => {
    const mesh = new Mesh(new SphereGeometry(r, 24, 16), m);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    root.add(mesh);
  };
  part(0.34, 0, 0.36, 0, 1, 1.05, 0.85); // body
  part(0.26, 0, 0.78, 0.02); // head
  part(0.09, -0.2, 0.98, 0); // ears
  part(0.09, 0.2, 0.98, 0);
  part(0.1, -0.38, 0.4, 0, 1, 1.5, 1); // arms
  part(0.1, 0.38, 0.4, 0, 1, 1.5, 1);
  part(0.12, -0.15, 0.1, 0.02); // feet
  part(0.12, 0.15, 0.1, 0.02);
  part(0.035, -0.09, 0.82, 0.25, 1, 1.3, 0.6, faceMat); // eyes
  part(0.035, 0.09, 0.82, 0.25, 1, 1.3, 0.6, faceMat);
  part(0.04, 0, 0.73, 0.27, 1.2, 0.8, 0.6, faceMat); // nose
  return { root, morphMeshes: [], hull: null };
}

function blobTexture(color: [number, number, number]) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 2, 32, 32, 32);
  grad.addColorStop(0, `color(srgb ${color[0]} ${color[1]} ${color[2]} / 0.55)`);
  grad.addColorStop(1, `color(srgb ${color[0]} ${color[1]} ${color[2]} / 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

class GummyBoundary extends Component<{ onFail: () => void; fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function Gummy() {
  const rt = useRuntime();
  return (
    <GummyBoundary onFail={() => rt.onAsset("failed")} fallback={<GummyBody model="fallback" />}>
      <Suspense fallback={<GummyBody model="fallback" />}>
        <GummyFromAsset />
      </Suspense>
    </GummyBoundary>
  );
}

function GummyFromAsset() {
  const rt = useRuntime();
  const gltf = useLoader(GLTFLoader, GUMMY_URL);
  const model = useMemo(() => prepare(gltf.scene), [gltf]);
  useEffect(() => rt.onAsset("ready"), [rt]);
  return <GummyBody model={model} />;
}

const EASE = (k: number, dt: number) => 1 - Math.exp(-k * dt);
const FACE_MORPHS = new Set<MorphName>(["Happy", "Surprised", "Worried", "Panic", "Blink"]);

function GummyBody({ model }: { model: Prepared | "fallback" }) {
  const rt = useRuntime();
  const { gl, camera } = useThree();
  const { world, rapier } = useRapier();
  const body = useRef<RapierRigidBody>(null);
  const visual = useRef<Group>(null);
  const shadow = useRef<Mesh>(null);

  const { material, uniforms } = useMemo(() => createGummyMaterial(rt.palette, rt.tier), [rt]);
  useEffect(() => {
    rt.gummyMaterial.current = material;
    return () => {
      rt.gummyMaterial.current = null;
    };
  }, [rt, material]);
  const faceMat = useMemo(() => createFaceMaterial(rt.palette), [rt]);
  const prepared = useMemo<Prepared>(() => {
    if (model !== "fallback") {
      model.root.traverse((o) => {
        const m = o as Mesh;
        if (!m.isMesh) return;
        const mat = Array.isArray(m.material) ? m.material[0] : m.material;
        m.material = mat?.name === "GummyFace" ? faceMat : material;
        m.frustumCulled = false;
      });
      return model;
    }
    return buildFallback(material, faceMat);
  }, [model, material, faceMat]);
  const shadowMat = useMemo(() => {
    const m = new MeshBasicMaterial({ map: blobTexture(rt.palette.face), transparent: true, depthWrite: false });
    return m;
  }, [rt]);
  const shadowGeo = useMemo(() => new CircleGeometry(0.55, 24), []);

  useEffect(
    () => () => {
      material.dispose();
      faceMat.dispose();
      shadowMat.map?.dispose();
      shadowMat.dispose();
      shadowGeo.dispose();
    },
    [material, faceMat, shadowMat, shadowGeo],
  );

  const ctrlRef = useRef<GummyController | null>(null);
  const live = useRef({ since: 0, blinkAt: 2.5, blink: 0, face: { Happy: 0.7, Surprised: 0, Worried: 0, Panic: 0 }, weights: emptyWeights(), prevVy: 0, prevVx: 0, park: { x: 0, y: 0, s: 2 }, wasLive: false, hopT: 0, meltedAt: -1, drive: false });
  const rayRef = useRef<InstanceType<typeof rapier.Ray> | null>(null);
  const shadowRay = useRef<InstanceType<typeof rapier.Ray> | null>(null);

  useEffect(() => {
    rayRef.current = new rapier.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
    shadowRay.current = new rapier.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
  }, [rapier]);

  // The controller's forces run in lock-step with the physics (one call per fixed step), so gameplay
  // feels the same at 60 fps and at 3 fps. `drive` is set by the frame loop while the bear is live.
  useBeforePhysicsStep(() => {
    const rb = body.current;
    if (rb && live.current.drive) ctrlRef.current?.update(PHYSICS_DT, rb);
  });

  useEffect(() => {
    const state = () => rt.store.getState().machine;
    const ctrl = new GummyController(
      rt,
      gl.domElement,
      () => camera,
      () => state().running,
      () => state().state === "INTRO" || state().state === "DISCOVERED",
    );
    ctrl.attach();
    ctrlRef.current = ctrl;
    rt.bearBody = body;
    return () => {
      ctrl.detach();
      ctrlRef.current = null;
    };
  }, [rt, gl, camera]);

  // Spawn / park positions.
  const spawn = rt.arena.spawn;
  const intro = rt.arena.introPos;

  useFrame((_, rawDt) => {
    const rb = body.current;
    const vis = visual.current;
    if (!rb || !vis) return;
    const dt = Math.min(rawDt, 1 / 30);
    const L = live.current;
    const machine = rt.store.getState().machine;
    const gs = machine.state;
    const b = rt.bear;
    rt.time += dt;
    const collider = rb.collider(0);

    const t = rb.translation();
    const lv = rb.linvel();
    b.x = t.x;
    b.y = t.y;
    b.vx = lv.x;
    b.vy = lv.y;

    // ---- parked states: the bear is placed, not simulated -------------------------------------
    const parkedKind = gs === "COUNTDOWN" ? "spawn" : gs === "RESULTS" ? "results" : gs === "EXITING" ? "exit" : machine.live ? null : "intro";
    if (parkedKind) {
      let tx = intro.x;
      let ty = intro.y;
      let ts = 1.9;
      if (parkedKind === "spawn") {
        tx = spawn.x;
        ty = spawn.y + Math.sin(rt.time * 3) * 0.06;
        ts = 1;
      } else if (parkedKind === "results") {
        ts = rt.resultsScale;
      } else if (parkedKind === "exit") {
        tx = b.x;
        ty = b.y;
        ts = 1;
      }
      if (parkedKind === "exit") {
        if (L.wasLive) {
          L.park.x = b.x;
          L.park.y = b.y;
          L.park.s = 1;
        }
        const ex = rt.exit;
        const k = ex ? Math.min(1, ex.t / 0.9) : 0;
        if (ex) ex.t += dt;
        const tgt = ex?.via === "portal" ? { x: rt.arena.portal.x, y: rt.arena.portal.y - 0.4 } : { x: 0, y: rt.arena.ceilingY - 1 };
        const ang = k * 9;
        const rad = (1 - k) * 0.6;
        L.park.x += (tgt.x + Math.cos(ang) * rad - L.park.x) * EASE(5, dt);
        L.park.y += (tgt.y + Math.sin(ang) * rad - L.park.y) * EASE(5, dt);
        L.park.s = Math.max(0.02, 1 - k * 0.98);
      } else {
        L.park.x += (tx - L.park.x) * EASE(5, dt);
        L.park.y += (ty - L.park.y) * EASE(5, dt);
        L.park.s += (ts - L.park.s) * EASE(5, dt);
      }
      rb.setTranslation({ x: L.park.x, y: L.park.y, z: 0 }, true);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.setGravityScale(0, true);
      collider?.setCollisionGroups(0);
      L.drive = false;
      b.dragged = b.squishing = false;
      b.grounded = false;
      b.inDanger = false;
      L.wasLive = false;
    } else {
      if (!L.wasLive) {
        // Going live: restore collisions. Every run starts on the plunger (TASK-185): if the gummy has not launched yet it is
        // placed exactly at the launcher (the countdown eases it there, but a slow frame rate can end the countdown early).
        collider?.setCollisionGroups(0xffffffff);
        L.wasLive = true;
        b.fallTime = 0;
        if (!rt.launched) {
          rb.setTranslation({ x: spawn.x, y: spawn.y, z: 0 }, true);
          rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
          b.x = spawn.x;
          b.y = spawn.y;
          L.park.x = spawn.x;
          L.park.y = spawn.y;
        }
      }
      // Remember where the bear is: the exit spiral and the results reform start from here.
      L.park.x = b.x;
      L.park.y = b.y;
      L.park.s = 1;
      if (gs === "GAME_OVER") {
        // The gummy stops where it is and melts into a puddle (§34).
        rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rb.setGravityScale(0, true);
        collider?.setCollisionGroups(0);
        L.drive = false;
      } else if (gs !== "PAUSED") {
        L.drive = true;
        rb.setGravityScale(rt.env.gravityMul * rt.tune.gravity, true);
        // grounded: a short ray straight down (sensors excluded)
        const ray = rayRef.current;
        if (ray) {
          ray.origin.x = t.x;
          ray.origin.y = t.y + 0.08;
          const hit = world.castRay(ray, 0.2, true, rapier.QueryFilterFlags.EXCLUDE_SENSORS, undefined, undefined, rb);
          b.grounded = hit !== null && lv.y < 1.5;
        }
        b.sinceBounce += dt;
        b.fallTime = b.grounded || lv.y > -1 ? 0 : b.fallTime + dt;
      }
      // The drain is the loss; the plunger well in the launch lane sits below the danger line when pulled back and is never the drain.
      b.inDanger = t.y < rt.arena.dangerTop + rt.env.dangerRise + 0.02 && t.x < rt.arena.lane.xIn - 0.05;
    }

    // ---- state + visuals ------------------------------------------------------------------------
    const powered = rt.env.rainbow > 0.5 || rt.env.gold > 0.5 || rt.env.lowGravity > 0.5 || rt.superSquish;
    b.state = physicsState({ dragged: b.dragged, squishing: b.squishing, inDanger: b.inDanger, sinceBounce: b.sinceBounce, powered, grounded: b.grounded });
    const jelly = rt.jelly;
    jelly.amplitude = (rt.reducedMotion ? 0.4 : 1) * rt.tune.jelly;
    jelly.step(dt);
    const w = jelly.weights(L.weights);

    const speed = Math.hypot(b.vx, b.vy);
    const squishMorph = b.charge * 0.95;
    const stretchMorph = Math.min(0.55, Math.abs(b.vy) / 30);
    // landing: a hard impact flattens the belly briefly via the jelly springs (already in `w`)
    const urgency = rt.store.getState().dangerLeft !== null ? 1 - Math.min(1, (rt.store.getState().dangerLeft ?? 1.2) / 1.2) : 0;
    const face = pickFace({
      state: b.state,
      speed,
      fallTime: b.fallTime,
      urgency,
      combo: rt.store.getState().combo,
      powered,
      gameOver: gs === "GAME_OVER" || gs === "RESULTS",
      calm: !machine.live && gs !== "RESULTS",
    });
    L.face.Happy += (face.Happy - L.face.Happy) * EASE(8, dt);
    L.face.Surprised += (face.Surprised - L.face.Surprised) * EASE(10, dt);
    L.face.Worried += (face.Worried - L.face.Worried) * EASE(8, dt);
    L.face.Panic += (face.Panic - L.face.Panic) * EASE(10, dt);
    L.blinkAt -= dt;
    if (L.blinkAt <= 0) {
      L.blink = 1;
      L.blinkAt = 2.2 + Math.random() * 3;
    }
    L.blink = Math.max(0, L.blink - dt / 0.18);
    const blinkW = Math.sin(L.blink * Math.PI);

    // intro: the bear waves (arm lag + head wobble) and breathes
    const introLike = !machine.live && gs !== "RESULTS";
    let wave = 0;
    if (introLike) wave = Math.sin(rt.time * 3.2) * 0.5 + 0.5;
    if (rt.poke > 0) rt.poke = Math.max(0, rt.poke - dt * 2.2);

    const final = L.weights;
    const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
    final.SquishVertical = clamp01(w.SquishVertical + squishMorph);
    final.StretchVertical = clamp01(w.StretchVertical + stretchMorph);
    final.ArmLagRight = clamp01(w.ArmLagRight + wave * 0.8);
    final.HeadWobbleLeft = clamp01(w.HeadWobbleLeft + (introLike ? wave * 0.25 : 0));
    final.Happy = L.face.Happy;
    final.Surprised = Math.min(FACE_OPEN_CAP, L.face.Surprised);
    final.Worried = L.face.Worried;
    final.Panic = Math.min(FACE_OPEN_CAP, L.face.Panic);
    final.Blink = blinkW;
    const morphScale = rt.tune.morph;
    for (const { mesh, index } of prepared.morphMeshes) {
      const inf = mesh.morphTargetInfluences!;
      for (const n of MORPH_NAMES) {
        const i = index[n];
        if (i !== undefined) inf[i] = Math.min(1, final[n] * (FACE_MORPHS.has(n) ? 1 : morphScale));
      }
    }

    // ---- transform: scale, lean, melt/reform, exit stretch ------------------------------------
    const s = parkedKind ? L.park.s : 1;
    let sx = 1;
    let sy = 1;
    sy += (stretchMorph - squishMorph) * 0.1 - w.SquishVertical * 0.06;
    sx -= (stretchMorph - squishMorph) * 0.05;
    if (gs === "GAME_OVER") {
      rt.melt = Math.min(1, rt.melt + dt / 0.9);
      const m = rt.melt * rt.melt * (3 - 2 * rt.melt);
      sy *= 1 - 0.9 * m;
      sx *= 1 + 0.7 * m;
      rt.reform = 0;
    } else if (gs === "RESULTS") {
      rt.reform = Math.min(1, rt.reform + dt / 0.9);
      const r = rt.reform;
      const elastic = 1 - Math.pow(1 - r, 3) * Math.cos(r * 9);
      sy *= 0.1 + 0.9 * elastic;
      sx *= 1.7 - 0.7 * Math.min(1, elastic);
      rt.melt = 1;
    } else {
      rt.melt = 0;
    }
    if (gs === "EXITING" && rt.exit) {
      const k = Math.min(1, rt.exit.t / 0.9);
      sy *= 1 + k * 1.8;
      sx *= 1 - k * 0.5;
      vis.rotation.z += dt * 10 * k;
    } else {
      const leanTarget = Math.max(-0.28, Math.min(0.28, -b.vx * 0.022));
      vis.rotation.z += (leanTarget - vis.rotation.z) * EASE(10, dt);
    }
    // eyes follow the pointer (a gentle yaw), calmer when idle
    const yawTarget = rt.pointer.active ? Math.max(-0.4, Math.min(0.4, (rt.pointer.x - b.x) * 0.12)) : Math.sin(rt.time * 0.7) * 0.08;
    vis.rotation.y += (yawTarget - vis.rotation.y) * EASE(4, dt);
    const poke = rt.poke;
    const hop = poke > 0 ? Math.sin(poke * Math.PI) * 0.18 : 0;
    vis.position.y = hop;
    vis.scale.set(s * sx, s * sy, s * sx);

    // ---- shader uniforms -----------------------------------------------------------------------
    uniforms.uTime.value = rt.time;
    uniforms.uJelly.value = rt.reducedMotion ? jelly.energy * 0.4 : jelly.energy;
    uniforms.uImpactDir.value.set(jelly.impactX, jelly.impactY, 0);
    const dangerGlow = b.inDanger && machine.running ? 0.9 : gs === "GAME_OVER" ? 0.4 : 0;
    uniforms.uGlow.value += (Math.max(dangerGlow, rt.env.tpGlow * 0.5) - uniforms.uGlow.value) * EASE(8, dt);
    uniforms.uRainbow.value += (rt.env.rainbow - uniforms.uRainbow.value) * EASE(6, dt);
    uniforms.uGold.value += (rt.env.gold - uniforms.uGold.value) * EASE(6, dt);

    // ---- blob shadow: a contact shadow on whatever is below (compresses with the squash) ----------
    const sh = shadow.current;
    const sray = shadowRay.current;
    if (sh && sray) {
      sray.origin.x = b.x;
      sray.origin.y = b.y + 0.3;
      const hit = machine.live || parkedKind === "spawn" ? world.castRay(sray, 14, true, rapier.QueryFilterFlags.EXCLUDE_SENSORS, undefined, undefined, rb) : null;
      if (hit) {
        const gy = b.y + 0.3 - hit.timeOfImpact;
        const dist = b.y - gy;
        sh.visible = true;
        sh.position.set(b.x, gy + 0.02, 0);
        const spread = 1 + sx * 0.0 + (1 - Math.min(1, sy)) * 0.5 + Math.min(0.5, dist * 0.08);
        sh.scale.set(spread * s, spread * s * 0.8, 1);
        shadowMat.opacity = Math.max(0.05, 0.55 - dist * 0.07);
      } else if (introLike || gs === "RESULTS") {
        sh.visible = true;
        sh.position.set(L.park.x, L.park.y - 0.02, 0);
        sh.scale.set(L.park.s * 1.1, L.park.s * 0.9, 1);
        shadowMat.opacity = 0.4;
      } else {
        sh.visible = false;
      }
    }
  });

  return (
    <>
      <RigidBody
        ref={body}
        name="gummy"
        colliders={false}
        position={[spawn.x, spawn.y, 0]}
        enabledRotations={[false, false, false]}
        enabledTranslations={[true, true, false]}
        linearDamping={0.08}
        canSleep={false}
        ccd
        onCollisionEnter={() => {
          const lv = body.current?.linvel();
          const b = rt.bear;
          const v = Math.hypot(b.vx, b.vy);
          const speed = Math.max(v, lv ? Math.hypot(lv.x, lv.y) : 0);
          if (speed < 2.6) return;
          const len = Math.hypot(b.vx, b.vy) || 1;
          rt.hooks.impact(speed, b.vx / len, b.vy / len, b.x, b.y + 0.2);
        }}
      >
        {prepared.hull ? (
          <ConvexHullCollider args={[prepared.hull]} restitution={0.32} friction={0.12} />
        ) : (
          <CuboidCollider args={[0.34, 0.45, 0.25]} position={[0, 0.5, 0]} restitution={0.32} friction={0.12} />
        )}
        <group ref={visual}>
          <primitive object={prepared.root} />
        </group>
      </RigidBody>
      <mesh ref={shadow} rotation-x={-Math.PI / 2} geometry={shadowGeo} material={shadowMat} renderOrder={-1} />
    </>
  );
}

