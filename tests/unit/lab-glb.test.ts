/**
 * TASK-143.5 — the gummy GLB contract the runtime relies on (gummy-bear.md §49 "3D assets"): node names,
 * the 15 morph targets, scale/orientation (1 unit tall, +Y up, base at the origin), the collider hull
 * sitting inside the render mesh's footprint, and the two material names the shader swaps.
 * Reads public/lab/gummy.glb directly (plain GLB, no Draco/meshopt) — no WebGL needed.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MORPH_NAMES } from "@/lib/lab/jelly";

interface Gltf {
  nodes: { name?: string; mesh?: number }[];
  meshes: { name?: string; primitives: { attributes: { POSITION: number }; targets?: unknown[]; material?: number }[]; extras?: { targetNames?: string[] } }[];
  accessors: { min?: number[]; max?: number[] }[];
  materials: { name?: string }[];
  animations?: unknown[];
}

function readGlb(): Gltf {
  const buf = readFileSync(resolve(process.cwd(), "public/lab/gummy.glb"));
  expect(buf.readUInt32LE(0)).toBe(0x46546c67); // "glTF"
  const jsonLen = buf.readUInt32LE(12);
  expect(buf.readUInt32LE(16)).toBe(0x4e4f534a); // "JSON"
  return JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8")) as Gltf;
}

describe("public/lab/gummy.glb", () => {
  const g = readGlb();
  const nodeMesh = (name: string) => g.meshes[g.nodes.find((n) => n.name === name)!.mesh!]!;
  const bounds = (meshIdx: number) => {
    const mins = [Infinity, Infinity, Infinity];
    const maxs = [-Infinity, -Infinity, -Infinity];
    for (const p of g.meshes[meshIdx]!.primitives) {
      const a = g.accessors[p.attributes.POSITION]!;
      for (let i = 0; i < 3; i += 1) {
        mins[i] = Math.min(mins[i]!, a.min![i]!);
        maxs[i] = Math.max(maxs[i]!, a.max![i]!);
      }
    }
    return { mins, maxs };
  };

  it("has the render mesh, the collider proxy and nothing the runtime does not expect", () => {
    const names = g.nodes.map((n) => n.name);
    expect(names).toContain("GummyBear");
    expect(names).toContain("GummyCollider");
    expect(g.animations ?? []).toHaveLength(0);
  });

  it("exposes exactly the 15 morph targets the jelly/expression drivers write to", () => {
    const names = nodeMesh("GummyBear").extras?.targetNames ?? [];
    expect([...names].sort()).toEqual([...MORPH_NAMES].sort());
    for (const prim of nodeMesh("GummyBear").primitives) expect(prim.targets).toHaveLength(15);
  });

  it("is 1 unit tall, +Y up, standing on the origin (so the body origin is the base centre)", () => {
    const idx = g.meshes.indexOf(nodeMesh("GummyBear"));
    const { mins, maxs } = bounds(idx);
    expect(mins[1]).toBeGreaterThan(-0.05);
    expect(mins[1]).toBeLessThan(0.05);
    expect(maxs[1]).toBeGreaterThan(0.95);
    expect(maxs[1]).toBeLessThan(1.1);
    // centred left/right and front/back around the origin
    expect(Math.abs((mins[0]! + maxs[0]!) / 2)).toBeLessThan(0.05);
  });

  it("the collider hull is aligned with the body and within its footprint (arms stay outside, by design)", () => {
    const body = bounds(g.meshes.indexOf(nodeMesh("GummyBear")));
    const hull = bounds(g.meshes.indexOf(nodeMesh("GummyCollider")));
    expect(hull.mins[1]).toBeGreaterThanOrEqual(body.mins[1]! - 0.02);
    expect(hull.maxs[1]).toBeLessThanOrEqual(body.maxs[1]! + 0.02);
    expect(hull.maxs[0]! - hull.mins[0]!).toBeLessThanOrEqual(body.maxs[0]! - body.mins[0]! + 0.02);
    expect(hull.maxs[0]! - hull.mins[0]!).toBeGreaterThan(0.4);
    expect(nodeMesh("GummyCollider").primitives[0]!.targets ?? []).toHaveLength(0);
  });

  it("names the two materials the web shader replaces", () => {
    const names = g.materials.map((m) => m.name);
    expect(names).toContain("GummyBody");
    expect(names).toContain("GummyFace");
  });

  it("stays small (the asset budget in TASK-143-asset.md)", () => {
    expect(readFileSync(resolve(process.cwd(), "public/lab/gummy.glb")).length).toBeLessThan(400 * 1024);
  });
});
