/**
 * Copy that belongs to the RailCite paper-archive layout only (TASK-268, Tushar's brief RCCS.md).
 * Every number, label, date, caveat, citation and link on the page still comes from the case-study record
 * (data/case-studies/railcite.ts), the project record and the portfolio entry; this file holds only the layout's
 * own kicker, short section copy and the pictograms' labels.
 */
export const HERO = {
  kicker: "RC-01 · LIVE",
  stickyNote: "Cite. Don’t guess.",
} as const;

/** The in-page navigator, in page order. `id` is each section's id in the record. */
export const NAV = [
  { id: "problem", n: "01", label: "Problem" },
  { id: "product", n: "02", label: "Product" },
  { id: "decisions", n: "03", label: "Decisions" },
  { id: "how-trust-works", n: "04", label: "System" },
  { id: "evidence", n: "05", label: "Evidence" },
  { id: "learnings", n: "06", label: "Learnings" },
] as const;

/**
 * The four-step risk strip (RCCS §3). Each step names the record's own flow steps it condenses
 * (`from` indexes `problem.flow.steps`), so the full six-step process stays one tap away.
 */
export const PROBLEM = {
  lede: "Rules are scattered across circulars and scanned PDFs. Supersession is easy to miss; manual citation leaves room for error.",
  steps: [
    { label: "Years of circulars", icon: "files" },
    { label: "Scanned PDFs", icon: "scan" },
    { label: "Rules updated or superseded", icon: "superseded" },
    { label: "Manual search and citation", icon: "search" },
  ],
  outcome: "One defensible answer.",
  fullFlow: "The full six-step process today",
} as const;

export const PRODUCT = {
  lede: "RailCite answers from passages that govern the case, with citations you can verify. When evidence is missing, it says so.",
  note: "Answers with verified citations from real circulars.",
  chips: [
    { title: "Grounded answers", hint: "from actual circulars" },
    { title: "Traceable citations", hint: "circular, date and page" },
    { title: "Clear refusals", hint: "when evidence is insufficient" },
  ],
} as const;

/** Short card titles for the three recorded decisions (the record's `because` carries the reason). */
export const DECISION_TITLES = ["Cite or refuse", "Validate in code", "Hard domain boundaries"] as const;

export const SYSTEM = {
  /** Index of the citation validator in the record's seven steps: the trust checkpoint. */
  validator: 5,
  checkpoint: "Trust checkpoint",
  failure: "If a citation does not resolve",
} as const;

export const EVIDENCE = {
  gaps: "What isn’t measured",
} as const;

export const SOURCES = {
  headline: "Everything here is backed by a real artifact.",
  chip: "Sources",
} as const;

export const NEXT = { eyebrow: "Next" } as const;

export const ART = {
  hero: { w: 900, h: 591 },
  footer: { w: 1344, h: 524 },
} as const;
