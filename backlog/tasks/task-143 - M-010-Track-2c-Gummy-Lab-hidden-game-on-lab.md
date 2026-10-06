---
id: TASK-143
title: 'M-010 Track 2c: Gummy Lab hidden game on /lab'
status: In Progress
assignee: []
created_date: '2026-10-05 11:51'
updated_date: '2026-10-06 08:39'
labels:
  - P3
milestone: m-9
dependencies:
  - TASK-139
priority: low
type: feature
ordinal: 193000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
gummy-bear.md: 5-click trigger on name/TP, lazy WebGL route; Blender model via Blender MCP; never in the home bundle
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-10-06: on preview (9126870) but NOT done — /lab canvas stays 150 px and ESC/Back exits time out in e2e (25 failures, deterministic in isolation since the T4/T5 merges; the plain-browser visit sizes fine). Hypothesis under test: T4's footer ocean animations under the opaque lab overlay starve the WebGL/wasm boot.
<!-- SECTION:NOTES:END -->
