import type { SourceRef, ThinkingChain } from "@/data/schema";
import { teachspark } from "@/data/projects";

/**
 * QA-only fixture for the `/dev/thinking` review board (TKT-21). `teachspark.thinking` is `[]`
 * today — the real 8-node chain is M-005 content-ticket work (TKT-28) — so this board renders an
 * illustrative chain, reusing every already-sourced TeachSpark fact this repo has rather than
 * inventing new claims: `data/thinking-framework.ts`'s three verified, verbatim TeachSpark quotes
 * (TKT-13 — the bet/evaluate/impact stages) plus `teachspark`'s own verbatim `overview` and
 * `tagline` (both already sourced from CONTENT_INVENTORY per data/projects.ts's header). The three
 * stages with no distinct sourced quote yet (observation, hypothesis, prototype) say so plainly,
 * the same "not yet recorded" convention the schema already uses for a genuine content gap
 * (Experience.scale, DemoVideo's "Demo coming") — never paraphrased into an invented specific.
 * Excluded from the sitemap and 404s in production (lib/dev-only.ts); never real, shipped content.
 */

export const SOURCES: SourceRef[] = [
  { id: "TS-README", label: "TeachSpark README", ref: "TS/README.md:3", inventory: "§8.1" },
  { id: "CS4-FINAL-PRD", label: "TeachSpark Final PRD", ref: "CS4/docs/final-prd.docx §7", inventory: "§8.1" },
  {
    id: "CS4-SOLUTION-PRD",
    label: "TeachSpark Solution-Space PRD",
    ref: "CS4/Case Study 4 - Solution-Space PRD.docx:§3",
    inventory: "§8.1",
  },
  {
    id: "TS-BUILD-SERIES",
    label: "TeachSpark build-series, Post 9",
    ref: "TS/docs/linkedin/9-day-build-series.md:Post 9",
    inventory: "§8.1",
  },
];

const NOT_YET_RECORDED = (stage: string): string =>
  `The ${stage} note for TeachSpark is not yet recorded here — it lands with the case-study content ticket (TKT-28).`;

export const THINKING_CHAIN: ThinkingChain = [
  {
    stage: "observation",
    text: NOT_YET_RECORDED("first-observation"),
    source: "TS-README",
  },
  {
    // Verbatim, sourced (data/projects.ts teachspark.overview.thirtySecond[0]).
    stage: "user-problem",
    text: teachspark.overview.thirtySecond[0]!,
    source: "CS4-FINAL-PRD",
    href: "/work/teachspark#02-problem",
  },
  {
    // Verbatim, sourced (data/projects.ts teachspark.tagline).
    stage: "insight",
    text: teachspark.tagline,
    source: "TS-README",
  },
  {
    stage: "hypothesis",
    text: NOT_YET_RECORDED("falsifiable-hypothesis"),
    source: "CS4-SOLUTION-PRD",
  },
  {
    // Verbatim, sourced (data/thinking-framework.ts "bet" stage example, project: teachspark).
    stage: "product-decision",
    text: "Capability, not dependency.",
    source: "CS4-SOLUTION-PRD",
    href: "/work/teachspark#04-product-bet",
  },
  {
    stage: "prototype",
    text: NOT_YET_RECORDED("prototype-capture"),
    source: "TS-README",
  },
  {
    // Verbatim, sourced (data/thinking-framework.ts "evaluate" stage example, project: teachspark).
    stage: "evaluation",
    text: "Activated teachers dropped from 10 to 8. Median time saved fell from 37.5 minutes to 30.",
    source: "TS-BUILD-SERIES",
    href: "/work/teachspark#06-evaluation",
  },
  {
    // Verbatim, sourced (data/thinking-framework.ts "impact" stage example, project: teachspark).
    stage: "outcome",
    text: "17 teachers joined, 8 activated (47%), median 37.5 min saved (self-report).",
    source: "CS4-FINAL-PRD",
    href: "/work/teachspark#07-outcome",
  },
];
