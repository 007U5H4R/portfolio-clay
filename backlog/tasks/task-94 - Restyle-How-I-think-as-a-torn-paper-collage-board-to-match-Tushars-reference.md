---
id: TASK-94
title: Restyle How I think as a torn-paper collage board to match Tushar's reference
status: Done
assignee: []
created_date: '2026-09-26 04:15'
updated_date: '2026-09-26 10:41'
labels:
  - P1
  - M-009
dependencies: []
priority: high
type: enhancement
ordinal: 144000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar 2026-09-26 supplied a target image: deckled paper cards over a collage of torn scraps, leaves and stamps; quotes as taped tinted notes; compact draft tag; arrow CTAs.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Tushar 2026-09-26 follow-up: per-stage 'cloth unrolling' reveal (top anchor, scaleY from transform-origin top, custom ease-out cubic-bezier, inner content fades in 100 ms later); the connecting path isn't visible enough.

r2 merged 7faa962: real collage crops (collage-hit-*), wider cards, ink outlines, bold path; static (motion → TKT-110). Merge check: unit 592, e2e 422/0.
<!-- SECTION:NOTES:END -->
