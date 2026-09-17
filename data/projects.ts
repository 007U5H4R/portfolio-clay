import {
  Award,
  ClipboardList,
  Cloud,
  Film,
  Gamepad2,
  Handshake,
  Landmark,
  MessageSquareText,
  Music,
  Network,
  PenLine,
  Search,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Project } from "./schema";

/**
 * Project content collection. The tracer's TeachSpark literal (formerly `data/tracer.ts`) migrated
 * to a full schema-`Project` at card fidelity (technical-plan.md §B S03.04); real chapter bodies,
 * metrics and the thinking chain land with the case-study tickets (TKT-12 / TKT-21). Copy is sourced
 * from CONTENT_INVENTORY §8.1 / §2.2 — do not paraphrase.
 *
 * This module imports the schema **as a type only** (never a value) so no client bundle pulls in zod;
 * validation runs at build time in `scripts/validate-content.ts` (prebuild) and in Vitest.
 */

/** lucide icon-name → component. Cards/headers render `ClayIcon`; the schema stores the name only. */
const ICONS: Record<string, LucideIcon> = {
  MessageSquareText,
  ShieldCheck,
  Handshake,
  Users,
  ClipboardList,
  Music,
  Search,
  Award,
  PenLine,
  Gamepad2,
  Film,
  Landmark,
  Cloud,
  Network,
};

/** Resolve a project's `icon` name to a lucide component (falls back to the message icon). */
export function projectIcon(name: string): LucideIcon {
  return ICONS[name] ?? MessageSquareText;
}

const EMPTY_CHAPTERS: Project["chapters"] = [
  { id: "context", title: "Context", body: [], artifacts: [] },
  { id: "problem", title: "Problem", body: [], artifacts: [] },
  { id: "discovery", title: "Discovery", body: [], artifacts: [] },
  { id: "bet", title: "Product bet", body: [], artifacts: [] },
  { id: "built", title: "What I built", body: [], artifacts: [] },
  { id: "evaluation", title: "Evaluation", body: [], artifacts: [] },
  { id: "outcome", title: "Outcome", body: [], artifacts: [] },
  { id: "learned", title: "What I learned", body: [], artifacts: [] },
];

/**
 * TeachSpark — the flagship full case study (featured rank 1, large; TKT-28, M-005). Every chapter
 * body, metric, artifact and thinking node traces to CONTENT_INVENTORY §8.1 + AUDIT §4 — nothing is
 * invented. Canonical pilot metrics use the Final-PRD snapshot 2026-08-24 (test handsets excluded);
 * the conflicting 2026-08-26 pitch snapshot is deliberately NOT mixed in (§8.1 "Choose one date").
 * Honest hedges are preserved verbatim: live-pilot uptime after 2026-09-09 is unverified, no teacher
 * interviews were recorded (planned 8–12), and no LLM output-quality evals exist. The Twilio sandbox
 * join code and all PII are excluded (forbidden-strings gate, EVAL-016).
 */
export const teachspark: Project = {
  slug: "teachspark",
  name: "TeachSpark",
  tagline:
    "A WhatsApp bot that helps a time-poor Indian K–12 teacher use AI for real classroom work.",
  category: "personal",
  tags: ["AI", "WhatsApp", "EdTech"],
  filters: ["ai"],
  status: "pilot",
  statusLabel: "Live pilot (Twilio sandbox) — uptime after 2026-09-09 unverified",
  statusAsOf: "2026-09-09",
  featured: 1,
  gridSize: "large",
  icon: "MessageSquareText",
  role: "Solo build",
  dates: { start: "2026-08" },
  duration: "Aug 2026",
  links: {
    live: "https://teachspark-production.up.railway.app",
    github: "https://github.com/007U5H4R/teachspark",
    repoPublic: false,
  },
  hero: {},
  metrics: [
    {
      value: "17",
      label: "Teachers joined",
      context:
        "joined the WhatsApp pilot in its first week; Final-PRD snapshot 2026-08-24, test handsets excluded",
      asOf: "2026-08-24",
      kind: "measured",
      source: "CS4-FINAL-PRD",
    },
    {
      value: "8 (47%)",
      label: "Activated",
      context:
        "of 17 joined reached an activation event (12 onboarded first, 71%); snapshot 2026-08-24, test handsets excluded",
      asOf: "2026-08-24",
      kind: "measured",
      source: "CS4-FINAL-PRD",
    },
    {
      value: "37.5 min",
      label: "Median time saved",
      context:
        "self-reported median time saved per activated teacher; snapshot 2026-08-24, test handsets excluded",
      asOf: "2026-08-24",
      kind: "self-reported",
      source: "CS4-FINAL-PRD",
    },
  ],
  overview: {
    thirtySecond: [
      "School teachers (25–40, limited technical training) want to use AI to save time and teach more effectively, but existing resources are generic, fragmented, and disconnected from their classroom context.",
      "TeachSpark is a solo-built WhatsApp bot that teaches a teacher the reusable AI skill to make a differentiated worksheet herself in about two minutes, measures the time she saved, and pulls her back the next day for the next skill. A first-week pilot (2026-08-24, test handsets excluded) took 17 teachers onto WhatsApp, activated 8, and saved a median 37.5 self-reported minutes each.",
    ],
    deepDive: true,
  },
  chapters: [
    {
      id: "context",
      title: "Context",
      body: [
        "TeachSpark began as Case Study 4 in a Cohort 8 product sprint on learning technology and AI for the next generation of professionals — the teacher vertical. Group discovery ran over the first weekend; from Tuesday the work was individual. Tushar authored the Discovery, Solution-Space and Final PRDs and built the entire MVP solo — the WhatsApp bot, the web landing, the admin console and the analytics.",
        "The starting point was personal, not a market slide. As the pitch put it, \"it started with one real teacher: my mother, who teaches Sanskrit,\" and the build notes described the best user research as \"remembering my mother's evenings.\"",
      ],
      artifacts: [
        {
          id: "ts-a-mother",
          type: "insight",
          quote: "My best user research was remembering my mother's evenings.",
          attribution: "TeachSpark build notes (pitch, slide 13)",
          source: "TS-PITCH",
        },
      ],
    },
    {
      id: "problem",
      title: "Problem",
      body: [
        "The Discovery PRD framed the problem plainly: \"School teachers (25–40, limited technical training) want to use AI to save time and teach more effectively, but existing resources are generic, fragmented, and disconnected from their classroom context. They don't know what to learn, where to start, or how to translate generic AI tutorials into their specific subject/grade/board — so despite abundant free resources, most never build durable, confident, applied AI skills.\"",
        "The persona was \"Meera\": a full-time K–12 teacher, 25–40, with 3–15 years of experience and class sizes of 30–50 mixed-ability students, who has never written a prompt with intent. Her job-to-be-done anchors the whole product.",
      ],
      artifacts: [
        {
          id: "ts-a-jtbd",
          type: "insight",
          quote:
            "When I'm overwhelmed by prep and grading, help me solve this week's specific teaching task with AI, so I get real time back and feel more in control — without having to become a techie first.",
          attribution: "Persona \"Meera\", Discovery PRD §1.1",
          source: "TS-DISCOVERY-PRD",
        },
      ],
    },
    {
      id: "discovery",
      title: "Discovery",
      body: [
        "The load-bearing insight reframed the market: the problem is not scarcity of content, it is that content is generic and disconnected from the classroom. A 2×2 whitespace map — generic ↔ classroom-specific against task-execution ↔ capability-building — located the wedge: problem-led, applied, capability-building learning with impact feedback, a corner nobody occupied.",
        "Honesty note: the Discovery PRD planned 8–12 teacher interviews, but none were recorded — no notes, counts, transcripts or synthesis exist, and the observation sheet on disk is a blank template. The one documented user trace is Tushar's mother. Discovery rigour instead lived in a central hypothesis decomposed into eight assumptions (A1–A8), each tagged with type and risk before a line of code.",
      ],
      artifacts: [
        {
          id: "ts-a-insight",
          type: "insight",
          quote:
            "The problem is not scarcity of content, it is that content is generic and disconnected from the classroom.",
          attribution: "Discovery PRD §0",
          source: "TS-DISCOVERY-PRD",
        },
        {
          id: "ts-a-hypothesis",
          type: "hypothesis",
          believe:
            "A time-poor teacher will adopt AI if it solves one real classroom task this week and shows the time saved, rather than teaching AI generically.",
          knowWhen:
            "when teachers activate and return for a second skill — not merely try the bot once.",
          status: "partially-validated",
          source: "TS-DISCOVERY-PRD",
        },
      ],
    },
    {
      id: "bet",
      title: "Product bet",
      body: [
        "The bet was \"Capability, not dependency.\" Rather than doing the task for the teacher (a worksheet-vending service that creates dependency) or teaching AI generically, TeachSpark teaches the reusable skill to produce a differentiated worksheet herself in about two minutes, then measures the time saved and brings her back for the next skill.",
        "The MVP wedge was chosen for being high frequency, high pain, and easy to template and measure. WhatsApp was the distribution decision — meet teachers where they already are, on a Twilio sandbox for the case-study cohort, rather than asking them to install and learn a new app.",
      ],
      artifacts: [
        {
          id: "ts-a-capability",
          type: "decision",
          title: "Capability, not dependency",
          chosen:
            "Teach the teacher the reusable AI skill to make a differentiated worksheet herself in ~2 minutes, measure the time saved, and pull her back for the next skill.",
          rejected: [
            "Do the task for her — a worksheet-vending service that creates dependency",
            "Teach AI generically, disconnected from a real classroom task",
          ],
          reason:
            "The white space was problem-led, applied, capability-building learning with impact feedback — nobody else occupied it.",
          source: "TS-SOLUTION-PRD",
        },
        {
          id: "ts-a-whatsapp",
          type: "decision",
          title: "WhatsApp as the distribution wedge",
          chosen:
            "Ship on WhatsApp, where teachers already are, via a Twilio sandbox for the cohort.",
          rejected: ["A standalone app requiring a new install and a new login"],
          reason: "Distribution, not a new destination.",
          source: "TS-SOLUTION-PRD",
        },
      ],
    },
    {
      id: "built",
      title: "What I built",
      body: [
        "The architecture is a single honest loop: WhatsApp → Twilio → Express → pure state machine → Claude → PDF/DOCX → back to WhatsApp. The core transition() is a pure function of (teacher, message, now) → step, with all I/O pushed through ports and adapters (Twilio, Supabase, Anthropic, PDF, DOCX, media, storage). Claude Sonnet 5 is the default model, with Claude Haiku 4.5 env-switchable.",
        "The question-paper path uses structured outputs (messages.parse with a zod output format), vision on teacher-sent photos, and a second QC pass; its prompt is explicit — flag an unreadable or blurry page in source notes and never hallucinate. The worksheet prompt keeps generation inside the stated board's syllabus (CBSE, ICSE or a State board) and never asks for a student's personal details.",
      ],
      artifacts: [
        {
          id: "ts-a-arch",
          type: "generic",
          title: "Ports-and-adapters architecture",
          kind: "doc",
          note: "transition() is a pure function (teacher, message, now) → step; all I/O runs through ports/adapters — Twilio, Supabase, Anthropic, PDF/DOCX.",
          source: "TS-RUNBOOK",
        },
        {
          id: "ts-a-paper",
          type: "generic",
          title: "Question-paper path: structured outputs + vision + QC pass",
          kind: "doc",
          note: "messages.parse with a zod output format, vision on teacher photos, and a second QC pass; the prompt says never hallucinate and flags unreadable pages.",
          source: "TS-ANTHROPIC-PAPER",
        },
        {
          id: "ts-a-cost",
          type: "metric",
          metric: {
            value: "≈ $0.01",
            label: "Cost per generation",
            context:
              "runbook estimate per worksheet/paper generation; an estimate, not an independently measured figure",
            asOf: "2026-08-24",
            kind: "self-reported",
            source: "TS-RUNBOOK",
          },
          source: "TS-RUNBOOK",
        },
      ],
    },
    {
      id: "evaluation",
      title: "Evaluation",
      body: [
        "TeachSpark was instrumented with 32 event types across a server-side event store, Mixpanel and Clarity. QA ran as phased gates through phase-7, with real Claude→PDF→Supabase round-trips and Twilio-shaped webhook end-to-end tests; the last recorded gate was 335 passed / 2 skipped (phase-6, 2026-08-21). The pitch's \"625 tests\" could not be reproduced and is not used, and no LLM output-quality evals exist — only the in-product QC pass.",
        "The most telling evaluation decision was about honesty. The day before submission, Tushar added an is_test flag and excluded his own handsets from the pilot numbers: activated teachers dropped from 10 to 8, median time saved fell from 37.5 to 30 minutes, and exported papers went from 5 to 2. Mixpanel (captured from 24 Aug only; the first-party store of 72 landing views is authoritative) recorded a 27 → 7 → 4 landing → sign-up → join funnel.",
      ],
      artifacts: [
        {
          id: "ts-a-istest",
          type: "experiment",
          setup:
            "The day before submission, added an is_test flag and excluded my own handsets from the pilot numbers.",
          result:
            "Activated teachers dropped from 10 to 8; median time saved fell from 37.5 to 30 minutes; papers from 5 to 2.",
          learning: "Honest smaller numbers earn more trust than impressive fake ones.",
          source: "TS-LINKEDIN-BUILD",
        },
        {
          id: "ts-a-qa",
          type: "evaluation",
          method:
            "Phased QA gates through phase-7 with real Claude→PDF→Supabase round-trips and Twilio-shaped webhook end-to-end tests.",
          result: "Last recorded gate: 335 passed / 2 skipped (phase-6, 2026-08-21).",
          limitation:
            "No LLM output-quality evals exist; the pitch's \"625 tests\" could not be reproduced and is not used.",
          source: "TS-QA-PHASE6",
        },
        {
          id: "ts-a-mixpanel",
          type: "metric",
          metric: {
            value: "27→7→4",
            label: "Mixpanel 3-step funnel",
            context:
              "landing_view → signup_completed → join_tapped; captured from 24 Aug only, first-party store (72 views) is authoritative",
            asOf: "2026-08-24",
            kind: "measured",
            source: "TS-MIXPANEL",
          },
          source: "TS-MIXPANEL",
        },
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      body: [
        "The first-week pilot (Final-PRD snapshot 2026-08-24, test handsets excluded) ran the full funnel: 72 landing views → 17 sign-ups (23.6%) → 17 joined on WhatsApp → 12 onboarded (71%) → 8 activated (47%) → 5 question papers exported, with a self-reported median of 37.5 minutes saved, 3 referrals, and nudge re-engagement of 1 of 4. Sign-up method was 17 manual, 0 Google.",
        "Measured against the pre-set targets — joined 40–50, activation ≥60%, D1 retention ≥25% — the pilot came in under. Tushar's own reflection was that the D1 number \"wasn't low; it was structurally impossible,\" because the measurement window was shorter than the 24-hour definition. The service runs as a live pilot on a Twilio sandbox rather than a production WhatsApp number, and whether the Railway service is still up after 2026-09-09 is unverified.",
      ],
      artifacts: [
        {
          id: "ts-a-referrals",
          type: "metric",
          metric: {
            value: "3",
            label: "Referrals",
            context:
              "teacher-reported referrals during the first-week pilot; snapshot 2026-08-24, test handsets excluded",
            asOf: "2026-08-24",
            kind: "self-reported",
            source: "CS4-FINAL-PRD",
          },
          source: "CS4-FINAL-PRD",
        },
        {
          id: "ts-a-d1",
          type: "experiment",
          setup:
            "Set activation and D1-retention targets before the pilot (joined 40–50, activation ≥60%, D1 ≥25%).",
          result: "17 joined and 47% activated — under target; D1 was not meaningfully measurable.",
          learning:
            "The number wasn't low, it was structurally impossible — the measurement window was shorter than the 24-hour definition.",
          source: "TS-LINKEDIN-BUILD",
        },
      ],
    },
    {
      id: "learned",
      title: "What I learned",
      body: [
        "The sharpest lesson came from the mentor: \"a teacher doesn't really buy 'AI'. A teacher buys a worksheet that is good enough to give to her students tomorrow.\" The mentor also warned that WhatsApp is a strong distribution decision but should not become the entire product differentiation, and that the original objective of helping teachers learn Tech + AI was currently missing from the experience. Tushar's response kept the best-worksheet tool as the lead and delivered learning in-product as the trust mechanism — Wave 1 (\"trust & clarity\") shipped on 2026-08-29.",
        "Two build-level lessons stuck. First, green tests prove a thing runs, not that it is right: 335 passing tests still shipped a sign-up India map that placed zero real sign-ups, because a case-sensitive lookup against 14 hard-coded cities missed teachers who had typed \"Bangalore\" four different ways when it expected \"Bengaluru.\" Second, the redundant typed WhatsApp-number field on the sign-up form was the likely top drop-off.",
      ],
      artifacts: [
        {
          id: "ts-a-mentor",
          type: "insight",
          quote:
            "A teacher doesn't really buy 'AI'. A teacher buys a worksheet that is good enough to give to her students tomorrow.",
          attribution: "Mentor feedback, 2026-08-29",
          source: "TS-MENTOR",
        },
        {
          id: "ts-a-cities",
          type: "experiment",
          setup:
            "The sign-up India map matched city names with a case-sensitive lookup against 14 hard-coded cities.",
          result:
            "It placed zero real sign-ups — teachers had typed \"Bangalore\" four different ways; the lookup expected \"Bengaluru.\"",
          learning: "Real inputs are messier than any hard-coded list — normalize before you match.",
          source: "TS-LINKEDIN-BUILD",
        },
        {
          id: "ts-a-wave1",
          type: "decision",
          title: "Wave 1: trust & clarity",
          chosen:
            "Keep the best-worksheet tool as the lead and deliver learning in-product as the trust mechanism; ship Wave 1 (trust & clarity) on the landing.",
          rejected: [
            "Reposition the product as an AI-learning course",
            "Make WhatsApp itself the product differentiation",
          ],
          reason: "Commit 2026-08-29: \"Wave 1: trust & clarity on the landing (mentor feedback).\"",
          source: "TS-MENTOR",
        },
      ],
    },
  ],
  thinking: [
    {
      stage: "observation",
      text: "It started with one real teacher: my mother, who teaches Sanskrit. My best user research was remembering my mother's evenings.",
      source: "TS-PITCH",
      href: "/work/teachspark#01-context",
    },
    {
      stage: "user-problem",
      text: "Time-poor K–12 teachers want AI to save time, but resources are generic, fragmented and disconnected from their classroom — so most never build durable, applied AI skills.",
      source: "TS-DISCOVERY-PRD",
      href: "/work/teachspark#02-problem",
    },
    {
      stage: "insight",
      text: "The problem is not scarcity of content, it is that content is generic and disconnected from the classroom.",
      source: "TS-DISCOVERY-PRD",
      href: "/work/teachspark#03-discovery",
    },
    {
      stage: "hypothesis",
      text: "A teacher will adopt AI if it solves one real classroom task this week and shows the time saved; eight assumptions (A1–A8) were written with type and risk before any code.",
      source: "TS-DISCOVERY-PRD",
      href: "/work/teachspark#03-discovery",
    },
    {
      stage: "product-decision",
      text: "Capability, not dependency: teach the reusable skill instead of doing the task; the MVP wedge was chosen for high frequency, high pain, and being easy to template and measure.",
      source: "TS-SOLUTION-PRD",
      href: "/work/teachspark#04-product-bet",
    },
    {
      stage: "prototype",
      text: "Shipped solo: a WhatsApp bot (Twilio sandbox), a web landing, an admin console and analytics — WhatsApp → Twilio → Express → pure state machine → Claude → PDF/DOCX.",
      source: "TS-RUNBOOK",
      href: "/work/teachspark#05-what-i-built",
    },
    {
      stage: "evaluation",
      text: "Instrumented 32 event types; the day before submission I added an is_test flag and excluded my own handsets — activation dropped 10→8 and median time saved 37.5→30 minutes.",
      source: "TS-LINKEDIN-BUILD",
      href: "/work/teachspark#06-evaluation",
    },
    {
      stage: "outcome",
      text: "First-week pilot (2026-08-24, test handsets excluded): 17 teachers joined, 8 activated (47%), median 37.5 minutes saved (self-report), 3 referrals; then a mentor challenge drove a Wave-1 trust-and-clarity iteration.",
      source: "CS4-FINAL-PRD",
      href: "/work/teachspark#07-outcome",
    },
  ],
  learnings: [
    "A teacher buys a worksheet good enough for tomorrow, not \"AI\" — lead with the artifact and deliver learning as the trust mechanism (mentor, 2026-08-29).",
    "Green tests prove it runs; they don't prove it's right — 335 passing tests still shipped a broken, case-sensitive city lookup.",
    "Honest smaller numbers earn more trust than impressive fake ones — excluding my own handsets the day before submission was the right call.",
    "Distribution (WhatsApp) is a strong wedge, but it must not become the entire product differentiation.",
  ],
  sources: [
    {
      id: "TS-README-3",
      label: "TeachSpark README",
      ref: "TS/README.md:3",
      inventory: "§8.1",
    },
    {
      id: "CS4-FINAL-PRD",
      label: "TeachSpark Final PRD",
      ref: "CS4/docs/final-prd.docx §0/§7",
      inventory: "§8.1",
    },
    {
      id: "TS-DISCOVERY-PRD",
      label: "TeachSpark Discovery PRD",
      ref: "CS4/Case Study 4 - Discovery PRD.docx §0/§1.1/§6",
      inventory: "§8.1",
    },
    {
      id: "TS-SOLUTION-PRD",
      label: "TeachSpark Solution-Space PRD",
      ref: "CS4/Case Study 4 - Solution-Space PRD.docx §3/§4",
      inventory: "§8.1",
    },
    {
      id: "TS-PITCH",
      label: "TeachSpark pitch deck",
      ref: "CS4/pitch/teachspark-pitch.pdf slides 10, 13",
      inventory: "§8.1",
    },
    {
      id: "TS-RUNBOOK",
      label: "TeachSpark runbook",
      ref: "TS/docs/runbook.md:10-65",
      inventory: "§8.1",
    },
    {
      id: "TS-ANTHROPIC-PAPER",
      label: "TeachSpark question-paper adapter",
      ref: "TS/src/adapters/anthropic-paper.ts",
      inventory: "§8.1",
    },
    {
      id: "TS-LINKEDIN-BUILD",
      label: "TeachSpark 9-day build series",
      ref: "TS/docs/linkedin/9-day-build-series.md (Post 9)",
      inventory: "§8.1",
    },
    {
      id: "TS-MENTOR",
      label: "TeachSpark mentor feedback",
      ref: "CS4/MentorFeedback.md (2026-08-29)",
      inventory: "§8.1",
    },
    {
      id: "TS-QA-PHASE6",
      label: "TeachSpark QA phase-6 gate",
      ref: "TS/docs/qa/phase-6.md (2026-08-21)",
      inventory: "§8.1",
    },
    {
      id: "TS-MIXPANEL",
      label: "TeachSpark Mixpanel funnel",
      ref: "CS4/docs/assets/mixpanel-funnel.png",
      inventory: "§8.1",
    },
    {
      id: "TS-LIVE",
      label: "TeachSpark live pilot (Railway)",
      ref: "https://teachspark-production.up.railway.app (uptime after 2026-09-09 unverified)",
      inventory: "§8.1",
      url: "https://teachspark-production.up.railway.app",
    },
  ],
};

/**
 * RailCite — the second featured full case study (featured rank 2, medium; TKT-29, M-005). Every
 * chapter body, metric, artifact and thinking node traces to CONTENT_INVENTORY §8.2 + AUDIT §5 —
 * nothing is invented. Corpus figures follow the decided **"live, with as-of date"** policy: the
 * live count (5,760 docs / 14,406 chunks) is dated 2026-09-15 from `/api/stats`, and the Final-PRD
 * ingest figures (5,687 ingested, 3,865 OCR, 14,078 chunks, 193 lineage) are only ever shown tied to
 * "7 Sep 2026", never as the current corpus. Truth rules preserved verbatim: citation validity is
 * "0 invented citations by construction" (enforced by `lib/validate.ts`, NOT a percentage measured
 * over N queries); the stale deck figures ("148 tests / 5,687 docs" as current) are never used; the
 * one failing test is disclosed as a "stale expectation"; the impeccable P0 "Flagship starter
 * refuses" is stated as found with the fix record noted MISSING. No PII / env-key names; the repo is
 * private (S5) so `repoPublic:false`, no github link.
 */
export const railcite: Project = {
  slug: "railcite",
  name: "RailCite",
  tagline:
    "A trust-first assistant that helps a Chief Commercial Inspector cite the right railway rule/circular… without ever inventing a citation.",
  category: "personal",
  tags: ["AI", "RAG", "GovTech"],
  filters: ["ai", "cloud"],
  status: "live",
  statusLabel: "Live",
  statusAsOf: "2026-09-15",
  featured: 2,
  gridSize: "medium",
  icon: "ShieldCheck",
  role: "Solo build",
  dates: { start: "2026-08", end: "2026-09" },
  duration: "Aug–Sep 2026",
  links: {
    live: "https://railcite.vercel.app",
    repoPublic: false,
  },
  hero: {},
  metrics: [
    {
      value: "5,760",
      label: "Documents indexed",
      context:
        "live corpus of Indian Railways commercial circulars from /api/stats; grows as the nightly crawl ingests new PDFs",
      asOf: "2026-09-15",
      kind: "measured",
      source: "RC-API-STATS",
    },
    {
      value: "0",
      label: "Invented citations",
      context:
        "a P0 validator drops any answer block whose citations don't resolve; all-dropped becomes a refusal — enforced by construction, not measured over a sample of queries",
      asOf: "2026-09-15",
      kind: "structural",
      source: "RC-VALIDATE",
    },
    {
      value: "68%",
      label: "Ingested PDFs needing OCR",
      context:
        "3,865 of 5,687 ingested PDFs required OCR; Final-PRD ingest run, 7 Sep 2026",
      asOf: "2026-09-07",
      kind: "measured",
      source: "RC-FINAL-PRD",
    },
  ],
  overview: {
    thirtySecond: [
      "A Chief Commercial Inspector has to defend a demurrage/wharfage decision. Today that means manually walking multiple yearly PDF lists, reading scanned circulars, guessing which version is current, and hand-writing a justification note that cites them — and one wrong or superseded citation damages the inspector's credibility, not the tool's.",
      "RailCite is a solo-built, live RAG assistant over Indian Railways commercial circulars that answers a CCI's question with correctly-numbered, dated citations and supersession lineage — or refuses when no passage governs the case, because refusal is designed as a first-class success state. A P0 validator drops any answer whose citations don't resolve, so the corpus (5,760 documents / 14,406 chunks, live as of 2026-09-15) can grow nightly without ever letting the model invent a citation.",
    ],
    deepDive: true,
  },
  chapters: [
    {
      id: "context",
      title: "Context",
      body: [
        "RailCite was Case Study 5 of a Cohort 8 product sprint — a nine-day Government / Public Sector brief. Tushar authored the Discovery, Solution and Final PRDs and built the entire MVP solo (104 of 105 commits are his; the other is a Vercel bot), directed with Claude Code.",
        "The starting point was a person, not a market slide. The builder's father is a serving Chief Commercial Inspector, and he and his colleagues became the first users to run real freight, demurrage and wharfage cases against the tool.",
      ],
      artifacts: [
        {
          id: "rc-a-father",
          type: "insight",
          quote:
            "The builder's father is a serving CCI; he and colleagues ran real freight and demurrage cases against RailCite.",
          attribution: "RailCite Final PRD §6",
          source: "RC-FINAL-PRD",
        },
      ],
    },
    {
      id: "problem",
      title: "Problem",
      body: [
        "The Discovery PRD stated the problem plainly: \"A CCI has to defend a demurrage/wharfage decision. Today that means manually walking multiple yearly PDF lists, reading scanned circulars, guessing which version is current, and hand-writing a justification note that cites them. It is slow, error-prone, and one wrong/superseded citation damages the inspector's credibility — not the tool's.\"",
        "The user is \"Ravi,\" a composite of a real CCI — the builder's father and his colleagues: middle-aged, in the Group-C commercial supervisory cadre, not an officer, with a low tolerance for a tool that sounds confident and is wrong.",
      ],
      artifacts: [
        {
          id: "rc-a-ravi",
          type: "insight",
          quote:
            "Ravi (composite of a real CCI — the builder's father and his colleagues)… low tolerance for a tool that 'sounds confident and is wrong.'",
          attribution: "Persona \"Ravi\", RailCite Discovery PRD",
          source: "RC-DISCOVERY-PRD",
        },
      ],
    },
    {
      id: "discovery",
      title: "Discovery",
      body: [
        "The load-bearing insight was that the Railway Board itself won't settle what's in force: its Master Circulars carry the caveat that instructions not included \"should not be deemed to have been superseded simply because of their non-inclusion.\" That reframed the product from search-led (\"find the circular faster\") to accountability-led (\"prove which version governs today\") — because the officer who sanctions is the officer who defends.",
        "Discovery rigour is uneven, and stated as such. The father-and-colleagues user testing is real but unrecorded — no interview count, names, dates or transcripts exist, and the planned human-in-the-loop gate of \"3 real CCI cases\" was still marked pending in the build ledger. The central hypothesis and its eight assumptions (A1–A8) were written before the build; the fielded-interview record was not.",
      ],
      artifacts: [
        {
          id: "rc-a-caveat",
          type: "insight",
          quote:
            "The Railway Board itself won't settle what's in force: its Master Circulars carry the caveat that instructions not included 'should not be deemed to have been superseded simply because of their non-inclusion.'",
          attribution: "RailCite Discovery PRD — insight",
          source: "RC-DISCOVERY-PRD",
        },
        {
          id: "rc-a-hypothesis",
          type: "hypothesis",
          believe:
            "CCIs struggle to justify decisions defensibly because the corpus is un-searchable and silently out-of-date, and because generic AI is confidently wrong.",
          knowWhen:
            "when a real CCI completes a real justification using a tool-generated, correctly-cited draft, and the tool refuses rather than fabricates on an uncovered case.",
          status: "unmeasured",
          source: "RC-FINAL-PRD",
        },
      ],
    },
    {
      id: "bet",
      title: "Product bet",
      body: [
        "The defining product decision was to make refusal a feature. RailCite's design North Star states that \"refuse is a first-class success state, never an error\" — called out in the design document as \"the single most important design decision in the document.\" Rather than always producing an answer, the system is built to say no when no passage governs the case.",
        "This is a cite-or-refuse contract, enforced in code rather than left to the model's good behaviour. The synthesis prompt is explicit: extractive only; if no provided passage actually governs the case, the model must refuse; never claim finality; never invent circular numbers, dates, or provisions.",
      ],
      artifacts: [
        {
          id: "rc-a-refuse",
          type: "decision",
          title: "Refuse is a first-class success state",
          chosen:
            "Answer with resolved, dated citations and supersession lineage — or refuse when no passage governs the case; refusal is designed as a success, not an error.",
          rejected: [
            "Always return an answer, ranking the best-matching passage even when none truly governs the case",
          ],
          reason:
            "For a CCI, a confident wrong citation damages the inspector's credibility, not the tool's — so refusing beats guessing.",
          source: "RC-DESIGN",
        },
        {
          id: "rc-a-extractive",
          type: "generic",
          title: "Cite-or-refuse contract, enforced in code",
          kind: "doc",
          note: "The synthesis prompt is extractive-only: \"If no provided passage actually governs the case, you MUST refuse… Never invent circular numbers, dates, or provisions.\"",
          source: "RC-SYNTHESIZE",
        },
      ],
    },
    {
      id: "built",
      title: "What I built",
      body: [
        "The live app is a retrieval pipeline with the trust contract wired through it: a signed-in request is authenticated, embedded and domain-classified in parallel, checked against a scope-aware answer cache, then matched against the corpus (top-k = 8) with a calibrated relevance threshold of 0.32; passages that clear the gate are synthesised by Claude Sonnet 5 through a forced tool that returns a validated \"answered | refused\" result, after which the citation validator and supersession-lineage lookup run before the answer is cached.",
        "Embeddings are Voyage-3 (1024-dimension) over Supabase Postgres with pgvector; a Claude Haiku classifier routes the query domain, and a hard SQL domain filter keeps one commodity's circulars from bleeding into another's case. There is no reranker. The P0 citation validator drops any answer block whose citations don't resolve to a real source; if every block is dropped, the whole answer becomes a refusal. A nightly GitHub Actions crawl on a self-hosted runner keeps the corpus current.",
      ],
      artifacts: [
        {
          id: "rc-a-pipeline",
          type: "generic",
          title: "Cite-or-refuse retrieval pipeline",
          kind: "doc",
          note: "Auth → embed + domain classify → scope-aware cache → match top-k 8 → threshold 0.32 → Claude Sonnet 5 forced-tool synthesis → citation validator → supersession lineage → cache.",
          source: "RC-PIPELINE",
        },
        {
          id: "rc-a-validator",
          type: "generic",
          title: "P0 citation validator",
          kind: "doc",
          note: "Drops any answer block whose citations don't resolve to a real source; all-blocks-dropped becomes a refusal — the cite-or-refuse contract enforced in code, not prompt-only.",
          source: "RC-VALIDATE",
        },
        {
          id: "rc-a-lineage",
          type: "metric",
          metric: {
            value: "193",
            label: "Supersession lineage links",
            context:
              "explicit supersedes / superseded-by links loaded across the corpus so an answer can show which version governs today; Final-PRD figure, 7 Sep 2026",
            asOf: "2026-09-07",
            kind: "measured",
            source: "RC-FINAL-PRD",
          },
          source: "RC-FINAL-PRD",
        },
      ],
    },
    {
      id: "evaluation",
      title: "Evaluation",
      body: [
        "The relevance threshold was calibrated, not guessed: five relevant and three irrelevant queries showed irrelevant scores at ≤0.25 and relevant scores between 0.29 and 0.66, so the gate was set in the gap at 0.32 — down from an initial 0.45. A deliberately nonsensical query was correctly refused, with every hit scoring ≤0.20.",
        "The honest gaps are named. Citation validity is \"0 invented citations by construction\" — enforced by the validator, not measured over a sample of queries — and there is no groundedness, retrieval-precision or latency evaluation, no usage or funnel data, and no measured time-to-cited-answer. An impeccable UX critique of the live Ask screen scored 22/40 (\"Acceptable\") and raised one P0, \"Flagship starter refuses\"; no record of a fix for that defect exists. The test suite ran 345 passed / 1 failed / 2 skipped across 48 files on 2026-09-15, the single failure a stale expectation left over from moving to a self-hosted runner.",
      ],
      artifacts: [
        {
          id: "rc-a-calibrate",
          type: "experiment",
          setup:
            "Calibrated the relevance threshold with 5 relevant and 3 irrelevant queries instead of picking a number.",
          result:
            "Irrelevant ≤0.25, relevant 0.29–0.66; the threshold was set in the gap at 0.32, down from 0.45, and a nonsense query was refused with all hits ≤0.20.",
          learning:
            "A retrieval threshold is a measurable decision, not a vibe — calibrate it against real relevant and irrelevant queries.",
          source: "RC-CALIBRATE",
        },
        {
          id: "rc-a-impeccable",
          type: "evaluation",
          method:
            "Impeccable UX critique of the live Ask screen — a design-quality review, not a groundedness eval.",
          result:
            "22/40 (\"Acceptable\"), with one P0 finding, \"Flagship starter refuses,\" and four P1s.",
          limitation:
            "No groundedness, retrieval-precision or latency evaluation and no usage data exist; no record of a fix for the P0 defect exists.",
          source: "RC-IMPECCABLE",
        },
        {
          id: "rc-a-tests",
          type: "metric",
          metric: {
            value: "345 / 1 / 2",
            label: "Tests: passed / failed / skipped",
            context:
              "railcite-cron vitest run across 48 files on 2026-09-15; the one failure is a stale expectation after the move to a self-hosted runner, not a product defect",
            asOf: "2026-09-15",
            kind: "measured",
            source: "RC-TESTS",
          },
          source: "RC-TESTS",
        },
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      body: [
        "RailCite is live at railcite.vercel.app (HTTP 200), and its /api/stats endpoint reported 5,760 documents and 14,406 chunks on 2026-09-15. The Final-PRD ingest run (7 Sep 2026) discovered 6,333 PDFs, ingested 5,687, needed OCR on 3,865 of them (68%), produced 14,078 chunks and loaded 193 supersession-lineage links; the live figures are higher because a nightly crawl keeps ingesting.",
        "The sharpest post-launch fix came from a retrieval bug: a passage from one commodity or volume could surface for a different-domain case. The response was that \"bleed has to be impossible, not merely unlikely,\" implemented as a hard SQL domain filter, per-PDF traceability and a scope-aware cache (commits 2026-09-03). What's still missing is the demand side: there is no recorded usage, no measured time-to-cited-answer and no logged real-CCI test session.",
      ],
      artifacts: [
        {
          id: "rc-a-chunks",
          type: "metric",
          metric: {
            value: "14,406",
            label: "Chunks indexed (live)",
            context:
              "live /api/stats on 2026-09-15; the corpus is cited live-with-date because the nightly crawl keeps ingesting new circulars",
            asOf: "2026-09-15",
            kind: "measured",
            source: "RC-API-STATS",
          },
          source: "RC-API-STATS",
        },
        {
          id: "rc-a-bleed",
          type: "experiment",
          setup:
            "Found that retrieval could surface a passage from one commodity or volume for a different-domain case.",
          result:
            "Fixed with a hard SQL domain filter, per-PDF traceability and a scope-aware cache — \"bleed has to be impossible, not merely unlikely.\"",
          learning:
            "For a trust-first tool, an unlikely wrong answer is still a wrong answer; make the failure structurally impossible, not just rare.",
          source: "RC-FINAL-PRD",
        },
      ],
    },
    {
      id: "learned",
      title: "What I learned",
      body: [
        "Two ideas define the build. The first: \"the feature is a citation; the product is trust.\" Everything — extractive synthesis, the validator, supersession lineage, refusal-as-success — serves the inspector's ability to defend a decision, not the appearance of an answer.",
        "The second: staleness is a correctness bug, not a missing feature. As the crawl design put it, \"a circular issued last week that supersedes a rule makes RailCite return a confidently wrong answer with a citation attached\" — which is why the nightly crawl exists. Two engineering scars stuck too: Claude Sonnet 5 rejecting a temperature parameter was caught only by a live smoke test, and the relevance threshold moved from 0.45 to 0.32 only after calibration against real queries.",
      ],
      artifacts: [
        {
          id: "rc-a-trust",
          type: "insight",
          quote: "The feature is a citation. The product is trust.",
          attribution: "RailCite 9-day LinkedIn series, Day 5",
          source: "RC-LINKEDIN",
        },
        {
          id: "rc-a-staleness",
          type: "insight",
          quote:
            "Staleness is not a missing feature — it is a correctness bug… A circular issued last week that supersedes a rule makes RailCite return a confidently wrong answer with a citation attached.",
          attribution: "RailCite nightly-crawl design doc",
          source: "RC-CRON-SPEC",
        },
        {
          id: "rc-a-smoke",
          type: "experiment",
          setup: "Two failures showed up only in the real environment.",
          result:
            "Claude Sonnet 5 rejected a temperature parameter (caught by a live smoke test, not a unit test); the relevance threshold moved 0.45 → 0.32 after calibration.",
          learning:
            "Some correctness facts only surface against the live model and real data — smoke-test the real thing and calibrate against real queries.",
          source: "RC-BUILD-LEDGER",
        },
      ],
    },
  ],
  thinking: [
    {
      stage: "observation",
      text: "The starting point was a person: the builder's father is a serving Chief Commercial Inspector, and he and his colleagues ran real freight and demurrage cases against the tool.",
      source: "RC-FINAL-PRD",
      href: "/work/railcite#01-context",
    },
    {
      stage: "user-problem",
      text: "A CCI has to defend a demurrage/wharfage decision by walking yearly PDF lists and scanned circulars, guessing which version is current — and one wrong or superseded citation damages the inspector's credibility, not the tool's.",
      source: "RC-DISCOVERY-PRD",
      href: "/work/railcite#02-problem",
    },
    {
      stage: "insight",
      text: "The Railway Board itself won't settle what's in force, so the job isn't search-led (\"find the circular faster\") but accountability-led (\"prove which version governs today\") — the officer who sanctions is the officer who defends.",
      source: "RC-DISCOVERY-PRD",
      href: "/work/railcite#03-discovery",
    },
    {
      stage: "hypothesis",
      text: "CCIs struggle to justify decisions defensibly because the corpus is un-searchable and silently out-of-date and generic AI is confidently wrong; we'd know we're right when a real CCI completes a correctly-cited justification and the tool refuses rather than fabricates on an uncovered case.",
      source: "RC-FINAL-PRD",
      href: "/work/railcite#03-discovery",
    },
    {
      stage: "product-decision",
      text: "Refuse is a first-class success state, never an error — the single most important design decision: answer with resolved, dated citations and lineage, or refuse when no passage governs.",
      source: "RC-DESIGN",
      href: "/work/railcite#04-product-bet",
    },
    {
      stage: "prototype",
      text: "Shipped a live RAG pipeline: auth → embed + domain classify → scope-aware cache → top-k match at threshold 0.32 → Claude Sonnet 5 forced-tool extractive synthesis → citation validator → supersession lineage, on Voyage-3 embeddings + pgvector, with a nightly crawl.",
      source: "RC-PIPELINE",
      href: "/work/railcite#05-what-i-built",
    },
    {
      stage: "evaluation",
      text: "Calibrated the threshold with 5 relevant + 3 irrelevant queries (gap → 0.32) and refused a nonsense query; 345 tests pass with 1 stale-expectation failure, but there is no groundedness or latency eval and citation validity is \"by construction,\" not sampled.",
      source: "RC-CALIBRATE",
      href: "/work/railcite#06-evaluation",
    },
    {
      stage: "outcome",
      text: "Live at 5,760 documents / 14,406 chunks (as of 2026-09-15), kept current by a nightly crawl, after a cross-domain-bleed fix made retrieval domain isolation structural — \"bleed has to be impossible, not merely unlikely.\"",
      source: "RC-API-STATS",
      href: "/work/railcite#07-outcome",
    },
  ],
  learnings: [
    "Make refusal a first-class success state: for a trust-first tool, refusing beats a confident wrong citation that damages the user's credibility.",
    "Enforce the trust contract in code, not just the prompt — a P0 validator that drops unresolved citations (and refuses when all are dropped) is stronger than instructions alone.",
    "Staleness is a correctness bug, not a missing feature — a superseding circular turns a cited answer confidently wrong, so freshness needs a nightly crawl.",
    "A retrieval threshold is a measurable decision: calibrate it against real relevant and irrelevant queries (0.45 → 0.32), don't guess.",
    "Some correctness facts only surface against the live model and data — Claude Sonnet 5 rejecting a temperature parameter was caught only by a live smoke test.",
  ],
  sources: [
    {
      id: "RC-DISCOVERY-PRD",
      label: "RailCite Discovery PRD",
      ref: "CS5/Discovery-PRD.md L3-5/L25-28/L38-51",
      inventory: "§8.2",
    },
    {
      id: "RC-FINAL-PRD",
      label: "RailCite Final PRD",
      ref: "CS5/docs/final-prd.docx §0/§6/§7.1/§8",
      inventory: "§8.2",
    },
    {
      id: "RC-DESIGN",
      label: "RailCite Design North Star",
      ref: "CS5/Design.md L21-24",
      inventory: "§8.2",
    },
    {
      id: "RC-SYNTHESIZE",
      label: "RailCite synthesis prompt",
      ref: "RC/lib/synthesize.ts L8-21",
      inventory: "§8.2",
    },
    {
      id: "RC-VALIDATE",
      label: "RailCite citation validator",
      ref: "RC/lib/validate.ts",
      inventory: "§8.2",
    },
    {
      id: "RC-PIPELINE",
      label: "RailCite query pipeline",
      ref: "RC/app/api/query/route.ts; RC/lib/embeddings.ts L12",
      inventory: "§8.2",
    },
    {
      id: "RC-CALIBRATE",
      label: "RailCite threshold calibration",
      ref: "RC/scripts/calibrate.ts; CS5/docs/superpowers/reports/QA-phase2.md P2-5/P2-10",
      inventory: "§8.2",
    },
    {
      id: "RC-IMPECCABLE",
      label: "RailCite impeccable critique",
      ref: "CS5/railcite/.impeccable/critique/2026-08-31T14-59-19Z__components-caseconsole-tsx.md",
      inventory: "§8.2",
    },
    {
      id: "RC-TESTS",
      label: "RailCite test run (railcite-cron)",
      ref: "railcite-cron vitest run 2026-09-15 (AUDIT §5)",
      inventory: "§8.2",
    },
    {
      id: "RC-API-STATS",
      label: "RailCite live /api/stats",
      ref: "https://railcite.vercel.app/api/stats (2026-09-15)",
      inventory: "§8.2",
      url: "https://railcite.vercel.app",
    },
    {
      id: "RC-CRON-SPEC",
      label: "RailCite nightly-crawl design doc",
      ref: "RC/docs/superpowers/specs/2026-09-03-daily-crawl-cron-design.md L16-19",
      inventory: "§8.2",
    },
    {
      id: "RC-BUILD-LEDGER",
      label: "RailCite build ledger",
      ref: "CS5/docs/superpowers/BUILD-LEDGER.md L207/L234/L253",
      inventory: "§8.2",
    },
    {
      id: "RC-LINKEDIN",
      label: "RailCite 9-day LinkedIn series",
      ref: "CS5/docs/linkedin/railcite-9day-linkedin-series.md (Day 5)",
      inventory: "§8.2",
    },
  ],
};

/**
 * Nuptis → Velora (featured rank 3, medium). Card-fidelity record — the Nuptis→Velora rename
 * decision (S3) is carried by the display `name` while the route/slug is `velora`. Copy traces to
 * CONTENT_INVENTORY §8.5 / §1.4 (EVAL-013): tagline is the §1.4 card proposition (verbatim); the
 * `thirtySecond` uses the §8.5 verbatim discovery insight (the PRD's own problem line at PRD.md:11
 * is not quoted in the inventory, so the sourced insight stands in rather than a paraphrase — no
 * fabrication). "Live (mock data)" per §8.5 (the live path was built but never run on a real
 * project). Repo private (S5) → `repoPublic:false`. Chapters/thinking/metrics land at TKT-30.
 */
export const velora: Project = {
  slug: "velora",
  name: "Nuptis → Velora",
  tagline: "Two vendor-onboarding products in nine days — and the decision to kill the first.",
  category: "personal",
  tags: ["B2B", "Marketplace", "PM craft"],
  filters: ["enterprise", "experiments"],
  status: "live",
  statusLabel: "Live (mock data)",
  statusAsOf: "2026-09-15",
  featured: 3,
  gridSize: "medium",
  icon: "Handshake",
  role: "Solo build",
  dates: { start: "2026-08" },
  duration: "Aug 2026",
  links: {
    live: "https://velora-nu-eight.vercel.app/",
    repoPublic: false,
  },
  hero: {},
  metrics: [],
  overview: {
    thirtySecond: [
      "Onboarding routinely takes 15–30 business days, yet almost none of that is active work — it is idle queue-time between cross-functional handoffs.",
    ],
    deepDive: false,
  },
  chapters: EMPTY_CHAPTERS,
  thinking: [],
  learnings: [],
  sources: [
    {
      id: "V-PRD",
      label: "Velora PRD",
      ref: "CS3/Velora/PRD.md:3",
      inventory: "§8.5",
    },
    {
      id: "CS3-9DAY-SERIES",
      label: "Case Study 3 — nine-day LinkedIn series",
      ref: "CS3/Case-Study-3-LinkedIn-9-Day-Series.docx (Day 7, Day 9)",
      inventory: "§8.5",
    },
  ],
};

/* ── remaining personal builds (TKT-15, card fidelity) ─────────────────────────────
 * Chapters/thinking/metrics stay empty (`deepDive:false`) until each slug's case-study ticket
 * (M-005). Every field traces to CONTENT_INVENTORY §2.2 (card propositions, verbatim) + the named
 * §8 pack (status, dates, role, repo visibility) — no metric is asserted here, so nothing is
 * unsourced. Filters follow SITEMAP.md; Token Toli / Pratyasa / Bhakti-Vilas default to
 * `experiments` (TKT-15 AC 2 open decision). `repoPublic:true` only where the audit confirmed a
 * public repo (cinematic-portfolio, dino-arcade-pwa); every other repo is private/unverified → false.
 */

/**
 * Cubicle. "Built, not launched" — code-complete offline prototype, never run live, not deployed
 * (§8.3; CS6/QA-report.md:13). Card must NOT claim solo (team of 6, Tushar's named role unrecorded
 * §8.3) → role "Team build". No live link; repo private (S5) → github populated, repoPublic:false.
 */
export const cubicle: Project = {
  slug: "cubicle",
  name: "Cubicle",
  tagline:
    "Four AI teammates debate visibly, then produce a PRD, competitor scan, landing copy and build plan in ~90 seconds.",
  category: "personal",
  tags: ["AI", "Multi-agent", "Gemini"],
  filters: ["ai"],
  status: "prototype",
  statusLabel: "Built, not launched",
  gridSize: "small",
  icon: "Users",
  role: "Team build",
  dates: { start: "2026-09" },
  duration: "Sep 2026",
  links: {
    github: "https://github.com/007U5H4R/cubicle",
    repoPublic: false,
  },
  hero: {},
  metrics: [],
  overview: {
    thirtySecond: [
      "A solo founder types a product idea and watches four AI teammates — PM, researcher, designer, developer — visibly collaborate to produce a one-page PRD, a competitor scan, landing-page copy and a build plan, shareable by link, in about 90 seconds.",
    ],
    deepDive: false,
  },
  chapters: EMPTY_CHAPTERS,
  thinking: [],
  learnings: [],
  sources: [
    { id: "CUB-DISCOVERY-PRD", label: "Cubicle Discovery PRD", ref: "CS6/Discovery-PRD.md:260", inventory: "§8.3" },
    { id: "CUB-QA-REPORT", label: "Cubicle QA report", ref: "CS6/QA-report.md:13", inventory: "§8.3" },
  ],
};

/**
 * Nuptis (separate product from Velora — not a rename; §8.4). Live on mock/local-first data; solo
 * ("Owner: (solo)", "I just shipped my first product, solo" §8.4). Repo private → repoPublic:false.
 */
export const nuptis: Project = {
  slug: "nuptis",
  name: "Nuptis",
  tagline:
    "Vendor ops for wedding-planning agencies — verification status, work orders, payment milestones and backup coverage in one place.",
  category: "personal",
  tags: ["B2B", "Vendor ops", "Supabase"],
  filters: ["enterprise"],
  status: "live",
  statusLabel: "Live (mock data)",
  statusAsOf: "2026-09-15",
  gridSize: "small",
  icon: "ClipboardList",
  role: "Solo build",
  dates: { start: "2026-08", end: "2026-09" },
  duration: "Aug 2026",
  links: {
    live: "https://nuptis.vercel.app/",
    github: "https://github.com/007U5H4R/nuptis",
    repoPublic: false,
  },
  hero: {},
  metrics: [],
  overview: {
    thirtySecond: [
      "Wedding planning agencies run 15–30+ vendors across 5–7 ceremonies per wedding over spreadsheets and WhatsApp threads, with no structured record of vendor verification, work orders, payment milestones or backup coverage — so one no-show turns into a scramble.",
    ],
    deepDive: false,
  },
  chapters: EMPTY_CHAPTERS,
  thinking: [],
  learnings: [],
  sources: [
    { id: "NUP-PRD", label: "Nuptis PRD", ref: "CS3/Nuptis-PRD.md:3,18", inventory: "§8.4" },
    { id: "NUP-README", label: "Nuptis README", ref: "CS3/Nuptis/README.md:83-88", inventory: "§8.4" },
  ],
};

/**
 * Bhakti-Vilas. Live prototype on mock data, team build (git authors 5×007U5H4R / 3×Shivali, §8.6)
 * → role "Team build". Repo on an org account, visibility unverified → repoPublic:false.
 */
export const bhaktiVilas: Project = {
  slug: "bhakti-vilas",
  name: "Bhakti Vilas",
  tagline:
    "An elder-focused wellness prototype built around bhajan — devotion as behavioural health, not a clinical app.",
  category: "personal",
  tags: ["Prototype", "Health", "Team"],
  filters: ["experiments"],
  status: "prototype",
  statusLabel: "Live prototype (mock data, team build)",
  statusAsOf: "2026-09-15",
  gridSize: "small",
  icon: "Music",
  role: "Team build",
  dates: { start: "2026-07", end: "2026-08" },
  duration: "Jul–Aug 2026",
  links: {
    live: "https://bhakti-vilas.vercel.app/",
    github: "https://github.com/teenytinybot/Bhakti-Vilas",
    repoPublic: false,
  },
  hero: {},
  metrics: [],
  overview: {
    thirtySecond: [
      "An interactive prototype for an elder-focused wellness platform for India built around bhajan — positioned as devotion-as-behavioural-health rather than a clinical wellness app.",
    ],
    deepDive: false,
  },
  chapters: EMPTY_CHAPTERS,
  thinking: [],
  learnings: [],
  sources: [
    { id: "BV-README", label: "Bhakti Vilas README", ref: "CS2/Bhakti-Vilas/README.md", inventory: "§8.6" },
    { id: "BV-AUDIT-GIT", label: "Portfolio audit — git authorship", ref: "AUDIT §2 git table", inventory: "§8.6" },
  ],
};

/**
 * Token Toli (discovery-only). Research artifacts, no product/code/deploy (§8.7) → status:"research",
 * no live/github. Team pod PRD (Guru pod, 3 co-authors) → role "Team discovery"; must not claim solo.
 */
export const tokenToli: Project = {
  slug: "token-toli",
  name: "Token Toli",
  tagline:
    "Ageing-in-place care orchestration for long-distance families — a discovery PRD with 11 named respondents and four tested hypotheses.",
  category: "personal",
  tags: ["Discovery", "Research", "Healthcare"],
  filters: ["experiments"],
  status: "research",
  statusLabel: "Discovery only",
  gridSize: "small",
  icon: "Search",
  role: "Team discovery",
  dates: { start: "2026-07" },
  duration: "Jul 2026",
  links: {
    repoPublic: false,
  },
  hero: {},
  metrics: [],
  overview: {
    thirtySecond: [
      "Adult children living away from ageing parents lack a trusted, medically informed view of their parent's health and care; existing solutions coordinate services but do not prioritise medical accountability and reporting.",
    ],
    deepDive: false,
  },
  chapters: EMPTY_CHAPTERS,
  thinking: [],
  learnings: [],
  sources: [
    { id: "TT-DISCOVERY-PRD", label: "Token Toli Discovery PRD (Guru pod)", ref: "CS1/Discovery PRD-2.pdf pp.24-31", inventory: "§8.7" },
  ],
};

/**
 * Pratyasa. Live static record of granted patent IN 429867 (§8.8). The site is Tushar's solo build
 * (with Claude); he is co-inventor of the patent it documents. Repo visibility unverified → false.
 */
export const pratyasa: Project = {
  slug: "pratyasa",
  name: "Pratyasa",
  tagline:
    "A static record of granted patent IN 429867 — a point-of-care sepsis-biomarker biosensor — with certificate, paper and footage.",
  category: "personal",
  tags: ["Patent", "Static", "Record"],
  filters: ["experiments"],
  status: "live",
  statusLabel: "Live",
  statusAsOf: "2026-09-15",
  gridSize: "small",
  icon: "Award",
  role: "Solo build",
  dates: { start: "2026-08", end: "2026-09" },
  duration: "Aug 2026",
  links: {
    live: "https://pratyasa.vercel.app",
    github: "https://github.com/007U5H4R/pratyasa",
    repoPublic: false,
  },
  hero: {},
  metrics: [],
  overview: {
    thirtySecond: [
      "A public, fast, self-contained web page that showcases granted patent IN 429867 — a point-of-care sepsis-biomarker biosensor — as a credible record of work.",
    ],
    deepDive: false,
  },
  chapters: EMPTY_CHAPTERS,
  thinking: [],
  learnings: [],
  sources: [
    { id: "PT-DISCOVERY-PRD", label: "Pratyasa Discovery PRD (FACT-LOCK)", ref: "PT/discoveryPRD.md Goal, §4", inventory: "§8.8" },
  ],
};

/**
 * Tegaki. Live pilot (checkout confirms an order without charging; §8.9). Solo ("Owner: Tushar
 * Pathak · Scribe: Claude"). Repo visibility unverified → repoPublic:false.
 */
export const tegaki: Project = {
  slug: "tegaki",
  name: "Tegaki",
  tagline: "What your handwriting suggests about you — read and written by hand.",
  category: "personal",
  tags: ["D2C", "Supabase RLS", "Pilot"],
  filters: ["experiments"],
  status: "pilot",
  statusLabel: "Live pilot",
  statusAsOf: "2026-09-15",
  gridSize: "small",
  icon: "PenLine",
  role: "Solo build",
  dates: { start: "2026-09" },
  duration: "Sep 2026",
  links: {
    live: "https://tegaki-one.vercel.app",
    github: "https://github.com/007U5H4R/tegaki",
    repoPublic: false,
  },
  hero: {},
  metrics: [],
  overview: {
    thirtySecond: [
      "A D2C pilot that productizes a fully manual handwriting-analysis practice — from analysis to a polished report — asking whether a stranger would trust and pay for the experience.",
    ],
    deepDive: false,
  },
  chapters: EMPTY_CHAPTERS,
  thinking: [],
  learnings: [],
  sources: [
    { id: "GR-README", label: "Tegaki README", ref: "GR/README.md", inventory: "§8.9" },
    { id: "GR-SOLUTION-PRD", label: "Tegaki Solution PRD", ref: "GR/Solution-PRD.md §1", inventory: "§8.9" },
  ],
};

/**
 * dino-arcade-pwa. Live on GitHub Pages; repo public (§8.10, AUDIT §B) → repoPublic:true. Slug matches
 * lib/anchors ALL_PROJECT_SLUGS ("dino-arcade-pwa"). BYO-ROM is the load-bearing product framing.
 */
export const dinoArcadePwa: Project = {
  slug: "dino-arcade-pwa",
  name: "Dino Arcade",
  tagline:
    "A mobile PWA that turns your phone into an arcade cabinet — bring your own ROM, nothing ships or uploads.",
  category: "personal",
  tags: ["PWA", "Offline", "EmulatorJS"],
  filters: ["experiments"],
  status: "live",
  statusLabel: "Live (BYO-ROM)",
  statusAsOf: "2026-09-15",
  gridSize: "small",
  icon: "Gamepad2",
  role: "Solo build",
  dates: { start: "2026-09" },
  duration: "Sep 2026",
  links: {
    live: "https://007u5h4r.github.io/dino-arcade-pwa/",
    github: "https://github.com/007U5H4R/dino-arcade-pwa",
    repoPublic: true,
  },
  hero: {},
  metrics: [],
  overview: {
    thirtySecond: [
      "A mobile-first Progressive Web App that turns your phone into an arcade cabinet — styled as a backlit cabinet with a marquee, recessed bezel, CRT shader and an on-screen controller. It ships no game data: you supply a file you are legally entitled to use.",
    ],
    deepDive: false,
  },
  chapters: EMPTY_CHAPTERS,
  thinking: [],
  learnings: [],
  sources: [
    { id: "DN-README", label: "Dino Arcade README", ref: "DN/README.md", inventory: "§8.10" },
  ],
};

/**
 * cinematic-portfolio. Live since 2026-08-26; repo public (§8.11, AUDIT §B) → repoPublic:true.
 * Solo build ("Author: Tushar Pathak (with Claude)").
 */
export const cinematicPortfolio: Project = {
  slug: "cinematic-portfolio",
  name: "Cinematic Portfolio",
  tagline:
    "A scroll-driven film portfolio — AI-generated footage of me as the backdrop, Apple-product-page style, no build step.",
  category: "personal",
  tags: ["Motion", "Static", "Higgsfield"],
  filters: ["experiments"],
  status: "live",
  statusLabel: "Live",
  statusAsOf: "2026-09-15",
  gridSize: "small",
  icon: "Film",
  role: "Solo build",
  dates: { start: "2026-08" },
  duration: "Aug 2026",
  links: {
    live: "https://tushar-pathak.vercel.app/",
    github: "https://github.com/007U5H4R/cinematic-portfolio",
    repoPublic: true,
  },
  hero: {},
  metrics: [],
  overview: {
    thirtySecond: [
      "A cinematic 3D-scroll personal portfolio — AI-generated film of Tushar as the backdrop, scroll-driven like an Apple product page, with a reduced-motion static fallback and no build step.",
    ],
    deepDive: false,
  },
  chapters: EMPTY_CHAPTERS,
  thinking: [],
  learnings: [],
  sources: [
    { id: "CN-PRD", label: "Cinematic portfolio PRD", ref: "CN/PRD.md", inventory: "§8.11" },
    { id: "CN-LEDGER", label: "Cinematic build ledger", ref: "CN/ledger.md (2026-08-26)", inventory: "§8.11" },
  ],
};

/* ── professional experience entries (TKT-15, §2.3) ────────────────────────────────
 * `category:'professional'`: the schema forbids `links.live`, `demoVideo` and `featured` on these,
 * so corporate work can never imply a public product (Solution-PRD §5). Status is neutral
 * ("archived" → neutral badge tone) so no green "Live" product signal appears; the badge text is
 * "Professional experience". All facts are resume-only and self-reported (§2.3, §4.5). No `/work/[slug]`
 * page is generated (generateStaticParams filters category==='personal').
 */

/** American Express (via IntraEdge), Jun 2026–present. Tags per §2.3 (Enterprise · Cloud · GenAI). */
export const marsArModernization: Project = {
  slug: "mars-ar-modernization",
  name: "Accounts Receivable Modernization — American Express",
  tagline:
    "Owned the migration roadmap for 35+ AR capabilities from the legacy Triumph platform to the cloud-native MARS microservices platform; led Devin GenAI integration for AI-assisted development.",
  category: "professional",
  tags: ["Enterprise", "Cloud", "GenAI"],
  filters: ["enterprise", "cloud", "ai"],
  status: "archived",
  statusLabel: "Professional experience",
  gridSize: "small",
  icon: "Landmark",
  role: "Senior Product Manager",
  dates: { start: "2026-06" },
  duration: "Jun 2026 – present",
  links: {
    repoPublic: false,
  },
  hero: {},
  metrics: [],
  overview: {
    thirtySecond: [
      "Senior Product Manager for Accounts Receivable at American Express (via IntraEdge): migrating 35+ capabilities from the legacy Triumph platform to the cloud-native MARS microservices platform and championing Devin GenAI adoption. Self-reported, resume-sourced.",
    ],
    deepDive: false,
  },
  chapters: EMPTY_CHAPTERS,
  thinking: [],
  learnings: [],
  sources: [
    { id: "RESUME-AMEX", label: "Résumé — American Express (via IntraEdge)", ref: "portfolio/resume.pdf (AmEx section)", inventory: "§2.3" },
  ],
};

/** Quantiphi (GCP), Aug 2022–Apr 2026; Shellkode (AWS), Apr–Jun 2026. Tags per §2.3 (Cloud · Data · Delivery). */
export const cloudModernizationPrograms: Project = {
  slug: "cloud-modernization-programs",
  name: "Cloud & Data Platform Modernization — Quantiphi & Shellkode",
  tagline:
    "DynamoDB→Cloud Spanner and SQL Server transformation frameworks; HIPAA-compliant healthcare data migration; GCP capability-building program; Agile delivery governance.",
  category: "professional",
  tags: ["Cloud", "Data", "Delivery"],
  filters: ["cloud", "enterprise"],
  status: "archived",
  statusLabel: "Professional experience",
  gridSize: "small",
  icon: "Cloud",
  role: "Technical Project Manager",
  dates: { start: "2022-08", end: "2026-06" },
  duration: "Aug 2022 – Jun 2026",
  links: {
    repoPublic: false,
  },
  hero: {},
  metrics: [],
  overview: {
    thirtySecond: [
      "Technical Project Manager across enterprise cloud-native programs — Quantiphi (GCP, 2022–2026) and Shellkode (AWS, 2026): data-engineering and API modernization, DynamoDB→Cloud Spanner migrations, HIPAA-compliant healthcare data migration and Agile delivery governance. Resume-sourced.",
    ],
    deepDive: false,
  },
  chapters: EMPTY_CHAPTERS,
  thinking: [],
  learnings: [],
  sources: [
    { id: "RESUME-QUANTIPHI-SHELLKODE", label: "Résumé — Quantiphi & Shellkode", ref: "portfolio/resume.pdf (Quantiphi + Shellkode sections)", inventory: "§2.3" },
  ],
};

/** Godrej Infotech, Sep 2016–Dec 2018. Tags per §2.3 ("Platform", not "IoT" — resume says platform only). */
export const godrejSmartnet: Project = {
  slug: "godrej-smartnet",
  name: "Godrej Smartnet Platform — Godrej Infotech",
  tagline:
    "Assistant Product Manager: end-to-end lifecycle of the Smartnet platform; 12 features in 11 months; Agile transformation.",
  category: "professional",
  tags: ["Product", "Enterprise", "Platform"],
  filters: ["enterprise"],
  status: "archived",
  statusLabel: "Professional experience",
  gridSize: "small",
  icon: "Network",
  role: "Assistant Product Manager",
  dates: { start: "2016-09", end: "2018-12" },
  duration: "Sep 2016 – Dec 2018",
  links: {
    repoPublic: false,
  },
  hero: {},
  metrics: [],
  overview: {
    thirtySecond: [
      "Assistant Product Manager at Godrej Infotech (2016–2018): end-to-end lifecycle of the Godrej Smartnet platform, 12 features in 11 months, and Agile transformation across the portfolio. Self-reported, resume-sourced.",
    ],
    deepDive: false,
  },
  chapters: EMPTY_CHAPTERS,
  thinking: [],
  learnings: [],
  sources: [
    { id: "RESUME-GODREJ", label: "Résumé — Godrej Infotech", ref: "portfolio/resume.pdf (Godrej section)", inventory: "§2.3" },
  ],
};

/**
 * The full 14-record collection (TKT-15): 11 personal builds + 3 professional-experience entries.
 * Featured trio (rank 1/2/3): TeachSpark (large) · RailCite · Nuptis → Velora. Exactly one
 * `gridSize:'large'` (teachspark). `generateStaticParams` builds a `/work/<slug>` page for the 11
 * personal builds only; professional entries render inline on `/work` (TKT-17), no case-study page.
 */
export const projects: Project[] = [
  // personal builds (11) — featured trio first, then the rest
  teachspark,
  railcite,
  velora,
  cubicle,
  nuptis,
  bhaktiVilas,
  tokenToli,
  pratyasa,
  tegaki,
  dinoArcadePwa,
  cinematicPortfolio,
  // professional experience (3)
  marsArModernization,
  cloudModernizationPrograms,
  godrejSmartnet,
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
