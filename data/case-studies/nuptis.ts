import type { z } from "zod";
import type { CaseStudy } from "../schema";

/**
 * Nuptis — risk-tiered vendor ops for wedding agencies, the first bet of the nine-day sprint
 * (TASK-130; audit in docs/reports/TASK-130/nuptis.md). Its own page (the pivot is told on Velora's).
 * Honest: no pilot, no automated tests, no AI; all three §11 success metrics defined, none measured;
 * the risk-tier reasoning is informed intuition, not fieldwork. Screens show fictional mock data.
 */
export const nuptisCase: z.input<typeof CaseStudy> = {
  slug: "nuptis",
  theme: {
    key: "nuptis",
    metaphor: "A wedding planner's run-sheet: a marigold garland edge, rosette ribbon numerals, a checklist clipboard",
    accents: ["terracotta", "forest", "note"],
  },
  story: "Risk-tiered vendor ops (the bet that lost)",
  hero: {
    tagline: "Vendor ops for wedding-planning agencies.",
    proposition:
      "Verification status, work orders, payment milestones and backup coverage in one place — so one vendor no-show stops turning a wedding into a scramble.",
    proofs: [
      { value: "168", label: "Figma frames, with an AA audit", kind: "prototype", source: "NUP-DESIGN" },
      { value: "Day 7", label: "retired in favour of Velora", kind: "structural", source: "CS3-9DAY-SERIES", note: "still live on mock data" },
    ],
    media: {
      src: "/media/case-studies/nuptis/dashboard.webp",
      alt: "Nuptis vendor roster dashboard for a mock agency: active vendors, pending verifications, expiring compliance and backup-tier coverage above a table of vendors with risk tiers.",
      width: 1200,
      height: 506,
      frame: "browser",
      provenance: "docs/case-study-sources/nuptis/dashboard.jpg ← Case Study 3/Nuptis/docs/screenshots/dashboard.jpg",
    },
    layout: "stacked",
  },
  sections: [
    {
      kind: "problem",
      id: "problem",
      nav: "Problem",
      eyebrow: "The problem",
      headline: "One vendor no-show turns a wedding into a scramble.",
      anchors: ["01-context", "02-problem"],
      context:
        "Agencies run 15–30+ vendors across 5–7 ceremonies per wedding over spreadsheets and WhatsApp threads — with no structured record of verification, work orders, payments or backups.",
      flow: {
        caption: "How a no-show plays out today",
        source: "NUP-PRD",
        steps: [{ label: "Spreadsheets" }, { label: "Chat threads" }, { label: "A vendor no-shows" }, { label: "No backup on record" }, { label: "A scramble" }],
      },
    },
    {
      kind: "research",
      id: "insight",
      nav: "Insight",
      eyebrow: "The insight",
      headline: "Vet vendors by risk, not by habit.",
      anchors: ["03-discovery"],
      intro: "Informed domain reasoning, not fieldwork: the PRD calls Nuptis “a grounding/exploration project”.",
      quotes: [
        { text: "Spending three weeks vetting a card printer and two days vetting a fireworks vendor is backwards.", attribution: "Wedding vendor onboarding process notes", source: "NUP-PROCUREMENT" },
      ],
      insight: { text: "North Star: the % of high-risk work orders with a named backup assigned before the event date.", source: "NUP-PRD" },
    },
    {
      kind: "product",
      id: "product",
      nav: "Product",
      eyebrow: "The product",
      headline: "Onboard by risk, run the event, swap in a backup.",
      summary:
        "The risk tier set at intake drives the document checklist and whether a backup is required; when a vendor fails, the contingency panel offers only pre-vetted backups.",
      source: "NUP-SCREENSHOTS",
      shots: [
        {
          src: "/media/case-studies/nuptis/onboarding.webp",
          alt: "Nuptis vendor onboarding, step 1 of 5: category and risk tier, with guidance that the risk tier drives the document checklist and backup coverage.",
          width: 1000,
          height: 421,
          frame: "browser",
          caption: "Intake starts with the risk tier",
          provenance: "docs/case-study-sources/nuptis/onboarding.jpg ← Case Study 3/Nuptis/docs/screenshots/onboarding.jpg",
        },
        {
          src: "/media/case-studies/nuptis/procurement.webp",
          alt: "Nuptis procurement board listing mock work orders by wedding, ceremony and vendor, each with a quote and a stage progress bar.",
          width: 1000,
          height: 421,
          frame: "browser",
          caption: "Every work order and its stage",
          provenance: "docs/case-study-sources/nuptis/procurement.jpg ← Case Study 3/Nuptis/docs/screenshots/procurement.jpg",
        },
        {
          src: "/media/case-studies/nuptis/contingency-drawer.webp",
          alt: "Nuptis “Activate Backup” drawer replacing a mock caterer with pre-vetted backup vendors and an impact summary.",
          width: 1000,
          height: 421,
          frame: "browser",
          caption: "A no-show: pick a pre-vetted backup",
          provenance: "docs/case-study-sources/nuptis/contingency-drawer.jpg ← Case Study 3/Nuptis/docs/screenshots/contingency-drawer.jpg",
        },
      ],
    },
    {
      kind: "decisions",
      id: "decisions",
      nav: "Decisions",
      eyebrow: "Product decisions",
      headline: "Cut hard, and say why.",
      anchors: ["04-product-bet"],
      items: [
        {
          could: "Vet every vendor the same way",
          chose: "Risk-tiered verification",
          because: "High-consequence vendors (caterers, fireworks) get scrutiny; a card printer doesn’t need three weeks.",
          source: "NUP-PROCUREMENT",
        },
        {
          could: "Build every persona’s full feature set",
          chose: "An explicit cut list, each cut with a reason",
          because: "A fixed nine-day window forces prioritization to be visible, sized by an “effort tracks points” rule.",
          source: "NUP-PM-PLAN",
        },
        {
          could: "Add an AI assistant",
          chose: "A keyword-matching helper; bet on the workflow",
          because: "The bet was the vendor-ops workflow and its data model, not an AI surface the deadline didn’t need.",
          source: "NUP-README",
        },
      ],
    },
    {
      kind: "system",
      id: "system",
      nav: "System",
      eyebrow: "How it works",
      headline: "The reducer is the API surface.",
      anchors: ["05-what-i-built"],
      caption: "Nuptis’s local-first data path",
      source: "NUP-README",
      steps: [
        { label: "Agency UI", note: "React single-page app" },
        { label: "Context + reducer", note: "every action in one place" },
        { label: "localStorage", note: "works offline first" },
        { label: "Supabase mirror", note: "optional, four RPCs" },
        { label: "Nine-table schema" },
      ],
      rules: [
        "RPCs: activate backup, source backup, approve change order, log outcome.",
        "The assistant matches keywords; there is no AI.",
      ],
    },
    {
      kind: "outcome",
      id: "evidence",
      nav: "Evidence",
      eyebrow: "Evidence",
      headline: "Designed carefully, measured never — then retired.",
      anchors: ["06-evaluation", "07-outcome"],
      intro: "Nuptis was evaluated as a design and a build. It is still live on mock data, but the market was a shallow pool, so the same trust problem moved to apparel as Velora.",
      proofs: [
        { value: "283", label: "Figma prototype reactions", kind: "prototype", source: "NUP-DESIGN", note: "and 62 dual-mode design tokens" },
        { value: "9 routes", label: "swept at 414 and 768 px; 1 bug fixed", kind: "measured", source: "NUP-LEDGER" },
      ],
      gaps: [
        "No pilot: all three success metrics, the North Star included, are unmeasured.",
        "No automated test suite; the README says there is no lint or unit-test script.",
        "No usage data of any kind.",
      ],
    },
    {
      kind: "learnings",
      id: "learnings",
      nav: "Learnings",
      eyebrow: "What I learned",
      headline: "Say what you know, and how you know it.",
      anchors: ["08-what-i-learned"],
      items: [
        { title: "Name intuition as intuition", body: "When domain reasoning outruns fieldwork, say so — the PRD called this a grounding project.", source: "NUP-PRD" },
        { title: "A North Star can stay dark", body: "A well-defined metric that never meets a real wedding is still unmeasured.", source: "NUP-PRD" },
        { title: "Track the craft too", body: "The sharpest self-feedback was about prompt engineering and using Claude Code well.", source: "NUP-FEEDBACK" },
      ],
    },
  ],
  evidence: [
    { title: "Week-4 brief", type: "Research", supports: "Vendor onboarding stays slow, fragmented and hard to manage across teams", source: "NUP-WEEK4-BRIEF" },
    { title: "Nuptis PRD", type: "PRD", date: "2026-08-07", supports: "The problem, four roles, the North Star and its unmeasured metrics", source: "NUP-PRD" },
    { title: "Procurement process notes", type: "Research", supports: "Risk-tiered verification", source: "NUP-PROCUREMENT" },
    { title: "PM strategy plan", type: "PRD", supports: "“Effort tracks points” prioritization", source: "NUP-PM-PLAN" },
    { title: "DESIGN.md (Figma NuptisV2)", type: "Design", date: "2026-08-06", supports: "168 frames, 283 reactions, 62 tokens, AA audit", source: "NUP-DESIGN" },
    { title: "README", type: "Readme", supports: "The reducer as API; Supabase RPCs; no tests; no AI", source: "NUP-README" },
    { title: "App screenshots", type: "Design", supports: "Onboarding, procurement and contingency screens", source: "NUP-SCREENSHOTS" },
    { title: "Mobile-sweep note", type: "Evaluation", supports: "9 routes at 414/768 px, 1 bug fixed", source: "NUP-LEDGER" },
    { title: "Self-feedback", type: "Feedback", supports: "Prompt engineering and Claude Code craft", source: "NUP-FEEDBACK" },
    { title: "Nine-day series", type: "Post", supports: "Retired on day seven for Velora", source: "CS3-9DAY-SERIES" },
    { title: "Nuptis live app", type: "Live data", supports: "Still live on mock data", source: "NUP-LIVE" },
  ],
};
