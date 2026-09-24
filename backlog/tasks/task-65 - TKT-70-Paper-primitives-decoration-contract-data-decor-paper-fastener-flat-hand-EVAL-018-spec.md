---
id: TASK-65
title: >-
  TKT-70: Paper primitives + decoration contract
  (data-decor/paper/fastener/flat/hand) + EVAL-018 spec
status: To Do
assignee: []
created_date: '2026-09-24 05:49'
labels:
  - P0
  - 'sp:5'
  - m-009
  - phase-0
milestone: m-8
dependencies:
  - TASK-64
priority: high
type: feature
ordinal: 101000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build components/paper/* exactly per Design.md §3.1 (TornEdge, Sticky, Annotation, Sketch ×7, Note, Tape/Pin fasteners, Sheet variants, Illustration, FlatZone, Hand, paper DraftTag/StatusBadge; Prose becomes data-flat). /dev/primitives re-boarded with a count readout and a ?violate=1 fixture. tests/e2e/eval-018.spec.ts implements §3.2 over every route; EVAL-018 leaves DEFERRED_SPECS. Spec: tickets.md TKT-70.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every primitive renders exactly the §3.1 attribute; unit tests assert the value sets and aria-hidden on text-bearing decorations
- [ ] #2 Sheet refuses a 3rd fastener; rotation clamped to caps; Hand limits (label ≤3 words, cta ≤6 words, quote ≤240 chars + cite) enforced by tests
- [ ] #3 eval-018.spec.ts counts per section/header/footer (nearest-section ownership), Caveat computed-font rule, flat zones, aria-hidden; proven by the violating fixture and a clean board
- [ ] #4 pnpm eval --only EVAL-018 runs the spec (not deferred) and writes real counts; legacy-route hits listed and parked with reasons
- [ ] #5 Draw-ins 400→0 over 1.1 s (delay 0.5 s, once); complete under reduced motion; Reveal = opacity + 12 px
- [ ] #6 /dev/primitives shows every primitive at 390 and 1440 and itself passes EVAL-018
<!-- AC:END -->
