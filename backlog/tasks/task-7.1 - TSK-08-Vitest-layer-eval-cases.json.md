---
id: TASK-7.1
title: 'TSK-08: Vitest layer + eval-cases.json'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P0
  - 'sp:1'
milestone: m-1
dependencies:
  - TASK-3
parent_task_id: TASK-7
priority: high
type: task
ordinal: 57000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Files.** `vitest.config.ts`, `evals/eval-cases.json`, `tests/unit/*.test.ts`, `lib/format.ts`.
**Related EVAL.** EVAL-012 slot, EVAL-013. Source: tickets.md § TSK-08.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Vitest config (jsdom + node projects); schema tests from TKT-03 run here.
- [ ] #2 `evals/eval-cases.json` authored; `format.ts` helpers tested.
<!-- AC:END -->
