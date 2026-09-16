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
import { canonicalise } from "./synonyms";

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
