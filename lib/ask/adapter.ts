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
export type Answer =
  | { kind: "answer"; text: string; evidence: Evidence[]; matched: string[]; score: number }
  | { kind: "empty"; text: string; evidence: Evidence[]; matched: []; suggestions: string[] };

export type AskContext = { route?: string; surface?: "home" | "panel" };

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
