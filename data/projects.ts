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
 * RailCite (featured rank 2, medium). Card-fidelity record — chapters/thinking/metrics stay empty
 * until the case-study content ticket (TKT-28). Every field traces to CONTENT_INVENTORY §8.2 / §1.4
 * (EVAL-013): tagline is the §1.4 FeaturedWork card copy (verbatim, deliberately abbreviated so the
 * "without ever inventing a citation" proposition survives the 2-line clamp); live status dated
 * 2026-09-15 (`/api/stats` HTTP 200); repo private (S5) so `repoPublic:false`, no github link.
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
  metrics: [],
  overview: {
    thirtySecond: [
      "A CCI has to defend a demurrage/wharfage decision. Today that means manually walking multiple yearly PDF lists… one wrong or superseded citation damages the inspector's credibility — not the tool's.",
    ],
    deepDive: false,
  },
  chapters: EMPTY_CHAPTERS,
  thinking: [],
  learnings: [],
  sources: [
    {
      id: "RC-DISCOVERY-PRD",
      label: "RailCite Discovery PRD",
      ref: "CS5/Discovery-PRD.md L3-5",
      inventory: "§8.2",
    },
    {
      id: "RC-API-STATS",
      label: "RailCite live /api/stats",
      ref: "https://railcite.vercel.app/api/stats (2026-09-15)",
      inventory: "§8.2",
      url: "https://railcite.vercel.app",
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
