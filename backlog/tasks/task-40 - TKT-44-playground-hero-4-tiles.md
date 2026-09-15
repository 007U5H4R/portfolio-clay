---
id: TASK-40
title: 'TKT-44: /playground - hero + 4 tiles'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P2
  - 'sp:2'
  - playground
milestone: m-5
dependencies:
  - TASK-4
  - TASK-5
  - TASK-6
  - TASK-15
priority: medium
type: feature
ordinal: 40000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Flat hero "Small experiments. Big questions."; 2x2 / 1-col grid of `ClayTile`s for Pratyasa (butter), Tegaki (peach), dino-arcade (blush), cinematic-portfolio (mint) reading from project data; each tile fully clickable to the live URL (`target=_blank rel=noopener`), deeper hover shadow allowed; one-line description per §6; playground OG.

**Product requirement.** Solution-PRD §5 Playground; Design.md §3 Playground; CONTENT_INVENTORY §6.
**Definition of Done.** Base DoD + Truth.
**Related EVAL.** EVAL-008, EVAL-009, EVAL-011. **Blockers.** none.
**Target sequence.** Phase 6 · **Owner.** Claude.
Source: tickets.md § TKT-44.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Four tiles, copy from §6 (no Slag City / Mock Interview / Game).
- [ ] #2 >=44x44, focus ring, `aria-label` includes "opens in new tab".
- [ ] #3 Crawler treats external targets as resolved (HEAD 200-399).
- [ ] #4 axe clean; no overflow.
<!-- AC:END -->
