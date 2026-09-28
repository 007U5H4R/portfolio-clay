/**
 * FAQ cache versioning (TASK-123, Tushar's FAQ-cache spec §51). SERVER / BUILD / TEST ONLY — it uses
 * `node:crypto` and imports the whole content layer, so it must never be imported by a client module.
 * The root layout calls `freshFaqIds()` while prerendering and hands the client only the list of ids.
 *
 * Each FAQ entry names the dependency groups its answer was written from (`dependsOn`). A group is a
 * slice of the canonical data modules; its version is a SHA-256 of that data's JSON. An entry's
 * `profileVersion` is a hash over its groups' versions, stamped when the answer was written or
 * reviewed. When any of that data changes, the recomputed version no longer matches and the entry is
 * stale: it is not served (it falls through to the normal answer path), `pnpm build`'s prebuild gate
 * prints it, and `tests/unit/tushky-faq-versions.test.ts` fails, naming it.
 *
 * Hashing the data VALUES (not the files) means a comment-only edit does not invalidate answers, while
 * any change to a rendered fact does. Refresh with `scripts/tushky-faq-refresh.ts` (Gemini drafts,
 * reviewed) or, after checking an answer by hand, `--stamp <id>`.
 */
import { createHash } from "node:crypto";
import { site } from "@/lib/site";
import { hero } from "@/data/hero";
import { experience } from "@/data/experience";
import { projects } from "@/data/projects";
import { enterpriseCases } from "@/data/enterprise";
import { skills } from "@/data/skills";
import { certifications } from "@/data/certifications";
import { awards, education, papers, patent, researchDisclaimer } from "@/data/credentials";
import { thinkingFramework } from "@/data/thinking-framework";
import { impactMetrics } from "@/data/impact";
import { knowledge } from "@/data/knowledge";
import type { FaqEntry } from "./faq";

/** The canonical data behind each dependency group. Injectable so tests can simulate a data change. */
export interface FaqSourceData {
  site: unknown;
  hero: unknown;
  experience: unknown;
  projects: readonly { slug: string; category: string }[];
  enterprise: unknown;
  skills: unknown;
  certifications: unknown;
  credentials: unknown;
  thinking: unknown;
  impact: unknown;
  knowledge: unknown;
}

export const LIVE_SOURCE_DATA: FaqSourceData = {
  site,
  hero,
  experience,
  projects,
  enterprise: enterpriseCases,
  skills,
  certifications,
  credentials: { awards, education, papers, patent, researchDisclaimer },
  thinking: thinkingFramework,
  impact: impactMetrics,
  knowledge,
};

/**
 * Group name → the data it covers. `project:<slug>` covers one project record; `projects` covers every
 * personal build (answers that list them). Where each group lives, for humans:
 *   profile        lib/site.ts `site` + data/hero.ts
 *   experience     data/experience.ts            enterprise     data/enterprise.ts
 *   projects       data/projects.ts (personal)   project:<slug> data/projects.ts (one record)
 *   skills         data/skills.ts                certifications data/certifications.ts
 *   credentials    data/credentials.ts           thinking       data/thinking-framework.ts
 *   impact         data/impact.ts                knowledge      data/knowledge.ts
 */
export function dependencyGroups(data: FaqSourceData = LIVE_SOURCE_DATA): Map<string, unknown> {
  const groups = new Map<string, unknown>([
    ["profile", { site: data.site, hero: data.hero }],
    ["experience", data.experience],
    ["projects", data.projects.filter((p) => p.category === "personal")],
    ["enterprise", data.enterprise],
    ["skills", data.skills],
    ["certifications", data.certifications],
    ["credentials", data.credentials],
    ["thinking", data.thinking],
    ["impact", data.impact],
    ["knowledge", data.knowledge],
  ]);
  for (const project of data.projects) groups.set(`project:${project.slug}`, project);
  return groups;
}

const sha = (text: string): string => createHash("sha256").update(text).digest("hex");

/** Version of every group: the first 12 hex chars of SHA-256 over its JSON. */
export function groupVersions(data: FaqSourceData = LIVE_SOURCE_DATA): Map<string, string> {
  const out = new Map<string, string>();
  for (const [name, value] of dependencyGroups(data)) out.set(name, sha(JSON.stringify(value)).slice(0, 12));
  return out;
}

/**
 * The `profileVersion` an entry depending on `dependsOn` should carry for the current data. Throws on
 * an unknown group, so a typo in `dependsOn` fails loudly instead of silently never invalidating.
 */
export function profileVersionFor(dependsOn: readonly string[], versions: Map<string, string> = groupVersions()): string {
  const parts = [...new Set(dependsOn)].sort().map((group) => {
    const v = versions.get(group);
    if (!v) throw new Error(`unknown FAQ dependency group "${group}"`);
    return `${group}=${v}`;
  });
  return `v1-${sha(parts.join("\n")).slice(0, 12)}`;
}

export interface FaqFreshness {
  fresh: string[];
  stale: { id: string; stored: string; current: string; dependsOn: string[] }[];
}

/** Split the entries into fresh (servable) and stale (not served) for the given data. */
export function faqFreshness(entries: readonly FaqEntry[], data: FaqSourceData = LIVE_SOURCE_DATA): FaqFreshness {
  const versions = groupVersions(data);
  const result: FaqFreshness = { fresh: [], stale: [] };
  for (const entry of entries) {
    const current = profileVersionFor(entry.dependsOn, versions);
    if (current === entry.profileVersion) result.fresh.push(entry.id);
    else result.stale.push({ id: entry.id, stored: entry.profileVersion, current, dependsOn: entry.dependsOn });
  }
  return result;
}

/** Ids of the entries that may be served (used by app/layout.tsx at prerender time). */
export function freshFaqIds(entries: readonly FaqEntry[], data: FaqSourceData = LIVE_SOURCE_DATA): string[] {
  return faqFreshness(entries, data).fresh;
}
