"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "three";
import { useRuntime } from "./runtime";

/**
 * Cinematic but stable camera (gummy-bear.md §27, §40): FOV ~34°, fixed side-on framing that fits the
 * whole arena (width on portrait phones, height on landscape), a slight raise so platform tops read,
 * a faint follow of the gummy, a small zoom pulse on special moments, 1–3 px-equivalent shake on big
 * impacts (off under reduced motion), and an eased blend between the close intro framing and play.
 */
export const FOV = 34;
const TAN = Math.tan((FOV * Math.PI) / 360);
const TILT = 0.12; // radians the camera looks down

export function fitDistance(aspect: number, halfW: number, height: number, margin = 1.08): number {
  const byHeight = (height / 2) / TAN;
  const byWidth = (halfW + 0.7) / (TAN * aspect);
  return Math.max(byHeight, byWidth) * margin;
}

export function CameraRig() {
  const rt = useRuntime();
  const { camera, size } = useThree();
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const cam = camera as PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const { arena } = rt;
    const h = arena.ceilingY - arena.floorY + 0.8;
    const play = fitDistance(aspect, arena.halfW, h);
    // intro: close on the large bear
    const introDist = Math.max(((3.8) / 2) / TAN, (2.2 / (TAN * aspect)));
    const target = rt.store.getState().machine.state;
    const wantPlay = target === "COUNTDOWN" || target === "PLAYING" || target === "PAUSED" || target === "DANGER" || target === "GAME_OVER";
    const goal = wantPlay ? 1 : 0;
    rt.introBlend += (goal - rt.introBlend) * (1 - Math.exp(-3.2 * dt));
    const k = rt.introBlend;
    const dist = introDist + (play - introDist) * k;
    const centreY = (arena.floorY + arena.ceilingY) / 2 + 0.2;
    const introY = arena.introPos.y + 0.9 + (aspect < 0.9 ? 1.1 : 0);
    const follow = rt.reducedMotion ? 0 : 0.06;
    const fy = (rt.bear.y - centreY) * follow * k;
    const zoom = rt.reducedMotion ? 0 : rt.zoom * 0.05;
    rt.zoom = Math.max(0, rt.zoom - dt * 1.5);
    const shake = rt.reducedMotion ? 0 : rt.shake;
    rt.shake = Math.max(0, rt.shake - dt * 3.5);
    const sx = (Math.random() - 0.5) * shake * 0.05;
    const sy = (Math.random() - 0.5) * shake * 0.05;
    const lookY = introY + (centreY + fy - introY) * k;
    const d = dist * (1 - zoom);
    cam.position.set(sx, lookY + d * Math.tan(TILT) + sy, d);
    cam.lookAt(0, lookY, 0);
    if (cam.fov !== FOV) {
      cam.fov = FOV;
      cam.updateProjectionMatrix();
    }
  });
  return null;
}
