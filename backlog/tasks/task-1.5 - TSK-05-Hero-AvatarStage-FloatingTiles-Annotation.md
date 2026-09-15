---
id: TASK-1.5
title: 'TSK-05: Hero + AvatarStage + FloatingTiles + Annotation'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
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
