---
id: TASK-135
title: 'Hide the Thinking and Playground tabs behind a nav flag, keeping the pages'
status: Done
assignee:
  - '@claude'
created_date: '2026-09-29 14:01'
updated_date: '2026-09-29 14:13'
labels:
  - P3
  - m-009
dependencies: []
priority: low
type: enhancement
ordinal: 185000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar 2026-09-29: hide Thinking and Playground from the header tabs but keep them in the backend so they can come back. About stays.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
lib/nav.ts: allNavItems keeps every tab; hidden: true on Thinking and Playground; navItems filters them. Pages stay built, public and in the sitemap. To restore a tab, delete its hidden: true. Checks: tsc, lint, routes unit 9/9, build; e2e header-tabs/layout/eval-007/thinking/playground/eval-011 at w390/768/1440: 86 passed first run, and layout's hard-coded Playground-tab check was updated (19/19 after).
<!-- SECTION:NOTES:END -->
