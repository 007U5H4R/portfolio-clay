---
id: TASK-115
title: Lower section must slide over the section above during parallax scroll
status: Done
assignee: []
created_date: '2026-09-28 02:32'
updated_date: '2026-09-28 03:13'
labels:
  - P1
dependencies: []
priority: high
type: bug
ordinal: 165000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar 2026-09-28 (Image #45): 'the bottom section should above during scrolling' — a lower section is painting under the one above it on scroll.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-28: fixed (band z 6). Red before fix on home, /about, /playground, case studies; after: typecheck/lint/tokens/build green, targeted e2e 697 passed + 17 re-run passed (first run's 17 = stale test file + host contention from concurrent pnpm installs outside the lock), scroll probe clean at 390/1440 on 10 routes.
<!-- SECTION:NOTES:END -->
