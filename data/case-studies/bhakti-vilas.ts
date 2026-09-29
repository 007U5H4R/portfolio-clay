import type { z } from "zod";
import type { CaseStudy } from "../schema";

/**
 * Bhakti Vilas — devotion as behavioural health (TASK-130; audit in
 * docs/reports/TASK-130/bhakti-vilas.md). A team build (5 of 8 commits by Tushar); the survey numbers
 * are Prashant's pod's team research, never Tushar's fieldwork; the staged-reveal funnel is a
 * directional estimate. No UI screenshots exist and the live site can't be captured from here, so
 * the product is shown through its verified booking flow and its own imagery, captioned as such.
 * No architecture section: a static prototype on mock data has no system worth a diagram.
 */
export const bhaktiVilasCase: z.input<typeof CaseStudy> = {
  slug: "bhakti-vilas",
  theme: {
    key: "bhakti-vilas",
    metaphor: "Dawn at a riverside temple: saffron light, diya-flame numerals, a devotional path rather than a clinical one",
    accents: ["rust", "note", "forest"],
  },
  story: "Devotion as behavioural health",
  hero: {
    tagline: "Devotion as behavioural health.",
    proposition:
      "An elder-focused wellness prototype for India built around bhajan — the health meaning is coded into devotion, not front-loaded like a clinical app.",
    proofs: [
      { value: "5 of 8", label: "commits by Tushar in a team build", kind: "structural", source: "BV-AUDIT", note: "3 by Shivali, all on 1 Aug 2026" },
      { value: "11", label: "sources behind the answer to a mentor’s “why bhakti?”", kind: "structural", source: "BV-MENTOR-QA" },
    ],
    media: {
      src: "/media/case-studies/bhakti-vilas/tea-circle.webp",
      alt: "Prototype imagery from Bhakti Vilas: elders and their families sharing tea in a leafy courtyard, with a harmonium and small lamps.",
      width: 1200,
      height: 800,
      frame: "print",
      caption: "Imagery from the prototype (illustrative)",
      provenance: "docs/case-study-sources/bhakti-vilas/tea-circle.jpg ← case study 2/Bhakti-Vilas/assets/tea-circle.jpg",
    },
    layout: "split",
  },
  sections: [
    {
      kind: "problem",
      id: "problem",
      nav: "Problem",
      eyebrow: "The problem",
      headline: "Elder care has no shortage of products — it has a shortage of clarity.",
      anchors: ["01-context", "02-problem"],
      context:
        "No trusted, verifiable layer tells the family who pays whether their parent is getting safe, dignified care. Tushar’s refined hypothesis: the family ends up as the system integrator, despite being the least present.",
      quote: {
        text: "The market doesn’t appear to have a shortage of products. It appears to have a shortage of clarity.",
        attribution: "Case Study 2 brief",
        source: "BV-BRIEF",
      },
    },
    {
      kind: "research",
      id: "research",
      nav: "Research",
      eyebrow: "Research (team)",
      headline: "Distance was never the variable. Availability was.",
      anchors: ["03-discovery"],
      intro:
        "Team research from Prashant’s pod — family surveys (n=23 deep-dive, n=47 broad) and a healthcare-worker survey (n=12). Tushar’s part was segmentation, refined hypotheses and interview guides.",
      quotes: [
        { text: "Distance was never the variable. Availability was.", attribution: "Seven-day series, Day 3", source: "BV-LINKEDIN" },
        { text: "Insure the visit, don’t vet the person.", attribution: "Refined hypothesis — proposed, never built", source: "BV-REFINED-HYPOTHESIS" },
      ],
      insight: { text: "Financial burden ranked dead last as a challenge: 1 of 70 mentions in the team’s interviews.", source: "BV-CATEGORY-HYPOTHESES" },
    },
    {
      kind: "decisions",
      id: "decisions",
      nav: "Decisions",
      eyebrow: "The bet: Madhu Mukti",
      headline: "The health meaning is coded, not front-loaded.",
      anchors: ["04-product-bet"],
      items: [
        {
          could: "A clinical app that names the condition upfront",
          chose: "Devotion first: bhajan, temple walks, WhatsApp messages",
          because: "The team’s research found people more willing to attend a kirtan than a diabetes screening.",
          source: "BV-MADHU-MUKTI-SOLUTION",
        },
        {
          could: "A funnel that pushes everyone to screening",
          chose: "A staged reveal where staying devotional is success",
          because: "The funnel narrows in trust and consent, not effort; its shares are directional estimates, not data.",
          source: "BV-MADHU-MUKTI-SOLUTION",
        },
      ],
    },
    {
      kind: "product",
      id: "product",
      nav: "Prototype",
      eyebrow: "The prototype",
      headline: "A working prototype, live — not a deck.",
      anchors: ["05-what-i-built"],
      summary:
        "Four static pages on mock data: no backend, no database, no AI. The session-booking flow was verified end to end, with a mobile audit at 390 and 360 px.",
      source: "BV-MEMORY",
      flow: {
        caption: "The verified booking flow",
        source: "BV-MEMORY",
        steps: [{ label: "Learn" }, { label: "Pick a date" }, { label: "Circle on a map" }, { label: "Payment" }, { label: "QR pass" }],
      },
      shots: [
        {
          src: "/media/case-studies/bhakti-vilas/madhu-mukti-funnel.webp",
          alt: "Madhu Mukti staged-reveal funnel: awareness through temple noticeboards, consideration through devotional WhatsApp messages, decision through community camps — shares labelled as directional estimates.",
          width: 1200,
          height: 693,
          frame: "print",
          caption: "Tushar’s staged-reveal funnel (directional estimates, not measured)",
          provenance: "docs/case-study-sources/bhakti-vilas/Madhu-Mukti-TOFU-MOFU-BOFU-Funnel.jpg ← case study 2/Madhu-Mukti-TOFU-MOFU-BOFU-Funnel.png",
        },
      ],
    },
    {
      kind: "outcome",
      id: "evidence",
      nav: "Evidence",
      eyebrow: "Evidence",
      headline: "Defended with research, not with usage.",
      anchors: ["06-evaluation", "07-outcome"],
      intro: "The mentor’s three questions were answered in writing — and the answer names its own limit: “a well-evidenced hypothesis with real mechanisms, not a proven guarantee.”",
      proofs: [
        { value: "0", label: "console errors in the 390 and 360 px mobile audit", kind: "measured", source: "BV-MEMORY" },
      ],
      gaps: [
        "No users and no product metrics; the survey numbers describe the market, not this prototype.",
        "Translation covers about 90 of ~500 strings, and the medical copy is unreviewed.",
        "The team PRD carries no author names.",
      ],
    },
    {
      kind: "learnings",
      id: "learnings",
      nav: "Learnings",
      eyebrow: "What I learned",
      headline: "Honest framing is part of the design.",
      anchors: ["08-what-i-learned"],
      items: [
        { title: "Disclose the gaps", body: "Partial translation and unreviewed medical copy belong on the page, not under it.", source: "BV-README" },
        { title: "Never dress devotion as clinic", body: "Devotional-health framing is not clinically vetted, and shouldn’t read as if it were.", source: "BV-README" },
        { title: "Credit the team exactly", body: "Five of eight commits, and a team PRD without names: say both.", source: "BV-AUDIT" },
      ],
    },
  ],
  evidence: [
    { title: "Case Study 2 brief", type: "Research", date: "2026-07", supports: "“A shortage of clarity”", source: "BV-BRIEF" },
    { title: "Elder-care case study", type: "Research", supports: "The missing accountability layer", source: "BV-CASE-STUDY" },
    { title: "Tushar’s refined hypothesis", type: "Research", supports: "The family as system integrator", source: "BV-TUSHAR-HYPOTHESIS" },
    { title: "Team research synthesis", type: "Research", supports: "Tushar’s role: segmentation, hypotheses, interview guides", source: "BV-TEAM-SYNTHESIS" },
    { title: "Primary research (Prashant’s pod)", type: "Research", supports: "n=23 + n=47 family, n=12 health-worker surveys (team data)", source: "BV-TEAM-PRIMARY-RESEARCH" },
    { title: "Category hypotheses", type: "Research", supports: "5 categories, 10 hypotheses; financial burden last", source: "BV-CATEGORY-HYPOTHESES" },
    { title: "Madhu Mukti solution doc", type: "PRD", supports: "Coded meaning; the staged-reveal funnel", source: "BV-MADHU-MUKTI-SOLUTION" },
    { title: "Team PRD", type: "PRD", date: "2026-08-03", supports: "Restates Tushar’s five design principles; no author names", source: "BV-TEAM-PRD" },
    { title: "Build memory + audit", type: "Build ledger", date: "2026-08-01", supports: "Verified booking flow; 5/3 commit split", source: "BV-MEMORY" },
    { title: "Mentor Q&A", type: "Feedback", supports: "Three questions, 11 sources, “not a proven guarantee”", source: "BV-MENTOR-QA" },
    { title: "README", type: "Readme", supports: "Partial translation; unreviewed medical copy", source: "BV-README" },
  ],
};
