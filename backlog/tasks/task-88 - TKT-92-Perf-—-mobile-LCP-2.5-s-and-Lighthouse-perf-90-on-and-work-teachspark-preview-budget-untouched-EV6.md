---
id: TASK-88
title: >-
  TKT-92: Perf — mobile LCP <= 2.5 s and Lighthouse perf >= 90 on / and
  /work/teachspark (preview), budget untouched (EV6)
status: In Progress
assignee: []
created_date: '2026-09-25 05:59'
updated_date: '2026-09-25 07:39'
labels:
  - P0
  - 'sp:3'
  - m-009
  - phase-0
milestone: m-8
dependencies:
  - TASK-87
  - TASK-89
  - TASK-90
priority: high
type: bug
ordinal: 105200
---

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Preview mobile LCP <= 2500 ms and perf >= 90 on / (LCP element = hero banner image) and /work/teachspark
- [ ] #2 Root cause measured first (LCP breakdown: TTFB, resource load delay/duration, render delay; font weight); fix is a smarter approach, thresholds never edited
- [ ] #3 Before/after Lighthouse JSON in evals/results/lighthouse-m009-tracer/
<!-- AC:END -->
