"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { NeutralToneMapping } from "three";
import { nextDpr } from "@/lib/lab/tiers";
import { Arena } from "./Arena";
import { CameraRig, FOV } from "./CameraRig";
import { DangerRing } from "./Effects";
import { Driver } from "./Driver";
import { Gummy } from "./Gummy";
import { Pickups } from "./Pickups";
import { Particles } from "./Particles";
import { Trail } from "./Trail";
import { GRAVITY, PHYSICS_DT } from "./physics-step";
import { RuntimeContext, useRuntime, type LabRuntime } from "./runtime";
import { Stage } from "./Stage";

export { GRAVITY };

/** Adaptive DPR (gummy-bear.md §38–39): measure the average frame time, step the pixel ratio down on slow frames. */
function AdaptiveDpr({ onDpr, min, max }: { onDpr: (d: number) => void; min: number; max: number }) {
  const acc = useRef({ t: 0, n: 0, dpr: max });
  useFrame((_, dt) => {
    const a = acc.current;
    a.t += dt;
    a.n += 1;
    if (a.t >= 1.5) {
      const next = nextDpr(a.dpr, (a.t / a.n) * 1000, min, max);
      if (next !== a.dpr) {
        a.dpr = next;
        onDpr(next);
      }
      a.t = 0;
      a.n = 0;
    }
  });
  return null;
}

/** Hands the renderer's context back to the browser on unmount so repeated enter/exit cycles never leak GL contexts. */
function ContextCleanup() {
  const gl = useThree((s) => s.gl);
  useEffect(
    () => () => {
      gl.dispose();
      gl.forceContextLoss();
    },
    [gl],
  );
  return null;
}

/**
 * Lays the DOM overlays that sit on the machine (the black-hole link, the touch plunger, the start plaque) over their world
 * positions, every frame, from the camera: no extra rAF loop and no layout read. Writes only when a value actually moved.
 */
function OverlaySync() {
  const rt = useRuntime();
  const last = useRef({ portal: "", plunger: "", plaque: "" });
  useFrame(() => {
    const { portal, plunger, plaque } = rt.dom;
    const a = rt.arena;
    if (portal) {
      const p = rt.project(a.portal.x, a.portal.y);
      const q = rt.project(a.portal.x + a.portal.r * 1.7, a.portal.y);
      const R = Math.max(28, Math.abs(q.x - p.x));
      const key = `${p.x.toFixed(0)}|${p.y.toFixed(0)}|${R.toFixed(0)}`;
      if (key !== last.current.portal) {
        last.current.portal = key;
        portal.style.left = `${p.x - R}px`;
        portal.style.top = `${p.y - R}px`;
        portal.style.width = `${R * 2}px`;
        portal.style.height = `${R * 2}px`;
        portal.dataset.ready = "1";
      }
    }
    if (plunger) {
      const tl = rt.project(a.lane.xIn, a.lane.restY + 1.6);
      const br = rt.project(a.lane.xOut, a.lane.restY - 1.9);
      const w = Math.max(48, br.x - tl.x);
      const h = Math.max(72, br.y - tl.y);
      const cx = (tl.x + br.x) / 2;
      const key = `${cx.toFixed(0)}|${tl.y.toFixed(0)}|${w.toFixed(0)}|${h.toFixed(0)}`;
      if (key !== last.current.plunger) {
        last.current.plunger = key;
        plunger.style.left = `${cx - w / 2}px`;
        plunger.style.top = `${tl.y}px`;
        plunger.style.width = `${w}px`;
        plunger.style.height = `${h}px`;
      }
    }
    if (plaque) {
      const c = rt.project(0, -1.15);
      const key = `${c.x.toFixed(0)}|${c.y.toFixed(0)}`;
      if (key !== last.current.plaque) {
        last.current.plaque = key;
        plaque.style.left = `${c.x}px`;
        plaque.style.top = `${c.y}px`;
      }
    }
  });
  return null;
}

function World() {
  const rt = useRuntime();
  const paused = rt.store((s) => s.state === "PAUSED");
  return (
    <Suspense fallback={null}>
      <Physics gravity={[0, GRAVITY, 0]} paused={paused} timeStep={PHYSICS_DT} interpolate>
        <Arena />
        <Pickups />
        <Gummy />
      </Physics>
    </Suspense>
  );
}

export default function GameScene({ runtime, onReady }: { runtime: LabRuntime; onReady?: () => void }) {
  const [dpr, setDpr] = useState(Math.min(runtime.tier.maxDpr, typeof window === "undefined" ? 1 : window.devicePixelRatio || 1));
  return (
    <Canvas
      dpr={dpr}
      camera={{ fov: FOV, near: 0.5, far: 120, position: [0, 3, 22] }}
      // Transparent: the diorama's paper backdrop (DOM layers) shows through behind the world.
      gl={{ antialias: runtime.tier.antialias, powerPreference: "high-performance", alpha: true }}
      onCreated={({ gl, scene }) => {
        runtime.scene = scene;
        runtime.renderInfo = () => ({ calls: gl.info.render.calls, triangles: gl.info.render.triangles });
        gl.setClearColor(0x000000, 0);
        onReady?.();
        gl.toneMapping = NeutralToneMapping;
        gl.toneMappingExposure = runtime.palette.isDark ? 0.95 : 1.02;
      }}
      style={{ touchAction: "none" }}
    >
      <RuntimeContext.Provider value={runtime}>
        <Stage />
        <CameraRig />
        <World />
        <Trail />
        <Particles />
        <OverlaySync />
        <DangerRing />
        <Driver />
        <AdaptiveDpr onDpr={setDpr} min={1} max={runtime.tier.maxDpr} />
        <ContextCleanup />
      </RuntimeContext.Provider>
    </Canvas>
  );
}
