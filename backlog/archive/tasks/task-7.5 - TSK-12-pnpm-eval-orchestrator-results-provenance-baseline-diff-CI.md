---
id: TASK-7.5
title: 'TSK-12: pnpm eval orchestrator + results/provenance + baseline diff + CI'
status: Blocked
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-10-05 13:36'
labels:
  - P0
  - 'sp:2'
milestone: m-1
dependencies: []
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-26 triage (orchestrator for Tushar): No longer needed — delivered under parent TKT-07 (Done). scripts/eval.ts orchestrator with results/provenance and baseline diff exists; this sub-task was never closed.
<!-- SECTION:NOTES:END -->
