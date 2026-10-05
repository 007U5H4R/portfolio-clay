---
id: TASK-126
title: Portfolio cover product codes fail the EVAL-008 14 px content floor
status: Done
assignee: []
created_date: '2026-09-28 14:45'
updated_date: '2026-09-28 14:56'
labels:
  - P1
dependencies: []
priority: high
type: bug
ordinal: 176000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Found verifying TASK-125: the 12 px cover codes (TS-01, RC-01…) introduced by TASK-121 are labels without data-micro-label, so eval-008 fails on /projects at every width.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-28: fixed. Red: eval-008 /projects failed at all 4 widths on merged tip 1e8abca. Green after fix: typecheck/lint/build, e2e projects+home+eval-008+eval-006 429/0.
<!-- SECTION:NOTES:END -->
