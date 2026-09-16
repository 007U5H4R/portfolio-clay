---
id: TASK-2
title: 'TKT-02: Visual-direction review gate with Tushar'
status: Done
assignee: []
created_date: '2026-09-15 13:22'
updated_date: '2026-09-16 01:53'
labels:
  - P0
  - 'sp:1'
  - gate
milestone: m-0
dependencies:
  - TASK-1
priority: high
type: task
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Human-in-the-loop checkpoint. Present the 8 tracer screenshots, the running dev server, and `baseline-v1.json`; walk the EVAL-001 six-item checklist at 390 and 1440 and the EVAL-009 premium rubric on the hero; confirm avatar likeness on the page (not the PNG). Capture the decision and any direction corrections.

**Objective.** Written approval of the visual direction before any further build (Solution-PRD §11 step 4).
**Product requirement.** Solution-PRD §8 criteria 1 and 8; §9 risks 1-2; evaluation-plan EVAL-001/009 (human review); build-workflow human-in-the-loop gate.
**Definition of Done.** Base DoD (tests/evals N/A beyond recording) + decisions.md EXE-1 records the outcome.
**Notes.** If likeness or "student vs Senior PM" fails, the fix loop is on tokens/tiers/avatar treatment inside TKT-01, not new features.
**Related EVAL.** EVAL-001, EVAL-009. **Blockers.** Tushar's availability.
**Target sequence.** Phase 1 · **Owner.** Tushar (decision) / Claude (presentation + write-back).
Source: tickets.md § TKT-02.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tushar has seen the running page at >=2 widths and the 8 screenshots.
- [ ] #2 EVAL-001 scored (6 items x 2 widths) and EVAL-009 scored on the hero (6 items, 0-2) - recorded in `evals/results/gate-tracer.md`.
- [ ] #3 Explicit written approval ("approved" / "approved with changes: ...") - silence is not approval.
- [ ] #4 Any change requests are written back into `Design.md` (Deviation entry) and/or `decisions.md` (EXE-1) before TKT-04/05/06 start. TKT-03 and TKT-07 may already be running (PB1).
<!-- AC:END -->
