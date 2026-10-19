/**
 * Copy that belongs to the Velora paper-craft layout only (TASK-273, Tushar's brief vel.md).
 * Numbers, dates, evidence kinds, links and the evidence list still come from the case-study record
 * (data/case-studies/velora.ts), the project record and the portfolio entry. This file holds the brief's shorter copy.
 * Hard rule from the brief: the first product's name appears ONLY in the next-project footer, so nothing here may name it.
 */
export const HERO = {
  kicker: "VL-01 · LIVE · MOCK DATA",
  stickyNote: "Trust. Match. Make it real.",
  /** Brief labels for the record's three hero proofs (same order: values and badges come from the record). */
  proofLabels: ["directions explored", "first hypothesis retired", "Velora prototype built"],
} as const;

/** The in-page navigator, in page order. `id` is each section's id in the record. */
export const NAV = [
  { id: "problem", n: "01", label: "Problem" },
  { id: "research", n: "02", label: "Insight" },
  { id: "pivot", n: "03", label: "Pivot" },
  { id: "portable-trust", n: "04", label: "Product" },
  { id: "learnings", n: "05", label: "Learnings" },
  { id: "evidence", n: "06", label: "Evidence" },
] as const;

/** Section eyebrow + heading per record section id (brief §4). */
export const SECTION: Record<string, { eyebrow: string; headline: string }> = {
  problem: { eyebrow: "The problem", headline: "Supplier trust doesn’t travel." },
  research: { eyebrow: "The research insight", headline: "The wait is between hand-offs." },
  pivot: { eyebrow: "The pivot", headline: "Keep the insight. Change the bet." },
  "portable-trust": { eyebrow: "The product bet", headline: "One trust profile. Every step." },
  learnings: { eyebrow: "Key learnings", headline: "Learnings worth keeping." },
  evidence: { eyebrow: "Evidence", headline: "A working prototype. Not traction." },
};

export const PROBLEM = {
  lede: "Brands need reliable makers. Factories need the right buyers. Today, discovery often depends on referrals, trade fairs, and scattered directories.",
  steps: [
    { label: "Referrals", art: "referral" },
    { label: "Directories", art: "directory" },
    { label: "Unverified trust", art: "tag" },
    { label: "Repeated legwork", art: "lens" },
  ],
  fullFlow: "The full flow, step by step",
} as const;

export const RESEARCH = {
  lede: "Team secondary research suggested that onboarding delays can accumulate between teams, not just during active work.",
  /** Shown beside the time strip; the strip's own segment labels come from the record. */
  qualifier: "Secondary research · verify before external use",
  stripLabel: "Where onboarding time goes (team secondary research)",
} as const;

export const PIVOT = {
  steps: [
    { k: "Days 1–7", v: "Test the first direction" },
    { k: "Evidence", v: "A narrow market and weak willingness-to-pay signals" },
    { k: "Keep", v: "The trust + onboarding insight" },
    { k: "Build next", v: "Apparel sourcing" },
  ],
  retired: "The retired direction",
} as const;

export const PRODUCT = {
  lede: "A manufacturer profile carries into every match, RFP, and bid—so both sides can compare opportunities with more context.",
  flow: ["Brand ↔ Manufacturer", "Match", "RFP", "Bid"],
  /** Captions in the record's shot order: trust-profile, rfps, bids. */
  captions: ["Manufacturer trust profile", "Brand RFPs", "Bids, sorted by match"],
  scoreCaveat: "Trust score · authored prototype data",
} as const;

export const LEARNINGS = [
  { title: "Kill without flinching", body: "A large market can still be the wrong market." },
  { title: "Find the hand-offs", body: "Waiting between teams can matter more than task duration." },
  { title: "Label what’s real", body: "Mock data is a prototype—not proof of traction." },
] as const;

export const EVIDENCE = { gaps: "Not measured" } as const;

export const SOURCES = { headline: "Built on real artifacts.", chip: "Source material" } as const;

/** Evidence rows that name the first product are dropped; rows that describe it by market get a neutral line. */
export const SUPPORTS_OVERRIDE: Record<string, string> = {
  "Nine-day series": "The day-seven decision and the closing line",
};

export const NEXT = { eyebrow: "Next project", line: "Wedding vendor operations" } as const;

/** Encoded sizes (scripts/velora-art/encode.mjs); the hero screen rectangles live in hero-screen.json beside the art. */
export const ART = {
  hero: { light: { w: 1400, h: 800 }, dark: { w: 1400, h: 974 } },
  footer: { light: { w: 2600, h: 1666 }, dark: { w: 2600, h: 1753 } },
  obj: { referral: { w: 340, h: 265 }, directory: { w: 340, h: 271 }, tag: { w: 340, h: 296 }, lens: { w: 340, h: 270 } },
} as const;
