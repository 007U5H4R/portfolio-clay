---
id: TASK-45
title: >-
  TKT-49: Performance pass - Lighthouse, JS budget, LCP/CLS, fonts, images,
  video
status: Blocked
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-26 09:12'
labels:
  - P0
  - 'sp:3'
  - qa
  - performance
milestone: m-6
dependencies:
  - TASK-14
  - TASK-16
  - TASK-17
  - TASK-19
  - TASK-28
  - TASK-29
  - TASK-30
  - TASK-31
  - TASK-32
  - TASK-33
  - TASK-34
  - TASK-38
  - TASK-39
  - TASK-40
  - TASK-41
  - TASK-42
  - TASK-22
priority: high
type: task
ordinal: 45000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Measure first (`pnpm eval --only EVAL-004,EVAL-005`, 3-run median) then fix the largest offenders: font subsetting/`display:swap`, `next/image` sizes/priority, lazy `AskPanel`/`motion` chunks, clay shadow paint cost on long pages, video posters <=120 kB, third-party = none. Record before/after in `evals/results/`.

**Definition of Done.** Base DoD + Perf.
**Dependencies.** same as TKT-47 (+ TKT-22 real media on `/work/teachspark`).
**Related EVAL.** EVAL-004, EVAL-005. **Blockers.** none. **Target sequence.** Phase 7 · **Owner.** Claude.
Source: tickets.md § TKT-49.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 >= 90/95/95/95 mobile + desktop on `/`, `/work`, `/work/teachspark`, `/about`.
- [ ] #2 `/` first-load JS <= 180 kB gz, LCP <= 2.5 s, CLS < 0.05.
- [ ] #3 Before/after JSON persisted.
- [ ] #4 No threshold lowered (EV2).
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-26 triage (orchestrator for Tushar): No longer needed — obsolete. This performance pass targeted the pre-redesign clay design (clay shadow paint cost, /work and /about in the old visual system) which no longer exists (M-008/pre-M-009 code deleted in TKT-89). Performance work for the current illustrated site is now owned by M-009's own ticket TKT-92/TASK-88 (mobile LCP <= 2.5s, Lighthouse >= 90 on / and /work/teachspark, preview evidence recorded 2026-09-25), which is out of this triage's scope (M-009 milestone m-8).
<!-- SECTION:NOTES:END -->
