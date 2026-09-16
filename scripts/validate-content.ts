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

const fixtureMode = process.env.CONTENT_FIXTURE === "invalid";

const cols: Collections = fixtureMode
  ? { ...collections, projects: [invalidProject as unknown as Project] }
  : collections;

const result = validateAll(cols);

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
  `content OK (projects:${cols.projects.length} experience:${cols.experience.length} skills:${cols.skills.length} writing:${cols.writing.length} knowledge:${cols.knowledge.length} thinking:${cols.thinkingFramework.length})`,
);
