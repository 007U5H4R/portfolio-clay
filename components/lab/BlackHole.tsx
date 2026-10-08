"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CircleGeometry, Group, InstancedMesh, MeshBasicMaterial, Object3D, PlaneGeometry, ShaderMaterial, ShapeGeometry, type IUniform } from "three";
import { mix, type RGB } from "@/lib/lab/tokens";
import { col, createTintedPaper } from "./materials";
import { glowMaterial, glowTexture, neonColors, rng, tornCircle } from "./paper-kit";
import { useRuntime } from "./runtime";

/**
 * The black hole (TASK-185, spec §23): the way back to the portfolio, drawn as a tear in the cabinet's top-left corner with
 * a torn paper lip, a deep black centre, a purple-and-amber ring that slowly swirls and a handful of tiny stars in orbit.
 * Hovering or focusing the real link (LabUi's BackPortal sets `rt.blackHoleHover`) swells it, speeds the stars and the
 * swirl, pulls the stars in a little and bends the paper lip toward the centre. Under reduced motion nothing orbits or
 * swirls; the hover still swells it (a state change, not a loop).
 */
const STARS = 14;
export function BlackHole() {
  const rt = useRuntime();
  const { arena, palette } = rt;
  const { x, y, r } = arena.portal;
  const group = useRef<Group>(null);
  const stars = useRef<InstancedMesh>(null);
  const hoverK = useRef(0);
  const neon = useMemo(() => neonColors(palette), [palette]);
  const tok = palette.tok;
  const kit = useMemo(() => {
    const lip1 = new ShapeGeometry(tornCircle(r * 1.62, 0.16, 11), 12);
    const lip2 = new ShapeGeometry(tornCircle(r * 1.34, 0.2, 29), 12);
    const rest1 = new Float32Array(lip1.getAttribute("position").array);
    const rest2 = new Float32Array(lip2.getAttribute("position").array);
    const lip1Mat = createTintedPaper(mix(tok.ivory, tok.kraft, 0.35), { lift: 0.08 });
    const lip2Mat = createTintedPaper(mix(tok.terracotta, tok.rust, 0.5), { lift: 0.06 });
    const disc = new CircleGeometry(r * 1.08, 40);
    const dark = mix(tok.navy, [0, 0, 0] as RGB, 0.8);
    const discMat = new MeshBasicMaterial({ color: col(dark) });
    const swirlGeo = new PlaneGeometry(r * 3.5, r * 3.5);
    const uniforms = {
      uTime: { value: 0 },
      uHover: { value: 0 },
      uA: { value: neon.amber.clone() },
      uB: { value: neon.magenta.clone().lerp(col(tok.steel), 0.45) },
    } satisfies Record<string, IUniform>;
    const swirlMat = new ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; uniform float uHover; uniform vec3 uA; uniform vec3 uB; varying vec2 vUv;
        void main(){
          vec2 p = vUv * 2.0 - 1.0;
          float rr = length(p);
          float a = atan(p.y, p.x);
          float swirl = a + 3.2 / (rr + 0.18) - uTime * (0.55 + uHover * 1.3);
          float arms = 0.5 + 0.5 * sin(swirl * 3.0);
          float fine = 0.5 + 0.5 * sin(swirl * 9.0 + rr * 6.0);
          float body = smoothstep(1.0, 0.5, rr) * smoothstep(0.2, 0.46, rr);
          vec3 c = mix(uB, uA, smoothstep(0.35, 0.85, rr) * (0.55 + 0.45 * arms));
          c += uA * pow(smoothstep(0.62, 0.34, rr) * smoothstep(0.2, 0.34, rr), 2.0) * 0.8;
          float alpha = body * (0.62 + 0.4 * arms + 0.12 * fine);
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(c, clamp(alpha, 0.0, 1.0));
        }`,
    });
    const starGeo = new PlaneGeometry(0.06, 0.06);
    const starMat = new MeshBasicMaterial({ color: neon.white.clone(), toneMapped: false });
    const tex = glowTexture(128, 2);
    const glowGeo = new PlaneGeometry(r * 6.5, r * 6.5);
    const glowMat = glowMaterial(neon.magenta, tex, 0.34);
    const rand = rng(23);
    const seeds = Array.from({ length: STARS }, (_, i) => ({ rad: 0.5 + rand() * 0.62, ph: rand() * Math.PI * 2, sp: 0.5 + rand() * 0.9, sz: 0.7 + rand() * 0.9, i }));
    return { lip1, lip2, rest1, rest2, lip1Mat, lip2Mat, disc, discMat, swirlGeo, swirlMat, uniforms, starGeo, starMat, tex, glowGeo, glowMat, seeds };
  }, [r, tok, neon]);
  useEffect(
    () => () => {
      for (const d of [kit.lip1, kit.lip2, kit.lip1Mat, kit.lip2Mat, kit.disc, kit.discMat, kit.swirlGeo, kit.swirlMat, kit.starGeo, kit.starMat, kit.tex, kit.glowGeo, kit.glowMat]) d.dispose();
    },
    [kit],
  );
  const dummy = useMemo(() => new Object3D(), []);
  const lastBend = useRef(-1);
  const orbit = useRef(0);
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const target = rt.blackHoleHover ? 1 : 0;
    hoverK.current += (target - hoverK.current) * (1 - Math.exp(-7 * dt));
    const k = hoverK.current;
    const still = rt.reducedMotion;
    if (group.current) group.current.scale.setScalar(1 + 0.18 * k);
    if (!still) {
      kit.uniforms.uTime.value += dt;
      orbit.current += dt * (0.5 + k * 2.4);
    }
    kit.uniforms.uHover.value = k;
    // the paper lip bends toward the centre a little when the hole is hovered (only recomputed while it is changing)
    if (Math.abs(k - lastBend.current) > 0.002) {
      lastBend.current = k;
      for (const [geo, rest, depth] of [
        [kit.lip1, kit.rest1, 0.12],
        [kit.lip2, kit.rest2, 0.08],
      ] as const) {
        const pos = geo.getAttribute("position");
        for (let i = 0; i < pos.count; i += 1) {
          const ox = rest[i * 3]!;
          const oy = rest[i * 3 + 1]!;
          const pull = 1 - k * depth * Math.min(1, Math.hypot(ox, oy) / (r * 1.3));
          pos.setXY(i, ox * pull, oy * pull);
        }
        pos.needsUpdate = true;
      }
    }
    const m = stars.current;
    if (m) {
      for (const s of kit.seeds) {
        const rad = s.rad * r * 1.45 * (1 - 0.14 * k);
        const a = s.ph + orbit.current * s.sp * (1.2 / (0.6 + s.rad));
        dummy.position.set(Math.cos(a) * rad, Math.sin(a) * rad * 0.92, 0.02);
        dummy.scale.setScalar(s.sz * (1 + 0.4 * k));
        dummy.updateMatrix();
        m.setMatrixAt(s.i, dummy.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group position={[x, y, 0.9]}>
      <mesh geometry={kit.glowGeo} material={kit.glowMat} position={[0, 0, -0.05]} renderOrder={2} />
      <group ref={group}>
        <mesh geometry={kit.lip1} material={kit.lip1Mat} position={[0, 0, 0]} />
        <mesh geometry={kit.lip2} material={kit.lip2Mat} position={[0, 0, 0.02]} />
        <mesh geometry={kit.disc} material={kit.discMat} position={[0, 0, 0.05]} />
        <mesh geometry={kit.swirlGeo} material={kit.swirlMat} position={[0, 0, 0.07]} renderOrder={3} />
        <group position={[0, 0, 0.09]}>
          <instancedMesh ref={stars} args={[kit.starGeo, kit.starMat, STARS]} frustumCulled={false} renderOrder={4} />
        </group>
      </group>
    </group>
  );
}

