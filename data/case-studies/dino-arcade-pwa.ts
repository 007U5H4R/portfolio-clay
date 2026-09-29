import type { z } from "zod";
import type { CaseStudy } from "../schema";

/**
 * Dino Arcade — a legal constraint became the architecture, and led to Slag City (TASK-130; audit in
 * docs/reports/TASK-130/dino-arcade-pwa.md). Journal layout (Tushar's redesign brief, 2026-09-29):
 * product · the BYO-ROM decision · the on-device system · the outcome that started Slag City ·
 * learnings. One README, a locally captured cabinet screen, the real app icon; no metrics, no test
 * results reviewed. Public framing stays "BYO-ROM" (CONTENT_INVENTORY §8.10 licensing note): no game
 * names, ROMs or BIOS files, no trademarks — the cabinet's own marquee (a licensed title) is cropped
 * off the capture, and the scene's pixel dinosaur is a generic sauropod. The three learnings were set
 * by Tushar in the redesign brief; each traces to the README or the Slag City Discovery PRD.
 */
export const dinoArcadeCase: z.input<typeof CaseStudy> = {
  slug: "dino-arcade-pwa",
  layout: "journal",
  theme: {
    key: "dino-arcade-pwa",
    metaphor: "A retro arcade poster on a desert road-trip postcard: a phone dressed as a cabinet, striped sunset, mesas, coins, a power-cable rail and token markers",
    accents: ["rust", "steel", "note"],
  },
  story: "A constraint became the product — and led to the next build",
  extraSources: [
    { id: "SC-DISCOVERY-NOTE", label: "Slag City Discovery PRD", ref: "SC/Discovery-PRD.md §1 (2026-09-05)", inventory: "§8.13" },
  ],
  hero: {
    tagline: "Your phone, an arcade.",
    proposition: "A mobile-first PWA that turns a phone into a backlit arcade cabinet — and ships zero game data.",
    beats: ["Install it.", "Bring your own game.", "Play offline."],
    notes: ["Insert coin.", "Your file. Your device.", "Offline means offline."],
    proofs: [
      { value: "0", label: "game files shipped", kind: "structural", source: "DN-README", note: "you supply a file you’re entitled to use" },
      { value: "0", label: "servers, accounts or analytics", kind: "structural", source: "DN-README", note: "static, entirely on the device" },
    ],
    media: {
      src: "/media/case-studies/dino-arcade-pwa/cabinet.webp",
      alt: "Dino Arcade running on a phone held landscape: a dark recessed cabinet bezel with one glowing orange “Insert Coin — Tap to start” button.",
      width: 1200,
      height: 505,
      frame: "plain",
      provenance: "docs/case-study-sources/dino-arcade-pwa/cabinet-landscape.jpg ← run locally from 007U5H4R/dino-arcade-pwa@0bd1368 (marquee cropped)",
    },
    scene: { src: "/media/case-studies/dino-arcade-pwa/hero-postcard.svg", width: 1200, height: 960 },
    layout: "split",
  },
  sections: [
    {
      kind: "product",
      id: "product",
      nav: "Product",
      eyebrow: "The product",
      headline: "Install it like an app. Bring your own game.",
      anchors: ["01-context", "02-problem", "03-discovery", "05-what-i-built"],
      summary: "Add the cabinet to the home screen, load a game file you’re entitled to use, and play — offline, with the file kept on the phone.",
      source: "DN-README",
      flow: {
        caption: "From home screen to play",
        source: "DN-README",
        steps: [{ label: "Add to home screen" }, { label: "Load your own file" }, { label: "Stored on the device" }, { label: "Play offline" }],
      },
      shots: [
        {
          src: "/media/case-studies/dino-arcade-pwa/cabinet.webp",
          alt: "Dino Arcade on a phone held landscape: a dark recessed cabinet bezel with one glowing orange “Insert Coin — Tap to start” button.",
          width: 1200,
          height: 505,
          frame: "plain",
          caption: "The cabinet, waiting for a coin",
          provenance: "docs/case-study-sources/dino-arcade-pwa/cabinet-landscape.jpg ← run locally from 007U5H4R/dino-arcade-pwa@0bd1368 (marquee cropped)",
        },
        {
          src: "/media/case-studies/dino-arcade-pwa/icon.webp",
          alt: "Dino Arcade's home-screen icon: a glowing orange play button under a marquee bar on a dark rounded tile.",
          width: 360,
          height: 360,
          frame: "plain",
          caption: "On the home screen",
          provenance: "docs/case-study-sources/dino-arcade-pwa/icon-512.jpg ← dino-arcade-pwa/assets/icon-512.png",
        },
      ],
    },
    {
      kind: "decisions",
      id: "decisions",
      nav: "Decision",
      eyebrow: "The load-bearing decision",
      headline: "Bring your own ROM.",
      anchors: ["04-product-bet"],
      items: [
        {
          could: "Bundle games",
          chose: "Ship zero game data",
          because: "The player supplies a file they are legally entitled to use.",
          source: "DN-README",
        },
        {
          could: "Host accounts and files",
          chose: "On the device, offline",
          because: "The cabinet doesn’t need a backend: no servers, no accounts, no analytics.",
          source: "DN-README",
        },
      ],
    },
    {
      kind: "system",
      id: "system",
      nav: "System",
      eyebrow: "How it works",
      headline: "Everything runs on the phone.",
      caption: "The five parts of the cabinet, all on the device",
      source: "DN-README",
      steps: [
        { label: "Service worker", note: "power: caches it for offline" },
        { label: "IndexedDB", note: "the slot: your file stays here" },
        { label: "EmulatorJS", note: "the board: a self-hosted core" },
        { label: "Cabinet shell", note: "marquee, bezel, CRT shader" },
        { label: "Controller", note: "on-screen joystick and buttons" },
      ],
    },
    {
      kind: "pivot",
      id: "outcome",
      nav: "Outcome",
      eyebrow: "What happened",
      headline: "Fine for private play. Never publishable.",
      anchors: ["06-evaluation", "07-outcome"],
      from: { name: "Dino Arcade", line: "A cabinet for games you already own — fine for private play." },
      evidence: [{ text: "An emulator of licensed games can never be published.", source: "SC-DISCOVERY-NOTE" }],
      decision: { text: "Build an original game, with wholly original IP.", source: "SC-DISCOVERY-NOTE" },
      to: { name: "Slag City", line: "A publishable, original coin-op brawler for the browser." },
      stamp: "Can’t publish",
    },
    {
      kind: "learnings",
      id: "learnings",
      nav: "Learnings",
      eyebrow: "Key learnings",
      headline: "What the cabinet taught me.",
      anchors: ["08-what-i-learned"],
      items: [
        { title: "Constraints can create the product", body: "Shipping no game data shaped everything: the file picker, local storage, offline play.", source: "DN-README" },
        { title: "Local-first simplifies more than infrastructure", body: "No backend means nothing to host, no account to sign in to, nothing to track.", source: "DN-README" },
        { title: "A dead end can reveal the next build", body: "An emulator that can never be published is why Slag City exists.", source: "SC-DISCOVERY-NOTE" },
      ],
    },
  ],
  evidence: [
    { title: "README", type: "Readme", supports: "BYO-ROM, offline-first, the EmulatorJS core, no backend", source: "DN-README" },
    { title: "Slag City Discovery PRD", type: "PRD", date: "2026-09-05", supports: "Why the emulator can’t be published, and the original game that followed", source: "SC-DISCOVERY-NOTE" },
  ],
};
