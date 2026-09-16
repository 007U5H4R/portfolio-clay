/**
 * LocalKnowledgeProvider — the deterministic, no-I/O, no-network Ask provider (technical-plan.md
 * §A4 steps 3–4; decision S7). Pure and synchronous under the hood; `ask()` returns a Promise so the
 * UI can show its ≤150 ms skeleton and so a future RAG provider is a drop-in swap.
 *
 * Matching (§A4):
 *   1. normalise the query → canonical tokens + bigrams (lib/ask/normalise.ts).
 *   2. zero canonical tokens → the graceful empty answer (no forced match).
 *   3. exact: normalised query === a normalised prompt or alias → score 1.
 *   4. otherwise score = Σ weight(matched keyword) / Σ weight(all keywords) + 0.1 × (matched bigrams),
 *      capped at 1; an entry with zero matched keywords scores 0 (so a bigram bonus can never
 *      manufacture a match from nothing — the no-fabrication invariant).
 *   5. pick the max score; ties broken by (exact first, then array order in knowledge.ts).
 *      score ≥ THRESHOLD → answer with the entry's answer string UNMODIFIED; below → empty.
 *
 * "matched bigrams" are the query's canonical-token bigrams that also appear among the entry's PROMPT
 * bigrams — a small, bounded relevance nudge that only ever raises an entry already matching keywords.
 */
import type { KnowledgeEntry } from "@/data/schema";
import type { Answer, AnswerProvider, AskContext } from "./adapter";
import { normalise, signature } from "./normalise";

/** CONTENT_INVENTORY §1.3 — shown when nothing matches. Never an invented answer. */
export const FALLBACK =
  "I only answer from the sourced facts on this site — try one of the prompts, or email me.";

const DEFAULT_THRESHOLD = 0.34;

interface Scored {
  entry: KnowledgeEntry;
  score: number;
  exact: boolean;
  index: number;
}

interface Compiled {
  entry: KnowledgeEntry;
  signatures: Set<string>; // prompt + alias signatures (exact match)
  promptBigrams: Set<string>;
  totalWeight: number;
  keywordWeights: Map<string, number>; // canonical term → weight
}

export class LocalKnowledgeProvider implements AnswerProvider {
  readonly name = "local";
  private readonly threshold: number;
  private readonly compiled: Compiled[];

  constructor(
    private readonly entries: KnowledgeEntry[],
    opts?: { threshold?: number },
  ) {
    this.threshold = opts?.threshold ?? DEFAULT_THRESHOLD;
    this.compiled = entries.map((entry) => {
      const signatures = new Set<string>([signature(entry.prompt), ...entry.aliases.map(signature)]);
      const keywordWeights = new Map(entry.keywords.map((k) => [k.term, k.weight] as const));
      const totalWeight = entry.keywords.reduce((s, k) => s + k.weight, 0);
      return {
        entry,
        signatures,
        promptBigrams: new Set(normalise(entry.prompt).bigrams),
        totalWeight,
        keywordWeights,
      };
    });
  }

  ask(query: string, ctx?: AskContext): Promise<Answer> {
    return Promise.resolve(this.answerFor(query, ctx));
  }

  /** Synchronous core (exposed for unit tests; `ask()` wraps it in a Promise). */
  answerFor(query: string, ctx?: AskContext): Answer {
    const { tokens, bigrams } = normalise(query);
    const surface = ctx?.surface ?? "home";

    if (tokens.length === 0) return this.empty(query, surface);

    const querySig = tokens.join(" ");
    const tokenSet = new Set(tokens);

    let best: Scored | undefined;

    this.compiled.forEach((c, index) => {
      const exact = c.signatures.has(querySig);
      let score: number;
      if (exact) {
        score = 1;
      } else {
        let matchedWeight = 0;
        for (const [term, weight] of c.keywordWeights) if (tokenSet.has(term)) matchedWeight += weight;
        if (matchedWeight === 0) {
          score = 0;
        } else {
          const matchedBigrams = bigrams.filter((b) => c.promptBigrams.has(b)).length;
          const base = c.totalWeight > 0 ? matchedWeight / c.totalWeight : 0;
          score = Math.min(1, base + 0.1 * matchedBigrams);
        }
      }
      // Tie-break: higher score wins; then exact over non-exact; then earlier array position.
      const better =
        best === undefined ||
        score > best.score ||
        (score === best.score && exact && !best.exact);
      if (better) best = { entry: c.entry, score, exact, index };
    });

    if (best === undefined || best.score < this.threshold) return this.empty(query, surface);

    const entry = best.entry;
    return {
      kind: "answer",
      text: entry.answer, // UNMODIFIED — the no-fabrication invariant (Vitest asserts byte-equality)
      evidence: entry.evidence.map((e) => ({ label: e.label, href: e.href })),
      matched: [entry.id],
      score: best.score,
    };
  }

  /** Up to 3 suggested prompts for `surface`, excluding one equal to `exclude`. */
  suggestionsFor(surface: "home" | "panel", exclude?: string): string[] {
    return this.entries
      .filter((e) => e.surface.includes(surface) && e.prompt !== exclude)
      .slice(0, 3)
      .map((e) => e.prompt);
  }

  private empty(query: string, surface: "home" | "panel"): Answer {
    return {
      kind: "empty",
      text: FALLBACK,
      evidence: [],
      matched: [],
      suggestions: this.suggestionsFor(surface, query),
    };
  }
}
