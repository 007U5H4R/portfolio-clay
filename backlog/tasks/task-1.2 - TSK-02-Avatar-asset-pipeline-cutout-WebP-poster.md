---
id: TASK-1.2
title: 'TSK-02: Avatar asset pipeline: cutout -> WebP + poster'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P0
  - 'sp:1'
milestone: m-0
dependencies: []
parent_task_id: TASK-1
priority: high
type: task
ordinal: 51000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Objective.** Production avatar files from the approved source.
**Implementation notes.** Any paid tool call needs Tushar's spend approval first (S4). Keep the source PNG untouched.
**Files.** `public/avatar/*.webp`, `content/media/avatar/candidates/README.md`.
**Related EVAL.** EVAL-009 (avatar likeness), EVAL-013 (alt text). Source: tickets.md § TSK-02.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Background removed from `content/media/avatar/avatar-source.png` (1856x2304) - Recraft/Higgsfield `remove_background` or local tool.
- [ ] #2 `public/avatar/avatar.webp` transparent, long edge >=1600px, <=300 kB; `public/avatar/avatar@2x.webp`; `public/avatar/avatar-poster.webp` (opaque, on `bg`, for OG/fallback).
- [ ] #3 Visual check: hair/beard edge clean, <=3 supporting objects retained (laptop, plant, books).
- [ ] #4 Provenance line appended to `content/media/avatar/candidates/README.md`.
<!-- AC:END -->
