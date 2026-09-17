---
id: TASK-31
title: 'TKT-31: Content: Nuptis'
status: Done
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-17 10:20'
labels:
  - P1
  - 'sp:3'
  - content
milestone: m-4
dependencies:
  - TASK-19
  - TASK-20
  - TASK-21
  - TASK-15
priority: high
type: task
ordinal: 31000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Chapters emphasising problem framing, risk-tier verification insight, North Star definition, explicit cut list, the kill decision (linking to `/work/velora`); artifacts: `InsightCard` risk-tier quote, `HypothesisCard` North Star, `DecisionCard` cut list, `EvaluationCard` mobile sweep (9 routes, 1 bug), `PrototypeFrame`s dashboard/contingency; metrics: "none measured" stated explicitly (no `MetricCard`s); thinking chain; learnings (self-feedback quote).

**Source pack.** §8.4. **Media.** TKT-24 (soft; 8 screenshots exist). **Dependencies.** common.
**MISSING.** pilot/usage data · analytics sheet · tests · mentor feedback · Excalidraw export · public repo.
**Blockers.** none.

**Common contract (TKT-28..33, TKT-54).** Type Task · Milestone M-005 · Dependencies TKT-19, TKT-20, TKT-21 (+ TKT-15 record exists). Media tickets are soft for every content ticket (PB4): a missing video renders DemoVideo's "Demo coming" state and a missing screenshot renders a labelled hero placeholder. Product requirement: Solution-PRD §5 Case study + §7 truth rules; CONTENT_INVENTORY §3 field->chapter mapping + the named §8 pack; COMPONENT_ARCHITECTURE §2. DoD: Base DoD + Truth. Related EVAL (shared): EVAL-003 (TeachSpark/RailCite/Velora), EVAL-011, EVAL-013, EVAL-014 (video slot). Owner Claude · Phase 5.
Source: tickets.md § TKT-31.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 (a) Every chapter body, artifact, metric, thinking node and learning traces to a line in the named CONTENT_INVENTORY §8 pack; a reviewer trace table is attached to the PR.
- [ ] #2 (b) Every metric has value/label/context/asOf/kind/source; self-reported and structural claims labelled as such.
- [ ] #3 (c) Every MISSING item in the pack is omitted or rendered as a labelled placeholder ("Not recorded" / "Demo coming") - never paraphrased into existence.
- [ ] #4 (d) Authorship phrasing "built with Claude Code" where the pack says so; product-model facts stated separately.
- [ ] #5 (e) Hero media from the pack's artifacts (or the media ticket), alt text written.
- [ ] #6 (f) Schema gate green; /work/<slug> axe clean at 390 & 1440; anchors resolve; pnpm eval regressed.
- [ ] #7 "No AI" stated - Assistant is keyword-matched canned responses.
- [ ] #8 "No automated tests" disclosed.
- [ ] #9 Status "Live (mock data)".
<!-- AC:END -->
