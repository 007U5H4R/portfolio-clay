---
id: TASK-72
title: >-
  TKT-77: Ask my portfolio as the notebook (inline) + AskPanel as a notebook
  drawer / bottom sheet (S21) — five states restyled, EVAL-012 unchanged
status: In Progress
assignee: []
created_date: '2026-09-24 05:49'
updated_date: '2026-09-25 09:50'
labels:
  - P0
  - 'sp:3'
  - m-009
  - phase-a
milestone: m-8
dependencies:
  - TASK-69
priority: high
type: feature
ordinal: 108000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Restyle AskPortfolio/AnswerView/SuggestedPrompts/EvidenceLinks per Design.md §7.1: notebook Sheet with prompt annotation, Inter 18 input, 'Ask →' pill, five chips, five states on ruled paper; AskPanel kept as a notebook drawer/bottom sheet (S21 default). Logic/adapter/provider untouched (TP3). Spec: tickets.md TKT-77.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 eval-012.test.ts, ask-*.test.ts, use-ask.test.tsx untouched and green
- [ ] #2 All five states render on the notebook; ask-inline.spec.ts + /dev/ask updated
- [ ] #3 Panel keyboard path green (ask-panel.spec.ts / EVAL-007)
- [ ] #4 Submitting never navigates; focus lands on 'Answer'
- [ ] #5 EVAL-018 count = 2; input value and answer text are Inter (Dev-04)
- [ ] #6 Reduced motion: instant height, 150 ms opacity
- [ ] #7 If Tushar drops the panel: remove AskPanel/AskPanelLazy/AskAIButton and retire the EVAL-007 clause by a recorded decision
<!-- AC:END -->
