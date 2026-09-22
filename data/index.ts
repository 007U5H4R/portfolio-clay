/**
 * Content collections + `validateAll()` — the build-time truth gate (EVAL-013).
 *
 * `validateAll()` runs three layers and returns every failure as a stable, printable string
 * (`<entity>.<id> → <path>: <message>`):
 *   1. schema — each entity `.safeParse`d against its `data/schema.ts` schema (A3 verbatim);
 *   2. cross-entity — internal evidence/example links resolve through `lib/anchors.ts` `routes()`
 *      (a dangling internal link fails the build, not a later crawl); featured-rank/large/surface
 *      composition invariants (relaxed while collections are still filling — see notes below);
 *   3. forbidden content — banned title/credential strings must never appear in authored copy.
 *
 * It is imported only by `scripts/validate-content.ts` (prebuild) and Vitest — never a client
 * component — so zod stays out of every browser bundle.
 */
import {
  Project,
  Experience,
  SkillCluster,
  Essay,
  KnowledgeEntry,
  ThinkingStageDef,
  type Project as ProjectT,
  type Experience as ExperienceT,
  type SkillCluster as SkillClusterT,
  type Essay as EssayT,
  type KnowledgeEntry as KnowledgeEntryT,
  type ThinkingStageDef as ThinkingStageDefT,
} from "./schema";
import { ALL_PROJECT_SLUGS, isInternalHref, resolves, routes } from "@/lib/anchors";
import { contentForbiddenHits } from "@/scripts/forbidden-strings";
import { projects } from "./projects";
import { experience } from "./experience";
import { skills } from "./skills";
import { knowledge } from "./knowledge";
import { thinkingFramework } from "./thinking-framework";

export interface Collections {
  projects: ProjectT[];
  experience: ExperienceT[];
  skills: SkillClusterT[];
  writing: EssayT[];
  knowledge: KnowledgeEntryT[];
  thinkingFramework: ThinkingStageDefT[];
}

/** Live collections. `writing` lands with its own ticket (TSK-22 fills experience/skills). */
export const collections: Collections = {
  projects,
  experience,
  skills,
  writing: [],
  knowledge,
  thinkingFramework,
};

export type ValidateResult = { ok: true } | { ok: false; issues: string[] };

// The banned title/credential patterns live in `scripts/forbidden-strings.ts` (a directory the
// file scanner does not read) so their literals never trip the scan; validateAll reuses them here.
// Numeric PII, `.env` keys, local paths and the sandbox join code are file/bundle concerns owned by
// the same script, kept out of this data-object scan so it can't false-positive on dated status
// text or `SourceRef.ref` paths.

const PATH_JOIN = (path: (string | number)[]): string => path.join(".");

/** Walk every string leaf of a value, yielding [dottedPath, value]. */
function stringLeaves(value: unknown, path: (string | number)[] = []): [string, string][] {
  if (typeof value === "string") return [[PATH_JOIN(path), value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => stringLeaves(v, [...path, i]));
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
      stringLeaves(v, [...path, k]),
    );
  }
  return [];
}

interface CollectionSpec {
  name: string;
  schema: { safeParse: (v: unknown) => { success: boolean; error?: { issues: { path: (string | number | symbol)[]; message: string }[] } } };
  items: unknown[];
  id: (item: unknown) => string;
}

export function validateAll(cols: Collections = collections): ValidateResult {
  const issues: string[] = [];
  const push = (entity: string, id: string, path: string, message: string) =>
    issues.push(`${entity}.${id} → ${path}: ${message}`);

  const specs: CollectionSpec[] = [
    { name: "projects", schema: Project, items: cols.projects, id: (i) => (i as ProjectT).slug ?? "?" },
    { name: "experience", schema: Experience, items: cols.experience, id: (i) => (i as ExperienceT).id ?? "?" },
    { name: "skills", schema: SkillCluster, items: cols.skills, id: (i) => (i as SkillClusterT).id ?? "?" },
    { name: "writing", schema: Essay, items: cols.writing, id: (i) => (i as EssayT).slug ?? "?" },
    { name: "knowledge", schema: KnowledgeEntry, items: cols.knowledge, id: (i) => (i as KnowledgeEntryT).id ?? "?" },
    { name: "thinking", schema: ThinkingStageDef, items: cols.thinkingFramework, id: (i) => (i as ThinkingStageDefT).id ?? "?" },
  ];

  // 1) schema + 3) forbidden-content (per entity).
  for (const spec of specs) {
    for (const item of spec.items) {
      const id = spec.id(item);
      const parsed = spec.schema.safeParse(item);
      if (!parsed.success && parsed.error) {
        for (const issue of parsed.error.issues) {
          push(spec.name, id, PATH_JOIN(issue.path as (string | number)[]) || "(root)", issue.message);
        }
      }
      for (const [leafPath, text] of stringLeaves(item)) {
        for (const label of contentForbiddenHits(text)) {
          push(spec.name, id, leafPath, `forbidden content "${label}"`);
        }
      }
    }
  }

  // 2) cross-entity: internal evidence/example links resolve through routes(). Cross-referencing
  // content (knowledge, HowIThink) links to project pages that land in later tickets, so resolve
  // against the fixed personal-build slug universe (lib/anchors ALL_PROJECT_SLUGS) rather than the
  // partially-filled `projects` collection — a link to a slug outside that universe still fails.
  const routeSet = routes({
    projectSlugs: ALL_PROJECT_SLUGS,
    essaySlugs: cols.writing.map((e) => e.slug),
  });
  for (const k of cols.knowledge) {
    k.evidence?.forEach((e, i) => {
      if (isInternalHref(e.href) && !resolves(e.href, routeSet)) {
        push("knowledge", k.id, `evidence.${i}.href`, `dangling internal link "${e.href}"`);
      }
    });
  }
  for (const t of cols.thinkingFramework) {
    if (isInternalHref(t.example.href) && !resolves(t.example.href, routeSet)) {
      push("thinking", t.id, "example.href", `dangling internal link "${t.example.href}"`);
    }
  }

  // 2b) composition invariants. Relaxed while collections fill (S03.02: empty collections allowed
  // until their tickets land) — the exact totals are enforced only once the collection reaches its
  // documented target size (3 featured cards, Solution-PRD §5; 11 knowledge entries, PB3), while the
  // no-conflict forms (distinct featured ranks, ≤1 large) are always enforced.
  const featured = cols.projects.filter((p) => p.featured);
  const ranks = featured.map((p) => p.featured as number);
  if (new Set(ranks).size !== ranks.length) {
    push("projects", "(collection)", "featured", "featured ranks must be distinct");
  }
  if (featured.length >= 3 && !(featured.length === 3 && new Set(ranks).size === 3 && ranks.every((r) => r >= 1 && r <= 3))) {
    push("projects", "(collection)", "featured", "exactly 3 featured personal projects with distinct ranks 1/2/3");
  }
  const larges = cols.projects.filter((p) => p.gridSize === "large");
  if (larges.length > 1) {
    push("projects", "(collection)", "gridSize", `at most one gridSize:'large' (found ${larges.length})`);
  }
  if (cols.projects.length >= 3 && larges.length !== 1) {
    push("projects", "(collection)", "gridSize", "exactly one gridSize:'large'");
  }
  if (cols.knowledge.length >= 11) {
    const home = cols.knowledge.filter((k) => k.surface.includes("home")).length;
    const panel = cols.knowledge.filter((k) => k.surface.includes("panel")).length;
    if (home !== 5 || panel !== 6) {
      push("knowledge", "(collection)", "surface", `surface counts must be 5 home + 6 panel (found ${home}/${panel})`);
    }
  }

  return issues.length === 0 ? { ok: true } : { ok: false, issues };
}
