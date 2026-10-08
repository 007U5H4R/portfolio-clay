"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry, Color, DoubleSide, DynamicDrawUsage, Mesh, MeshBasicMaterial, NormalBlending, PlaneGeometry } from "three";
import { FULL_SPEED, MIN_TRAIL_SPEED, type TrailBuffer } from "@/lib/lab/trail";
import { glowTexture, neonColors } from "./paper-kit";
import { useRuntime } from "./runtime";

/**
 * The gummy's light trail (TASK-185, spec §7–9, §27). Two ribbons built once from a fixed-size `TrailBuffer` and rewritten in
 * place every frame, nothing created per frame:
 *   • an AURA, alpha-blended so it shows on the pale cardstock: amber through the middle, cyan one side and magenta the other,
 *     softening to nothing at the edges;
 *   • a CORE, narrow and alpha-blended on top: warm white, the brightest part, drifting to amber as it ages. (Neither is additive:
 *     added light is invisible on a cream table, and the tokens' own dark theme is covered by the same colours.)
 * Both fade 100 → 70 → 40 → 15 → 0 % by the buffer's own gradient, are widest at speed, and shorten as the gummy slows. A small
 * glow sits on the gummy while it is quick. Under reduced motion the buffer records nothing, so none of this draws.
 */
const VERTS = 6;
/** Where the four vertices of a sample sit across the ribbon, as a fraction of its half-width (module constants: nothing is allocated per frame). */
const AURA_K = [-1, -0.6, -0.2, 0.2, 0.6, 1] as const;
const CORE_K = [-0.3, -0.18, -0.06, 0.06, 0.18, 0.3] as const;

interface Ribbon {
  geo: BufferGeometry;
  pos: BufferAttribute;
  colr: BufferAttribute;
}

function makeRibbon(cap: number): Ribbon {
  const geo = new BufferGeometry();
  const pos = new BufferAttribute(new Float32Array(cap * VERTS * 3), 3);
  const colr = new BufferAttribute(new Float32Array(cap * VERTS * 4), 4);
  pos.setUsage(DynamicDrawUsage);
  colr.setUsage(DynamicDrawUsage);
  geo.setAttribute("position", pos);
  geo.setAttribute("color", colr);
  // five quads between each pair of neighbouring samples
  const idx: number[] = [];
  for (let i = 0; i < cap - 1; i += 1) {
    const a = i * VERTS;
    const b = (i + 1) * VERTS;
    for (let q = 0; q < VERTS - 1; q += 1) idx.push(a + q, b + q, a + q + 1, a + q + 1, b + q, b + q + 1);
  }
  geo.setIndex(idx);
  geo.setDrawRange(0, 0);
  return { geo, pos, colr };
}

/** Writes one vertex colour. A plain function (not a closure made per sample), so a frame allocates nothing. */
function setColor(arr: Float32Array, vertex: number, c: Color, alpha: number) {
  arr[vertex * 4] = c.r;
  arr[vertex * 4 + 1] = c.g;
  arr[vertex * 4 + 2] = c.b;
  arr[vertex * 4 + 3] = alpha;
}

export function Trail() {
  const rt = useRuntime();
  const head = useRef<Mesh>(null);
  const neon = useMemo(() => neonColors(rt.palette), [rt.palette]);
  const cap = rt.trail.capacity;
  // On a cream table the light must be deeper to show (a pale glow vanishes there); on navy it can be full strength.
  const cols = useMemo(() => {
    const dark = rt.palette.isDark;
    const k = dark ? 1 : 0.62;
    return {
      cyan: neon.cyan.clone().multiplyScalar(k),
      magenta: neon.magenta.clone().multiplyScalar(k),
      mid: neon.amber.clone().lerp(neon.magenta, 0.12).multiplyScalar(k),
      amber: neon.amber.clone().multiplyScalar(k),
      white: neon.white.clone().lerp(neon.amber, dark ? 0 : 0.38),
    };
  }, [neon, rt.palette]);
  const kit = useMemo(() => {
    const aura = makeRibbon(cap);
    const core = makeRibbon(cap);
    // DoubleSide: the ribbon's winding follows the direction of travel, so it must be visible from either face
    const auraMat = new MeshBasicMaterial({ vertexColors: true, transparent: true, blending: NormalBlending, depthWrite: false, toneMapped: false, side: DoubleSide });
    const coreMat = new MeshBasicMaterial({ vertexColors: true, transparent: true, blending: NormalBlending, depthWrite: false, toneMapped: false, side: DoubleSide });
    const tex = glowTexture(128, 1.6);
    const headGeo = new PlaneGeometry(2.4, 2.4);
    const headMat = new MeshBasicMaterial({ color: neon.amber.clone().lerp(neon.white, 0.35), map: tex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    return { aura, core, auraMat, coreMat, tex, headGeo, headMat };
  }, [cap, neon]);
  useEffect(
    () => () => {
      kit.aura.geo.dispose();
      kit.core.geo.dispose();
      kit.auraMat.dispose();
      kit.coreMat.dispose();
      kit.tex.dispose();
      kit.headGeo.dispose();
      kit.headMat.dispose();
    },
    [kit],
  );
  const tmp = useMemo(() => ({ warm: new Color(), mid: new Color() }), []);
  const emit = useRef(0);
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const trail: TrailBuffer = rt.trail;
    const machine = rt.store.getState().machine;
    const b = rt.bear;
    const speed = Math.hypot(b.vx, b.vy);
    // Paused: the trail freezes with the game (it neither ages nor grows), so a held frame keeps its light.
    if (rt.store.getState().state !== "PAUSED") {
      // Record the gummy while it is being played (not parked on a menu).
      if (machine.running && trail.enabled) {
        trail.push(b.x, b.y + 0.5, speed, dt);
        // micro-sparks along the fast path: tiny, a few per second, gone in a fraction of a second
        if (speed > 9 && rt.particles.capacity > 0) {
          emit.current += dt * (6 + speed * 0.5);
          const n = Math.floor(emit.current);
          if (n > 0) {
            emit.current -= n;
            rt.particles.emit({ x: b.x, y: b.y + 0.5, kind: "streak", count: Math.min(2, n), color: 2 + (Math.random() < 0.3 ? 2 : 0), dirX: b.vx / speed, dirY: b.vy / speed });
          }
        }
      }
      trail.update(dt);
      rt.trailFlash = Math.max(0, rt.trailFlash - dt * 3.2);
    }
    const n = trail.count;
    const flash = rt.trailFlash;
    // the glow on the gummy itself: it brightens with speed and flashes on a hit or a launch
    const h = head.current;
    if (h) {
      const on = trail.enabled && machine.running;
      kit.headMat.opacity = on ? Math.min(0.75, 0.42 * Math.min(1, speed / FULL_SPEED) + flash * 0.35) : 0;
      h.position.set(b.x, b.y + 0.5, -0.02);
      h.visible = on && kit.headMat.opacity > 0.02;
    }
    if (n < 2 || !trail.enabled) {
      kit.aura.geo.setDrawRange(0, 0);
      kit.core.geo.setDrawRange(0, 0);
      return;
    }
    const aPos = kit.aura.pos.array as Float32Array;
    const aCol = kit.aura.colr.array as Float32Array;
    const cPos = kit.core.pos.array as Float32Array;
    const cCol = kit.core.colr.array as Float32Array;
    const baseW = 1.0 + flash * 0.2;
    for (let k = 0; k < n; k += 1) {
      const i = trail.slot(k);
      const x = trail.x[i]!;
      const y = trail.y[i]!;
      const a = trail.alpha(k);
      // direction: toward the next-newer sample (or from the next-older at the head)
      const j = trail.slot(k === 0 ? Math.min(1, n - 1) : k - 1);
      let dx = k === 0 ? x - trail.x[j]! : trail.x[j]! - x;
      let dy = k === 0 ? y - trail.y[j]! : trail.y[j]! - y;
      const l = Math.hypot(dx, dy) || 1;
      dx /= l;
      dy /= l;
      const px = -dy;
      const py = dx;
      const sp = Math.min(1, Math.max(0, (trail.speed[i]! - MIN_TRAIL_SPEED) / (FULL_SPEED - MIN_TRAIL_SPEED)));
      const w = baseW * (0.35 + 0.65 * sp) * (0.3 + 0.7 * Math.sqrt(a));
      const o = k * VERTS;
      const z = -0.04;
      // aura: the full width; core: a third of it
      for (let v = 0; v < VERTS; v += 1) {
        aPos[(o + v) * 3] = x + px * w * AURA_K[v]!;
        aPos[(o + v) * 3 + 1] = y + py * w * AURA_K[v]!;
        aPos[(o + v) * 3 + 2] = z;
        cPos[(o + v) * 3] = x + px * w * CORE_K[v]!;
        cPos[(o + v) * 3 + 1] = y + py * w * CORE_K[v]!;
        cPos[(o + v) * 3 + 2] = z + 0.01;
      }
      // colours: a warm core drifting from pale gold to amber as it ages; the aura is amber at the heart, cyan on one side and magenta on the
      // other, each strongest a little in from the edge and clear at the edge itself (so it reads on cream and on navy alike)
      tmp.warm.copy(cols.white).lerp(cols.amber, (1 - a) * 0.7);
      tmp.mid.copy(cols.mid);
      const boost = Math.min(1, (0.95 + flash * 0.3) * Math.min(1, a * 1.25));
      const heart = Math.min(0.95, (0.88 + flash * 0.12) * a);
      const side = heart * 0.75;
      setColor(aCol, o, cols.cyan, 0);
      setColor(aCol, o + 1, cols.cyan, side);
      setColor(aCol, o + 2, tmp.mid, heart);
      setColor(aCol, o + 3, tmp.mid, heart);
      setColor(aCol, o + 4, cols.magenta, side);
      setColor(aCol, o + 5, cols.magenta, 0);
      setColor(cCol, o, tmp.warm, 0);
      setColor(cCol, o + 1, tmp.warm, boost * 0.8);
      setColor(cCol, o + 2, tmp.warm, boost);
      setColor(cCol, o + 3, tmp.warm, boost);
      setColor(cCol, o + 4, tmp.warm, boost * 0.8);
      setColor(cCol, o + 5, tmp.warm, 0);
    }
    kit.aura.pos.needsUpdate = kit.core.pos.needsUpdate = true;
    kit.aura.colr.needsUpdate = kit.core.colr.needsUpdate = true;
    kit.aura.geo.setDrawRange(0, (n - 1) * 30);
    kit.core.geo.setDrawRange(0, (n - 1) * 30);
  });
  return (
    <>
      <mesh geometry={kit.aura.geo} material={kit.auraMat} frustumCulled={false} renderOrder={5} />
      <mesh geometry={kit.core.geo} material={kit.coreMat} frustumCulled={false} renderOrder={6} />
      <mesh ref={head} geometry={kit.headGeo} material={kit.headMat} visible={false} renderOrder={5} />
    </>
  );
}
