/**
 * The zod `AnswerSchema` that guards the RAG boundary (technical-plan.md §A4, decision TP3 / S7).
 *
 * Split out of `adapter.ts` (TKT-10, EXE): `adapter.ts` defines `AskError` and the pure `Answer`
 * types that CLIENT components import, so it must stay zod-free — otherwise the first client to import
 * from `lib/ask` drags all of zod into the home bundle (measured +108 kB gz), breaking A4's explicit
 * "no client bundle pulls in zod" promise and the A6/A1 first-load budget. This module is imported
 * only by `rag-provider.ts` (a reserved, unwired stub) and the adapter tests — never by any component.
 */
import { z } from "zod";
import type { Answer } from "./adapter";

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
