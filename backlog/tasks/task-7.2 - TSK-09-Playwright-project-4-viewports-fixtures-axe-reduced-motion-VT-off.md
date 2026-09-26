---
id: TASK-7.2
title: 'TSK-09: Playwright project: 4 viewports, fixtures, axe, reduced-motion, VT-off'
status: Blocked
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-26 09:13'
labels:
  - P0
  - 'sp:2'
milestone: m-1
dependencies:
  - TASK-7.1
parent_task_id: TASK-7
priority: high
type: task
ordinal: 58000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Files.** `playwright.config.ts`, `tests/e2e/fixtures.ts`, `tests/e2e/eval-00{2,6,7,8}.spec.ts`, `tests/e2e/eval-01{0,4,5}.spec.ts`.
**Related EVAL.** EVAL-002, 006, 007, 008, 010, 014, 015. Source: tickets.md § TSK-09.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Projects `w390/w768/w1024/w1440`; shared fixtures for `reducedMotion`, `noViewTransitions`.
- [ ] #2 axe helper asserting 0 critical/serious; overflow helper (`scrollWidth <= clientWidth`); spec files per EVAL id.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-26 triage (orchestrator for Tushar): No longer needed — delivered under parent TKT-07 (Done). playwright.config.ts, tests/e2e/fixtures.ts and the 4-viewport/axe/reduced-motion project exist; this sub-task was never closed.
<!-- SECTION:NOTES:END -->
