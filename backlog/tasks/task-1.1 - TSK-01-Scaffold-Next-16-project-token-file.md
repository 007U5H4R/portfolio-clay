---
id: TASK-1.1
title: 'TSK-01: Scaffold Next 16 project + token file'
status: Blocked
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-26 09:12'
labels:
  - P0
  - 'sp:1'
milestone: m-0
dependencies: []
parent_task_id: TASK-1
priority: high
type: task
ordinal: 50000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Objective.** Runnable, typed, linted project with the locked design tokens.
**Implementation notes.** Run `culori` once in a script (`scripts/tokens-check.ts`) that asserts hex->oklch->hex round trip; keep the script as the D2 guard. No dark tokens yet (S9) but keep names theme-neutral.
**Files.** `package.json`, `tsconfig.json`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx` (empty shell), `scripts/tokens-check.ts`, `lib/site.ts`, `.gitignore`, `.npmrc`.
**Related EVAL.** EVAL-005 (bundle baseline). Source: tickets.md § TSK-01.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `pnpm create next-app` equivalent with App Router, TS strict, Tailwind 4, `motion`, `lucide-react`.
- [ ] #2 `app/globals.css` `@theme` = Design.md §2 with regenerated OKLCH.
- [ ] #3 `app/layout.tsx` sets fonts, metadata defaults, `<main id="main">`.
- [ ] #4 `.gitignore` covers `public/resume.pdf`, `.env*`, `node_modules`, `.next`, Playwright artefacts.
- [ ] #5 pnpm store / caches on E Drive.
- [ ] #6 `lib/site.ts` exports `resumeAvailable: false` and the resume href/label pair (PB5).
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-26 triage (orchestrator for Tushar): No longer needed — delivered under parent TKT-01 (Done). Scaffold + token file exist (app/globals.css, scripts/tokens-check.ts, lib/site.ts with resumeAvailable); this sub-task was never closed when its parent shipped.
<!-- SECTION:NOTES:END -->
