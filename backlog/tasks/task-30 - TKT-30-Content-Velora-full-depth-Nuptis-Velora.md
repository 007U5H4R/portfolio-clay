---
id: TASK-30
title: 'TKT-30: Content: Velora - full depth (Nuptis -> Velora)'
status: Done
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-17 08:25'
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
ordinal: 30000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
8 chapters with the kill/pivot as the spine ("Weddings were blue - but a shallow pool..."); artifacts: `InsightCard` team-pooled interview quotes (attributed to team), `HypothesisCard` H1 coordination-not-speed, `DecisionCard` Nuptis killed -> Velora, `EvaluationCard` 10/10 vitest + 0 overflow + bundle 156 kB gz (task-6.3 review), `PrototypeFrame`s from `CS3/Velora/docs/screenshots/`, `MetricCard`s limited to what exists (tests 10/10 asOf 2026-09-15); thinking chain; learnings ("Nothing below presents a hypothesis as a validated fact").

**Source pack.** §8.5 (+ §8.4 for the pivot, §1.5 Insight). **Media.** TKT-24 (soft; screenshots exist). **Dependencies.** common.
**MISSING.** usage/pilot data · Tushar-attributed interviews · mentor feedback · Figma URL · live Supabase validation.
**Blockers.** none.

**Common contract (TKT-28..33, TKT-54).** Type Task · Milestone M-005 · Dependencies TKT-19, TKT-20, TKT-21 (+ TKT-15 record exists). Media tickets are soft for every content ticket (PB4): a missing video renders DemoVideo's "Demo coming" state and a missing screenshot renders a labelled hero placeholder. Product requirement: Solution-PRD §5 Case study + §7 truth rules; CONTENT_INVENTORY §3 field->chapter mapping + the named §8 pack; COMPONENT_ARCHITECTURE §2. DoD: Base DoD + Truth. Related EVAL (shared): EVAL-003 (TeachSpark/RailCite/Velora), EVAL-011, EVAL-013, EVAL-014 (video slot). Owner Claude · Phase 5.
Source: tickets.md § TKT-30.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 (a) Every chapter body, artifact, metric, thinking node and learning traces to a line in the named CONTENT_INVENTORY §8 pack; a reviewer trace table is attached to the PR.
- [ ] #2 (b) Every metric has value/label/context/asOf/kind/source; self-reported and structural claims labelled as such.
- [ ] #3 (c) Every MISSING item in the pack is omitted or rendered as a labelled placeholder ("Not recorded" / "Demo coming") - never paraphrased into existence.
- [ ] #4 (d) Authorship phrasing "built with Claude Code" where the pack says so; product-model facts stated separately.
- [ ] #5 (e) Hero media from the pack's artifacts (or the media ticket), alt text written.
- [ ] #6 (f) Schema gate green; /work/<slug> axe clean at 390 & 1440; anchors resolve; pnpm eval regressed.
- [ ] #7 Team baseline table (15-30 days, <10% active work) presented as secondary research, never as own data.
- [ ] #8 "Trust Scores are authored, not verified" disclosed.
- [ ] #9 No users/pilot claimed.
- [ ] #10 EVAL-003 rows for Velora filled.
<!-- AC:END -->
