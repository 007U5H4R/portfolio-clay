/**
 * The Gummy Lab boot lifecycle (TASK-198): which real loading milestones have happened, and the honest 0–100 progress
 * and stage they map to. Pure and DOM-free so the mapper is unit-testable; the loader only renders what this reports.
 *
 * Nothing here is timer-driven. Every input is something the boot actually did: GLB bytes received, the canvas created,
 * Rapier's WASM initialised (the physics world mounted), the model parsed (or failed over to the procedural body) and
 * the first rendered frame with the world in it.
 */

export interface BootInputs {
  /** GLB bytes received as a 0–1 fraction, or `null` while the size is unknown (indeterminate, never guessed). */
  glb: number | null;
  /** The GLB request has finished (success or failure). */
  glbDone: boolean;
  /** R3F created the WebGL canvas. */
  canvas: boolean;
  /** Rapier's WASM is initialised and the physics world mounted. */
  physics: boolean;
  /** The model parsed (or failed over to the fallback body): the asset is settled either way. */
  model: boolean;
  /** The first frame was rendered with the world in it. */
  frame: boolean;
}

export const BOOT_START: BootInputs = { glb: null, glbDone: false, canvas: false, physics: false, model: false, frame: false };

/** Points each milestone is worth; they sum to exactly 100. */
export const BOOT_WEIGHTS = { base: 5, glb: 35, canvas: 10, physics: 20, model: 15, frame: 15 } as const;

export const BOOT_STAGES = ["Loading assets", "Building world", "Calibrating physics", "Almost there…"] as const;

export const bootReady = (i: BootInputs): boolean => i.glbDone && i.canvas && i.physics && i.model && i.frame;

/**
 * The progress the inputs justify, 0–100. Monotone in every input, and 100 only once the boot is genuinely ready: the
 * "in flight" GLB share is capped below its full weight (a compressed response can report more bytes than its length).
 */
export function bootProgress(i: BootInputs): number {
  const w = BOOT_WEIGHTS;
  const glbShare = i.glbDone ? 1 : Math.min(0.97, Math.max(0, i.glb ?? 0));
  const p = w.base + w.glb * glbShare + (i.canvas ? w.canvas : 0) + (i.physics ? w.physics : 0) + (i.model ? w.model : 0) + (i.frame ? w.frame : 0);
  return bootReady(i) ? 100 : Math.min(99, Math.floor(p));
}

/** Index into BOOT_STAGES of the first stage still incomplete (never moves backwards: inputs only ever complete). */
export function bootStage(i: BootInputs): number {
  if (!i.glbDone) return 0;
  if (!i.canvas) return 1;
  if (!i.physics) return 2;
  return 3;
}

export interface BootSnapshot extends BootInputs {
  /** Displayed progress: never decreases. */
  progress: number;
  stage: number;
  ready: boolean;
  /** Set when GLB loading failed (the lab still boots on the procedural body). */
  glbFailed: boolean;
}

export type BootMark = "canvas" | "physics" | "model" | "frame";

export interface BootTracker {
  get(): BootSnapshot;
  subscribe(fn: () => void): () => void;
  mark(m: BootMark): void;
  glbProgress(received: number, total: number | null): void;
  glbFinished(ok: boolean): void;
}

function snap(prev: BootSnapshot | null, i: BootInputs, glbFailed: boolean): BootSnapshot {
  const progress = Math.max(prev?.progress ?? 0, bootProgress(i));
  const stage = Math.max(prev?.stage ?? 0, bootStage(i));
  return { ...i, progress, stage, ready: bootReady(i), glbFailed };
}

export function createBoot(): BootTracker {
  let inputs: BootInputs = BOOT_START;
  let glbFailed = false;
  let cur = snap(null, inputs, glbFailed);
  const subs = new Set<() => void>();
  const set = (next: BootInputs) => {
    inputs = next;
    const s = snap(cur, inputs, glbFailed);
    // A byte tick that doesn't move the integer percent is not worth a re-render.
    if (s.progress === cur.progress && s.stage === cur.stage && s.ready === cur.ready && s.glbFailed === cur.glbFailed && s.glbDone === cur.glbDone && s.canvas === cur.canvas && s.physics === cur.physics && s.model === cur.model && s.frame === cur.frame) return;
    cur = s;
    subs.forEach((f) => f());
  };
  return {
    get: () => cur,
    subscribe(fn) {
      subs.add(fn);
      return () => void subs.delete(fn);
    },
    mark: (m) => set({ ...inputs, [m]: true }),
    glbProgress: (received, total) => set({ ...inputs, glb: total && total > 0 ? Math.min(1, received / total) : null }),
    glbFinished(ok) {
      glbFailed = !ok;
      set({ ...inputs, glb: ok ? 1 : inputs.glb, glbDone: true });
    },
  };
}

/** Warm the GLB (as before) while reporting the bytes actually received; never throws. */
export async function trackFetch(url: string, boot: BootTracker): Promise<void> {
  try {
    const res = await fetch(url);
    if (!res.ok || !res.body) {
      await res.arrayBuffer().catch(() => undefined);
      boot.glbFinished(res.ok);
      return;
    }
    const total = Number(res.headers.get("content-length")) || null;
    const reader = res.body.getReader();
    let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      got += value.byteLength;
      boot.glbProgress(got, total);
    }
    boot.glbFinished(true);
  } catch {
    boot.glbFinished(false);
  }
}
