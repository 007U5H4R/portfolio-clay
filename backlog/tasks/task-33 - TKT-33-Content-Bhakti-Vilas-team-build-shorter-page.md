---
id: TASK-33
title: 'TKT-33: Content: Bhakti-Vilas - team build, shorter page'
status: Done
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-17 10:57'
labels:
  - P2
  - 'sp:2'
  - content
milestone: m-4
dependencies:
  - TASK-19
  - TASK-20
  - TASK-21
  - TASK-15
priority: medium
type: task
ordinal: 33000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Shorter chapter set (Context, Problem, Discovery, Bet, Built, Learned; Evaluation/Outcome brief); Tushar's named contribution (segmentation, hypotheses, interview guides; Madhu Mukti solution doc); artifacts: `InsightCard` "Distance was never the variable. Availability was.", `HypothesisCard` "Insure the visit, don't vet the person", `DecisionCard` health meaning coded not front-loaded, `EvaluationCard` mentor Q&A (11 sources, "well-evidenced hypothesis"), `PrototypeFrame` from TKT-25 captures; metrics: team survey numbers attributed to the team; product metrics MISSING; disclosures: translation ~90/500 strings, medical copy unreviewed.

**Source pack.** §8.6. **Media.** TKT-25 (soft - PB4; hero placeholder until UI screenshots are captured). **Dependencies.** common.
**MISSING.** UI screenshots (TKT-25, soft) · usage · tests · team PRD authors · mentor grade · Tushar-fielded interviews.
**Blockers.** none.

**Common contract (TKT-28..33, TKT-54).** Type Task · Milestone M-005 · Dependencies TKT-19, TKT-20, TKT-21 (+ TKT-15 record exists). Media tickets are soft for every content ticket (PB4): a missing video renders DemoVideo's "Demo coming" state and a missing screenshot renders a labelled hero placeholder. Product requirement: Solution-PRD §5 Case study + §7 truth rules; CONTENT_INVENTORY §3 field->chapter mapping + the named §8 pack; COMPONENT_ARCHITECTURE §2. DoD: Base DoD + Truth. Related EVAL (shared): EVAL-003 (TeachSpark/RailCite/Velora), EVAL-011, EVAL-013, EVAL-014 (video slot). Owner Claude · Phase 5.
Source: tickets.md § TKT-33.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 (a) Every chapter body, artifact, metric, thinking node and learning traces to a line in the named CONTENT_INVENTORY §8 pack; a reviewer trace table is attached to the PR.
- [ ] #2 (b) Every metric has value/label/context/asOf/kind/source; self-reported and structural claims labelled as such.
- [ ] #3 (c) Every MISSING item in the pack is omitted or rendered as a labelled placeholder ("Not recorded" / "Demo coming") - never paraphrased into existence.
- [ ] #4 (d) Authorship phrasing "built with Claude Code" where the pack says so; product-model facts stated separately.
- [ ] #5 (e) Hero media from the pack's artifacts (or the media ticket), alt text written.
- [ ] #6 (f) Schema gate green; /work/<slug> axe clean at 390 & 1440; anchors resolve; pnpm eval regressed.
- [ ] #7 Team build with commit split stated (5 Tushar / 3 Shivali).
- [ ] #8 Staged-reveal funnel shown only as "directional estimates".
- [ ] #9 Status "Live prototype (mock data, team build)".
<!-- AC:END -->
