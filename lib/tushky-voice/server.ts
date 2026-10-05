/**
 * Production wiring for the speech route (TASK-134). SERVER ONLY: it imports `faq-versions.ts`
 * (node:crypto) to decide FAQ freshness exactly as the root layout does at build time, and the
 * Gemini client that reads `GEMINI_API_KEY`. The limiter and the runtime cache are module
 * singletons, so they live as long as one warm server instance (see rate-limit.ts).
 */
import faqData from "@/data/tushky/faq.json";
import { TUSHKY_VOICE, ttsModel } from "@/config/tushky-voice";
import { createDefaultProvider } from "@/lib/ask";
import type { FaqEntry } from "@/lib/ask/faq";
import { freshFaqIds } from "@/lib/ask/faq-versions";
import { createTushkyPipeline } from "@/lib/ask/pipeline";
import { AudioCache } from "./audio-cache";
import { TokenBucketLimiter } from "./rate-limit";
import type { SpeechRouteDeps } from "./speech-route";
import { geminiClientFromEnv } from "./tts-client";

const FAQ = faqData as FaqEntry[];

/** The server's Ask pipeline: the drawer's, with the server's own FAQ freshness. */
export function serverAnswerPipeline() {
  return createTushkyPipeline(FAQ, createDefaultProvider(), { fresh: freshFaqIds(FAQ) });
}

let deps: SpeechRouteDeps | undefined;

export function defaultSpeechDeps(): SpeechRouteDeps {
  deps ??= {
    tts: geminiClientFromEnv(),
    answers: serverAnswerPipeline(),
    limiter: new TokenBucketLimiter(TUSHKY_VOICE.rateLimit),
    cache: new AudioCache(TUSHKY_VOICE.runtimeCacheBytes),
    model: ttsModel(),
  };
  return deps;
}
