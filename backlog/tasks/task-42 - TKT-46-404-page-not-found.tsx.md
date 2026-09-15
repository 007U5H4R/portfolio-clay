---
id: TASK-42
title: 'TKT-46: 404 page (not-found.tsx)'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P3
  - 'sp:1'
milestone: m-5
dependencies:
  - TASK-5
priority: low
type: feature
ordinal: 42000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Flat page with one clay tile, headline, links to `/`, `/work`, `/contact`; correct 404 status; header/footer present; reduced-motion safe.

**Product requirement.** Solution-PRD §5 routes (404); SITEMAP.md.
**Definition of Done.** Base DoD.
**Related EVAL.** EVAL-011, EVAL-015. **Blockers.** none. **Target sequence.** Phase 6 · **Owner.** Claude.
Source: tickets.md § TKT-46.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `/nope` returns 404 with the page.
- [ ] #2 Links resolve.
- [ ] #3 axe clean at 390/1440.
<!-- AC:END -->
