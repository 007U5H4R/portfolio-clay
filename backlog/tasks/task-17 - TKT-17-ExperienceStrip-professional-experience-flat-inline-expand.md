---
id: TASK-17
title: 'TKT-17: ExperienceStrip - professional experience, flat, inline expand'
status: In Progress
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-17 03:17'
labels:
  - P2
  - 'sp:2'
  - work
milestone: m-3
dependencies:
  - TASK-16
priority: medium
type: feature
ordinal: 17000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Below the personal grid: a flat, bordered strip labelled "Professional experience - corporate work, not a public product." with one flat row per professional entry (title, company, dates, tags), inline expand-on-click for the one-paragraph summary, and a "See my experience ->" link to `/about#experience`. No arrow, no live link, no image (CONTENT_INVENTORY §2.3: nothing may be published without employer clearance).

**Objective.** Corporate experience proves level and scale without pretending to be a product.
**Product requirement.** Solution-PRD §5 Work, §6; Design.md §3 ExperienceStrip; CONTENT_INVENTORY §2.3.
**Definition of Done.** Base DoD + Truth.
**Notes.** Godrej tag is "Platform" (not "IoT" - unverified).
**Related EVAL.** EVAL-007, EVAL-011, EVAL-013.
**Target sequence.** Phase 4 · **Owner.** Claude.
Source: tickets.md § TKT-17.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Three rows from `category:'professional'` data, copy verbatim from §2.3; no `DemoVideo`, no external link, no `ViewTransition`.
- [ ] #2 Expand/collapse via button with `aria-expanded`; one open at a time; instant under reduced motion.
- [ ] #3 Visually distinct from the grid (flat tier, border) at every width; label text present and read by screen readers.
- [ ] #4 Filters that include professional tags (Enterprise/Cloud/AI) also filter the strip rows (SITEMAP.md mapping).
- [ ] #5 axe clean; crawler passes; `pnpm eval` regressed.
<!-- AC:END -->
