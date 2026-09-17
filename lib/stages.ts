import type { ThinkingStageDef } from "@/data/schema";
import type { Tone } from "@/components/clay/tiers";

/**
 * The 6 How-I-Think stage ids, in their fixed display order (CONTENT_INVENTORY §1.5:
 * Problem · Insight · Bet · Build · Evaluate · Impact). Type-only import from `data/schema` — no
 * zod runtime crosses into this module, so it stays safe to import from a client component
 * (`components/home/HowIThink.tsx`).
 */
export type StageId = ThinkingStageDef["id"];
export const STAGE_ORDER: readonly StageId[] = ["problem", "insight", "bet", "build", "evaluate", "impact"];

/**
 * Stage → tone map (technical-plan.md §B S13.01) — the single source of truth `data/thinking-
 * framework.ts` reads to fill each stage's `tone` field, and the mapping later artifact/badge
 * components (TKT-20/21) reuse so a stage always renders the same colour everywhere (Law of
 * Similarity, Design.md §3).
 *
 * Design.md §3 fixes 4 of the 6 outright (Insight→butter, Build→peach, Evaluate/Impact→mint);
 * technical-plan §B S13.01 resolves the two it leaves as "etc." with the remaining calm tones:
 * Problem→sky, Bet→lavender — leaving `blush` free (reserved for error surfaces elsewhere on the
 * site, Design.md §2).
 */
export const stageTone: Record<StageId, Tone> = {
  problem: "sky",
  insight: "butter",
  bet: "lavender",
  build: "peach",
  evaluate: "mint",
  impact: "mint",
};

/** Sort any subset/superset of stage-shaped items into the fixed CONTENT_INVENTORY §1.5 order. */
export function orderStages<T extends { id: StageId }>(defs: readonly T[]): T[] {
  return STAGE_ORDER.map((id) => defs.find((d) => d.id === id)).filter((d): d is T => d !== undefined);
}
