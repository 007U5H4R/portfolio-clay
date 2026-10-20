/**
 * Copy that belongs to the TeachSpark paper-classroom layout only (TASK-263, Tushar's brief `tics.md`).
 * Every number, label, date, caveat and link on the page still comes from the case-study record
 * (data/case-studies/teachspark.ts), the project record and the portfolio entry; this file holds only
 * the layout's own headings, captions and art geometry.
 */
export const HERO = {
  kicker: "AI for real classroom work",
  headline: ["Less time preparing.", "More time teaching."],
  description: "A WhatsApp-first teaching assistant that turns a teacher’s topic into a ready-to-use worksheet.",
  demo: "Watch demo",
  pilot: "Explore the pilot",
} as const;

/** The panel chips (numbered, terracotta). */
export const CHIPS = {
  workflow: "How it works",
  demo: "Product demo",
  decisions: "Key product decisions",
  system: "System architecture",
  impact: "Pilot impact (first week)",
  learnings: "Key learnings",
  explore: "Explore the full story",
} as const;

/** The in-page navigator: short labels, in page order. `id` is the target element's id. */
export const NAV = [
  { id: "tsp-overview", label: "Overview" },
  { id: "whatsapp-experience", label: "Workflow" },
  { id: "product-demo", label: "Demo" },
  { id: "decisions", label: "Decisions" },
  { id: "system", label: "System" },
  { id: "activation", label: "Impact" },
  { id: "learnings", label: "Learnings" },
  { id: "explore", label: "Explore" },
] as const;

/** Workflow captions, one per paper stage (the stage order is the art's: teacher + phone, assistant, worksheet). */
export const WORKFLOW = [
  { title: "Share a topic", caption: "Teacher shares grade, subject, board and topic on WhatsApp", x: 0.115 },
  { title: "TeachSpark writes it", caption: "The assistant prepares the worksheet", x: 0.506 },
  { title: "Use it in class", caption: "A worksheet PDF plus the reusable prompt", x: 0.863 },
] as const;

/**
 * Architecture blocks drawn left to right in art/arch-*.webp (x = block centre as a fraction of the art's width).
 * `step` indexes the record's `system.steps`; block 1 pairs steps 0 and 1 (teacher on WhatsApp → Twilio webhook).
 */
export const ARCH = [
  { step: 0, x: 0.095, sub: 1 },
  { step: 2, x: 0.298 },
  { step: 3, x: 0.495 },
  { step: 4, x: 0.7 },
  { step: 5, x: 0.905 },
] as const;

export const ART = {
  hero: { w: 1000, h: 1058 },
  workflow: { w: 1100, h: 363 },
  arch: { w: 1100, h: 198 },
  footer: { w: 1344, h: 492 },
} as const;
