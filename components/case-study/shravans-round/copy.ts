/**
 * Copy that belongs to the Shravan's Round paper-craft layout only (TASK-283, Tushar's brief SR.md + mockup).
 * Numbers, evidence kinds, quotes, links and the evidence list come from the case-study record
 * (data/case-studies/shravans-round.ts) and the project record. This file holds the brief's shorter headings.
 * Facts audit against the record (mockup claims dropped or relabelled):
 *   "100% voice based" -> "Speak or type" (the record: voice in the browser, or text);
 *   "Instant score card" -> "Free score card" (nothing records "instant");
 *   "Gemini" chip dropped (the record names Next.js, Vercel, Supabase Postgres, pgvector and "two model providers" only);
 *   "real AI avatar" dropped (the site never shows Shravan's face); "Improve product thinking" dropped (unsupported).
 * Rule: the next-project band names only Urja; the body names no other product.
 */
export const HERO = {
  kicker: "SR-01 · LIVE · TEAM BUILD",
  tagline: "He listens. Then he asks the follow-up.",
  lede: "A 20-minute AI mock PM interview built around real Indian product cases, voice-led answers, follow-ups that respond to your answer, and a free score card. No login. No card.",
  primary: "Try a free mock",
  secondary: "See the product",
} as const;

export const NAV = [
  { id: "product", n: "01", label: "Product" },
  { id: "round", n: "02", label: "The round" },
  { id: "decisions", n: "03", label: "Decision" },
  { id: "system", n: "04", label: "System" },
  { id: "evidence", n: "05", label: "Evidence" },
] as const;

export const SECTION: Record<string, { eyebrow: string; headline: string }> = {
  product: { eyebrow: "The product", headline: "A real interview. A real score card." },
  round: { eyebrow: "The round", headline: "One answer shapes the next question." },
  decisions: { eyebrow: "A design decision", headline: "A face earns attention. Listening earns trust." },
  system: { eyebrow: "Under the hood", headline: "From spoken answer to useful follow-up." },
  evidence: { eyebrow: "Evidence", headline: "Live and free. Usage numbers aren’t claimed yet." },
};

/** Four promise tiles; each line is supported by the record (see the audit above). */
export const PROMISES = [
  { title: "Real PM cases", line: "Indian product context" },
  { title: "Voice interview", line: "Speak or type" },
  { title: "Adaptive follow-ups", line: "Responds to your answer" },
  { title: "Free score card", line: "No login, no card" },
] as const;

export const PRODUCT = {
  lede: "The experience is live, not a concept mockup. These are the product’s own screens.",
  /** In render order: score card (wide), landing, phone. */
  shots: [
    { title: "Leave with specific feedback", caption: "The site’s own example score card, from a made-up round." },
    { title: "Start with a real PM case", caption: "The landing screen: a free mock, no login." },
    { title: "The same round on a phone", caption: "The responsive screen, not a stretched desktop." },
  ],
} as const;

export const ROUND = [
  { title: "Start", line: "A short setup, no login" },
  { title: "Answer", line: "Speak or type your response" },
  { title: "Follow-up", line: "The next question responds to your answer" },
  { title: "Review", line: "A score card with evidence quotes and one thing to fix" },
] as const;

export const DECISIONS = {
  considered: [
    { tag: "Considered", title: "Pick a vendor from demos" },
    { tag: "Considered", title: "Build a custom 3D face" },
    { tag: "Chosen", title: "A commercial photo-driven avatar behind our own interface" },
  ],
  reason: "A scored trial compared lip-sync latency, interruption handling and identity consistency, and the best scorer went to the pilot.",
  score: { value: "39/45", label: "the winning score in my avatar trial", note: "Three vendors scored on one clip; the runner-up scored 35/45. Dated 2026-09-10, about the avatar vendors only, not a product result." },
  brand: { title: "The waveform became the brand cue.", body: "An animated listening ring marks the nav and the favicon: he is present and listening." },
} as const;

export const SYSTEM = {
  steps: [
    { label: "You answer", note: "Voice in the browser, or text" },
    { label: "An LLM classifies it", note: "What kind of answer this was" },
    { label: "Context is retrieved", note: "His teaching transcripts, via pgvector" },
    { label: "The follow-up", note: "The interviewer’s next line" },
    { label: "The score card", note: "A second model writes the report" },
  ],
  stack: ["Next.js", "Vercel", "Supabase Postgres", "pgvector"],
  rules: "Reliability rules",
  ruleLines: ["A fallback provider handles a refused call.", "The score card is generated after the round."],
} as const;

export const EVIDENCE = {
  verified: { title: "What is verified", items: ["Live product available", "Real product screens", "Interview and score-card flow"] },
  unmeasured: { title: "What isn’t measured here", items: ["Usage and completion rates", "Candidate outcomes", "Improvement in interview performance"] },
  body: "The round is live and free to try. No candidate, session or score data is reported in this case study.",
} as const;

export const SOURCES = { headline: "See it for yourself.", chip: "Project links" } as const;

/** Encoded sizes (scripts/shravans-round-art/encode.mjs). */
export const ART = {
  hero: { light: { w: 1400, h: 953 }, dark: { w: 1400, h: 953 } },
  next: { light: { w: 1200, h: 797 }, dark: { w: 1200, h: 797 } },
} as const;

/** The Urja band artwork (painted on each theme's own band colour). TASK-279 owns NextProject; the shared `art` prop carries this. */
export const URJA_NEXT_ART = {
  light: "/media/case-studies/shravans-round/art/urja-next-light.webp",
  dark: "/media/case-studies/shravans-round/art/urja-next-dark.webp",
  alt: "A paper-craft miniature of fleet operations: two freight trucks on a folded paper highway with a gold route line, waypoint pins and a small warehouse with a loading bay.",
  width: ART.next.light.w,
  height: ART.next.light.h,
} as const;

/** TASK-279: the supporting line under the Urja title. It is Urja's own descriptor (the brief), a product label, not a claim. */
export const URJA_NEXT_LINE = "Truck fleet management dashboard";
