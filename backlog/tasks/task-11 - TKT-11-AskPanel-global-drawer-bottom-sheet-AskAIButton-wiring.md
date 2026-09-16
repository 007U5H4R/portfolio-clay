---
id: TASK-11
title: 'TKT-11: AskPanel global drawer / bottom sheet + AskAIButton wiring'
status: In Progress
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-16 10:19'
labels:
  - P1
  - 'sp:5'
  - ask
milestone: m-2
dependencies:
  - TASK-10
priority: high
type: feature
ordinal: 11000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Global Ask surface mounted in `app/layout.tsx`: right drawer 400px (1024-1439) / 480px (>=1440), 16px inset, scrim dims page 20%, `role="dialog" aria-modal="true"`, header "Ask AI" + 44x44 close, body reuses `useAsk` and the same views as TKT-10 with 6 suggested prompts; <768 becomes a 90vh bottom sheet (D3, Deviation 2). Slide-in 320ms `cubic-bezier(0.32,0.72,0,1)`; instant under reduced motion, scrim still fades. Enables the header `AskAIButton` (replacing the tracer's disabled state) and the MobileMenu one.

**Objective.** Ask is reachable from every page while the page stays visible (not a chatbot widget, not a centred modal).
**Product requirement.** Solution-PRD §5 cross-cutting; Design.md §3 AskPanel, §4 slide-in row, Deviation 2; COMPONENT_ARCHITECTURE §4; decision D3; evaluation-plan EVAL-007.
**Definition of Done.** Base DoD.
**Notes.** Render the panel lazily (dynamic import on first open) to protect the home JS budget (EVAL-005). Use `inert` on the page root while open.
**Related EVAL.** EVAL-005, EVAL-006, EVAL-007, EVAL-010, EVAL-011.
**Target sequence.** Phase 3 · **Owner.** Claude.
Source: tickets.md § TKT-11.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Opens from header/mobile-menu buttons on every route; focus trapped; `Esc`, scrim click, close button all close and return focus to the trigger; body scroll locked while open, page content still visible behind scrim at >=768.
- [ ] #2 Widths per breakpoint measured; bottom sheet at 390 slides from bottom, input in lower half, safe-area inset respected.
- [ ] #3 Keyboard-only script: open -> type -> Enter -> read answer -> activate evidence link -> close (EVAL-007) passes at 390 and 1440.
- [ ] #4 Same five states as TKT-10; panel is context-aware (`ctx.route` passed to provider) but v1 provider ignores it.
- [ ] #5 axe 0 critical/serious with the panel open; no overflow.
- [ ] #6 `pnpm eval` regressed (nav + keyboard suites).
<!-- AC:END -->
