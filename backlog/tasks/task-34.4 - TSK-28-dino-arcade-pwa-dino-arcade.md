---
id: TASK-34.4
title: 'TSK-28: dino-arcade-pwa (dino-arcade)'
status: Blocked
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-26 09:13'
labels:
  - P3
  - 'sp:1'
milestone: m-4
dependencies:
  - TASK-19
  - TASK-20
  - TASK-21
parent_task_id: TASK-34
priority: low
type: task
ordinal: 77000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Minimal honest page (`deepDive:false`): Context, Bet (BYO-ROM as the load-bearing decision), Built (vendored EmulatorJS + FBNeo, IndexedDB, service worker, no backend/analytics), Outcome (live); one `DecisionCard`; repo link visible (`repoPublic:true`).
**Source pack.** §8.10. **Media.** TKT-26 (soft).
**MISSING.** screenshot (TKT-26) · test results.
**Files.** `data/projects.ts` (dino-arcade record), `content/media/dino-arcade/SOURCES.md`. Source: tickets.md § TSK-28.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Common contract (a)-(f) of TKT-54.
- [ ] #2 Public framing strictly "BYO-ROM - no game data ships".
- [ ] #3 No reference to `Game/`.
- [ ] #4 Test results omitted (MISSING).
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-26 triage (orchestrator for Tushar): No longer needed — delivered under parent TKT-54 (Done). The dino-arcade-pwa project record exists in data/projects.ts and renders through the shared /work/[slug] case-study template; this sub-task was never closed.
<!-- SECTION:NOTES:END -->
