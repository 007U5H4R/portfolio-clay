/**
 * ask-tushky-data (TKT-104 r2, Tushar's Ask Tushky drawer spec §12 / §19, Design.md §11 Dev-63) — the
 * data behind the drawer's suggestion list and follow-up chips. It is pure data and logic with no
 * React, so `tests/unit/ask-tushky-grounding.test.ts` can pin every entry against the retrieval index.
 *
 * Grounding (EVAL-012 unchanged): the drawer answers only from the deterministic local index. Each
 * suggestion shows Tushar's wording (`label`) and submits a `query` that the index answers from the
 * right entry. Four of his six questions resolve as worded. Two were checked and remapped because,
 * as worded, they matched the product list:
 *   - "Show me his product thinking process." → the `discovery` entry's prompt.
 *   - "Walk me through a specific project." → the `most-technical` entry's prompt (the RailCite walkthrough).
 * Follow-up chips are derived from the answer's sources: other entries that cite the same pages rank
 * first. Each chip submits that entry's exact prompt, so it always resolves. The spec's example
 * "Compare his experience" gets the empty fallback, so it is never offered.
 */
import { knowledge } from "@/data/knowledge";

export type SuggestionCategory = "products" | "impact" | "thinking" | "ai" | "skills" | "project";

export interface TushkySuggestion {
  /** What the card shows and what the user bubble echoes: Tushar's wording, verbatim. */
  label: string;
  /** What is sent to the retrieval index. */
  query: string;
  category: SuggestionCategory;
  /** The knowledge entry this card must resolve to (pinned by the grounding test). */
  entry: string;
}

export const TUSHKY_SUGGESTIONS: readonly TushkySuggestion[] = [
  { label: "What products has Tushar built?", query: "What products has Tushar built?", category: "products", entry: "built" },
  { label: "What impact has he created?", query: "What impact has he created?", category: "impact", entry: "impact" },
  {
    label: "Show me his product thinking process.",
    query: "How do you approach product discovery?",
    category: "thinking",
    entry: "discovery",
  },
  { label: "What is his AI / cloud experience?", query: "What is his AI / cloud experience?", category: "ai", entry: "ai-products" },
  { label: "What are his strongest skills?", query: "What are his strongest skills?", category: "skills", entry: "skills" },
  {
    label: "Walk me through a specific project.",
    query: "Show me your most technical project.",
    category: "project",
    entry: "most-technical",
  },
];

/** A short chip label per knowledge entry, written in third person (Tushky talks about Tushar). */
export const FOLLOW_UP_LABELS: Readonly<Record<string, string>> = {
  built: "What he's built",
  discovery: "His discovery process",
  "ai-products": "His AI products",
  "most-technical": "Tell me about RailCite",
  impact: "Show his impact",
  pm: "Why he's a PM",
  enterprise: "His enterprise experience",
  skills: "His strongest skills",
  learned: "When an assumption failed",
  evaluate: "How he evaluates AI",
  research: "His research background",
};

export interface FollowUp {
  label: string;
  query: string;
}

/** `/work/railcite#06-evaluation` → `/work/railcite`: the page a source lives on. */
const pageOf = (href: string): string => href.replace(/[#?].*$/, "");

const followUpFor = (entry: (typeof knowledge)[number]): FollowUp => ({
  label: FOLLOW_UP_LABELS[entry.id] ?? entry.prompt,
  query: entry.prompt,
});

/**
 * 2–3 follow-ups for an answer from entry `matchedId`. Other entries are ranked by how many source
 * pages they share with it; ties keep index order. If fewer than two share a page, the panel-surface
 * entries fill in. Entries already answered in this conversation (`answered`) are skipped.
 */
export function followUpsFor(matchedId: string, answered: ReadonlySet<string> = new Set()): FollowUp[] {
  const source = knowledge.find((entry) => entry.id === matchedId);
  if (!source) return [];
  const pages = new Set(source.evidence.map((e) => pageOf(e.href)));
  const candidates = knowledge.filter((entry) => entry.id !== matchedId && !answered.has(entry.id));
  const ranked = candidates
    .map((entry, index) => ({
      entry,
      index,
      overlap: new Set(entry.evidence.map((e) => pageOf(e.href)).filter((p) => pages.has(p))).size,
    }))
    .filter((c) => c.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || a.index - b.index)
    .map((c) => c.entry);
  const picked = ranked.slice(0, 3);
  for (const entry of candidates) {
    if (picked.length >= 2) break;
    if (entry.surface.includes("panel") && !picked.includes(entry)) picked.push(entry);
  }
  return picked.map(followUpFor);
}

/** Follow-ups for the empty fallback: the provider's own suggested prompts, relabelled. */
export function followUpsForPrompts(prompts: readonly string[]): FollowUp[] {
  return prompts.slice(0, 3).map((prompt) => {
    const entry = knowledge.find((e) => e.prompt === prompt);
    return { label: (entry && FOLLOW_UP_LABELS[entry.id]) ?? prompt, query: prompt };
  });
}
