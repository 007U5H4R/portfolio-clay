# TKT-32 · Cubicle full case study content — implementer report

**Milestone:** M-005 · **Priority:** P1 · **Branch:** `m-005-content` · **Type:** content/data.
**Scope:** flesh the `cubicle` record in `data/projects.ts` from card-fidelity to a full deep-dive
case study (8 chapters, thinking chain, `deepDive:true`, sources) with honest "built, not launched"
framing throughout + author `docs/trace/cubicle.md`. Reference pattern: TeachSpark (TKT-28) / RailCite
(TKT-29) / Velora (TKT-30) / Nuptis (TKT-31).

## Depth decision: full deep dive, not a card

CONTENT_INVENTORY §8.3 carries the deepest documentation of any personal build on the site — a
46-source discovery pack, a full multi-agent architecture, 326 automated tests, 97 tracked TC rows,
formal QA gates, and three numbered lessons. `tickets.md` TKT-32 and `technical-plan.md` §B TKT-32
both name a full chapter/artifact set (InsightCard, HypothesisCard, DecisionCard, EvaluationCard,
MetricCards, an 8-node thinking chain, learnings L1/L2/L8) — a deep dive was the planned scope. Went
with **`deepDive:true`**.

## CRITICAL honesty framing (highest overclaim-risk record, per the brief)

Cubicle is a real, rigorously-tested build that was **never deployed and never run against a live
model or database** — the easiest record on the site to accidentally word into sounding shipped.
Every guard is enforced in the data, not just prose:

- **No live link** — `links` carries no `live`, no `demoVideo`; only a private `github` URL
  (`repoPublic:false`, matching decision S5 — the repo 404s for the public).
- **Status** — `status:"prototype"`, `statusLabel:"Built, not launched"` (unchanged from the card
  record), added `statusAsOf:"2026-09-15"` (the date AUDIT verified via `gh repo view` that the repo
  has no homepage set).
- **No usage/activation numbers** — `metrics` carries exactly 2 **build-quality** figures (326 tests
  passing, WCAG AA contrast), both `kind:'measured'`, both dated to the QA report. Cost (~$0.04/run)
  and latency (50–75 s) are Solution-PRD *estimates*, stated only as prose in the evaluation chapter,
  explicitly labelled unmeasured — never as a `Metric`/`MetricCard` number. The 8 pre-launch targets
  (activation/return/share/reliability/cost, §9) are a single `HypothesisArtifact` with
  `status:'unmeasured'`, never backed into metrics.
- **No solo claim** — `role:"Team build"` (unchanged); the context chapter states outright that team
  member names and Tushar's own named role inside the team of six were never recorded anywhere in the
  artifacts.
- **Featured swap not triggered** — §8.3's own conditional swap rule (Cubicle → featured slot 3 only
  if deployed) does not fire since it isn't deployed; `featured` is unset and the existing featured
  trio (`teachspark`, `railcite`, `velora`) is untouched.
- **No screenshots fabricated** — AUDIT §6 confirms no PNG/JPG exists for this project anywhere. No
  `PrototypeArtifact` is used anywhere in the record (unlike Nuptis's placeholder-dimension approach,
  there are no sourced dimensions to place a placeholder against); the two real pitch decks are cited
  instead as a `GenericArtifact` (`kind:'deck'`).
- **No PII** — no `.env` key names, no personal contact details beyond what's already public.

## What changed

- **`data/projects.ts`** — `cubicle` extended to a full case study:
  - `deepDive:true`; 8 chapters (context → learned, ~2,300 words); 8-node thinking chain (mirrors
    CONTENT_INVENTORY §8.3's own pre-mapped Show-the-Thinking chain almost verbatim); 3 learnings
    (L1, L2, L8).
  - **Exactly 2 header metrics**, both build-quality: 326 tests passing (measured, `2026-09-12`) and
    WCAG AA contrast ≥5.18:1/≥6.14:1 (measured, `2026-09-12`) — both sourced to `CUB-QA-REPORT`.
  - **Artifacts:** `InsightCard` (tagline, Aarav persona, "Nobody makes the collaboration visible",
    L1, L8), `HypothesisCard` (8 pre-launch targets, `status:'unmeasured'`), `DecisionCard` ("Trust
    first, ownership second, autonomy last"; four-artifact architecture, not open-ended chat),
    `EvaluationCard` (326 tests / 97 TC rows / QA gates, honest limitation), plus generic doc/deck
    cards for the team-of-6 gap, secondary personas, research provenance, architecture, the Gemini
    gateway, the deployment recommendation, and the no-live-run HANDOFF quote.
  - **10 sources** declared: `CUB-DISCOVERY-PRD`, `CUB-QA-REPORT`, `CUB-BUILDATHON-BRIEF`,
    `CUB-TECHNICAL-PLAN`, `CUB-RESEARCH-NOTES`, `CUB-DECISIONS` (declared for traceability, unused as
    an artifact source — same pattern as `NUP-LAUNCH-POST` in TKT-31), `CUB-HANDOFF`,
    `CUB-LESSON-LEARNT`, `CUB-PACKAGE-JSON`, `CUB-DECKS`.
- **`docs/trace/cubicle.md`** — full trace table (sources, metrics table, chapters→anchors, thinking
  chain, honesty/hedges, excluded/PII, DRAFT flags: none).
- **`tests/e2e/case-study.spec.ts`** — the same test-side maintenance TKT-28/29/30/31 established for
  a slug becoming deep-dive: (1) added `"cubicle"` to `DEEP_DIVE`; (2) added a dedicated cubicle
  deep-dive test asserting the "Built, not launched" badge, both build-quality header metrics, the
  30-sec/deep-dive toggle, ChapterNav anchors, the "no live run, no users" outcome prose, and
  ShowTheThinking (TC-075/076/077 parity); (3) the JS-off static-content test (which needed a
  still-thin slug to assert the "Deep dive coming" note) now uses **`bhakti-vilas`** instead of
  `cubicle`, since cubicle is no longer thin.

## Acceptance criteria (tickets.md TKT-32 + common contract)

1. Role text never claims solo — `role:"Team build"`; context chapter states plainly that team
   member names and Tushar's own named role were never recorded — ✓.
2. No product metrics — header `metrics` carry only 2 build-quality figures (tests, contrast); cost
   and latency stay prose-only, labelled unmeasured — ✓.
3. Status "Built, not launched" (unchanged) — ✓.
4. Every chapter/artifact/metric/thinking/learning traces to CONTENT_INVENTORY §8.3 — ✓
   (`docs/trace/cubicle.md`).
5. Every MISSING item omitted or labelled, never paraphrased into existence (live URL, deployment,
   real end-to-end run, product metrics, PM/founder interviews, team names, screenshots, `evals/`,
   final deck, OG) — ✓.
6. Conditional featured-swap not triggered — `featured` unset, existing trio untouched — ✓.
7. Schema gate green; axe clean 390/1440; anchors resolve; `pnpm eval` no regression — ✓ (below).

## Verification (all green)

| Gate | Result |
|---|---|
| `pnpm typecheck` | ✓ pass |
| `pnpm lint` | ✓ pass |
| `pnpm test` | ✓ 188 passed / 1 skipped (content-gate incl.) |
| `pnpm build` | ✓ content-gate passes (`projects:14`); all routes static; `/work/cubicle` prerendered (SSG) |
| `forbidden-strings --bundle` | ✓ 0 hits in 149 files (incl. `.next` bundle) |
| `pnpm test:e2e --grep case-study` | ✓ 57 passed / 59 skipped (cubicle deep-dive block passes; JS-off test now uses bhakti-vilas) |
| `pnpm eval --only EVAL-011,EVAL-013,EVAL-014` | ✓ 3 pass · 0 fail · 14 skip — **no regression**, `criticalFailures: []`, `regressions: []` vs baseline; `evals/results/eval-run-0.2.0-e867e74.json` |

## Notes / deferred

- Commit stages **explicit paths only**; re-rendered `evals/results/*.json` from this and prior runs
  left unstaged per brief.
- **DRAFT flags: none.**
- No `PrototypeFrame`/screenshot artifacts anywhere — AUDIT confirms none exist for this project;
  fabricating a placeholder with invented dimensions would itself be an overclaim risk, so the two
  real pitch decks are cited instead.
- `CUB-DECISIONS` is declared in `sources[]` for traceability (referenced in the bet chapter's prose)
  but not cited as any artifact's `source` field — same precedent as `NUP-LAUNCH-POST` (TKT-31).
