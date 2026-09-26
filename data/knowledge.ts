import type { KnowledgeEntry } from "./schema";

/**
 * Ask-AI knowledge base (technical-plan.md §B TKT-09; decisions S7, PB3, EVAL-012/013).
 *
 * The deterministic Ask (no live LLM in v1) answers ONLY from these entries. The 8 "index" answers
 * are transcribed VERBATIM from CONTENT_INVENTORY §9, with exactly two sanctioned edits, both from
 * §9's own notes:
 *   1. the `pm` answer: "Ten years" → "7+ years" (§9 note: resume says "7+ years").
 *   2. the `enterprise` evidence link: `/work?tab=enterprise` → `/work?filter=enterprise` (E-2: the
 *      only permitted query key is `filter`).
 * The 3 additional PB3 answers (`learned`, `evaluate`, `research`) are authored from VERIFIED §8 /
 * §4.7 source packs — every number in them traces to a cited pack line (see docs/reports/TKT-09.md).
 *
 * All answers ship `draft: true` (Tushar signs off the copy later; the UI labels them DRAFT).
 * `surface`: 5 entries on the home inline field, 6 on the panel (disjoint; PB3 = 11 total).
 * Evidence hrefs resolve through `lib/anchors.ts` routes() — a dangling one fails the build (EVAL-013).
 * `keywords` are CANONICAL terms (post-synonym) with weights; `aliases` are whole-prompt paraphrases
 * that resolve to the same entry (EVAL-012). This module is type-only w.r.t. the schema, so no client
 * bundle pulls in zod — validation runs at build time (scripts/validate-content.ts) and in Vitest.
 */
export const knowledge: KnowledgeEntry[] = [
  /* ── home (5) ─────────────────────────────────────────────── */
  {
    id: "built",
    prompt: "What products have you built?",
    // DES-005 (Stage-8): "tell me about velora" (the vendor-onboarding build listed here) routes to
    // this projects answer via exact-signature match — same rationale as the ai-products aliases.
    aliases: ["what have you shipped", "show me your projects", "what have you made", "tell me about velora"],
    keywords: [
      { term: "built", weight: 2 },
      { term: "teachspark", weight: 1 },
      { term: "velora", weight: 1 },
    ],
    answer:
      'Since August 2026 I\'ve shipped TeachSpark (a WhatsApp bot that generates differentiated worksheets for Indian K–12 teachers), RailCite (a cite-or-refuse assistant over Indian Railways circulars), and two vendor-onboarding products, Nuptis and Velora, in nine days. Smaller live builds include Tegaki, Pratyasa, a PWA arcade cabinet and a scroll-film portfolio. Cubicle, a multi-agent "AI team", is built but not yet launched.',
    evidence: [
      { label: "TeachSpark", href: "/work/teachspark" },
      { label: "RailCite", href: "/work/railcite" },
      { label: "Nuptis → Velora", href: "/work/velora" },
    ],
    sources: [
      { id: "TS-README-3", label: "TeachSpark README", ref: "TS/README.md:3", inventory: "§9" },
      { id: "CS5-DISCOVERY-PRD", label: "RailCite Discovery PRD", ref: "CS5/Discovery-PRD.md L3-5", inventory: "§9" },
      { id: "CS3-LINKEDIN-DAY9", label: "Nine-day build series", ref: "CS3/Case-Study-3-LinkedIn-9-Day-Series.docx Day 9", inventory: "§9" },
      { id: "CS6-QA-13", label: "Cubicle QA report", ref: "CS6/QA-report.md:13", inventory: "§9" },
    ],
    draft: true,
    surface: ["home"],
  },
  {
    id: "discovery",
    prompt: "How do you approach product discovery?",
    aliases: ["how do you do user research", "how do you validate ideas", "how do you find the problem"],
    keywords: [
      { term: "discovery", weight: 2 },
      { term: "built", weight: 1 },
    ],
    answer:
      "I start from a real person and a specific moment — a Sanskrit teacher's evenings, a CCI defending a demurrage decision — then write the hypothesis down with its confidence level before building. In the vendor-onboarding work every claim was tagged [Known]/[Observed]/[Hypothesized]/[Validated]/[Unknown], and in TeachSpark eight assumptions were listed with type and risk before a line of code. When the evidence says kill it, I kill it — Nuptis died on day seven.",
    evidence: [
      { label: "Velora — Discovery", href: "/work/velora#03-discovery" },
      { label: "TeachSpark — Discovery", href: "/work/teachspark#03-discovery" },
      { label: "Thinking notes", href: "/thinking" },
    ],
    sources: [
      { id: "CS4-PITCH-13", label: "TeachSpark pitch", ref: "CS4/pitch/teachspark-pitch.pdf slide 13", inventory: "§9" },
      { id: "CS3-DISCOVERY-PRD", label: "Apparel Vendor Onboarding Discovery PRD", ref: "CS3/Apparel-Vendor-Onboarding-Discovery-PRD.docx", inventory: "§9" },
    ],
    draft: true,
    surface: ["home"],
  },
  {
    id: "ai-products",
    prompt: "What AI products have you worked on?",
    // DES-005 (Stage-8 critique): a visitor naming a flagship AI product by name ("tell me about
    // railcite", "teachspark", "what is railcite") previously fell below the keyword-fraction
    // threshold → the empty state, even though this entry describes both products. These aliases
    // route those phrasings to this same (unchanged) answer via an exact-signature match — they all
    // normalise to the bare product token, so "tell me about X" / "what is X" / "X" resolve alike.
    // No score/threshold change and no new answer text: the no-fabrication invariant is untouched.
    aliases: [
      "which AI things did you build",
      "tell me about your AI work",
      "what genai have you shipped",
      "tell me about railcite",
      "tell me about teachspark",
    ],
    keywords: [
      { term: "ai", weight: 2 },
      { term: "built", weight: 1 },
    ],
    answer:
      "TeachSpark uses Claude Sonnet 5 with structured outputs, vision on teacher-sent photos and a second QC pass to produce worksheets and question papers over WhatsApp. RailCite is a retrieval system over 5,700+ government PDFs (Voyage-3 embeddings, pgvector) with extractive Claude synthesis and a validator that drops any uncited claim. At American Express I led the integration of Devin GenAI into the MARS platform.",
    evidence: [
      { label: "TeachSpark — What I built", href: "/work/teachspark#05-what-i-built" },
      { label: "RailCite — What I built", href: "/work/railcite#05-what-i-built" },
      { label: "Experience", href: "/about#experience" },
    ],
    sources: [
      { id: "TS-ANTHROPIC-PAPER", label: "TeachSpark question-paper adapter", ref: "TS/src/adapters/anthropic-paper.ts", inventory: "§9" },
      { id: "RC-VALIDATE", label: "RailCite citation validator", ref: "RC/lib/validate.ts", inventory: "§9" },
      { id: "RESUME", label: "Résumé", ref: "RESUME", inventory: "§9" },
    ],
    draft: true,
    surface: ["home"],
  },
  {
    id: "most-technical",
    prompt: "Show me your most technical project.",
    aliases: ["what is your hardest build", "which project is the most complex", "what is the deepest engineering you did"],
    keywords: [
      { term: "technical", weight: 2 },
      { term: "railcite", weight: 1.5 },
      { term: "built", weight: 1 },
    ],
    answer:
      "RailCite: a Next.js + Supabase/pgvector RAG pipeline that ingests and OCRs thousands of scanned railway circulars nightly, classifies query domain with Haiku, retrieves k=8 above a calibrated 0.32 threshold, and forces Claude into an `answered|refused` tool schema whose citations are validated before display. It runs live with 5,760 documents and 14,406 chunks (as of 15 Sep 2026) and 345 passing tests.",
    evidence: [
      { label: "RailCite", href: "/work/railcite" },
      { label: "railcite.vercel.app", href: "https://railcite.vercel.app" },
      { label: "RailCite — Evaluation", href: "/work/railcite#06-evaluation" },
    ],
    sources: [
      { id: "RC-QUERY-ROUTE", label: "RailCite query route", ref: "RC/app/api/query/route.ts", inventory: "§9" },
      { id: "RC-CALIBRATE", label: "RailCite threshold calibration", ref: "RC/scripts/calibrate.ts", inventory: "§9" },
    ],
    draft: true,
    surface: ["home"],
  },
  {
    id: "impact",
    prompt: "What impact have you created?",
    aliases: ["what results have you delivered", "show me your numbers", "what outcomes have you achieved"],
    keywords: [
      { term: "impact", weight: 2 },
      { term: "built", weight: 1 },
    ],
    answer:
      "At American Express I own the migration roadmap for 35+ Accounts Receivable capabilities — 180+ stories across four Agile teams — with a 30% reduction in feature delivery cycle time (self-reported). TeachSpark's first-week pilot (24 Aug 2026, test handsets excluded) took 17 teachers onto WhatsApp, activated 8, and saved a median 37.5 minutes per teacher by their own report. RailCite keeps 5,760 government documents searchable with zero invented citations by construction.",
    evidence: [
      { label: "Impact", href: "/about#impact" },
      { label: "TeachSpark — Outcome", href: "/work/teachspark#07-outcome" },
      { label: "RailCite — Outcome", href: "/work/railcite#07-outcome" },
    ],
    sources: [
      { id: "RESUME", label: "Résumé", ref: "RESUME", inventory: "§9" },
      { id: "CS4-FINAL-PRD-7", label: "TeachSpark Final PRD §7", ref: "CS4/docs/final-prd.docx §7", inventory: "§9" },
      { id: "RC-VALIDATE", label: "RailCite citation validator", ref: "RC/lib/validate.ts", inventory: "§9" },
    ],
    draft: true,
    surface: ["home"],
  },

  /* ── panel (6) ────────────────────────────────────────────── */
  {
    id: "pm",
    prompt: "What makes Tushar a product manager?",
    aliases: ["why are you a product manager", "what qualifies you as a PM", "why should I hire you as a PM"],
    keywords: [
      { term: "pm", weight: 2 },
      { term: "experience", weight: 1 },
    ],
    // §9 sanctioned edit 1: "Ten years" → "7+ years" (§9 note; resume wording).
    answer:
      "7+ years across product and delivery — Godrej Smartnet, Quantiphi's GCP programs, Shellkode, and now Senior Product Manager at American Express — plus a habit of building the thing myself to test the idea. I write the hypothesis before the feature, publish smaller honest numbers over bigger fake ones, and design refusal as a success state when trust is the product.",
    evidence: [
      { label: "About", href: "/about" },
      { label: "Thinking notes", href: "/thinking" },
      { label: "Projects", href: "/projects" },
    ],
    sources: [
      { id: "RESUME", label: "Résumé (2016–present)", ref: "RESUME timeline 2016–present", inventory: "§9" },
      { id: "TS-9DAY-SERIES", label: "TeachSpark 9-day build series", ref: "TS/docs/linkedin/9-day-build-series.md", inventory: "§9" },
      { id: "CS5-DESIGN-21", label: "RailCite Design.md", ref: "CS5/Design.md L21-24", inventory: "§9" },
    ],
    draft: true,
    surface: ["panel"],
  },
  {
    id: "enterprise",
    prompt: "Show enterprise experience",
    aliases: ["what corporate work have you done", "tell me about American Express", "your enterprise career"],
    keywords: [
      { term: "enterprise", weight: 2 },
      { term: "experience", weight: 1 },
    ],
    answer:
      "American Express (via IntraEdge), 2026–present: Senior PM for Accounts Receivable, migrating 35+ capabilities from the legacy Triumph platform to the cloud-native MARS microservices platform and championing Devin GenAI adoption. Quantiphi (2022–26): GCP programs including DynamoDB→Cloud Spanner migrations and HIPAA-compliant healthcare data migration. Godrej Infotech (2016–18): Assistant PM on the Smartnet platform, 12 features in 11 months.",
    evidence: [
      { label: "Experience", href: "/about#experience" },
      // §9 sanctioned edit 2: `?tab=enterprise` → `?filter=enterprise` (E-2).
      // TKT-101: the project index moved to /projects.
      { label: "Projects — Enterprise", href: "/projects?filter=enterprise" },
    ],
    sources: [{ id: "RESUME", label: "Résumé", ref: "RESUME", inventory: "§9" }],
    draft: true,
    surface: ["panel"],
  },
  {
    id: "skills",
    prompt: "Strongest product skills",
    aliases: ["what are you best at", "what are your strengths", "what are your core competencies"],
    keywords: [
      { term: "skills", weight: 2 },
      { term: "built", weight: 1 },
    ],
    answer:
      "Discovery and hypothesis framing (confidence-tagged PRDs, assumption tables), AI product design where trust is the feature (cite-or-refuse, QC passes, honest instrumentation), and enterprise delivery at scale (roadmaps across four Agile teams, program governance on GCP/AWS).",
    evidence: [
      { label: "Capabilities", href: "/about#capabilities" },
      { label: "RailCite", href: "/work/railcite" },
      { label: "TeachSpark — Evaluation", href: "/work/teachspark#06-evaluation" },
    ],
    sources: [
      { id: "RESUME-COMPETENCIES", label: "Résumé — Core Competencies", ref: "RESUME Core Competencies", inventory: "§9" },
      { id: "CS5-DESIGN", label: "RailCite Design.md", ref: "CS5/Design.md", inventory: "§9" },
      { id: "CS4-FINAL-PRD", label: "TeachSpark Final PRD", ref: "CS4/docs/final-prd.docx", inventory: "§9" },
    ],
    draft: true,
    surface: ["panel"],
  },
  {
    id: "learned",
    prompt: "What did you learn when an assumption failed?",
    aliases: ["when have you been wrong about a product", "tell me about a failed assumption", "what did you learn from a pivot"],
    keywords: [
      { term: "learned", weight: 2 },
      { term: "discovery", weight: 1 },
    ],
    // Authored from §8.1 (is_test retro), §8.4 (Nuptis kill), §8.2 (threshold recalibration).
    answer:
      "When I added an `is_test` flag to TeachSpark and excluded my own handsets the day before submission, activated teachers dropped from 10 to 8 and median time saved fell from 37.5 minutes to 30 — I shipped the smaller, honest number. On the vendor-onboarding work I killed Nuptis on day seven when it had no real pilot data and rebuilt it as Velora. And RailCite taught me that staleness is a correctness bug, not a missing feature — I recalibrated its retrieval threshold from 0.45 to 0.32 against real queries.",
    evidence: [
      { label: "TeachSpark — Evaluation", href: "/work/teachspark#06-evaluation" },
      { label: "Velora — Outcome", href: "/work/velora#07-outcome" },
      { label: "RailCite — Evaluation", href: "/work/railcite#06-evaluation" },
    ],
    sources: [
      { id: "TS-LINKEDIN-POST9", label: "TeachSpark 9-day build series (Post 9)", ref: "TS/docs/linkedin/9-day-build-series.md", inventory: "§8.1" },
      { id: "CS3-LINKEDIN-DAY7", label: "Nine-day build series (Day 7)", ref: "CS3/Case-Study-3-LinkedIn-9-Day-Series.docx Day 7", inventory: "§8.4" },
      { id: "RC-BUILD-LEDGER", label: "RailCite build ledger", ref: "CS5/docs/superpowers/BUILD-LEDGER.md L253", inventory: "§8.2" },
    ],
    draft: true,
    surface: ["panel"],
  },
  {
    id: "evaluate",
    prompt: "How do you evaluate an AI product?",
    aliases: ["how do you test an AI product", "how do you measure AI quality", "how do you evaluate an AI feature"],
    keywords: [
      { term: "evaluate", weight: 2 },
      { term: "ai", weight: 1 },
    ],
    // Authored from §8.2 (calibration + validator + refusal) and §8.1 (QA gates + instrumentation).
    answer:
      "I define what “good” means before building, then measure against it. RailCite calibrated its retrieval threshold on 5 relevant and 3 irrelevant queries, validates every citation so any uncited claim is dropped, and treats refusal as a first-class success state; its citation validity is 100% by construction — a structural guarantee, not a measured score. TeachSpark ran phase-by-phase QA gates with 32 event types of pilot instrumentation, and I excluded my own test handsets before reporting activation.",
    evidence: [
      { label: "RailCite — Evaluation", href: "/work/railcite#06-evaluation" },
      { label: "RailCite — What I built", href: "/work/railcite#05-what-i-built" },
      { label: "TeachSpark — Evaluation", href: "/work/teachspark#06-evaluation" },
    ],
    sources: [
      { id: "RC-CALIBRATE", label: "RailCite threshold calibration", ref: "RC/scripts/calibrate.ts", inventory: "§8.2" },
      { id: "RC-VALIDATE", label: "RailCite citation validator", ref: "RC/lib/validate.ts", inventory: "§8.2" },
      { id: "TS-DECK-CONTENT", label: "TeachSpark instrumentation", ref: "TS/docs/investor/deck-content.md:35", inventory: "§8.1" },
    ],
    draft: true,
    surface: ["panel"],
  },
  {
    id: "research",
    prompt: "What is your research background?",
    aliases: ["tell me about your patent", "what are your published papers", "your biosensor research"],
    keywords: [
      { term: "research", weight: 2 },
      { term: "experience", weight: 0.8 },
    ],
    // Authored from §4.7 (patent IN 429867 + inventor order + papers) and §8.8 (device contribution).
    answer:
      "Before product management I was a co-inventor — second of five — on granted Indian patent IN 429867, a low-cost portable electrochemical biosensor for rapid endotoxin detection. The work is published as a 2025 Langmuir paper on a point-of-care sepsis-biomarker aptasensor and a 2023 Soft Matter paper on topological phases in nanoparticle monolayers. On the device I worked across the analyser's electronics and firmware, the Android app, sensor preparation, and validation in blood and food samples.",
    evidence: [
      { label: "Research", href: "/about#research" },
      { label: "Pratyasa", href: "/work/pratyasa" },
      { label: "Langmuir 2025 (DOI)", href: "https://doi.org/10.1021/acs.langmuir.5c00784" },
    ],
    sources: [
      { id: "PT-DISCOVERY-PRD", label: "Pratyasa Discovery PRD §4", ref: "PT/discoveryPRD.md §4 (certificate)", inventory: "§4.7" },
      { id: "PT-ROLE-192", label: "Pratyasa role note", ref: "PT/discoveryPRD.md L192", inventory: "§8.8" },
    ],
    draft: true,
    surface: ["panel"],
  },
];
