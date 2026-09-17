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
  metrics: [],
  overview: {
    thirtySecond: [
      "School teachers (25–40, limited technical training) want to use AI to save time and teach more effectively, but existing resources are generic, fragmented, and disconnected from their classroom context.",
    ],
    deepDive: false,
  },
  chapters: EMPTY_CHAPTERS,
  thinking: [],
  learnings: [],
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
      ref: "CS4/docs/final-prd.docx §7",
      inventory: "§8.1",
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
