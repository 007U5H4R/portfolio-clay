---
id: TASK-38
title: 'TKT-42: About part 2: Awards · Research · Education + assembly + OG'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P2
  - 'sp:2'
  - about
milestone: m-5
dependencies:
  - TASK-36
  - TASK-37
priority: medium
type: feature
ordinal: 38000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Awards (3, text only - certificates MISSING), Research (patent IN 429867 with inventors and rights line; Langmuir 2025 paper with DOI link; Soft Matter 2023 by title only until DOI/authors supplied), Education (M.Tech NIT Calicut 2022; B.E. BIT Durg 2016; languages optional), assemble `/about` in SITEMAP order, about OG, "Let's talk" -> `/contact`, Download Resume.

**Product requirement.** Solution-PRD §5 About; CONTENT_INVENTORY §4.6-4.8.
**Definition of Done.** Base DoD + Perf + Truth.
**Related EVAL.** EVAL-002, EVAL-004, EVAL-013, EVAL-017. **Blockers.** Tushar - Soft Matter DOI (placeholder otherwise).
**Target sequence.** Phase 6 · **Owner.** Claude.
Source: tickets.md § TKT-42.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Copy verbatim from §4.6-4.8; PMP/SAFe absent.
- [ ] #2 Patent number 429867 everywhere.
- [ ] #3 Soft Matter row has no fabricated DOI - "DOI pending" placeholder.
- [ ] #4 Page order per SITEMAP.md.
- [ ] #5 Lighthouse `/about` >= 90/95/95/95; axe clean; `pnpm eval` regressed.
<!-- AC:END -->
