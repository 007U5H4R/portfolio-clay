/**
 * tushky-faq-refresh.ts — the OFFLINE refresh for Ask Tushky's FAQ cache (TASK-123, Tushar's FAQ-cache
 * spec §51 / §60 / §61). It never runs in `pnpm build` or at request time; a human runs it after the
 * canonical data changes, reviews the output, and only then applies it.
 *
 *   canonical data changes → --check lists stale answers → draft (Gemini) → validate against the
 *   source data → data/tushky/faq.candidates.json + a diff summary → human review → --apply → deploy
 *
 * Modes:
 *   tsx scripts/tushky-faq-refresh.ts --check
 *       No network. Lists fresh / stale entries (exit 1 if any are stale).
 *   tsx scripts/tushky-faq-refresh.ts --stamp <id,id|all>
 *       No network. After a human has re-read an answer against the data and kept or edited it by
 *       hand, record the current data version for it (profileVersion + updatedAt).
 *   dotenv -e <path to the git-ignored .env> -- tsx scripts/tushky-faq-refresh.ts [--stale|--all|--only id,id] [--model <id>]
 *       Drafts candidate answers with Gemini (default: the stale entries), validates every one, writes
 *       data/tushky/faq.candidates.json and prints a diff summary. Does NOT touch faq.json.
 *   … --apply
 *       Merges the candidates that PASSED validation from faq.candidates.json into faq.json, stamped
 *       with the current data version and `reviewed: false` (they show the DRAFT tag until Tushar signs off).
 *
 * The API key is read from GEMINI_API_KEY in the environment only. It is sent as a request header
 * (never in a URL) and is never printed, logged or written anywhere.
 *
 * Validation (deterministic, no LLM): every evidence quote the model returns must appear verbatim in
 * the grounded context; every number in the draft must appear in the context; the draft must pass the
 * same `checkFaq()` gate as the committed file (banned strings, phone/DOB/location, length).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { FaqEntry } from "@/lib/ask/faq";
import { checkFaq, validateCandidate } from "@/lib/ask/faq-schema";
import { dependencyGroups, faqFreshness, groupVersions, profileVersionFor } from "@/lib/ask/faq-versions";

const ROOT = process.cwd();
const FAQ_PATH = join(ROOT, "data/tushky/faq.json");
const CANDIDATES_PATH = join(ROOT, "data/tushky/faq.candidates.json");
const API = "https://generativelanguage.googleapis.com/v1beta";

/** USD per 1M tokens, from ai.google.dev/gemini-api/docs/pricing (paid tier). Unknown model → tokens only. */
const PRICES: Record<string, { input: number; output: number }> = {
  "gemini-3.5-flash-lite": { input: 0.25, output: 1.5 }, // checked 2026-09-28
  "gemini-2.5-flash-lite": { input: 0.1, output: 0.4 },
  "gemini-2.5-flash": { input: 0.3, output: 2.5 },
};

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const option = (name: string): string | undefined => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const today = () => new Date().toISOString().slice(0, 10);

function readFaq(): FaqEntry[] {
  return JSON.parse(readFileSync(FAQ_PATH, "utf8")) as FaqEntry[];
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

/* ── --check ─────────────────────────────────────────────────────────── */

function check(): number {
  const { fresh, stale } = faqFreshness(readFaq());
  console.log(`tushky faq: ${fresh.length} fresh, ${stale.length} stale`);
  for (const s of stale) console.log(`  STALE ${s.id} (depends on ${s.dependsOn.join(", ")}): stored ${s.stored}, data is now ${s.current}`);
  return stale.length > 0 ? 1 : 0;
}

/* ── --stamp ─────────────────────────────────────────────────────────── */

function stamp(which: string): number {
  const faq = readFaq();
  const versions = groupVersions();
  const ids = which === "all" ? new Set(faq.map((e) => e.id)) : new Set(which.split(",").map((s) => s.trim()));
  const unknown = [...ids].filter((id) => !faq.some((e) => e.id === id));
  if (unknown.length) {
    console.error(`unknown id(s): ${unknown.join(", ")}`);
    return 1;
  }
  for (const entry of faq) {
    if (!ids.has(entry.id)) continue;
    const next = profileVersionFor(entry.dependsOn, versions);
    if (next !== entry.profileVersion) {
      entry.profileVersion = next;
      entry.updatedAt = today();
    }
  }
  writeJson(FAQ_PATH, faq);
  console.log(`stamped ${ids.size} entr${ids.size === 1 ? "y" : "ies"} with the current data version`);
  return 0;
}

/* ── grounded context ────────────────────────────────────────────────── */

/** The canonical data an entry depends on, as labelled JSON blocks — the ONLY facts the model may use. */
function contextFor(entry: FaqEntry): string {
  const groups = dependencyGroups();
  return entry.dependsOn
    .map((name) => {
      let value = groups.get(name);
      if (name === "projects" && Array.isArray(value)) {
        // The list-level group: the fields a "what has he built" answer needs, not every chapter.
        value = value.map((p: Record<string, unknown>) => ({
          name: p.name,
          tagline: p.tagline,
          status: p.status,
          statusLabel: p.statusLabel,
          statusAsOf: p.statusAsOf,
          role: p.role,
          duration: p.duration,
          overview: p.overview,
        }));
      }
      return `### ${name}\n${JSON.stringify(value)}`;
    })
    .join("\n\n");
}

const SYSTEM = `You write answers for "Tushky", a friendly golden-retriever assistant on Tushar Pathak's portfolio site, for recruiters and hiring managers.
Rules:
- Use ONLY facts stated in CONTEXT. Never add a role, date, number, metric, employer, product or claim that CONTEXT does not state.
- Keep every caveat CONTEXT attaches to a fact: "self-reported", snapshot dates, "test handsets excluded", "unverified", "mock data", "built, not launched", "by construction".
- Speak about Tushar in the third person. Warm, professional, concise, evidence first. 50–110 words, one paragraph, plain text (real characters, never \\u escape sequences).
- Never mention his location, phone number, date of birth or salary. Do not name individual credential abbreviations for project-management or scaled-agile certifications.
- If the CURRENT ANSWER contains "woof woof 🐾", you may keep it once; otherwise use no emoji.
- For each factual claim, return an evidence quote copied VERBATIM (exact characters) from CONTEXT.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    answer: { type: "STRING" },
    evidence: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["answer", "evidence"],
};

/* ── Gemini (REST, key in a header) ──────────────────────────────────── */

function apiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("GEMINI_API_KEY is not set. Run through dotenv with the git-ignored .env (see the header).");
    process.exit(2);
  }
  return key;
}

async function gemini(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`${API}/${path}`, {
    ...init,
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey(), ...(init?.headers ?? {}) },
  });
  const body = (await res.json()) as { error?: { message?: string } };
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${body.error?.message ?? "request failed"}`);
  return body;
}

/** Pick the newest stable Flash-Lite model the key can call (cheapest tier), else the newest stable Flash. */
async function pickModel(): Promise<string> {
  const forced = option("--model");
  if (forced) return forced;
  const list = (await gemini("models?pageSize=200")) as {
    models?: { name: string; supportedGenerationMethods?: string[] }[];
  };
  const usable = (list.models ?? [])
    .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
    .map((m) => m.name.replace(/^models\//, ""))
    .filter((n) => /^gemini-\d+(\.\d+)?-flash(-lite)?$/.test(n)); // stable names only: no -preview/-exp/-latest
  const version = (n: string) => Number(/^gemini-(\d+(?:\.\d+)?)/.exec(n)?.[1] ?? 0);
  const byNewest = (a: string, b: string) => version(b) - version(a);
  const lite = usable.filter((n) => n.endsWith("-flash-lite")).sort(byNewest);
  const flash = usable.filter((n) => n.endsWith("-flash")).sort(byNewest);
  const chosen = lite[0] ?? flash[0];
  if (!chosen) throw new Error("no stable Gemini Flash / Flash-Lite model is available to this key");
  return chosen;
}

interface Usage {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  thoughtsTokenCount?: number;
}

async function draft(model: string, entry: FaqEntry, context: string): Promise<{ answer: string; evidence: string[]; usage: Usage }> {
  const prompt = `QUESTION: ${entry.question}\nALSO ASKED AS: ${entry.aliases.join(" | ")}\n\nCURRENT ANSWER (may be outdated):\n${entry.answer}\n\nCONTEXT:\n${context}`;
  const body = (await gemini(`models/${model}:generateContent`, {
    method: "POST",
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1024, responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA },
    }),
  })) as { candidates?: { content?: { parts?: { text?: string }[] } }[]; usageMetadata?: Usage };
  const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  const parsed = JSON.parse(text) as { answer?: string; evidence?: string[] };
  return { answer: (parsed.answer ?? "").trim(), evidence: parsed.evidence ?? [], usage: body.usageMetadata ?? {} };
}

/* ── validation: `validateCandidate()` in lib/ask/faq-schema.ts (deterministic, no LLM) ── */

interface Candidate {
  id: string;
  question: string;
  model: string;
  current: string;
  candidate: string;
  changed: boolean;
  evidence: string[];
  validation: { pass: boolean; problems: string[] };
  profileVersion: string;
}

function wordDiff(a: string, b: string): { added: number; removed: number } {
  const count = (s: string) => s.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? [];
  const bag = (words: string[]) => words.reduce((m, w) => m.set(w, (m.get(w) ?? 0) + 1), new Map<string, number>());
  const before = bag(count(a));
  const after = bag(count(b));
  let added = 0;
  let removed = 0;
  for (const [w, n] of after) added += Math.max(0, n - (before.get(w) ?? 0));
  for (const [w, n] of before) removed += Math.max(0, n - (after.get(w) ?? 0));
  return { added, removed };
}

async function refresh(): Promise<number> {
  const faq = readFaq();
  const { stale } = faqFreshness(faq);
  const only = option("--only")?.split(",").map((s) => s.trim());
  const targets = only ? faq.filter((e) => only.includes(e.id)) : flag("--all") ? faq : faq.filter((e) => stale.some((s) => s.id === e.id));
  if (targets.length === 0) {
    console.log("nothing to refresh: every FAQ entry matches the current data (use --all or --only to redraft anyway)");
    return 0;
  }

  const model = await pickModel();
  console.log(`model: ${model} · drafting ${targets.length} entr${targets.length === 1 ? "y" : "ies"}`);
  const versions = groupVersions();
  const candidates: Candidate[] = [];
  const total = { input: 0, output: 0 };
  for (const entry of targets) {
    const context = contextFor(entry);
    const { answer, evidence, usage } = await draft(model, entry, context);
    total.input += usage.promptTokenCount ?? 0;
    total.output += (usage.candidatesTokenCount ?? 0) + (usage.thoughtsTokenCount ?? 0);
    const problems = validateCandidate(entry, { answer, evidence }, context, faq, ROOT);
    candidates.push({
      id: entry.id,
      question: entry.question,
      model,
      current: entry.answer,
      candidate: answer,
      changed: answer !== entry.answer,
      evidence,
      validation: { pass: problems.length === 0, problems },
      profileVersion: profileVersionFor(entry.dependsOn, versions),
    });
  }

  const price = PRICES[model];
  const cost = price ? (total.input * price.input + total.output * price.output) / 1e6 : undefined;
  writeJson(CANDIDATES_PATH, {
    generatedAt: new Date().toISOString(),
    model,
    usage: { inputTokens: total.input, outputTokens: total.output, estimatedCostUsd: cost ?? null },
    note: "Review file only. Nothing here is served. `--apply` merges the candidates whose validation passed into faq.json.",
    candidates,
  });

  console.log("\nid                      valid  changed  +words −words");
  for (const c of candidates) {
    const d = wordDiff(c.current, c.candidate);
    console.log(`${c.id.padEnd(24)}${(c.validation.pass ? "pass" : "FAIL").padEnd(7)}${(c.changed ? "yes" : "no").padEnd(9)}${String(d.added).padStart(6)} ${String(d.removed).padStart(6)}`);
    for (const p of c.validation.problems) console.log(`    - ${p}`);
  }
  console.log(`\ntokens: ${total.input} in / ${total.output} out${cost !== undefined ? ` · ≈ $${cost.toFixed(5)}` : " · price unknown for this model"}`);
  console.log(`wrote ${CANDIDATES_PATH.replace(`${ROOT}/`, "")} — review it, then run with --apply`);
  return candidates.every((c) => c.validation.pass) ? 0 : 1;
}

/* ── --apply ─────────────────────────────────────────────────────────── */

function apply(): number {
  const faq = readFaq();
  const file = JSON.parse(readFileSync(CANDIDATES_PATH, "utf8")) as { candidates: Candidate[] };
  const versions = groupVersions();
  let applied = 0;
  for (const c of file.candidates) {
    const entry = faq.find((e) => e.id === c.id);
    if (!entry) {
      console.log(`skip ${c.id}: no such entry`);
      continue;
    }
    // Re-validate against the data as it is NOW — never trust the pass flag stored in the review file,
    // which a human may have edited.
    const problems = validateCandidate(entry, { answer: c.candidate, evidence: c.evidence }, contextFor(entry), faq, ROOT);
    if (problems.length) {
      console.log(`skip ${c.id}: ${problems.join("; ")}`);
      continue;
    }
    if (profileVersionFor(entry.dependsOn, versions) !== c.profileVersion) {
      console.log(`skip ${c.id}: the data changed again after this candidate was drafted — redraft it`);
      continue;
    }
    entry.answer = c.candidate;
    entry.profileVersion = c.profileVersion;
    entry.updatedAt = today();
    entry.reviewed = false;
    applied++;
  }
  const issues = checkFaq(faq, ROOT);
  if (issues.length) {
    for (const i of issues) console.error(i);
    console.error("not written: the merged file fails the FAQ gate");
    return 1;
  }
  writeJson(FAQ_PATH, faq);
  console.log(`applied ${applied} candidate(s) to data/tushky/faq.json (reviewed: false until Tushar signs off)`);
  return 0;
}

async function main(): Promise<number> {
  if (flag("--check")) return check();
  const which = option("--stamp");
  if (which) return stamp(which);
  if (flag("--apply")) return apply();
  return refresh();
}

main().then(
  (code) => process.exit(code),
  (err: unknown) => {
    console.error(err instanceof Error ? err.message : "refresh failed");
    process.exit(1);
  },
);
