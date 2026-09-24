---
id: TASK-82
title: >-
  TKT-87: /about part 2 — experience timeline always-open (Dev-11) with the lead
  fixed (S18, regression test), awards · research · education, page-foot CTA,
  assembly
status: To Do
assignee: []
created_date: '2026-09-24 05:49'
labels:
  - P1
  - 'sp:5'
  - m-009
  - phase-c
milestone: m-8
dependencies:
  - TASK-81
priority: high
type: feature
ordinal: 118000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Per Design.md §7.4: ExperienceTimeline vertical rail with all four story cards open (dl in data-flat, anchors preserved, click-to-open logic removed), lead fixed to the S18 wording; Awards tags, Research patent card + papers, Education; page-foot CTA; /about assembled. Regression: lead string + oldest→newest order. Spec: tickets.md TKT-87.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Four story cards open on load; #experience-<id> anchors scroll; timeline.spec.ts rewritten; open/close logic deleted with its tests
- [ ] #2 Lead regression test green; order oldest → newest
- [ ] #3 EVAL-018: experience 1, proof 2, CTA 1; every story dl inside [data-flat] with 0 decorations
- [ ] #4 Résumé control renders resumeAction() placeholder (EVAL-002 from /about)
- [ ] #5 Patent link + DOI pill resolve; 'DOI pending' is Inter
- [ ] #6 axe 0 critical/serious at 390 & 1440
<!-- AC:END -->
