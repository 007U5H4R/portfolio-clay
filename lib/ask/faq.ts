/**
 * Ask Tushky FAQ cache (TASK-123, Tushar's FAQ-cache spec 2026-09-28 §44–66,
 * `docs/redesign-mockups/m-009/tushar-2026-09-28/tushky-faq-cache-spec.md`).
 *
 * Level 1 of §52: a curated, versioned list of answers in `data/tushky/faq.json` that Tushar can open
 * and edit (§61). `FaqCacheProvider` sits in front of the normal answer path behind the same
 * `AnswerProvider` seam:
 *
 *   question → validate → context-dependent or sensitive? → miss
 *            → exact normalised question → alias → high-confidence intent key (§48, in that order)
 *            → hit on a FRESH entry → the cached answer, at once (§57)
 *            → anything else (no match, stale entry) → the fallback provider (today the local index;
 *              a future generated provider slots in here unchanged, §58 / §64)
 *
 * Matching is deterministic and local — no LLM decides whether a question matches (§48). The intent
 * level only accepts an EQUAL word set (see `faqIntentKey`), which is what keeps "What did Tushar learn
 * from TeachSpark?" off "Tell me about TeachSpark" (§59).
 *
 * Freshness (§51) is decided at build time on the server (`lib/ask/faq-versions.ts`), which hashes the
 * canonical data each entry depends on; the client only receives the ids of the entries whose stored
 * `profileVersion` still matches. An entry that is not in that set is never served (fail closed).
 *
 * This module is client-safe: no zod, no node APIs. It is imported only by the lazy drawer chunk
 * (`AskPanel`) and by tests/scripts, so neither it nor the FAQ JSON is in `/` first-load JS (EVAL-005).
 */
import type { Answer, AnswerProvider, AskContext, Evidence, SuggestedFollowUp } from "./adapter";
import { faqIntentKey, isContextDependent, isSensitive, normaliseQuestion } from "./normalise";

/** The dependency groups an answer can depend on (hashed in `faq-versions.ts`). */
export type FaqDependency = string;

/** One curated answer, exactly as stored in `data/tushky/faq.json` (spec §46 / §51). */
export interface FaqEntry {
  id: string;
  /** Analytics bucket (§62) — never the raw question. */
  category: string;
  question: string;
  aliases: string[];
  /** In Tushky's voice, written from the site's own data only. */
  answer: string;
  sources: Evidence[];
  /** Questions offered as chips after this answer; each must itself be a cache hit. */
  followUps: string[];
  /** YYYY-MM-DD the answer text was last written or reviewed. */
  updatedAt: string;
  /** Hash of the dependency groups' data when the answer was written (see `faq-versions.ts`). */
  profileVersion: string;
  dependsOn: FaqDependency[];
  /** False until Tushar signs the answer off; unreviewed answers show the DRAFT tag like the index's. */
  reviewed: boolean;
}

export type FaqMatchType = "exact" | "alias" | "intent";
export type FaqMissReason = "invalid" | "context-dependent" | "sensitive" | "no-match" | "stale";

export type FaqLookup =
  | { kind: "hit"; entry: FaqEntry; matchType: FaqMatchType }
  | { kind: "miss"; reason: FaqMissReason; entry?: FaqEntry };

/** Longest question the cache will look at; anything longer is a real conversation, not an FAQ. */
export const FAQ_MAX_QUESTION_LENGTH = 200;

/** Prefix for `Answer.matched` so FAQ ids never collide with knowledge-index ids. */
export const FAQ_MATCH_PREFIX = "faq:";

interface CompiledFaq {
  exact: Map<string, FaqEntry>;
  alias: Map<string, FaqEntry>;
  intent: Map<string, FaqEntry>;
}

/**
 * Index every entry's question, aliases and intent keys. A key claimed by two entries is ambiguous and
 * is dropped from that level (and `tests/unit/tushky-faq.test.ts` fails on it), so a collision can
 * never make the cache pick one of two answers arbitrarily.
 */
export function compileFaq(entries: readonly FaqEntry[]): CompiledFaq {
  const exact = new Map<string, FaqEntry>();
  const alias = new Map<string, FaqEntry>();
  const intent = new Map<string, FaqEntry>();
  const ambiguous = { exact: new Set<string>(), alias: new Set<string>(), intent: new Set<string>() };
  const claim = (level: keyof CompiledFaq, map: Map<string, FaqEntry>, key: string, entry: FaqEntry) => {
    if (!key) return;
    const owner = map.get(key);
    if (owner && owner.id !== entry.id) ambiguous[level].add(key);
    else map.set(key, entry);
  };
  for (const entry of entries) {
    claim("exact", exact, normaliseQuestion(entry.question), entry);
    for (const a of entry.aliases) claim("alias", alias, normaliseQuestion(a), entry);
    for (const q of [entry.question, ...entry.aliases]) claim("intent", intent, faqIntentKey(q), entry);
  }
  const maps: CompiledFaq = { exact, alias, intent };
  for (const level of ["exact", "alias", "intent"] as const) {
    for (const key of ambiguous[level]) maps[level].delete(key);
  }
  return maps;
}

/** Collisions found while compiling (for the tests and the prebuild gate). */
export function faqCollisions(entries: readonly FaqEntry[]): string[] {
  const seen = new Map<string, string>();
  const out: string[] = [];
  for (const entry of entries) {
    const keys = new Set([normaliseQuestion(entry.question), ...entry.aliases.map(normaliseQuestion)].map((k) => `text:${k}`));
    for (const q of [entry.question, ...entry.aliases]) keys.add(`intent:${faqIntentKey(q)}`);
    for (const key of keys) {
      const owner = seen.get(key);
      if (owner && owner !== entry.id) out.push(`${key} is claimed by both "${owner}" and "${entry.id}"`);
      else seen.set(key, entry.id);
    }
  }
  return out;
}

/**
 * The pure lookup (§47–48, §55, §59). `fresh` is the set of entry ids whose stored version matches the
 * current data; a match on any other entry is a `stale` miss and is never served.
 */
export function lookupFaq(compiled: CompiledFaq, question: string, fresh: ReadonlySet<string>): FaqLookup {
  const trimmed = question.trim();
  if (!trimmed || trimmed.length > FAQ_MAX_QUESTION_LENGTH) return { kind: "miss", reason: "invalid" };
  if (isSensitive(trimmed)) return { kind: "miss", reason: "sensitive" };
  if (isContextDependent(trimmed)) return { kind: "miss", reason: "context-dependent" };

  const text = normaliseQuestion(trimmed);
  let found: { entry: FaqEntry; matchType: FaqMatchType } | undefined;
  const exact = compiled.exact.get(text);
  if (exact) found = { entry: exact, matchType: "exact" };
  else {
    const alias = compiled.alias.get(text);
    if (alias) found = { entry: alias, matchType: "alias" };
    else {
      const intent = compiled.intent.get(faqIntentKey(trimmed));
      if (intent) found = { entry: intent, matchType: "intent" };
    }
  }
  if (!found) return { kind: "miss", reason: "no-match" };
  if (!fresh.has(found.entry.id)) return { kind: "miss", reason: "stale", entry: found.entry };
  return { kind: "hit", ...found };
}

export interface FaqLookupEvent {
  lookup: FaqLookup;
}

export interface FaqCacheOptions {
  /** Ids of entries whose `profileVersion` matches the current data (computed at build time). */
  fresh: readonly string[];
  /** Called once per question with the lookup result — for analytics (§62). Never gets the raw text. */
  onLookup?: ((event: FaqLookupEvent) => void) | undefined;
}

/** Up to this many follow-up chips per cached answer (the drawer's 2–3 chip rule). */
const MAX_FOLLOW_UPS = 3;

export class FaqCacheProvider implements AnswerProvider {
  readonly name = "faq-cache";
  private readonly compiled: CompiledFaq;
  private readonly fresh: ReadonlySet<string>;

  constructor(
    private readonly entries: readonly FaqEntry[],
    private readonly fallback: AnswerProvider,
    private readonly options: FaqCacheOptions,
  ) {
    this.compiled = compileFaq(entries);
    this.fresh = new Set(options.fresh);
  }

  lookup(question: string): FaqLookup {
    return lookupFaq(this.compiled, question, this.fresh);
  }

  ask(query: string, ctx?: AskContext): Promise<Answer> {
    const lookup = this.lookup(query);
    try {
      this.options.onLookup?.({ lookup });
    } catch {
      // Analytics must never break answering.
    }
    if (lookup.kind === "hit") return Promise.resolve(this.answerFrom(lookup.entry, ctx));
    return this.fallback.ask(query, ctx);
  }

  /** §49: the shared response contract, `sourceType: "faq-cache"`. The answer text is the file's, unmodified. */
  private answerFrom(entry: FaqEntry, ctx?: AskContext): Answer {
    // Skip chips for questions this conversation already had answered from the cache.
    const answered = new Set<string>([entry.id]);
    for (const previous of ctx?.history ?? []) {
      const hit = this.lookup(previous);
      if (hit.kind === "hit") answered.add(hit.entry.id);
    }
    const suggestedFollowUps: SuggestedFollowUp[] = [];
    for (const question of entry.followUps) {
      if (suggestedFollowUps.length >= MAX_FOLLOW_UPS) break;
      const target = this.lookup(question);
      if (target.kind === "hit" && answered.has(target.entry.id)) continue;
      suggestedFollowUps.push({ label: question, query: question });
    }
    return {
      kind: "answer",
      text: entry.answer,
      evidence: entry.sources.map((s) => ({ label: s.label, href: s.href })),
      matched: [`${FAQ_MATCH_PREFIX}${entry.id}`],
      score: 1,
      sourceType: "faq-cache",
      suggestedFollowUps,
      draft: !entry.reviewed,
    };
  }
}
