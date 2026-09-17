# TKT-31 · Nuptis full case study content — implementer report

**Milestone:** M-005 · **Priority:** P1 · **Branch:** `m-005-content` · **Type:** content/data.
**Scope:** flesh the `nuptis` record in `data/projects.ts` from card-fidelity to a full deep-dive case
study (8 chapters, thinking chain, `deepDive:true`, sources — **no header metrics, deliberately**) +
author `docs/trace/nuptis.md`. Reference pattern: TeachSpark (TKT-28) / RailCite (TKT-29) / Velora
(TKT-30).

## Depth decision: full deep dive, not a card

The brief flagged a conditional — keep Nuptis card-level if its distinct sourced content is thin.
CONTENT_INVENTORY §8.4 carries substantial, **non-duplicated** content: its own problem framing and
personas, a risk-tier verification insight, a North Star metric definition, an explicit §7 cut list,
a mobile-QA sweep, and a self-feedback learning — none of it copied from Velora's page. The two pages
share only the Case Study 3 sprint context and the Day 7/Day 9 kill quotes, each attributed
independently. `technical-plan.md` §B TKT-31 also explicitly named the chapter/artifact mapping
(InsightCard risk-tier, HypothesisCard North Star, DecisionCard cut list, EvaluationCard mobile
sweep, thinking chain, self-feedback learning) — i.e. a deep dive was the planned scope, not padding.
Went with **`deepDive:true`**.

## What changed

- **`data/projects.ts`** — `nuptis` extended to a full case study:
  - `deepDive:true`; 8 chapters (context → learned); 8-node thinking chain (mirrors CONTENT_INVENTORY
    §8.4's own pre-mapped Show-the-Thinking chain almost verbatim); 4 learnings.
  - **Zero header metrics** (`metrics: []`) — `Nuptis-PRD.md:201` "All three success metrics in §11
    are defined but unmeasured," so the North Star is a `HypothesisArtifact` (`status:'unmeasured'`),
    never a `MetricCard`. "None measured" stated explicitly in the evaluation chapter's prose.
  - **Artifacts:** `InsightCard` Week-4 brief quote + risk-tier verification quote; `HypothesisCard`
    North Star; `DecisionCard` explicit cut list + "no AI in the assistant"; `EvaluationCard` mobile
    sweep (9 routes @414/768, 1 bug fixed); 2 `PrototypeFrame`s (dashboard, contingency); generic
    personas / stack / design-rigor / process-lessons cards; a cross-link to `/work/velora`.
  - **13 sources** declared, incl. `NUP-PRD`, `NUP-README`, `NUP-PROCUREMENT`, `NUP-DESIGN`,
    `NUP-PM-PLAN`, `CS3-9DAY-SERIES`, `NUP-SCREENSHOTS`, `NUP-LEDGER`, `NUP-FEEDBACK`, `NUP-MEMORY`.
  - AC #7/#8/#9 satisfied: "No AI" stated as its own decision artifact; "no automated tests" disclosed
    in built-chapter prose + the evaluation artifact's `limitation`; status stays "Live (mock data)".
- **`docs/trace/nuptis.md`** — full trace table (sources, metrics-none rationale, chapters→anchors,
  thinking chain, honesty/hedges, media-placeholder note, DRAFT flags: none).
- **`tests/e2e/case-study.spec.ts`** — the same test-side maintenance TKT-28/29/30 established for a
  slug becoming deep-dive: (1) added `"nuptis"` to `DEEP_DIVE`; (2) added a dedicated nuptis deep-dive
  block asserting no fabricated metrics (`getByText(/as of \d/i)` count 0) + OverviewToggle +
  ChapterNav anchors + "none measured" prose + ShowTheThinking (TC-076/077 parity, TC-075 adapted
  since there is no metric to show).

## Divergence from the TKT-30 precedent: `PrototypeFrame`s used, as placeholders

TKT-30's report noted Velora deliberately omitted image `PrototypeFrame`s because TKT-24 (screenshot
media) hadn't landed. TKT-31's own technical-plan line explicitly names `PrototypeFrame`s
dashboard/contingency as required artifacts, so this ticket includes both — as `kind:'placeholder'`
Media objects carrying the real, sourced screenshot dimensions (1568×661, `NUP-SCREENSHOTS`) but no
file path resolved yet. `PrototypeFrame.tsx` already renders a labelled `ImageOff` placeholder for
this kind (built for exactly this "real media not supplied yet" case), so nothing broken or
unsourced ships. When TKT-24 lands the real files at `/media/nuptis/{dashboard,contingency}.jpg`,
only `media.kind` needs to flip to `'image'`.

## Acceptance criteria (tickets.md TKT-31 + common contract)

1. Every chapter/artifact/metric/thinking/learning traces to CONTENT_INVENTORY §8.4 — ✓ (`docs/trace/nuptis.md`).
2. Metrics carry value/label/context/asOf/kind/source — vacuous (`metrics: []`, none claimed) — ✓.
3. Every MISSING item omitted or labelled, never paraphrased into existence (pilot data, analytics
   sheet, tests, mentor feedback, Excalidraw export, public repo) — ✓.
4. Authorship "built with Claude Code" where the pack says so — ✓ (`NUP-MEMORY`, learned chapter).
5. Hero media from the pack/media ticket, alt text written — `hero:{}` (placeholder, same as every
   other project pre-M-005 media), 2 `PrototypeFrame` placeholders with real alt text — ✓.
6. Schema gate green; axe clean 390/1440; anchors resolve; `pnpm eval` no regression — ✓ (below).
7. "No AI" stated — Assistant is keyword-matched canned responses — ✓ (`nup-a-no-ai` decision).
8. "No automated tests" disclosed — ✓ (built-chapter prose + evaluation artifact limitation).
9. Status "Live (mock data)" — ✓ (unchanged from card record).

## Verification (all green)

| Gate | Result |
|---|---|
| `pnpm typecheck` | ✓ pass |
| `pnpm lint` | ✓ pass |
| `pnpm test` | ✓ 188 passed / 1 skipped (content-gate incl.) |
| `pnpm build` | ✓ content-gate passes (`projects:14`); `all routes static (9)`; `/work/nuptis` prerendered (SSG) |
| `forbidden-strings --bundle` | ✓ 0 hits in 149 files (incl. .next bundle) |
| `pnpm test:e2e --grep case-study` | ✓ 55 passed / 57 skipped (nuptis deep-dive block passes) |
| `pnpm eval --only EVAL-011,EVAL-013,EVAL-014` | ✓ 3 pass · 0 fail · 14 skip — **no regression** vs baseline; `evals/results/eval-run-0.2.0-005852a.json` |

## Notes / deferred

- Commit stages **explicit paths only**; re-rendered `evals/results/*.json` from this and prior runs
  left unstaged per brief.
- **DRAFT flags: none.**
- Cut-list content: the PRD's §7 cut list is real and reasoned (AUDIT §3), but no specific cut item
  was located verbatim in the inventory — the bet chapter describes its existence and the
  "effort tracks points" reasoning only, never invented line items.
