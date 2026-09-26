---
id: TASK-16.3
title: 'TSK-15: WorkHero + page assembly + OG + Playwright suite'
status: Blocked
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-26 09:13'
labels:
  - P1
  - 'sp:1'
milestone: m-3
dependencies:
  - TASK-16.2
  - TASK-6
parent_task_id: TASK-16
priority: high
type: task
ordinal: 64000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Files.** `components/projects/WorkHero.tsx`, `app/work/page.tsx`, `app/work/opengraph-image.tsx`, `tests/e2e/work.spec.ts`.
**Related EVAL.** EVAL-004, EVAL-017. Source: tickets.md § TSK-15.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 TKT-16 AC 7; `tests/e2e/work.spec.ts` covers per-filter slug sets and deep links.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-26 triage (orchestrator for Tushar): No longer needed — delivered under parent TKT-16 (Done). components/projects/WorkHero.tsx exists (later restyled to a scene-bleed opener per TKT-80/TASK-75.1); this sub-task was never closed.
<!-- SECTION:NOTES:END -->
