import type { z } from "zod";
import type { CaseStudy } from "../schema";

/**
 * Cinematic Portfolio — a portfolio as a scroll film (TASK-130; audit in
 * docs/reports/TASK-130/cinematic-portfolio.md). The film is AI-generated footage of Tushar himself
 * (Higgsfield); the stills shown are the site's own poster frames. The 197-credit film cost is a
 * build-tooling cost, never a product metric. The site's résumé stats are not repeated here.
 */
export const cinematicCase: z.input<typeof CaseStudy> = {
  slug: "cinematic-portfolio",
  theme: {
    key: "cinematic-portfolio",
    metaphor: "A screening room: a dark letterboxed ground, film-sprocket rules, frame-counter numerals",
    accents: ["forest", "note", "kraft"],
  },
  story: "Answering “who is Tushar?” in one scroll",
  extraSources: [
    { id: "CN-FRAMES", label: "Cinematic portfolio poster frames", ref: "CN/assets/posters/{hero,work,close}.jpg", inventory: "§8.11", url: "https://tushar-pathak.vercel.app/" },
  ],
  hero: {
    tagline: "A portfolio, on film.",
    proposition:
      "A scroll-driven film portfolio — AI-generated footage of Tushar as the backdrop, scrubbed like an Apple product page, with no build step.",
    proofs: [
      { value: "0 ms", label: "frames over 16 ms in the scrub benchmark", kind: "measured", asOf: "2026-08-26", source: "CN-LEDGER", note: "mean 0.04 ms per frame" },
      { value: "31 / 31", label: "QA checks passed across three passes", kind: "measured", asOf: "2026-08-26", source: "CN-LEDGER", note: "8/8, 11/11, 12/12" },
    ],
    media: {
      src: "/media/case-studies/cinematic-portfolio/film-hero.webp",
      alt: "The scroll film's opening frame: Tushar standing in warm light against a dark background.",
      width: 1400,
      height: 788,
      frame: "plain",
      provenance: "docs/case-study-sources/cinematic-portfolio/hero.jpg ← portfolio/cinematic/assets/posters/hero.jpg",
    },
    layout: "stacked",
  },
  sections: [
    {
      kind: "problem",
      id: "problem",
      nav: "Problem",
      eyebrow: "The question",
      headline: "Recruiters ask one thing first: who is Tushar Pathak?",
      anchors: ["01-context", "02-problem", "03-discovery"],
      context: "A list of links answers what he did, not who he is. The bet was a short film that answers both as you scroll.",
    },
    {
      kind: "product",
      id: "film",
      nav: "Film",
      eyebrow: "The film",
      headline: "Scroll, and the film plays with you.",
      anchors: ["05-what-i-built"],
      summary: "Three scenes — an opening, the work, a closing walk — scrub frame by frame with the page. Under reduced motion, the film becomes still frames.",
      source: "CN-PRD",
      shots: [
        {
          src: "/media/case-studies/cinematic-portfolio/film-work.webp",
          alt: "The film's work scene: Tushar seated at a desk among glowing holographic panels.",
          width: 900,
          height: 506,
          frame: "plain",
          caption: "The work scene",
          provenance: "docs/case-study-sources/cinematic-portfolio/work.jpg ← portfolio/cinematic/assets/posters/work.jpg",
        },
        {
          src: "/media/case-studies/cinematic-portfolio/film-close.webp",
          alt: "The film's closing scene: Tushar walking between tall panels of warm light.",
          width: 900,
          height: 506,
          frame: "plain",
          caption: "The closing walk",
          provenance: "docs/case-study-sources/cinematic-portfolio/close.jpg ← portfolio/cinematic/assets/posters/close.jpg",
        },
      ],
    },
    {
      kind: "decisions",
      id: "decisions",
      nav: "Decisions",
      eyebrow: "Decisions",
      headline: "Cinematic, but never at the reader’s expense.",
      anchors: ["04-product-bet"],
      items: [
        { could: "A conventional page of cards", chose: "A film as the backdrop", because: "The PRD starts from the recruiter’s first question: who, not what.", source: "CN-PRD" },
        { could: "Motion for everyone", chose: "A static fallback under reduced motion", because: "The film must never be the price of reading the page.", source: "CN-PRD" },
        { could: "A framework and a build step", chose: "Static HTML, CSS and vanilla JS", because: "Nothing to build; the film and the page ship as plain files.", source: "CN-PRD" },
      ],
    },
    {
      kind: "system",
      id: "system",
      nav: "System",
      eyebrow: "How it was made",
      headline: "Generated, cut, then scrubbed.",
      caption: "From generated film to scroll",
      source: "CN-LEDGER",
      steps: [
        { label: "Generate the film", note: "Higgsfield, credits pre-flighted" },
        { label: "Post-process", note: "ffmpeg and headless Chrome" },
        { label: "289 scrub frames" },
        { label: "Smooth scroll", note: "Lenis moves the frames" },
        { label: "Static fallback", note: "under reduced motion" },
      ],
      rules: ["197 credits spent, exactly as pre-flighted.", "The final review’s 1 critical and 2 important issues were fixed."],
    },
    {
      kind: "learnings",
      id: "learnings",
      nav: "Learnings",
      eyebrow: "What I learned",
      headline: "The tooling is part of the craft.",
      anchors: ["06-evaluation", "07-outcome", "08-what-i-learned"],
      items: [
        { title: "Know the tool’s gates", body: "Plan gating, refunds on a failed render and start-image versus reference behaviour shaped the film.", source: "CN-LEDGER" },
        { title: "Pre-flight the spend", body: "Estimating credits before rendering meant the film cost exactly what was planned.", source: "CN-LEDGER" },
      ],
    },
  ],
  evidence: [
    { title: "PRD", type: "PRD", date: "2026-08-25", supports: "The recruiter question, film-as-backdrop, the reduced-motion fallback", source: "CN-PRD" },
    { title: "Build ledger", type: "Build ledger", date: "2026-08-26", supports: "QA 8/8, 11/11, 12/12; scrub 0.04 ms; 197 credits; review fixes", source: "CN-LEDGER" },
    { title: "Poster frames", type: "Design", supports: "The three scenes shown here", source: "CN-FRAMES" },
  ],
};
