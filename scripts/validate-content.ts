/**
 * validate-content.ts — the prebuild truth gate (EVAL-013).
 *
 * Runs `validateAll()` over the live content collections and exits non-zero on any violation,
 * printing one line per issue as `<entity>.<id> → <path>: <message>` so `next build` never runs on
 * unsourced / malformed / forbidden content. Set `CONTENT_FIXTURE=invalid` to swap the deliberate
 * failing fixture into `projects` — used once to prove the gate against a real build (S03.08).
 *
 * Empty collections are allowed until their tickets land (entity-level rules stay strict).
 */
import { collections, validateAll, type Collections } from "@/data/index";
import type { Project } from "@/data/schema";
import { invalidProject } from "@/tests/fixtures/invalid-project.fixture";
import faqData from "@/data/tushky/faq.json";
import type { FaqEntry } from "@/lib/ask/faq";
import { checkFaq } from "@/lib/ask/faq-schema";
import { faqFreshness } from "@/lib/ask/faq-versions";

const fixtureMode = process.env.CONTENT_FIXTURE === "invalid";

const cols: Collections = fixtureMode
  ? { ...collections, projects: [invalidProject as unknown as Project], portfolio: undefined } // TASK-116: only the planted project issues
  : collections;

const result = validateAll(cols);

// TASK-123: the Ask Tushky FAQ cache — shape, links, follow-ups, banned strings and PII fail the build.
const faqIssues = checkFaq(faqData);
if (faqIssues.length) {
  for (const issue of faqIssues) console.error(issue);
  console.error(`\ntushky faq FAILED — ${faqIssues.length} issue${faqIssues.length === 1 ? "" : "s"}`);
  process.exit(1);
}
// A STALE answer does not fail the build: it is simply not served (it falls through to the index).
// It is printed loudly here, and tests/unit/tushky-faq-versions.test.ts fails on it in CI.
const faqState = faqFreshness(faqData as FaqEntry[]);
if (faqState.stale.length) {
  console.warn(
    `tushky faq: ${faqState.stale.length} STALE answer(s) NOT served until refreshed: ${faqState.stale.map((s) => s.id).join(", ")}` +
      "\n  → pnpm exec tsx scripts/tushky-faq-refresh.ts --check (then redraft, or review and --stamp)",
  );
}

if (!result.ok) {
  for (const issue of result.issues) console.error(issue);
  console.error(
    `\ncontent FAILED — ${result.issues.length} issue${result.issues.length === 1 ? "" : "s"}${
      fixtureMode ? " (CONTENT_FIXTURE=invalid)" : ""
    }`,
  );
  process.exit(1);
}

console.log(
  `content OK (projects:${cols.projects.length} experience:${cols.experience.length} skills:${cols.skills.length} writing:${cols.writing.length} knowledge:${cols.knowledge.length} thinking:${cols.thinkingFramework.length} tushky-faq:${faqState.fresh.length}/${faqData.length} fresh)`,
);
