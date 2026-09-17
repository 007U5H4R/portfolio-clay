---
id: TASK-29
title: 'TKT-29: Content: RailCite - full depth'
status: Done
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-17 08:06'
labels:
  - P0
  - 'sp:5'
  - content
milestone: m-4
dependencies:
  - TASK-19
  - TASK-20
  - TASK-21
  - TASK-15
priority: high
type: task
ordinal: 29000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
8 chapters; artifacts: persona `InsightCard` "Ravi" (composite CCI), Master-Circular-caveat `InsightCard`, `HypothesisCard` (Final PRD §7.1), `DecisionCard` "Refuse is a first-class success state" vs answer-always, `ExperimentCard` threshold calibration 0.45->0.32 (5 relevant + 3 irrelevant queries), `EvaluationCard` (impeccable critique 22/40 with P0 "starter refuses" - state as found, fix record MISSING), `MetricCard`s (5,760 docs / 14,406 chunks live 2026-09-15 · 68% OCR of 5,687 at 7 Sep · 193 lineage links · tests 345/1/2 on 2026-09-15 · "0 invented citations - by construction", kind structural), architecture `PrototypeFrame` (deck slide or a diagram built from the pipeline description - labelled as illustration), thinking chain, learnings ("staleness is a correctness bug", temperature rejection found by live smoke, "The feature is a citation. The product is trust.").

**Source pack.** §8.2 (+ §1.5). **Media.** TKT-23 (soft - PB4; no product screenshots exist yet, so the hero slot renders a labelled placeholder until the capture lands).
**Dependencies.** common + Tushar's corpus-figure policy (recommended "live, as of <date>" with footnote).
**MISSING -> placeholders/omissions.** CCI user-testing record · usage/Mixpanel · measured time-to-cited-answer · groundedness/retrieval/latency evals · mentor feedback · P0 fix record · refreshed deck figures.
**Blockers.** Tushar - corpus figure policy (TKT-23 is soft here; it hard-blocks TKT-50 instead).

**Common contract (TKT-28..33, TKT-54).** Type Task · Milestone M-005 · Dependencies TKT-19, TKT-20, TKT-21 (+ TKT-15 record exists). Media tickets are soft for every content ticket (PB4): a missing video renders DemoVideo's "Demo coming" state and a missing screenshot renders a labelled hero placeholder. Product requirement: Solution-PRD §5 Case study + §7 truth rules; CONTENT_INVENTORY §3 field->chapter mapping + the named §8 pack; COMPONENT_ARCHITECTURE §2. DoD: Base DoD + Truth. Related EVAL (shared): EVAL-003 (TeachSpark/RailCite/Velora), EVAL-011, EVAL-013, EVAL-014 (video slot). Owner Claude · Phase 5.
Source: tickets.md § TKT-29.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 (a) Every chapter body, artifact, metric, thinking node and learning traces to a line in the named CONTENT_INVENTORY §8 pack; a reviewer trace table is attached to the PR.
- [ ] #2 (b) Every metric has value/label/context/asOf/kind/source; self-reported and structural claims labelled as such.
- [ ] #3 (c) Every MISSING item in the pack is omitted or rendered as a labelled placeholder ("Not recorded" / "Demo coming") - never paraphrased into existence.
- [ ] #4 (d) Authorship phrasing "built with Claude Code" where the pack says so; product-model facts stated separately.
- [ ] #5 (e) Hero media from the pack's artifacts (or the media ticket), alt text written.
- [ ] #6 (f) Schema gate green; /work/<slug> axe clean at 390 & 1440; anchors resolve; pnpm eval regressed.
- [ ] #7 Citation validity always labelled "by construction", never a percentage over N queries.
- [ ] #8 Decks' "148 tests / 5,687 docs" never used as current.
- [ ] #9 The failing test is disclosed as "1 stale expectation", not hidden.
- [ ] #10 EVAL-003 rows for RailCite filled.
<!-- AC:END -->
