/**
 * Ask adapter contract (technical-plan.md §A4, decision TP3 / S7).
 *
 * The Ask is DETERMINISTIC in v1: answers come only from `data/knowledge.ts` via the
 * `LocalKnowledgeProvider`. This file defines the provider-agnostic types every provider implements,
 * plus a zod `AnswerSchema` that guards the RAG boundary — a future backend (see `rag-provider.ts`)
 * cannot return a shape the UI does not understand. No component imports zod (it lives in this
 * pure-logic module, consumed by the RAG provider and tests only), so no client bundle pulls it in.
 */
import { z } from "zod";

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

/* ── zod schema mirroring `Answer` (the RAG boundary) ──────────── */
const EvidenceSchema = z.object({ label: z.string().min(1), href: z.string().min(1) });

/** Parses an untrusted provider reply. `answer` MUST carry evidence (≥1); `empty` may carry none. */
export const AnswerSchema: z.ZodType<Answer> = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("answer"),
    text: z.string().min(1),
    evidence: z.array(EvidenceSchema).min(1),
    matched: z.array(z.string()),
    score: z.number(),
  }),
  z.object({
    kind: z.literal("empty"),
    text: z.string().min(1),
    evidence: z.array(EvidenceSchema),
    matched: z.tuple([]),
    suggestions: z.array(z.string()),
  }),
]) as z.ZodType<Answer>;
