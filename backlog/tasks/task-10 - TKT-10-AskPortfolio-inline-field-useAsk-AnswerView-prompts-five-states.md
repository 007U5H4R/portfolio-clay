---
id: TASK-10
title: >-
  TKT-10: AskPortfolio inline field + useAsk + AnswerView + prompts (five
  states)
status: In Progress
assignee: []
created_date: '2026-09-15 13:22'
updated_date: '2026-09-16 09:10'
labels:
  - P1
  - 'sp:5'
  - ask
milestone: m-2
dependencies:
  - TASK-9
  - TASK-4
  - TASK-5
priority: high
type: feature
ordinal: 10000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Home section: 56-64px rounded field inside a card-tier `ClayCard` (max 720px), placeholder "Ask about my work...", 5 `SuggestedPrompts` as interactive `ClayPill`s; on submit the card expands in place (layout animation spring 210/26, min 240px, tone -> lavender) revealing `AnswerView` (answer <=65ch + 2-3 `EvidenceLinks` pills + ghost "Ask another"); shared `useAsk(provider)` state machine idle -> loading (<=150ms skeleton, always shown) -> answer -> empty (+3 fresh prompts) -> error (ink on blush + alert icon + Try again). Never navigates.

**Objective.** The brief's hard requirement: search that becomes an answer inline, honestly labelled.
**Product requirement.** Solution-PRD §5 Home "Ask my portfolio"; Design.md §3 Ask section, §4 "Ask inline expand" row; COMPONENT_ARCHITECTURE §4 AskPortfolio states; evaluation-plan EVAL-007/012/014-style state coverage.
**Definition of Done.** Base DoD.
**Notes.** `"use client"` on `AskPortfolio` only; the provider is injected via context so TKT-11 reuses `useAsk`. Error state is exercised by a provider that throws (test only).
**Related EVAL.** EVAL-007, EVAL-008, EVAL-010, EVAL-011, EVAL-012.
**Target sequence.** Phase 3 · **Owner.** Claude.
Source: tickets.md § TKT-10.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All five states reachable and visually distinct (Playwright drives each via a mocked provider); loading skeleton visible >=150ms even when the provider resolves instantly.
- [ ] #2 Submit via Enter, button, or prompt-pill click; URL unchanged; DOM focus moves to the answer heading (no trap); page remains scrollable.
- [ ] #3 Visible microcopy: "Answers come from this portfolio's content - nothing generated." (S7) present in idle and answer states.
- [ ] #4 Evidence pills link to real routes/anchors (crawler passes even before case-study anchors exist - link to route root until TKT-28+ adds anchors, then update).
- [ ] #5 Reduced motion: height snaps, content fades 150ms; keyboard: Tab order field -> pills -> answer -> evidence -> Ask another; axe 0 critical/serious at 390 & 1440.
- [ ] #6 Mobile: pills wrap to 2 rows; card padding/gutter per Design.md; no overflow.
<!-- AC:END -->
