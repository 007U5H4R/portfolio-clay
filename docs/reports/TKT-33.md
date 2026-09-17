# TKT-33 · Bhakti-Vilas case study content — implementer report

**Milestone:** M-005 · **Priority:** P2 · **Branch:** `m-005-content` · **Type:** content/data.
**Scope:** flesh the `bhakti-vilas` record in `data/projects.ts` to the depth its sourced content
supports + author `docs/trace/bhakti-vilas.md`. Reference pattern: TeachSpark (TKT-28) / RailCite
(TKT-29) / Velora (TKT-30) / Nuptis (TKT-31) / Cubicle (TKT-32).

## Depth decision: shorter full deep dive, not a card

CONTENT_INVENTORY §8.6 pre-maps a genuinely sourced 8-stage Show-the-Thinking chain (observation →
user problem → insight → hypothesis → product decision → prototype → evaluation → outcome), each with
a real quote, plus named artifacts (Tushar's refined hypothesis, the Madhu Mukti decision, the mentor
Q&A with 11 cited sources). That is real sourced material for chapters and an 8-node thinking chain —
so per `tickets.md` TKT-33 ("Shorter chapter set... Evaluation/Outcome brief") this went to a **shorter
full deep dive** (`overview.deepDive: true`), not a card, deliberately narrower than TeachSpark/Cubicle:
evaluation and outcome are one-paragraph chapters with a single artifact each, header `metrics` stays
`[]` (product metrics MISSING per §8.6), and no `PrototypeArtifact` is used anywhere — unlike Nuptis,
which had real dimensioned screenshots in its source repo to place a sourced placeholder against,
Bhakti Vilas has **no UI screenshot file anywhere** in the source project (AUDIT §2 "Visuals": "UI
screenshots of Bhakti Vilas: MISSING"), so fabricating placeholder dimensions was not an option.

## What changed

- **`data/projects.ts`** — `bhakti-vilas` extended from card-fidelity to a shorter deep dive:
  - `deepDive:true`; 8 chapters (context → learned); 8-node thinking chain mirroring CONTENT_INVENTORY
    §8.6's own pre-mapped Show-the-Thinking chain; 3 learnings (translation gap, unreviewed medical
    copy, commit-split honesty).
  - **Zero header metrics** (`metrics: []`) — product metrics are MISSING per §8.6; the team's own
    market-research survey numbers (n=23/47/12, 9 personas, 3 expert interviews) are reported only in
    the problem chapter's prose/artifact, explicitly labelled "not Tushar's own fieldwork," never
    folded into a `Metric`.
  - **Artifacts:** `InsightCard` (brief quote, ecosystem-gap quote, Tushar's refined hypothesis,
    "Distance was never the variable"), `HypothesisCard` ("Insure the visit, don't vet the person",
    `status:'unmeasured'`), `DecisionCard` (Madhu Mukti — health meaning coded, not front-loaded),
    `EvaluationCard` (mentor Q&A, 11 sources, no numeric grade recorded), plus generic doc/link cards
    for the team-of-5-contributors context, the commit split, team survey data, the category/hypothesis
    scoring, the staged-reveal-as-estimate caveat, the team-PRD echo, the stack, the verified
    session-booking flow, the live-link/repo-visibility note, and the README-disclosed gaps.
  - **No `PrototypeArtifact`/screenshot anywhere** — none exist for this project (AUDIT §2); `hero`
    stays `{}` (renders the labelled "Hero media coming" placeholder) until TKT-25 lands real captures.
  - **14 sources** declared: `BV-README`, `BV-AUDIT`, `BV-BRIEF`, `BV-CASE-STUDY`,
    `BV-TUSHAR-HYPOTHESIS`, `BV-TEAM-SYNTHESIS`, `BV-TEAM-PRIMARY-RESEARCH`, `BV-CATEGORY-HYPOTHESES`,
    `BV-REFINED-HYPOTHESIS`, `BV-MADHU-MUKTI-SOLUTION`, `BV-TEAM-PRD`, `BV-MEMORY`, `BV-MENTOR-QA`,
    `BV-LINKEDIN`.
- **`docs/trace/bhakti-vilas.md`** — full trace table (sources, metrics-as-none, chapters→anchors,
  thinking chain, honesty/hedges, excluded/PII, DRAFT flags: none).
- **`tests/e2e/case-study.spec.ts`** — the same test-side maintenance TKT-30/31/32 established for a
  slug becoming deep-dive: (1) added `"bhakti-vilas"` to `DEEP_DIVE`, with a comment explaining the
  zero-metrics / no-screenshot shape; (2) the JS-off static-content test (which needs a still-thin slug
  to assert the "Deep dive coming" note) now uses **`token-toli`** instead of `bhakti-vilas`, since
  bhakti-vilas is no longer thin and token-toli stays thin permanently under TKT-54's own plan
  (`deepDive:false`, "Discovery only" page).

## Acceptance criteria (tickets.md TKT-33 + common contract)

1. Team build with commit split stated (5 Tushar / 3 Shivali) — ✓ context chapter + `bv-a-commit-split`.
2. Staged-reveal funnel shown only as "directional estimates" — ✓ `bv-a-staged-reveal`, never a `Metric`.
3. Status "Live prototype (mock data, team build)" (unchanged) — ✓.
4. Every chapter/artifact/thinking node traces to CONTENT_INVENTORY §8.6 — ✓ (`docs/trace/bhakti-vilas.md`).
5. Every MISSING item omitted or labelled, never paraphrased into existence (UI screenshots, usage,
   tests, team PRD authors, mentor grade, Tushar-fielded interviews) — ✓.
6. Schema gate green; axe clean 390/1440; anchors resolve; `pnpm eval` no regression — ✓ (below).

## Verification (all green)

| Gate | Result |
|---|---|
| `pnpm typecheck` | ✓ pass |
| `pnpm lint` | ✓ pass |
| `pnpm test` | ✓ 188 passed / 1 skipped (content-gate incl.) |
| `pnpm build` | ✓ content-gate passes (`projects:14`); all routes static |
| `forbidden-strings --bundle` | ✓ 0 hits in 149 files (incl. `.next` bundle) |
| `pnpm test:e2e --grep case-study` | ✓ 57 passed / 59 skipped (bhakti-vilas deep-dive block passes; JS-off test now uses token-toli) |
| `pnpm eval --only EVAL-011,EVAL-013,EVAL-014` | ✓ 3 pass · 0 fail · 14 skip — **no regression**, `criticalFailures: []`, `regressions: []` vs baseline; `evals/results/eval-run-0.2.0-c4761cf.json` |

## Notes / deferred

- Commit stages **explicit paths only**; re-rendered `evals/results/*.json` left unstaged per brief.
- **DRAFT flags: none.**
- No dedicated bhakti-vilas deep-dive assertion test (TC-075/076/077-style) was added beyond the
  shared per-slug loop — the ticket scope is `data/projects.ts` + `docs/trace/bhakti-vilas.md`; the
  shared loop in `case-study.spec.ts` already exercises the toggle, no fabricated metrics, axe, and
  NextProject for every deep-dive slug including this one.
