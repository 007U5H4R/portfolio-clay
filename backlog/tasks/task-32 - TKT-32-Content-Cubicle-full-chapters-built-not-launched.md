---
id: TASK-32
title: 'TKT-32: Content: Cubicle - full chapters, built not launched'
status: In Progress
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-17 10:21'
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
ordinal: 32000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Chapters on problem, Aarav persona, visible-collaboration insight, debate protocol + stop rules, four-artifact architecture, QA evidence (326 tests / 97 TC rows PASS 29 · BLOCKED 17 · Planned 48, gates), outcome = no live run; artifacts: `InsightCard` "Nobody makes the collaboration visible", `HypothesisCard` targets (activation >=60% etc. - as targets, unmeasured), `DecisionCard` "Trust first, ownership second, autonomy last", `EvaluationCard` QA gates, `MetricCard`s build-quality only (tests, contrast) - cost/latency "unmeasured" never shown as numbers; thinking chain; learnings L1/L2/L8.

**Source pack.** §8.3. **Media.** TKT-27 (soft/conditional). **Dependencies.** common; Tushar: team names + his named role.
**MISSING.** live URL · deployment · real run · product metrics · interviews · team names/role · screenshots · evals · final deck · OG.
**Blockers.** Tushar - role/team names (placeholder otherwise).

**Common contract (TKT-28..33, TKT-54).** Type Task · Milestone M-005 · Dependencies TKT-19, TKT-20, TKT-21 (+ TKT-15 record exists). Media tickets are soft for every content ticket (PB4): a missing video renders DemoVideo's "Demo coming" state and a missing screenshot renders a labelled hero placeholder. Product requirement: Solution-PRD §5 Case study + §7 truth rules; CONTENT_INVENTORY §3 field->chapter mapping + the named §8 pack; COMPONENT_ARCHITECTURE §2. DoD: Base DoD + Truth. Related EVAL (shared): EVAL-003 (TeachSpark/RailCite/Velora), EVAL-011, EVAL-013, EVAL-014 (video slot). Owner Claude · Phase 5.
Source: tickets.md § TKT-32.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 (a) Every chapter body, artifact, metric, thinking node and learning traces to a line in the named CONTENT_INVENTORY §8 pack; a reviewer trace table is attached to the PR.
- [ ] #2 (b) Every metric has value/label/context/asOf/kind/source; self-reported and structural claims labelled as such.
- [ ] #3 (c) Every MISSING item in the pack is omitted or rendered as a labelled placeholder ("Not recorded" / "Demo coming") - never paraphrased into existence.
- [ ] #4 (d) Authorship phrasing "built with Claude Code" where the pack says so; product-model facts stated separately.
- [ ] #5 (e) Hero media from the pack's artifacts (or the media ticket), alt text written.
- [ ] #6 (f) Schema gate green; /work/<slug> axe clean at 390 & 1440; anchors resolve; pnpm eval regressed.
- [ ] #7 Role text never claims solo - "team of 6; my named role: {pending}" placeholder until Tushar supplies.
- [ ] #8 No product metrics.
- [ ] #9 Status "Built, not launched" unless TKT-27 flips it.
<!-- AC:END -->
