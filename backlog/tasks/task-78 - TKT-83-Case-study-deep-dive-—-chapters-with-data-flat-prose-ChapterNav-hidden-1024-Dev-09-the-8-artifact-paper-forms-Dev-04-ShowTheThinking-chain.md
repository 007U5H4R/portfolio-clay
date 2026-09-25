---
id: TASK-78
title: >-
  TKT-83: Case-study deep dive — chapters with data-flat prose, ChapterNav
  (hidden <1024, Dev-09), the 8 artifact paper forms (Dev-04), ShowTheThinking
  chain
status: In Progress
assignee: []
created_date: '2026-09-24 05:49'
updated_date: '2026-09-25 09:50'
labels:
  - P0
  - 'sp:8'
  - m-009
  - phase-b
milestone: m-8
dependencies:
  - TASK-76
priority: high
type: feature
ordinal: 114000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Per Design.md §7.3 deep dive: 200px/1fr grid, sticky ChapterNav (not rendered <1024), nested chapter sections with Prose data-flat, eight artifact paper forms (insight/hypothesis/metric/decision/evaluation/experiment/prototype/generic), ShowTheThinking chain with dashed path sketch and medallions; /dev/artifacts + /dev/thinking restyled. Spec: tickets.md TKT-83.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every chapter Prose is inside [data-flat] with 0 [data-decor] at both widths; data-hand=quote blockquotes allowed
- [ ] #2 All 8 artifact types render from fixtures in the §7.3 form; Inter for hypothesis text / kind badges / status (Dev-04)
- [ ] #3 ChapterNav absent <1024; aria-current tracks the visible chapter ≥1024; anchors resolve (TP8)
- [ ] #4 ShowTheThinking: aria-expanded toggle, 8 nodes revealed on click only, keyboard path green, reduced motion all-at-once
- [ ] #5 EVAL-018: deep-dive outer 0, each chapter 0, thinking 2
- [ ] #6 axe 0 critical/serious on /work/teachspark at 390 & 1440
- [ ] #7 artifacts/case-study specs updated; EVAL-003 mapping unchanged (8/8)
<!-- AC:END -->
