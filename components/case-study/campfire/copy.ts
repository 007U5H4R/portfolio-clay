import type { NextProjectArt } from "../NextProject";

/**
 * Copy that belongs to the Campfire Board paper-craft layout only (TASK-281, Tushar's brief cf.md + mockups).
 * Facts (10 stages, 1 binary, 3/3 pilot, links, evidence list) come from the case-study record
 * (data/case-studies/campfire-board.ts); this file holds the brief's shorter headings and captions.
 * Dropped from the mockups because the record does not support them: the "AI Agents / Projects / Ideas / Backlog.md"
 * folder labels and the "Local · Build · Organise · Ship" note, "Project A/B/C/N" names, a "Stats" step, any
 * "de-risk" or validation wording beyond the scripted pilot, and every AI-drawn screenshot.
 */
export const HERO = {
  kicker: "CF-01 · BUILT · LIVE DEMO",
  tagline: "Every project. One command centre.",
  lede: "A local-first dashboard for tracking AI build workflows across projects — a personal fork of Backlog.md, reshaped into a cross-project command centre.",
  /** Labels for the three metric cards: record hero proofs 1 and 2, then the pilot proof from the evidence section. */
  metrics: [
    { label: "workflow stages", note: "Discovery → Deployment" },
    { label: "local binary", note: "Nothing to deploy" },
    { label: "pilot checks passed", note: "Scripted, on scratch projects" },
  ],
  chips: ["Local-first", "Open source", "Personal fork", "Built with Bun"],
  shotCaption: "Kanban board · the sample project on the hosted demo",
} as const;

export const NAV = [
  { id: "problem", n: "01", label: "Problem" },
  { id: "product", n: "02", label: "Product" },
  { id: "decisions", n: "03", label: "Decisions" },
  { id: "system", n: "04", label: "System" },
  { id: "evidence", n: "05", label: "Evidence" },
] as const;

export const SECTION: Record<string, { eyebrow: string; headline: string }> = {
  problem: { eyebrow: "The problem", headline: "Many builds. No shared view." },
  product: { eyebrow: "The product", headline: "Board, Gantt, workflow. One place." },
  decisions: { eyebrow: "Decisions", headline: "Fork, don’t rebuild. Keep it local." },
  system: { eyebrow: "How it works", headline: "Markdown on disk. One binary on top." },
  evidence: { eyebrow: "Evidence", headline: "3/3 pilot checks passed." },
};

export const PROBLEM = {
  lede: "Each project kept its tasks in a separate Markdown backlog. The workflow was agent-first and self-contained, but progress across projects was hard to see at once.",
  folders: ["Backlog folder", "Backlog folder", "Backlog folder"],
  notes: ["Separate folders", "Scattered context", "One shared view"],
  hub: "Campfire Board",
} as const;

export const PRODUCT = {
  lede: "Switch projects, move tickets through stages, inspect dependencies, and review workflow progress from one local dashboard.",
  /** Same order as `shots` in the page: Gantt (primary), Kanban, Workflow. */
  tabs: [
    { tab: "Gantt", caption: "See timing and dependencies." },
    { tab: "Kanban", caption: "Track tickets by stage." },
    { tab: "Workflow", caption: "Follow the ten-stage build." },
  ],
} as const;

export const DECISIONS = [
  { title: "Fork Backlog.md", copy: "Build on a Markdown-native, agent-first foundation instead of starting from scratch.", note: "Credit the upstream project and preserve the applicable licence attribution." },
  { title: "One local binary", copy: "Launch locally in Chrome over your own folders. No hosted service to deploy.", note: "" },
] as const;

export const SYSTEM = {
  lede: "Campfire Board reads local project folders and brings them into one interactive workspace.",
  steps: [
    { label: "projects.json", note: "Project manifest" },
    { label: "Markdown backlogs", note: "Tasks on disk" },
    { label: "Bun CLI", note: "One local binary" },
    { label: "Embedded React UI", note: "Served on loopback" },
    { label: "Board · Gantt · Workflow", note: "View and track work" },
  ],
} as const;

export const EVIDENCE = {
  lede: "Scripted at the API level against two scratch projects, 6 Sep 2026.",
  checks: [
    { title: "Project switching", copy: "Switch between projects cleanly." },
    { title: "Ticket moves", copy: "Scripted ticket moves across stages." },
    { title: "Project isolation", copy: "Each project stays self-contained." },
  ],
  caveat: "Tested on throwaway projects; not yet validated on real projects.",
} as const;

export const SOURCES = { headline: "Built from real artefacts.", chip: "Sources" } as const;

/** Encoded sizes (scripts/campfire-art/encode.mjs). */
export const ART = { hero: { light: { w: 1600, h: 1063 }, dark: { w: 1600, h: 1063 } } } as const;

/** The next band's Slag City artwork: a 1990s arcade cabinet in folded paper, painted on each theme's band colour. */
export const SLAG_NEXT_ART: NextProjectArt = {
  light: "/media/case-studies/campfire-board/art/slag-next-light.webp",
  dark: "/media/case-studies/campfire-board/art/slag-next-dark.webp",
  alt: "A paper-craft miniature of a 1990s arcade cabinet with a pixel-block screen, joystick and coloured buttons, in front of a small night skyline of folded-paper buildings.",
  width: 1600,
  height: 1063,
};

/** The supporting line under the band title (TASK-279 `line` prop). */
export const NEXT_LINE = "A 90’s arcade game.";
