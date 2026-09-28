/**
 * Ask adapter contract (technical-plan.md §A4, decision TP3 / S7).
 *
 * The Ask is DETERMINISTIC in v1: answers come only from `data/knowledge.ts` via the
 * `LocalKnowledgeProvider`. This file defines the provider-agnostic types every provider implements,
 * plus `AskError`. It is **zod-free on purpose**: CLIENT components import `AskError` and these types
 * from here (directly or via `lib/ask/index.ts`), so the zod `AnswerSchema` that guards the RAG
 * boundary lives in a separate module (`answer-schema.ts`, imported only by `rag-provider.ts` and the
 * tests). Keeping zod out of this module is what keeps it out of the client bundle (A4/A6/A1).
 */

/** A single sourced link shown under an answer. `href` is validated at data-build time via routes(). */
export type Evidence = { label: string; href: string };

/**
 * A provider's reply. `answer` carries the entry's answer string UNMODIFIED (the no-fabrication
 * invariant — Vitest asserts byte-equality against `KnowledgeEntry.answer`); `empty` is the graceful
 * fallback (no match / no canonical tokens) with fresh suggestions and never an invented answer.
 */
/**
 * Where an answer came from (TASK-123, Tushar's FAQ-cache spec §49). `faq-cache` = a curated answer from
 * `data/tushky/faq.json`; `local-index` = the deterministic knowledge index; `gemini` is reserved for a
 * future generated path. Absent on answers from providers that predate the field (the local index).
 */
export type SourceType = "faq-cache" | "local-index" | "gemini";

/** A follow-up chip: `label` is shown, `query` is asked. */
export type SuggestedFollowUp = { label: string; query: string };

export type Answer =
  | {
      kind: "answer";
      text: string;
      evidence: Evidence[];
      matched: string[];
      score: number;
      /** §49 response contract. Optional so the local index's replies stay byte-identical. */
      sourceType?: SourceType;
      /** Follow-ups the provider chose; when absent the UI derives them from the knowledge index. */
      suggestedFollowUps?: SuggestedFollowUp[];
      /** True when the answer copy is not yet signed off by Tushar (the UI shows the DRAFT tag). */
      draft?: boolean;
    }
  | { kind: "empty"; text: string; evidence: Evidence[]; matched: []; suggestions: string[] };

export type AskContext = {
  route?: string;
  surface?: "home" | "panel";
  /**
   * TASK-123 (§55–56): the questions already asked earlier in this conversation, oldest first. The FAQ
   * cache uses it only to skip follow-up chips that were already answered; a future generated provider
   * gets the conversation context it needs for follow-ups the cache refuses to serve.
   */
  history?: readonly string[];
};

export interface AnswerProvider {
  readonly name: string;
  ask(query: string, ctx?: AskContext): Promise<Answer>;
}

/** Thrown by network-backed providers (the local provider never throws — it degrades to `empty`). */
export class AskError extends Error {
  constructor(
    msg: string,
    readonly cause?: unknown,
  ) {
    super(msg);
    this.name = "AskError";
  }
}
