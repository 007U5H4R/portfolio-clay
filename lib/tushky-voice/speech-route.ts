/**
 * The speech route's logic (TASK-134, voice spec §11–12, §31–32, §41, §53–59; brief §3.3–3.5).
 * SERVER ONLY. `app/api/tushky/speech/route.ts` wires it to production dependencies; the unit tests
 * call it with a fake TTS client, so no test reaches Google.
 *
 *   POST {question, messageId, answerHash, faqId?}
 *     → per-IP token bucket (429)
 *     → size, type and shape checks (413 / 415 / 400) — any other field, `text` included, is refused
 *     → re-run the Ask pipeline on `question` (FAQ cache → local index)
 *     → empty answer / refusal → 422, no audio
 *     → a different answer from the one the client shows (hash / FAQ id) → 409
 *     → speech normalisation → runtime cache → Gemini TTS with a timeout
 *     → 200 audio/wav
 *
 * So the endpoint can only ever speak a real Tushky answer (§54–56); it is not a public TTS service.
 * Errors are `{ code }` JSON with a fixed vocabulary; provider messages and the key never appear.
 */
import { TUSHKY_VOICE } from "@/config/tushky-voice";
import { FAQ_MAX_QUESTION_LENGTH } from "@/lib/ask/faq";
import { faqIdOf, isSpeakable } from "@/lib/ask/pipeline";
import type { AnswerProvider } from "@/lib/ask/adapter";
import { AudioCache, speechCacheKey } from "./audio-cache";
import { AUDIO_SOURCE_HEADER, SPEECH_KIND_HEADER, type SpeechErrorCode } from "./contract";
import { HASH_PATTERN, hashText } from "./hash";
import { clientKey, TokenBucketLimiter } from "./rate-limit";
import { toSpeechText } from "./speech-text";
import { TtsError, type TtsClient } from "./tts-client";

/** One structured line per request (§59): counts, cache hit/miss, latency, size, failures. No text, key or IP. */
export interface SpeechLogEvent {
  outcome: "audio" | "refused" | "error";
  status: number;
  code?: SpeechErrorCode | undefined;
  cache?: "hit" | "miss" | undefined;
  answerType?: "faq" | "generated" | undefined;
  ttsMs?: number | undefined;
  totalMs: number;
  bytes?: number | undefined;
  providerStatus?: number | undefined;
  summary?: boolean | undefined;
}

export interface SpeechRouteDeps {
  tts: TtsClient;
  /** The Ask pipeline (FAQ cache → local index), built with the server's own FAQ freshness. */
  answers: AnswerProvider;
  limiter: TokenBucketLimiter;
  cache: AudioCache;
  model: string;
  voice?: string;
  now?: () => number;
  log?: (event: SpeechLogEvent) => void;
}

const MESSAGE_ID = /^[A-Za-z0-9_-]{1,64}$/;
const FAQ_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALLOWED_KEYS = new Set(["question", "messageId", "answerHash", "faqId"]);

const STATUS: Record<SpeechErrorCode, number> = {
  "invalid-request": 400,
  "unsupported-media-type": 415,
  "payload-too-large": 413,
  "rate-limited": 429,
  "no-audio": 422,
  "answer-mismatch": 409,
  "voice-resting": 503,
  "voice-unavailable": 503,
};

function errorResponse(code: SpeechErrorCode, status = STATUS[code], headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({ code }), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...headers },
  });
}

type Parsed = { ok: true; question: string; messageId: string; answerHash: string; faqId?: string } | { ok: false; code: SpeechErrorCode };

async function parse(request: Request): Promise<Parsed> {
  const { maxRequestBytes, maxQuestionChars } = TUSHKY_VOICE.limits;
  if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    return { ok: false, code: "unsupported-media-type" };
  }
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > maxRequestBytes) return { ok: false, code: "payload-too-large" };
  const raw = await request.arrayBuffer();
  if (raw.byteLength > maxRequestBytes) return { ok: false, code: "payload-too-large" };
  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder().decode(raw));
  } catch {
    return { ok: false, code: "invalid-request" };
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) return { ok: false, code: "invalid-request" };
  const record = body as Record<string, unknown>;
  // Strict shape: anything else — `text`, `voiceProfile`, `speechText` — is refused, never ignored.
  if (Object.keys(record).some((key) => !ALLOWED_KEYS.has(key))) return { ok: false, code: "invalid-request" };
  const { question, messageId, answerHash, faqId } = record;
  if (typeof question !== "string" || typeof messageId !== "string" || typeof answerHash !== "string") return { ok: false, code: "invalid-request" };
  const q = question.trim();
  if (!q || q.length > Math.max(maxQuestionChars, FAQ_MAX_QUESTION_LENGTH)) return { ok: false, code: "invalid-request" };
  if (!MESSAGE_ID.test(messageId) || !HASH_PATTERN.test(answerHash)) return { ok: false, code: "invalid-request" };
  if (faqId !== undefined && (typeof faqId !== "string" || faqId.length > 64 || !FAQ_ID.test(faqId))) return { ok: false, code: "invalid-request" };
  return { ok: true, question: q, messageId, answerHash, ...(typeof faqId === "string" ? { faqId } : {}) };
}

export async function handleSpeechRequest(request: Request, deps: SpeechRouteDeps): Promise<Response> {
  const now = deps.now ?? Date.now;
  const started = now();
  const log = (event: Omit<SpeechLogEvent, "totalMs">) => {
    try {
      (deps.log ?? defaultLog)({ ...event, totalMs: now() - started });
    } catch {
      // logging never breaks a response
    }
  };
  const refuse = (code: SpeechErrorCode, extra: Omit<SpeechLogEvent, "totalMs" | "outcome" | "status" | "code"> = {}, headers?: Record<string, string>) => {
    const status = STATUS[code];
    log({ outcome: code === "voice-resting" || code === "voice-unavailable" ? "error" : "refused", status, code, ...extra });
    return errorResponse(code, status, headers);
  };

  // 1. Rate limit first: a flood costs one map lookup per request, not a parse or a recompute.
  const decision = deps.limiter.take(clientKey(request.headers), now());
  if (!decision.ok) return refuse("rate-limited", {}, { "retry-after": String(Math.max(1, Math.ceil(decision.retryAfterMs / 1000))) });

  // 2. Shape.
  const parsed = await parse(request);
  if (!parsed.ok) return refuse(parsed.code);

  // 3. Recompute the answer with the site's own pipeline: this is the only text that can be spoken.
  const answer = await deps.answers.ask(parsed.question, { surface: "panel" });
  if (!isSpeakable(answer)) return refuse("no-audio");
  const faqId = faqIdOf(answer);
  const answerType = faqId ? "faq" : "generated";
  if (parsed.faqId !== undefined && parsed.faqId !== faqId) return refuse("answer-mismatch", { answerType });
  if (hashText(answer.text) !== parsed.answerHash) return refuse("answer-mismatch", { answerType });

  // 4. Speech text (§5–8, §18).
  const { speechText, isSummary } = toSpeechText(answer.text);
  if (!speechText) return refuse("no-audio", { answerType });

  // 5. Cache first (§32), then Gemini with a deadline (§53).
  const voice = deps.voice ?? TUSHKY_VOICE.voice;
  const key = speechCacheKey({ version: TUSHKY_VOICE.version, model: deps.model, voice, speechText });
  let audio = deps.cache.get(key);
  let cache: "hit" | "miss" = "hit";
  let ttsMs: number | undefined;
  if (!audio) {
    cache = "miss";
    const ttsStarted = now();
    try {
      audio = await deps.tts.synthesize({
        text: speechText,
        style: TUSHKY_VOICE.style,
        voice,
        model: deps.model,
        format: "wav",
        signal: AbortSignal.timeout(TUSHKY_VOICE.limits.timeoutMs),
      });
    } catch (err) {
      ttsMs = now() - ttsStarted;
      const tts = err instanceof TtsError ? err : new TtsError("upstream");
      if (tts.code === "quota") return refuse("voice-resting", { answerType, cache, ttsMs, providerStatus: tts.status });
      const status = tts.code === "timeout" ? 504 : tts.code === "not-configured" ? 503 : 502;
      log({ outcome: "error", status, code: "voice-unavailable", answerType, cache, ttsMs, providerStatus: tts.status });
      return errorResponse("voice-unavailable", status);
    }
    ttsMs = now() - ttsStarted;
    if (audio.audio.byteLength === 0 || audio.audio.byteLength > TUSHKY_VOICE.limits.maxAudioBytes) {
      log({ outcome: "error", status: 502, code: "voice-unavailable", answerType, cache, ttsMs, bytes: audio.audio.byteLength });
      return errorResponse("voice-unavailable", 502);
    }
    deps.cache.set(key, audio);
  }

  log({ outcome: "audio", status: 200, answerType, cache, ttsMs, bytes: audio.audio.byteLength, summary: isSummary });
  return new Response(audio.audio as unknown as BodyInit, {
    status: 200,
    headers: {
      "content-type": audio.mimeType,
      "content-length": String(audio.audio.byteLength),
      "cache-control": "no-store",
      [AUDIO_SOURCE_HEADER]: cache === "hit" ? "cache" : "gemini",
      [SPEECH_KIND_HEADER]: isSummary ? "summary" : "full",
      ...(ttsMs !== undefined ? { "server-timing": `tts;dur=${ttsMs}` } : {}),
    },
  });
}

function defaultLog(event: SpeechLogEvent): void {
  // One JSON line per request; Vercel's function logs are the metrics store (§59). No key, text or IP.
  console.info(`[tushky-voice] ${JSON.stringify(event)}`);
}
