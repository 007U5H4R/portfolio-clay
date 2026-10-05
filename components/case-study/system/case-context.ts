import type { CSSProperties } from "react";
import type { CaseStudy, EvidenceKind, PortfolioEntry, Project } from "@/data/schema";
import { EVIDENCE_KINDS } from "@/data/schema";
import { resolveVideoMedia } from "@/lib/portfolio";
import { watchUrl, type VideoMedia } from "@/lib/video-providers";
import { formatYearMonth } from "@/lib/format";
import type { EvidenceRow } from "./EvidenceDrawer";
import type { CaseAction } from "./CaseStudyCTA";

/**
 * What both case-study layouts (the shared system and the bespoke journal pages) derive from a record
 * the same way: accent variables, the evidence drawer rows, the badge legend, the product's videos and
 * the public action links. Kept in one place so the two layouts can never disagree on a fact.
 */

/** Paper-token accents → CSS custom properties the theme stylesheet reads (EVAL-020: token names only). */
export function accentVars(accents: readonly string[]): CSSProperties {
  const vars: Record<string, string> = {};
  accents.forEach((token, index) => {
    vars[`--csx-a${index + 1}`] = `var(--color-${token})`;
  });
  return vars as CSSProperties;
}

export const formatEvidenceDate = (value: string): string => {
  const [year, month, day] = value.split("-");
  const ym = formatYearMonth(`${year}-${month}`);
  return day ? `${Number(day)} ${ym}` : ym;
};

export function sourceMap(project: Project, study: CaseStudy) {
  return new Map([...project.sources, ...study.extraSources].map((source) => [source.id, source]));
}

/** Drawer rows: title · type · date · the claim it supports · a link only when the source is public. */
export function evidenceRows(project: Project, study: CaseStudy): EvidenceRow[] {
  const sources = sourceMap(project, study);
  return study.evidence.map((item) => ({
    title: item.title,
    type: item.type,
    date: item.date ? formatEvidenceDate(item.date) : undefined,
    supports: item.supports,
    url: sources.get(item.source)?.url,
  }));
}

/** The badge kinds a page uses (hero proofs + outcome proofs + funnel) — the one legend shows only those. */
export function legendKinds(study: CaseStudy): EvidenceKind[] {
  const kinds = new Set<EvidenceKind>(study.hero.proofs.map((proof) => proof.kind));
  for (const section of study.sections) {
    if (section.kind !== "outcome") continue;
    section.proofs.forEach((proof) => kinds.add(proof.kind));
    if (section.funnel) kinds.add(section.funnel.kind);
  }
  return EVIDENCE_KINDS.filter((kind) => kinds.has(kind));
}

export function videoFor(project: Project, portfolio: PortfolioEntry, mode: "pitch" | "demo"): VideoMedia | undefined {
  const entry = mode === "pitch" ? portfolio.pitchVideo : portfolio.demoVideo;
  return entry ? resolveVideoMedia(entry, project.name, mode) : undefined;
}

/** Only links that exist and are public: live product, YouTube pitch/demo, a public repo. */
export function caseActions(project: Project, portfolio: PortfolioEntry): CaseAction[] {
  const actions: CaseAction[] = [];
  if (project.links.live) actions.push({ kind: "live", label: "Live product", hint: `Open ${project.name.split(" → ").pop()}`, href: project.links.live });
  const pitch = videoFor(project, portfolio, "pitch");
  if (pitch) actions.push({ kind: "pitch", label: "Pitch video", hint: "Watch on YouTube", href: watchUrl(pitch) });
  const demo = videoFor(project, portfolio, "demo");
  if (demo) actions.push({ kind: "demo", label: "Demo video", hint: "Watch on YouTube", href: watchUrl(demo) });
  if (project.links.repoPublic && project.links.github) actions.push({ kind: "github", label: "GitHub", hint: "View the source", href: project.links.github });
  return actions;
}
