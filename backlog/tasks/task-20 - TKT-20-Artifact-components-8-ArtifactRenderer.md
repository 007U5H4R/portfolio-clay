---
id: TASK-20
title: 'TKT-20: Artifact components (8) + ArtifactRenderer'
status: In Progress
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-17 04:20'
labels:
  - P1
  - 'sp:5'
  - case-study
milestone: m-3
dependencies:
  - TASK-4
priority: high
type: feature
ordinal: 20000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
One shared card-tier `ClayCard` DNA, shape varies by type per Design.md §3: `InsightCard` (quote, butter left bar, source caption), `HypothesisCard` ("We believe..." / "We'll know when..." split), `MetricCard` (tabular-nums value, label, context, asOf, kind badge), `DecisionCard` (Chosen with mint check vs Rejected muted), `EvaluationCard` (method -> result -> limitation rows), `ExperimentCard` (setup -> result -> learning mini-connector), `PrototypeFrame` (`ClayFrame` bezel around image/`DemoVideo` + caption), `ArtifactCard` (generic: PRD/deck/ledger link with type icon). A renderer maps `Artifact.type` -> component.

**Objective.** Typed evidence blocks so chapters are built from artifacts, not prose alone (Solution-PRD §5).
**Product requirement.** Solution-PRD §5 Case study ("typed artifacts"); Design.md §3 Artifacts; COMPONENT_ARCHITECTURE §1 artifacts/, §2 Artifact union; DESIGN_DIRECTION §7.
**Definition of Done.** Base DoD.
**Notes (security).** Source captions must show a human label (e.g. "Final PRD, 24 Aug 2026"), not `/Volumes/E Drive/...` paths - the schema keeps the path in `sources[]` for traceability, the UI renders `label` only. Sub-tasks TSK-19..TSK-21; consumed by TKT-19 chapters, TKT-40 Impact.
**Related EVAL.** EVAL-003, EVAL-006, EVAL-008, EVAL-009, EVAL-013.
**Target sequence.** Phase 4 (parallel with TKT-16/19) · **Owner.** Claude.
Source: tickets.md § TKT-20.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Eight components + `ArtifactRenderer`; every one reads only card-tier tokens; text zones inside remain flat; source caption present on every artifact (link when the source is a URL, path label otherwise - never a local filesystem path rendered publicly).
- [ ] #2 `MetricCard` refuses to render without context/asOf/kind (type-level); kind badge pairs icon + text.
- [ ] #3 Layout 1-up / 2-up >=768 / 3-up >=1024 inside the chapter column; never full-bleed.
- [ ] #4 `/dev/artifacts` fixture page renders every type with realistic TeachSpark/RailCite pack data for screenshot review at 390 & 1440; axe clean.
- [ ] #5 Unit tests for the renderer mapping and MetricCard guards; `pnpm eval` regressed.
<!-- AC:END -->
