---
id: TASK-156
title: 'M-011 P0: Paper World tokens, PaperParallaxScene and paperMotion'
status: Done
assignee: []
created_date: '2026-10-06 09:44'
updated_date: '2026-10-06 17:50'
labels:
  - P1
milestone: m-10
dependencies: []
priority: high
type: feature
ordinal: 239000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
One shared depth/material/motion primitive (spec §02-07, §25-30) so every scene inherits the same physics (EXE-40/44/45)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Material tokens + bottom-right depth scale + par factors land with tokens:check pairs green both themes; PaperParallaxScene + paperMotion pass EVAL-032/033 specs; home first-load JS <= 180 kB gz
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
On preview 2026-10-06 at e35356e (dpl_37S8mgACAicvnA1SuAWXVzY99BU8, READY, verified live). Gate + style gate: EXE-54, EXE-56.
<!-- SECTION:NOTES:END -->
