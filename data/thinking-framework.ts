import type { ThinkingStageDef } from "./schema";
import { stageTone } from "@/lib/stages";

/**
 * How-I-Think framework data (home-only module, TKT-13). Six stages in CONTENT_INVENTORY §1.5's
 * fixed order: Problem · Insight · Bet · Build · Evaluate · Impact.
 *
 * Each stage carries two structurally distinct kinds of copy:
 *  - `example` (quote / attribution / project / href) — VERIFIED, verbatim from CONTENT_INVENTORY
 *    §1.5, one real project moment per stage. Never paraphrased; `source` is the inventory's
 *    traceability path (never rendered).
 *  - `principle` — a one-line framing of what the stage means in general, independent of any one
 *    project. CONTENT_INVENTORY §1.5 supplies only the sourced `example`, not this framing line, so
 *    every `principle` here is DRAFT, unsigned-off editorial copy rather than a verifiable claim —
 *    `HowIThink` renders a "Draft" tag next to it accordingly (content-gate rule: no fabricated
 *    claims; DRAFT copy must render DRAFT-labelled). None of the six principle lines assert a
 *    specific fact, number, or outcome, so there is nothing in them that could be fabrication —
 *    only the (flagged) editorial voice is unsigned-off.
 *
 * `tone` is read from `lib/stages.ts`'s `stageTone` map (single source of truth, reused by later
 * artifact/badge components — TKT-20/21) rather than repeated here.
 */
export const thinkingFramework: ThinkingStageDef[] = [
  {
    id: "problem",
    label: "Problem",
    tone: stageTone.problem,
    principle:
      "Find the sentence where the current way of doing things quietly costs someone their credibility — that's the problem, not the missing feature.",
    example: {
      quote:
        "A CCI has to defend a demurrage/wharfage decision. Today that means manually walking multiple yearly PDF lists… one wrong/superseded citation damages the inspector's credibility — not the tool's.",
      attribution: "RailCite Discovery PRD",
      project: "railcite",
      href: "/work/railcite#02-problem",
    },
    source: "CS5/Discovery-PRD.md:38-41",
  },
  {
    id: "insight",
    label: "Insight",
    tone: stageTone.insight,
    principle:
      "Look for the idle time between handoffs, not the work itself — that's usually where the real delay is hiding.",
    example: {
      quote:
        "Onboarding routinely takes 15–30 business days, yet almost none of that is active work — it is idle queue-time between cross-functional handoffs.",
      attribution: "Week 4 team research",
      project: "velora",
      href: "/work/velora#03-discovery",
    },
    source: "CS3/CASE STUDY 3 PRD.pdf:p.7",
  },
  {
    id: "bet",
    label: "Bet",
    tone: stageTone.bet,
    principle:
      "Bet on capability over dependency: teach the reusable skill instead of doing the task for someone.",
    example: {
      quote: "Capability, not dependency.",
      attribution: "TeachSpark Solution-Space PRD",
      project: "teachspark",
      href: "/work/teachspark#04-product-bet",
    },
    source: "CS4/Case Study 4 - Solution-Space PRD.docx:§3",
  },
  {
    id: "build",
    label: "Build",
    tone: stageTone.build,
    principle:
      "Design the failure mode on purpose: decide what should refuse to work before deciding what should.",
    example: {
      quote: "Refuse is a first-class success state, never an error.",
      attribution: "RailCite Design.md",
      project: "railcite",
      href: "/work/railcite#05-what-i-built",
    },
    source: "CS5/Design.md:21-24",
  },
  {
    id: "evaluate",
    label: "Evaluate",
    tone: stageTone.evaluate,
    principle:
      "Re-run the evaluation on the version of the data you'd be embarrassed to leave in, not the one that flatters the number.",
    example: {
      quote: "Activated teachers dropped from 10 to 8. Median time saved fell from 37.5 minutes to 30.",
      attribution: "TeachSpark build-series, Post 9",
      project: "teachspark",
      href: "/work/teachspark#06-evaluation",
    },
    source: "TS/docs/linkedin/9-day-build-series.md:Post 9",
  },
  {
    id: "impact",
    label: "Impact",
    tone: stageTone.impact,
    principle: "Report the number with its date and its caveats attached, or don't report it at all.",
    example: {
      quote: "17 teachers joined, 8 activated (47%), median 37.5 min saved (self-report).",
      attribution: "TeachSpark final PRD — pilot snapshot 2026-08-24, test handsets excluded",
      project: "teachspark",
      href: "/work/teachspark#07-outcome",
    },
    source: "CS4/docs/final-prd.docx:§0/§7",
  },
];
