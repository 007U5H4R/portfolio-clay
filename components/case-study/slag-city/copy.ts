import type { NextProjectArt } from "@/components/case-study/NextProject";

/**
 * Copy that belongs to the Slag City paper-craft layout only (TASK-282, Tushar's brief sc.md). Numbers, evidence kinds, the quote,
 * links and the evidence list come from the case-study record (data/case-studies/slag-city.ts); this file holds the brief's shorter
 * headings and captions. Rule: the next-project band names only The Shravan's Round; the body names no other product.
 */
export const HERO = {
  kicker: "SC-01 · LIVE · BROWSER GAME",
  tagline: "Insert coin. The browser is the cabinet.",
  lede: "An original arcade beat-’em-up that runs in your browser — one complete stage, on desktop or phone. Coins are free.",
} as const;

export const NAV = [
  { id: "why", n: "01", label: "Why" },
  { id: "product", n: "02", label: "Game" },
  { id: "decisions", n: "03", label: "Decisions" },
  { id: "system", n: "04", label: "System" },
  { id: "evidence", n: "05", label: "Evidence" },
] as const;

export const SECTION: Record<string, { eyebrow: string; headline: string }> = {
  why: { eyebrow: "Why it exists", headline: "Private emulators can’t ship. Original IP can." },
  product: { eyebrow: "The game", headline: "Attract. Insert coin. Fight. Continue. Initials." },
  decisions: { eyebrow: "Decisions", headline: "Deterministic underneath. Arcade on top." },
  system: { eyebrow: "How it works", headline: "One input frame. One pure core." },
  evidence: { eyebrow: "Evidence", headline: "Live since 16 September 2026 — no numbers yet." },
};

export const WHY = {
  constraint: { tag: "Constraint", title: "Private emulator", note: "Fine for private play. Cannot publish." },
  decision: { tag: "Decision", title: "Original browser game", note: "Wholly original IP. Playable by anyone." },
} as const;

/** Captions for the record's three real screenshots (combat, continue, phone), in the record's order. */
export const SHOTS = [
  { title: "Desktop: the simulated cabinet", note: "Fight through the stage." },
  { title: "The 10-second continue", note: "Coin-op countdown. Coins are free." },
  { title: "Phone: on-screen controls", note: "D-pad plus jump, attack and special." },
] as const;

export const DECISIONS = [
  { title: "Deterministic core" },
  { title: "One input frame" },
  { title: "Browser-synthesised audio" },
] as const;

export const SYSTEM = {
  /** Same order as the record's five steps; the brief's labels. */
  steps: [
    { label: "Input devices", note: "Keyboard · gamepad · touch" },
    { label: "Input frame", note: "One unified frame" },
    { label: "Pure core", note: "Seeded RNG, no rendering" },
    { label: "Phaser 3 scene", note: "Draws the frame" },
    { label: "Web Audio", note: "Synthesised sound" },
  ],
  rules: "Key rules",
} as const;

export const EVIDENCE = { gaps: "What isn’t measured" } as const;

export const SOURCES = { eyebrow: "Sources", headline: "Everything here is backed by a real artifact.", links: "Play and explore" } as const;

/** Encoded sizes (scripts/slag-city-art/encode.mjs). */
export const ART = {
  hero: { w: 1400, h: 797 },
  sign: { w: 900, h: 831 },
} as const;

/** The band's supporting line: the live product page's own words (its hero: "Rehearse the round before the round."; 20-minute AI mock PM interview). */
export const SHRAVAN_NEXT_LINE = "Rehearse the round before the round: a 20-minute AI mock PM interview.";

/**
 * The Shravan's Round band artwork: a paper desk with a laptop showing a faceless folded-paper interviewer bust, a listening
 * waveform and a live-mic mark (the real product is voice-led and never shows a face). Painted on each theme's band colour.
 */
export const SHRAVAN_NEXT_ART: NextProjectArt = {
  light: "/media/case-studies/slag-city/art/band-light.webp",
  dark: "/media/case-studies/slag-city/art/band-dark.webp",
  alt: "A paper-craft miniature of a live mock interview: an open laptop showing a faceless folded-paper interviewer beside a glowing listening waveform and a live-microphone mark, with a standing microphone, question cards and a notebook on a paper desk.",
  width: 1320,
  height: 876,
};
