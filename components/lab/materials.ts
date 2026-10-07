import { Color, MeshPhysicalMaterial, RepeatWrapping, SRGBColorSpace, MeshStandardMaterial, ShaderMaterial, TextureLoader, Vector3, type BufferGeometry, type IUniform, type Texture, type WebGLProgramParametersWithUniforms } from "three";
import { mix, type CandyPalette, type RGB } from "@/lib/lab/tokens";
import type { TierConfig } from "@/lib/lab/tiers";

/**
 * Gummy materials (gummy-bear.md §12, §14, §28): a MeshPhysicalMaterial patched with a small shader
 * layer — a jelly ripple + impact bulge in the vertex stage, a fresnel rim / inner glow, rainbow and
 * golden tints in the fragment stage. All colours arrive from the palette (paper tokens), never as
 * literals. High tier uses real `transmission`; lower tiers keep the same translucent look with
 * opacity + clearcoat + the shader glow, which is far cheaper on phones.
 */
/** Palette values are sRGB (read from CSS); convert into three's linear working space. */
export const col = (c: RGB) => new Color().setRGB(c[0], c[1], c[2], SRGBColorSpace);

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

/** The gummy's own hue (TASK-168, §82): a saturated red-orange candy, #E8463A-#F05A3C. The only literal; everything else follows the palette. */
const GUMMY_RED: RGB = [0.93, 0.29, 0.22];

export function createGummyMaterial(palette: CandyPalette, tier: TierConfig) {
  const body = col(mix(palette.orange, GUMMY_RED, 0.8));
  const deep = col(mix(GUMMY_RED, palette.jelly, 0.15));
  const uniforms: GummyUniforms = {
    uTime: { value: 0 },
    uJelly: { value: 0 },
    uImpactDir: { value: new Vector3(0, 1, 0) },
    uGlow: { value: 0 },
    uGlowColor: { value: col(palette.pink) },
    uRim: { value: col(mix(palette.peach, GUMMY_RED, 0.3)) },
    uRainbow: { value: 0 },
    uGold: { value: 0 },
    uGoldColor: { value: col(palette.gold) },
  };
  const material = new MeshPhysicalMaterial({
    color: body,
    roughness: 0.22,
    metalness: 0,
    ior: 1.45,
    clearcoat: 0.85,
    clearcoatRoughness: 0.08,
    specularIntensity: 0.9,
    sheen: 0.25,
    sheenColor: col(mix(palette.peach, GUMMY_RED, 0.5)),
    attenuationColor: deep,
    attenuationDistance: 1.6,
    thickness: 1.1,
    envMapIntensity: 1,
    // a faint self-light so the candy glows from within, a little more in dark where there is less key light
    emissive: body,
    emissiveIntensity: palette.isDark ? 0.14 : 0.05,
  });
  if (tier.transmission) {
    material.transmission = 0.55;
  } else {
    material.transparent = true;
    material.opacity = 0.92;
    material.emissiveIntensity = palette.isDark ? 0.22 : 0.12;
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

/**
 * Paper materials (TASK-168): platforms and collectibles are matte cardstock, never glass, gloss or metal. The six
 * seamless 1024 px textures (cream, rose, sage, blue, terracotta, ochre) and the shared bump map are fetched when the
 * first paper material is built (the canvas already exists by then) and shared by every material that uses them.
 * The art carries the colour, so the palette tint is not applied; lighting is the stage's upper-left key.
 */
export type PaperKey = "cream" | "rose" | "sage" | "blue" | "terracotta" | "ochre";
/** World units one texture tile covers on a flat platform. */
export const PAPER_TILE = 2.4;
const PAPER_BASE = "/media/lab/art";
const paperTextures = new Map<string, Texture>();
let paperLoader: TextureLoader | null = null;

function loadPaper(file: string, colour: boolean): Texture {
  let t = paperTextures.get(file);
  if (!t) {
    paperLoader ??= new TextureLoader();
    t = paperLoader.load(`${PAPER_BASE}/${file}.webp`);
    t.wrapS = t.wrapT = RepeatWrapping;
    if (colour) t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    paperTextures.set(file, t);
  }
  return t;
}

/** `lift` self-lights the paper by its own texture (collectibles stay readable against the hills; it is not a glow colour). */
export function createPaperMaterial(key: PaperKey, opts: { opacity?: number; lift?: number } = {}) {
  const m = new MeshStandardMaterial({
    map: loadPaper(`paper-${key}`, true),
    bumpMap: loadPaper("paper-bump", false),
    bumpScale: 0.6,
    roughness: 0.94,
    metalness: 0,
    envMapIntensity: 0.45,
  });
  if (opts.lift) {
    m.emissiveMap = m.map;
    m.emissive = new Color(1, 1, 1);
    m.emissiveIntensity = opts.lift;
  }
  if (opts.opacity !== undefined && opts.opacity < 1) {
    m.transparent = true;
    m.opacity = opts.opacity;
  }
  return m;
}

/** Tile the paper grain by scaling a geometry's UVs (the textures are shared, so repeat is not per material). */
export function tileUV(geo: BufferGeometry, w: number, h: number): void {
  const uv = geo.getAttribute("uv");
  if (!uv) return;
  const kx = Math.max(0.25, w / PAPER_TILE);
  const ky = Math.max(0.25, h / PAPER_TILE);
  for (let i = 0; i < uv.count; i += 1) uv.setXY(i, uv.getX(i) * kx, uv.getY(i) * ky);
  uv.needsUpdate = true;
}

/** Soft matte tint for arena pieces that have no paper art of their own (kept for the few flat-colour parts). */
export function createCandyMaterial(tint: RGB, opts: { opacity?: number; emissive?: number } = {}) {
  const m = new MeshStandardMaterial({ color: col(tint), roughness: 0.8, metalness: 0, envMapIntensity: 0.5 });
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
        float a = mix(0.34, 0.74, depth) + surface * 0.12;
        gl_FragColor = vec4(c, a);
        #include <colorspace_fragment>
      }`,
  });
  return { material, uniforms };
}
