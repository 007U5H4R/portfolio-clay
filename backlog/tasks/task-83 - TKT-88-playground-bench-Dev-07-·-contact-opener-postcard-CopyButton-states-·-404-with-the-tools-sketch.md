---
id: TASK-83
title: >-
  TKT-88: /playground bench (Dev-07) · /contact opener + postcard + CopyButton
  states · 404 with the tools sketch
status: In Progress
assignee: []
created_date: '2026-09-24 05:49'
updated_date: '2026-09-25 12:25'
labels:
  - P1
  - 'sp:5'
  - m-009
  - phase-c
milestone: m-8
dependencies:
  - TASK-80
priority: high
type: feature
ordinal: 119000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Three small pages per Design.md §7.7, §7.8, §4.3: playground opener + bench board (no tone line, no Caveat sheet — Dev-07), contact opener with taped portrait, actions list with CopyButton states, postcard details section, 404 with the reused tools sketch; quiet closes not built (D9). Spec: tickets.md TKT-88.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Playground: 4 experiments from data, live URLs in new tabs with rel=noopener; no tone/status line; 6-col ≤1024, 1-col ≤640
- [ ] #2 Contact: copy → 'Copied' 2 s; failure → 'Copy failed' + selectable address; mailto/LinkedIn/résumé resolve; no phone/DOB/address (PII grep)
- [ ] #3 404 renders at /definitely-missing with the three CTAs and the band; axe clean
- [ ] #4 EVAL-018: playground 3/3, contact 3/3, 404 = 1; postcard labels valid data-hand=label
- [ ] #5 No overflow at 390; portrait max 420 px <900
<!-- AC:END -->
