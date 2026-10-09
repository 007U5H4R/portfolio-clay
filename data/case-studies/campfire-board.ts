import type { z } from "zod";
import type { CaseStudy } from "../schema";

/**
 * Campfire Board — one local dashboard for every build (TASK-130; audit in
 * docs/reports/TASK-130/campfire-board.md). A personal fork of Backlog.md (Alex Gavrilescu and
 * contributors, MIT): the page credits it and never implies Tushar wrote Backlog.md. A local tool
 * with a hosted live demo of a sample project (TASK-188); no users, metrics or learnings recorded.
 */
export const campfireCase: z.input<typeof CaseStudy> = {
  slug: "campfire-board",
  theme: {
    key: "campfire-board",
    metaphor: "A night campsite planning wall: dark ground, index-card columns, ember-glow numerals",
    accents: ["terracotta", "note", "navy-2"],
  },
  story: "One dashboard for every project",
  extraSources: [
    { id: "CF-SCREENS", label: "Campfire Board screenshots", ref: "CF/docs/screenshots/{kanban,gantt,workflow}.jpg", inventory: "§8.12" },
  ],
  hero: {
    tagline: "One dashboard, every project.",
    proposition:
      "A local-first, multi-project management dashboard for the AI build workflow — a personal fork of Backlog.md, reshaped into a cross-project command centre.",
    proofs: [
      { value: "10", label: "build-workflow stages, Discovery to Deployment", kind: "structural", source: "CF-README" },
      { value: "1", label: "local binary — nothing to deploy", kind: "structural", source: "CF-README" },
    ],
    media: {
      video: "pitch",
      poster: {
        src: "/media/case-studies/campfire-board/kanban.webp",
        alt: "Campfire Board's Kanban board for a project, with To Do, In Progress, In Review, Blocked and Done columns and ticket cards.",
        width: 1400,
        height: 540,
        frame: "plain",
        provenance: "docs/case-study-sources/campfire-board/kanban.jpg ← PM Tools/backlog-md-fork/docs/screenshots/kanban.jpg",
      },
    },
    layout: "split",
  },
  sections: [
    {
      kind: "problem",
      id: "problem",
      nav: "Problem",
      eyebrow: "The problem",
      headline: "Many builds, many folders — no single view.",
      anchors: ["01-context", "02-problem", "03-discovery"],
      context:
        "Each project keeps its tasks as Markdown files in its own backlog folder — agent-first and self-contained, but nothing showed every project at once.",
    },
    {
      kind: "product",
      id: "product",
      nav: "Product",
      eyebrow: "The product",
      headline: "Switch projects; see the board, the Gantt and the workflow.",
      anchors: ["05-what-i-built"],
      summary:
        "A project switcher, a Kanban board with an Execution / Workflow toggle, an hours-axis Gantt with dependency arrows, the ten-stage workflow view, statistics and an in-app artifact viewer.",
      video: "demo",
      poster: {
        src: "/media/case-studies/campfire-board/gantt.webp",
        alt: "Campfire Board's hours-axis Execution Gantt: ticket bars with dependency arrows between them.",
        width: 1000,
        height: 386,
        frame: "plain",
        provenance: "docs/case-study-sources/campfire-board/gantt.jpg ← PM Tools/backlog-md-fork/docs/screenshots/gantt.jpg",
      },
      source: "CF-SCREENS",
      shots: [
        {
          src: "/media/case-studies/campfire-board/workflow.webp",
          alt: "Campfire Board's Workflow view: the build stages from Product Discovery to Execution as bars on a timeline.",
          width: 1000,
          height: 386,
          frame: "browser",
          caption: "The ten-stage workflow view",
          provenance: "docs/case-study-sources/campfire-board/workflow.jpg ← PM Tools/backlog-md-fork/docs/screenshots/workflow.jpg",
        },
      ],
    },
    {
      kind: "decisions",
      id: "decisions",
      nav: "Decisions",
      eyebrow: "Decisions",
      headline: "Fork, don’t rebuild — and keep it local.",
      anchors: ["04-product-bet"],
      items: [
        { could: "Write a tracker from scratch", chose: "Fork Backlog.md, with credit", because: "It inherits a Markdown-native, agent-first design (Alex Gavrilescu and contributors, MIT licence).", source: "CF-README" },
        { could: "A hosted, multi-user service", chose: "One local binary with the UI inside", because: "Nothing to deploy: launch it locally in Chrome over your own folders.", source: "CF-README" },
      ],
    },
    {
      kind: "system",
      id: "system",
      nav: "System",
      eyebrow: "How it works",
      headline: "Markdown on disk, one binary on top.",
      caption: "How Campfire Board reads your projects",
      source: "CF-README",
      steps: [
        { label: "projects.json", note: "the manifest of projects" },
        { label: "backlog/ folders", note: "tasks as Markdown files" },
        { label: "Bun-compiled CLI", note: "a single local binary" },
        { label: "Embedded React UI", note: "served on a loopback address" },
        { label: "Board, Gantt, Workflow, Stats" },
      ],
    },
    {
      kind: "outcome",
      id: "evidence",
      nav: "Evidence",
      eyebrow: "Evidence",
      headline: "Piloted on scratch projects; not yet on real ones.",
      anchors: ["06-evaluation", "07-outcome", "08-what-i-learned"],
      proofs: [
        { value: "3 / 3", label: "pilot checks passed: switching, ticket moves, isolation", kind: "prototype", asOf: "2026-09-06", source: "CF-PILOT", note: "scripted, at the API level, against two throwaway projects" },
      ],
      gaps: ["No users or usage data are recorded.", "The hosted live demo shows a sample project; the real tool runs on your machine."],
    },
  ],
  evidence: [
    { title: "README", type: "Readme", supports: "Fork credit, features, how it works, the local binary", source: "CF-README" },
    { title: "Pilot checklist", type: "Evaluation", date: "2026-09-06", supports: "Switching, scripted moves and isolation on two scratch projects", source: "CF-PILOT" },
    { title: "Screenshots", type: "Design", supports: "The Kanban, Gantt and Workflow views", source: "CF-SCREENS" },
  ],
};
