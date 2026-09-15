---
id: TASK-7.5
title: 'TSK-12: pnpm eval orchestrator + results/provenance + baseline diff + CI'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P0
  - 'sp:2'
milestone: m-1
dependencies:
  - TASK-7.2
  - TASK-7.3
  - TASK-7.4
parent_task_id: TASK-7
priority: high
type: task
ordinal: 61000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Files.** `scripts/eval.ts`, `evals/results/`, `.github/workflows/eval.yml`, `docs/eval.md`.
**Related EVAL.** all automated. Source: tickets.md § TSK-12.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 TKT-07 AC 1, 6, 7; `--only EVAL-012` filter flag; `--baseline <file>` flag.
- [ ] #2 Never overwrites an existing results file (versioned by sha).
<!-- AC:END -->
