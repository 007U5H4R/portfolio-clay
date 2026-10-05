/**
 * The TTS client seam (TASK-134, voice spec §9, §11–12, §34, §40, §53, §58). SERVER / SCRIPTS ONLY.
 *
 * `TtsClient` is the interface the speech route, the FAQ-audio script and the audition tool depend on;
 * tests pass a fake, so no test ever reaches Google. `GeminiTtsClient` is the one real implementation.
 * It talks to the Gemini Developer API over plain `fetch` (no SDK dependency), in the request shape
 * Google documents for each model family:
 *
 *   - Gemini 3.8 TTS (`gemini-3.8-flash-tts`, `gemini-3.8-flash-lite-tts`) use the Interactions API:
 *     `POST /v1beta/interactions` with the transcript as `input[].text` and the performance direction
 *     as a `speech_metadata` annotation, so style never becomes spoken words (§40). A unary call
 *     returns 24 kHz mono 16-bit audio, already WAV (or MP3 when asked for).
 *   - Older TTS models (`gemini-2.5-*-preview-tts`, `gemini-3.1-flash-tts-preview`) use
 *     `POST /v1beta/models/{model}:generateContent` with `responseModalities: ["AUDIO"]`; they return
 *     raw PCM (`audio/L16;rate=24000`), which `toWav()` wraps. They have no style field, so the style
 *     is sent as a leading instruction, which is how Google documents those models.
 *
 * Sources: https://ai.google.dev/gemini-api/docs/speech-generation, the official cookbook
 * (github.com/google-gemini/cookbook quickstarts/Get_started_TTS.ipynb, Gemini 3.8 edition) and the
 * `@google/genai` 2.24.0 type definitions (`interactions.create`, `AudioResponseFormat`,
 * `SpeechAnnotation`). See docs/reports/TASK-134.md.
 *
 * Key hygiene (§12, §59): the key is read once from `GEMINI_API_KEY` and sent only in the
 * `x-goog-api-key` header. No error, log line or thrown message contains it, and no provider error
 * text is ever passed on: callers get a `TtsError` with a fixed code.
 */
import { TUSHKY_VOICE, ttsModel } from "@/config/tushky-voice";
import { rateFromMime, toWav } from "./wav";

export type TtsFormat = "wav" | "mp3";

export interface TtsRequest {
  /** The exact transcript (already normalised). */
  text: string;
  /** Performance direction, never spoken. */
  style: string;
  voice: string;
  model: string;
  format: TtsFormat;
  signal?: AbortSignal | undefined;
}

export interface TtsResult {
  audio: Uint8Array;
  mimeType: "audio/wav" | "audio/mpeg";
}

export interface TtsClient {
  synthesize(request: TtsRequest): Promise<TtsResult>;
}

/**
 * `not-configured` — no key, or the key was refused; `quota` — Google's quota / rate limit (§58);
 * `timeout` — our deadline passed; `upstream` — any other provider failure; `bad-response` — a reply
 * with no usable audio.
 */
export type TtsErrorCode = "not-configured" | "quota" | "timeout" | "upstream" | "bad-response";

export class TtsError extends Error {
  constructor(
    readonly code: TtsErrorCode,
    /** The provider's HTTP status, for server logs only. */
    readonly status?: number,
  ) {
    super(`tts ${code}${status ? ` (${status})` : ""}`);
    this.name = "TtsError";
  }
}

export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com";

/** Gemini 3.8+ TTS speaks through the Interactions API; the earlier previews through generateContent. */
export function usesInteractionsApi(model: string): boolean {
  return !/^gemini-(?:2\.\d|3\.[0-7])(?:[.-]|$)/.test(model);
}

/** The body for `POST /v1beta/interactions` (Gemini 3.8 TTS). Exported for the contract test. */
export function interactionsBody(req: TtsRequest): Record<string, unknown> {
  return {
    model: req.model,
    input: [{ type: "text", text: req.text, annotations: [{ type: "speech_metadata", style: req.style }] }],
    response_format: req.format === "mp3" ? { type: "audio", mime_type: "audio/mp3", bit_rate: 48_000 } : { type: "audio" },
    generation_config: { speech_config: [{ voice: req.voice }] },
    // Nothing about a visitor's listen needs to live on Google's side.
    store: false,
  };
}

/** The body for `POST /v1beta/models/{model}:generateContent` (earlier TTS previews). */
export function generateContentBody(req: TtsRequest): Record<string, unknown> {
  return {
    contents: [{ parts: [{ text: `${req.style}\n\nRead this aloud, exactly:\n${req.text}` }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: req.voice } } },
    },
  };
}

type AudioBlock = { data?: string; mime_type?: string; mimeType?: string; sample_rate?: number };

/** The first audio block in an Interactions reply (`steps[].content[]`, or the SDK-style `output_audio`). */
function audioFromInteraction(json: unknown): AudioBlock | undefined {
  const reply = json as { output_audio?: AudioBlock; steps?: { type?: string; content?: (AudioBlock & { type?: string })[] }[] };
  if (reply?.output_audio?.data) return reply.output_audio;
  for (const step of [...(reply?.steps ?? [])].reverse()) {
    const audio = step?.content?.find((c) => c?.type === "audio" && typeof c.data === "string");
    if (audio) return audio;
  }
  return undefined;
}

function audioFromGenerateContent(json: unknown): AudioBlock | undefined {
  const reply = json as { candidates?: { content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] } }[] };
  const part = reply?.candidates?.[0]?.content?.parts?.find((p) => typeof p?.inlineData?.data === "string");
  return part?.inlineData;
}

function decodeBase64(data: string): Uint8Array {
  return new Uint8Array(Buffer.from(data, "base64"));
}

export interface GeminiTtsClientOptions {
  apiKey: string | undefined;
  fetch?: typeof fetch;
  baseUrl?: string;
}

export class GeminiTtsClient implements TtsClient {
  private readonly apiKey: string | undefined;
  private readonly fetchImpl: typeof fetch;
  private readonly baseUrl: string;

  constructor(options: GeminiTtsClientOptions) {
    this.apiKey = options.apiKey?.trim() || undefined;
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.baseUrl = options.baseUrl ?? GEMINI_BASE_URL;
  }

  get configured(): boolean {
    return this.apiKey !== undefined;
  }

  async synthesize(req: TtsRequest): Promise<TtsResult> {
    if (!this.apiKey) throw new TtsError("not-configured");
    const interactions = usesInteractionsApi(req.model);
    const url = interactions
      ? `${this.baseUrl}/v1beta/interactions`
      : `${this.baseUrl}/v1beta/models/${encodeURIComponent(req.model)}:generateContent`;
    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": this.apiKey },
        body: JSON.stringify(interactions ? interactionsBody(req) : generateContentBody(req)),
        ...(req.signal ? { signal: req.signal } : {}),
      });
    } catch (err) {
      if (req.signal?.aborted || (err as { name?: string })?.name === "AbortError" || (err as { name?: string })?.name === "TimeoutError") {
        throw new TtsError("timeout");
      }
      throw new TtsError("upstream");
    }

    if (!response.ok) {
      // Read the status word only; the provider's message never leaves this function (§57).
      let status = "";
      try {
        status = String(((await response.json()) as { error?: { status?: string } })?.error?.status ?? "");
      } catch {
        // not JSON: the HTTP status is enough
      }
      if (response.status === 429 || status === "RESOURCE_EXHAUSTED") throw new TtsError("quota", response.status);
      if (response.status === 401 || response.status === 403 || status === "PERMISSION_DENIED" || status === "UNAUTHENTICATED") {
        throw new TtsError("not-configured", response.status);
      }
      throw new TtsError("upstream", response.status);
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      throw new TtsError("bad-response", response.status);
    }
    const block = interactions ? audioFromInteraction(json) : audioFromGenerateContent(json);
    if (!block?.data) throw new TtsError("bad-response", response.status);
    const bytes = decodeBase64(block.data);
    if (bytes.length === 0) throw new TtsError("bad-response", response.status);
    const mime = (block.mime_type ?? block.mimeType ?? "").toLowerCase();
    if (mime.includes("mp3") || mime.includes("mpeg")) return { audio: bytes, mimeType: "audio/mpeg" };
    const sampleRate = block.sample_rate ?? rateFromMime(mime) ?? TUSHKY_VOICE.sampleRate;
    return {
      audio: toWav(bytes, { sampleRate, channels: TUSHKY_VOICE.channels, bitsPerSample: TUSHKY_VOICE.bitsPerSample }),
      mimeType: "audio/wav",
    };
  }
}

/** The production client: the key from the server environment only (§11). */
export function geminiClientFromEnv(env: Record<string, string | undefined> = process.env): GeminiTtsClient {
  return new GeminiTtsClient({ apiKey: env.GEMINI_API_KEY });
}

/** The request the route and the scripts send for a transcript, from the central config (§36). */
export function tushkyTtsRequest(text: string, overrides: Partial<Pick<TtsRequest, "voice" | "format" | "model">> = {}): TtsRequest {
  return {
    text,
    style: TUSHKY_VOICE.style,
    voice: overrides.voice ?? TUSHKY_VOICE.voice,
    model: overrides.model ?? ttsModel(),
    format: overrides.format ?? "wav",
  };
}
