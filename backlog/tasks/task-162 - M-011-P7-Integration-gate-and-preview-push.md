---
id: TASK-162
title: 'M-011 P7: Integration gate and preview push'
status: Done
assignee: []
created_date: '2026-10-06 09:46'
updated_date: '2026-10-06 17:50'
labels:
  - P1
milestone: m-10
dependencies:
  - TASK-158
  - TASK-159
  - TASK-160
  - TASK-161
  - TASK-152
priority: high
type: task
ordinal: 245000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
One full gate on a quiet machine, then push to preview only (production frozen, S34)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 typecheck, lint, check-specs, tokens, build, unit, full e2e green in one lock slot; preview deploy verified; cardboard cursor (TASK-152) checked against spec 11; Obsidian and memory updated
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
On preview 2026-10-06 at e35356e (dpl_37S8mgACAicvnA1SuAWXVzY99BU8, READY, verified live). Gate + style gate: EXE-54, EXE-56.
<!-- SECTION:NOTES:END -->
