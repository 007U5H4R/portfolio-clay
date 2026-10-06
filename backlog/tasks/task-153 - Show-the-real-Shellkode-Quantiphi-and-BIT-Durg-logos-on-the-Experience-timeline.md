---
id: TASK-153
title: >-
  Show the real Shellkode, Quantiphi and BIT Durg logos on the Experience
  timeline
status: Done
assignee: []
created_date: '2026-10-06 09:17'
updated_date: '2026-10-06 18:02'
labels:
  - P2
dependencies: []
priority: medium
type: enhancement
ordinal: 236000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar supplied the official logo files (2026-10-06); the three entries currently fall back to the name set in type (Dev-92). Trim, enhance (BIT Durg is a 200px JPEG), add to ORG_LOGOS with provenance
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All three cards show the supplied logo crisp at 1x and 2x, readable in light and dark, no CLS; provenance recorded
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
On preview a35dc8f (dpl_F77o4Xyi7aUVJL1LkvYJ1vCBeqLp, READY), verified live 2026-10-06. Gate: unit (isolated) ✓, lint ✓, build ✓, work/tracer/layout/t4-chrome/header specs 82+35 passed (2 load-timeouts re-run green in isolation).

AI upscale (Higgsfield bytedance, job a02d88aa, 2 cr) replaced the Lanczos BIT Durg logo: 420x420, 68,520 B, live at 0b0f187.
<!-- SECTION:NOTES:END -->
