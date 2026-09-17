/**
 * Ask module barrel + the wired default provider (technical-plan.md §A4).
 *
 * `createDefaultProvider()` returns the deterministic LocalKnowledgeProvider bound to the live
 * knowledge base — the single place the app constructs a provider. Swapping to a RAG backend later is
 * a one-line change here (plus the EV1 "add AI evals" rule); `rag-provider.ts` is intentionally NOT
 * re-exported so no app/component code can import it (S09.06 gate).
 */
import { knowledge } from "@/data/knowledge";
import type { AnswerProvider } from "./adapter";
import { LocalKnowledgeProvider } from "./local-provider";

export { LocalKnowledgeProvider, FALLBACK } from "./local-provider";
export { AskError } from "./adapter";
export type { Answer, AnswerProvider, AskContext, Evidence } from "./adapter";

export function createDefaultProvider(): AnswerProvider {
  return new LocalKnowledgeProvider(knowledge);
}
