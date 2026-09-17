import type { Artifact, SourceRef } from "@/data/schema";

/**
 * QA-only fixtures for the `/dev/artifacts` review board. These are illustrative artifact records
 * drawn from the TeachSpark / RailCite packs so every `Artifact` variant renders with realistic,
 * *sourced* data (each metric carries an `asOf` + a declared `source`, exercising the EVAL-013
 * guard rather than fabricating a floating number). They live under `app/dev/` — never shipped
 * (the route 404s in prod) and never scanned as site content. Real case-study artifact data lands
 * with the M-005 content tickets.
 */

export const SOURCES: SourceRef[] = [
  { id: "TS-FINAL-PRD", label: "TeachSpark Final PRD", ref: "CS4/docs/final-prd.docx §7", inventory: "§8.1" },
  { id: "TS-README", label: "TeachSpark README", ref: "TS/README.md:3", inventory: "§8.1" },
  { id: "TS-PILOT", label: "TeachSpark pilot log (WhatsApp)", ref: "CS4/pilot-log.md", inventory: "§8.1" },
  { id: "RC-DISCOVERY", label: "RailCite Discovery PRD", ref: "CS5/Discovery-PRD.md L3-5", inventory: "§8.2" },
  {
    id: "RC-API",
    label: "RailCite live /api/stats",
    ref: "https://railcite.vercel.app/api/stats (2026-09-15)",
    inventory: "§8.2",
    url: "https://railcite.vercel.app",
  },
];

export const ARTIFACTS: Artifact[] = [
  {
    id: "ts-insight-1",
    type: "insight",
    source: "TS-PILOT",
    quote:
      "I don't have time to learn a new app on top of teaching — if it isn't inside WhatsApp, I won't open it.",
    attribution: "K–12 teacher, WhatsApp pilot",
    caption: "Recurring signal across the first-week pilot cohort.",
  },
  {
    id: "ts-hypothesis-1",
    type: "hypothesis",
    source: "TS-FINAL-PRD",
    believe:
      "Meeting teachers inside WhatsApp removes the adoption barrier that generic AI tools hit.",
    knowWhen: "≥50% of invited teachers send a second prompt in their first week, unprompted.",
    status: "partially-validated",
    caption: "Bet from the discovery phase.",
  },
  {
    id: "ts-metric-measured",
    type: "metric",
    source: "TS-PILOT",
    metric: {
      value: "17",
      label: "teachers onboarded",
      context: "joined the WhatsApp pilot in week 1; test handsets excluded",
      asOf: "2026-09-09",
      kind: "measured",
      source: "TS-PILOT",
    },
  },
  {
    id: "rc-metric-structural",
    type: "metric",
    source: "RC-DISCOVERY",
    metric: {
      value: "5,760",
      label: "rule pages indexed",
      context: "total pages across the yearly circular PDFs the retriever draws from",
      asOf: "2026-09-15",
      kind: "structural",
      source: "RC-DISCOVERY",
    },
  },
  {
    id: "ts-metric-self",
    type: "metric",
    source: "TS-PILOT",
    metric: {
      value: "37.5 min",
      label: "saved per lesson plan",
      context: "teacher-reported, self-estimated in the week-2 feedback form (n=9)",
      asOf: "2026-09-12",
      kind: "self-reported",
      source: "TS-PILOT",
    },
  },
  {
    id: "rc-decision-1",
    type: "decision",
    source: "RC-DISCOVERY",
    title: "How to guarantee a citation is never invented",
    chosen: "Answer only from retrieved passages; refuse when confidence is below threshold.",
    rejected: [
      "Let the model paraphrase from memory",
      "Post-hoc fact-check a free-form answer",
    ],
    reason: "A wrong citation damages the inspector's credibility — refusing is the safer failure.",
  },
  {
    id: "rc-evaluation-1",
    type: "evaluation",
    source: "RC-DISCOVERY",
    method: "Held-out set of 40 real demurrage/wharfage questions, graded by citation exact-match.",
    result: "38/40 cited the correct, current circular.",
    limitation: "The 40 questions are author-written, not sampled from live inspector traffic.",
  },
  {
    id: "ts-experiment-1",
    type: "experiment",
    source: "TS-README",
    setup: "Sent the same lesson-plan prompt through a plain LLM and through the WhatsApp bot.",
    result: "The bot's plan matched the state syllabus; the plain LLM's did not.",
    learning: "Classroom context in the system prompt mattered more than model size.",
  },
  {
    id: "ts-prototype-1",
    type: "prototype",
    source: "TS-FINAL-PRD",
    media: {
      src: "/media/teachspark-flow.png",
      alt: "TeachSpark WhatsApp conversation flow — prototype capture coming with the case study",
      width: 1280,
      height: 720,
      kind: "placeholder",
    },
    caption: "WhatsApp onboarding flow (prototype capture lands with the case study).",
  },
  {
    id: "rc-generic-link",
    type: "generic",
    source: "RC-API",
    title: "RailCite live /api/stats",
    kind: "link",
    href: "https://railcite.vercel.app",
    note: "Dated live-status check backing the RailCite metrics.",
  },
  {
    id: "ts-generic-doc",
    type: "generic",
    source: "TS-FINAL-PRD",
    title: "TeachSpark Final PRD",
    kind: "prd",
    note: "The internal spec (no public link — source label only).",
  },
];
