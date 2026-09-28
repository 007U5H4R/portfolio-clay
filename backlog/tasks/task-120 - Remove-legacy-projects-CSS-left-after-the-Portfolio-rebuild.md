---
id: TASK-120
title: Remove legacy /projects CSS left after the Portfolio rebuild
status: Done
assignee:
  - '@claude-cloud'
created_date: '2026-09-28 07:57'
updated_date: '2026-09-28 14:30'
labels:
  - P3
dependencies: []
priority: low
type: chore
ordinal: 170000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TASK-116 left the old /projects index CSS in app/globals.css because part of it styles the home Featured cards; split and delete the unused rules.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Merged 2026-09-28 (794bbc5). Deleted the dead TKT-80 /work index CSS (−12.9 kB source, −1.6 kB gz built); kept 5 rules used by the home Featured cards. Before/after screenshots of /, /projects and /work at 390 and 1440 are pixel-identical. 675 unit tests; 128 e2e passed (7 load timeouts passed on rerun). Ran on a local clone, not in the cloud.
<!-- SECTION:NOTES:END -->
