---
id: TASK-132
title: Put each case-file sub-project on its own line
status: Done
assignee:
  - '@claude'
created_date: '2026-09-29 09:27'
updated_date: '2026-09-29 09:29'
labels:
  - P3
  - m-009
dependencies: []
priority: low
type: bug
ordinal: 182000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar 2026-09-29: on the Telus Health case file 'Flag and correct' sat on the same line as 'Ingestion on GCP'; the sub-project list wrapped as a flex row. Make it one item per line on every case file.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
The .pf-case-streams list is now a single-column grid (was a wrapping flex row). New e2e check: no two sub-projects share a line in any case file. It failed on the old build (Telus Health / LifeWorks) and passes after the fix. Build, lint, and projects + eval-006 e2e at w390/w768/w1440: 32 passed, 0 failed.
<!-- SECTION:NOTES:END -->
