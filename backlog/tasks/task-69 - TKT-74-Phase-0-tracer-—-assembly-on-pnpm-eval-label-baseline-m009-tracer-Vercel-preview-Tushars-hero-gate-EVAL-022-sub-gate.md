---
id: TASK-69
title: >-
  TKT-74: Phase-0 tracer — assembly on /, pnpm eval --label
  baseline-m009-tracer, Vercel preview, Tushar's hero gate (EVAL-022 sub-gate)
status: In Progress
assignee: []
created_date: '2026-09-24 05:49'
updated_date: '2026-09-25 03:23'
labels:
  - P0
  - 'sp:2'
  - m-009
  - phase-0
milestone: m-8
dependencies:
  - TASK-66
  - TASK-67
  - TASK-68
priority: high
type: task
ordinal: 105000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Assemble / as hero → legacy sections in paper colours → band; tracer screenshots at 4 widths; full pnpm eval --label baseline-m009-tracer persisted (EV6 baseline); Vercel preview of the branch; Lighthouse mobile+desktop on the preview (LCP element = poster, ≤2.5 s); Fraunces-axes result recorded; Tushar's written hero approval recorded as decisions.md EXE-n. Spec: tickets.md TKT-74.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 baseline-m009-tracer.json committed with provenance
- [ ] #2 bundle-budget on / ≤180 kB gz, or a perf ticket opened before Phase A (budget untouched, EV6)
- [ ] #3 Preview Lighthouse: poster is the LCP element, LCP ≤2.5 s mobile, perf ≥90
- [ ] #4 EVAL-019 4/4 · EVAL-020 13/13 · EVAL-021 100 % · EVAL-018 green on / (legacy routes parked with reasons)
- [ ] #5 Tracer screenshot pack (8 PNG) committed
- [ ] #6 Tushar's approval in writing as EXE-n; change requests in Design.md §11 before TKT-75
- [ ] #7 HANDOFF.md updated with the gate outcome
<!-- AC:END -->
