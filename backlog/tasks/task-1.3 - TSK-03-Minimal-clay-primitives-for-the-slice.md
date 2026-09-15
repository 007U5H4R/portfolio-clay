---
id: TASK-1.3
title: 'TSK-03: Minimal clay primitives for the slice'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P0
  - 'sp:1'
milestone: m-0
dependencies:
  - TASK-1.1
parent_task_id: TASK-1
priority: high
type: task
ordinal: 52000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Objective.** Only the primitives Header/Hero/card need - `ClayCard`, `ClayButton`, `ClayTile`, `ClayFrame`, `ClayIcon`, `Tag`, `StatusBadge` - reading tokens from `@theme`, with tier/tone props per Design.md §2 table.
**Implementation notes.** Keep APIs identical to what TKT-04 will extend (tone x tier x interactive x `as`). No `ClayPill` yet.
**Files.** `components/clay/{ClayCard,ClayButton,ClayTile,ClayFrame,ClayIcon}.tsx`, `components/common/{Tag,Icon}.tsx`, `components/projects/StatusBadge.tsx`.
**Related EVAL.** EVAL-006, EVAL-007. Source: tickets.md § TSK-03.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `tier` prop selects radius/shadow set; `flat` exposes none.
- [ ] #2 `interactive` adds hover/press physics (200ms ease-out; press 90ms `scale(.98)`).
- [ ] #3 Focus ring 3px accent / 3px offset on every interactive primitive.
- [ ] #4 Min 44x44 on `ClayButton`.
<!-- AC:END -->
