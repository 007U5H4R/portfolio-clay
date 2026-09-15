---
id: TASK-34
title: 'TKT-54: Content: five thin case studies - one task each'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P2
  - 'sp:5'
  - content
milestone: m-4
dependencies:
  - TASK-19
  - TASK-20
  - TASK-21
  - TASK-15
priority: medium
type: task
ordinal: 34000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Author the five evidence-thin case studies (Token Toli · Pratyasa · Tegaki · dino-arcade · cinematic-portfolio) as short, honest pages (`deepDive:false` where chapters stay short; `ShowTheThinking` hidden when a chain has fewer than 8 sourced nodes). Each task names its CONTENT_INVENTORY §8 pack and MISSING list and closes independently; the ticket closes when all five tasks pass the shared contract.

**Objective.** Every personal build has a truthful page without padding thin evidence into a full narrative.
**Product requirement.** Solution-PRD §5 Case study ("discovery-only and playground items get shorter, honest pages"), §7; CONTENT_INVENTORY §3 + §8.7-8.11.
**Definition of Done.** Base DoD + Truth.
**Notes.** Sub-tasks TSK-25..TSK-29; supersedes retired TKT-34..38 (PB2 - one ticket, one context window, five short honest pages). Media: TKT-26 (soft - PB4).
**Related EVAL.** EVAL-011, EVAL-013, EVAL-014 (video slot for Pratyasa/Tegaki/dino/cinematic). **Blockers.** none.
**Target sequence.** Phase 5 (after TKT-28-33) · **Owner.** Claude.

**Common contract (TKT-28..33, TKT-54).** Type Task · Milestone M-005 · Dependencies TKT-19, TKT-20, TKT-21 (+ TKT-15 record exists). Media tickets are soft for every content ticket (PB4): a missing video renders DemoVideo's "Demo coming" state and a missing screenshot renders a labelled hero placeholder. Product requirement: Solution-PRD §5 Case study + §7 truth rules; CONTENT_INVENTORY §3 field->chapter mapping + the named §8 pack; COMPONENT_ARCHITECTURE §2. DoD: Base DoD + Truth. Related EVAL (shared): EVAL-003 (TeachSpark/RailCite/Velora), EVAL-011, EVAL-013, EVAL-014 (video slot). Owner Claude · Phase 5.
Source: tickets.md § TKT-54.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 (a) Every chapter body, artifact, metric, thinking node and learning traces to a line in the named CONTENT_INVENTORY §8 pack; a reviewer trace table is attached to the PR.
- [ ] #2 (b) Every metric has value/label/context/asOf/kind/source; self-reported and structural claims labelled as such.
- [ ] #3 (c) Every MISSING item in the pack is omitted or rendered as a labelled placeholder ("Not recorded" / "Demo coming") - never paraphrased into existence.
- [ ] #4 (d) Authorship phrasing "built with Claude Code" where the pack says so; product-model facts stated separately.
- [ ] #5 (e) Hero media from the pack's artifacts (or the media ticket), alt text written.
- [ ] #6 (f) Schema gate green; /work/<slug> axe clean at 390 & 1440; anchors resolve; pnpm eval regressed.
- [ ] #7 (g) None of the five pages renders a `MetricCard` that is not in its pack.
- [ ] #8 (h) `pnpm eval` regressed once after all five land.
<!-- AC:END -->
