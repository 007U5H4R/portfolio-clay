import { Handshake, MessageSquareText, ShieldCheck, type LucideIcon } from "lucide-react";
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

/** Featured trio, rank order: TeachSpark (1, large) · RailCite (2) · Nuptis → Velora (3). */
export const projects: Project[] = [teachspark, railcite, velora];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
