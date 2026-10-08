"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  CatmullRomCurve3,
  CircleGeometry,
  Color,
  CylinderGeometry,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  RingGeometry,
  Shape,
  ShapeGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { litSegments } from "@/lib/lab/plunger";
import { mix, type RGB } from "@/lib/lab/tokens";
import { col, createTintedPaper, tileUV } from "./materials";
import { cssColor, disposeAll, glowMaterial, glowTexture, neonColors, paintBoard, pineShapes, rng, sheet, shadowMaterial, shadowTextures, siteFont, textTexture } from "./paper-kit";
import { useRuntime } from "./runtime";

/**
 * The machine's static body (TASK-185): the painted table, the cardstock cabinet, the lit rails with their soft spill, the
 * launch lane's decor and power meter, the drain and the layered hills. Nothing here is physics (Arena.tsx owns every
 * collider and every moving part); it is all built once per mount from the site's role tokens, so it follows the theme.
 * The hierarchy is the spec's: paper first, light as an accent (§33).
 */
export const BOARD_Z = -0.62;
const SIDE = 0.55;

/** Collects everything a part builds so one effect can free it on unmount. */
function useKit<T extends object>(build: () => T): T {
  const [kit] = useState(build);
  useEffect(
    () => () => {
      for (const v of Object.values(kit)) disposeAll(Array.isArray(v) ? v : [v]);
    },
    [kit],
  );
  return kit;
}

const mixRGB = mix;

export function Machine() {
  return (
    <>
      <Board />
      <EdgeShadows />
      <Hills />
      <Cabinet />
      <Lights />
      <Lane />
      <DrainDecor />
      <PowerMeter />
    </>
  );
}

/** Where the cabinet sits, from the arena: the table, the lane beside it and the meter panel on the right. */
function useBounds() {
  const rt = useRuntime();
  const { arena } = rt;
  return useMemo(() => {
    const panel = arena.panel;
    return { hw: arena.halfW, lane: arena.lane, ceil: arena.ceilingY, bottom: -6.5, panel, right: arena.lane.xOut + panel, left: -arena.halfW - SIDE };
  }, [arena]);
}

/* ---------------------------------------------------------------------------------------------------------------- */

function Board() {
  const rt = useRuntime();
  const b = useBounds();
  const kit = useKit(() => {
    const x0 = -b.hw;
    const w = b.lane.xOut + b.hw;
    const y0 = b.bottom;
    const h = b.ceil + 0.1 - y0;
    const tex = paintBoard(rt.palette, { x0, y0, w, h });
    const geo = new PlaneGeometry(w, h);
    const mat = new MeshStandardMaterial({ map: tex, roughness: 0.96, metalness: 0, envMapIntensity: 0.3 });
    const laneGeo = new PlaneGeometry(b.lane.xOut - b.lane.xIn, h);
    const laneMat = new MeshBasicMaterial({ color: col(mixRGB(rt.palette.tok.terracotta, rt.palette.tok.paper, 0.35)), transparent: true, opacity: 0.32, depthWrite: false });
    return { tex, geo, mat, laneGeo, laneMat, x: x0 + w / 2, y: y0 + h / 2 };
  });
  return (
    <>
      <mesh geometry={kit.geo} material={kit.mat} position={[kit.x, kit.y, BOARD_Z]} />
      <mesh geometry={kit.laneGeo} material={kit.laneMat} position={[(b.lane.xIn + b.lane.xOut) / 2, kit.y, BOARD_Z + 0.01]} />
    </>
  );
}

/* ---------------------------------------------------------------------------------------------------------------- */

/** Ambient occlusion where the table meets its walls: soft shadow strips falling to the lower right of the upper-left key light. */
function EdgeShadows() {
  const rt = useRuntime();
  const { arena } = rt;
  const kit = useKit(() => {
    const { edge } = shadowTextures();
    const strength = rt.palette.isDark ? 0.55 : 0.4;
    const mat = shadowMaterial(edge, strength);
    const w = 0.95;
    const h = arena.ceilingY + 6.3;
    const geoV = new PlaneGeometry(w, h);
    const geoH = new PlaneGeometry(w, arena.halfW * 2 + 2);
    return { edge, mat, geoV, geoH, h };
  });
  const lane = arena.lane;
  const hw = arena.halfW;
  const cy = (arena.ceilingY - 6.3) / 2;
  return (
    <group>
      {/* inside the left wall, falling to its right */}
      <mesh geometry={kit.geoV} material={kit.mat} position={[-hw + 0.475, cy, BOARD_Z + 0.02]} renderOrder={1} />
      {/* under the top rail, falling down (the gradient is turned a quarter) */}
      <mesh geometry={kit.geoH} material={kit.mat} position={[0, arena.ceilingY - 0.475, BOARD_Z + 0.02]} rotation-z={-Math.PI / 2} scale={[1, 1, 1]} renderOrder={1} />
      {/* in the lane, right of the divider */}
      <mesh geometry={kit.geoV} material={kit.mat} position={[lane.xIn + 0.475, cy, BOARD_Z + 0.03]} renderOrder={1} />
    </group>
  );
}

/* ---------------------------------------------------------------------------------------------------------------- */

/** Layered cut-paper hills and pines in the corners the gameplay never reaches (below the in-lane guides). */
function Hills() {
  const rt = useRuntime();
  const { arena, palette } = rt;
  const tok = palette.tok;
  const kit = useKit(() => {
    const rand = rng(7);
    const hw = arena.halfW;
    const depth = 0.12;
    const tint = (c: RGB, t: number) => mixRGB(c, tok.ivory, t);
    const mats = {
      far: createTintedPaper(tint(tok.steel, 0.35)),
      mid: createTintedPaper(tint(tok.sage, 0.25)),
      near: createTintedPaper(tint(tok.terracotta, 0.2)),
      rust: createTintedPaper(tint(tok.rust, 0.28)),
    };
    // A ridge polygon filling a corner: jagged top edge between two points, down to a floor line.
    const ridge = (x1: number, y1: number, x2: number, y2: number, floorY: number, peaks: number, amp: number) => {
      const s = new Shape();
      s.moveTo(x1, floorY);
      s.lineTo(x1, y1);
      for (let i = 1; i <= peaks * 2; i += 1) {
        const t = i / (peaks * 2);
        const px = x1 + (x2 - x1) * t;
        const py = y1 + (y2 - y1) * t + (i % 2 === 1 ? amp * (0.6 + rand() * 0.5) : -amp * 0.1 * rand());
        s.lineTo(px, py);
      }
      s.lineTo(x2, floorY);
      s.closePath();
      return sheet(s, depth, 0.02);
    };
    const bottom = -6.0;
    const geos = {
      lFar: ridge(-hw, -1.4, -2.2, -3.6, bottom, 3, 0.8),
      lNear: ridge(-hw, -2.5, -2.4, -4.4, bottom, 3, 0.7),
      rFar: ridge(hw, -1.4, 2.2, -3.6, bottom, 3, 0.8),
      rNear: ridge(hw, -2.5, 2.4, -4.4, bottom, 3, 0.7),
      mid: ridge(-1.9, -4.6, 1.9, -4.6, bottom, 2, 0.5),
    };
    // pines: three stacked sheets each, merged into one geometry and instanced
    const layers = pineShapes(0.62, 0.92).map((s, i) => {
      const g = sheet(s, 0.04, 0.012);
      g.translate(0, 0, i * 0.05);
      return g;
    });
    const pine = mergeGeometries(layers.map((g) => g.toNonIndexed()), false)!;
    layers.forEach((g) => g.dispose());
    const pineMat = new MeshStandardMaterial({ roughness: 0.95, metalness: 0, envMapIntensity: 0.3 });
    const spots: { x: number; y: number; s: number; z: number }[] = [];
    const add = (x: number, y: number, s: number, z: number) => spots.push({ x, y, s, z });
    // bottom-left hills
    [[-4.6, -3.3, 0.9], [-4.1, -3.9, 1.1], [-3.5, -4.55, 0.85], [-4.8, -4.6, 1.0], [-3.0, -5.1, 0.8], [-4.3, -5.2, 0.9]].forEach(([x, y, s]) => add(x!, y!, s!, -0.46));
    [[4.6, -3.3, 0.9], [4.1, -3.9, 1.1], [3.5, -4.55, 0.85], [4.8, -4.6, 1.0], [3.0, -5.1, 0.8], [4.3, -5.2, 0.9]].forEach(([x, y, s]) => add(x!, y!, s!, -0.46));
    // between the drain and the flippers' hubs
    [[-1.7, -5.0, 0.6], [1.7, -5.0, 0.6]].forEach(([x, y, s]) => add(x!, y!, s!, -0.46));
    // a few on the open table, tucked behind everything (z -0.55): the paper-cut world reads as a place
    [[-4.2, 5.3, 0.8], [-3.6, 4.7, 0.65], [-4.55, 4.4, 0.7], [-1.5, 5.4, 0.55], [1.5, 5.45, 0.6], [-3.9, 0.1, 0.55], [3.9, -0.1, 0.6]].forEach(([x, y, s]) => add(x!, y!, s!, -0.55));
    const greens: RGB[] = [mixRGB(tok.forest, tok.sage, 0.25), mixRGB(tok.forest, tok.sage, 0.55), mixRGB(tok.sage, tok.forest, 0.8)];
    return { mats, ...geos, pine, pineMat, spots, greens };
  });
  const inst = useRef<InstancedMesh>(null);
  useEffect(() => {
    const m = inst.current;
    if (!m) return;
    const o = new Object3D();
    const c = new Color();
    kit.spots.forEach((s, i) => {
      o.position.set(s.x, s.y, s.z);
      o.scale.set(s.s, s.s, 1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      c.copy(col(kit.greens[i % kit.greens.length]!));
      m.setColorAt(i, c);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [kit]);
  return (
    <group>
      <mesh geometry={kit.lFar} material={kit.mats.far} position={[0, 0, -0.6]} />
      <mesh geometry={kit.rFar} material={kit.mats.far} position={[0, 0, -0.6]} />
      <mesh geometry={kit.lNear} material={kit.mats.near} position={[0, 0, -0.52]} />
      <mesh geometry={kit.rNear} material={kit.mats.near} position={[0, 0, -0.52]} />
      <mesh geometry={kit.mid} material={kit.mats.rust} position={[0, 0, -0.5]} />
      <instancedMesh ref={inst} args={[kit.pine, kit.pineMat, kit.spots.length]} frustumCulled={false} />
    </group>
  );
}

/* ---------------------------------------------------------------------------------------------------------------- */

/** The cardstock cabinet: thick side rails, a top rail and a bottom apron that hides the drain, with a few brass pins. */
function Cabinet() {
  const rt = useRuntime();
  const b = useBounds();
  const tok = rt.palette.tok;
  const kit = useKit(() => {
    const cab = createTintedPaper(mixRGB(tok.rust, tok.ivory, 0.14), { lift: 0.06 });
    const cabDark = createTintedPaper(mixRGB(tok.rust, tok.terracotta, 0.55), { lift: 0.04 });
    const trim = createTintedPaper(mixRGB(tok.kraft, tok.ivory, 0.35));
    const pin = new MeshStandardMaterial({ color: col(mixRGB(tok.kraft, tok.ivory, 0.5)), metalness: 0.7, roughness: 0.35, envMapIntensity: 0.9 });
    const box = (w: number, h: number, d: number, r = 0.07) => {
      const g = new RoundedBoxGeometry(w, h, d, 3, r);
      tileUV(g, w, h);
      return g;
    };
    const heightAll = b.ceil + 0.45 - b.bottom;
    const cy = b.bottom + heightAll / 2;
    const left = box(SIDE, heightAll, 1.5);
    const rightW = b.right - b.lane.xOut + 0.1;
    const right = box(rightW, heightAll, 1.5);
    const topW = b.right - b.left + 0.2;
    const top = box(topW, 0.45, 1.5);
    const apronW = b.lane.xIn - b.left + 0.1;
    const apron = box(apronW, 1.05, 1.45);
    const divider = box(0.28, b.lane.dividerTop + 5.9, 1.15, 0.08);
    const outerLip = box(0.3, 0.3, 1.0, 0.08);
    const pinGeo = new CylinderGeometry(0.07, 0.07, 0.06, 10);
    const trimGeo = box(0.12, 0.12, 0.2, 0.04);
    return { cab, cabDark, trim, pin, left, right, top, apron, divider, outerLip, pinGeo, trimGeo, cy, rightW, topW, apronW, heightAll };
  });
  const lane = b.lane;
  const pins = useMemo(() => {
    const out: [number, number][] = [];
    for (let y = -5.4; y <= b.ceil; y += 2.4) out.push([b.left + SIDE / 2, y], [lane.xOut + kit.rightW / 2 - 0.05, y]);
    return out;
  }, [b, lane, kit.rightW]);
  const pinMesh = useRef<InstancedMesh>(null);
  useEffect(() => {
    const m = pinMesh.current;
    if (!m) return;
    const o = new Object3D();
    o.rotation.x = Math.PI / 2;
    pins.forEach(([x, y], i) => {
      o.position.set(x, y, 0.78);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [pins]);
  return (
    <group>
      <mesh geometry={kit.left} material={kit.cab} position={[b.left + SIDE / 2, kit.cy, 0]} />
      <mesh geometry={kit.right} material={kit.cab} position={[lane.xOut + kit.rightW / 2 - 0.1, kit.cy, 0]} />
      <mesh geometry={kit.top} material={kit.cab} position={[(b.left + b.right) / 2, b.ceil + 0.225, 0]} />
      <mesh geometry={kit.apron} material={kit.cabDark} position={[b.left - 0.1 + kit.apronW / 2, -5.55, 0.05]} />
      {/* the lane's divider: paper with a kraft cap, standing proud of the table */}
      <mesh geometry={kit.divider} material={kit.trim} position={[b.hw + 0.11, (lane.dividerTop - 5.9) / 2, 0]} />
      {/* brass pins: one instanced draw */}
      <instancedMesh ref={pinMesh} args={[kit.pinGeo, kit.pin, pins.length]} frustumCulled={false} />
    </group>
  );
}

/* ---------------------------------------------------------------------------------------------------------------- */

/** One lit run: a polyline for the tube (z fixed) and a colour ramp along it. */
interface Run {
  pts: [number, number][];
  z: number;
  radius: number;
  ramp: (t: number) => Color;
}

function tubePair(run: Run, halo: number, seg = 48) {
  const pts = run.pts.map(([x, y]) => new Vector3(x, y, run.z));
  const curve = new CatmullRomCurve3(pts, false, "catmullrom", 0.0);
  const make = (r: number) => {
    const g = new TubeGeometry(curve, seg, r, 6, false);
    const n = g.getAttribute("position").count;
    const colors = new Float32Array(n * 3);
    const ring = 7; // radialSegments + 1
    for (let i = 0; i < n; i += 1) {
      const t = Math.floor(i / ring) / seg;
      const c = run.ramp(t);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new Float32BufferAttribute(colors, 3));
    return g;
  };
  return { core: make(run.radius), halo: make(run.radius * halo) };
}

/**
 * The lit rails (spec §5): a small embedded light tube beside each paper rail, a soft bloom around it, and a few wide
 * additive sprites on the paper nearby so the glow spills onto the cardstock. Static: the light is a persistent accent.
 */
function Lights() {
  const rt = useRuntime();
  const { arena, palette } = rt;
  const neon = useMemo(() => neonColors(palette), [palette]);
  const kit = useKit(() => {
    const hw = arena.halfW;
    const lane = arena.lane;
    const amber = neon.amber.clone();
    const cyan = neon.cyan.clone();
    const magenta = neon.magenta.clone();
    const warm = neon.white.clone().lerp(neon.amber, 0.4);
    const ramp2 = (a: Color, c: Color, from = 0, to = 1) => (t: number) => new Color().copy(a).lerp(c, Math.min(1, Math.max(0, (t - from) / (to - from))));
    const runs: Run[] = [];
    const Z = 0.56;
    // The arch: up the lane's outer wall, round the top bend and a little way along the ceiling; amber, fading through magenta at the far end.
    const { cx: archCx, cy: archCy, r: archR } = lane.arch;
    const archPts: [number, number][] = [[lane.xOut - 0.14, -4.4], [lane.xOut - 0.14, archCy]];
    for (let i = 1; i <= 10; i += 1) {
      const a = (i / 10) * (Math.PI / 2);
      archPts.push([archCx + (archR - 0.14) * Math.cos(a), archCy + (archR - 0.14) * Math.sin(a)]);
    }
    archPts.push([archCx - 1.2, archCy + archR - 0.14]);
    runs.push({ pts: archPts, z: Z, radius: 0.05, ramp: (t) => ramp2(amber, magenta, 0.7, 1)(t) });
    // The lane's own guide: a cool line up the divider's lane side ("illuminated guide").
    runs.push({ pts: [[lane.xIn + 0.1, -4.9], [lane.xIn + 0.1, lane.dividerTop - 0.05]], z: Z - 0.1, radius: 0.04, ramp: ramp2(cyan, cyan) });
    // Left and right walls of the table, and the corner deflector
    runs.push({ pts: [[-hw + 0.16, -1.9], [-hw + 0.16, arena.ceilingY - 1.75], [-hw + 1.7 - 0.05, arena.ceilingY - 0.3]], z: Z - 0.04, radius: 0.04, ramp: ramp2(amber, cyan, 0.55, 1) });
    // The in-lane guides, down to the flippers
    for (const g of arena.guides) {
      runs.push({ pts: [[g.x1 + (g.x1 < 0 ? 0.1 : -0.1), g.y1 + 0.17], [g.x2, g.y2 + 0.17]], z: Z - 0.06, radius: 0.036, ramp: ramp2(warm, amber) });
    }
    const pairs = runs.map((r) => tubePair(r, 3.4));
    const core = mergeGeometries(pairs.map((p) => p.core), false)!;
    const haloG = mergeGeometries(pairs.map((p) => p.halo), false)!;
    pairs.forEach((p) => {
      p.core.dispose();
      p.halo.dispose();
    });
    const coreMat = new MeshBasicMaterial({ vertexColors: true, toneMapped: false });
    const haloMat = new MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.16, blending: AdditiveBlending, depthWrite: false, toneMapped: false });
    // spill on the paper beside the lights
    const tex = glowTexture(128, 2.4);
    const spillGeo = new PlaneGeometry(1, 1);
    const spillMats = { amber: glowMaterial(amber, tex, 0.2), cyan: glowMaterial(cyan, tex, 0.2), magenta: glowMaterial(magenta, tex, 0.2) };
    const spills: { x: number; y: number; s: number; k: keyof typeof spillMats }[] = [
      { x: lane.x, y: -1.5, s: 3.2, k: "amber" },
      { x: lane.x, y: 2.8, s: 3.0, k: "amber" },
      { x: lane.arch.cx + 0.6, y: lane.arch.cy + 2.4, s: 3.6, k: "magenta" },
      { x: lane.arch.cx - 1.5, y: lane.arch.cy + 2.8, s: 3.2, k: "amber" },
      { x: -hw + 0.7, y: 1.2, s: 3.4, k: "amber" },
      { x: -hw + 1.2, y: arena.ceilingY - 1.2, s: 3.0, k: "cyan" },
      { x: -hw + 0.9, y: -2.4, s: 3.0, k: "amber" },
      { x: hw - 0.9, y: -2.5, s: 3.0, k: "amber" },
    ];
    return { core, haloG, coreMat, haloMat, tex, spillGeo, spillMats, spills, extra: [spillMats.amber, spillMats.cyan, spillMats.magenta] };
  });
  return (
    <group>
      <mesh geometry={kit.haloG} material={kit.haloMat} renderOrder={4} />
      <mesh geometry={kit.core} material={kit.coreMat} renderOrder={4} />
      {/* the glow that spills onto the paper is the first thing a weak phone drops (large, soft, additive overdraw) */}
      {rt.tier.tier === "low"
        ? null
        : kit.spills.map((s, i) => <mesh key={i} geometry={kit.spillGeo} material={kit.spillMats[s.k]} position={[s.x, s.y, -0.5]} scale={[s.s, s.s, 1]} renderOrder={1} />)}
    </group>
  );
}

/* ---------------------------------------------------------------------------------------------------------------- */

/** The launch lane's chevrons: dim by default, they run up the lane in a sweep when the plunger fires (spec §17). */
function Lane() {
  const rt = useRuntime();
  const { arena, palette } = rt;
  const neon = useMemo(() => neonColors(palette), [palette]);
  const N = 5;
  const kit = useKit(() => {
    const s = new Shape();
    s.moveTo(-0.34, -0.12);
    s.lineTo(0, 0.2);
    s.lineTo(0.34, -0.12);
    s.lineTo(0.34, -0.3);
    s.lineTo(0, 0.02);
    s.lineTo(-0.34, -0.3);
    s.closePath();
    const geo = new ShapeGeometry(s);
    const mats = Array.from({ length: N }, () => new MeshBasicMaterial({ color: neon.amber.clone(), transparent: true, opacity: 0.25, depthWrite: false, toneMapped: false }));
    return { geo, mats };
  });
  const ys = useMemo(() => Array.from({ length: N }, (_, i) => -2.3 + i * 1.35), []);
  useFrame(() => {
    const t = rt.sinceLaunch;
    const reduced = rt.reducedMotion;
    const charge = rt.plunger.progress;
    for (let i = 0; i < N; i += 1) {
      // idle: a faint glow that follows the charge from the bottom up; launch: a quick sweep up the lane
      let lit = 0.2 + (rt.plunger.charging && charge > (i + 1) / (N + 1) ? 0.4 : 0);
      if (!reduced && t < 0.7) {
        const local = t - i * 0.07;
        if (local > 0 && local < 0.3) lit = Math.max(lit, 1 - local / 0.3);
      } else if (reduced && t < 0.4) lit = Math.max(lit, 0.8);
      kit.mats[i]!.opacity = Math.min(1, lit);
      kit.mats[i]!.color.copy(neon.amber).lerp(neon.white, lit > 0.7 ? (lit - 0.7) * 2 : 0);
    }
  });
  return (
    <group position={[arena.lane.x, 0, BOARD_Z + 0.04]}>
      {ys.map((y, i) => (
        <mesh key={i} geometry={kit.geo} material={kit.mats[i]!} position={[0, y, 0]} />
      ))}
    </group>
  );
}

/* ---------------------------------------------------------------------------------------------------------------- */

/** The drain (spec §22): a recessed, layered hole in a paper plate, a dark throat and a thread of amber light at the bottom. */
function DrainDecor() {
  const rt = useRuntime();
  const { arena, palette } = rt;
  const tok = palette.tok;
  const neon = useMemo(() => neonColors(palette), [palette]);
  const kit = useKit(() => {
    const plateShape = new Shape();
    plateShape.moveTo(-2.9, -3.55);
    plateShape.lineTo(2.9, -3.55);
    plateShape.lineTo(0.9, -5.4);
    plateShape.lineTo(-0.9, -5.4);
    plateShape.closePath();
    const plate = sheet(plateShape, 0.08, 0.02);
    const plateMat = createTintedPaper(mixRGB(tok.terracotta, tok.ivory, 0.18), { lift: 0.04 });
    const R = 0.8;
    const rim = new TorusGeometry(R, 0.075, 8, 40);
    const rimMat = createTintedPaper(mixRGB(tok.kraft, tok.ivory, 0.45));
    const throat = new CircleGeometry(R - 0.03, 40);
    const throatMat = new MeshBasicMaterial({ color: col(mixRGB(tok.navy, [0, 0, 0] as RGB, 0.55)) });
    const rings = [0.62, 0.47, 0.33, 0.19].map((r, i) => {
      const g = new RingGeometry(r - 0.045, r, 36);
      const m = new MeshBasicMaterial({ color: neon.amber.clone().multiplyScalar(0.25 + i * 0.1), transparent: true, opacity: 0.5 + i * 0.1, depthWrite: false, toneMapped: false });
      return { g, m };
    });
    const tex = glowTexture(128, 1.8);
    const glowGeo = new PlaneGeometry(3.2, 3.2);
    const glowMat = glowMaterial(neon.amber, tex, 0.34);
    const shadowGeo = new CircleGeometry(1.0, 32);
    const shadowMat = new MeshBasicMaterial({ color: col(mixRGB(tok.navy, [0, 0, 0] as RGB, 0.4)), transparent: true, opacity: 0.3, depthWrite: false });
    return { plate, plateMat, rim, rimMat, throat, throatMat, rings, tex, glowGeo, glowMat, shadowGeo, shadowMat, extra: rings.flatMap((r) => [r.g, r.m]) };
  });
  const { x, y } = arena.drain;
  return (
    <group>
      <mesh geometry={kit.plate} material={kit.plateMat} position={[0, 0, BOARD_Z + 0.02]} />
      <mesh geometry={kit.shadowGeo} material={kit.shadowMat} position={[x, y, BOARD_Z + 0.12]} scale={[1.15, 1.0, 1]} />
      <mesh geometry={kit.throat} material={kit.throatMat} position={[x, y, BOARD_Z + 0.16]} />
      {kit.rings.map((r, i) => (
        <mesh key={i} geometry={r.g} material={r.m} position={[x, y - i * 0.03, BOARD_Z + 0.17 + i * 0.002]} />
      ))}
      <mesh geometry={kit.rim} material={kit.rimMat} position={[x, y, BOARD_Z + 0.2]} />
      <mesh geometry={kit.glowGeo} material={kit.glowMat} position={[x, y, BOARD_Z + 0.3]} renderOrder={2} />
    </group>
  );
}

/* ---------------------------------------------------------------------------------------------------------------- */

/** The launch-power meter (spec §16): a plaque on the cabinet beside the plunger with eight lamps that fill from the bottom. */
function PowerMeter() {
  const rt = useRuntime();
  const { arena, palette } = rt;
  const b = useBounds();
  const tok = palette.tok;
  const neon = useMemo(() => neonColors(palette), [palette]);
  const SEG = 8;
  const group = useRef<Group>(null);
  const plateW = b.panel - 0.18;
  const plateH = 4.7;
  const kit = useKit(() => {
    const plate = new RoundedBoxGeometry(plateW, plateH, 0.16, 3, 0.07);
    tileUV(plate, plateW, plateH);
    const plateMat = createTintedPaper(mixRGB(tok.ivory, tok.kraft, 0.3));
    const well = new RoundedBoxGeometry(plateW * 0.62, SEG * 0.3 + 0.2, 0.05, 2, 0.04);
    const wellMat = new MeshStandardMaterial({ color: col(mixRGB(tok.navy, tok.paper, rt.palette.isDark ? 0.5 : 0.1)), roughness: 0.9, metalness: 0 });
    const lampGeo = new RoundedBoxGeometry(plateW * 0.5, 0.2, 0.08, 2, 0.04);
    const ramp = (i: number) => new Color().copy(neon.amber).lerp(neon.magenta, Math.max(0, (i - 4) / (SEG - 4)) * 0.85);
    const lamps = Array.from({ length: SEG }, (_, i) => {
      const m = new MeshBasicMaterial({ color: ramp(i).clone(), toneMapped: false });
      return { m, on: ramp(i).clone(), off: col(mixRGB(tok.navy, tok.paper, 0.45)).multiplyScalar(0.9) };
    });
    const label = textTexture(256, 96, (g, w, h) => {
      g.textAlign = "center";
      g.fillStyle = cssColor(tok.navy);
      g.font = `700 46px ${siteFont("body")}`;
      g.fillText("LAUNCH", w / 2, h * 0.42);
      g.fillText("POWER", w / 2, h * 0.9);
    });
    const labelGeo = new PlaneGeometry(plateW * 0.95, (plateW * 0.95 * 96) / 256);
    const labelMat = new MeshBasicMaterial({ map: label.tex, transparent: true, toneMapped: false });
    const pctState = { text: "" };
    const pct = textTexture(256, 96, (g, w, h) => {
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillStyle = cssColor(tok.navy);
      g.font = `700 ${pctState.text.length > 3 ? 58 : 66}px ${siteFont("display")}`;
      g.fillText(pctState.text || "0%", w / 2, h * 0.52);
    });
    const pctGeo = new PlaneGeometry(plateW * 0.95, (plateW * 0.95 * 96) / 256);
    const pctMat = new MeshBasicMaterial({ map: pct.tex, transparent: true, toneMapped: false });
    const screwGeo = new CylinderGeometry(0.06, 0.06, 0.05, 10);
    const screwMat = new MeshStandardMaterial({ color: col(mixRGB(tok.kraft, tok.ivory, 0.5)), metalness: 0.7, roughness: 0.35 });
    const tex = glowTexture(128, 2.2);
    const spillGeo = new PlaneGeometry(2.4, 4.4);
    const spillMat = glowMaterial(neon.amber, tex, 0);
    return { plate, plateMat, well, wellMat, lampGeo, lamps, label, labelGeo, labelMat, pct, pctGeo, pctMat, pctState, screwGeo, screwMat, tex, spillGeo, spillMat, extra: lamps.map((l) => l.m) };
  });
  const cx = arena.lane.xOut + b.panel / 2 - 0.05;
  const cy = -1.55;
  const lastPct = useRef(-1);
  const lastMax = useRef(false);
  useFrame(() => {
    const p = rt.plunger;
    // The meter reads the live charge; after a release it holds the launched value for a beat so the eye can read it.
    const progress = p.meter;
    const lit = litSegments(progress, SEG);
    for (let i = 0; i < SEG; i += 1) {
      const l = kit.lamps[i]!;
      l.m.color.copy(i < lit ? l.on : l.off);
    }
    const pctInt = Math.round(progress * 100);
    const isMax = progress >= 0.995;
    if (pctInt !== lastPct.current || isMax !== lastMax.current) {
      lastPct.current = pctInt;
      lastMax.current = isMax;
      kit.pctState.text = isMax ? "MAX" : `${pctInt}%`;
      kit.pct.redraw();
    }
    // MAX POWER: a restrained pulse (a slow ±6% swell of the lamps' brightness), none under reduced motion
    const k = isMax && p.charging && !rt.reducedMotion ? 1 + Math.sin(rt.time * 9) * 0.06 : 1;
    if (group.current) group.current.scale.setScalar(k > 1 ? 1 : 1);
    for (let i = 0; i < SEG; i += 1) if (i < lit) kit.lamps[i]!.m.color.multiplyScalar(k);
    kit.spillMat.opacity = 0.34 * progress * (p.charging ? 1 : 0.6);
  });
  // top to bottom: the label, the well of lamps, the percentage. The lamps are measured from the well's centre.
  const WELL_Y = 0.12;
  const lampY = (i: number) => WELL_Y - 0.95 + i * 0.3;
  return (
    <group ref={group} position={[cx, cy, 0.78]}>
      <mesh geometry={kit.spillGeo} material={kit.spillMat} position={[0, 0.2, 0.04]} renderOrder={3} />
      <mesh geometry={kit.plate} material={kit.plateMat} />
      <mesh geometry={kit.labelGeo} material={kit.labelMat} position={[0, plateH / 2 - 0.42, 0.09]} />
      <mesh geometry={kit.well} material={kit.wellMat} position={[0, WELL_Y, 0.1]} />
      {kit.lamps.map((l, i) => (
        <mesh key={i} geometry={kit.lampGeo} material={l.m} position={[0, lampY(i), 0.14]} />
      ))}
      <mesh geometry={kit.pctGeo} material={kit.pctMat} position={[0, -plateH / 2 + 0.5, 0.09]} />
      {[
        [-1, 1],
        [1, 1],
        [-1, -1],
        [1, -1],
      ].map(([sx, sy], i) => (
        <mesh key={i} geometry={kit.screwGeo} material={kit.screwMat} position={[sx! * (plateW / 2 - 0.12), sy! * (plateH / 2 - 0.12), 0.1]} rotation-x={Math.PI / 2} />
      ))}
    </group>
  );
}
