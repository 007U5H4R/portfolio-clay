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
import { PHYSICS_DT } from "./physics-step";
import { RuntimeContext, useRuntime, type LabRuntime } from "./runtime";
import { Stage } from "./Stage";

/** Arena gravity (u/s²): a little floatier than Earth so the bear hangs a beat at the top of a bounce. */
export const GRAVITY = -16;

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

export default function GameScene({ runtime }: { runtime: LabRuntime }) {
  const [dpr, setDpr] = useState(Math.min(runtime.tier.maxDpr, typeof window === "undefined" ? 1 : window.devicePixelRatio || 1));
  return (
    <Canvas
      dpr={dpr}
      camera={{ fov: FOV, near: 0.5, far: 120, position: [0, 3, 22] }}
      gl={{ antialias: runtime.tier.antialias, powerPreference: "high-performance", alpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = NeutralToneMapping;
        gl.toneMappingExposure = runtime.palette.isDark ? 0.95 : 1.02;
      }}
      style={{ touchAction: "none" }}
    >
      <RuntimeContext.Provider value={runtime}>
        <Stage />
        <CameraRig />
        <World />
        <Particles />
        <DangerRing />
        <Driver />
        <AdaptiveDpr onDpr={setDpr} min={1} max={runtime.tier.maxDpr} />
        <ContextCleanup />
      </RuntimeContext.Provider>
    </Canvas>
  );
}
