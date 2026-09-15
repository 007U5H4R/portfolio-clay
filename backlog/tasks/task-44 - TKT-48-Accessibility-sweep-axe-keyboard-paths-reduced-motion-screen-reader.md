---
id: TASK-44
title: >-
  TKT-48: Accessibility sweep - axe, keyboard paths, reduced motion, screen
  reader
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P0
  - 'sp:3'
  - qa
  - a11y
milestone: m-6
dependencies:
  - TASK-14
  - TASK-16
  - TASK-17
  - TASK-19
  - TASK-28
  - TASK-29
  - TASK-30
  - TASK-31
  - TASK-32
  - TASK-33
  - TASK-34
  - TASK-38
  - TASK-39
  - TASK-40
  - TASK-41
  - TASK-42
priority: high
type: task
ordinal: 44000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Run axe at 390 & 1440 on every route; execute the full keyboard scripts (nav, MobileMenu, FilterTabs, ExperienceTimeline, AskPanel open/answer/close, ShowTheThinking, OverviewToggle, CopyButton); reduced-motion run asserting no transform animations; a VoiceOver pass on `/`, `/work/teachspark`, `/about` (manual, notes persisted); contrast check of every token pairing actually used.

**Definition of Done.** Base DoD.
**Related EVAL.** EVAL-006, EVAL-007, EVAL-010. **Blockers.** none. **Target sequence.** Phase 7 · **Owner.** Claude (QA-tester subagent).
Source: tickets.md § TKT-48.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 axe 0 critical/serious everywhere.
- [ ] #2 100% of listed flows completable by keyboard with visible focus.
- [ ] #3 Reduced-motion assertion green on all routes.
- [ ] #4 VoiceOver notes in `docs/a11y-pass.md`.
- [ ] #5 Fixes applied or `QA-###` logged.
<!-- AC:END -->
