import type { z } from "zod";
import type { CaseStudy } from "../schema";

/**
 * Pratyasa — a patent, on the record (TASK-130; audit in docs/reports/TASK-130/pratyasa.md). A
 * record page, not a product: contributor, never owner ("Patent owned by NIT–Calicut"); research
 * prototype, never a diagnostic. Device results from the paper stay prose, never proof cards
 * (docs/trace/pratyasa.md). Only "IN 429867" is used as the patent number.
 */
export const pratyasaCase: z.input<typeof CaseStudy> = {
  slug: "pratyasa",
  theme: {
    key: "pratyasa",
    metaphor: "A lab notebook and a certificate: graph-paper ground, a readout-curve rule, a gold certificate frame",
    accents: ["forest", "kraft", "steel"],
  },
  story: "A true record of real work",
  extraSources: [
    { id: "PT-SITE", label: "Pratyasa page and its fact checker", ref: "PT/pratyasa-site (verify-facts.py REQUIRED tokens L267; zero third-party requests)", inventory: "§8.8", url: "https://pratyasa.vercel.app" },
  ],
  hero: {
    tagline: "A patent, on the record.",
    proposition:
      "A fast, self-contained page for granted patent IN 429867 — a point-of-care sepsis-biomarker biosensor — so there is finally somewhere to point when someone asks what Tushar built.",
    proofs: [
      { value: "IN 429867", label: "granted patent", kind: "structural", source: "PT-DISCOVERY-PRD" },
      { value: "2nd of 5", label: "co-inventors", kind: "structural", source: "PT-DISCOVERY-PRD", note: "patent owned by NIT–Calicut" },
    ],
    media: {
      src: "/media/case-studies/pratyasa/device.webp",
      alt: "The Pratyasa research prototype: a white handheld analyser showing “Concentration: 10 pg/ml” beside an Android phone app reading the same value over Bluetooth.",
      width: 1400,
      height: 788,
      frame: "print",
      caption: "The research prototype and its Android app",
      provenance: "docs/case-study-sources/pratyasa/device-photo.jpg ← Patent/pratyasa-site/assets/device-photo.jpg",
    },
    layout: "split-reverse",
  },
  sections: [
    {
      kind: "problem",
      id: "problem",
      nav: "Problem",
      eyebrow: "The problem",
      headline: "The invention was real. Its record didn’t exist.",
      anchors: ["01-context", "02-problem"],
      context:
        "The patent is granted, the prototype exists and the science is published — but there was no page, no narrative, nowhere to point a recruiter or collaborator who asks “what did you actually build?”",
    },
    {
      kind: "product",
      id: "product",
      nav: "The page",
      eyebrow: "The page",
      headline: "One fast page that tells the truth about the work.",
      anchors: ["03-discovery", "05-what-i-built"],
      summary:
        "Tushar worked across the analyser’s electronics and firmware, the Android app, sensor preparation and validation testing in blood and food samples. The page shows that work with the certificate, the paper and device footage.",
      source: "PT-DISCOVERY-PRD",
      shots: [
        {
          src: "/media/case-studies/pratyasa/framed.webp",
          alt: "The Pratyasa analyser's black case with its gold wordmark, photographed in a gold frame.",
          width: 900,
          height: 770,
          frame: "plain",
          caption: "The device case",
          provenance: "docs/case-study-sources/pratyasa/pratyasa-framed.jpg ← Patent/pratyasa-framed.png",
        },
      ],
    },
    {
      kind: "decisions",
      id: "decisions",
      nav: "Decisions",
      eyebrow: "Decisions",
      headline: "Contributor, not owner. Prototype, not diagnostic.",
      anchors: ["04-product-bet"],
      items: [
        {
          could: "A sales page for patent buyers",
          chose: "A general credibility page",
          because: "The second revision reframed the audience: recruiters, collaborators and colleagues, not buyers.",
          source: "PT-DISCOVERY-PRD",
        },
        {
          could: "Present the patent as Tushar’s",
          chose: "Contributor framing, true to the paper",
          because: "It must stay true when a reader clicks through: the patent is owned by NIT–Calicut.",
          source: "PT-GLOBAL-CONSTRAINTS",
        },
        {
          could: "Let it read like a medical product",
          chose: "“Research prototype, not an approved diagnostic”",
          because: "A biosensor page must never imply regulatory approval.",
          source: "PT-GLOBAL-CONSTRAINTS",
        },
      ],
    },
    {
      kind: "system",
      id: "system",
      nav: "System",
      eyebrow: "How it stays true",
      headline: "Every fact is locked, then checked.",
      caption: "From the PRD’s fact list to the published page",
      source: "PT-SITE",
      steps: [
        { label: "Fact-locked PRD", note: "the only source of claims" },
        { label: "Required-facts list", note: "in the checker" },
        { label: "Fact checker", note: "runs over the page" },
        { label: "Static page", note: "no third-party requests" },
      ],
      rules: ["HTML, CSS and vanilla JS with a web app manifest.", "Zero third-party requests; system fonts only."],
    },
    {
      kind: "outcome",
      id: "evidence",
      nav: "Evidence",
      eyebrow: "Evidence",
      headline: "Live, and linked from the scroll-film portfolio.",
      anchors: ["06-evaluation", "07-outcome", "08-what-i-learned"],
      intro: "The device itself was validated in whole blood, mayonnaise and fruit juice, as reported in the published paper. Those are science results, not product metrics.",
      gaps: ["No traffic or visit data is recorded for the page.", "The Soft Matter paper’s DOI is still missing from the record."],
    },
  ],
  evidence: [
    { title: "Discovery PRD (fact-locked)", type: "PRD", date: "2026-08-24", supports: "Goal, role (2nd of 5), the credibility-page reframe, device facts", source: "PT-DISCOVERY-PRD" },
    { title: "Global constraints", type: "PRD", supports: "The rights line and the safety framing", source: "PT-GLOBAL-CONSTRAINTS" },
    { title: "Pratyasa page + fact checker", type: "Code", supports: "Required facts, zero third-party requests", source: "PT-SITE" },
  ],
};
