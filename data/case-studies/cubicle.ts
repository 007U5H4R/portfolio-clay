import type { z } from "zod";
import type { CaseStudy } from "../schema";

/**
 * Cubicle — visible reasoning creates trust; built, not launched (TASK-130; audit in
 * docs/reports/TASK-130/cubicle.md). Journal layout (Tushar's redesign brief, 2026-09-29): five
 * chapters — problem · product · trust system · learnings · evidence. Highest overclaim-risk record
 * (docs/trace/cubicle.md): no live run, no deployment, no users, a team of six with Tushar's own role
 * unrecorded. The finished-run screen replays the repo's hand-built test fixture and says so. Model
 * names live in the evidence drawer only. Cost (≈ $0.04) and latency (50–75 s) are estimates — they
 * appear only as "not measured".
 */
export const cubicleCase: z.input<typeof CaseStudy> = {
  slug: "cubicle",
  layout: "journal",
  theme: {
    key: "cubicle",
    metaphor: "A 1990s startup cubicle at golden hour: beige CRT, fabric partition spine, folder-tab chapter markers, printed deliverables, office memos",
    accents: ["navy-2", "green-2", "note"],
  },
  story: "Visible reasoning creates trust (built, not launched)",
  extraSources: [
    { id: "CUB-HEADINGS", label: "Cubicle artifact headings", ref: "007U5H4R/cubicle@6779998 lib/prompts/headings.ts (ARTIFACT_ROLE, HEADINGS)", inventory: "§8.3" },
  ],
  hero: {
    tagline: "Your first team fits in a cubicle.",
    proposition: "A solo founder types an idea and watches four AI teammates debate it in the open — then gets the plan.",
    beats: ["One idea.", "Four visible teammates.", "Four artifacts."],
    notes: ["Show the why.", "Debate before deliverables.", "Trust first."],
    proofs: [
      { value: "4", label: "AI teammates", kind: "prototype", source: "CUB-DISCOVERY-PRD", note: "PM · researcher · designer · developer" },
      { value: "4", label: "fixed artifacts", kind: "prototype", source: "CUB-TECHNICAL-PLAN", note: "PRD · scan · landing copy · build plan" },
      { value: "10 days", label: "buildathon", kind: "structural", source: "CUB-BUILDATHON-BRIEF", note: "a team of six, Sept 7 → 16, 2026" },
    ],
    media: {
      src: "/media/case-studies/cubicle/hero-screen.webp",
      alt: "Cubicle's real interface after a run: four teammate desks — PM, Researcher, Designer, Developer — each marked Done, above the PRD they wrote.",
      width: 704,
      height: 528,
      frame: "plain",
      provenance: "docs/case-study-sources/cubicle/office-replay.jpg (4:3 crop) ← 007U5H4R/cubicle@6779998 /dev/office replaying the hand-built test fixture",
    },
    scene: { src: "/media/case-studies/cubicle/hero-office.svg", width: 1200, height: 960 },
    layout: "split",
  },
  sections: [
    {
      kind: "problem",
      id: "problem",
      nav: "Problem",
      eyebrow: "The problem",
      headline: "Solo builders have no team — so ideas die before the first artifact.",
      anchors: ["01-context", "02-problem", "03-discovery"],
      context: "AI tools answer in one generic voice and hide their reasoning. Nobody shows the “why”.",
      flow: {
        caption: "What a solo founder does today",
        source: "CUB-DISCOVERY-PRD",
        steps: [
          { label: "An idea" },
          { label: "A generic AI prompt" },
          { label: "A generic PRD" },
          { label: "Low trust" },
          { label: "Nothing shipped", note: "never sent to anyone" },
        ],
      },
      quote: {
        text: "He has pasted the idea into ChatGPT three times and got three slightly different, equally generic PRDs that he never sent to anyone.",
        attribution: "Aarav, the target persona — Discovery PRD",
        source: "CUB-DISCOVERY-PRD",
      },
    },
    {
      kind: "product",
      id: "product",
      nav: "Product",
      eyebrow: "The product",
      headline: "Type an idea. Watch the team argue. Get four artifacts.",
      summary: "The debate is the product: every proposal and objection is on screen before a deliverable is written.",
      source: "CUB-TECHNICAL-PLAN",
      flow: {
        caption: "One run, as designed",
        source: "CUB-TECHNICAL-PLAN",
        steps: [
          { label: "Idea" },
          { label: "Orchestrator", note: "picks who speaks" },
          { label: "Team debate", note: "PM · research · design · dev" },
          { label: "Stop rule" },
          { label: "4 artifacts" },
        ],
      },
      shots: [
        {
          src: "/media/case-studies/cubicle/home.webp",
          alt: "Cubicle's home screen: “Your first team fits in a cubicle.” above a “What are you building?” box, with four desks — PM, Researcher, Designer, Developer — each marked Ready.",
          width: 720,
          height: 596,
          frame: "browser",
          caption: "Idle: waiting for an idea",
          provenance: "docs/case-study-sources/cubicle/home-idle.jpg ← run locally from 007U5H4R/cubicle@6779998 (no keys, no database)",
        },
        {
          src: "/media/case-studies/cubicle/office-replay.webp",
          alt: "Cubicle after a run: all four desks marked Done above a one-page PRD with Problem, Who it is for, Proposed solution, v1 scope, One success metric and The open question we argued about.",
          width: 704,
          height: 660,
          frame: "browser",
          caption: "Done: the real UI replaying the repo’s test fixture — not a live run",
          provenance: "docs/case-study-sources/cubicle/office-replay.jpg ← 007U5H4R/cubicle@6779998 /dev/office, hand-built fixture tests/replay/fixtures/run-001.json",
        },
      ],
      outputs: [
        { name: "PRD", owner: "PM", lines: ["Problem", "Who it is for", "Proposed solution", "v1 scope: in / out", "One success metric", "The open question we argued about"], source: "CUB-HEADINGS" },
        { name: "Competitor scan", owner: "Researcher", lines: ["Three competitors", "What this means for positioning", "Confidence note"], source: "CUB-HEADINGS" },
        { name: "Landing copy", owner: "Designer", lines: ["Headline", "Subheadline", "Three benefits", "Call to action", "Two objections, answered"], source: "CUB-HEADINGS" },
        { name: "Build plan", owner: "Developer", lines: ["Smallest v1 slice", "Suggested stack", "Five steps with rough time", "What we cut and why", "Riskiest assumption to test first"], source: "CUB-HEADINGS" },
      ],
    },
    {
      kind: "system",
      id: "system",
      nav: "Trust system",
      eyebrow: "Trust system",
      headline: "Trust first. Ownership second. Autonomy last.",
      anchors: ["04-product-bet", "05-what-i-built"],
      ladder: ["Trust", "Ownership", "Autonomy"],
      decision: {
        could: "Maximum agent autonomy",
        chose: "Visible debate first",
        because: "Founders need to see the reasoning before they hand over ownership.",
        source: "CUB-DISCOVERY-PRD",
      },
      caption: "How one run moves through Cubicle",
      source: "CUB-TECHNICAL-PLAN",
      steps: [
        { label: "Idea", note: "typed by the founder" },
        { label: "Orchestrator", note: "picks the next speaker" },
        { label: "4 role agents", note: "propose · question · object" },
        { label: "Stop rules", note: "6 messages · 45 s" },
        { label: "4 artifacts", note: "written in parallel" },
        { label: "Database", note: "every message saved" },
        { label: "Browser", note: "a live mirror" },
      ],
      rules: [
        "The debate is bounded.",
        "Structured outputs are validated.",
        "Competitor search may say “unverified”.",
        "The database is the source of truth.",
      ],
    },
    {
      kind: "learnings",
      id: "learnings",
      nav: "Learnings",
      eyebrow: "Key learnings",
      headline: "Three lessons from building Cubicle.",
      anchors: ["08-what-i-learned"],
      items: [
        { title: "Visible reasoning creates trust", body: "The product’s bet: a founder trusts a plan they watched being argued. Untested with users.", source: "CUB-DISCOVERY-PRD" },
        { title: "Bounded debate beats endless chat", body: "Stop rules and four fixed artifacts keep a run’s cost and time bounded.", source: "CUB-TECHNICAL-PLAN" },
        { title: "Read the diff, not only green checks", body: "The two most important defects were found by reading the reasoning, not by any test.", source: "CUB-LESSON-LEARNT" },
      ],
    },
    {
      kind: "outcome",
      id: "evidence",
      nav: "Evidence",
      eyebrow: "Evidence",
      headline: "Built and tested offline — not launched.",
      anchors: ["06-evaluation", "07-outcome"],
      intro: "The QA report’s verdict: “CONDITIONALLY READY — STEPS REQUIRED”.",
      proofs: [
        { value: "326", label: "automated tests passing", kind: "measured", asOf: "2026-09-12", source: "CUB-QA-REPORT", note: "3 skipped; typecheck, lint and audit clean in CI" },
        { value: "29 / 97", label: "test cases passed", kind: "measured", asOf: "2026-09-12", source: "CUB-QA-REPORT", note: "17 blocked · 48 planned" },
        { value: "0", label: "test cases failed", kind: "measured", asOf: "2026-09-12", source: "CUB-QA-REPORT" },
      ],
      gaps: [
        "A real four-agent run on a live model",
        "Users or usage",
        "Live latency (50–75 s is an estimate)",
        "Real cost (≈ $0.04 a run is an estimate)",
      ],
      stamp: ["Prototype", "Not launched"],
    },
  ],
  evidence: [
    { title: "Discovery PRD", type: "PRD", date: "2026-09-08", supports: "The problem, the Aarav persona, the gap insight and the trust-first sequencing bet", source: "CUB-DISCOVERY-PRD" },
    { title: "Research notes", type: "Research", supports: "46 secondary sources, tagged High/Medium/Low", source: "CUB-RESEARCH-NOTES" },
    { title: "Technical plan", type: "Architecture", date: "2026-09-09", supports: "The streaming route, debate protocol, stop rules and the database as the source of truth", source: "CUB-TECHNICAL-PLAN" },
    { title: "Decisions log", type: "Design", supports: "Decisions S1–S6", source: "CUB-DECISIONS" },
    { title: "package.json + gateway", type: "Code", supports: "Gemini Flash (agents) and Flash-Lite (orchestrator); the unverified-search fallback", source: "CUB-PACKAGE-JSON" },
    { title: "Artifact headings", type: "Code", supports: "Each artifact’s owner and its fixed headings", source: "CUB-HEADINGS" },
    { title: "QA report", type: "Evaluation", date: "2026-09-12", supports: "326 tests; 97 TC rows (29 pass, 17 blocked, 48 planned, 0 fail); “CONDITIONALLY READY”", source: "CUB-QA-REPORT" },
    { title: "HANDOFF", type: "Build ledger", supports: "Offline build finished; the first real run never happened", source: "CUB-HANDOFF" },
    { title: "Lessons learnt", type: "Build ledger", date: "2026-09-12", supports: "L8: read the diff", source: "CUB-LESSON-LEARNT" },
    { title: "Buildathon brief", type: "Research", supports: "A team of six, ten days", source: "CUB-BUILDATHON-BRIEF" },
  ],
};
