# TKT-28 report — TeachSpark full case-study content (M-005)

**Ticket:** TKT-28 · Type: Feature (data/content) · Priority: P0 · Milestone: M-005
**Branch:** `m-005-content` · **Model tier:** most-capable (flagship case-study fidelity)

## What shipped

TeachSpark went from a thin, card-fidelity record to a **full case study** in `data/projects.ts`:

- **8 chapters** (context · problem · discovery · bet · built · evaluation · outcome · learned) with
  sourced prose bodies and inline artifacts (insight / hypothesis / decision / evaluation /
  experiment / metric / generic).
- **6 metrics** total — 3 in the header (`17` teachers joined; `8 (47%)` activated; `37.5 min`
  median time saved) plus inline metrics in chapters (cost `≈ $0.01`/gen; Mixpanel `27→7→4`; `3`
  referrals). Every metric carries `asOf` + `source` + `kind`. **Metric date = 2026-08-24** (the
  decided Final-PRD snapshot default, test handsets excluded).
- **8-node thinking chain** for `ShowTheThinking` (observation → outcome), each node sourced.
- `overview.deepDive: true` (with a 2-paragraph 30-second overview) and **12 declared sources**.
- **`docs/trace/teachspark.md`** — the full number→source trace table.

All copy is sourced from **CONTENT_INVENTORY §8.1** + **AUDIT §4**. **No fabrication.** The
canonical 2026-08-24 Final-PRD snapshot is used throughout; the conflicting 2026-08-26 pitch snapshot
is excluded (§8.1 "Choose one date; do not mix").

## Honest hedges preserved

Uptime after 2026-09-09 unverified · no teacher interviews recorded (planned 8–12) · no LLM
output-quality evals exist · pitch "625 tests" not reproduced → not used (phase-6 335-pass gate cited
instead) · cost `≈ $0.01/gen` labelled as a runbook estimate (self-reported). Twilio sandbox join
code and all PII excluded (forbidden-strings / EVAL-016).

## Template defects surfaced & fixed (TeachSpark is the first record with chapters/metrics)

These are pre-existing latent bugs first *exercised* by real content — not a rebuild of TKT-19:

1. **`CaseStudyHeader`** wrapped inline `MetricCard`s (which render `<div>`s, not `<dt>`/`<dd>`) in a
   `<dl>` → axe `definition-list` **serious** violation. Fix: `<dl>` → `<div>` (visual identical).
2. **`ChapterNav`** mobile pill row (`overflow-x-auto`) blew out the page to 1010px at 390px because
   its grid ancestor let it grow to content width. Fix: `min-w-0` on the nav so the scroll container
   clips. (Verified: no horizontal overflow at 390.)

Test updates to match the new deep-dive reality:
- `tests/unit/schema.test.ts` — the "deepDive with <4 chapters fails" negative now blanks the clone's
  chapters (TeachSpark ships real chapters); intent preserved.
- `tests/e2e/case-study.spec.ts` — TeachSpark branched out of the thin-content assertions; new
  deep-dive test exercises TC-075 (header metrics) / TC-076 (OverviewToggle) / TC-077 (ChapterNav
  anchors + ShowTheThinking). Previously BLOCKED TC-075/076/077 now run for real.

## Verification (all green)

| Gate | Result |
|---|---|
| `pnpm typecheck` | ✅ pass |
| `pnpm lint` | ✅ pass |
| `pnpm test` (unit) | ✅ 188 passed / 1 skipped |
| content-gate (`validate-content` / prebuild) | ✅ `content OK (projects:14 …)` |
| `pnpm build` | ✅ all routes static; `/work/teachspark` renders full deep dive |
| `pnpm test:e2e --grep 'case-study'` | ✅ 49 passed / 51 skipped (viewport-gated) |
| `pnpm eval --only EVAL-003,EVAL-004,EVAL-011,EVAL-013,EVAL-014` | ✅ 4 pass · 0 fail · 12 skip · 1 manual |
| forbidden-strings scan | ✅ 0 hits in 104 files (sandbox-code file absent → SKIP line only) |

**Eval detail:** EVAL-013 (content gate + forbidden) PASS · EVAL-011 (no dead anchors) PASS ·
EVAL-014 PASS · EVAL-004 (Lighthouse) PASS · EVAL-003 MANUAL (product-leader traceability — manual
by design). One **informational** note: EVAL-004 Lighthouse `/` mobile 96→92 — home-page run-to-run
LCP variance (values 2988/2415/2986 ms), on a page this ticket did not touch; **not a content
regression** and not counted as a failure.

## DRAFT flags

**None.** Every chapter body, metric and thinking node traces to CONTENT_INVENTORY §8.1 / AUDIT §4.

## Blockers

**None.** No chapter or metric was unsourceable.

## `git diff --stat` (staged content, excludes re-rendered screenshots + eval-run json)

```
 components/case-study/CaseStudyHeader.tsx |   4 +-
 components/case-study/ChapterNav.tsx      |   5 +-
 data/projects.ts                          | 422 +++++++++++++++++++++++++++++-
 tests/e2e/case-study.spec.ts              |  57 +++-
 tests/unit/schema.test.ts                 |   5 +
 5 files changed, 480 insertions(+), 13 deletions(-)
```
Plus new: `docs/trace/teachspark.md`, `docs/reports/TKT-28.md`.
Left unstaged (per brief): `evals/results/*.json`, any re-rendered `docs/screenshots/**`.
