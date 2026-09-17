---
id: TASK-28
title: 'TKT-28: Content: TeachSpark - full depth'
status: Done
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-17 07:50'
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
ordinal: 28000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Author all 8 chapters, artifacts (persona `InsightCard` "Meera", whitespace/blue-ocean `PrototypeFrame`s from `CS4/docs/assets/`, `HypothesisCard` central hypothesis + A1-A8 summary, `DecisionCard` "Capability, not dependency" vs task-execution, `ExperimentCard` `is_test` exclusion with the 10->8 / 37.5->30 movement, `EvaluationCard` QA gates + 32 event types + Mixpanel funnel, `MetricCard`s for the funnel 72->17->17->12->8->5, median 37.5 min self-reported, referrals 3, all asOf 2026-08-24), the 8-node thinking chain (Observation "my mother, who teaches Sanskrit" ... Outcome mentor challenge -> Wave 1 trust & clarity), learnings (mentor quotes, drop-off retro, "Bangalore four different ways"), 30-sec overview, status copy from TKT-22's live check.

**Source pack.** CONTENT_INVENTORY §8.1 (+ §1.5 examples). **Media.** TKT-22 (soft; video/screenshots).
**Dependencies.** common + Tushar's canonical metric snapshot decision (recommended 2026-08-24 Final PRD, test handsets excluded).
**MISSING -> placeholders/omissions.** teacher interview notes/counts · pilot testimonials · retention/K-factor · LLM output-quality evals · production WhatsApp number · (screenshots/video if TKT-22 is late).
**Blockers.** Tushar - metric date decision. **Related EVAL.** shared + EVAL-004 (`/work/teachspark` Lighthouse re-check with full content).

**Common contract (TKT-28..33, TKT-54).** Type Task · Milestone M-005 · Dependencies TKT-19, TKT-20, TKT-21 (+ TKT-15 record exists). Media tickets are soft for every content ticket (PB4): a missing video renders DemoVideo's "Demo coming" state and a missing screenshot renders a labelled hero placeholder. Product requirement: Solution-PRD §5 Case study + §7 truth rules; CONTENT_INVENTORY §3 field->chapter mapping + the named §8 pack; COMPONENT_ARCHITECTURE §2. DoD: Base DoD + Truth. Related EVAL (shared): EVAL-003 (TeachSpark/RailCite/Velora), EVAL-011, EVAL-013, EVAL-014 (video slot). Owner Claude · Phase 5.
Source: tickets.md § TKT-28.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 (a) Every chapter body, artifact, metric, thinking node and learning traces to a line in the named CONTENT_INVENTORY §8 pack; a reviewer trace table is attached to the PR.
- [ ] #2 (b) Every metric has value/label/context/asOf/kind/source; self-reported and structural claims labelled as such.
- [ ] #3 (c) Every MISSING item in the pack is omitted or rendered as a labelled placeholder ("Not recorded" / "Demo coming") - never paraphrased into existence.
- [ ] #4 (d) Authorship phrasing "built with Claude Code" where the pack says so; product-model facts stated separately.
- [ ] #5 (e) Hero media from the pack's artifacts (or the media ticket), alt text written.
- [ ] #6 (f) Schema gate green; /work/<slug> axe clean at 390 & 1440; anchors resolve; pnpm eval regressed.
- [ ] #7 Exactly one metric snapshot date used everywhere (no mixing 08-24 and 08-26 - pack rule).
- [ ] #8 "625 tests" never appears (not reproduced); tests figure is "335 passed / 2 skipped (phase-6, 2026-08-21)".
- [ ] #9 Role text: solo MVP build, group discovery Sat-Mon.
- [ ] #10 Live status text reflects TKT-22's dated check.
- [ ] #11 EVAL-003 mapping rows for TeachSpark filled in the traceability table (TKT-39).
<!-- AC:END -->
