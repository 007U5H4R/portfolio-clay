# TKT-29 report — RailCite full case-study content (M-005)

**Ticket:** TKT-29 · Type: Task (data/content) · Priority: P0 · Milestone: M-005
**Branch:** `m-005-content` · **Model tier:** most-capable (featured case-study fidelity)

## What shipped

RailCite went from a thin, card-fidelity record to a **full case study** in `data/projects.ts`:

- **8 chapters** (context · problem · discovery · bet · built · evaluation · outcome · learned) with
  sourced prose bodies and inline artifacts (insight / hypothesis / decision / generic / evaluation /
  experiment / metric).
- **6 metrics** total — 3 in the header (`5,760` documents indexed; `0` invented citations
  **[structural, by construction]**; `68%` ingested PDFs needing OCR) plus inline metrics (`193`
  lineage links; `345 / 1 / 2` tests; `14,406` chunks live). Every metric carries `asOf` + `kind` +
  `source`. **Corpus follows the decided "live, with as-of date" policy**: live figures dated
  2026-09-15; Final-PRD ingest figures shown only tied to 7 Sep 2026.
- **8-node thinking chain** for `ShowTheThinking` (observation → outcome), each node sourced.
- `overview.deepDive: true` (2-paragraph 30-second overview) and **13 declared sources**.
- **`docs/trace/railcite.md`** — the full number→source trace table.

All copy is sourced from **CONTENT_INVENTORY §8.2** + **AUDIT §5** (railcite-cron canonical;
CS5/railcite stale). **No fabrication.**

## Truth rules honoured (TKT-29 specific ACs + TC-090)

- Citation validity always labelled **"by construction"**, never a percentage over N queries (no
  `\d+% … citation` phrasing).
- Decks' **"148 tests / 5,687 docs" never used as current**: current corpus is `5,760` / `14,406`
  (2026-09-15); `5,687` appears only tied to "7 Sep 2026" + OCR/ingest.
- The failing test disclosed as a **"stale expectation"** (345 passed / 1 failed / 2 skipped), not
  hidden.
- Impeccable P0 **"Flagship starter refuses"** stated as found; **fix record noted MISSING**.
- Authorship "built with Claude Code"; product-model facts (Claude Sonnet 5 / Haiku, Voyage-3) stated
  separately.

## Honest hedges / MISSING preserved

CCI user-testing real but **unrecorded** (no count/names/dates; HITL "3 real CCI cases" pending) ·
no usage/Mixpanel data · no measured time-to-cited-answer · no groundedness/retrieval/latency evals ·
no mentor feedback · no P0 fix record · refreshed deck figures absent · hypothesis status
`unmeasured` (the recorded-CCI-justification condition was never captured). No `PrototypeArtifact`
fabricated — no product screenshots/video exist yet (TKT-23 soft), so the hero renders the labelled
"Hero media coming" placeholder.

## Template defects surfaced

**None.** TeachSpark (TKT-28) was the first record with chapters/metrics and fixed the latent
`CaseStudyHeader` `<dl>` and `ChapterNav` overflow bugs; RailCite exercises the same components with
no new issues (axe-clean at 390 & 1440).

## Test / spec updates

- `tests/e2e/case-study.spec.ts` — `railcite` added to `DEEP_DIVE` (so the generic loop checks its
  real deep-dive path, not the "Deep dive coming" placeholder); new dedicated deep-dive test mirrors
  TeachSpark's TC-075 (header metrics + "as of 15 Sep 2026") / TC-076 (OverviewToggle) / TC-077
  (ChapterNav anchors + ShowTheThinking). No component/template code changed.

## Verification (all green)

| Gate | Result |
|---|---|
| `pnpm typecheck` | pass |
| `pnpm lint` | pass |
| `pnpm test` (unit) | 188 passed / 1 skipped |
| content-gate (`validate-content` / prebuild) | `content OK (projects:14 …)` |
| `pnpm build` | all routes static; `/work/railcite` prerendered (SSG), full deep dive |
| `pnpm test:e2e --grep case-study` | 51 passed / 53 skipped (viewport-gated) — incl. new railcite deep-dive + axe-clean |
| `pnpm eval --only EVAL-003,EVAL-011,EVAL-013,EVAL-014` | 3 pass · 0 fail · 13 skip · 1 manual |
| forbidden-strings scan | 0 hits in 104 files (sandbox-code file absent → SKIP line only) |

**Eval detail:** EVAL-013 (content gate + forbidden) PASS · EVAL-011 (no dead anchors/controls) PASS ·
EVAL-014 (video slot) PASS · EVAL-003 MANUAL (product-leader traceability — manual by design). WARNs
in the eval run (LinkedIn HTTP 429 bot-block; not-yet-built `/about` + Thinking index routes owned by
TKT-40/41) are pre-existing and unrelated to RailCite — **not a regression**.

## DRAFT flags

**None.** Every chapter body, metric and thinking node traces to CONTENT_INVENTORY §8.2 / AUDIT §5.

## Blockers

**None.** No chapter or metric was unsourceable; the corpus-figure policy default ("live, with
as-of date") was applied.

## `git diff --stat` (staged content, excludes re-rendered screenshots + eval-run json)

```
 data/projects.ts             | (railcite: card → full case study)
 tests/e2e/case-study.spec.ts | (railcite → DEEP_DIVE + deep-dive test)
 docs/trace/railcite.md       | (new)
 docs/reports/TKT-29.md       | (new)
```
Left unstaged (per brief): `evals/results/*.json`, any re-rendered `docs/screenshots/**`.
