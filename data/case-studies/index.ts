import { CaseStudy, type CaseStudy as CaseStudyT } from "../schema";
import { railciteCase } from "./railcite";
import { teachsparkCase } from "./teachspark";
import { veloraCase } from "./velora";
import { cubicleCase } from "./cubicle";
import { tegakiCase } from "./tegaki";
import { nuptisCase } from "./nuptis";
import { bhaktiVilasCase } from "./bhakti-vilas";
import { tokenToliCase } from "./token-toli";

/**
 * The case-study records (TASK-130, spec §37), one per personal build, parsed once so the schema's
 * defaults apply. A record's `source` ids are cross-checked against its project's `sources[]` by
 * `validateAll()` (data/index.ts). Server-only: never import this from a client component.
 */
export const caseStudyInputs = [teachsparkCase, railciteCase, veloraCase, cubicleCase, tegakiCase, nuptisCase, bhaktiVilasCase, tokenToliCase];

export const caseStudies: CaseStudyT[] = caseStudyInputs.map((input) => CaseStudy.parse(input));

export function getCaseStudy(slug: string): CaseStudyT | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

/** Every `source` id a case study cites (proofs, flows, decisions, steps, evidence rows, …). */
export function caseStudySourceIds(study: CaseStudyT): string[] {
  const ids: string[] = [];
  const walk = (value: unknown, key?: string) => {
    if (key === "source" && typeof value === "string") ids.push(value);
    else if (Array.isArray(value)) value.forEach((v) => walk(v));
    else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) walk(v, k);
  };
  walk({ ...study, extraSources: [] });
  return ids;
}

/**
 * Public prose words on the page (spec §4: ≈ 350–600, a ceiling, not a quota) — every rendered
 * string except the evidence drawer, source ids, art direction notes and image metadata.
 */
export function caseStudyWords(study: CaseStudyT): number {
  const skip = new Set(["source", "evidence", "theme", "story", "slug", "id", "anchors", "kind", "tone", "layout", "media", "shots", "poster", "video", "asOf"]);
  let words = 0;
  const walk = (value: unknown, key?: string) => {
    if (key && skip.has(key)) return;
    if (typeof value === "string") words += value.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
    else if (Array.isArray(value)) value.forEach((v) => walk(v));
    else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) walk(v, k);
  };
  walk(study);
  return words;
}
