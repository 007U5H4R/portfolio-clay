"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
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
  const focus = useRef(0.62);
  useEffect(() => {
    const v = new Vector3();
    rt.project = (x, y) => {
      v.set(x, y, 0).project(camera);
      return { x: ((v.x + 1) / 2) * size.width, y: ((1 - v.y) / 2) * size.height };
    };
  }, [rt, camera, size]);
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const cam = camera as PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const { arena } = rt;
    const h = arena.ceilingY - arena.floorY + 0.8;
    const play = fitDistance(aspect, arena.halfW, h);
    // intro / results: a close product shot. The bear is placed by screen fraction so it clears the
    // title (intro, lower) or the results card (results, upper) on any aspect ratio.
    const introDist = Math.max(5.6 / 2 / TAN, 2.4 / (TAN * aspect));
    const introH = 2 * introDist * TAN;
    const state = rt.store.getState().machine.state;
    const wantPlay = state === "COUNTDOWN" || state === "PLAYING" || state === "PAUSED" || state === "DANGER" || state === "GAME_OVER";
    rt.introBlend += ((wantPlay ? 1 : 0) - rt.introBlend) * (1 - Math.exp(-3.2 * dt));
    const k = rt.introBlend;
    const dist = introDist + (play - introDist) * k;
    const centreY = (arena.floorY + arena.ceilingY) / 2 + 0.2;
    focus.current += ((state === "RESULTS" ? 0.17 : 0.62) - focus.current) * (1 - Math.exp(-4 * dt));
    rt.resultsScale = Math.min(1.5, Math.max(0.9, 0.17 * introH));
    const bearMid = arena.introPos.y + 0.5 * (state === "RESULTS" ? rt.resultsScale : 1.9);
    const introY = bearMid + (focus.current - 0.5) * introH;
    const follow = rt.reducedMotion ? 0 : 0.06 * rt.tune.follow;
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
