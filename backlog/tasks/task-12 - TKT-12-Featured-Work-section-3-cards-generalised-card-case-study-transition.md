---
id: TASK-12
title: >-
  TKT-12: Featured Work section (3 cards) + generalised card->case-study
  transition
status: Done
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-16 11:36'
labels:
  - P1
  - 'sp:3'
  - home
milestone: m-2
dependencies:
  - TASK-3
  - TASK-4
  - TASK-5
priority: high
type: feature
ordinal: 12000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
`FeaturedWork` reads `projects.filter(featured)` sorted 1-3 (TeachSpark, RailCite, Velora framed "Nuptis -> Velora"), renders three card-tier `ProjectCard`s in a row >=1024 / stacked below, each wrapped in `ViewTransition name="project-{slug}"`. Adds RailCite and Velora records at card fidelity to `data/projects.ts`. Cubicle swap rule implemented as data (`featured` field), not code.

**Objective.** Three proof projects visible within the recruiter's 30 seconds.
**Product requirement.** Solution-PRD §4 S3, §5 Featured Work; Design.md §3 Featured Work; SITEMAP.md featured slugs; CONTENT_INVENTORY §1.4; decision S3.
**Definition of Done.** Base DoD + Truth.
**Notes.** No product images on featured cards (Design.md anatomy) - the RailCite screenshot gap does not block this ticket. Generalises TSK-06.
**Related EVAL.** EVAL-001, EVAL-002 (hop 1), EVAL-011, EVAL-013, EVAL-015.
**Target sequence.** Phase 3 · **Owner.** Claude.
Source: tickets.md § TKT-12.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Exactly 3 cards, order 1-3 from data; card anatomy per Design.md (icon, name, one sentence <=2 lines, <=3 tags, StatusBadge, ghost arrow); whole card clickable; equal heights >=1024.
- [ ] #2 Copy verbatim from CONTENT_INVENTORY §1.4 (propositions, tags, statuses); Velora card title "Nuptis -> Velora"; TeachSpark status badge text carries the "uptime unverified" caveat until TKT-22 re-verifies.
- [ ] #3 Hover/press/focus states per Design.md §4; reduced motion removes the rise.
- [ ] #4 Click -> `/work/{slug}` with shared-element transition (or plain navigation fallback); RailCite/Velora resolve to the stub route until TKT-19.
- [ ] #5 Schema gate passes for the two new records (sources present); `pnpm eval` regressed.
<!-- AC:END -->
