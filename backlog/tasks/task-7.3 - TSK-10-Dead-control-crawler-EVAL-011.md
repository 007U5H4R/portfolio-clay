---
id: TASK-7.3
title: 'TSK-10: Dead-control crawler (EVAL-011)'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P0
  - 'sp:2'
milestone: m-1
dependencies:
  - TASK-7.2
parent_task_id: TASK-7
priority: high
type: task
ordinal: 59000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Files.** `tests/e2e/eval-011-dead-controls.spec.ts`, `tests/e2e/crawler.ts`, `tests/e2e/crawler-allowlist.json`.
**Related EVAL.** EVAL-011. Source: tickets.md § TSK-10.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 TKT-07 AC 4; route list comes from `app/sitemap.ts` when TKT-06 has landed, else from a static `tests/e2e/routes.json` (the crawler must not wait on the visual gate - PB1).
- [ ] #2 Report lists every control checked; whitelist file for intentionally external targets; runs at 390 and 1440 (mobile menu controls included).
<!-- AC:END -->
