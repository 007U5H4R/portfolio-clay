---
id: TASK-16
title: >-
  TKT-16: /work page: WorkHero · FilterTabs · EditorialGrid · grid cards · empty
  states
status: In Progress
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-17 02:27'
labels:
  - P0
  - 'sp:5'
  - work
milestone: m-3
dependencies:
  - TASK-15
  - TASK-4
  - TASK-5
  - TASK-6
priority: high
type: feature
ordinal: 16000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace the stub `/work` with the full page: flat `WorkHero` (h1 + lead from CONTENT_INVENTORY §2.1), `FilterTabs` (All · AI · Enterprise · Cloud · Experiments; `?filter=` URL sync; layout-animated indicator spring 260/28; horizontal scroll with 16-24px peek <768 - Deviation 3), `EditorialGrid` (12-col: card[0] 8x2, card[1-2] 4x1 rail, rest 4x1 3-up; 768-1023 large full + 2-up; <768 single column with large media 4:3), `ProjectCard` grid mode with `DemoVideo` slot (TKT-18) and `AnimatePresence` filter transitions (fade-out 150 / fade-in 200; opacity-only under reduced motion), per-filter empty state, work OG image.

**Objective.** Every project browsable with editorial hierarchy - never nine identical rectangles.
**Product requirement.** Solution-PRD §5 Work; Design.md §3 Work page, §4 filter change row, Deviation 3; COMPONENT_ARCHITECTURE §4 FilterTabs->EditorialGrid; SITEMAP.md filter mapping.
**Definition of Done.** Base DoD + Perf.
**Notes.** `"use client"` on FilterTabs + grid wrapper only; cards themselves stay server-renderable. Sub-tasks TSK-13..TSK-15.
**Related EVAL.** EVAL-002 (hop 2), EVAL-004, EVAL-007, EVAL-008, EVAL-010, EVAL-011.
**Target sequence.** Phase 4 · **Owner.** Claude.
Source: tickets.md § TKT-16.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Grid spans measured at 1440/1024/768/390 match Design.md; only personal projects in the grid; professional entries are not cards here (TKT-17).
- [ ] #2 Filter click updates `?filter=`, back/forward restores state, deep link `/work?filter=ai` renders filtered on first paint (server-read search param), `role="tablist"`/`tab`/`aria-selected` semantics, arrow-key navigation.
- [ ] #3 Each filter yields exactly the SITEMAP.md set (Playwright asserts card slugs per filter).
- [ ] #4 <768: tab row scrolls horizontally with a visible peek, no page-level horizontal overflow.
- [ ] #5 Empty state component renders with honest copy + "Show all" when a filter yields 0 (tested by injecting an empty dataset).
- [ ] #6 Hover/press/focus per Design.md; cards keep the `ViewTransition` wrapper.
- [ ] #7 axe clean at 390 & 1440; Lighthouse `/work` >= 90/95/95/95; `pnpm eval` regressed.
<!-- AC:END -->
