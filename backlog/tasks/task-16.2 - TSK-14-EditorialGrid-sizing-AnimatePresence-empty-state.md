---
id: TASK-16.2
title: 'TSK-14: EditorialGrid sizing + AnimatePresence + empty state'
status: Blocked
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-26 09:12'
labels:
  - P0
  - 'sp:2'
milestone: m-3
dependencies:
  - TASK-16.1
  - TASK-15
parent_task_id: TASK-16
priority: high
type: task
ordinal: 63000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Files.** `components/projects/{EditorialGrid,ProjectCard}.tsx` (grid mode), `components/projects/EmptyState.tsx`.
**Related EVAL.** EVAL-008, EVAL-011. Source: tickets.md § TSK-14.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 TKT-16 AC 1, 3, 5, 6.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-26 triage (orchestrator for Tushar): No longer needed — obsolete. EditorialGrid no longer exists in the codebase; the /work grid layout was replaced by a numbered editorial index (<ol>) delivered in TKT-80/TASK-75 (Done, Dev-05 conditional EmptyState), per the M-009 illustrated redesign.
<!-- SECTION:NOTES:END -->
