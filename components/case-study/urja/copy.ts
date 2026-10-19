/**
 * Copy that belongs to the Urja paper-craft layout only (TASK-284, Tushar's brief urja.md + mockup).
 * Figures, links and the evidence list come from the record (data/case-studies/urja.ts) or the project's links; this file
 * holds the brief's shorter headings and captions. Everything about the fleet is simulated and says so.
 * Rule: the body names no other product; the next-project band names only TeachSpark.
 */
export const HERO = {
  kicker: "UR-01 · LIVE · SIMULATED FLEET",
  tagline: "The trip is done. Where did the money go?",
  lede: "An AI munshi for small fleet owners. Urja reconciles diesel, tolls and kilometres, then explains what doesn’t add up, in Hindi or English.",
  /** Proof cards: the record's two proofs (value and badge from the record) plus the simulated-fleet card. */
  proofs: [
    { label: "Every flag includes a confidence level." },
    { label: "Flags wrong in the simulated month.", note: "False-accusation guardrail: under 10%. Simulated, not a real-world rate." },
  ],
  fleet: { value: "24 trucks", label: "Simulated fleet; no real users yet." },
  heroArtAlt: "",
  dashCaption: "Today screen · simulated fleet",
} as const;

export const NAV = [
  { id: "why", n: "01", label: "Why" },
  { id: "product", n: "02", label: "Product" },
  { id: "system", n: "03", label: "System" },
  { id: "decisions", n: "04", label: "Decisions" },
  { id: "evidence", n: "05", label: "Evidence" },
] as const;

export const SECTION: Record<string, { eyebrow: string; headline: string }> = {
  why: { eyebrow: "Why it exists", headline: "Diesel is the biggest cost. The leak appears after the trip." },
  product: { eyebrow: "The product", headline: "Read the brief. Open the evidence. Ask the driver." },
  system: { eyebrow: "The system", headline: "From truck data to the owner’s morning." },
  decisions: { eyebrow: "Decisions", headline: "Rules find the money. AI explains the evidence." },
  evidence: { eyebrow: "Evidence", headline: "Tested on a simulated fleet. Real-world impact is still unproven." },
};

export const PROBLEM = {
  body: "Owners of 10–100 trucks run the business from a phone and WhatsApp. Urja helps them investigate the gap between trip costs and earnings.",
  road: ["Trip starts", "Diesel", "Tolls", "Kilometres", "Earnings", "Trip ends"],
  roadLabel: "One trip, from start to end",
  quoteCaption: "The owner’s question · Urja discovery",
} as const;

export const PRODUCT = {
  body: "A Hindi or English morning brief highlights trips that don’t add up. Each flag opens its evidence and confidence level. The owner decides what happens next.",
  captions: ["One flag’s evidence · simulated fleet", "The morning brief · Hindi"],
  notes: ["Route + trip evidence", "Confidence level", "Driver’s side", "Owner decides"],
  notesLabel: "What each flag shows",
} as const;

export const SYSTEM = {
  /** Same order as the record's five steps; the record's own subtitles are used. */
  flowLabel: "How a trip becomes a morning brief",
  rules: "Key rules",
  keyRules: ["Low-confidence flags say “Check”, never an accusation.", "The owner reviews evidence and decides."],
  split: "Rules evaluate each trip. The model only answers questions.",
  stack: "Next.js · Vercel · Three.js · MapLibre",
} as const;

export const DECISIONS = [
  { tag: "Focus", title: "One problem, explained", body: "Solve one owner’s daily question before building a broad telemetry dashboard." },
  { tag: "Trust", title: "Rules before model guesses", body: "Deterministic rules keep every flagged amount explainable; the model answers questions." },
  { tag: "Human control", title: "Owner makes the call", body: "Show confidence and the driver’s side. Never automate a deduction." },
] as const;

export const EVIDENCE = {
  body: "Urja runs on a fictional 24-truck fleet. The core test suite passed, but the live Ask Urja evaluation did not pass its final gate.",
  stats: [
    { value: "1,235", label: "Unit tests passed", tone: "ok" },
    { value: "515", label: "End-to-end tests passed", tone: "ok" },
    { value: "Ask Urja", label: "Evaluation gate failed", tone: "fail" },
  ],
  gaps: "What isn’t measured",
  gapLines: ["No real owners, trips or recoveries recorded.", "Ask Urja’s final evaluation gate failed after the free-tier quota was reached.", "Hindi copy has not had a native-speaker review."],
  categories: "Evidence on record",
} as const;

export const SOURCES = { headline: "Open it, watch it, read the source.", chip: "Sources and links" } as const;

/** Encoded sizes (scripts/urja-art/encode.mjs). */
export const ART = { hero: { w: 874, h: 600 } } as const;

/** The TeachSpark band art: two WebPs painted on the band colour of each theme (cream light band, lifted-navy dark band). */
export const TEACHSPARK_NEXT_ART = {
  light: "/media/case-studies/urja/art/teachspark-next-light.webp",
  dark: "/media/case-studies/urja/art/teachspark-next-dark.webp",
  alt: "A paper-craft miniature of a phone showing a chat, beside printed worksheets, an exam paper and a multiple-choice answer sheet, with a notebook, a pencil and paper clips: a teacher's classroom materials made over WhatsApp.",
  width: 1600,
  height: 1080,
} as const;

/** The TeachSpark band (the next project): line from the brief; art painted on each theme's band colour. */
export const NEXT_LINE = "WhatsApp chatbot that helps teachers create worksheets, exam papers and more.";
