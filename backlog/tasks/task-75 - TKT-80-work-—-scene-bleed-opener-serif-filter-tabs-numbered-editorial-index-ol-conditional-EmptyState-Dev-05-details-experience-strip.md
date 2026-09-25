---
id: TASK-75
title: >-
  TKT-80: /work — scene-bleed opener, serif filter tabs, numbered editorial
  index (<ol>), conditional EmptyState (Dev-05), <details> experience strip
status: In Progress
assignee: []
created_date: '2026-09-24 05:49'
updated_date: '2026-09-25 09:50'
labels:
  - P0
  - 'sp:5'
  - m-009
  - phase-b
milestone: m-8
dependencies:
  - TASK-74
priority: high
type: feature
ordinal: 111000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Rebuild /work per Design.md §7.2: WorkHero scene bleed (one <img>, Dev-06), oversized h1 + underline sketch, FilterTabs as ink-underlined Fraunces tabs (URL sync unchanged, TP7), 'start here ↓' annotation, numbered <ol> index (flagship opener, second opener with sticky, slim rows), EmptyState only when 0 rows, ExperienceStrip as <details name=job> rows. Spec: tickets.md TKT-80.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Filter tabs keyboard-operable, URL-synced; ?filter= deep link renders the subset after hydration
- [ ] #2 11 personal builds numbered 01–11 in data order, re-sequenced per filter; every row/opener is a link
- [ ] #3 EmptyState in the DOM only for an empty filter
- [ ] #4 Strip: one <details> open at a time, keyboard path, hidden under Experiments; no live-link/arrow on corporate rows
- [ ] #5 EVAL-018 per section = 2 / 3 / 1 at both widths
- [ ] #6 One <img> for the scene, alt from the manifest, sizes per placement, no CLS
- [ ] #7 No overflow at 390 (rows collapse 40px 1fr)
<!-- AC:END -->
