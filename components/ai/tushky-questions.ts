/**
 * tushky-questions (TKT-113, Tushar's Home Ask Tushky spec §12 / §13 / §25; Design.md §11 Dev-66) — the
 * ONE list of suggested questions shared by the Home "Ask Tushky" launcher and the drawer's empty state,
 * with each category's icon. It is pure data with no `knowledge` import, so the Home launcher (a client
 * leaf on `/`) can import it without pulling the retrieval index into `/` first-load JS (A1, EVAL-005).
 * `ask-tushky-data.ts` re-exports it under the same names, so the drawer and the grounding test are
 * unchanged.
 *
 * The labels are Tushar's Home-spec wording and order (2-column grid, row-major). Each card shows
 * `label` and submits `query`; `entry` is the knowledge entry it must resolve to, pinned by
 * `tests/unit/ask-tushky-grounding.test.ts`. Two questions are remapped because, as worded, the index
 * answers them from the product list:
 *   - "Show me his product thinking process." → the `discovery` entry's prompt.
 *   - "Walk me through a specific project." → the `most-technical` entry's prompt (the RailCite walkthrough).
 */
import { Briefcase, ChartNoAxesColumn, CodeXml, FileText, GraduationCap, Lightbulb, type LucideIcon } from "lucide-react";

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
  { label: "What AI products has he worked on?", query: "What AI products has he worked on?", category: "ai", entry: "ai-products" },
  { label: "What impact has he created?", query: "What impact has he created?", category: "impact", entry: "impact" },
  { label: "What are his strongest skills?", query: "What are his strongest skills?", category: "skills", entry: "skills" },
  {
    label: "Show me his product thinking process.",
    query: "How do you approach product discovery?",
    category: "thinking",
    entry: "discovery",
  },
  {
    label: "Walk me through a specific project.",
    query: "Show me your most technical project.",
    category: "project",
    entry: "most-technical",
  },
];

/** One icon per category (spec §13); the pastel circle colours live in globals.css, keyed by `data-category`. */
export const CATEGORY_ICONS: Readonly<Record<SuggestionCategory, LucideIcon>> = {
  products: Briefcase,
  ai: CodeXml,
  impact: ChartNoAxesColumn,
  skills: GraduationCap,
  thinking: Lightbulb,
  project: FileText,
};
