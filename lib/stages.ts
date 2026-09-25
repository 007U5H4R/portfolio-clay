import type { ThinkingStageDef } from "@/data/schema";

/** The schema's stage `tone` enum (`data/schema.ts` `Tone`) — type-only, no zod runtime (TKT-90a). */
type Tone = ThinkingStageDef["tone"];

/**
 * The 6 How-I-Think stage ids, in their fixed display order (CONTENT_INVENTORY §1.5:
 * Problem · Insight · Bet · Build · Evaluate · Impact). Type-only import from `data/schema` — no
 * zod runtime crosses into this module, so it stays safe to import from any component.
 */
export type StageId = ThinkingStageDef["id"];
export const STAGE_ORDER: readonly StageId[] = ["problem", "insight", "bet", "build", "evaluate", "impact"];

/**
 * Stage → schema `tone` (technical-plan.md §B S13.01). `data/thinking-framework.ts` still fills each
 * stage's schema-required `tone` field from this map; since M-009 (TKT-76) no component renders it —
 * the paper home section colours a stage by its pin (`stagePin` below), never by a clay wash.
 */
export const stageTone: Record<StageId, Tone> = {
  problem: "sky",
  insight: "butter",
  bet: "lavender",
  build: "peach",
  evaluate: "mint",
  impact: "mint",
};

/** The three paper pin heads (`Pin` `tone`). */
export type StagePinTone = "rust" | "forest" | "steel";

/**
 * Stage → pin colour on the home "How I think" stage cards (TKT-76, S69.04's paper palette). Lifted
 * from docs/redesign-mockups/m-009/home.html `.stage .pin`: rust by default, forest on stages 2 and 5,
 * steel on stages 3 and 6 — so each colour repeats once, three columns apart.
 */
export const stagePin: Record<StageId, StagePinTone> = {
  problem: "rust",
  insight: "forest",
  bet: "steel",
  build: "rust",
  evaluate: "forest",
  impact: "steel",
};

/** Sort any subset/superset of stage-shaped items into the fixed CONTENT_INVENTORY §1.5 order. */
export function orderStages<T extends { id: StageId }>(defs: readonly T[]): T[] {
  return STAGE_ORDER.map((id) => defs.find((d) => d.id === id)).filter((d): d is T => d !== undefined);
}
