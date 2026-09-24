---
id: TASK-64.2
title: >-
  TSK-31: Fonts — Fraunces + Inter + Caveat via next/font/google; Manrope
  removed
status: Done
assignee: []
created_date: '2026-09-24 05:49'
updated_date: '2026-09-24 08:58'
labels:
  - P0
  - 'sp:1'
  - m-009
milestone: m-8
dependencies:
  - TASK-64.1
parent_task_id: TASK-64
priority: high
type: task
ordinal: 124000
---

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
app/layout.tsx loaders + className variables; --font-* in @theme; delete the Manrope loader (OG TTFs stay until TKT-78); verify no runtime font request in smoke.spec.ts.
<!-- SECTION:NOTES:END -->
