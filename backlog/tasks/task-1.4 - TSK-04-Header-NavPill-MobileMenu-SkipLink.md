---
id: TASK-1.4
title: 'TSK-04: Header + NavPill + MobileMenu + SkipLink'
status: Blocked
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-26 09:12'
labels:
  - P0
  - 'sp:1'
milestone: m-0
dependencies:
  - TASK-1.3
parent_task_id: TASK-1
priority: high
type: task
ordinal: 53000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Implementation notes.** `role="dialog" aria-modal` for MobileMenu; use native `<dialog>` or a focus-trap util; `env(safe-area-inset-top)` on the sticky header.
**Files.** `components/navigation/{Header,NavPill,MobileMenu,AskAIButton}.tsx`, `components/layout/SkipLink.tsx`, `lib/motion.ts` (reduced-motion hook only).
**Related EVAL.** EVAL-007, EVAL-008, EVAL-010. Source: tickets.md § TSK-04.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 TKT-01 AC 3 in full; `useScrollY` threshold 24px; compaction 250ms ease, instant under reduced motion.
- [ ] #2 MobileMenu rows 56px; `AskAIButton` + the resume action (placeholder state per TKT-01 AC 10) pinned at sheet bottom.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-26 triage (orchestrator for Tushar): No longer needed — delivered under parent TKT-01 (Done). Header/MobileMenu exist (components/navigation/Header.tsx), later rebuilt for the paper identity under TKT-71/TASK-66 (Done); this sub-task was never closed.
<!-- SECTION:NOTES:END -->
