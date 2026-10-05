"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BallCollider, RigidBody } from "@react-three/rapier";
import {
  CanvasTexture,
  SRGBColorSpace,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Shape,
  SphereGeometry,
  TorusGeometry,
  type Material,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { Pickup, PickupKind } from "@/lib/lab/spawner";
import type { PowerUpType } from "@/lib/lab/engine";
import type { RGB } from "@/lib/lab/tokens";
import { col } from "./materials";
import { useRuntime } from "./runtime";

/**
 * Collectibles and power-ups (gummy-bear.md §21–23): rings, stars, rescue droplets and the power-up
 * "cards". The spawner decides what exists; this renders it (a handful of meshes, never hundreds) and
 * turns the bear overlapping a sensor into `hooks.pickup(id)`. React state changes only on
 * spawn/expire/collect — never per frame.
 */
const isPower = (k: PickupKind): k is PowerUpType => k !== "ring" && k !== "star" && k !== "droplet";

function starShape(r: number) {
  const s = new Shape();
  for (let i = 0; i < 10; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}

/** Draws a power-up glyph (lightning, feather, rainbow, star, clock) with the palette — no emoji, no fonts. */
function glyphTexture(kind: PowerUpType, ink: RGB, accent: RGB) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const css = (v: RGB) => `color(srgb ${v[0]} ${v[1]} ${v[2]})`;
  g.lineCap = g.lineJoin = "round";
  g.strokeStyle = css(ink);
  g.fillStyle = css(accent);
  g.lineWidth = 7;
  g.translate(64, 64);
  if (kind === "SUPER_SQUISH") {
    g.beginPath();
    g.moveTo(10, -44);
    g.lineTo(-22, 6);
    g.lineTo(0, 6);
    g.lineTo(-10, 44);
    g.lineTo(26, -10);
    g.lineTo(4, -10);
    g.closePath();
    g.fill();
    g.stroke();
  } else if (kind === "LOW_GRAVITY") {
    g.beginPath();
    g.moveTo(-30, 38);
    g.bezierCurveTo(-34, -10, 0, -46, 34, -40);
    g.bezierCurveTo(34, 0, 6, 36, -30, 38);
    g.closePath();
    g.fill();
    g.stroke();
    g.beginPath();
    g.moveTo(-34, 42);
    g.lineTo(8, -4);
    g.stroke();
  } else if (kind === "RAINBOW") {
    for (let i = 0; i < 3; i += 1) {
      g.beginPath();
      g.arc(0, 22, 40 - i * 13, Math.PI, 0);
      g.lineWidth = 8;
      g.strokeStyle = css(i === 1 ? accent : ink);
      g.stroke();
    }
  } else if (kind === "GOLDEN") {
    g.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const rad = i % 2 === 0 ? 46 : 20;
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      g[i === 0 ? "moveTo" : "lineTo"](Math.cos(a) * rad, Math.sin(a) * rad);
    }
    g.closePath();
    g.fill();
    g.stroke();
  } else {
    g.beginPath();
    g.arc(0, 0, 38, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.moveTo(0, -22);
    g.lineTo(0, 2);
    g.lineTo(18, 12);
    g.stroke();
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

interface Assets {
  ring: { geo: TorusGeometry; mat: Material };
  star: { geo: ExtrudeGeometry; mat: Material };
  droplet: { geo: SphereGeometry; mat: Material };
  card: { geo: RoundedBoxGeometry; mat: Material };
  glyphGeo: CylinderGeometry;
  glyphs: Record<PowerUpType, MeshBasicMaterial>;
  all: { dispose(): void }[];
}

function useAssets(): Assets {
  const rt = useRuntime();
  const assets = useMemo<Assets>(() => {
    const p = rt.palette;
    const ring = { geo: new TorusGeometry(0.36, 0.07, 12, 36), mat: new MeshStandardMaterial({ color: col(p.cyan), emissive: col(p.cyan), emissiveIntensity: 0.35, roughness: 0.25 }) };
    const star = {
      geo: new ExtrudeGeometry(starShape(0.34), { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }),
      mat: new MeshStandardMaterial({ color: col(p.gold), emissive: col(p.gold), emissiveIntensity: 0.45, roughness: 0.25 }),
    };
    const droplet = {
      geo: new SphereGeometry(0.2, 16, 12),
      mat: new MeshStandardMaterial({ color: col(p.orange), emissive: col(p.peach), emissiveIntensity: 0.4, roughness: 0.15, transparent: true, opacity: 0.88 }),
    };
    const card = { geo: new RoundedBoxGeometry(0.72, 0.72, 0.16, 3, 0.16), mat: new MeshStandardMaterial({ color: col(p.cream), emissive: col(p.peach), emissiveIntensity: 0.25, roughness: 0.3 }) };
    const glyphGeo = new CylinderGeometry(0.28, 0.28, 0.01, 1, 1); // placeholder (replaced by a plane below)
    const glyphs = Object.fromEntries(
      (["SUPER_SQUISH", "LOW_GRAVITY", "RAINBOW", "GOLDEN", "TIME_FREEZE"] as PowerUpType[]).map((k) => [
        k,
        new MeshBasicMaterial({ map: glyphTexture(k, p.face, k === "GOLDEN" ? p.gold : p.orange), transparent: true }),
      ]),
    ) as Record<PowerUpType, MeshBasicMaterial>;
    return { ring, star, droplet, card, glyphGeo, glyphs, all: [ring.geo, ring.mat, star.geo, star.mat, droplet.geo, droplet.mat, card.geo, card.mat, glyphGeo] };
  }, [rt]);
  useEffect(
    () => () => {
      assets.all.forEach((a) => a.dispose());
      Object.values(assets.glyphs).forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
    },
    [assets],
  );
  return assets;
}

function Item({ pickup, assets }: { pickup: Pickup; assets: Assets }) {
  const rt = useRuntime();
  const group = useRef<Group>(null);
  const born = useRef(0);
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    born.current += dt;
    const grow = Math.min(1, born.current / 0.3);
    const pop = grow < 1 ? 1 + Math.sin(grow * Math.PI) * 0.25 : 1;
    const blink = pickup.ttl < 2 ? (Math.sin(rt.time * 18) > 0 ? 1 : 0.35) : 1;
    const amp = rt.reducedMotion ? 0.3 : 1;
    g.scale.setScalar(grow * pop * (isPower(pickup.kind) ? 1 : 1) * blink);
    g.position.y = Math.sin(rt.time * 2.2 + pickup.id) * 0.08 * amp;
    if (pickup.kind === "ring" || pickup.kind === "star") g.rotation.y = rt.reducedMotion ? 0 : Math.sin(rt.time * 1.3 + pickup.id) * 0.6;
    if (isPower(pickup.kind)) g.rotation.z = Math.sin(rt.time * 2 + pickup.id) * 0.1 * amp;
  });
  return (
    <RigidBody type="fixed" colliders={false} position={[pickup.x, pickup.y, 0]}>
      <BallCollider
        args={[pickup.kind === "ring" ? 0.5 : 0.45]}
        sensor
        onIntersectionEnter={(p) => {
          if (p.other.rigidBodyObject?.name === "gummy") rt.hooks.pickup(pickup.id);
        }}
      />
      <group ref={group}>
        {pickup.kind === "ring" ? <mesh geometry={assets.ring.geo} material={assets.ring.mat} /> : null}
        {pickup.kind === "star" ? <mesh geometry={assets.star.geo} material={assets.star.mat} position={[0, 0, -0.06]} /> : null}
        {pickup.kind === "droplet" ? <mesh geometry={assets.droplet.geo} material={assets.droplet.mat} scale={[1, 1.35, 1]} /> : null}
        {isPower(pickup.kind) ? (
          <>
            <mesh geometry={assets.card.geo} material={assets.card.mat} />
            <mesh position={[0, 0, 0.09]} material={assets.glyphs[pickup.kind]}>
              <planeGeometry args={[0.52, 0.52]} />
            </mesh>
          </>
        ) : null}
      </group>
    </RigidBody>
  );
}

export function Pickups() {
  const rt = useRuntime();
  const assets = useAssets();
  const version = rt.store((s) => s.pickupsVersion);
  const items = useMemo(() => [...rt.spawner.items], [rt, version]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, rawDt) => {
    const machine = rt.store.getState().machine;
    if (!machine.running) {
      // Nothing lingers on the intro / results screens or after game over.
      if (rt.spawner.items.length > 0 && machine.state !== "PAUSED") {
        rt.spawner.reset();
        rt.store.getState().patch({ pickupsVersion: rt.store.getState().pickupsVersion + 1 });
      }
      return;
    }
    const snap = rt.engine.snapshot();
    const out = rt.spawner.update(Math.min(rawDt, 0.1) * rt.tune.spawn, snap.timeS, { inDanger: rt.bear.inDanger, bearX: rt.bear.x, bearY: rt.bear.y });
    if (out.spawned.length || out.expired.length) rt.store.getState().patch({ pickupsVersion: rt.store.getState().pickupsVersion + 1 });
  });

  // A new run starts with an empty arena.
  const runId = rt.store((s) => s.runId);
  useEffect(() => {
    rt.spawner.reset();
    rt.store.getState().patch({ pickupsVersion: rt.store.getState().pickupsVersion + 1 });
  }, [rt, runId]);

  return (
    <>
      {items.map((p) => (
        <Item key={p.id} pickup={p} assets={assets} />
      ))}
    </>
  );
}
