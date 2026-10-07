---
id: TASK-154
title: Remove the paper chip behind the theme toggle so only the capsule shows
status: Done
assignee: []
created_date: '2026-10-06 09:26'
updated_date: '2026-10-06 09:54'
labels:
  - P3
dependencies: []
priority: low
type: enhancement
ordinal: 237000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar 2026-10-06: drop the rectangular paper box T4 put behind the toggle (header-chip::before); keep only the capsule switch
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Header shows only the capsule toggle in light and dark at 390/1440; toggle behaviour unchanged
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
On preview a35dc8f (dpl_F77o4Xyi7aUVJL1LkvYJ1vCBeqLp, READY), verified live 2026-10-06. Gate: unit (isolated) ✓, lint ✓, build ✓, work/tracer/layout/t4-chrome/header specs 82+35 passed (2 load-timeouts re-run green in isolation).
<!-- SECTION:NOTES:END -->
