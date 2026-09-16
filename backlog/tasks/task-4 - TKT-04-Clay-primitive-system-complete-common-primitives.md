---
id: TASK-4
title: 'TKT-04: Clay primitive system complete + common primitives'
status: Done
assignee: []
created_date: '2026-09-15 13:22'
updated_date: '2026-09-16 03:54'
labels:
  - P1
  - 'sp:5'
  - design-system
milestone: m-1
dependencies:
  - TASK-2
priority: high
type: feature
ordinal: 4000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Finish `components/clay/*` to the full Design.md contract - `ClayCard` (tone x tier x interactive x `as`), `ClayButton` (primary/secondary/ghost, trailing icon), `ClayPill` (interactive filter vs static tag variants, visibly distinct), `ClayTile` (56-180px), `ClayFrame` (4:5 and 16:9 bezels), `ClayIcon` (56/40) - plus `components/common/*` (`Icon` 1.75px stroke 20/24, `Tag`, `ExternalLink`, `CopyButton` skeleton, `VisuallyHidden`, `Prose` <=60ch flat). Enforce the tier rule structurally: a `flat` tier consumer cannot receive clay shadow/gradient tokens.

**Objective.** One material system every later ticket composes from; the anti-toy guardrail (D1) enforced in code.
**Product requirement.** Design.md §2 tiers table, §3 Clay primitives + Common primitives, §4 button press/card hover rows; COMPONENT_ARCHITECTURE §3; decision D1.
**Definition of Done.** Base DoD + /dev/primitives screenshots at 390/1440 saved to docs/screenshots/primitives/.
**Notes.** Tone colours never carry meaning alone - `StatusBadge`/errors pair icon + label. Exclude `/dev/*` via `next.config` in production. Extends TSK-03.
**Related EVAL.** EVAL-006, EVAL-007, EVAL-008, EVAL-009, EVAL-010.
**Target sequence.** Phase 2 (parallel with TKT-03) · **Owner.** Claude.
Source: tickets.md § TKT-04.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every primitive listed exists with the props in Design.md; TypeScript forbids `tier="flat"` combined with `tone` other than neutral or `interactive`.
- [ ] #2 Tiers map to token sets exactly: hero (radius 32-36, rest/hover/press, volume gradient), card (28, same), utility (14, utility shadow only, no press), flat (none).
- [ ] #3 `ClayPill` filter variant has hover + active (lavender fill + ink text); tag variant has no hover - Playwright asserts computed styles differ on hover.
- [ ] #4 All interactive primitives: >=44x44, 3px accent focus ring / 3px offset, press `scale(.98)` 90ms, hover lift 180ms; reduced motion removes translate, keeps opacity/colour.
- [ ] #5 Glass (`backdrop-blur` 12px + 80% bg) is exported as a header-only utility, not a clay tier.
- [ ] #6 A dev-only route `/dev/primitives` (excluded from sitemap and production build) renders every primitive x tier x tone for screenshot review at 390 and 1440; axe 0 critical/serious on it.
- [ ] #7 Unit tests for class/token mapping; `pnpm eval` regressed.
<!-- AC:END -->
