import type { z } from "zod";
import type { CaseStudy } from "../schema";

/**
 * Dino Arcade — your phone as an arcade cabinet, strictly BYO-ROM (TASK-130; audit in
 * docs/reports/TASK-130/dino-arcade-pwa.md). A short page: one README, no screenshots, no metrics,
 * no test results reviewed. Public framing stays "BYO-ROM" (CONTENT_INVENTORY §8.10 licensing note);
 * no game names, ROMs or BIOS files are mentioned. No trademarks (a generic pixel dinosaur).
 */
export const dinoArcadeCase: z.input<typeof CaseStudy> = {
  slug: "dino-arcade-pwa",
  theme: {
    key: "dino-arcade-pwa",
    metaphor: "A backlit arcade cabinet on a phone: marquee stripes, a CRT scanline ground, coin-slot numerals",
    accents: ["steel", "rust", "note"],
  },
  story: "A cabinet in your pocket — and why it can't ship games",
  extraSources: [
    { id: "SC-DISCOVERY-NOTE", label: "Slag City Discovery PRD", ref: "SC/Discovery-PRD.md §1 (2026-09-05)", inventory: "§8.13" },
  ],
  hero: {
    tagline: "Your phone, an arcade.",
    proposition:
      "A mobile-first Progressive Web App that turns a phone into a backlit arcade cabinet — marquee, recessed bezel, CRT shader and an on-screen controller. It ships no game data.",
    proofs: [
      { value: "0", label: "game files shipped or uploaded", kind: "structural", source: "DN-README", note: "you supply a file you are legally entitled to use" },
      { value: "0", label: "servers, accounts or analytics", kind: "structural", source: "DN-README" },
    ],
    media: {
      src: "/media/illustrations/covers/cover-dino-arcade-pwa.svg",
      alt: "Illustration of a teal smartphone dressed as a little arcade cabinet, a lit striped marquee on top and a pixel dinosaur on its screen, standing on a shelf before a big striped sunset over red desert mesas and pixel cacti, two coins beside it and a blank memory card sliding towards it.",
      width: 1600,
      height: 900,
      frame: "plain",
      provenance: "TASK-127 hand-authored cover, scripts/portfolio-art/scenes/dino-arcade-pwa (no screenshots exist)",
    },
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
      summary:
        "The cabinet is a PWA: add it to the home screen, load a game file you are entitled to use, and play — offline, with the file kept on the device.",
      source: "DN-README",
      flow: {
        caption: "From home screen to play",
        source: "DN-README",
        steps: [{ label: "Add to home screen" }, { label: "Load your own game file" }, { label: "Stored on the phone" }, { label: "Play offline" }],
      },
      shots: [
        {
          src: "/media/case-studies/dino-arcade-pwa/icon.webp",
          alt: "Dino Arcade's home-screen icon: a glowing orange play button under a marquee bar on a dark rounded tile.",
          width: 360,
          height: 360,
          frame: "plain",
          caption: "The home-screen icon",
          provenance: "docs/case-study-sources/dino-arcade-pwa/icon-512.jpg ← dino-arcade-pwa/assets/icon-512.png",
        },
      ],
    },
    {
      kind: "decisions",
      id: "decisions",
      nav: "Decisions",
      eyebrow: "Decisions",
      headline: "Bring your own ROM — the load-bearing decision.",
      anchors: ["04-product-bet"],
      items: [
        {
          could: "Bundle games with the app",
          chose: "Ship no game data at all",
          because: "“You are responsible for supplying a game file you are legally entitled to use.”",
          source: "DN-README",
        },
        {
          could: "A hosted service with accounts",
          chose: "Offline-first, on the device",
          because: "No backend, no accounts, no servers, no analytics — a service worker precaches the cabinet.",
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
      caption: "Dino Arcade’s moving parts",
      source: "DN-README",
      steps: [
        { label: "Service worker", note: "precaches the app" },
        { label: "Your game file", note: "kept in IndexedDB" },
        { label: "EmulatorJS", note: "vendored, self-hosted core" },
        { label: "Cabinet shell", note: "marquee, bezel, CRT shader" },
        { label: "On-screen controller" },
      ],
    },
    {
      kind: "outcome",
      id: "outcome",
      nav: "Outcome",
      eyebrow: "What happened",
      headline: "Fine for private play — never publishable.",
      anchors: ["06-evaluation", "07-outcome", "08-what-i-learned"],
      intro: "The emulator is fine for private use and cannot be published. That limit is where Slag City, an original game, began.",
      gaps: ["Test results for the emulator core exist in the repo but weren’t reviewed for this page.", "No screenshots or usage data are recorded."],
    },
  ],
  evidence: [
    { title: "README", type: "Readme", supports: "BYO-ROM, offline-first, EmulatorJS core, no backend", source: "DN-README" },
    { title: "Slag City Discovery PRD", type: "PRD", date: "2026-09-05", supports: "Why the emulator can’t be published", source: "SC-DISCOVERY-NOTE" },
  ],
};
