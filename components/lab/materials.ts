import { Color, MeshPhysicalMaterial, MeshStandardMaterial, ShaderMaterial, Vector3, type IUniform, type WebGLProgramParametersWithUniforms } from "three";
import type { CandyPalette, RGB } from "@/lib/lab/tokens";
import type { TierConfig } from "@/lib/lab/tiers";

/**
 * Gummy materials (gummy-bear.md §12, §14, §28): a MeshPhysicalMaterial patched with a small shader
 * layer — a jelly ripple + impact bulge in the vertex stage, a fresnel rim / inner glow, rainbow and
 * golden tints in the fragment stage. All colours arrive from the palette (paper tokens), never as
 * literals. High tier uses real `transmission`; lower tiers keep the same translucent look with
 * opacity + clearcoat + the shader glow, which is far cheaper on phones.
 */
export const col = (c: RGB) => new Color(c[0], c[1], c[2]);

export interface GummyUniforms {
  uTime: IUniform<number>;
  uJelly: IUniform<number>;
  uImpactDir: IUniform<Vector3>;
  uGlow: IUniform<number>;
  uGlowColor: IUniform<Color>;
  uRim: IUniform<Color>;
  uRainbow: IUniform<number>;
  uGold: IUniform<number>;
  uGoldColor: IUniform<Color>;
}

export function createGummyMaterial(palette: CandyPalette, tier: TierConfig) {
  const body = col(palette.orange);
  const uniforms: GummyUniforms = {
    uTime: { value: 0 },
    uJelly: { value: 0 },
    uImpactDir: { value: new Vector3(0, 1, 0) },
    uGlow: { value: 0 },
    uGlowColor: { value: col(palette.pink) },
    uRim: { value: col(palette.peach) },
    uRainbow: { value: 0 },
    uGold: { value: 0 },
    uGoldColor: { value: col(palette.gold) },
  };
  const material = new MeshPhysicalMaterial({
    color: body,
    roughness: 0.28,
    metalness: 0,
    ior: 1.45,
    clearcoat: 0.7,
    clearcoatRoughness: 0.12,
    specularIntensity: 1,
    sheen: 0.4,
    sheenColor: col(palette.peach),
    attenuationColor: col(palette.jelly),
    attenuationDistance: 1.3,
    thickness: 0.9,
    envMapIntensity: 1.1,
  });
  if (tier.transmission) {
    material.transmission = 0.62;
  } else {
    material.transparent = true;
    material.opacity = 0.9;
    material.emissive = col(palette.orange);
    material.emissiveIntensity = 0.12;
  }
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
uniform float uTime;
uniform float uJelly;
uniform vec3 uImpactDir;
varying float vObjY;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
vObjY = position.y;
float ripple = sin(dot(position, vec3(7.0, 9.0, 5.0)) - uTime * 16.0) * uJelly * 0.022;
float facing = dot(normalize(normal), normalize(uImpactDir + vec3(0.0001)));
transformed += normal * (ripple + facing * uJelly * 0.03);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform float uTime;
uniform float uGlow;
uniform vec3 uGlowColor;
uniform vec3 uRim;
uniform float uRainbow;
uniform float uGold;
uniform vec3 uGoldColor;
varying float vObjY;
vec3 gummyHue(float h) {
  return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
}`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
vec3 candy = mix(vec3(0.62), gummyHue(vObjY * 0.9 + uTime * 0.35), 0.78);
diffuseColor.rgb = mix(diffuseColor.rgb, candy, 0.6 * uRainbow);
diffuseColor.rgb = mix(diffuseColor.rgb, uGoldColor, 0.7 * uGold);`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
float gFres = pow(1.0 - clamp(abs(dot(normalize(vNormal), normalize(vViewPosition))), 0.0, 1.0), 2.2);
totalEmissiveRadiance += uRim * gFres * 0.5 + uGlowColor * uGlow * (0.3 + 0.7 * gFres) * (0.75 + 0.25 * sin(uTime * 9.0));`,
      );
  };
  material.customProgramCacheKey = () => `gummy-v1-${tier.transmission ? "t" : "o"}`;
  return { material, uniforms };
}

export function createFaceMaterial(palette: CandyPalette) {
  return new MeshStandardMaterial({ color: col(palette.face), roughness: 0.4, metalness: 0 });
}

/** Soft acrylic / resin look for arena pieces (§29): no metal, gentle sheen, pastel tints. */
export function createCandyMaterial(tint: RGB, opts: { opacity?: number; emissive?: number } = {}) {
  const m = new MeshStandardMaterial({ color: col(tint), roughness: 0.34, metalness: 0, envMapIntensity: 0.9 });
  if (opts.opacity !== undefined && opts.opacity < 1) {
    m.transparent = true;
    m.opacity = opts.opacity;
  }
  if (opts.emissive) {
    m.emissive = col(tint);
    m.emissiveIntensity = opts.emissive;
  }
  return m;
}

export interface LiquidUniforms {
  uTime: IUniform<number>;
  uDanger: IUniform<number>;
  uTop: IUniform<Color>;
  uBottom: IUniform<Color>;
  uGlow: IUniform<Color>;
}

/** The danger floor (§15): warm, glowing jelly liquid — playful, not violent. A wavy translucent slab. */
export function createLiquidMaterial(palette: CandyPalette) {
  const uniforms: LiquidUniforms = {
    uTime: { value: 0 },
    uDanger: { value: 0 },
    uTop: { value: col(palette.peach) },
    uBottom: { value: col(palette.jelly) },
    uGlow: { value: col(palette.peach) },
  };
  const material = new ShaderMaterial({
    uniforms: uniforms as unknown as Record<string, IUniform>,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;
      varying float vWave;
      void main() {
        vUv = uv;
        vec3 p = position;
        float top = step(0.5, uv.y);
        float w = sin(p.x * 2.2 + uTime * 1.6) * 0.07 + sin(p.x * 5.1 - uTime * 2.3) * 0.035;
        p.y += top * w;
        vWave = w;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uDanger;
      uniform vec3 uTop;
      uniform vec3 uBottom;
      uniform vec3 uGlow;
      varying vec2 vUv;
      varying float vWave;
      void main() {
        float depth = 1.0 - vUv.y;
        vec3 c = mix(uTop, uBottom, smoothstep(0.0, 1.0, depth));
        float streak = smoothstep(0.92, 1.0, sin(vUv.x * 18.0 + uTime * 0.8 + depth * 5.0) * 0.5 + 0.5) * 0.18;
        float surface = smoothstep(0.86, 1.0, vUv.y);
        c += uGlow * (surface * 0.55 + streak) + uGlow * uDanger * 0.35 * (0.6 + 0.4 * sin(uTime * 8.0));
        float a = mix(0.5, 0.82, depth) + surface * 0.1;
        gl_FragColor = vec4(c, a);
        #include <colorspace_fragment>
      }`,
  });
  return { material, uniforms };
}
