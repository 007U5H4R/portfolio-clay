import type { NextProjectArt } from "@/components/case-study/NextProject";

/**
 * Copy that belongs to the Pratyasa paper-craft layout only (TASK-280, Tushar's brief pratyasa-full-page-redesign.md).
 * Facts (patent number, co-inventor rank, evidence list, sample list, gaps, rules) come from the case-study record
 * (data/case-studies/pratyasa.ts); this file holds the brief's shorter headings and captions. Rule: nothing here claims a
 * metric, a diagnostic use or sole ownership; the sample results are the paper's, not product performance.
 */
export const HERO = {
  kicker: "PR-01 · RESEARCH PROTOTYPE · GRANTED PATENT",
  tagline: "A patent, on the record.",
  lede: "A point-of-care biosensor for bacterial endotoxin (LPS), documented through the real prototype, Android app, patent record, and research evidence.",
  /** Labels for the record's two hero proofs (same order; values and badges come from the record). */
  proofLabels: ["Granted patent", "Co-inventors"],
  /** The third fact card: the record's "patent owned by NIT–Calicut". */
  owner: { value: "NIT–Calicut", label: "Patent owner" },
  status: "Research prototype · Not an approved diagnostic",
  photoCaption: "The research prototype and its Android app",
} as const;

export const NAV = [
  { id: "problem", n: "01", label: "Problem" },
  { id: "product", n: "02", label: "The page" },
  { id: "decisions", n: "03", label: "Decisions" },
  { id: "system", n: "04", label: "System" },
  { id: "evidence", n: "05", label: "Evidence" },
] as const;

export const SECTION: Record<string, { eyebrow: string; headline: string }> = {
  problem: { eyebrow: "The problem", headline: "The invention was real. Its record didn’t exist." },
  product: { eyebrow: "The page", headline: "One page. The work, made visible." },
  decisions: { eyebrow: "Design decisions", headline: "Credibility over claims." },
  system: { eyebrow: "How it stays true", headline: "Every claim checked against an artifact." },
  evidence: { eyebrow: "Evidence", headline: "Tested in real samples. Reported in research." },
};

export const PROBLEM = {
  lede: "The patent, prototype, and published science existed, but there was no clear page to show recruiters or collaborators what had actually been built.",
  steps: ["Patent", "Prototype", "Published research", "No single record", "This case study"],
} as const;

export const PRODUCT = {
  lede: "The page brings together the analyser, Android app, sensor preparation, validation work, and supporting evidence.",
  /** In the record's shot order: the live page, the device case. */
  shots: [
    { title: "The live page", caption: "Shows the patent number, the prototype photo and the footage." },
    { title: "The device case", caption: "The analyser’s case, photographed as it is." },
  ],
  contribution: ["Electronics & firmware", "Android app", "Sensor preparation", "Validation testing"],
  contributionLabel: "Tushar’s work across the prototype",
} as const;

export const DECISIONS = [
  { title: "Audience", chose: "A credibility page", because: "For recruiters, collaborators, and colleagues, not patent buyers." },
  { title: "Attribution", chose: "Contributor framing", because: "The patent belongs to NIT–Calicut; Tushar is one of five co-inventors." },
  { title: "Safety", chose: "Research prototype, not an approved diagnostic", because: "The page must not imply regulatory approval." },
] as const;

export const SYSTEM = {
  /** Same order as the record's five steps. */
  steps: [
    { label: "Fact-locked PRD", note: "Source of claims." },
    { label: "Required facts", note: "Claims that must appear." },
    { label: "Fact checker", note: "Runs over the page." },
    { label: "Static page", note: "No third-party requests." },
    { label: "Live page", note: "pratyasa.tusharpathak.com" },
  ],
  lede: "A fact-locked brief and required-facts check keep the published page aligned with the evidence.",
  rules: "Build constraints",
  rulesNote: "These describe the Pratyasa page, not the biosensor hardware.",
} as const;

export const EVIDENCE = {
  /** The record's three sample types, as illustrations of the sample (never photographic proof). */
  samples: [
    { label: "Whole blood", note: "Reported in the paper" },
    { label: "Mayonnaise", note: "Reported in the paper" },
    { label: "Fruit juice", note: "Reported in the paper" },
  ],
  lede: "The published paper reports validation in whole blood, mayonnaise, and fruit juice. These are research results, not product metrics.",
  illustrationNote: "Icons illustrate the sample types; they are not photographs of the tests.",
  gaps: "What the record doesn’t have",
} as const;

export const SOURCES = { headline: "Every claim has a source.", lede: "Open the underlying artifacts to inspect what supports the page.", chip: "Sources" } as const;

/** Encoded sizes (scripts/pratyasa-art/encode.mjs). */
export const ART = {
  hero: { light: { w: 1600, h: 1195 }, dark: { w: 1600, h: 1195 } },
} as const;

/** The Campfire Board band artwork (TASK-280): a paper Kanban + Gantt + workflow miniature, painted on each band's colour. */
export const CAMPFIRE_NEXT_ART: NextProjectArt = {
  light: "/media/case-studies/pratyasa/art/next-light.webp",
  dark: "/media/case-studies/pratyasa/art/next-dark.webp",
  alt: "A paper-craft miniature of a software project command centre: a five-column Kanban board with ticket cards, a Gantt strip with dependency arrows, a path of connected workflow nodes and two Markdown document sheets.",
  width: 1600,
  height: 1063,
};

