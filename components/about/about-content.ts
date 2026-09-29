import { awards, papers, patent } from "@/data/credentials";
import type { AboutArtId } from "./about-art";

/**
 * `/about` copy (TASK-136 — Tushar's About redesign spec 2026-09-29,
 * `docs/redesign-mockups/m-009/tushar-2026-09-29/about-redesign-spec.md`). ABOUT = who Tushar is; the
 * employer-by-employer record (titles, dates, bullets, metrics) lives on `/work` (Experience), the badges
 * on `/certifications`.
 *
 * The headings and card lines are the spec's approved wording (§2, §7–§10, §17, §19, §24, §27, §34), and
 * each heading alone tells the story (§60). Every fact is read from `data/*` — the reference image's
 * companies, awards, dates and counts are placeholders and never appear here. Company names in the career
 * strip are the four real employers (`data/experience.ts`), grouped by the context they belong to (§13–§16),
 * with no dates or responsibilities.
 */

export const ABOUT_HERO = {
  eyebrow: "About",
  title: "A builder who connects deep tech to real-world impact.",
  /** The words the rust hand-drawn underline sits under (spec reference: under "real-world impact."). */
  underlined: "real-world impact.",
  lead: "From research labs to production systems, I’ve always been drawn to solving complex problems and turning them into products people actually use.",
  /** Spec §5 — two handwritten annotations, visually secondary (aria-hidden, restating the copy). */
  notes: ["Research → products → real-world impact.", "Complex ideas. Real people. Bigger impact."],
} as const;

export interface Chapter {
  id: "builder" | "operator" | "researcher";
  number: string;
  title: string;
  body: string;
  art: AboutArtId;
}

export const CHAPTERS_HEAD = { eyebrow: "Three chapters", title: "The arc of my journey.", note: "Different hats. Same curiosity." } as const;

/** Spec §7–§10 — exactly three chapters, 2–3 sentences each, none about one employer. */
export const CHAPTERS: readonly Chapter[] = [
  {
    id: "builder",
    number: "01",
    title: "Builder",
    body: "Started with machines and research. Learned to go deep, work with ambiguity, and stay curious.",
    art: "chapter-builder",
  },
  {
    id: "operator",
    number: "02",
    title: "Operator",
    body: "Moved into cloud, data and enterprise platforms. Built and shipped at scale with cross-functional teams.",
    art: "chapter-operator",
  },
  {
    id: "researcher",
    number: "03",
    title: "Researcher (Still)",
    body: "Research thinking still shapes how I approach problems — from first principles to real-world constraints.",
    art: "chapter-researcher",
  },
];

export interface Era {
  id: "research" | "cloud" | "enterprise" | "ai";
  name: string;
  /** Spec §17 — one short descriptor per era. */
  descriptor: string;
  /** Spec §13–§16 — the era's focus, in a few words. */
  focus: string;
  /** Small context references (spec §12): the real employers or the research roots, no dates. */
  refs: string;
}

export const CAREER_HEAD = { eyebrow: "Career across contexts", title: "Different problems, common thread." } as const;

/** Eras, not employers (spec §12): Research & Engineering → Cloud & Data → Enterprise Platforms → AI Products. */
export const ERAS: readonly Era[] = [
  {
    id: "research",
    name: "Research & Engineering",
    descriptor: "First principles",
    focus: "Experimentation, technical depth and scientific rigour.",
    refs: "Mechanical engineering · Nanotechnology research",
  },
  {
    id: "cloud",
    name: "Cloud & Data",
    descriptor: "Systems at scale",
    focus: "Data, APIs and cloud modernization, delivered at scale.",
    refs: "Quantiphi · Shellkode",
  },
  {
    id: "enterprise",
    name: "Enterprise Platforms",
    descriptor: "Complex coordination",
    focus: "Modernization, product ownership and many stakeholders.",
    refs: "Godrej Infotech · American Express",
  },
  {
    id: "ai",
    name: "AI Products",
    descriptor: "Fast learning loops",
    focus: "From ambiguity to prototype to real users.",
    refs: "Independent builds · enterprise GenAI",
  },
];

export const RESEARCH_HEAD = {
  eyebrow: "Research & intellectual work",
  title: "From labs to lasting ideas.",
  lead: "Research shaped how I think: start from first principles, test against reality, and write down what you learn.",
} as const;

const granted = patent.granted.slice(-4);

/** Spec §19–§22 — three compact artifacts. Counts, numbers and years come from `data/credentials.ts`. */
export const RESEARCH_ARTIFACTS = [
  {
    id: "nanotech",
    title: "Nanotechnology research",
    meta: undefined,
    body: "Research in materials, sensing and nanoscale systems.",
    art: "research-nano" as AboutArtId,
  },
  {
    id: "patent",
    title: "Granted patent",
    meta: `${patent.number} · co-inventor · granted ${granted}`,
    body: `${patent.title}.`,
    art: "patent-sheet" as AboutArtId,
  },
  {
    id: "publications",
    title: `${papers.length} peer-reviewed papers`,
    meta: undefined,
    body: papers.map((paper) => `${paper.journal.split(",")[0]} ${paper.year}`).join(" · "),
    art: "research-papers" as AboutArtId,
  },
] as const;

export const VALUES_HEAD = {
  eyebrow: "What drives me",
  title: "Curiosity, impact and continuous learning.",
  note: "Same curiosity. Broader horizons.",
} as const;

/** Spec §24 — exactly three principles (the "build useful products" set matches the site's voice). */
export const PRINCIPLES = [
  { id: "questions", icon: "bulb", text: "Ask better questions." },
  { id: "products", icon: "gear", text: "Build useful products." },
  { id: "learning", icon: "leaf", text: "Keep learning and sharing." },
] as const;

export const RECOGNITION_HEAD = {
  eyebrow: "Recognition",
  title: "A few milestones along the way.",
  note: "Progress is a series of small breakthroughs.",
} as const;

/** Spec §27–§28 — only the recognition `data/credentials.ts` records (2–4 items), newest first. */
export const RECOGNITION = awards.map((award, index) => ({ ...award, icon: (["trophy", "star", "ribbon"] as const)[index % 3]! }));

export const ABOUT_CTA = {
  title: "Want the full story with roles, achievements and metrics?",
  primary: { label: "See full experience", href: "/work" },
  secondary: { label: "View certifications", href: "/certifications" },
} as const;
