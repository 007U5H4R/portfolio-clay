/**
 * The `/api/tushky/speech` contract shared by the route and the drawer's player (TASK-134, voice
 * spec §11, §54–58; brief §3.3). Client-safe: types and constants only.
 *
 * The client never sends text to speak. It sends the QUESTION it asked, the FAQ id when the answer
 * was a cache hit, the message id, and a hash of the answer text it is showing. The server re-runs
 * the same answer pipeline, checks the recomputed answer is the one on screen, and only then speaks.
 */
export const SPEECH_ENDPOINT = "/api/tushky/speech";

export interface SpeechRequestBody {
  /** The question as it was sent to the answer pipeline (`ChatTurn.query`). */
  question: string;
  /** The drawer's id for the Tushky turn, echoed back for logs/metrics only. */
  messageId: string;
  /** `hashText(answer.text)` of the answer the drawer shows. */
  answerHash: string;
  /** The FAQ entry id, when the answer came from the FAQ cache. */
  faqId?: string;
}

/** Every error the route returns, as `{ "code": … }`. Never a provider message. */
export type SpeechErrorCode =
  | "invalid-request" // 400: malformed JSON, a missing/extra field (e.g. `text`), a bad value
  | "unsupported-media-type" // 415
  | "payload-too-large" // 413
  | "rate-limited" // 429: this client's token bucket is empty
  | "no-audio" // 422: the recomputed answer is empty or a refusal; nothing to speak
  | "answer-mismatch" // 409: the recomputed answer is not the one the client shows
  | "voice-resting" // 503: Google's TTS quota / rate limit (§58)
  | "voice-unavailable"; // 502/503/504: not configured, timeout, provider failure, oversized audio

/** The response headers the player reads. */
export const AUDIO_SOURCE_HEADER = "x-tushky-audio-source"; // "cache" | "gemini"
export const SPEECH_KIND_HEADER = "x-tushky-speech"; // "full" | "summary"

/** Which playback state an error lands in: quota-like errors must not invite a retry (§58, UI §24). */
export function isRestingError(code: string | undefined): boolean {
  return code === "voice-resting" || code === "rate-limited";
}
