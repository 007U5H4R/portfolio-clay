/**
 * zod schema + content checks for `data/tushky/faq.json` (TASK-123, spec §46 / §51 / §61). BUILD / TEST
 * ONLY: imported by `scripts/validate-content.ts` (prebuild), the refresh script and Vitest — never by a
 * client module, so zod stays out of the drawer chunk (same rule as `answer-schema.ts`).
 *
 * `checkFaq()` is the truth gate: shape, unique ids, no ambiguous question/alias keys, every source
 * link resolves to a real page, every follow-up is itself a cache hit, no banned title/credential
 * string and no phone/location PII, and every `dependsOn` group exists.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { ALL_PROJECT_SLUGS, routes } from "@/lib/anchors";
import { writing } from "@/data/writing";
import { contentForbiddenHits, PII_PATTERNS } from "@/scripts/forbidden-strings";
import { compileFaq, faqCollisions, lookupFaq, type FaqEntry } from "./faq";
import { dependencyGroups } from "./faq-versions";

const Source = z.object({
  label: z.string().min(2),
  href: z.union([z.string().regex(/^\/(?!\/)[^\s]*$/), z.url().startsWith("https://"), z.string().startsWith("mailto:")]),
});

export const FaqEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().regex(/^[a-z]+(?:-[a-z]+)*$/),
  question: z.string().min(8),
  aliases: z.array(z.string().min(3)),
  answer: z.string().min(40).max(900),
  sources: z.array(Source).min(1),
  followUps: z.array(z.string().min(8)).min(2).max(4),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  profileVersion: z.string().regex(/^v1-[0-9a-f]{12}$/),
  dependsOn: z.array(z.string().min(3)).min(1),
  reviewed: z.boolean(),
});

export const FaqFileSchema = z.array(FaqEntrySchema).min(1);

/** Internal pages a source may link to: every `routes()` href plus any top-level `app/<page>/page.tsx`. */
function internalRoutes(): Set<string> {
  return routes({ projectSlugs: ALL_PROJECT_SLUGS, essaySlugs: writing.map((e) => e.slug) });
}

function resolvesInternal(href: string, known: Set<string>, root: string): boolean {
  if (known.has(href)) return true;
  // A top-level page not listed in routes() (e.g. /certifications): accept it only if the page exists.
  const m = /^\/([a-z0-9-]+)$/.exec(href);
  return m !== null && existsSync(join(root, "app", m[1]!, "page.tsx"));
}

/** Every problem with the FAQ file, as printable lines. Empty = clean. */
export function checkFaq(raw: unknown, root: string = process.cwd()): string[] {
  const parsed = FaqFileSchema.safeParse(raw);
  if (!parsed.success) return parsed.error.issues.map((i) => `faq → ${i.path.join(".")}: ${i.message}`);
  const entries: FaqEntry[] = parsed.data;
  const issues: string[] = [];

  const ids = new Set<string>();
  for (const e of entries) {
    if (ids.has(e.id)) issues.push(`faq.${e.id} → duplicate id`);
    ids.add(e.id);
  }
  for (const c of faqCollisions(entries)) issues.push(`faq → ambiguous: ${c}`);

  const known = internalRoutes();
  const groups = dependencyGroups();
  const compiled = compileFaq(entries);
  const all = new Set(entries.map((e) => e.id));
  for (const e of entries) {
    for (const s of e.sources) {
      if (s.href.startsWith("/") && !resolvesInternal(s.href, known, root)) issues.push(`faq.${e.id} → source "${s.label}" ${s.href} does not resolve`);
    }
    for (const g of e.dependsOn) if (!groups.has(g)) issues.push(`faq.${e.id} → unknown dependsOn group "${g}"`);
    for (const f of e.followUps) {
      const hit = lookupFaq(compiled, f, all);
      if (hit.kind !== "hit") issues.push(`faq.${e.id} → follow-up "${f}" is not a cache hit (${hit.reason})`);
      else if (hit.entry.id === e.id) issues.push(`faq.${e.id} → follow-up "${f}" repeats this answer`);
    }
    const text = [e.question, ...e.aliases, e.answer, ...e.followUps, ...e.sources.map((s) => s.label)].join("\n");
    for (const hit of contentForbiddenHits(text)) issues.push(`faq.${e.id} → forbidden string: ${hit}`);
    if (PII_PATTERNS.PHONE.test(text)) issues.push(`faq.${e.id} → phone-number-like text`);
    if (PII_PATTERNS.DOB.test(text)) issues.push(`faq.${e.id} → date-of-birth-like text`);
    if (/\bbengaluru\b|\bbangalore\b/i.test(text)) issues.push(`faq.${e.id} → location (site.showLocation is false)`);
    if (/\\u[0-9a-f]{4}/i.test(e.answer)) issues.push(`faq.${e.id} → literal escape sequence in the answer`);
  }
  // §50: the personality is written in, sparingly — never stamped onto every answer.
  const woofs = entries.filter((e) => WOOF.test(e.answer)).map((e) => e.id);
  if (woofs.length > MAX_WOOF_ANSWERS) issues.push(`faq → "woof woof 🐾" in ${woofs.length} answers (max ${MAX_WOOF_ANSWERS}): ${woofs.join(", ")}`);
  return issues;
}

const WOOF = /woof woof/i;
/** §50 "use sparingly": at most this many answers carry Tushky's "woof woof 🐾". */
export const MAX_WOOF_ANSWERS = 2;

/** Numbers as written in prose ("5,760", "37.5", "2026"). */
function numbersIn(text: string): string[] {
  return [...text.matchAll(/\d[\d,]*(?:\.\d+)?/g)].map((m) => m[0].replace(/,$/, ""));
}

/** Whitespace/case-insensitive, and JSON's escaped quotes (`\"`) read as plain quotes. */
const squash = (s: string) => s.replace(/\\"/g, '"').replace(/\s+/g, " ").toLowerCase();

/**
 * Deterministic check of a drafted (Gemini) answer before it may replace `entry.answer` (§60). No LLM:
 *   - every evidence quote must appear verbatim in the grounded context, and there must be some;
 *   - every number in the draft must appear in the context;
 *   - "woof woof" only where the current answer already has it (§50), no literal escape sequences,
 *     25–130 words;
 *   - the file with the draft merged in must still pass `checkFaq()`.
 * Tone ("extensive", "holds") is NOT machine-checkable — a human still reviews every candidate.
 */
export function validateCandidate(
  entry: FaqEntry,
  draft: { answer: string; evidence: readonly string[] },
  context: string,
  faq: readonly FaqEntry[],
  root: string = process.cwd(),
): string[] {
  const problems: string[] = [];
  const ctx = squash(context);
  const ctxDigits = context.replace(/,/g, "");
  if (draft.evidence.length === 0) problems.push("no evidence quotes returned");
  for (const quote of draft.evidence) {
    if (!ctx.includes(squash(quote))) problems.push(`evidence not found verbatim in context: "${quote.slice(0, 80)}"`);
  }
  for (const n of numbersIn(draft.answer)) {
    if (!context.includes(n) && !ctxDigits.includes(n.replace(/,/g, ""))) problems.push(`number "${n}" is not in the context`);
  }
  if (WOOF.test(draft.answer) && !WOOF.test(entry.answer)) problems.push(`adds "woof woof 🐾" (only kept where the current answer has it)`);
  const words = draft.answer.split(/\s+/).filter(Boolean).length;
  if (words < 25 || words > 130) problems.push(`${words} words (25–130)`);
  const merged = faq.map((e) => (e.id === entry.id ? { ...e, answer: draft.answer } : e));
  for (const issue of checkFaq(merged, root)) {
    if (issue.startsWith(`faq.${entry.id} `) || issue.startsWith("faq →")) problems.push(issue);
  }
  return problems;
}
