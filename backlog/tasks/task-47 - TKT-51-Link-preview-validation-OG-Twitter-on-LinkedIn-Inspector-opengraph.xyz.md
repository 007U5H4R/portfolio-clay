---
id: TASK-47
title: >-
  TKT-51: Link-preview validation - OG/Twitter on LinkedIn Inspector +
  opengraph.xyz
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P1
  - 'sp:2'
  - seo
milestone: m-6
dependencies:
  - TASK-46
priority: high
type: task
ordinal: 47000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
For each page family (home, work, one case study, about, thinking, playground, contact): fetch tags on the preview URL, render on opengraph.xyz and LinkedIn Post Inspector (human step - screenshots persisted), fix image sizing/absolute URL issues; re-run after production (TKT-53) because absolute URLs change with the domain.

**Definition of Done.** Base DoD (manual eval persisted).
**Related EVAL.** EVAL-017. **Blockers.** none. **Target sequence.** Phase 7 · **Owner.** Claude (Tushar for LinkedIn login if required).
Source: tickets.md § TKT-51.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 7 families render title + description + 1200x630 image on both inspectors.
- [ ] #2 Screenshots in `docs/og/`.
- [ ] #3 Tag test green on preview.
- [ ] #4 Re-validation checklist attached to TKT-53.
<!-- AC:END -->
