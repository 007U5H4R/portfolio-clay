---
id: TASK-138
title: 'Fix the eval failures shipped to production with PR #6'
status: Done
assignee: []
created_date: '2026-10-05 11:04'
updated_date: '2026-10-05 16:50'
labels:
  - P1
dependencies: []
priority: high
type: bug
ordinal: 188000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
PR #6 merged and released before its eval finished: 17 e2e failures (EVAL-019 real, intro-video poster reuses hero-poster.webp; /certifications and /about w390 timeouts; EVAL-011 crawl timeout), EVAL-016 audit, Lighthouse asserts
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Verified on preview 2026-10-05: ac14ba8 (dpl_3fb6NdEkHFvWS2i4Dwd5WXuiS41n, READY); merged-tree gate: typecheck ✓, lint 0 errors, unit 871 ✓, targeted e2e 508/0; full e2e 1328/0 on 14d3785 (EXE-28, EXE-31).
<!-- SECTION:NOTES:END -->
