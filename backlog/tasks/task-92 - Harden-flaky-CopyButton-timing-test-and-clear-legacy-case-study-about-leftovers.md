---
id: TASK-92
title: >-
  Harden flaky CopyButton timing test and clear legacy case-study/about
  leftovers
status: Done
assignee: []
created_date: '2026-09-26 03:57'
updated_date: '2026-09-26 04:40'
labels:
  - P2
  - M-009
dependencies: []
priority: medium
type: chore
ordinal: 142000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
INTEGRATION-ABC remaining issues: CopyButton copied→idle timing fails at 2 workers; old inline metric cards in the case-study header and legacy ids in about.spec (TKT-89 carry).
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Merged dda29ae: CopyButton test timestamps state changes (PW_WORKERS=2 repeat-each=20: 300/0); inline metric cards removed; about.spec ids kept (live, Design §7.4).
<!-- SECTION:NOTES:END -->
