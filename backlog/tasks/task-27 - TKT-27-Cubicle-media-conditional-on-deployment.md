---
id: TASK-27
title: 'TKT-27: Cubicle media - conditional on deployment'
status: Done
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-17 12:02'
labels:
  - P3
  - 'sp:2'
  - media
  - tushar
milestone: m-4
dependencies:
  - TASK-1
priority: low
type: chore
ordinal: 27000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Only if a live URL exists: record the debate -> four artifacts flow (~90 s claim - record what actually happens, no speed-up beyond 2x, label if sped up), <=4 MB + poster, screenshots, then flip `featured` per S3 (Cubicle replaces slot 3 only if deployed with screenshots). Otherwise: close this ticket as "Not applicable - not deployed" and keep the card at "Built, not launched" with `DemoVideo` in `no-video` state.

**Product requirement.** S3, S6; CONTENT_INVENTORY §8.3 (MISSING: live URL, deployment, any real run).
**Definition of Done.** Base DoD (or documented N/A).
**Dependencies.** TKT-01; external: Tushar deploys Cubicle (decision S3 deadline 2026-09-16). Soft dependency of TKT-32.
**Related EVAL.** EVAL-013, EVAL-014. **Blockers.** Tushar - deployment. **Target sequence.** filler · **Owner.** Tushar (deploy) / Claude (capture).
Source: tickets.md § TKT-27.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Either (1a) media files + `SOURCES.md` + `decisions.md` EXE-n recording the featured swap, or (1b) explicit N/A closure with date.
- [ ] #2 Never a local `/dev/office` harness recording presented as the product.
<!-- AC:END -->
