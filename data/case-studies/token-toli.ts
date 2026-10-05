import type { z } from "zod";
import type { CaseStudy } from "../schema";

/**
 * Token Toli — a discovery-only page (TASK-130; audit in docs/reports/TASK-130/token-toli.md). No
 * product, no code, no deployment: a team discovery PRD (Guru pod, three co-authors). Shorter by
 * design (brief: thin sources get a shorter page, never padding). "11 named respondents" is the only
 * respondent count shown; the team PRD's 44 interviews are the team's, not this pod's. Respondent
 * quotes carry no names, ages or cities.
 */
export const tokenToliCase: z.input<typeof CaseStudy> = {
  slug: "token-toli",
  theme: {
    key: "token-toli",
    metaphor: "A research field notebook between two homes: a paper-plane line from city to hillside, sticky-note findings",
    accents: ["green-2", "steel", "note"],
  },
  story: "Discovery that didn't win — and why that's useful",
  extraSources: [
    { id: "TT-PRD-BET", label: "Token Toli Discovery PRD — bet and findings", ref: "CS1/Discovery PRD-2.pdf p.20, p.27, p.29", inventory: "§8.7" },
  ],
  hero: {
    tagline: "Care for parents, from afar.",
    proposition:
      "Ageing-in-place care orchestration for long-distance families — a team discovery PRD with 11 named respondents and three tested hypotheses. Discovery only: no product was built.",
    proofs: [
      { value: "11", label: "named respondents in the pod’s PRD", kind: "measured", source: "TT-DISCOVERY-PRD" },
      { value: "3", label: "hypotheses tested — 2 validated, 1 partly", kind: "self-reported", source: "TT-DISCOVERY-PRD", note: "the pod’s own assessment" },
    ],
    media: {
      src: "/media/illustrations/covers/cover-token-toli.svg",
      alt: "Illustration of a cosy hillside home at dusk with a lit window and a rocking chair on the porch, a mailbox by the gate, a lane winding away to a distant city, a paper plane flying along the line between poles, and an open notebook of research notes with sticky notes and glasses in the foreground.",
      width: 1600,
      height: 900,
      frame: "plain",
      provenance: "TASK-127 hand-authored cover, scripts/portfolio-art/scenes/token-toli (no standalone images exist)",
    },
    layout: "split",
  },
  sections: [
    {
      kind: "problem",
      id: "problem",
      nav: "Problem",
      eyebrow: "The problem",
      headline: "Children far away can’t see how their parents really are.",
      anchors: ["01-context", "02-problem"],
      context:
        "Adult children living away from ageing parents lack a trusted, medically informed view of their health and care. Existing services coordinate visits but don’t own medical accountability.",
      quote: {
        text: "My mother always says, ‘Everything is fine.’ I only discover later that she skipped a test or forgot to take a medicine.",
        attribution: "A respondent, Discovery PRD",
        source: "TT-DISCOVERY-PRD",
      },
    },
    {
      kind: "research",
      id: "research",
      nav: "Research",
      eyebrow: "What the interviews said",
      headline: "The binding constraint is trust, not demand.",
      anchors: ["03-discovery"],
      quotes: [
        { text: "I wanted peace of mind, not another booking platform.", attribution: "A respondent", source: "TT-DISCOVERY-PRD" },
        { text: "The biggest issue isn’t getting elderly patients to the clinic. It’s ensuring someone remembers and follows the treatment plan.", attribution: "A doctor, among the respondents", source: "TT-DISCOVERY-PRD" },
      ],
      insight: { text: "The surprise: transportation was rarely the biggest problem, despite the pod’s first assumptions.", source: "TT-PRD-BET" },
    },
    {
      kind: "decisions",
      id: "bet",
      nav: "The bet",
      eyebrow: "The bet",
      headline: "Sell accountability, not appointments.",
      anchors: ["04-product-bet", "05-what-i-built"],
      items: [
        {
          could: "Another service-booking platform",
          chose: "A medically informed accountability layer",
          because: "Sold as a monthly subscription to distant adult children, with guaranteed emergency response as the trust-builder.",
          source: "TT-PRD-BET",
        },
      ],
    },
    {
      kind: "outcome",
      id: "outcome",
      nav: "Outcome",
      eyebrow: "What happened",
      headline: "The cohort picked a teammate’s idea instead.",
      anchors: ["06-evaluation", "07-outcome"],
      intro: "The pod’s own verdict was that the evidence wasn’t yet enough: “Before pitching this to anyone, you need 20–30 structured interviews.”",
      gaps: [
        "No product, prototype or code exists — this was discovery only.",
        "The team PRD’s 44 interviews belong to the wider team, not this pod.",
        "The pod’s own interview total isn’t recorded beyond the 11 named respondents.",
      ],
    },
    {
      kind: "learnings",
      id: "learnings",
      nav: "Learnings",
      eyebrow: "What I learned",
      headline: "Losing the vote is data too.",
      anchors: ["08-what-i-learned"],
      items: [
        { title: "Perform the problem", body: "Performing the problem, not presenting it, was the sharpest lesson of the sprint.", source: "TT-LINKEDIN" },
        { title: "Count your interviews", body: "Eleven voices can point the way; they can’t carry a pitch without 20–30 more.", source: "TT-XLSX-SELFCRITIQUE" },
      ],
    },
  ],
  evidence: [
    { title: "Discovery PRD (Guru pod)", type: "PRD", date: "2026-07-25", supports: "The problem, 11 named respondents, H1.1–H1.3", source: "TT-DISCOVERY-PRD" },
    { title: "Discovery PRD — bet and findings", type: "PRD", date: "2026-07-25", supports: "The accountability-layer bet and the transport surprise", source: "TT-PRD-BET" },
    { title: "Team discovery PRD", type: "PRD", supports: "44 interviews — the wider team’s, not this pod’s", source: "TT-TEAM-PRD" },
    { title: "Research tracker (self-critique)", type: "Research", supports: "“You need 20–30 structured interviews”", source: "TT-XLSX-SELFCRITIQUE" },
    { title: "Seven-day series", type: "Post", supports: "Watching my own idea lose; performing the problem", source: "TT-LINKEDIN" },
  ],
};
