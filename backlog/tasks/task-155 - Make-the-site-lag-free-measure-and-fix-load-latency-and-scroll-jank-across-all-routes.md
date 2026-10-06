---
id: TASK-155
title: >-
  Make the site lag-free: measure and fix load latency and scroll jank across
  all routes
status: In Progress
assignee: []
created_date: '2026-10-06 09:39'
updated_date: '2026-10-06 09:39'
labels:
  - P1
dependencies: []
priority: high
type: task
ordinal: 238000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar 2026-10-06: the site must not lag and must have no latency issues. Measure first (EVAL-004/005 Lighthouse on every route, mobile+desktop; scroll-jank / long-animation-frame probe on real Chrome on the preview), then fix ranked offenders (TASK-149 hero preloads, off-screen footer-ocean animation, filters, cursor/Lenis costs) and add a runtime-smoothness eval so M-011 parallax can't regress it
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 EVAL-004 Perf >= 90 and EVAL-005 budgets met on every route mobile+desktop
- [ ] #2 No long animation frames > 50 ms during a scripted scroll on /, /work, /projects, /about (real Chrome, preview)
- [ ] #3 No continuous animation runs while off-screen or covered
<!-- AC:END -->
