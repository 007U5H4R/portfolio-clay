---
id: TASK-64.1
title: >-
  TSK-30: globals.css @theme + derived properties + grain + tokens-check
  AUTHORITATIVE + codemod
status: To Do
assignee: []
created_date: '2026-09-24 05:49'
labels:
  - P0
  - 'sp:2'
  - m-009
milestone: m-8
dependencies: []
parent_task_id: TASK-64
priority: high
type: task
ordinal: 123000
---

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Paste Design.md §2.1 @theme verbatim; derived table as :root custom properties; body::before grain; scripts/codemod-tokens.ts applied to class strings, var(--color-*) and @apply; review false positives (bg-white is not a token).
<!-- SECTION:NOTES:END -->
