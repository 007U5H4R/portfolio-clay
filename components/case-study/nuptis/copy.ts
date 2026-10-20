/**
 * Copy that belongs to the Nuptis paper-craft layout only (TASK-278, Tushar's brief Nuptis-full.md).
 * Numbers, evidence kinds, quotes, links and the evidence list come from the case-study record
 * (data/case-studies/nuptis.ts); this file holds the brief's shorter headings and captions.
 * Rule: the next-project band names only Bhakti Vilas; the body names no other product except Velora,
 * which the record itself cites as the day-seven follow-on.
 */
export const HERO = {
  kicker: "NP-01 · SOLO BUILD · LIVE ON MOCK DATA",
  tagline: "Vendor operations, without the wedding-day scramble.",
  lede: "Risk-based onboarding, work orders, payment milestones and pre-vetted backups in one workspace.",
  /** Labels for the record's two hero proofs (same order; values and badges come from the record). */
  proofLabels: ["Figma frames, with an AA audit", "Retired in favour of Velora"],
  proofNotes: ["Design evidence", "Design evidence"],
} as const;

export const NAV = [
  { id: "problem", n: "01", label: "Problem" },
  { id: "insight", n: "02", label: "Insight" },
  { id: "product", n: "03", label: "Product" },
  { id: "decisions", n: "04", label: "Decisions" },
  { id: "system", n: "05", label: "System" },
  { id: "evidence", n: "06", label: "Evidence" },
  { id: "learnings", n: "07", label: "Learnings" },
] as const;

export const SECTION: Record<string, { eyebrow: string; headline: string }> = {
  problem: { eyebrow: "The problem", headline: "One vendor no-show can derail the day." },
  insight: { eyebrow: "The insight", headline: "Vet by risk, not habit." },
  product: { eyebrow: "The product", headline: "Onboard by risk. Track the work. Switch to a backup." },
  decisions: { eyebrow: "Product decisions", headline: "Cut hard, and say why." },
  system: { eyebrow: "The system", headline: "The reducer is the API surface." },
  evidence: { eyebrow: "Evidence", headline: "Designed carefully. Measured honestly." },
  learnings: { eyebrow: "What I learned", headline: "Say what you know, and how you know it." },
};

export const PROBLEM = {
  lede: "15–30+ vendors, 5–7 ceremonies, and fragmented records across spreadsheets and chat threads.",
  steps: ["Spreadsheets", "Chat threads", "Vendor no-show", "No backup on record", "Event-day scramble"],
} as const;

export const INSIGHT = {
  lede: "High-consequence vendors need deeper checks. Low-risk vendors should not face the same process.",
  northStar: "High-risk work orders with a named backup before the event date.",
  northStarTag: "Intended North Star · not measured",
} as const;

export const PRODUCT = {
  /** In the record's shot order: onboarding, procurement, contingency drawer. */
  shots: [
    { title: "Risk-led intake", caption: "Capture vendor details and set a risk tier." },
    { title: "Work-order visibility", caption: "Track each order, owner and stage." },
    { title: "Pre-vetted backup", caption: "Select a qualified backup when a vendor fails." },
  ],
} as const;

export const DECISIONS = [
  { title: "Risk-tiered verification", could: "Vet every vendor the same way.", chose: "Different checks based on risk.", because: "High-consequence vendors deserve deeper scrutiny." },
  { title: "An explicit cut list", could: "Build every persona’s full feature set.", chose: "A defined nine-day scope, prioritised by value.", because: "Visible trade-offs make delivery more disciplined." },
  { title: "Workflow over AI", could: "Add an AI assistant.", chose: "A keyword-matching helper for the workflow.", because: "An AI surface adds no value if it does not improve the actual task." },
] as const;

export const SYSTEM = {
  /** Same order as the record's five steps. */
  steps: [
    { label: "React UI", note: "Single-page app." },
    { label: "Context + reducer", note: "Every action in one place." },
    { label: "localStorage", note: "Works offline first." },
    { label: "Supabase mirror", note: "Optional, for four RPCs." },
    { label: "Nine-table schema", note: "Structured data model." },
  ],
  rules: "Key rules",
} as const;

export const EVIDENCE = {
  gaps: "What isn’t measured",
  /** Brief labels for the record's two outcome proofs. */
  proofLabels: ["Figma prototype reactions", "Checked at 414 and 768 px; one bug fixed"],
  proofValues: ["283", "9 routes"],
} as const;

export const LEARNINGS = [
  { title: "Name intuition as intuition.", body: "When domain reasoning outruns fieldwork, disclose the assumption." },
  { title: "A North Star can stay dark.", body: "A well-defined metric is still unmeasured until it meets real-world data." },
  { title: "Track the craft too.", body: "Capture feedback about the build process, not only the product." },
] as const;

export const SOURCES = { headline: "Everything here is backed by a real artifact.", chip: "Sources and links" } as const;

/** Encoded sizes (scripts/nuptis-art/encode.mjs). */
export const ART = { hero: { light: { w: 1600, h: 1080 }, dark: { w: 1600, h: 1080 } } } as const;
