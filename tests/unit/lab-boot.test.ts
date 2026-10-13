import { describe, expect, it } from "vitest";
import { BOOT_START, BOOT_STAGES, BOOT_WEIGHTS, bootProgress, bootReady, bootStage, createBoot, trackFetch, type BootInputs } from "@/lib/lab/boot";

const full: BootInputs = { glb: 1, glbDone: true, canvas: true, physics: true, model: true, frame: true };

describe("boot progress mapper", () => {
  it("weights sum to 100", () => {
    expect(Object.values(BOOT_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
  });

  it("starts low and reaches 100 only when everything is genuinely ready", () => {
    expect(bootProgress(BOOT_START)).toBe(BOOT_WEIGHTS.base);
    expect(bootProgress(full)).toBe(100);
    for (const k of ["glbDone", "canvas", "physics", "model", "frame"] as const) {
      expect(bootReady({ ...full, [k]: false })).toBe(false);
      expect(bootProgress({ ...full, [k]: false })).toBeLessThan(100);
    }
  });

  it("never reports 100 from bytes alone, even if the response over-reports", () => {
    expect(bootProgress({ ...BOOT_START, glb: 5 })).toBeLessThan(100);
    expect(bootProgress({ ...full, frame: false })).toBeLessThan(100);
  });

  it("is monotone in every input", () => {
    const base: BootInputs = { ...BOOT_START, glb: 0.3 };
    const p0 = bootProgress(base);
    expect(bootProgress({ ...base, glb: 0.6 })).toBeGreaterThanOrEqual(p0);
    for (const k of ["glbDone", "canvas", "physics", "model", "frame"] as const) {
      expect(bootProgress({ ...base, [k]: true })).toBeGreaterThanOrEqual(p0);
    }
  });

  it("an unknown size contributes nothing until the request finishes (no guessing)", () => {
    expect(bootProgress({ ...BOOT_START, glb: null })).toBe(bootProgress(BOOT_START));
    expect(bootProgress({ ...BOOT_START, glb: null, glbDone: true })).toBe(BOOT_WEIGHTS.base + BOOT_WEIGHTS.glb);
  });

  it("maps the first incomplete milestone to the four stages", () => {
    expect(BOOT_STAGES).toHaveLength(4);
    expect(bootStage(BOOT_START)).toBe(0);
    expect(bootStage({ ...BOOT_START, glbDone: true })).toBe(1);
    expect(bootStage({ ...BOOT_START, glbDone: true, canvas: true })).toBe(2);
    expect(bootStage({ ...BOOT_START, glbDone: true, canvas: true, physics: true })).toBe(3);
  });
});

describe("boot tracker", () => {
  it("never moves backwards and never runs ahead of what was marked, whatever the order", () => {
    const orders: Array<Array<() => void>> = [];
    const mk = () => {
      const b = createBoot();
      return {
        b,
        steps: [() => b.glbProgress(40, 100), () => b.mark("canvas"), () => b.glbProgress(10, 100), () => b.mark("physics"), () => b.glbFinished(true), () => b.mark("model"), () => b.mark("frame")],
      };
    };
    const seen = mk();
    orders.push(seen.steps);
    let last = seen.b.get().progress;
    let lastStage = seen.b.get().stage;
    for (const step of seen.steps) {
      step();
      const s = seen.b.get();
      expect(s.progress).toBeGreaterThanOrEqual(last);
      expect(s.stage).toBeGreaterThanOrEqual(lastStage);
      if (!s.ready) expect(s.progress).toBeLessThan(100);
      last = s.progress;
      lastStage = s.stage;
    }
    expect(seen.b.get().progress).toBe(100);
    expect(seen.b.get().ready).toBe(true);
  });

  it("does not notify for a byte tick that changes nothing visible, and unsubscribes cleanly", () => {
    const b = createBoot();
    let n = 0;
    const off = b.subscribe(() => (n += 1));
    b.glbProgress(1, 10_000_000); // < 1 percent point of the glb share
    expect(n).toBe(0);
    b.mark("canvas");
    expect(n).toBe(1);
    off();
    b.mark("physics");
    expect(n).toBe(1);
  });

  it("a failed GLB settles (the procedural body takes over) instead of stranding the boot", () => {
    const b = createBoot();
    b.glbFinished(false);
    expect(b.get().glbDone).toBe(true);
    expect(b.get().glbFailed).toBe(true);
    for (const m of ["canvas", "physics", "model", "frame"] as const) b.mark(m);
    expect(b.get().ready).toBe(true);
  });

  it("trackFetch reports received bytes against content-length and finishes", async () => {
    const chunks = [new Uint8Array(30), new Uint8Array(70)];
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        chunks.forEach((x) => c.enqueue(x));
        c.close();
      },
    });
    const orig = globalThis.fetch;
    globalThis.fetch = (async () => new Response(stream, { headers: { "content-length": "100" } })) as typeof fetch;
    const b = createBoot();
    const seen: number[] = [];
    b.subscribe(() => seen.push(b.get().progress));
    await trackFetch("/x", b);
    globalThis.fetch = orig;
    expect(b.get().glbDone).toBe(true);
    expect(seen).toEqual([...seen].sort((a, c) => a - c));
    expect(b.get().glb).toBe(1);
  });

  it("trackFetch settles on a network error", async () => {
    const orig = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new Error("offline");
    }) as typeof fetch;
    const b = createBoot();
    await trackFetch("/x", b);
    globalThis.fetch = orig;
    expect(b.get().glbFailed).toBe(true);
  });
});
