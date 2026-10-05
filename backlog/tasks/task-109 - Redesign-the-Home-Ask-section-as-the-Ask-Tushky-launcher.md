---
id: TASK-109
title: Redesign the Home Ask section as the Ask Tushky launcher
status: Done
assignee: []
created_date: '2026-09-26 13:29'
updated_date: '2026-09-27 03:01'
labels:
  - P1
dependencies: []
priority: high
type: enhancement
ordinal: 159000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar's spec: inline Home section introduces Tushky (dog + notebook composer + 6 prompt cards) and launches the right drawer with the typed/selected question
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Verified on integration db8f782: unit 625, 15 static routes, full e2e 1209 passed / 0 failed, bundles within budget (/ 160.1 kB). Home launcher opens the RIGHT drawer and auto-asks; hero CTA opens the drawer. Integration fixes: drawer closes on animationend (TC-051 regression under the heavier page), EVAL-011 crawler sweeps stray dialogs.
<!-- SECTION:NOTES:END -->
