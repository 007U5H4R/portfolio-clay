---
id: TASK-131
title: Remove the Source line from the Portfolio enterprise case files
status: Done
assignee:
  - '@claude'
created_date: '2026-09-29 09:20'
updated_date: '2026-09-29 09:23'
labels:
  - P3
  - m-009
dependencies: []
priority: low
type: enhancement
ordinal: 181000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar 2026-09-29: remove 'Source: Project Manager portfolio V2.0 / Résumé…' from the six case files. Provenance stays in data/enterprise.ts.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Removed the 'Source: …' line (and its helper and CSS) from the six enterprise case files; provenance stays in data/enterprise.ts. The unit test now asserts no Source line. typecheck, lint, 72 unit tests, build, and projects + eval-006 e2e at w390/w1440 (30 passed, 0 failed).
<!-- SECTION:NOTES:END -->
