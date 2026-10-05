/**
 * The Ask Tushky audio manager (TASK-134, voice spec §24, §33, §50–52, §61; UI spec §25–27, §36,
 * §38–39). Plain TypeScript (no React), so the whole playback state machine is unit-testable in
 * jsdom with a fake `<audio>`.
 *
 * ONE hidden HTMLAudioElement plays every answer, so two answers can never sound at once: starting
 * another message pauses the current one and remembers where it was (UI §25). Per message it keeps
 * a small record — status, position, duration, where its audio came from — that each
 * `TushkyVoicePlayer` reads through `useSyncExternalStore`.
 *
 * Audio sources, in order (UI §39): the session cache (a Blob URL this session already fetched for
 * the same answer — Replay and a repeated question never request again, §33) → the pre-generated FAQ
 * file (a static URL) → `POST /api/tushky/speech`. Blob URLs are revoked when their messages are
 * released (the drawer's conversation resets on close) and when the manager is disposed (§52).
 *
 * `pauseActive()` is called on route change (§51, UI §27) and `releaseAll()` when the drawer closes
 * (§50, UI §26): nothing keeps talking after the drawer is gone, and nothing auto-resumes.
 */
import { LOADING_LINES } from "@/config/tushky-voice";
import { AUDIO_SOURCE_HEADER, isRestingError, SPEECH_ENDPOINT, type SpeechRequestBody } from "@/lib/tushky-voice/contract";

export type VoiceStatus = "idle" | "loading" | "playing" | "paused" | "ended" | "error" | "resting";

export interface VoiceEntry {
  status: VoiceStatus;
  /** True once loading has lasted 150 ms: only then is "Finding my voice…" shown (UI §21). */
  slow: boolean;
  /** Seconds. */
  position: number;
  /** Seconds, once known (FAQ metadata or the loaded audio). */
  duration: number | undefined;
  loadingLine: string;
}

export interface ListenRequest {
  body: SpeechRequestBody;
  /** A fresh pre-generated FAQ clip, when there is one. */
  cachedUrl?: string | undefined;
  cachedDurationMs?: number | undefined;
  /** Bucketed analytics properties (never answer text, §60). */
  analytics: { message_type: "faq" | "generated"; answer_length_bucket: string };
}

export type VoiceEventName = "Listen Clicked" | "Started" | "Paused" | "Completed" | "Replayed" | "Failed";
export type VoiceEventSink = (name: VoiceEventName, props: Record<string, string | number>) => void;

interface Record_ {
  entry: VoiceEntry;
  url?: string | undefined;
  source?: "cached" | "generated" | undefined;
  request?: ListenRequest | undefined;
  clickedAt?: number | undefined;
  slowTimer?: ReturnType<typeof setTimeout> | undefined;
  abort?: AbortController | undefined;
}

export interface AudioManagerOptions {
  createAudio?: () => HTMLAudioElement;
  fetch?: typeof fetch;
  onEvent?: VoiceEventSink;
  now?: () => number;
}

const IDLE: VoiceEntry = { status: "idle", slow: false, position: 0, duration: undefined, loadingLine: LOADING_LINES[0] };
/** How long a load may take before the loading copy appears (UI §21: cached FAQ audio goes straight to Playing). */
export const SLOW_LOADING_MS = 150;
/** `timeupdate` fires ~4×/s; progress re-renders at most this often (UI §12). */
const PROGRESS_STEP_S = 0.25;

const latencyBucket = (ms: number) => (ms < 150 ? "<150ms" : ms < 500 ? "150-500ms" : ms < 1500 ? "0.5-1.5s" : ms < 4000 ? "1.5-4s" : "4s+");

/** A silent 0.05 s WAV, played inside the click so iOS Safari lets the element play once audio arrives. */
function silentWavUrl(): string | undefined {
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function" || typeof Blob === "undefined") return undefined;
  const samples = 1200;
  const buffer = new ArrayBuffer(44 + samples * 2);
  const v = new DataView(buffer);
  const w = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF");
  v.setUint32(4, 36 + samples * 2, true);
  w(8, "WAVE");
  w(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, 24000, true);
  v.setUint32(28, 48000, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  w(36, "data");
  v.setUint32(40, samples * 2, true);
  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

export class TushkyAudioManager {
  private readonly records = new Map<string, Record_>();
  /** answerHash → Blob URL: one fetch per answer per session, whichever message asks. */
  private readonly blobs = new Map<string, string>();
  private readonly listeners = new Set<() => void>();
  private audio: HTMLAudioElement | undefined;
  private activeId: string | undefined;
  private listens = 0;
  private unlockUrl: string | undefined;
  private unlocked = false;
  private disposed = false;

  constructor(private readonly options: AudioManagerOptions = {}) {}

  /* ------------------------------------------------------------ store (useSyncExternalStore) */

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  get(messageId: string): VoiceEntry {
    return this.records.get(messageId)?.entry ?? IDLE;
  }

  get active(): string | undefined {
    return this.activeId;
  }

  private set(messageId: string, patch: Partial<VoiceEntry>): void {
    const record = this.record(messageId);
    record.entry = { ...record.entry, ...patch };
    for (const listener of this.listeners) listener();
  }

  private record(messageId: string): Record_ {
    let record = this.records.get(messageId);
    if (!record) {
      record = { entry: IDLE };
      this.records.set(messageId, record);
    }
    return record;
  }

  private emit(name: VoiceEventName, messageId: string, extra: Record<string, string | number> = {}): void {
    const record = this.records.get(messageId);
    if (!record?.request) return;
    try {
      this.options.onEvent?.(name, { ...record.request.analytics, audio_source: record.source ?? "generated", ...extra });
    } catch {
      // analytics never breaks playback
    }
  }

  /* ------------------------------------------------------------ the element */

  private element(): HTMLAudioElement {
    if (this.audio) return this.audio;
    const audio = this.options.createAudio?.() ?? new Audio();
    audio.preload = "auto";
    // No `controls`: the element is never rendered; the paper strip is the only UI (UI §36).
    audio.addEventListener("loadedmetadata", () => {
      if (this.activeId && Number.isFinite(audio.duration)) this.set(this.activeId, { duration: audio.duration });
    });
    audio.addEventListener("timeupdate", () => {
      const id = this.activeId;
      if (!id) return;
      const entry = this.get(id);
      if (entry.status === "playing" && Math.abs(audio.currentTime - entry.position) >= PROGRESS_STEP_S) this.set(id, { position: audio.currentTime });
    });
    audio.addEventListener("playing", () => {
      const id = this.activeId;
      if (!id) return;
      const record = this.record(id);
      this.set(id, { status: "playing", slow: false });
      if (record.clickedAt !== undefined) {
        const ms = (this.options.now ?? Date.now)() - record.clickedAt;
        this.emit("Started", id, { listen_to_start: latencyBucket(ms), faq_audio_cache_hit: record.source === "cached" && !!record.request?.cachedUrl ? 1 : 0 });
        record.clickedAt = undefined;
      }
    });
    audio.addEventListener("ended", () => {
      const id = this.activeId;
      if (!id) return;
      const duration = Number.isFinite(audio.duration) ? audio.duration : this.get(id).duration;
      this.set(id, { status: "ended", position: duration ?? 0, duration });
      this.emit("Completed", id);
    });
    audio.addEventListener("error", () => {
      const id = this.activeId;
      if (!id || !this.unlocked || audio.src === this.unlockUrl) return;
      const entry = this.get(id);
      if (entry.status !== "loading" && entry.status !== "playing") return;
      this.fail(id, "playback");
    });
    this.audio = audio;
    return audio;
  }

  /** Inside the click: start the element on a silent clip so later `play()` after a fetch is allowed. */
  private unlock(): void {
    if (this.unlocked) return;
    const audio = this.element();
    this.unlockUrl ??= silentWavUrl();
    if (!this.unlockUrl) return;
    this.unlocked = true;
    audio.src = this.unlockUrl;
    const played = audio.play();
    if (played && typeof played.catch === "function") played.catch(() => undefined);
  }

  /* ------------------------------------------------------------ actions */

  /** Listen (idle), Try again (error), or Play again (ended). */
  listen(messageId: string, request: ListenRequest): void {
    if (this.disposed) return;
    const record = this.record(messageId);
    record.request = request;
    const status = record.entry.status;
    if (status === "loading" || status === "resting") return;
    if (status === "playing") return this.pause(messageId);
    if (status === "paused") return this.resume(messageId);
    if (status === "ended") return this.replay(messageId);
    this.emit("Listen Clicked", messageId);
    this.unlock();
    this.pauseOthers(messageId);
    record.clickedAt = (this.options.now ?? Date.now)();

    const known = record.url ?? this.blobs.get(request.body.answerHash);
    if (known) {
      record.url = known;
      record.source ??= "cached";
      this.playFrom(messageId, 0);
      return;
    }
    const durationFromMeta = request.cachedDurationMs ? request.cachedDurationMs / 1000 : this.get(messageId).duration;
    this.set(messageId, { status: "loading", slow: false, position: 0, duration: durationFromMeta, loadingLine: LOADING_LINES[this.listens++ % LOADING_LINES.length]! });
    clearTimeout(record.slowTimer);
    record.slowTimer = setTimeout(() => {
      if (this.get(messageId).status === "loading") this.set(messageId, { slow: true });
    }, SLOW_LOADING_MS);

    if (request.cachedUrl) {
      record.url = request.cachedUrl;
      record.source = "cached";
      this.playFrom(messageId, 0);
      return;
    }
    void this.fetchSpeech(messageId, request);
  }

  private async fetchSpeech(messageId: string, request: ListenRequest): Promise<void> {
    const record = this.record(messageId);
    record.abort?.abort();
    const abort = new AbortController();
    record.abort = abort;
    let response: Response;
    try {
      response = await (this.options.fetch ?? fetch)(SPEECH_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(request.body),
        signal: abort.signal,
      });
    } catch {
      if (!abort.signal.aborted) this.fail(messageId, "network");
      return;
    }
    if (abort.signal.aborted || this.disposed) return;
    if (!response.ok) {
      let code = "http-" + response.status;
      try {
        code = String(((await response.json()) as { code?: string }).code ?? code);
      } catch {
        // keep the status code
      }
      if (abort.signal.aborted || this.disposed) return;
      this.fail(messageId, code);
      return;
    }
    let blob: Blob;
    try {
      blob = await response.blob();
    } catch {
      if (!abort.signal.aborted) this.fail(messageId, "network");
      return;
    }
    if (abort.signal.aborted || this.disposed) return;
    const url = URL.createObjectURL(blob);
    this.blobs.set(request.body.answerHash, url);
    record.url = url;
    record.source = response.headers.get(AUDIO_SOURCE_HEADER) === "cache" ? "cached" : "generated";
    // Still the one the visitor wants? (they may have started another answer meanwhile)
    if (this.get(messageId).status === "loading") this.playFrom(messageId, 0);
  }

  private playFrom(messageId: string, position: number): void {
    const record = this.record(messageId);
    const audio = this.element();
    this.activeId = messageId;
    if (record.url && audio.getAttribute("src") !== record.url) {
      audio.src = record.url;
      audio.load?.();
    }
    try {
      audio.currentTime = position;
    } catch {
      // not seekable until metadata; the element starts at 0 anyway
    }
    if (this.get(messageId).status !== "loading") this.set(messageId, { status: "playing", slow: false, position });
    const played = audio.play();
    if (played && typeof played.catch === "function") {
      played.catch((err: { name?: string }) => {
        if (this.activeId !== messageId) return;
        // Autoplay refused (the fetch outlived the click's activation): wait for a press, don't fail.
        if (err?.name === "NotAllowedError") this.set(messageId, { status: "paused", slow: false, position: 0 });
        else if (err?.name !== "AbortError") this.fail(messageId, "playback");
      });
    }
  }

  pause(messageId: string): void {
    const entry = this.get(messageId);
    if (entry.status !== "playing" && entry.status !== "loading") return;
    const audio = this.audio;
    const position = this.activeId === messageId && audio ? audio.currentTime : entry.position;
    if (this.activeId === messageId) audio?.pause();
    if (entry.status === "loading") {
      this.record(messageId).abort?.abort();
      this.set(messageId, { status: "idle", slow: false });
      return;
    }
    this.set(messageId, { status: "paused", position });
    this.emit("Paused", messageId);
  }

  /** Resume where it paused; never restarts (UI §9). */
  resume(messageId: string): void {
    if (this.get(messageId).status !== "paused") return;
    this.pauseOthers(messageId);
    this.unlock();
    this.playFrom(messageId, this.get(messageId).position);
  }

  /** From 0, with the audio already held — never a new request (UI §10, spec §33). */
  replay(messageId: string): void {
    const record = this.records.get(messageId);
    if (!record?.url) return;
    this.pauseOthers(messageId);
    this.unlock();
    this.emit("Replayed", messageId);
    this.playFrom(messageId, 0);
  }

  private fail(messageId: string, code: string): void {
    // One failure, one state change and one "Failed" event (a broken file fires both `error` and a
    // rejected `play()`).
    const current = this.get(messageId).status;
    if (current === "error" || current === "resting") return;
    clearTimeout(this.record(messageId).slowTimer);
    if (this.activeId === messageId) this.audio?.pause();
    this.set(messageId, { status: isRestingError(code) ? "resting" : "error", slow: false });
    this.emit("Failed", messageId, { error_code: code });
  }

  /** Try again after an error: a fresh attempt (spec §57). Resting never retries on its own (§58). */
  retry(messageId: string): void {
    const record = this.records.get(messageId);
    if (!record?.request || record.entry.status !== "error") return;
    // A pre-generated file that failed is not tried twice: the retry asks the route, which speaks
    // the current text. A Blob that failed to decode is dropped too.
    if (record.url) {
      if (record.url.startsWith("blob:")) {
        URL.revokeObjectURL(record.url);
        this.blobs.delete(record.request.body.answerHash);
      }
      record.url = undefined;
      record.source = undefined;
    }
    this.set(messageId, { status: "idle" });
    this.listen(messageId, { ...record.request, cachedUrl: undefined });
  }

  private pauseOthers(messageId: string): void {
    for (const [id, record] of this.records) {
      if (id === messageId) continue;
      if (record.entry.status === "playing" || record.entry.status === "loading") this.pause(id);
    }
  }

  /** Route change (§51): pause whatever is speaking; nothing resumes by itself. */
  pauseActive(): void {
    for (const [id, record] of this.records) {
      if (record.entry.status === "playing" || record.entry.status === "loading") this.pause(id);
    }
  }

  /** Drawer close (§50): stop everything, forget every message, revoke every Blob URL (§52). */
  releaseAll(): void {
    this.audio?.pause();
    for (const record of this.records.values()) {
      clearTimeout(record.slowTimer);
      record.abort?.abort();
    }
    this.records.clear();
    this.activeId = undefined;
    if (this.audio) {
      this.audio.removeAttribute("src");
      this.audio.load?.();
    }
    for (const url of this.blobs.values()) URL.revokeObjectURL(url);
    this.blobs.clear();
    for (const listener of this.listeners) listener();
  }

  /**
   * (Re)arm the manager. The provider calls it on mount: React Strict Mode runs effects
   * setup → cleanup → setup in dev, and the cleanup's `dispose()` must not leave a dead manager.
   */
  activate(): void {
    this.disposed = false;
  }

  dispose(): void {
    this.releaseAll();
    if (this.unlockUrl) URL.revokeObjectURL(this.unlockUrl);
    this.unlockUrl = undefined;
    this.disposed = true;
  }
}
