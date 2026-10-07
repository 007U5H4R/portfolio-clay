"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { col } from "./materials";
import { useRuntime } from "./runtime";

/**
 * Staging (gummy-bear.md §28–29, remodelled in TASK-168): the world is drawn on a transparent canvas over the
 * diorama's paper backdrop (DOM layers, Diorama.tsx), so there is no backdrop plane any more. What stays is a
 * studio environment for the gummy's reflections, a big soft key from the upper left, a weaker front-right fill
 * and a rim from behind. Colours come from the paper-token palette, so dark mode follows the site theme.
 */
export function Stage() {
  const rt = useRuntime();
  const { gl, scene } = useThree();
  const { palette } = rt;

  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = palette.isDark ? 0.4 : 0.45;
    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      room.dispose();
    };
  }, [gl, scene, palette]);

  return (
    <>
      <ambientLight intensity={palette.isDark ? 0.2 : 0.22} color={col(palette.cream)} />
      <directionalLight position={[-6, 9, 7]} intensity={palette.isDark ? 1.3 : 1.5} color={col(palette.cream)} />
      <directionalLight position={[6, 2.5, 6]} intensity={0.5} color={col(palette.peach)} />
      <directionalLight position={[0, 5, -6]} intensity={0.8} color={col(palette.pink)} />
    </>
  );
}
