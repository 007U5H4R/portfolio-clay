---
id: TASK-43
title: 'TKT-47: Responsive sweep - every route at 390/768/1024/1440'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P1
  - 'sp:3'
  - qa
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
ordinal: 43000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Playwright screenshot pack for every route (incl. all 11 case studies and 5 essays) at the four widths -> `docs/screenshots/<route>/<width>.png`; automated asserts: no horizontal overflow, no control <44x44, no text <14px, images have intrinsic sizes (CLS); manual review pass for clipping, wrap, and the FilterTabs peek; fix list executed as small commits.

**Definition of Done.** Base DoD.
**Related EVAL.** EVAL-008. **Blockers.** none. **Target sequence.** Phase 7 · **Owner.** Claude (QA-tester subagent, separate from implementers).
Source: tickets.md § TKT-47.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 0 overflow, 0 sub-44px controls, 0 sub-14px text across all routes x widths.
- [ ] #2 Screenshot pack committed.
- [ ] #3 Defects fixed or logged as `QA-###` with reason.
- [ ] #4 `pnpm eval --only EVAL-008` green.
<!-- AC:END -->
