---
id: TASK-1.5
title: 'TSK-05: Hero + AvatarStage + FloatingTiles + Annotation'
status: Blocked
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-26 09:12'
labels:
  - P0
  - 'sp:2'
milestone: m-0
dependencies:
  - TASK-1.2
  - TASK-1.3
parent_task_id: TASK-1
priority: high
type: task
ordinal: 54000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Implementation notes.** `Parallax` client leaf wraps only the stage; the rest is server-rendered. `next/image` with blur placeholder for the avatar; the avatar is the LCP candidate - `priority`.
**Files.** `components/hero/{Hero,AvatarStage,FloatingTiles,Annotation}.tsx`, `components/interactions/Parallax.tsx`, `app/page.tsx`.
**Related EVAL.** EVAL-001, EVAL-005, EVAL-010. Source: tickets.md § TSK-05.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 TKT-01 AC 4 and 5 in full; tiles at 0.5x/1x/1.5x parallax depth, vertical offsets -24/0/+24.
- [ ] #2 Copy exactly per CONTENT_INVENTORY §1.2 rows (eyebrow, headline, support, tiles); tagline "Observing what others overlook." optional secondary.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-26 triage (orchestrator for Tushar): No longer needed — obsolete. AvatarStage and FloatingTiles no longer exist: the hero motion system was removed per decision S14 and TKT-73/TASK-68.3 ('remove the hero motion system + ProductScene + their tests'). The Hero itself was rebuilt for the illustrated identity under TKT-73/TASK-68 (Done).
<!-- SECTION:NOTES:END -->
