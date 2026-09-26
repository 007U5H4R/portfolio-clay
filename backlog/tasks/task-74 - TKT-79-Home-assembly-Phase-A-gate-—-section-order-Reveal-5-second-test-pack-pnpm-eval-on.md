---
id: TASK-74
title: >-
  TKT-79: Home assembly + Phase A gate — section order, Reveal, 5-second-test
  pack, pnpm eval on /
status: Done
assignee: []
created_date: '2026-09-24 05:49'
updated_date: '2026-09-26 08:20'
labels:
  - P0
  - 'sp:2'
  - m-009
  - phase-a
milestone: m-8
dependencies:
  - TASK-70
  - TASK-71
  - TASK-72
  - TASK-73
priority: high
type: task
ordinal: 110000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
app/page.tsx = hero → Featured → How I think → Ask → band with alternating fills and torn edges; screenshots at 4 widths → docs/screenshots/m-009/home/; EVAL-001 scored at 390/1440; full pnpm eval diffed against the tracer baseline; home mockup pair captured; Tushar's Phase-A approval recorded. Spec: tickets.md TKT-79.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 EVAL-018 on /: hero 3 · featured 4 · how-I-think 2 · ask 2 · header 1 · band 1
- [ ] #2 EVAL-005 ≤180 kB gz still
- [ ] #3 EVAL-001 6/6 elements in the first viewport at both widths
- [ ] #4 No Critical regression vs the tracer baseline
- [ ] #5 Approval recorded (EXE-n or a HANDOFF line quoting Tushar)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-25 (EXE-21): evidence complete on RC 809e326 — full e2e 1050/0, eval 16 pass / 2 informational local-perf fail / 4 manual; preview 2bd4949 mobile / LCP 2338 ms, perf 95. Gate sign-off is Tushar's (not self-approved under EXE-20).

2026-09-26: Tushar signed off — verbatim "signoff on hero Phase A and Phase B" (EXE-22). Gate closed.
<!-- SECTION:NOTES:END -->
