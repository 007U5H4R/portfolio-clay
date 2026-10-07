/**
 * Gummy Lab sound (TASK-168): a looping two-track soundtrack plus short paper-and-candy SFX, all from the
 * files in `public/media/lab/`. Opt-in by construction:
 *   - muted by default; the visitor's choice is remembered in localStorage (every access guarded);
 *   - nothing is fetched and no AudioContext exists until sound is on (and only /lab ever imports this);
 *   - a returning visitor who left sound on is "armed": the toggle shows on, but the context is only built
 *     on their first gesture on /lab (autoplay policy), never at load.
 * Music: music-1 → music-2 → music-1 … sample-accurately. Each next buffer is scheduled on the audio clock
 * to start `CROSSFADE_S` before the previous one ends, with an equal-power crossfade. music-2 is only
 * fetched once music-1 has started. Music sits 6 dB under the SFX. `.m4a` first, `.mp3` as the fallback.
 * Audio is paused while the tab is hidden and the context is released on `dispose()` (leaving /lab).
 */
export type SoundName = "squish" | "bounce" | "ring" | "star" | "powerup" | "danger" | "gameover" | "secret" | "tick" | "click" | "rustle";

export const MUSIC_TRACKS = ["music-1", "music-2"] as const;
export const CROSSFADE_S = 0.06;
export const STORAGE_KEY = "gummy-lab:sound";
/** SFX bus 1.0 × 0.9, music 0.45: exactly −6 dB between them. */
export const SFX_GAIN = 0.9;
export const MUSIC_GAIN = 0.45;
const BASE = "/media/lab";

/** Which file(s) a game event plays; arrays alternate. */
export const SFX_FILES: Record<SoundName, readonly string[]> = {
  squish: ["squish"],
  bounce: ["bounce-1", "bounce-2"],
  star: ["pluck-pop"],
  ring: ["combo-chime"],
  powerup: ["win-flourish"],
  secret: ["win-flourish"],
  danger: ["tick"],
  tick: ["tick"],
  gameover: ["thud"],
  click: ["click"],
  rustle: ["rustle"],
};
export const ALL_SFX_FILES = ["squish", "bounce-1", "bounce-2", "pluck-pop", "combo-chime", "tick", "win-flourish", "thud", "click", "rustle"] as const;

/** Minimum seconds between two plays of the same sound, so a flurry of impacts never turns harsh. */
export const MIN_GAP_S: Record<SoundName, number> = {
  squish: 0.08,
  bounce: 0.08,
  star: 0.05,
  ring: 0.06,
  powerup: 0.6,
  secret: 0.6,
  danger: 0.3,
  tick: 0.3,
  gameover: 0.5,
  click: 0.06,
  rustle: 0.25,
};

export const nextTrackIndex = (i: number, n: number = MUSIC_TRACKS.length) => (i + 1) % n;
/** The audio-clock time the next track starts: before the previous one ends by the crossfade. */
export const nextTrackStart = (prevStart: number, prevDuration: number, fade: number = CROSSFADE_S) => prevStart + prevDuration - fade;

/** Equal-power fade curves (cos / sin quarter waves) of `n` points: `out` goes 1 → 0, `inn` 0 → 1. */
export function equalPowerCurves(n = 32): { out: Float32Array; inn: Float32Array } {
  const out = new Float32Array(n);
  const inn = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const x = (i / (n - 1)) * (Math.PI / 2);
    out[i] = Math.cos(x);
    inn[i] = Math.sin(x);
  }
  return { out, inn };
}

export function readSoundPref(storage: Pick<Storage, "getItem"> | null): boolean {
  try {
    return storage?.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

function defaultStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** The slice of Web Audio this module needs (so tests can drive it by hand). */
export interface AudioParamLike {
  value: number;
  setValueAtTime(v: number, t: number): unknown;
  setValueCurveAtTime(c: Float32Array, t: number, d: number): unknown;
}
export interface GainLike {
  gain: AudioParamLike;
  connect(n: unknown): unknown;
}
export interface SourceLike {
  buffer: unknown;
  playbackRate?: { value: number };
  onended: (() => void) | null;
  connect(n: unknown): unknown;
  start(when?: number): void;
  stop?(when?: number): void;
}
export interface CtxLike {
  state: string;
  currentTime: number;
  destination: unknown;
  createGain(): GainLike;
  createBufferSource(): SourceLike;
  decodeAudioData(data: ArrayBuffer): Promise<{ duration: number }>;
  suspend(): Promise<void>;
  resume(): Promise<void>;
  close(): Promise<void>;
}
export interface LabAudioDeps {
  createContext?: () => CtxLike | null;
  fetchBytes?: (url: string) => Promise<ArrayBuffer>;
  storage?: Pick<Storage, "getItem" | "setItem"> | null;
  doc?: Pick<Document, "addEventListener" | "removeEventListener" | "hidden"> | null;
  win?: Pick<Window, "addEventListener" | "removeEventListener"> | null;
}

const defaultContext = (): CtxLike | null => {
  const g = globalThis as unknown as { AudioContext?: new () => CtxLike; webkitAudioContext?: new () => CtxLike };
  const Ctor = g.AudioContext ?? g.webkitAudioContext;
  if (!Ctor) return null;
  try {
    return new Ctor();
  } catch {
    return null;
  }
};
const defaultFetch = async (url: string) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.arrayBuffer();
};

type Buf = { duration: number };

export class LabAudio {
  private ctx: CtxLike | null = null;
  private sfxBus: GainLike | null = null;
  private musicBus: GainLike | null = null;
  private _muted = true;
  private gen = 0;
  private lastAt = new Map<string, number>();
  private alt = new Map<SoundName, number>();
  private sfx = new Map<string, Buf>();
  private music = new Map<number, Buf>();
  private loadingMusic = new Set<number>();
  /** Music scheduling state: the track after the last one scheduled, and when the last one ends. */
  private nextIdx = 0;
  private lastStart = 0;
  private lastDuration = 0;
  private scheduledAny = false;
  private queued = 0;
  private armed = false;
  private readonly d: {
    createContext: () => CtxLike | null;
    fetchBytes: (url: string) => Promise<ArrayBuffer>;
    storage: LabAudioDeps["storage"];
    doc: LabAudioDeps["doc"];
    win: LabAudioDeps["win"];
  };
  private readonly onVisibility = () => {
    const ctx = this.ctx;
    if (!ctx) return;
    if (this.d.doc?.hidden) void ctx.suspend().catch(() => undefined);
    else if (!this._muted) void ctx.resume().catch(() => undefined);
  };
  private readonly onGesture = () => {
    if (!this.armed) return;
    this.disarm();
    if (!this._muted) this.start();
  };

  constructor(deps: LabAudioDeps = {}) {
    this.d = {
      createContext: deps.createContext ?? defaultContext,
      fetchBytes: deps.fetchBytes ?? defaultFetch,
      storage: deps.storage === undefined ? defaultStorage() : deps.storage,
      doc: deps.doc === undefined ? (typeof document === "undefined" ? null : document) : deps.doc,
      win: deps.win === undefined ? (typeof window === "undefined" ? null : window) : deps.win,
    };
    // A remembered "on" arms the toggle; the context itself waits for the first gesture.
    if (readSoundPref(this.d.storage)) {
      this._muted = false;
      this.armed = true;
      this.d.win?.addEventListener("pointerdown", this.onGesture, { once: true, capture: true });
      this.d.win?.addEventListener("keydown", this.onGesture, { once: true, capture: true });
    }
  }

  get muted(): boolean {
    return this._muted;
  }

  private disarm() {
    this.armed = false;
    this.d.win?.removeEventListener("pointerdown", this.onGesture, { capture: true });
    this.d.win?.removeEventListener("keydown", this.onGesture, { capture: true });
  }

  /** Returns the new muted state, and remembers it. Unmuting is the only thing that loads anything (call from a gesture). */
  setMuted(muted: boolean): boolean {
    this._muted = muted;
    try {
      this.d.storage?.setItem(STORAGE_KEY, muted ? "off" : "on");
    } catch {
      /* private mode / blocked storage: the choice just doesn't persist */
    }
    this.disarm();
    if (muted) {
      if (this.ctx?.state === "running") void this.ctx.suspend().catch(() => undefined);
    } else this.start();
    return this._muted;
  }

  private start() {
    if (!this.ensure()) return;
    const ctx = this.ctx!;
    if (ctx.state === "suspended") void ctx.resume().catch(() => undefined);
    void this.loadSfx();
    this.scheduleNext();
  }

  private ensure(): boolean {
    if (this.ctx) return true;
    const ctx = this.d.createContext();
    if (!ctx) return false;
    this.ctx = ctx;
    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = SFX_GAIN;
    this.sfxBus.connect(ctx.destination);
    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = MUSIC_GAIN;
    this.musicBus.connect(ctx.destination);
    this.d.doc?.addEventListener("visibilitychange", this.onVisibility);
    return true;
  }

  private async decode(name: string, folder: "sfx" | "music"): Promise<Buf | null> {
    const ctx = this.ctx;
    if (!ctx) return null;
    for (const ext of ["m4a", "mp3"]) {
      try {
        const bytes = await this.d.fetchBytes(`${BASE}/${folder}/${name}.${ext}`);
        return await ctx.decodeAudioData(bytes);
      } catch {
        /* try the next format */
      }
    }
    return null;
  }

  private async loadSfx() {
    const gen = this.gen;
    for (const name of ALL_SFX_FILES) {
      if (this.sfx.has(name)) continue;
      const buf = await this.decode(name, "sfx");
      if (gen !== this.gen) return;
      if (buf) this.sfx.set(name, buf);
    }
  }

  private async loadMusic(i: number) {
    const gen = this.gen;
    this.loadingMusic.add(i);
    const buf = await this.decode(MUSIC_TRACKS[i]!, "music");
    this.loadingMusic.delete(i);
    if (gen !== this.gen || !buf) return;
    this.music.set(i, buf);
    this.scheduleNext();
  }

  /**
   * Keep two tracks scheduled on the audio clock (the one playing and the one queued behind it). A missing buffer is
   * fetched here, which is how music-2 only starts loading once music-1 has been started.
   */
  private scheduleNext() {
    const ctx = this.ctx;
    const bus = this.musicBus;
    if (!ctx || !bus || this.queued >= 2) return;
    const i = this.nextIdx;
    const buf = this.music.get(i);
    if (!buf) {
      if (!this.loadingMusic.has(i)) void this.loadMusic(i);
      return;
    }
    const first = this.queued === 0 && !this.scheduledAny;
    const planned = first ? ctx.currentTime + 0.05 : nextTrackStart(this.lastStart, this.lastDuration);
    // A late buffer starts as soon as possible instead of in the past (no overlap to fade against then).
    const late = !first && planned < ctx.currentTime + 0.01;
    const start = first || late ? Math.max(planned, ctx.currentTime + 0.05) : planned;
    const { out, inn } = equalPowerCurves();
    const g = ctx.createGain();
    g.connect(bus);
    if (first || late) g.gain.setValueAtTime(1, start);
    else g.gain.setValueCurveAtTime(inn, start, CROSSFADE_S);
    g.gain.setValueCurveAtTime(out, start + buf.duration - CROSSFADE_S, CROSSFADE_S);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(g);
    const gen = this.gen;
    src.onended = () => {
      if (gen !== this.gen) return;
      this.queued -= 1;
      this.scheduleNext();
    };
    src.start(start);
    this.queued += 1;
    this.scheduledAny = true;
    this.lastStart = start;
    this.lastDuration = buf.duration;
    this.nextIdx = nextTrackIndex(i);
    this.scheduleNext();
  }

  play(name: SoundName) {
    const ctx = this.ctx;
    const bus = this.sfxBus;
    if (this._muted || !ctx || !bus || ctx.state === "closed" || ctx.state === "suspended") return;
    const now = ctx.currentTime;
    const files = SFX_FILES[name];
    // Sounds sharing a file (danger/tick, powerup/secret) share one rate limit, so they never double up.
    const key = files[0]!;
    const last = this.lastAt.get(key);
    if (last !== undefined && now - last < MIN_GAP_S[name]) return;
    const n = this.alt.get(name) ?? 0;
    const file = files[n % files.length]!;
    const buf = this.sfx.get(file);
    if (!buf) return;
    this.lastAt.set(key, now);
    this.alt.set(name, n + 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(bus);
    src.start(now);
  }

  /** Release everything: stop listening, close the context, forget buffers. Safe to call twice. */
  dispose() {
    this.gen += 1;
    this.disarm();
    this.d.doc?.removeEventListener("visibilitychange", this.onVisibility);
    this.lastAt.clear();
    this.alt.clear();
    this.sfx.clear();
    this.music.clear();
    this.loadingMusic.clear();
    this.scheduledAny = false;
    this.queued = 0;
    this.nextIdx = 0;
    const ctx = this.ctx;
    this.ctx = null;
    this.sfxBus = null;
    this.musicBus = null;
    if (ctx && ctx.state !== "closed") void ctx.close().catch(() => undefined);
  }
}
