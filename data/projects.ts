import { MessageSquareText, type LucideIcon } from "lucide-react";
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

export const projects: Project[] = [teachspark];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
