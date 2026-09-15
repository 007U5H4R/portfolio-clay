---
id: TASK-37
title: 'TKT-41: ExperienceTimeline + TimelineNode + StoryCard (URL hash per role)'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P1
  - 'sp:5'
  - about
milestone: m-5
dependencies:
  - TASK-36
priority: high
type: feature
ordinal: 37000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Single connecting line with 4 nodes (Godrej · Quantiphi · Shellkode · AmEx), label above / dates below; hover scales node 1.1 + brightens adjoining segment; click/Enter opens a lavender card-tier `StoryCard` (Context / Role / Scale / What changed / Outcomes as a 2-col definition grid >=768, 1-col <768; 44x44 close; spring 240/30, instant under reduced motion), one open at a time, `#experience-{role}` hash; <1024 rotates vertical with accordion cards.

**Objective.** Corporate proof of level, explorable, keyboard-complete (EVAL-007/010 name it explicitly).
**Product requirement.** Solution-PRD §5 About ("interactive experience timeline"); Design.md §3 Timeline, §4 StoryCard row; COMPONENT_ARCHITECTURE §4 ExperienceTimeline; CONTENT_INVENTORY §4.5.
**Definition of Done.** Base DoD.
**Related EVAL.** EVAL-006, EVAL-007, EVAL-008, EVAL-010, EVAL-011. **Blockers.** none.
**Target sequence.** Phase 6 · **Owner.** Claude.
Source: tickets.md § TKT-41.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Four roles from `experience.ts`; "Scale: not recorded" rendered where MISSING; outcomes labelled self-reported.
- [ ] #2 Keyboard: Tab to nodes, Enter/Space opens, `Esc` closes and returns focus, arrow keys move between nodes; `aria-expanded`/`aria-controls`; deep link `/about#experience-amex` opens that card on load.
- [ ] #3 Exactly one card open; opening another closes the first with layout animation; reduced motion snaps.
- [ ] #4 Vertical layout at 390/768; horizontal at 1024/1440; no overflow; axe clean.
- [ ] #5 `/about#experience` anchor exists for the `/work` ExperienceStrip link and Ask evidence.
- [ ] #6 `pnpm eval` regressed (keyboard + reduced-motion suites).
<!-- AC:END -->
