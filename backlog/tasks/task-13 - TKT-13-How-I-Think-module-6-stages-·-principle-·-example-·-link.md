---
id: TASK-13
title: 'TKT-13: How I Think module (6 stages · principle · example · link)'
status: In Progress
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
ordinal: 13000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
`data/thinking-framework.ts` (6 stages Problem · Insight · Bet · Build · Evaluate · Impact - label, one-line principle, real example quote, source, link, stage colour) and the `HowIThink` module: horizontal row of 6 utility-light `ClayTile`s connected by a thin line >=1024, vertical stack with left line <1024; hover emphasises principle (desktop); click/Enter expands one card below the row (200ms; instant under reduced motion) with the example + "See how I tested this in {Project} ->"; one open at a time; outside click/`Esc` closes.

**Objective.** Show the operating model with evidence, not adjectives.
**Product requirement.** Solution-PRD §5 Home "How I Think"; Design.md §3 How I Think, §4 stage expand row; COMPONENT_ARCHITECTURE §1 `thinking-framework.ts`; CONTENT_INVENTORY §1.5 (six sourced examples).
**Definition of Done.** Base DoD + Truth.
**Notes.** The <=1 accent colour per section rule: the module itself is the section's accent - no other tinted element in this section.
**Related EVAL.** EVAL-003 (supports mapping), EVAL-007, EVAL-011, EVAL-013.
**Target sequence.** Phase 3 · **Owner.** Claude.
Source: tickets.md § TKT-13.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Six examples verbatim from CONTENT_INVENTORY §1.5 with their sources and target links (`/work/railcite#02-problem`, `/work/velora#03-discovery`, `/work/teachspark#04-product-bet`, `/work/railcite#05-what-i-built`, `/work/teachspark#06-evaluation`, `/work/teachspark#07-outcome`); the Insight example is attributed to the team as the row instructs.
- [ ] #2 Stage colours per Design.md (Insight->butter, Build->peach, Evaluate/Impact->mint, etc.) and the same mapping exported for reuse.
- [ ] #3 Keyboard: tiles are buttons with `aria-expanded`; arrow keys move between stages; `Esc` closes; focus stays on the tile.
- [ ] #4 Links resolve (route root until chapter anchors exist; anchors verified by the crawler after TKT-28/29/30).
- [ ] #5 No overflow at 390; axe clean; `pnpm eval` regressed.
<!-- AC:END -->
