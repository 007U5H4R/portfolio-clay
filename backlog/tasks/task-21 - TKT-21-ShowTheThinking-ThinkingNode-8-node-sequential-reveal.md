---
id: TASK-21
title: 'TKT-21: ShowTheThinking + ThinkingNode (8-node sequential reveal)'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P1
  - 'sp:3'
  - case-study
milestone: m-3
dependencies:
  - TASK-4
  - TASK-5
priority: high
type: feature
ordinal: 21000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
`ClayButton` toggle "Show the thinking"; on open, 8 `ThinkingNode`s (Observation -> User problem -> Insight -> Hypothesis -> Product decision -> Prototype -> Evaluation -> Outcome; stage label + text + source link) reveal top-to-bottom at 220ms with 120ms stagger and a `clip-path` connector draw-in; nodes exist in the DOM collapsed (screen-reader discoverable); never auto-plays; all at once + opacity-only under reduced motion; vertical list only (D4, Deviation 6).

**Objective.** The portfolio's signature interaction - the reasoning chain, user-triggered, honest, accessible.
**Product requirement.** Solution-PRD §5 Case study ("Show the thinking"); Design.md §3 ShowTheThinking, §4 node reveal row, Deviation 6; COMPONENT_ARCHITECTURE §4; decision D4; evaluation-plan EVAL-007/010.
**Definition of Done.** Base DoD.
**Notes.** Only `transform`/`opacity`/`clip-path` animate (Design.md §4 hardware-acceleration rule). Mounted by TKT-19 below chapter 08.
**Related EVAL.** EVAL-003, EVAL-006, EVAL-007, EVAL-008, EVAL-010.
**Target sequence.** Phase 4 · **Owner.** Claude.
Source: tickets.md § TKT-21.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Renders from `Project.thinking` (8 nodes, each with `source`); hidden entirely when the chain is empty (thin projects) - no empty toggle.
- [ ] #2 Toggle has `aria-expanded` + `aria-controls`; nodes are in the DOM before open (`hidden` attribute pattern that still exposes them to AT via a visually-hidden summary, or `aria-expanded` region - pick one, document it).
- [ ] #3 Reveal timing per spec; reduced motion: all nodes visible instantly, opacity only (Playwright asserts no transform animation).
- [ ] #4 Keyboard: toggle -> nodes' source links in order; `Esc` not required; focus remains on the toggle after open.
- [ ] #5 One column at 390/768/1024/1440; no overflow; axe clean.
- [ ] #6 `/dev/thinking` fixture with the TeachSpark chain for screenshots; `pnpm eval` regressed.
<!-- AC:END -->
