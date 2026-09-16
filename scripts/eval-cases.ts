/**
 * eval-cases.ts (technical-plan.md §B S08.02) — the typed loader + integrity check for
 * `evals/eval-cases.json`, which is authoritative for EVAL ids, priorities and automation flags
 * (A16). `scripts/eval.ts` and the Playwright spec-coverage check both read cases through here so
 * there is exactly one parser and one set of invariants.
 *
 * Invariants enforced (fail loudly — a bad case file must never run silently):
 *   1. The file parses against the zod schema (every field validated, unknown fields rejected).
 *   2. Exactly 17 cases, ids EVAL-001 … EVAL-017, each unique.
 *   3. Every `automated: true` case names a real automated runner (a runner mapping exists);
 *      every `automated: false` case is runner "manual".
 *
 * CLI:
 *   tsx scripts/eval-cases.ts                → validates and prints `17 cases OK · 14 automated · 3 manual`
 *   tsx scripts/eval-cases.ts --check-specs  → additionally asserts every Playwright-automated EVAL
 *                                              id (except those explicitly deferred to a later ticket)
 *                                              has a `@EVAL-0xx`-tagged spec under tests/e2e/.
 * Exit non-zero on any violation.
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const ROOT = process.cwd();
const EVAL_CASES_PATH = resolve(ROOT, "evals/eval-cases.json");
const E2E_DIR = resolve(ROOT, "tests/e2e");

/** Runners that actually execute a case (i.e. constitute a "runner mapping" for an automated case). */
const AUTOMATED_RUNNERS = [
  "playwright",
  "lighthouse",
  "lighthouse+bundle",
  "vitest",
  "vitest+build",
  "security",
  "vitest+playwright+manual", // EVAL-017: automated tag+image part; the inspector part is a MANUAL sub-result
] as const;

/**
 * EVAL ids whose Playwright spec is deferred to a later ticket, so `--check-specs` does not treat a
 * missing spec as a failure. Empty as of TKT-07b: EVAL-011's dead-control crawler spec now exists
 * (tests/e2e/eval-011-dead-controls.spec.ts), so every Playwright-automated id is covered.
 */
const DEFERRED_SPECS: Record<string, string> = {};

const EvalCaseSchema = z
  .object({
    id: z.string().regex(/^EVAL-\d{3}$/),
    feature: z.string().min(1),
    category: z.string().min(1),
    input: z.string().min(1),
    expected_behavior: z.string().min(1),
    expected_output: z.string().min(1),
    failure_conditions: z.array(z.string().min(1)).min(1),
    method: z.string().min(1),
    // threshold is either a human string ("6/6 at 390…") or a structured object.
    threshold: z.union([z.string().min(1), z.record(z.string(), z.unknown())]),
    priority: z.enum(["critical", "high", "medium", "low"]),
    automated: z.boolean(),
    automated_scope: z.string().optional(),
    runner: z.string().min(1),
    viewport: z.union([z.array(z.string()), z.null()]),
    accessibility_requirement: z.union([z.string(), z.null()]),
    tags: z.array(z.string()),
    related_tickets: z.array(z.string()),
  })
  .strict();

const EvalCasesFileSchema = z
  .object({
    $schema_note: z.string().optional(),
    version: z.string(),
    project: z.string(),
    source: z.string(),
    cases: z.array(EvalCaseSchema),
  })
  .strict();

export type EvalCase = z.infer<typeof EvalCaseSchema>;

/**
 * Parse, validate and return the case list. Throws (with the zod issue list, or a stable
 * `[eval-cases]` message) on any schema or invariant violation.
 */
export function loadCases(): EvalCase[] {
  const raw = readFileSync(EVAL_CASES_PATH, "utf8");
  const parsed = EvalCasesFileSchema.parse(JSON.parse(raw));
  const cases = parsed.cases;

  // Invariant 2 — exactly 17 unique ids EVAL-001…017.
  const ids = cases.map((c) => c.id);
  const unique = new Set(ids);
  if (cases.length !== 17) {
    throw new Error(`[eval-cases] expected 17 cases, found ${cases.length}`);
  }
  if (unique.size !== ids.length) {
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    throw new Error(`[eval-cases] duplicate ids: ${[...new Set(dupes)].join(", ")}`);
  }
  for (let i = 1; i <= 17; i++) {
    const want = `EVAL-${String(i).padStart(3, "0")}`;
    if (!unique.has(want)) throw new Error(`[eval-cases] missing id ${want}`);
  }

  // Invariant 3 — automation flag ↔ runner mapping.
  const runnerSet = new Set<string>(AUTOMATED_RUNNERS);
  for (const c of cases) {
    if (c.automated) {
      if (!runnerSet.has(c.runner)) {
        throw new Error(
          `[eval-cases] ${c.id} is automated but has no runner mapping (runner="${c.runner}")`,
        );
      }
    } else if (c.runner !== "manual") {
      throw new Error(
        `[eval-cases] ${c.id} is not automated but runner is "${c.runner}" (expected "manual")`,
      );
    }
  }

  return cases;
}

/** EVAL ids that must have a Playwright spec (`runner` contains "playwright"), minus deferred ones. */
export function requiredPlaywrightSpecIds(cases: EvalCase[]): string[] {
  return cases
    .filter((c) => c.automated && c.runner.includes("playwright"))
    .map((c) => c.id)
    .filter((id) => !(id in DEFERRED_SPECS));
}

/** Collect every `@EVAL-0xx` tag present across tests/e2e/*.spec.ts. */
function specTagsOnDisk(): Set<string> {
  const found = new Set<string>();
  for (const file of readdirSync(E2E_DIR).filter((f) => f.endsWith(".spec.ts"))) {
    const src = readFileSync(resolve(E2E_DIR, file), "utf8");
    for (const m of src.matchAll(/@EVAL-\d{3}/g)) found.add(m[0].slice(1)); // strip leading '@'
  }
  return found;
}

function main(): void {
  let cases: EvalCase[];
  try {
    cases = loadCases();
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  const automated = cases.filter((c) => c.automated).length;
  const manual = cases.length - automated;
  console.log(`${cases.length} cases OK · ${automated} automated · ${manual} manual`);

  if (process.argv.includes("--check-specs")) {
    const required = requiredPlaywrightSpecIds(cases);
    const present = specTagsOnDisk();
    const missing = required.filter((id) => !present.has(id));
    const deferred = Object.entries(DEFERRED_SPECS)
      .map(([id, why]) => `${id} (${why})`)
      .join(", ");
    if (missing.length > 0) {
      console.error(
        `[eval-cases] missing @EVAL spec tags for: ${missing.join(", ")}\n` +
          `  (deferred, not checked: ${deferred})`,
      );
      process.exit(1);
    }
    console.log(
      `spec coverage OK · ${required.length} Playwright-automated ids tagged · deferred: ${deferred}`,
    );
  }

  process.exit(0);
}

// Run only when invoked directly (not when imported by scripts/eval.ts). Compare resolved
// filesystem paths — comparing import.meta.url to argv[1] directly breaks when the path contains
// spaces (the URL percent-encodes them; e.g. "/Volumes/E Drive/…" → "/Volumes/E%20Drive/…").
const invokedDirectly =
  !!process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main();
}
