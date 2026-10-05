import type { z } from "zod";
import type { CaseStudy } from "../schema";

/**
 * Slag City — an original coin-op brawler for the browser (TASK-130; audit in
 * docs/reports/TASK-130/slag-city.md). Names no story character (Tushar, 2026-09-29). The game has
 * no AI features. The art-generation credit is left out of the public copy, as on the project record
 * (Tushar, 2026-09-29, TASK-129). No users, metrics or learnings are recorded. The title-clearance
 * owner gate is not a site claim and is not shown.
 */
export const slagCityCase: z.input<typeof CaseStudy> = {
  slug: "slag-city",
  theme: {
    key: "slag-city",
    metaphor: "A coin-op cabinet at night: CRT scanlines, neon-teal HUD frames, coin-slot numerals, molten-orange accents",
    accents: ["rust", "steel", "note"],
  },
  story: "A publishable arcade game, built like a cabinet",
  extraSources: [
    { id: "SC-CAPTURES", label: "Slag City critique captures", ref: "SC/docs/verification/critique2/{11-coin-new,06-gameplay-combat,20-continue-desktop,18-mobile-portrait-play}.png", inventory: "§8.13" },
  ],
  hero: {
    tagline: "Insert coin. The browser is the cabinet.",
    proposition:
      "An original arcade beat-’em-up that runs in your browser — one complete stage, on a desktop cabinet or a phone. Coins are free.",
    proofs: [
      { value: "3", label: "bosses in one complete stage", kind: "structural", source: "SC-README" },
      { value: "10 s", label: "continue countdown, coin-op style", kind: "structural", source: "SC-README" },
    ],
    media: {
      video: "pitch",
      poster: {
        src: "/media/case-studies/slag-city/attract.webp",
        alt: "Slag City's cabinet screen: the SLAG CITY marquee over a controls panel and “Press Enter — Start”, on a rusted industrial backdrop.",
        width: 1400,
        height: 816,
        frame: "plain",
        provenance: "docs/case-study-sources/slag-city/11-coin-new.jpg ← Slag City/docs/verification/critique2/11-coin-new.png",
      },
    },
    layout: "split-reverse",
  },
  sections: [
    {
      kind: "problem",
      id: "why",
      nav: "Why",
      eyebrow: "Why it exists",
      headline: "Dino Arcade can’t be published. An original game can.",
      anchors: ["01-context", "02-problem", "03-discovery"],
      context:
        "The emulator cabinet is fine for private play and can never ship. The goal became a publishable, original arcade beat-’em-up with wholly original IP.",
      quote: { text: "…a publishable, eventually commercial, original arcade beat-’em-up… with wholly original IP.", attribution: "Slag City Discovery PRD §1", source: "SC-DISCOVERY" },
    },
    {
      kind: "product",
      id: "product",
      nav: "Game",
      eyebrow: "The game",
      headline: "Attract, insert coin, fight, continue, initials.",
      anchors: ["05-what-i-built"],
      summary:
        "A side-scrolling brawler that behaves like a coin-op cabinet, with a story told in an eight-slide intro and the boss dialogue.",
      video: "demo",
      source: "SC-README",
      shots: [
        {
          src: "/media/case-studies/slag-city/combat.webp",
          alt: "Slag City gameplay in the desktop cabinet: a fighter on a scrap-strewn factory floor with the score and credit HUD above.",
          width: 1000,
          height: 563,
          frame: "plain",
          caption: "Desktop: the simulated cabinet",
          provenance: "docs/case-study-sources/slag-city/06-gameplay-combat.jpg ← Slag City/docs/verification/critique2/06-gameplay-combat.png",
        },
        {
          src: "/media/case-studies/slag-city/continue.webp",
          alt: "Slag City's “Continue?” screen counting down from 10, with “Press 5 — Insert coin to continue · Free”.",
          width: 1000,
          height: 583,
          frame: "plain",
          caption: "The 10-second continue",
          provenance: "docs/case-study-sources/slag-city/20-continue-desktop.jpg ← Slag City/docs/verification/critique2/20-continue-desktop.png",
        },
        {
          src: "/media/case-studies/slag-city/mobile.webp",
          alt: "Slag City on a phone in portrait: the game above an on-screen d-pad and jump, attack and special buttons.",
          width: 420,
          height: 909,
          frame: "phone",
          caption: "Phone: on-screen controls",
          provenance: "docs/case-study-sources/slag-city/18-mobile-portrait-play.jpg ← Slag City/docs/verification/critique2/18-mobile-portrait-play.png",
        },
      ],
    },
    {
      kind: "decisions",
      id: "decisions",
      nav: "Decisions",
      eyebrow: "Decisions",
      headline: "Deterministic underneath, arcade on top.",
      anchors: ["04-product-bet"],
      items: [
        { could: "Game logic tangled into the renderer", chose: "A pure, deterministic core with a seeded RNG", because: "Recorded input replays are hashed in tests, so a behaviour change fails a golden.", source: "SC-README" },
        { could: "Separate code per input device", chose: "Keyboard, gamepad and touch feed one input frame", because: "Every device drives the same game, desktop cabinet or phone.", source: "SC-README" },
        { could: "Ship sound files", chose: "Synthesise audio in the browser", because: "Web Audio makes every sound; there are no audio files.", source: "SC-README" },
      ],
    },
    {
      kind: "system",
      id: "system",
      nav: "System",
      eyebrow: "How it works",
      headline: "One input frame, one pure core.",
      caption: "A button press through Slag City",
      source: "SC-README",
      steps: [
        { label: "Keyboard · gamepad · touch" },
        { label: "One input frame" },
        { label: "Pure core", note: "seeded RNG, no rendering" },
        { label: "Phaser 3 scene", note: "draws the frame" },
        { label: "Web Audio", note: "synthesised sound" },
      ],
      rules: ["Recorded replays are hashed; a change fails a golden.", "Deployed on Vercel; built with TypeScript and Vite."],
    },
    {
      kind: "outcome",
      id: "evidence",
      nav: "Evidence",
      eyebrow: "Evidence",
      headline: "Live since 16 September 2026 — no numbers yet.",
      anchors: ["06-evaluation", "07-outcome", "08-what-i-learned"],
      intro: "The game is live and its repository is public. No players, sessions or scores have been recorded.",
      gaps: ["No users or usage data are recorded.", "No lessons-learnt file exists yet."],
    },
  ],
  evidence: [
    { title: "README", type: "Readme", supports: "The coin-op loop, features, the deterministic core", source: "SC-README" },
    { title: "Discovery PRD", type: "PRD", date: "2026-09-05", supports: "Why an original, publishable game", source: "SC-DISCOVERY" },
    { title: "Deploy notes", type: "Build ledger", date: "2026-09-16", supports: "Live on Vercel", source: "SC-DEPLOY" },
    { title: "Critique captures", type: "Evaluation", supports: "The cabinet, continue and phone screens shown here", source: "SC-CAPTURES" },
  ],
};
