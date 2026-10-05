---
id: TASK-110
title: Fix text overlapping during paper-over-paper parallax scroll
status: Done
assignee: []
created_date: '2026-09-27 06:28'
updated_date: '2026-09-27 06:58'
labels:
  - P1
dependencies: []
priority: high
type: bug
ordinal: 160000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar 2026-09-27: text overlaps while scrolling the TKT-96/TKT-106 parallax; lagging section content shows through/collides with the next torn sheet.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-27: fixed on m009/task-110. Verified: typecheck/lint/tokens/build green; 581 e2e passed / 0 failed (stacking, torn-parallax, home, ask, about, playground, EVAL-006/007/008/018; 1 worker); /playground 1440 screenshot mid-scroll shows the bench sheet cleanly covering the title.
<!-- SECTION:NOTES:END -->
