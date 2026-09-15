---
id: TASK-7.4
title: 'TSK-11: Lighthouse CI + bundle budget (EVAL-004/005)'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P0
  - 'sp:1'
milestone: m-1
dependencies:
  - TASK-7.1
parent_task_id: TASK-7
priority: high
type: task
ordinal: 60000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Files.** `lighthouserc.json`, `scripts/bundle-budget.ts`.
**Related EVAL.** EVAL-004, EVAL-005. Source: tickets.md § TSK-11.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `lighthouserc.json` with the four routes, mobile + desktop presets, `numberOfRuns: 3`, assertions >= 0.90/0.95/0.95/0.95.
- [ ] #2 `scripts/bundle-budget.ts` reads `.next` build manifest for `/` first-load JS gz <= 180 kB; LCP <= 2.5 s, CLS < 0.05 asserted.
<!-- AC:END -->
