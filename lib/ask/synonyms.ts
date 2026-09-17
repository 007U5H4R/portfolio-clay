/**
 * Synonym table (technical-plan.md §A4 step 2) — one canonical term per row.
 *
 * The keys of `SYNONYMS` are the canonical vocabulary; every value maps to its canonical term. A
 * token that is neither a canonical term nor a listed synonym has no meaning to the matcher and is
 * DROPPED during normalisation (this is what makes off-topic probes like "phone number" / "salary" /
 * "address" resolve to zero canonical tokens → an empty answer, never a fabricated one).
 *
 * Extend only with evidence. Multi-word inputs ("american express", "product manager", "research
 * background") are joined by `normalise()` before lookup — the joined forms appear in the rows below.
 *
 * Note on `research` vs `discovery`: the bare word "research" is a synonym of `discovery` (product
 * research), while the canonical `research` term (academic/patent work) is reached via patent / paper
 * / phd / biosensor / the joined "researchbackground" — so a product-discovery query never lands on
 * the academic-research answer.
 */
export const SYNONYMS: Record<string, readonly string[]> = {
  built: ["build", "builds", "building", "built", "shipped", "ship", "made", "created", "projects", "project", "products", "product", "work", "portfolio"],
  ai: ["ai", "genai", "llm", "llms", "ml", "gpt", "claude", "rag", "agent", "agents", "agentic"],
  enterprise: ["enterprise", "corporate", "amex", "americanexpress", "american", "express", "quantiphi", "godrej", "shellkode", "company", "employer", "job"],
  technical: ["technical", "architecture", "stack", "engineering", "code", "system", "backend", "pipeline", "hardest", "complex", "deepest"],
  impact: ["impact", "results", "outcomes", "metrics", "numbers", "achieved", "achievements", "kpi", "traction"],
  discovery: ["discovery", "research", "interviews", "interview", "users", "customer", "problem", "validate", "validation", "assumptions"],
  skills: ["skills", "strengths", "strength", "good", "best", "competencies", "capabilities", "superpower"],
  evaluate: ["evaluate", "evaluation", "evals", "eval", "test", "tests", "testing", "measure", "quality", "qa"],
  learned: ["learned", "learn", "lesson", "lessons", "failed", "failure", "wrong", "mistake", "mistakes", "assumption", "killed", "kill", "pivot"],
  research: ["patent", "paper", "papers", "publication", "published", "phd", "academic", "biosensor", "research-background"],
  pm: ["pm", "product-manager", "manager", "management", "why", "makes", "qualifies"],
  experience: ["experience", "career", "background", "history", "timeline", "years", "worked"],
  railcite: ["railcite", "railway", "circulars", "citation", "citations"],
  teachspark: ["teachspark", "teachers", "teacher", "whatsapp", "worksheets"],
  velora: ["velora", "nuptis", "vendor", "vendors", "onboarding", "apparel", "wedding", "weddings", "sourcing"],
};

/** Strip token punctuation the same way `normalise()` does, so hyphenated rows ("product-manager")
 *  and joined query tokens ("productmanager") share one key. */
const stripPunct = (s: string): string => s.toLowerCase().replace(/[^\p{L}\p{N}+#]/gu, "");

/**
 * Flat lookup: every (punctuation-stripped) synonym → its canonical term. Built ONLY from the RHS
 * lists (each canonical appears in its own row — except `research`, deliberately: the bare word
 * "research" is a `discovery` synonym, and `research` is reached via patent/paper/phd/etc. and the
 * joined "researchbackground"). We do NOT auto-map each canonical key to itself, which would override
 * that intent and make "research" resolve to the academic answer instead of product discovery.
 */
const LOOKUP: Map<string, string> = (() => {
  const m = new Map<string, string>();
  for (const [canonical, terms] of Object.entries(SYNONYMS)) {
    for (const t of terms) m.set(stripPunct(t), canonical);
  }
  return m;
})();

/** The set of canonical terms (used by tests / keyword validation). */
export const CANONICAL_TERMS: readonly string[] = Object.keys(SYNONYMS);

/**
 * Map a single (already punctuation-stripped, lowercased) token to its canonical term, or `undefined`
 * when the token carries no meaning to the matcher (so the caller drops it).
 */
export function canonicalise(token: string): string | undefined {
  return LOOKUP.get(stripPunct(token));
}
