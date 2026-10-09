"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import { introFraming } from "./intro-geometry";
import { useRuntime } from "./runtime";

/**
 * Cinematic but stable camera (gummy-bear.md §27, §40): FOV ~34°, fixed side-on framing that fits the
 * whole arena (width on portrait phones, height on landscape), a slight raise so platform tops read,
 * a faint follow of the gummy, a small zoom pulse on special moments, 1–3 px-equivalent shake on big
 * impacts (off under reduced motion), and an eased blend between the close intro framing and play.
 */
export const FOV = 34;
const TAN = Math.tan((FOV * Math.PI) / 360);
const TILT = 0.12; // radians the camera looks down (the intro and results framing)
/**
 * While the machine is on screen the camera sits a little below the table and looks up (TASK-185): the table recedes
 * toward its top like a real pinball cabinet seen from the player's side, and the paper layers show their thickness.
 */
const PLAY_TILT = -0.3;

export function fitDistance(aspect: number, halfW: number, height: number, margin = 1.08): number {
  const byHeight = (height / 2) / TAN;
  const byWidth = (halfW + 0.7) / (TAN * aspect);
  return Math.max(byHeight, byWidth) * margin;
}

/**
 * The camera distance at which the whole machine (its box, front and back) just fits the frame, found by projecting the box's
 * corners through the real tilted camera and scaling the distance until they touch the edge. A closed-form fit over-pads
 * once the camera is tilted and the cabinet has depth, and a bigger table is what makes the gummy easy to follow.
 */
export function fitMachine(aspect: number, box: { minX: number; maxX: number; bottomY: number; topY: number; cx: number }, tilt: number, pad = 0.975): number {
  const cam = new PerspectiveCamera(FOV, aspect, 0.5, 120);
  const cy = (box.topY + box.bottomY) / 2;
  const corners: Vector3[] = [];
  for (const x of [box.minX, box.maxX]) for (const y of [box.bottomY, box.topY]) for (const z of [-0.62, 0.95]) corners.push(new Vector3(x, y, z));
  let d = 24;
  const p = new Vector3();
  for (let i = 0; i < 5; i += 1) {
    cam.position.set(box.cx, cy + d * Math.tan(tilt), d);
    cam.lookAt(box.cx, cy, 0);
    cam.updateMatrixWorld();
    let m = 0;
    for (const c of corners) {
      p.copy(c).project(cam);
      m = Math.max(m, Math.abs(p.x), Math.abs(p.y));
    }
    d *= m / pad;
  }
  return d;
}

export function CameraRig() {
  const rt = useRuntime();
  const { camera, size, gl } = useThree();
  const focus = useRef(0.62);
  const fit = useRef({ aspect: 0, d: 24 });
  // Intro framing (TASK-168): how much world the camera shows and where the feet sit, from the art's stage anchor.
  const framing = useRef({ visibleHeight: 5.6, feetFraction: 0.8 });
  useEffect(() => {
    const update = () => {
      const r = gl.domElement.getBoundingClientRect();
      if (r.height > 0) framing.current = introFraming(window.innerWidth, window.innerHeight, { top: r.top, height: r.height });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [gl, size]);
  const probe = useRef(new Vector3());
  useEffect(() => {
    const v = new Vector3();
    rt.project = (x, y) => {
      camera.updateMatrixWorld();
      v.set(x, y, 0).project(camera);
      // Viewport coordinates: the canvas sits inside the diorama's opening, not at the page origin.
      const r = gl.domElement.getBoundingClientRect();
      return { x: r.left + ((v.x + 1) / 2) * size.width, y: r.top + ((1 - v.y) / 2) * size.height };
    };
  }, [rt, camera, size, gl]);
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const cam = camera as PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const { arena } = rt;
    if (fit.current.aspect !== aspect) fit.current = { aspect, d: fitMachine(aspect, { ...arena, cx: arena.cx }, PLAY_TILT) };
    const play = fit.current.d;
    // intro / results: a close product shot. The bear is placed by screen fraction so it clears the
    // title (intro, lower) or the results card (results, upper) on any aspect ratio.
    const state = rt.store.getState().machine.state;
    const results = state === "RESULTS";
    // Results keep the original close shot; the intro frames the bear to stand on the stage art's anchor.
    const introDist = results ? Math.max(5.6 / 2 / TAN, 2.4 / (TAN * aspect)) : framing.current.visibleHeight / 2 / TAN;
    const introH = 2 * introDist * TAN;
    const wantPlay = state === "COUNTDOWN" || state === "PLAYING" || state === "PAUSED" || state === "DANGER" || state === "GAME_OVER";
    rt.introBlend += ((wantPlay ? 1 : 0) - rt.introBlend) * (1 - Math.exp(-3.2 * dt));
    const k = rt.introBlend;
    const dist = introDist + (play - introDist) * k;
    const centreY = (arena.topY + arena.bottomY) / 2;
    focus.current += ((results ? 0.17 : 0.62) - focus.current) * (1 - Math.exp(-4 * dt));
    rt.resultsScale = Math.min(1.5, Math.max(0.9, 0.17 * introH));
    const bearMid = arena.introPos.y + 0.5 * (state === "RESULTS" ? rt.resultsScale : 1.9);
    let introY = bearMid + (focus.current - 0.5) * introH;
    if (!results && k < 0.999) {
      // Solve the look-at height so the bear's feet project to the stage anchor (a few Newton steps on the real camera).
      const feetY = arena.introPos.y;
      const target = 1 - 2 * framing.current.feetFraction;
      let look = feetY + (framing.current.feetFraction - 0.5) * introH;
      for (let i = 0; i < 3; i += 1) {
        cam.position.set(0, look + introDist * Math.tan(TILT), introDist);
        cam.lookAt(0, look, 0);
        cam.updateMatrixWorld();
        probe.current.set(0, feetY, 0).project(cam);
        look += (probe.current.y - target) * (introH / 2);
      }
      introY = look;
    }
    // the machine fills the frame, so the camera barely follows the gummy (a hair of drift keeps it alive)
    const follow = rt.reducedMotion ? 0 : 0.02 * rt.tune.follow;
    const fy = (rt.bear.y - centreY) * follow * k;
    const zoom = rt.reducedMotion ? 0 : rt.zoom * 0.05;
    rt.zoom = Math.max(0, rt.zoom - dt * 1.5);
    const shake = rt.reducedMotion ? 0 : rt.shake;
    rt.shake = Math.max(0, rt.shake - dt * 3.5);
    const sx = (Math.random() - 0.5) * shake * 0.05;
    const sy = (Math.random() - 0.5) * shake * 0.05;
    const lookY = introY + (centreY + fy - introY) * k;
    const d = dist * (1 - zoom);
    const tilt = TILT + (PLAY_TILT - TILT) * k;
    const lookX = arena.cx * k;
    cam.position.set(lookX + sx, lookY + d * Math.tan(tilt) + sy, d);
    cam.lookAt(lookX, lookY, 0);
    if (cam.fov !== FOV) {
      cam.fov = FOV;
      cam.updateProjectionMatrix();
    }
  });
  return null;
}
