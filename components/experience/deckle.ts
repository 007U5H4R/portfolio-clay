/**
 * deckle.ts (TKT-101) — deterministic torn / deckled paper outlines for the `/work` Experience timeline
 * (Tushar direction 2026-09-26). A verbatim copy of TKT-99's
 * `components/home/deckle.ts` / TKT-100's `components/timeline/deckle.ts` (parallel branches) — dedupe
 * into one shared module at merge. Pure
 * geometry: returns a CSS `polygon()` in percentages so the outline scales with its box; seeded, so
 * the server render is stable (no hydration drift).
 */

/** mulberry32 — a tiny seeded PRNG (0 ≤ n < 1). */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface DeckleOptions {
  /** Points along the top and bottom edges. */
  across?: number;
  /** Points along the left and right edges. */
  down?: number;
  /** Maximum tear depth into the box, as % of its width (left/right edges). */
  depthX?: number;
  /** Maximum tear depth into the box, as % of its height (top/bottom edges). */
  depthY?: number;
  /** Uniform inset added to every edge (% of the same axis) — for the inner face of a two-layer edge. */
  insetX?: number;
  insetY?: number;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/** A clockwise torn outline as a CSS `polygon(...)` string. */
export function deckle(seed: number, opts: DeckleOptions = {}): string {
  const { across = 16, down = 22, depthX = 2.4, depthY = 1.1, insetX = 0, insetY = 0 } = opts;
  const rand = rng(seed);
  // Mostly shallow bites with the odd deeper one — reads as a hand-torn, not a zig-zag, edge.
  const bite = (max: number) => {
    const r = rand();
    return max * (r < 0.8 ? r * 0.55 : 0.45 + r * 0.55);
  };
  const pts: string[] = [];
  const jitter = (step: number) => (rand() - 0.5) * step * 0.6;

  for (let i = 0; i <= across; i++) {
    const x = Math.min(100, Math.max(0, (i / across) * 100 + (i > 0 && i < across ? jitter(100 / across) : 0)));
    pts.push(`${r2(x)}% ${r2(insetY + bite(depthY))}%`);
  }
  for (let i = 1; i < down; i++) {
    const y = (i / down) * 100 + jitter(100 / down);
    pts.push(`${r2(100 - insetX - bite(depthX))}% ${r2(y)}%`);
  }
  for (let i = across; i >= 0; i--) {
    const x = Math.min(100, Math.max(0, (i / across) * 100 + (i > 0 && i < across ? jitter(100 / across) : 0)));
    pts.push(`${r2(x)}% ${r2(100 - insetY - bite(depthY))}%`);
  }
  for (let i = down - 1; i >= 1; i--) {
    const y = (i / down) * 100 + jitter(100 / down);
    pts.push(`${r2(insetX + bite(depthX))}% ${r2(y)}%`);
  }
  return `polygon(${pts.join(", ")})`;
}
