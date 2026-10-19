import type { z } from "zod";
import type { CaseStudy } from "../schema";

/**
 * The Shravan's Round — AI mock PM interviews fronted by Shravan's voice (TASK-243). A team build:
 * teammates own the voice loop, the brain, the score card and the report; Tushar owns the avatar layer,
 * the brand mark and the films. Only Tushar's part is claimed as his. The portfolio never shows
 * Shravan's face: the hero is cropped right of his portrait and the score card above his photo
 * (TASK-243, 2026-10-17). The score card shown is the site's own labelled example ("a made-up round").
 * No users or outcomes are recorded, so none are claimed.
 */
export const shravansRoundCase: z.input<typeof CaseStudy> = {
  slug: "shravans-round",
  theme: {
    key: "shravans-round",
    metaphor: "A late-evening interview room: warm dark plum walls, an amber listening-ring waveform, copper notes in the margin",
    accents: ["terracotta", "navy-2", "note"],
  },
  story: "Rehearse the round before the round",
  layout: "shravans-round", // TASK-283: the paper-craft redesign (components/case-study/shravans-round)
  extraSources: [
    { id: "SR-CAPTURES", label: "The Shravan's Round live captures", ref: "shravans-round.vercel.app / and /feedback (captured 2026-10-17)", inventory: "§8.14" },
  ],
  hero: {
    tagline: "He listens. Then he asks the follow-up.",
    proposition:
      "A 20-minute AI mock PM interview fronted by Shravan's voice: real Indian product cases, cross-questions that follow your answer, and a free score card at the end. No login, no card.",
    proofs: [
      { value: "20 min", label: "one round, then a free score card", kind: "structural", source: "SR-README" },
      { value: "39/45", label: "the winning score in my avatar trial", kind: "measured", note: "Three vendors scored on lip latency, interruption and identity; the runner-up scored 35/45.", asOf: "2026-09-10", source: "SR-AVATAR" },
    ],
    media: {
      video: "pitch",
      poster: {
        src: "/media/case-studies/shravans-round/landing.webp",
        alt: "The Shravan's Round landing page: “Rehearse the round before the round.” over a Start a free mock button and an amber waveform marked Listening.",
        width: 1100,
        height: 1000,
        frame: "browser",
        provenance: "docs/case-study-sources/shravans-round/landing-desktop.jpg ← live capture of shravans-round.vercel.app, cropped right of the portrait",
      },
    },
    layout: "split",
  },
  sections: [
    {
      kind: "problem",
      id: "why",
      nav: "Why",
      eyebrow: "Why it exists",
      headline: "A voice next to a photo reads as a chatbot, not an interviewer.",
      anchors: ["01-context", "02-problem", "03-discovery"],
      context:
        "Candidates prepare for PM rounds with US textbook cases and no one to push back. The promise here is a round on the Indian cases Shravan teaches with, and it only works if it feels like a person is listening.",
      quote: { text: "…a static photo next to a voice reads as a chatbot, not a person.", attribution: "Avatar layer Discovery PRD §1", source: "SR-AVATAR" },
    },
    {
      kind: "product",
      id: "product",
      nav: "Product",
      eyebrow: "The round",
      headline: "Set up, sit the round, read the score card.",
      anchors: ["05-what-i-built"],
      summary:
        "A short setup with no login; then a 20-minute interview covering your story, one product case and metrics; then a score card with evidence quotes and one thing to fix, downloadable as a PDF.",
      video: "demo",
      source: "SR-README",
      shots: [
        {
          src: "/media/case-studies/shravans-round/score-card.webp",
          alt: "The site's example score card: a “Round complete” summary with strongest area Product sense, 18 minutes, 8 questions and 5 follow-ups, beside a Download detailed report button.",
          width: 1400,
          height: 551,
          frame: "browser",
          caption: "The example score card (a made-up round)",
          provenance: "docs/case-study-sources/shravans-round/feedback-desktop.jpg ← live capture of /feedback, cropped above the photo quote",
        },
        {
          src: "/media/case-studies/shravans-round/landing-mobile.webp",
          alt: "The Shravan's Round on a phone: the headline, Start a free mock and See a sample score card buttons, and the listening waveform.",
          width: 420,
          height: 909,
          frame: "phone",
          caption: "Phone: the same round",
          provenance: "docs/case-study-sources/shravans-round/landing-mobile.jpg ← live capture of shravans-round.vercel.app at 390 px",
        },
      ],
    },
    {
      kind: "decisions",
      id: "decisions",
      nav: "Decisions",
      eyebrow: "My part",
      headline: "Pick the face by measuring it, then let the waveform carry the brand.",
      anchors: ["04-product-bet"],
      items: [
        { could: "Pick an avatar vendor from demos", chose: "A scored trial of three vendors on one clip", because: "Lip latency, interruption and identity were measured the same way for each, and the best scorer went to the pilot.", source: "SR-AVATAR" },
        { could: "Build our own 3D face", chose: "A commercial photo-driven avatar behind our own interface", because: "Only single-view studio photos existed, so capture-based rendering was ruled out and the vendor stays swappable.", source: "SR-AVATAR" },
        { could: "A static logo", chose: "An animated listening ring", because: "The hero's waveform, bent into a ring, says “he is listening” in the nav and the favicon.", source: "SR-BRAND" },
      ],
    },
    {
      kind: "system",
      id: "system",
      nav: "System",
      eyebrow: "How it works",
      headline: "Your answer decides the next question.",
      caption: "One answer through The Shravan's Round",
      source: "SR-README",
      steps: [
        { label: "You answer", note: "voice in the browser, or text" },
        { label: "Classify the answer", note: "an LLM call" },
        { label: "Retrieve", note: "his teaching transcripts, pgvector" },
        { label: "Interviewer's next line", note: "the follow-up" },
        { label: "Score card", note: "a second model writes the report" },
      ],
      rules: ["When one model provider refuses a call, the other serves it.", "Next.js on Vercel; Supabase Postgres with pgvector."],
    },
    {
      kind: "outcome",
      id: "evidence",
      nav: "Evidence",
      eyebrow: "Evidence",
      headline: "Live and free — no numbers yet.",
      anchors: ["06-evaluation", "07-outcome", "08-what-i-learned"],
      intro: "The round is live and free to sit. The repository is private to the team. No candidates, sessions or scores have been recorded for this page.",
      gaps: ["No users or usage data are recorded.", "A photo-driven avatar shows head and shoulders only, with no hand gestures."],
    },
  ],
  evidence: [
    { title: "README", type: "Readme", supports: "The flow, the stack and which layer is mine", source: "SR-README" },
    { title: "Avatar layer Discovery PRD and vendor trial", type: "Research", date: "2026-09-11", supports: "The avatar problem, the three-vendor trial and its scores", source: "SR-AVATAR" },
    { title: "Brand mark notes", type: "Design", date: "2026-09-15", supports: "The animated listening-ring logo and favicon", source: "SR-BRAND" },
    { title: "Live captures", type: "Live data", date: "2026-10-17", supports: "The landing and example score card shown here", source: "SR-CAPTURES" },
  ],
};
