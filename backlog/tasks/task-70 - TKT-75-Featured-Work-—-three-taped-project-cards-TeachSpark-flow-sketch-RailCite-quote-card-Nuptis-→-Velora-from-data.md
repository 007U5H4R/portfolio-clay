---
id: TASK-70
title: >-
  TKT-75: Featured Work — three taped project cards (TeachSpark flow sketch,
  RailCite quote card, Nuptis → Velora) from data
status: In Progress
assignee: []
created_date: '2026-09-24 05:49'
updated_date: '2026-09-25 09:50'
labels:
  - P0
  - 'sp:3'
  - m-009
  - phase-a
milestone: m-8
dependencies:
  - TASK-69
priority: high
type: feature
ordinal: 106000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Rebuild FeaturedWork + ProjectCard (featured mode) per Design.md §7.1: paper-2 section with TornEdge, RailCite quote-card annotation, 1.35fr/1fr grid, taped Sheet cards with VERIFIED metrics and data-hand=cta links, TeachSpark flow sketch + sticky; count = 4 (Dev-03). Spec: tickets.md TKT-75.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Copy/metrics/status/tags byte-equal to data/projects.ts (unit snapshot)
- [ ] #2 3 cards, whole-card links to /work/<slug> (EVAL-002 hop)
- [ ] #3 ≤1024 two columns with the large card spanning; ≤640 one column; no overflow at 390
- [ ] #4 EVAL-018 section = 4; fasteners ≤2 per card
- [ ] #5 Reduced motion: hover shadow only
- [ ] #6 featured.spec.ts + ProjectCard.test.tsx updated; eval-015.spec.ts still green
<!-- AC:END -->
