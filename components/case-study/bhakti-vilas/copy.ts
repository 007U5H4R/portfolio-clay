/**
 * Copy that belongs to the Bhakti Vilas paper-craft layout only (TASK-276, Tushar's brief bv.md).
 * Numbers, evidence kinds, links and the evidence list come from the case-study record (data/case-studies/bhakti-vilas.ts),
 * the project record and the portfolio entry. This file holds the brief's shorter wording, each line checked against that record:
 * nothing here states a number, outcome or capability the record does not carry (the mockup's "1 in 3", "70%", "4/5", "3x", "89%"
 * are not in the record and are not shown). Hard rule from the brief: only the next-project footer names another product.
 */
export const HERO = {
  kicker: "BV-01 · LIVE PROTOTYPE · MOCK DATA · TEAM",
  description: "A guided wellness experience for older adults, built around bhajan, community, and everyday devotional routines.",
  tags: ["Elder wellness", "Guided routines", "Community"],
  cta: "Explore the live prototype",
  /** Brief labels for the record's two hero proofs (same order: values and badges come from the record). */
  proofLabels: ["commits by Tushar in a team build", "sources behind “why bhakti?”"],
} as const;

/** The in-page navigator, in page order. `id` is each section's id in the record. */
export const NAV = [
  { id: "problem", n: "01", label: "Problem" },
  { id: "decisions", n: "02", label: "Approach" },
  { id: "product", n: "03", label: "Prototype" },
  { id: "evidence", n: "04", label: "Evidence" },
  { id: "learnings", n: "05", label: "Learnings" },
] as const;

/** Section eyebrow + heading per record section id. `research` has no section of its own: its content sits inside the problem. */
export const SECTION: Record<string, { eyebrow: string; headline: string }> = {
  problem: { eyebrow: "The problem", headline: "Elder care has a shortage of clarity, not of products." },
  research: { eyebrow: "Research (team)", headline: "Distance was never the variable. Availability was." },
  decisions: { eyebrow: "The approach", headline: "Make devotion the doorway to wellbeing." },
  product: { eyebrow: "The prototype", headline: "A working prototype, not just a concept." },
  evidence: { eyebrow: "Evidence", headline: "Research shaped the experience. The prototype tested the flow." },
  learnings: { eyebrow: "What I learned", headline: "Honest framing is part of the design." },
};

/** Problem cards, each lifted from the record's own problem and research text (no invented statistics). */
export const PROBLEM = {
  cards: [
    { k: "Clarity", v: "No trusted, verifiable layer tells the family whether their parent is getting safe, dignified care." },
    { k: "Integration", v: "The family ends up as the system integrator, despite being the least present." },
    { k: "Availability", v: "Distance was never the variable. Availability was." },
  ],
  quoteLabel: "From the Case Study 2 brief",
} as const;

/** The four-step path. Each line matches a page of the live prototype or its verified booking flow. */
export const APPROACH = {
  steps: [
    { art: "diya", k: "Daily practice", v: "Bhajan and gentle wellness sessions." },
    { art: "circle", k: "Community", v: "Neighbourhood circles that create connection." },
    { art: "rhythm", k: "Personal rhythm", v: "Pick a date and a circle that fits your week." },
    { art: "progress", k: "Progress", v: "Streaks and levels: a simple view of participation." },
  ],
  coded: "Why devotion first",
  funnelLabel: "Staged-reveal funnel · directional estimates, not measured",
} as const;

export const PROTOTYPE = {
  lede: "A navigable prototype brought the key journeys to life using mock data.",
  cta: "Explore the live prototype",
  flowLabel: "The verified booking flow",
  /** Captions in the record's shot order: home, community, profile (the funnel has its own caption). */
  captions: ["Home · Bhajan circles, with a buddy to keep the habit", "Community · Member stories and the next circle", "Profile · Streaks and levels (mock member)"],
} as const;

export const EVIDENCE = {
  researchTitle: "Research findings",
  researchChip: "Team research",
  checks: "The session-booking flow was verified end to end.",
  prototypeTitle: "Prototype checks",
  prototypeChip: "Mock-data prototype checks",
  gaps: "What is not measured",
} as const;

/** Brief card copy (title + one line), matched to the record's three learnings in order. */
export const LEARNINGS = [
  { title: "Show the gaps", body: "Make incomplete translation and unreviewed copy visible." },
  { title: "Don’t dress devotion as a clinic", body: "Devotional wellbeing must not imply clinical validation." },
  { title: "Credit the team clearly", body: "Separate individual contribution from team output." },
] as const;

export const SOURCES = { headline: "Built on real artifacts.", chip: "Source material" } as const;

export const NEXT = { eyebrow: "Next project" } as const;

/** Encoded sizes (scripts/bv-art/encode.sh). */
export const ART = {
  hero: { w: 1700, h: 949 },
  footer: { w: 2400, h: 1018 },
  obj: { w: 480, h: 480 },
} as const;
