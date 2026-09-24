---
id: TASK-64
title: >-
  TKT-69: Paper tokens + fonts — 13-token swap with a repo-wide codemod,
  Fraunces/Inter/Caveat via next/font, EVAL-020 test
status: To Do
assignee: []
created_date: '2026-09-24 05:49'
labels:
  - P0
  - 'sp:5'
  - m-009
  - phase-0
milestone: m-8
dependencies: []
priority: high
type: feature
ordinal: 100000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Swap the 13 clay tokens for the 13 paper tokens in one commit (S12): globals.css @theme + color-mix derived properties + grain, tokens-check AUTHORITATIVE, codemod over app/components/lib/tests (bg→paper … butter→kraft, Tailwind utilities included). Fonts via next/font/google: Fraunces (opsz/SOFT), Inter, Caveat; Manrope removed. tests/unit/eval-020.test.ts wired into pnpm eval. Full spec: tickets.md TKT-69; plan: technical-plan.md §F TKT-69.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 pnpm tokens:check 13/13 on exactly the 13 paper names; globals.css declares no other --color-*
- [ ] #2 0 retired token/utility references in app/ components/ lib/ (EVAL-020 grep); derived values use color-mix() only
- [ ] #3 next/font self-hosts the three families; zero fonts.googleapis/gstatic requests; Fraunces opsz/SOFT applied or static fallback + Design.md §11 row
- [ ] #4 Base type applied (Inter body 16/1.6 navy; Fraunces 500 headings, text-wrap: balance; .font-hand)
- [ ] #5 eval-020.test.ts green and reported by pnpm eval --only EVAL-020; typecheck/lint/test/build green on the codemodded tree; no test deleted
- [ ] #6 bundle-budget --json on / recorded before and after
<!-- AC:END -->
