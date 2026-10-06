---
id: TASK-165
title: Make the EVAL-028 hold-and-drag trail test robust to slow frames
status: To Do
assignee: []
created_date: '2026-10-06 15:07'
labels:
  - P3
dependencies: []
priority: low
type: bug
ordinal: 260000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
eval-028.spec.ts:213 counts live trail nodes after a 40-step drag; nodes expire (LIFETIME) while a slow drag runs, so it reads 3-4 instead of >=5. Measured 2026-10-06 on a quiet Mac: 4/30 fail with the 48px cursor, 2/30 with 22px; pre-existing, not cursor-size related
<!-- SECTION:DESCRIPTION:END -->
