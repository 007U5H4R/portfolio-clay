import type { z } from "zod";
import type { CaseStudy } from "../schema";

/**
 * RailCite — the benchmark one-pager (TASK-130; audit + narrative in docs/reports/TASK-130/railcite.md).
 * Dominant story: trust. Every line is curated from the `railcite` record in data/projects.ts,
 * CONTENT_INVENTORY §8.2 and docs/trace/railcite.md; `source` ids resolve in `railcite.sources[]`.
 * "0 invented citations" is structural (enforced by the validator), never presented as measured.
 */
export const railciteCase: z.input<typeof CaseStudy> = {
  slug: "railcite",
  theme: {
    key: "railcite",
    metaphor: "Railway field notebook / official circular archive: engineering paper, a line with station stops, ticket proofs",
    accents: ["rust", "steel", "kraft"],
  },
  story: "Trust",
  hero: {
    tagline: "Research on track.",
    proposition:
      "A trust-first assistant for Indian Railways commercial circulars: it cites the right circular with number, date and supersession lineage — or refuses.",
    proofs: [
      { value: "5,760", label: "documents indexed", kind: "measured", asOf: "2026-09-15", source: "RC-API-STATS", note: "live corpus; a nightly crawl keeps adding circulars" },
      { value: "0", label: "invented citations", kind: "structural", source: "RC-VALIDATE", note: "by construction: the validator drops any citation that doesn't resolve" },
      { value: "68%", label: "of ingested PDFs needed OCR", kind: "measured", asOf: "2026-09-07", source: "RC-FINAL-PRD", note: "3,865 of 5,687 ingested PDFs" },
    ],
    media: {
      video: "pitch",
      poster: {
        src: "/media/illustrations/covers/cover-railcite.svg",
        alt: "Illustration of a cream streamliner with a rust chevron coming down the line at dusk, the sun setting behind it — every third sleeper a ruled document page, a signal ahead showing green, a lit signal box, and a stack of bound volumes with a magnifier in the foreground.",
        width: 1600,
        height: 900,
        frame: "plain",
        provenance: "TASK-127 hand-authored cover, scripts/portfolio-art/scenes/railcite",
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
      headline: "One wrong circular can damage an inspector’s credibility.",
      anchors: ["01-context", "02-problem", "03-discovery"],
      context:
        "A Chief Commercial Inspector has to defend every demurrage or wharfage decision — across years of circulars, scanned PDFs and rules that were quietly superseded.",
      flow: {
        caption: "How a justification gets written today",
        source: "RC-DISCOVERY-PRD",
        steps: [
          { label: "Yearly PDF lists" },
          { label: "Scanned circulars" },
          { label: "Guess the current version" },
          { label: "Check supersession" },
          { label: "Write the justification" },
          { label: "Cite by hand" },
        ],
      },
      quote: {
        text: "Instructions not included “should not be deemed to have been superseded simply because of their non-inclusion.”",
        attribution: "Railway Board Master Circular caveat, quoted in the Discovery PRD",
        source: "RC-DISCOVERY-PRD",
      },
    },
    {
      kind: "product",
      id: "product",
      nav: "Product",
      eyebrow: "The product",
      headline: "Ask, get the right rule — or a clear refusal.",
      summary:
        "The inspector asks in plain language. RailCite answers only from passages that govern the case, and says so when none does.",
      video: "demo",
      poster: {
        src: "/media/case-studies/railcite/demo-poster.svg",
        alt: "Illustration of a desk of ruled circulars under a magnifying glass, one page ticked as cited.",
        width: 1600,
        height: 900,
        frame: "plain",
        provenance: "TASK-130 hand-authored SVG, scripts/case-study-art/assets/railcite.ts",
      },
      source: "RC-SYNTHESIZE",
      shots: [
        {
          src: "/media/case-studies/railcite/answer.webp",
          alt: "RailCite's Ask console: a demurrage-waiver case in the Commercial domain, answered “Cited from 8 passages in the Goods manual” with an inline citation marker [1] and an English/Hindi toggle.",
          width: 850,
          height: 420,
          frame: "browser",
          caption: "A case answered from the Goods manual, cited inline",
          provenance: "docs/case-study-sources/railcite/answer.jpg ← 007U5H4R/railcite@0112a6f docs/screenshots/answer.jpg (README)",
        },
        {
          src: "/media/case-studies/railcite/sources.webp",
          alt: "RailCite's Sources panel: numbered primary-circular cards with circular numbers, dates and page ranges, each marked “Verified text”.",
          width: 928,
          height: 336,
          frame: "browser",
          caption: "Every citation opens its circular, page by page",
          provenance: "docs/case-study-sources/railcite/sources.jpg ← 007U5H4R/railcite@0112a6f docs/screenshots/sources.jpg (README)",
        },
      ],
      states: [
        { tone: "yes", title: "Answered", lines: ["The governing circular, with number and date", "Supersession lineage: which version governs today", "Every citation resolves to a real source"] },
        { tone: "no", title: "Refused", lines: ["No passage governs the case", "Designed as a success state, never an error"] },
      ],
    },
    {
      kind: "decisions",
      id: "decisions",
      nav: "Decisions",
      eyebrow: "Product decisions",
      headline: "Refuse rather than fabricate.",
      anchors: ["04-product-bet"],
      items: [
        {
          could: "Always answer with the best-matching passage",
          chose: "Cite-or-refuse: refusal is a first-class success",
          because: "A confident wrong citation damages the inspector’s credibility, not the tool’s.",
          source: "RC-DESIGN",
        },
        {
          could: "Trust the prompt to behave",
          chose: "Validate every citation in code",
          because: "A validator drops any answer block whose citations don’t resolve; if every block drops, the answer becomes a refusal.",
          source: "RC-VALIDATE",
        },
        {
          could: "Make cross-domain bleed unlikely",
          chose: "Make it impossible with a hard domain filter",
          because: "One commodity’s circular must never reach another’s case: “bleed has to be impossible, not merely unlikely.”",
          source: "RC-FINAL-PRD",
        },
      ],
    },
    {
      kind: "system",
      id: "how-trust-works",
      nav: "System",
      eyebrow: "How trust works",
      headline: "Trust lives in the system, not just the prompt.",
      anchors: ["05-what-i-built"],
      caption: "RailCite’s query pipeline, in seven steps",
      source: "RC-PIPELINE",
      steps: [
        { label: "Question", note: "a signed-in request" },
        { label: "Embed + classify", note: "Voyage-3 vectors; Claude Haiku routes the domain" },
        { label: "Retrieve", note: "top 8 passages, hard domain filter" },
        { label: "Threshold", note: "calibrated 0.45 → 0.32" },
        { label: "Synthesis", note: "Claude Sonnet 5, extractive, answered | refused" },
        { label: "Citation validator", note: "drops citations that don’t resolve" },
        { label: "Answer or refusal", note: "with supersession lineage" },
      ],
      rules: [
        "No resolved citation → the answer block is dropped.",
        "Every block dropped → RailCite refuses.",
        "A nightly crawl keeps the corpus current.",
      ],
    },
    {
      kind: "outcome",
      id: "evidence",
      nav: "Evidence",
      eyebrow: "Evidence",
      headline: "What the records show — and what they don’t.",
      anchors: ["06-evaluation", "07-outcome"],
      intro:
        "The retrieval threshold was calibrated against real queries rather than guessed, and the corpus runs live. Demand-side proof doesn’t exist yet.",
      proofs: [
        { value: "0.32", label: "calibrated relevance threshold", kind: "measured", source: "RC-CALIBRATE", note: "5 relevant + 3 irrelevant queries: irrelevant ≤ 0.25, relevant 0.29–0.66; a nonsense query was refused" },
        { value: "14,406", label: "chunks indexed, live", kind: "measured", asOf: "2026-09-15", source: "RC-API-STATS" },
        { value: "193", label: "supersession lineage links", kind: "measured", asOf: "2026-09-07", source: "RC-FINAL-PRD" },
        { value: "22/40", label: "UX critique of the Ask screen", kind: "measured", asOf: "2026-08-31", source: "RC-IMPECCABLE", note: "one P0, “Flagship starter refuses”; no fix is recorded" },
      ],
      gaps: [
        "No usage data and no measured time-to-cited-answer.",
        "No groundedness, retrieval-precision or latency eval; citation validity is structural, not sampled.",
        "Sessions with real inspectors happened but weren’t logged.",
      ],
    },
    {
      kind: "learnings",
      id: "learnings",
      nav: "Learnings",
      eyebrow: "Key learnings",
      headline: "Three lessons that made RailCite trustworthy.",
      anchors: ["08-what-i-learned"],
      items: [
        { title: "Refusal is a feature", body: "A confident wrong citation is worse than no answer.", source: "RC-DESIGN" },
        { title: "Trust belongs in code", body: "Citation validation and supersession checks enforce correctness beyond prompting.", source: "RC-VALIDATE" },
        { title: "Freshness is correctness", body: "A superseding circular turns a perfectly cited answer wrong — so the corpus is crawled nightly.", source: "RC-CRON-SPEC" },
      ],
    },
  ],
  evidence: [
    { title: "Discovery PRD", type: "PRD", date: "2026-08-28", supports: "The problem, the “Ravi” persona and the Master Circular insight", source: "RC-DISCOVERY-PRD" },
    { title: "Final PRD", type: "PRD", date: "2026-09-07", supports: "Ingest figures (5,687 ingested, 68% OCR, 193 lineage links) and the bleed fix", source: "RC-FINAL-PRD" },
    { title: "Design North Star", type: "Design", supports: "“Refuse is a first-class success state, never an error”", source: "RC-DESIGN" },
    { title: "Query pipeline", type: "Architecture", supports: "The seven-step pipeline, top-k 8 and the 0.32 gate", source: "RC-PIPELINE" },
    { title: "Synthesis prompt", type: "Code", supports: "Extractive only; the forced answered | refused result", source: "RC-SYNTHESIZE" },
    { title: "Citation validator", type: "Code", supports: "0 invented citations, by construction", source: "RC-VALIDATE" },
    { title: "Threshold calibration", type: "Evaluation", supports: "Retrieval threshold 0.45 → 0.32", source: "RC-CALIBRATE" },
    { title: "UX critique", type: "Evaluation", date: "2026-08-31", supports: "22/40 with one P0, “Flagship starter refuses”", source: "RC-IMPECCABLE" },
    { title: "Test run", type: "Test run", date: "2026-09-15", supports: "345 passed / 1 failed (a stale expectation) / 2 skipped, 48 files", source: "RC-TESTS" },
    { title: "Live /api/stats", type: "Live data", date: "2026-09-15", supports: "5,760 documents and 14,406 chunks", source: "RC-API-STATS" },
    { title: "Nightly-crawl design", type: "Design", date: "2026-09-03", supports: "“Staleness is … a correctness bug”", source: "RC-CRON-SPEC" },
    { title: "Build ledger", type: "Build ledger", supports: "A live smoke test caught Sonnet 5 rejecting a temperature parameter", source: "RC-BUILD-LEDGER" },
  ],
};
