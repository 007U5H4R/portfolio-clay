"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { DoubleSide, Mesh, MeshStandardMaterial, PMREMGenerator, PlaneGeometry, ShaderMaterial, SphereGeometry } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { col } from "./materials";
import { useRuntime } from "./runtime";

/**
 * Product-photography staging (gummy-bear.md §28–29): a soft cream-to-blush backdrop (a gradient
 * plane, so transmission has something to refract), a studio environment for reflections, a big soft
 * key from the upper left, a weaker front-right fill and a rim from behind. Colours come from the
 * paper-token palette, so dark mode is a dusk plum rather than a separate asset.
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

  const backdrop = useMemo(() => {
    const geometry = new PlaneGeometry(90, 70);
    const material = new ShaderMaterial({
      uniforms: { uTop: { value: col(palette.top) }, uBottom: { value: col(palette.bottom) }, uGlow: { value: col(palette.glow) }, uGlowAmt: { value: palette.isDark ? 0.1 : 0.18 }, uTp: { value: 0 } },
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop; uniform vec3 uBottom; uniform vec3 uGlow; uniform float uGlowAmt; uniform float uTp; varying vec2 vUv;
        void main(){
          vec3 c = mix(uBottom, uTop, smoothstep(0.1, 0.9, vUv.y));
          float v = distance(vUv, vec2(0.5, 0.55));
          c = mix(c, uGlow, (1.0 - smoothstep(0.0, 0.55, v)) * uGlowAmt + uTp * 0.18);
          c *= 1.0 - smoothstep(0.45, 0.95, v) * 0.1;
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
      depthWrite: false,
      side: DoubleSide,
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(0, 0, -7);
    mesh.renderOrder = -10;
    return mesh;
  }, [palette]);
  useEffect(
    () => () => {
      backdrop.geometry.dispose();
      (backdrop.material as ShaderMaterial).dispose();
    },
    [backdrop],
  );

  const orbs = useMemo(() => {
    const geo = new SphereGeometry(1, 20, 14);
    const tints = [palette.peach, palette.pink, palette.mint, palette.cyan];
    const items = Array.from({ length: 6 }, (_, i) => {
      const mat = new MeshStandardMaterial({ color: col(tints[i % tints.length]!), roughness: 0.25, transparent: true, opacity: 0.22, envMapIntensity: 0.8 });
      const x = ((i * 53) % 100) / 100;
      return { mat, x: (x - 0.5) * 2 * (rt.arena.halfW + 4.5), y: -5 + ((i * 37) % 100) / 100 * 12, z: -4 - (i % 3) * 1.6, r: 0.35 + ((i * 17) % 10) / 10 * 0.7, ph: i };
    });
    return { geo, items };
  }, [palette, rt.arena.halfW]);
  const orbRefs = useRef<(Mesh | null)[]>([]);
  useEffect(
    () => () => {
      orbs.geo.dispose();
      orbs.items.forEach((o) => o.mat.dispose());
    },
    [orbs],
  );
  useFrame(() => {
    const u = (backdrop.material as ShaderMaterial).uniforms;
    u.uTp!.value += (rt.env.tpGlow - u.uTp!.value) * 0.05;
    const amp = rt.reducedMotion ? 0.25 : 1;
    orbs.items.forEach((o, i) => {
      const m = orbRefs.current[i];
      if (m) m.position.y = o.y + Math.sin(rt.time * 0.4 + o.ph) * 0.35 * amp;
    });
  });

  return (
    <>
      <primitive object={backdrop} />
      {orbs.items.map((o, i) => (
        <mesh key={i} ref={(m) => void (orbRefs.current[i] = m)} geometry={orbs.geo} material={o.mat} position={[o.x, o.y, o.z]} scale={o.r} />
      ))}
      <ambientLight intensity={palette.isDark ? 0.2 : 0.22} color={col(palette.cream)} />
      <directionalLight position={[-6, 9, 7]} intensity={palette.isDark ? 1.3 : 1.5} color={col(palette.cream)} />
      <directionalLight position={[6, 2.5, 6]} intensity={0.5} color={col(palette.peach)} />
      <directionalLight position={[0, 5, -6]} intensity={0.8} color={col(palette.pink)} />
    </>
  );
}
