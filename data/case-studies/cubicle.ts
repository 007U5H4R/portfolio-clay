import type { z } from "zod";
import type { CaseStudy } from "../schema";

/**
 * Cubicle — visible collaboration, built but not launched (TASK-130; audit in
 * docs/reports/TASK-130/cubicle.md). Highest overclaim-risk record (docs/trace/cubicle.md): no live
 * run, no deployment, no users, a team of six with Tushar's own role unrecorded. Cost (~$0.04) and
 * latency (50–75 s) are Solution-PRD estimates — prose in the gaps, never a proof card.
 */
export const cubicleCase: z.input<typeof CaseStudy> = {
  slug: "cubicle",
  theme: {
    key: "cubicle",
    metaphor: "Office operating system / workbench: a retro monitor bezel, system-state pills with LEDs, pinned task cards",
    accents: ["navy-2", "green-2", "note"],
  },
  story: "Visible collaboration (built, not launched)",
  hero: {
    tagline: "Your first team fits in a cubicle.",
    proposition:
      "A solo founder types an idea and watches four AI teammates — PM, researcher, designer, developer — debate it in the open, then produce a PRD, a competitor scan, landing copy and a build plan.",
    proofs: [
      { value: "4", label: "AI teammates debating in the open", kind: "prototype", source: "CUB-DISCOVERY-PRD" },
      { value: "4", label: "fixed artifacts from every run", kind: "prototype", source: "CUB-TECHNICAL-PLAN" },
      { value: "10 days", label: "a buildathon, team of six", kind: "structural", source: "CUB-BUILDATHON-BRIEF", note: "Sept 7 → 16, 2026" },
    ],
    media: {
      src: "/media/illustrations/covers/cover-cubicle.svg",
      alt: "Illustration of a beige 1990s computer monitor in a navy office cubicle at golden hour, its screen split into four coloured teammate panes with four matching speech bubbles rising above it, pinned index cards joined by string, a wall clock, a plant and four printouts on the desk.",
      width: 1600,
      height: 900,
      frame: "plain",
      provenance: "TASK-127 hand-authored cover, scripts/portfolio-art/scenes/cubicle (no product screenshots exist)",
    },
    layout: "split-reverse",
  },
  sections: [
    {
      kind: "problem",
      id: "problem",
      nav: "Problem",
      eyebrow: "The problem",
      headline: "Solo builders have no team — so ideas die before the first artifact.",
      anchors: ["01-context", "02-problem"],
      context:
        "The AI tools that could fill the gap speak in one generic voice or hide their work, so the founder can’t trust the output.",
      quote: {
        text: "He has pasted the idea into ChatGPT three times and got three slightly different, equally generic PRDs that he never sent to anyone.",
        attribution: "“Aarav”, the target persona in the Discovery PRD",
        source: "CUB-DISCOVERY-PRD",
      },
    },
    {
      kind: "research",
      id: "insight",
      nav: "Insight",
      eyebrow: "The gap",
      headline: "Nobody shows the “why”.",
      anchors: ["03-discovery"],
      intro:
        "Six problem spaces scored against the brief, 46 secondary sources — and no primary interviews.",
      quotes: [
        { text: "Nobody makes the collaboration visible. The word ‘why’ is missing from the whole table. That is the gap.", attribution: "Discovery PRD", source: "CUB-DISCOVERY-PRD" },
      ],
    },
    {
      kind: "product",
      id: "product",
      nav: "Product",
      eyebrow: "The product",
      headline: "Type an idea. Watch the team argue. Get four artifacts.",
      summary:
        "The debate is the product: every proposal and objection is visible before the deliverables are written.",
      source: "CUB-TECHNICAL-PLAN",
      flow: {
        caption: "One run, as designed",
        source: "CUB-TECHNICAL-PLAN",
        steps: [
          { label: "Type a product idea" },
          { label: "An orchestrator picks who speaks" },
          { label: "Four teammates debate" },
          { label: "A stop rule ends it" },
          { label: "Four artifacts in parallel" },
          { label: "Share by link" },
        ],
      },
      states: [
        { tone: "neutral", title: "What teammates can say", lines: ["propose · question · objection", "agree · done"] },
        { tone: "yes", title: "What every run produces", lines: ["A one-page PRD", "A competitor scan", "Landing-page copy", "A build plan"] },
      ],
    },
    {
      kind: "decisions",
      id: "decisions",
      nav: "Decisions",
      eyebrow: "Product decisions",
      headline: "Trust first, ownership second, autonomy last.",
      anchors: ["04-product-bet"],
      items: [
        {
          could: "Lead with maximum agent autonomy",
          chose: "Earn trust first with a visible debate",
          because: "Founders won’t hand ownership to agents they don’t yet trust — the reverse of how the red ocean sequences it.",
          source: "CUB-DISCOVERY-PRD",
        },
        {
          could: "An open-ended chat with no deliverable",
          chose: "A bounded debate, then four fixed artifacts",
          because: "Fixed artifacts make the 90-second promise checkable and keep cost and time bounded.",
          source: "CUB-TECHNICAL-PLAN",
        },
        {
          could: "Ground every call in web search",
          chose: "Search only for the competitor scan",
          because: "When search is down, the scan says so: “From memory, unverified — could not reach search.”",
          source: "CUB-PACKAGE-JSON",
        },
      ],
    },
    {
      kind: "system",
      id: "system",
      nav: "System",
      eyebrow: "How it works",
      headline: "The database is the truth; the stream is a convenience.",
      anchors: ["05-what-i-built"],
      caption: "One run through Cubicle’s single streaming route",
      source: "CUB-TECHNICAL-PLAN",
      steps: [
        { label: "POST /api/runs", note: "one streaming route" },
        { label: "Orchestrator", note: "Gemini Flash-Lite picks the next speaker" },
        { label: "Four role agents", note: "Gemini Flash, speech-act envelopes" },
        { label: "Stop rules", note: "6 messages · 45 s · 70% tokens · repeats" },
        { label: "Four artifact calls", note: "in parallel" },
        { label: "Postgres", note: "every message saved as it happens" },
        { label: "Browser", note: "mirrored over a live stream" },
      ],
      rules: [
        "One gateway module is the only code that talks to the model.",
        "Structured output is validated before it is saved.",
        "Search grounding is limited to the competitor scan.",
      ],
    },
    {
      kind: "outcome",
      id: "evidence",
      nav: "Evidence",
      eyebrow: "Evidence",
      headline: "Built and tested offline — not launched.",
      anchors: ["06-evaluation", "07-outcome"],
      intro: "The QA report’s call: “CONDITIONALLY READY — STEPS REQUIRED”.",
      proofs: [
        { value: "326", label: "automated tests passing", kind: "measured", asOf: "2026-09-12", source: "CUB-QA-REPORT", note: "3 skipped; typecheck, lint and audit clean in CI" },
        { value: "29 / 97", label: "test cases passed; 17 blocked, 48 planned, 0 failed", kind: "measured", asOf: "2026-09-12", source: "CUB-QA-REPORT" },
      ],
      gaps: [
        "The real four-agent run has never executed against a live model or database.",
        "No deployment and no users; the ≈ $0.04 cost and 50–75 s latency are estimates.",
        "A team build of six — Tushar’s own named role was never recorded.",
      ],
    },
    {
      kind: "learnings",
      id: "learnings",
      nav: "Learnings",
      eyebrow: "What I learned",
      headline: "Green gates aren’t the whole review.",
      anchors: ["08-what-i-learned"],
      items: [
        { title: "Don’t trust jsdom with layout", body: "Pull geometry into pure functions, test those, and check the render in a real browser.", source: "CUB-LESSON-LEARNT" },
        { title: "Harness on real fixtures", body: "Mount every new component into a client-only dev harness that replays recorded runs.", source: "CUB-LESSON-LEARNT" },
        { title: "Read the diff", body: "The two most important defects were found by reading the reasoning, not by any test.", source: "CUB-LESSON-LEARNT" },
      ],
    },
  ],
  evidence: [
    { title: "Discovery PRD", type: "PRD", date: "2026-09-08", supports: "The problem, the Aarav persona, the gap insight and the sequencing bet", source: "CUB-DISCOVERY-PRD" },
    { title: "Research notes", type: "Research", supports: "46 secondary sources, tagged High/Medium/Low", source: "CUB-RESEARCH-NOTES" },
    { title: "Technical plan", type: "Architecture", date: "2026-09-09", supports: "The streaming route, debate protocol and stop rules", source: "CUB-TECHNICAL-PLAN" },
    { title: "Decisions log", type: "Design", supports: "Decisions S1–S6", source: "CUB-DECISIONS" },
    { title: "package.json + gateway", type: "Code", supports: "Gemini models and the unverified-search fallback", source: "CUB-PACKAGE-JSON" },
    { title: "QA report", type: "Evaluation", date: "2026-09-12", supports: "326 tests, 97 TC rows, QA gates, “CONDITIONALLY READY”", source: "CUB-QA-REPORT" },
    { title: "HANDOFF", type: "Build ledger", supports: "Offline build finished; the first real run never happened", source: "CUB-HANDOFF" },
    { title: "Lessons learnt", type: "Build ledger", date: "2026-09-12", supports: "L1, L2, L8", source: "CUB-LESSON-LEARNT" },
    { title: "Buildathon brief", type: "Research", supports: "A team of six, ten days", source: "CUB-BUILDATHON-BRIEF" },
  ],
};
