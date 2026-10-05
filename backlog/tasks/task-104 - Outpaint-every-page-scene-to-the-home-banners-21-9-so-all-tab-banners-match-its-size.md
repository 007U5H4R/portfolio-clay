---
id: TASK-104
title: >-
  Outpaint every page scene to the home banner's 21:9 so all tab banners match
  its size
status: Done
assignee: []
created_date: '2026-09-26 06:11'
updated_date: '2026-09-26 12:26'
labels:
  - P1
  - M-009
dependencies: []
priority: high
type: enhancement
ordinal: 154000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar 2026-09-26: 'make the images of all the tabs same height and width similiar to Home tab' — scenes are 3:2/4:3; outpaint to 3168x1344 (Higgsfield, ~2 cr each).
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Merged into integration; full gate on 13d7685: unit 618, build 15 static routes, full e2e 1195/1 (the 1 = stale CTA locator, fixed 09dbd5b, 8/8), bundles ≤ 161.2 kB.
<!-- SECTION:NOTES:END -->
