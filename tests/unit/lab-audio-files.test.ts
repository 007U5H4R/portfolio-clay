/** TASK-168 — the file-based Gummy Lab soundtrack: opt-in, queue order, crossfade scheduling, SFX limits, storage guard. */
import { describe, expect, it, vi } from "vitest";
import {
  ALL_SFX_FILES,
  CROSSFADE_S,
  LabAudio,
  MUSIC_GAIN,
  SFX_FILES,
  SFX_GAIN,
  STORAGE_KEY,
  equalPowerCurves,
  nextTrackIndex,
  nextTrackStart,
  readSoundPref,
  type CtxLike,
  type SourceLike,
} from "@/components/lab/audio";

interface Started {
  url: string;
  start: number;
  fadeIn: boolean;
  fadeOutAt: number | null;
  src: SourceLike;
}

const DUR: Record<string, number> = { "music-1": 39.61, "music-2": 40.45 };

function harness(opts: { stored?: string | null; failM4a?: boolean } = {}) {
  const urls: string[] = [];
  const music: Started[] = [];
  const sfxStarts: unknown[] = [];
  const state = { ctx: null as null | (CtxLike & { time: number }), created: 0 };
  const store = new Map<string, string>();
  if (opts.stored) store.set(STORAGE_KEY, opts.stored);
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  };
  const createContext = () => {
    state.created += 1;
    const ctx = {
      time: 0,
      state: "running",
      get currentTime() {
        return this.time;
      },
      destination: {},
      createGain: () => {
        const g = {
          curves: [] as Array<{ t: number; kind: "in" | "out" }>,
          setAt: [] as number[],
          gain: {
            value: 0,
            setValueAtTime: (_v: number, t: number) => void g.setAt.push(t),
            setValueCurveAtTime: (c: Float32Array, t: number) => void g.curves.push({ t, kind: c[0]! < 0.5 ? "in" : "out" }),
          },
          connect: (n: unknown) => n,
        };
        return g;
      },
      createBufferSource: () => {
        const src: SourceLike & { gainNode?: unknown } = { buffer: null, onended: null, connect: (n: unknown) => ((src.gainNode = n), n), start: vi.fn() };
        src.start = vi.fn((when?: number) => {
          const buf = src.buffer as { url: string; duration: number };
          const g = src.gainNode as { curves: Array<{ t: number; kind: string }> } | undefined;
          if (buf.url.includes("music")) {
            const outc = g?.curves.find((c) => c.kind === "out");
            music.push({ url: buf.url, start: when ?? 0, fadeIn: !!g?.curves.some((c) => c.kind === "in"), fadeOutAt: outc?.t ?? null, src });
          } else sfxStarts.push(buf.url);
        });
        return src;
      },
      decodeAudioData: async (bytes: ArrayBuffer) => {
        const url = new TextDecoder().decode(bytes);
        return { duration: DUR[url.split("/").pop()!.replace(/\.(m4a|mp3)$/, "")] ?? 0.4, url };
      },
      suspend: vi.fn(async () => void (ctx.state = "suspended")),
      resume: vi.fn(async () => void (ctx.state = "running")),
      close: vi.fn(async () => void (ctx.state = "closed")),
    };
    state.ctx = ctx as unknown as CtxLike & { time: number };
    return ctx as unknown as CtxLike;
  };
  const fetchBytes = vi.fn(async (url: string) => {
    urls.push(url);
    if (opts.failM4a && url.endsWith(".m4a")) throw new Error("404");
    return new TextEncoder().encode(url).buffer as ArrayBuffer;
  });
  // The fake "file" is its own URL, so each decoded buffer knows which asset it is.
  const audio = new LabAudio({ createContext, fetchBytes, storage, doc: null, win: null });
  return { audio, urls, music, sfxStarts, state, store, fetchBytes };
}
const settle = async () => {
  for (let i = 0; i < 80; i += 1) await Promise.resolve();
};

describe("pure scheduling helpers", () => {
  it("alternates music-1 → music-2 → music-1", () => {
    expect([0, 1, 2, 3].map((i) => nextTrackIndex(i % 2))).toEqual([1, 0, 1, 0]);
  });
  it("starts the next buffer 60 ms before the previous one ends", () => {
    expect(CROSSFADE_S).toBe(0.06);
    expect(nextTrackStart(10, 39.61)).toBeCloseTo(49.55, 6);
  });
  it("builds equal-power curves (cos² + sin² = 1)", () => {
    const { out, inn } = equalPowerCurves(16);
    expect(out[0]).toBe(1);
    expect(inn[0]).toBe(0);
    for (let i = 0; i < 16; i += 1) expect(out[i]! ** 2 + inn[i]! ** 2).toBeCloseTo(1, 6);
  });
  it("keeps music exactly 6 dB under the SFX bus", () => {
    expect(20 * Math.log10(MUSIC_GAIN / SFX_GAIN)).toBeCloseTo(-6.02, 1);
  });
  it("maps every game event to a shipped file", () => {
    for (const files of Object.values(SFX_FILES)) for (const f of files) expect(ALL_SFX_FILES).toContain(f);
  });
});

describe("LabAudio", () => {
  it("is muted by default and loads nothing and builds no context until sound is turned on", async () => {
    const h = harness();
    expect(h.audio.muted).toBe(true);
    h.audio.play("squish");
    await settle();
    expect(h.state.created).toBe(0);
    expect(h.fetchBytes).not.toHaveBeenCalled();
  });

  it("on unmute: loads music-1 first, starts it, and only then fetches music-2", async () => {
    const h = harness();
    h.audio.setMuted(false);
    await settle();
    const musicUrls = h.urls.filter((u) => u.includes("/music/"));
    expect(musicUrls[0]).toMatch(/music-1\.m4a$/);
    expect(h.music[0]?.url).toContain("music-1");
    // music-2 is requested after music-1 has been started, never before.
    expect(musicUrls.findIndex((u) => u.includes("music-2"))).toBeGreaterThan(0);
    expect(h.urls.every((u) => u.startsWith("/media/lab/"))).toBe(true);
  });

  it("queues music-1 → music-2 → music-1 with a 60 ms equal-power crossfade on the audio clock", async () => {
    const h = harness();
    h.audio.setMuted(false);
    await settle();
    expect(h.music.map((m) => m.url.match(/music-\d/)![0])).toEqual(["music-1", "music-2"]);
    const [a, b] = h.music as [Started, Started];
    expect(a.fadeIn).toBe(false);
    expect(b.fadeIn).toBe(true);
    expect(b.start).toBeCloseTo(a.start + DUR["music-1"]! - CROSSFADE_S, 6);
    expect(a.fadeOutAt).toBeCloseTo(a.start + DUR["music-1"]! - CROSSFADE_S, 6);
    // music-1 ends → the third track (music-1 again) is scheduled behind music-2.
    a.src.onended?.();
    await settle();
    expect(h.music).toHaveLength(3);
    expect(h.music[2]!.url).toContain("music-1");
    expect(h.music[2]!.start).toBeCloseTo(b.start + DUR["music-2"]! - CROSSFADE_S, 6);
  });

  it("falls back to .mp3 when .m4a cannot be fetched or decoded", async () => {
    const h = harness({ failM4a: true });
    h.audio.setMuted(false);
    await settle();
    expect(h.urls).toContain("/media/lab/music/music-1.mp3");
    expect(h.music[0]?.url).toContain("music-1.mp3");
  });

  it("plays SFX only once loaded, rate-limits repeats and alternates the bounce takes", async () => {
    const h = harness();
    h.audio.setMuted(false);
    h.audio.play("bounce"); // not decoded yet: silently skipped
    await settle();
    expect(h.sfxStarts).toHaveLength(0);
    h.audio.play("bounce");
    h.audio.play("bounce"); // same instant: limited to one per 80 ms
    h.state.ctx!.time = 0.1;
    h.audio.play("bounce");
    expect(h.sfxStarts.map((u) => String(u).match(/bounce-\d/)![0])).toEqual(["bounce-1", "bounce-2"]);
  });

  it("makes no SFX while muted again", async () => {
    const h = harness();
    h.audio.setMuted(false);
    await settle();
    h.audio.setMuted(true);
    h.audio.play("click");
    expect(h.sfxStarts).toHaveLength(0);
  });

  it("remembers the choice, and a remembered 'on' is armed: no context until a gesture", async () => {
    const off = harness();
    off.audio.setMuted(false);
    expect(off.store.get(STORAGE_KEY)).toBe("on");
    off.audio.setMuted(true);
    expect(off.store.get(STORAGE_KEY)).toBe("off");

    const armed = harness({ stored: "on" });
    expect(armed.audio.muted).toBe(false);
    await settle();
    expect(armed.state.created).toBe(0);
    expect(armed.fetchBytes).not.toHaveBeenCalled();
  });

  it("guards every storage access (throwing storage never breaks it)", () => {
    const boom = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(readSoundPref(boom)).toBe(false);
    expect(readSoundPref(null)).toBe(false);
    const a = new LabAudio({ createContext: () => null, storage: boom, doc: null, win: null });
    expect(a.muted).toBe(true);
    expect(() => a.setMuted(false)).not.toThrow();
    expect(() => a.play("click")).not.toThrow();
  });

  it("dispose releases the context and stops in-flight loads from starting anything", async () => {
    const h = harness();
    h.audio.setMuted(false);
    h.audio.dispose();
    const ctx = h.state.ctx!;
    await settle();
    expect(ctx.close).toHaveBeenCalled();
    expect(h.music).toHaveLength(0);
    expect(() => h.audio.dispose()).not.toThrow();
  });

  it("without Web Audio it stays silent instead of throwing", () => {
    const a = new LabAudio({ createContext: () => null, storage: null, doc: null, win: null });
    expect(() => a.setMuted(false)).not.toThrow();
    expect(() => a.play("ring")).not.toThrow();
  });
});
