---
id: TASK-112
title: Show all tabs in the top navigation bar
status: Done
assignee: []
created_date: '2026-09-27 06:51'
updated_date: '2026-09-27 21:03'
labels:
  - P2
dependencies: []
priority: medium
type: enhancement
ordinal: 162000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar 2026-09-27: 'I want all the tabs in top navigation bar' (Image #40). Awaiting: which tabs/width are missing.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-27 Tushar: 'I dont want hamburger menu, I want tabs should be there in top nav bar.' Agent assigned, branch m009/task-112.

2026-09-28: merged (ed732a2, afa7c06). Gate: typecheck/lint/tokens, vitest 625, build 15 routes static, full e2e 1259/0, bundle / 159.8 kB. Hamburger removed at every width; below 1440 a scrollable second tab row (header 109 px at 390). Open for Tushar: two-row header also covers 1024–1439.
<!-- SECTION:NOTES:END -->
