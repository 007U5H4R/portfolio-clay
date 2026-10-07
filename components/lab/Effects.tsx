"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ConeGeometry, Group, MeshBasicMaterial, TorusGeometry } from "three";
import { col } from "./materials";
import { useRuntime } from "./runtime";

/**
 * The danger cue (gummy-bear.md §31): a subtle pulsing ring around the gummy and a small up-arrow
 * "rescue" indicator above it — never a full-screen red overlay. Visible only while in DANGER.
 */
export function DangerRing() {
  const rt = useRuntime();
  const group = useRef<Group>(null);
  const ringGeo = useMemo(() => new TorusGeometry(0.78, 0.035, 8, 40), []);
  const arrowGeo = useMemo(() => new ConeGeometry(0.16, 0.3, 3), []);
  const mat = useMemo(() => new MeshBasicMaterial({ color: col(rt.palette.jelly), transparent: true, opacity: 0.85, depthWrite: false }), [rt]);
  useEffect(
    () => () => {
      ringGeo.dispose();
      arrowGeo.dispose();
      mat.dispose();
    },
    [ringGeo, arrowGeo, mat],
  );
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const danger = rt.store.getState().state === "DANGER";
    g.visible = danger;
    if (!danger) return;
    const left = rt.store.getState().dangerLeft ?? 1.2;
    const urgency = 1 - Math.min(1, left / 1.2);
    const pulse = 1 + Math.sin(rt.time * (8 + urgency * 10)) * 0.06 * (rt.reducedMotion ? 0.3 : 1);
    g.position.set(rt.bear.x, rt.bear.y + 0.5, 0.35);
    g.scale.setScalar(pulse * (1.1 - urgency * 0.15));
    mat.opacity = 0.5 + urgency * 0.45;
    const arrow = g.children[1];
    if (arrow) arrow.position.y = 1.15 + Math.sin(rt.time * 6) * 0.08;
  });
  return (
    <group ref={group} visible={false} renderOrder={7}>
      <mesh geometry={ringGeo} material={mat} />
      <mesh geometry={arrowGeo} material={mat} position={[0, 1.15, 0]} />
    </group>
  );
}
