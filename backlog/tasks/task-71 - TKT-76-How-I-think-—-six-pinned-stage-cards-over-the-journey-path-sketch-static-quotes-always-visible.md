---
id: TASK-71
title: >-
  TKT-76: How I think — six pinned stage cards over the journey path sketch
  (static, quotes always visible)
status: To Do
assignee: []
created_date: '2026-09-24 05:49'
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
ordinal: 107000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Rebuild HowIThink per Design.md §7.1: torn paper section, six Sheet cards pinned over the dashed path Sketch (removed from DOM ≤1024), Caveat numeral labels, sourced quotes as blockquote data-hand=quote + cite, link pills to case-study anchors; expand/roving-tabindex removed. Spec: tickets.md TKT-76.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Six stages, wording from data (unit snapshot); each quote ≤240 chars with cite
- [ ] #2 Links resolve to lib/anchors.ts anchors — crawler green
- [ ] #3 EVAL-018 count = 2 at 1440, 1 at 390; every Caveat element has a valid data-hand
- [ ] #4 Only the link pills are focusable; roving-tabindex code removed; how-i-think.spec.ts rewritten
- [ ] #5 Reveal stagger 70 ms; reduced motion instant
<!-- AC:END -->
