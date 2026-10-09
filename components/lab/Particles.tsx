"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, DynamicDrawUsage, IcosahedronGeometry, InstancedMesh, MeshBasicMaterial, Object3D } from "three";
import { neonColors } from "./paper-kit";
import { useRuntime } from "./runtime";

/**
 * One instanced mesh for every sparkle, droplet, star burst and power-up trail (gummy-bear.md §25):
 * the pool is capped by the device tier (20–64 live), updated on the CPU, drawn in a single call.
 */
export function Particles() {
  const rt = useRuntime();
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const geo = useMemo(() => new IcosahedronGeometry(1, 0), []);
  const mat = useMemo(() => new MeshBasicMaterial({ color: new Color(1, 1, 1), transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false }), []);
  // Slots (TASK-185): 0 amber, 1 magenta, 2 warm white, 3 cream-white, 4 cyan. Restrained: a few tiny sparks, never confetti.
  const colors = useMemo(() => {
    const n = neonColors(rt.palette);
    return [n.amber, n.magenta, n.white, n.white.clone().lerp(n.amber, 0.3), n.cyan];
  }, [rt.palette]);
  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    m.instanceMatrix.setUsage(DynamicDrawUsage);
    dummy.scale.setScalar(0);
    dummy.updateMatrix();
    for (let i = 0; i < rt.particles.capacity; i += 1) m.setMatrixAt(i, dummy.matrix);
    m.instanceMatrix.needsUpdate = true;
  }, [rt, dummy]);
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );
  useFrame((_, rawDt) => {
    const m = mesh.current;
    if (!m) return;
    const p = rt.particles;
    p.update(Math.min(rawDt, 1 / 30));
    for (let i = 0; i < p.capacity; i += 1) {
      const a = p.alpha(i);
      if (a <= 0) {
        dummy.scale.setScalar(0);
      } else {
        dummy.position.set(p.x[i]!, p.y[i]!, 0.45);
        dummy.scale.setScalar(p.size[i]! * (0.4 + a * 0.8));
        m.setColorAt(i, colors[p.color[i]! % colors.length]!);
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  // Reduced motion: a pool of capacity 0 (create-runtime.ts) draws nothing at all.
  if (rt.particles.capacity === 0) return null;
  return <instancedMesh ref={mesh} args={[geo, mat, rt.particles.capacity]} frustumCulled={false} renderOrder={6} />;
}
