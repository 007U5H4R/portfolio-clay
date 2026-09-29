/**
 * The Ask Tushky answer pipeline, in one place (TASK-134, brief §3.3): FAQ cache → local index. The
 * drawer (`AskPanel`) builds it in the browser and the speech route (`/api/tushky/speech`) builds the
 * very same thing on the server, so the voice can only ever speak an answer the drawer would show:
 * the route never takes text to speak, it re-asks the question here.
 *
 * Pure and client-safe (no node APIs). The server supplies `fresh` from `freshFaqIds()`; the client
 * gets the same list from the root layout, computed at build time from the same data.
 */
import type { Answer, AnswerProvider } from "./adapter";
import { FaqCacheProvider, FAQ_MATCH_PREFIX, type FaqCacheOptions, type FaqEntry } from "./faq";
import { FALLBACK } from "./local-provider";

export function createTushkyPipeline(faq: readonly FaqEntry[], fallback: AnswerProvider, options: FaqCacheOptions): FaqCacheProvider {
  return new FaqCacheProvider(faq, fallback, options);
}

/** The FAQ entry id behind a cached answer (`matched: ["faq:<id>"]`), else undefined. */
export function faqIdOf(answer: Answer): string | undefined {
  if (answer.kind !== "answer" || answer.sourceType !== "faq-cache") return undefined;
  const first = answer.matched[0];
  return first?.startsWith(FAQ_MATCH_PREFIX) ? first.slice(FAQ_MATCH_PREFIX.length) : undefined;
}

/**
 * True when an answer may be spoken: a real answer with text. The `empty` fallback ("I only answer
 * from the sourced facts…") is a refusal, so it gets no voice (brief §3.3).
 */
export function isSpeakable(answer: Answer): answer is Extract<Answer, { kind: "answer" }> {
  return answer.kind === "answer" && answer.text.trim().length > 0 && answer.text !== FALLBACK;
}
