/**
 * Tushky's voice (TASK-134, Tushar's voice spec §9, §13–16, §36, §53–55, §73). The ONE place the
 * voice is configured: the model, the prebuilt voice, the version that invalidates cached audio, the
 * performance direction and every limit. Route handlers and scripts read it; nothing else holds a
 * style prompt (§36).
 *
 * Client-safe: plain constants only. The environment is read by `ttsModel()` on the server (the
 * route and the scripts); the browser never sees a model name or a key. There is deliberately no
 * `NEXT_PUBLIC_` variable anywhere in the voice feature (§11–12).
 */

/**
 * Bump when the voice, the model, the style direction or the pronunciation approach changes (§73).
 * Every pre-generated FAQ file records the version it was made with, and a file whose version differs
 * is never played (lib/tushky-voice/faq-audio.ts). Changes to `data/tushky/pronunciations.json` are
 * also caught without a bump, because they change the speech hash.
 */
export const TUSHKY_VOICE_VERSION = "tushky-v1";

/** Model when `GEMINI_TTS_MODEL` is unset (§9). Verified on Tushar's key 2026-09-29 (brief §3.6). */
export const DEFAULT_TTS_MODEL = "gemini-3.8-flash-lite-tts";

/** The server's TTS model: `GEMINI_TTS_MODEL`, else the default. Server/scripts only. */
export function ttsModel(env: Record<string, string | undefined> = process.env): string {
  const fromEnv = env.GEMINI_TTS_MODEL?.trim();
  return fromEnv && /^[a-z0-9][a-z0-9.-]{2,80}$/.test(fromEnv) ? fromEnv : DEFAULT_TTS_MODEL;
}

/**
 * The prebuilt voices the audition compares (§37). Character words are Google's own labels from the
 * Gemini speech-generation voice table. `Achird` ("Friendly") is the default until Tushar listens:
 * see docs/reports/TASK-134-setup.md step 2. Original prebuilt voices only; no cloning (§39).
 */
export const AUDITION_VOICES = [
  { name: "Achird", character: "Friendly" },
  { name: "Umbriel", character: "Easy-going" },
  { name: "Algieba", character: "Smooth" },
  { name: "Sadachbia", character: "Lively" },
  { name: "Sulafat", character: "Warm" },
  { name: "Charon", character: "Informative" },
] as const;

/** Every prebuilt Gemini TTS voice name (the audition tool accepts only these; no free-form voice ids). */
export const PREBUILT_VOICES = [
  "Zephyr", "Puck", "Charon", "Kore", "Fenrir", "Leda", "Orus", "Aoede", "Callirrhoe", "Autonoe",
  "Enceladus", "Iapetus", "Umbriel", "Algieba", "Despina", "Erinome", "Algenib", "Rasalgethi", "Laomedeia", "Achernar",
  "Alnilam", "Schedar", "Gacrux", "Pulcherrima", "Achird", "Zubenelgenubi", "Vindemiatrix", "Sadachbia", "Sadaltager", "Sulafat",
] as const;

/**
 * The full performance direction (§13–16, §40), sent as the TTS `speech_metadata.style` annotation
 * so it never becomes part of the spoken transcript. It describes qualities only and names no
 * existing character, actor or voice (§2, §38–39).
 */
export const TUSHKY_STYLE = [
  "Speak as Tushky, a friendly Golden Retriever-inspired professional portfolio assistant.",
  "Voice qualities: warm, relaxed, slightly goofy, charming, approachable, intelligent; a warm smile in the voice.",
  "Use a gentle medium-low pitch, a conversational baritone, soft rounded delivery and the occasional playful pause.",
  "Pace: relaxed, a touch slower than ordinary conversation (about 0.95x), never rushed.",
  "Sound like a friendly companion explaining someone's professional work, not a commercial narrator, radio host or trailer voice.",
  "Keep technical terms clear and precise. Lift the tone slightly for curiosity and discoveries; be firmer for metrics and facts; be softer for caveats, limitations and anything unverified.",
  "Do not exaggerate the cartoon quality: never childish, squeaky, theatrical or slapstick.",
  "When saying \"woof woof\", make it quick, light and understated, then return straight to normal speech. No barking.",
  "Say exactly the words given, in order: add nothing, drop nothing, change no number, name or date.",
  "Never imitate a specific existing fictional character, actor or real person.",
].join(" ");

export const TUSHKY_VOICE = {
  version: TUSHKY_VOICE_VERSION,
  /** Default prebuilt voice (§37). Change it here after the audition, and bump `version`. */
  voice: "Achird",
  style: TUSHKY_STYLE,
  /** Output of Gemini 3.8 TTS: 24 kHz, mono, 16-bit PCM (wrapped as WAV). */
  sampleRate: 24_000,
  channels: 1,
  bitsPerSample: 16,
  limits: {
    /**
     * §18 / §55: answers longer than this are spoken as a summary ("Listen to summary"). 1,200
     * characters is ≈ 190 words ≈ 80 s, and 80 s of 24 kHz 16-bit WAV is ≈ 3.8 MB, under Vercel's
     * 4.5 MB function response limit. Every answer on the site today is shorter (the longest FAQ answer
     * is 900 characters), so today nothing is summarised.
     */
    maxSpeechChars: 1_200,
    maxSpeechWords: 190,
    /** Bytes the route will ever return (a hard stop below Vercel's 4.5 MB body limit). */
    maxAudioBytes: 4_200_000,
    /** Request body cap: a question, an id, a message id and a hash fit in far less. */
    maxRequestBytes: 2_048,
    /** Longest question the route recomputes (the local index's queries are short; FAQ caps at 200). */
    maxQuestionChars: 300,
    /** Gemini call timeout (§53). */
    timeoutMs: 20_000,
  },
  /**
   * §53 per-IP token bucket: a burst of 6 plays, then one every 20 s (3/min sustained). Per server
   * instance only (see lib/tushky-voice/rate-limit.ts).
   */
  rateLimit: { burst: 6, refillPerMinute: 3, maxTrackedClients: 5_000 },
  /** In-memory runtime audio cache (§31–32), per instance: bounded by bytes. */
  runtimeCacheBytes: 32 * 1024 * 1024,
} as const;

/** The loading copy (§22, UI spec §6): a fixed set, never generated. Rotated deterministically. */
export const LOADING_LINES = ["Finding my voice…", "Warming up the woof…", "Almost ready…"] as const;

/** The FAQ entries with pre-generated audio (§27). Suggested questions, generated by the script only. */
export const FAQ_AUDIO_IDS = [
  "who-is-tushar",
  "products-built",
  "ai-experience",
  "strongest-skills",
  "railcite",
  "enterprise-programs",
  "research-background",
  "certifications",
] as const;

/** Where the FAQ audio lives (§28), served as static files. */
export const FAQ_AUDIO_DIR = "public/tushky/audio/faq";
export const FAQ_AUDIO_URL_BASE = "/tushky/audio/faq";
