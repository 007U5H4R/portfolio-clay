---
id: TASK-86
title: >-
  TKT-91: Hand-off to Stages 8–10 — preview record run
  (eval-run-m009-rc-<sha>.json), OG inspector pass, Design.md §11 current, PWA
  sync, HANDOFF
status: In Progress
assignee: []
created_date: '2026-09-24 05:49'
updated_date: '2026-09-25 17:46'
labels:
  - P0
  - 'sp:3'
  - m-009
  - phase-d
milestone: m-8
dependencies:
  - TASK-85
priority: high
type: task
ordinal: 122000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Deploy the branch preview; full pnpm eval against the preview URL persisted with provenance; manual EVAL-017 pass on both inspectors (7 families); Design.md §11 reconciled; tickets/milestones/Campfire/HANDOFF/Obsidian/memory synced; Session-Clearing block. Spec: tickets.md TKT-91.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every Critical EVAL PASS and no High unaddressed or explicitly parked
- [ ] #2 EVAL-005 ≤180 kB gz from bundle-budget --json on the record run; LCP element = hero poster on the preview
- [ ] #3 7/7 OG families render on both inspectors in the paper skin
- [ ] #4 Design.md §11 has a row for every deviation the packs show
- [ ] #5 git diff main..HEAD --stat reviewed — only intended files
- [ ] #6 PWA synchronized (statuses, sp:, dependencies)
- [ ] #7 HANDOFF names exactly what Stage 8 must open
<!-- AC:END -->
