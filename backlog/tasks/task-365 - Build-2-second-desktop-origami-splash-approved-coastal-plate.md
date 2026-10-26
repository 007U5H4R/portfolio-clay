---
id: TASK-365
title: Build 2-second desktop origami splash (approved coastal plate)
status: Done
assignee: []
created_date: '2026-10-26 02:50'
updated_date: '2026-10-26 10:30'
labels:
  - P2
dependencies: []
priority: medium
type: feature
ordinal: 464000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Desktop-only 2s origami splash: plane crosses the approved coastal environment plate, paper-tear reveal of logo/name with Tushar's avatar, then a short loader, mirroring the phone OrigamiBeach splash (TASK-362).
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Correction #3 (CSS sizing, same session): .od-logo widened to clamp(110,11vw,150)px, .od-unmask switched from an inset-wipe to a circular clip-path reveal (smoother square->circle transition fix), .od-icons/.od-icon enlarged (gap clamp(18,3vw,30), icon clamp(64,7vw,88)), .od-loading bumped to clamp(20,2.2vw,26)px 600-weight white text. Build/lint/full-unit-suite green. e2e origami-desktop.spec.ts: 8 passed, 2 pre-existing failures (lines 142/152, data-intro-desktop-claimed timeout) unrelated to this CSS-only diff -- confirmed via git diff (gate/hydration code untouched) -- flagged as known debt, not fixed this round.
<!-- SECTION:NOTES:END -->
