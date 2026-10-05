---
id: TASK-97
title: >-
  Replace /work with a Work Experience timeline and move the project index to a
  new /projects tab
status: Done
assignee: []
created_date: '2026-09-26 05:14'
updated_date: '2026-09-26 12:26'
labels:
  - P1
  - M-009
dependencies: []
priority: high
type: feature
ordinal: 147000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar 2026-09-26: /work becomes the collage Work Experience timeline from his reference (real company logos, employer cities shown, content from data files); the 11-project index moves to a new /projects nav tab.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Scope +: Education section below Work Experience (Tushar reference), separated by a torn paper cutout with parallax; nav label Work → Experience. Decisions (Tushar 2026-09-26): /projects tab for the project index; real logos; cities shown; content from data files.

2026-09-26 Tushar nav decision (7 items: Home · Experience · Projects · Thinking · About · Playground · Certifications): full nav from 1440 px up; below 1440 the header shows the menu button / paper drawer (orchestrator implements at merge). Open for Tushar: 11 data-vs-image wording mismatches (docs/reports/TKT-101.md W1–W11), Education bullets missing in data, NIT Calicut logo is fair-use (not Commons).

2026-09-26 Tushar: '1. Generate the education bullets, 2. image wins, 3. Keep the NIT Calicut logo' → education bullets from his reference image; work-experience data updated to the image wording (also feeds /about); NIT Calicut fair-use logo kept at his direction.

Merged into integration; full gate on 13d7685: unit 618, build 15 static routes, full e2e 1195/1 (the 1 = stale CTA locator, fixed 09dbd5b, 8/8), bundles ≤ 161.2 kB.
<!-- SECTION:NOTES:END -->
