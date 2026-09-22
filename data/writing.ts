import type { Essay } from "./schema";

/**
 * `/thinking` essay list (TKT-43; tickets.md TKT-43; Design.md §3 "Thinking"). source: CONTENT_INVENTORY §5.
 *
 * No article has actually been written or published — CONTENT_INVENTORY §5's last row is explicit:
 * "Any published article/URL … MISSING — none exist". Every entry below is `draft: true`, carries
 * NO `publishedOn`, and its `passages` are the exact quoted fragments §5 backs each candidate title
 * with (copied verbatim, including the source doc's own "…" elisions — nothing is paraphrased or
 * extended). `framing` is the one authored paragraph the brief permits: a clearly-labelled
 * "Draft — pending sign-off" connective note, never presented as finished essay prose, and it adds
 * no fact beyond what the quoted passages already state. Titles are §5's candidate titles verbatim
 * and are explicitly flagged in tickets.md TKT-43 as pending Tushar's sign-off (non-blocking).
 *
 * This module imports the schema as a type only (never a value) so no client bundle pulls in zod —
 * same discipline as `experience.ts`; validation runs at build time in `scripts/validate-content.ts`
 * (prebuild) and in Vitest.
 */
export const writing: Essay[] = [
  {
    slug: "green-tests-prove-it-runs",
    title: "Green tests prove it runs. They don't prove it's right.",
    dek: "A note on why a fully green test suite still missed the defects that mattered.",
    draft: true,
    readingMinutes: 2,
    passages: [
      {
        quote:
          "364 tests passed. Then I opened the actual file… Green tests prove it runs. They don't prove it's right.",
        source: "TS-9DAY-BUILD",
      },
      {
        quote:
          "The two most important defects this session… were both found by reading the code/reasoning, not by any test.",
        source: "CS6-LESSON-LEARNT",
      },
    ],
    framing:
      "Draft — pending sign-off: this is a placeholder note, not the finished essay. It connects two separate build sessions — TeachSpark and Cubicle — around one recurring observation: a fully green test suite still let through the defects that turned out to matter most, and those were only caught by reading the code and the reasoning directly, not by any test passing or failing. The full essay, worked examples, and conclusion are not yet written.",
    relatedProject: "teachspark",
    sources: [
      {
        id: "TS-9DAY-BUILD",
        label: "TeachSpark — 9-Day Build Series (LinkedIn draft)",
        ref: "TS/docs/linkedin/9-day-build-series.md",
        inventory: "§5",
      },
      {
        id: "CS6-LESSON-LEARNT",
        label: "Cubicle — lesson-learnt.md",
        ref: "CS6/lesson-learnt.md:8",
        inventory: "§5",
      },
    ],
  },
  {
    slug: "worse-numbers-before-submitting",
    title: "I made my own numbers worse the day before submitting",
    dek: "A note on re-checking a pilot metric and reporting the smaller, honest number instead.",
    draft: true,
    readingMinutes: 2,
    passages: [
      {
        quote:
          "Activated teachers dropped from 10 to 8. Median time saved fell from 37.5 minutes to 30. Papers went from 5 to 2.",
        source: "CS4-FINAL-PRD",
      },
      {
        quote: "Honest smaller numbers earn more trust than impressive fake ones.",
        source: "TS-9DAY-BUILD-P9",
      },
    ],
    framing:
      "Draft — pending sign-off: this is a placeholder note, not the finished essay. It is built around a TeachSpark pilot moment — a late re-check found the activation and time-saved numbers had actually gotten worse than an earlier snapshot, and the decision was to report the smaller, honest numbers rather than the earlier, better-looking ones. The full essay, reasoning, and conclusion are not yet written.",
    relatedProject: "teachspark",
    sources: [
      {
        id: "TS-9DAY-BUILD-P9",
        label: "TeachSpark — 9-Day Build Series (LinkedIn draft), Post 9",
        ref: "TS/docs/linkedin/9-day-build-series.md",
        inventory: "§5",
      },
      {
        id: "CS4-FINAL-PRD",
        label: "TeachSpark — Final PRD §0",
        ref: "CS4/docs/final-prd.docx",
        inventory: "§5",
      },
    ],
  },
  {
    slug: "refusal-is-a-feature",
    title: "Refusal is a feature: designing an AI that would rather say no",
    dek: "A note on why RailCite is built to refuse an answer rather than guess a citation.",
    draft: true,
    readingMinutes: 2,
    passages: [
      {
        quote:
          "Refuse is a first-class success state, never an error… the single most important design decision in the document.",
        source: "CS5-DESIGN",
      },
      {
        quote: "The feature is a citation. The product is trust.",
        source: "CS5-LINKEDIN-D5",
      },
    ],
    framing:
      "Draft — pending sign-off: this is a placeholder note, not the finished essay. It is built around RailCite's core design decision — treating a refusal to answer as a first-class successful outcome, not a failure, whenever the system cannot back an answer with a valid citation. The full essay, reasoning, and conclusion are not yet written.",
    relatedProject: "railcite",
    sources: [
      {
        id: "CS5-DESIGN",
        label: "RailCite — Design.md L21-24",
        ref: "CS5/Design.md:21-24",
        inventory: "§5",
      },
      {
        id: "CS5-LINKEDIN-D5",
        label: "RailCite — 9-Day LinkedIn Series, Day 5",
        ref: "CS5/docs/linkedin/railcite-9day-linkedin-series.md",
        inventory: "§5",
      },
      {
        id: "RC-SYNTHESIZE",
        label: "RailCite — lib/synthesize.ts L8-21",
        ref: "RC/lib/synthesize.ts:8-21",
        inventory: "§5",
      },
    ],
  },
  {
    slug: "killing-nuptis",
    title: "Killing Nuptis: two products in nine days and why one had to die",
    dek: "A note on shutting down one product nine days after starting it, and building its replacement.",
    draft: true,
    readingMinutes: 2,
    passages: [
      {
        quote:
          "Weddings were blue — but a shallow pool. Few events, low willingness to pay… the same trust problem, aimed at apparel vendor onboarding.",
        source: "CS3-LINKEDIN-D7",
      },
      {
        quote: "learning to kill Nuptis without flinching.",
        source: "CS3-LINKEDIN-D9",
      },
    ],
    framing:
      "Draft — pending sign-off: this is a placeholder note, not the finished essay. It is built around the decision to stop building Nuptis (wedding vendor onboarding) and redirect the same underlying trust problem toward Velora (apparel vendor onboarding), within the same nine-day build window. The full essay, reasoning, and conclusion are not yet written.",
    relatedProject: "nuptis",
    sources: [
      {
        id: "CS3-LINKEDIN-D7",
        label: "Nuptis/Velora — 9-Day LinkedIn Series, Day 7",
        ref: "CS3/Case-Study-3-LinkedIn-9-Day-Series.docx",
        inventory: "§5",
      },
      {
        id: "CS3-LINKEDIN-D9",
        label: "Nuptis/Velora — 9-Day LinkedIn Series, Day 9",
        ref: "CS3/Case-Study-3-LinkedIn-9-Day-Series.docx",
        inventory: "§5",
      },
    ],
  },
  {
    slug: "staleness-is-a-correctness-bug",
    title: "Staleness is a correctness bug, not a missing feature",
    dek: "A note on why an out-of-date citation is a bug, not a nice-to-have.",
    draft: true,
    readingMinutes: 1,
    passages: [
      {
        quote:
          "A circular issued last week that supersedes a rule makes RailCite return a confidently wrong answer with a citation attached.",
        source: "RC-CRON-DESIGN",
      },
    ],
    framing:
      "Draft — pending sign-off: this is a placeholder note, not the finished essay. It is built around RailCite's daily-crawl design — the observation that a superseded rule left uncrawled can make the system return a confidently wrong, citation-backed answer, which is why freshness is treated as a correctness requirement rather than a nice-to-have. The full essay, reasoning, and conclusion are not yet written.",
    relatedProject: "railcite",
    sources: [
      {
        id: "RC-CRON-DESIGN",
        label: "RailCite — daily-crawl cron design spec L16-19",
        ref: "RC/docs/superpowers/specs/2026-09-03-daily-crawl-cron-design.md:16-19",
        inventory: "§5",
      },
    ],
  },
];
