/**
 * Query normalisation (technical-plan.md §A4 step 1).
 *
 * NFKC → lowercase → strip punctuation (keep `+`/`#` inside tokens) → collapse whitespace →
 * tokenise → join known multi-word phrases → drop stopwords → canonicalise via the synonym table,
 * DROPPING any token that is not a canonical term or a listed synonym → drop duplicates (keep order).
 * Also returns the bigrams of the resulting canonical tokens.
 *
 * Dropping unknown tokens (rather than keeping them) is the deterministic no-fabrication guard: a
 * query made only of words the matcher does not know ("phone number", "weather in paris") yields zero
 * canonical tokens, so the provider returns the graceful empty answer instead of a forced match.
 */
import {
  canonicalise,
  FAQ_CONTEXT_OPENERS,
  FAQ_CONTEXT_WORDS,
  FAQ_SENSITIVE_WORDS,
  FAQ_STOPWORDS,
  FAQ_SUBJECT_TERMS,
  faqEquivalent,
} from "./synonyms";

/** A4 stopword list (verbatim). "have"/"has" etc. are not listed but drop naturally as unknowns. */
const STOPWORDS = new Set([
  "a", "an", "the", "of", "to", "in", "on", "for", "me", "my", "your", "you", "what", "which",
  "how", "show", "tell", "about", "do", "does", "did", "is", "are", "can", "could", "would", "please",
]);

/** Adjacent-token phrases merged before lookup so "american express" → the `enterprise` canonical,
 *  "product manager" → `pm`, "research background" → `research`. */
const PHRASES = new Map<string, string>([
  ["american express", "americanexpress"],
  ["product manager", "productmanager"],
  ["research background", "researchbackground"],
]);

export interface Normalised {
  tokens: string[]; // canonical terms, de-duplicated, in order
  bigrams: string[]; // adjacent canonical-token pairs, e.g. "ai built"
  raw: string; // cleaned lowercase string (punctuation stripped, whitespace collapsed)
}

export function normalise(q: string): Normalised {
  const cleaned = q
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned.length ? cleaned.split(" ") : [];

  // Merge known adjacent phrases.
  const merged: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i] as string;
    const next = words[i + 1];
    const pair = next !== undefined ? `${word} ${next}` : undefined;
    const phrase = pair ? PHRASES.get(pair) : undefined;
    if (phrase) {
      merged.push(phrase);
      i++;
    } else {
      merged.push(word);
    }
  }

  const tokens: string[] = [];
  const seen = new Set<string>();
  for (const w of merged) {
    if (STOPWORDS.has(w)) continue;
    const canonical = canonicalise(w);
    if (!canonical) continue; // unknown token → dropped (no-fabrication guard)
    if (seen.has(canonical)) continue;
    seen.add(canonical);
    tokens.push(canonical);
  }

  const bigrams: string[] = [];
  for (let i = 0; i + 1 < tokens.length; i++) bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);

  return { tokens, bigrams, raw: cleaned };
}

/** Stable signature for exact prompt/alias matching: the canonical tokens joined by a space. */
export function signature(q: string): string {
  return normalise(q).tokens.join(" ");
}

/* ── FAQ cache normalisation (TASK-123, Tushar's FAQ-cache spec §47–48 / §55–56 / §59) ─────────────── */

/** The one token every reference to Tushar becomes ("he", "his", "Tushar's", "you"). */
export const SUBJECT_TOKEN = "@tushar";

/**
 * §47: NFKC → lowercase → straight apostrophes → expand "what's"-style contractions → drop possessive
 * "'s" → strip punctuation (keep `+`/`#`) → collapse whitespace → trim. Used for the exact and alias levels.
 */
export function normaliseQuestion(q: string): string {
  return q
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[‘’ʼ`´]/g, "'")
    .replace(/\b(what|who|where|how|that|it|he|there)'s\b/g, "$1 is")
    .replace(/'s\b/g, "")
    .replace(/'/g, "")
    .replace(/[^\p{L}\p{N}+#\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Plural stripping, conservative: "products" → "product", but "process", "his", "aws" stay. */
function singular(token: string): string {
  if (token.length > 3 && token.endsWith("s") && !/(ss|us|is)$/.test(token)) return token.slice(0, -1);
  return token;
}

/**
 * The high-confidence intent key (§48 level 3): every word of the question is kept except filler; each
 * reference to Tushar becomes `SUBJECT_TOKEN`; plurals and a few exact paraphrases are folded; the set is
 * sorted. Two questions match at this level only when their keys are EQUAL — one extra idea and the key
 * differs, so "What did Tushar learn from TeachSpark?" ≠ "Tell me about TeachSpark" (§59).
 * Returns "" when nothing meaningful is left (never a match).
 */
export function faqIntentKey(q: string): string {
  const tokens = new Set<string>();
  for (const word of normaliseQuestion(q).split(" ")) {
    if (!word || FAQ_STOPWORDS.has(word)) continue;
    tokens.add(FAQ_SUBJECT_TERMS.has(word) ? SUBJECT_TOKEN : faqEquivalent(singular(word)));
  }
  return [...tokens].sort().join(" ");
}

/**
 * §55–56: true when the question points back into the conversation ("What was hardest about it?",
 * "what about that one?", "tell me more", "and RailCite?"). Such a question is never served from the
 * cache, whatever it would have matched.
 */
export function isContextDependent(q: string): boolean {
  const clean = normaliseQuestion(q);
  if (FAQ_CONTEXT_OPENERS.some((opener) => clean === opener || clean.startsWith(`${opener} `))) return true;
  return clean.split(" ").some((word) => FAQ_CONTEXT_WORDS.has(word));
}

/** §55: private or sensitive topics are never answered from the cache. */
export function isSensitive(q: string): boolean {
  const clean = ` ${normaliseQuestion(q)} `;
  for (const term of FAQ_SENSITIVE_WORDS) if (clean.includes(` ${term} `)) return true;
  return false;
}
