import type { z } from "zod";
import type { CaseStudy } from "../schema";

/**
 * TeachSpark — AI into real classroom work (TASK-130; audit in docs/reports/TASK-130/teachspark.md).
 * One snapshot only: the Final-PRD pilot of 2026-08-24, test handsets excluded (CONTENT_INVENTORY
 * §8.1 "choose one date; do not mix") — the pitch snapshot, the is_test before/after numbers and the
 * Mixpanel-only funnel are deliberately absent. No "625 tests". No sandbox join code.
 */
export const teachsparkCase: z.input<typeof CaseStudy> = {
  slug: "teachspark",
  theme: {
    key: "teachspark",
    metaphor: "Teacher's desk / classroom workbook: ruled notebook paper, coloured tabs, chat bubbles, a red-pen stamp",
    accents: ["forest", "rust", "note"],
  },
  story: "AI into real classroom work",
  extraSources: [
    { id: "TS-OG", label: "TeachSpark landing page (OG cover)", ref: "TS/web/public/og-cover.png; TS/web/public/demo-poster.jpg", inventory: "§8.1" },
    { id: "TS-LOOP", label: "TeachSpark Final PRD: the 2-minute WhatsApp loop", ref: "CS4/docs/assets/p2-whatsapp-loop.jpg", inventory: "§8.1" },
  ],
  hero: {
    tagline: "Ready-to-use worksheets, on WhatsApp.",
    proposition:
      "A WhatsApp bot that helps a time-poor Indian K–12 teacher use AI for real classroom work — a differentiated worksheet in about two minutes.",
    proofs: [
      { value: "17", label: "teachers joined the pilot on WhatsApp", kind: "measured", asOf: "2026-08-24", source: "CS4-FINAL-PRD", note: "first week, test handsets excluded" },
      { value: "47%", label: "activated (8 of 17)", kind: "measured", asOf: "2026-08-24", source: "CS4-FINAL-PRD", note: "12 of 17 onboarded first (71%)" },
      { value: "37.5 min", label: "median time saved", kind: "self-reported", asOf: "2026-08-24", source: "CS4-FINAL-PRD", note: "as reported by activated teachers" },
    ],
    media: {
      src: "/media/case-studies/teachspark/landing-mobile.webp",
      alt: "TeachSpark's live landing page on a phone: “Ready-to-use Worksheets on WhatsApp”, a smiling green mascot and a Get started button.",
      width: 560,
      height: 1211,
      frame: "phone",
      provenance: "docs/case-study-sources/teachspark/demo-poster.jpg ← Case Study 4/teachspark/web/public/demo-poster.jpg",
    },
    layout: "split",
  },
  sections: [
    {
      kind: "problem",
      id: "teacher-problem",
      nav: "Problem",
      eyebrow: "The teacher’s problem",
      headline: "Generic AI doesn’t transfer into a teacher’s real week.",
      anchors: ["01-context", "02-problem", "03-discovery"],
      context:
        "Teachers want AI to give them time back, but what exists is generic, fragmented and disconnected from their subject, grade and board. It started with one real teacher: Tushar’s mother, who teaches Sanskrit.",
      quote: {
        text: "When I’m overwhelmed by prep and grading, help me solve this week’s specific teaching task with AI, so I get real time back… without having to become a techie first.",
        attribution: "Job-to-be-done of “Meera”, the Discovery PRD persona",
        source: "TS-DISCOVERY-PRD",
      },
    },
    {
      kind: "product",
      id: "whatsapp-experience",
      nav: "Experience",
      eyebrow: "The WhatsApp experience",
      headline: "One two-minute chat, from “where do I start?” to a worksheet.",
      summary:
        "No new app, no prompt-writing. The teacher answers a few questions in WhatsApp and gets a ready-to-use worksheet as a PDF, plus the reusable prompt behind it.",
      source: "TS-LOOP",
      flow: {
        caption: "The loop, as specified in the Final PRD",
        source: "TS-LOOP",
        steps: [
          { label: "Welcome + value" },
          { label: "Grade, subject, board" },
          { label: "30-second micro-lesson" },
          { label: "Pick the topic" },
          { label: "Worksheet PDF + reusable prompt" },
          { label: "Minutes saved" },
          { label: "Share with a teacher" },
        ],
      },
      shots: [
        {
          src: "/media/case-studies/teachspark/loop-chat.webp",
          alt: "An illustrative WhatsApp chat: the teacher asks for fractions, answers grade 5, Mathematics and CBSE, gets a micro-lesson, picks equivalent fractions and receives a worksheet PDF.",
          width: 292,
          height: 615,
          frame: "plain",
          caption: "The loop as drawn in the Final PRD (illustrative chat)",
          provenance: "docs/case-study-sources/teachspark/p2-whatsapp-loop.jpg (phone crop) ← Case Study 4/docs/assets/p2-whatsapp-loop.jpg",
        },
      ],
    },
    {
      kind: "decisions",
      id: "decisions",
      nav: "Decisions",
      eyebrow: "Product decisions",
      headline: "Capability, not dependency.",
      anchors: ["04-product-bet"],
      items: [
        {
          could: "Do the task for her: a worksheet-vending service",
          chose: "Teach the reusable skill, then show the time saved",
          because: "Problem-led, applied, capability-building learning with impact feedback was the corner nobody occupied.",
          source: "TS-SOLUTION-PRD",
        },
        {
          could: "A standalone app with a new install and login",
          chose: "WhatsApp, where teachers already are",
          because: "Distribution, not a new destination — through a Twilio sandbox for the pilot cohort.",
          source: "TS-SOLUTION-PRD",
        },
        {
          could: "Reposition it as an AI-learning course",
          chose: "Lead with the worksheet; teach inside the product",
          because: "The mentor’s challenge: “A teacher buys a worksheet that is good enough to give to her students tomorrow.”",
          source: "TS-MENTOR",
        },
      ],
    },
    {
      kind: "system",
      id: "system",
      nav: "System",
      eyebrow: "How it works",
      headline: "A pure state machine behind one chat.",
      anchors: ["05-what-i-built"],
      caption: "One message’s trip through TeachSpark",
      source: "TS-RUNBOOK",
      steps: [
        { label: "Teacher on WhatsApp" },
        { label: "Twilio webhook" },
        { label: "Express server" },
        { label: "Pure state machine", note: "(teacher, message, now) → next step" },
        { label: "Claude", note: "Sonnet 5 default; Haiku 4.5 switchable" },
        { label: "PDF / DOCX render" },
        { label: "Back to WhatsApp" },
      ],
      rules: [
        "Every I/O goes through a port and an adapter.",
        "Question papers: structured outputs, vision and a QC pass.",
        "About $0.01 per generation (runbook estimate).",
      ],
    },
    {
      kind: "outcome",
      id: "activation",
      nav: "Funnel",
      eyebrow: "Activation funnel",
      headline: "A real first week: 17 teachers joined, 8 activated.",
      anchors: ["06-evaluation", "07-outcome"],
      intro:
        "32 event types were instrumented, and Tushar’s own test handsets are excluded from every number. The pilot came in under the targets it set for itself.",
      funnel: {
        caption: "First-week pilot, Final PRD snapshot, test handsets excluded",
        asOf: "2026-08-24",
        kind: "measured",
        source: "CS4-FINAL-PRD",
        steps: [
          { label: "Landing views", value: 72 },
          { label: "Signed up", value: 17, note: "23.6%" },
          { label: "Joined on WhatsApp", value: 17 },
          { label: "Onboarded", value: 12, note: "71%" },
          { label: "Activated", value: 8, note: "47%" },
          { label: "Question papers exported", value: 5 },
        ],
      },
      proofs: [
        { value: "3", label: "referrals", kind: "self-reported", asOf: "2026-08-24", source: "CS4-FINAL-PRD" },
        { value: "1 of 4", label: "re-engaged by a nudge", kind: "measured", asOf: "2026-08-24", source: "CS4-FINAL-PRD" },
      ],
      gaps: [
        "Under target: joined 40–50 and activation ≥ 60% were the goals.",
        "D1 retention couldn’t be measured: the window was shorter than 24 hours.",
        "No teacher interviews were recorded and no LLM output-quality evals exist.",
      ],
    },
    {
      kind: "learnings",
      id: "learnings",
      nav: "Learnings",
      eyebrow: "What I learned",
      headline: "Three lessons from the first week.",
      anchors: ["08-what-i-learned"],
      items: [
        { title: "Sell the worksheet, not “AI”", body: "Lead with the artifact a teacher can use tomorrow; deliver the learning inside it.", source: "TS-MENTOR" },
        { title: "Green tests aren’t correctness", body: "335 passing tests still shipped a city map that placed zero sign-ups: teachers typed “Bangalore” four ways.", source: "TS-LINKEDIN-BUILD" },
        { title: "Smaller, honest numbers", body: "Excluding my own test handsets the day before submission made every number smaller — and true.", source: "TS-LINKEDIN-BUILD" },
      ],
    },
  ],
  evidence: [
    { title: "Discovery PRD", type: "PRD", date: "2026-08-19", supports: "The problem statement and the “Meera” persona", source: "TS-DISCOVERY-PRD" },
    { title: "Solution-Space PRD", type: "PRD", date: "2026-08-19", supports: "Capability, not dependency; the WhatsApp wedge", source: "TS-SOLUTION-PRD" },
    { title: "Final PRD", type: "PRD", date: "2026-08-26", supports: "The pilot funnel (snapshot 24 Aug 2026) and the targets", source: "CS4-FINAL-PRD" },
    { title: "2-minute WhatsApp loop", type: "Design", supports: "The seven-step product loop", source: "TS-LOOP" },
    { title: "Runbook", type: "Architecture", supports: "WhatsApp → Twilio → Express → state machine → Claude → PDF/DOCX", source: "TS-RUNBOOK" },
    { title: "Question-paper adapter", type: "Code", supports: "Structured outputs, vision and the QC pass", source: "TS-ANTHROPIC-PAPER" },
    { title: "QA phase-6 gate", type: "Test run", date: "2026-08-21", supports: "335 passed / 2 skipped", source: "TS-QA-PHASE6" },
    { title: "Mentor feedback", type: "Feedback", date: "2026-08-29", supports: "Sell the worksheet; WhatsApp is not the whole differentiation", source: "TS-MENTOR" },
    { title: "9-day build series", type: "Post", supports: "The excluded test handsets, the city lookup, D1", source: "TS-LINKEDIN-BUILD" },
    { title: "Pitch deck", type: "Deck", supports: "It started with one teacher: a mother who teaches Sanskrit", source: "TS-PITCH" },
    { title: "Live pilot (Railway)", type: "Live data", supports: "The live landing; uptime after 9 Sep 2026 is unverified", source: "TS-LIVE" },
  ],
};
