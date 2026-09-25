---
id: TASK-74
title: >-
  TKT-79: Home assembly + Phase A gate — section order, Reveal, 5-second-test
  pack, pnpm eval on /
status: In Progress
assignee: []
created_date: '2026-09-24 05:49'
updated_date: '2026-09-25 12:33'
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
