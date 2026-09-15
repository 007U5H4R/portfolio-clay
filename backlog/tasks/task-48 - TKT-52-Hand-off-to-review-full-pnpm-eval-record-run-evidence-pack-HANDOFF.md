---
id: TASK-48
title: >-
  TKT-52: Hand-off to review - full pnpm eval record run + evidence pack +
  HANDOFF
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P0
  - 'sp:2'
  - handoff
milestone: m-6
dependencies:
  - TASK-35
  - TASK-43
  - TASK-44
  - TASK-45
  - TASK-46
  - TASK-47
priority: high
type: task
ordinal: 48000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Run the complete suite against the preview deployment and persist `evals/results/eval-run-v1.0.0-rc.json`; assemble the Stage-8 pack (screenshot set from TKT-47, `/dev/primitives` and `/dev/artifacts` boards), the Stage-9 pack (branch diff stats, test/eval results, open `QA-###`), the Stage-10 inputs (headers, audit, PII grep); update `tickets.md` statuses, `HANDOFF.md` and the Obsidian/auto-memory mirrors; present the Session-Clearing block.

**Definition of Done.** Base DoD.
**Related EVAL.** all 17. **Blockers.** none. **Target sequence.** Phase 7 · **Owner.** Claude.
Source: tickets.md § TKT-52.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every Critical EVAL PASS, no High unaddressed (or explicitly parked with reason) per evaluation-plan §6.
- [ ] #2 Results file has full provenance.
- [ ] #3 `git diff main..HEAD --stat` reviewed - only intended files.
- [ ] #4 HANDOFF names exactly what Stage 8 must open.
<!-- AC:END -->
