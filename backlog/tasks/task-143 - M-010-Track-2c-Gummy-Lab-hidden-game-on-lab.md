---
id: TASK-143
title: 'M-010 Track 2c: Gummy Lab hidden game on /lab'
status: Done
assignee: []
created_date: '2026-10-05 11:51'
updated_date: '2026-10-06 14:36'
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

2026-10-06: root cause and fix in EXE-49. The band footer's infinite animations ran under the opaque /lab and starved its WebGL boot under SwiftShader; HideOnLab keeps the footer off /lab (d841289). EVAL-030 fixes: non-WebGL blocks in eval-030-entry.spec.ts (3d4f334), the leak check counts live rAF loops (88d299b), lab-page test budget = step waits (9eb416e). Quiet gate on 3d4f334: e2e 1678/3 → test-side fixes → w1440 29/0, lab-page ×2 on all projects 64/0. Preview 9eb416e (dpl_89ihL6mqVVLZM3shpUgkGUN9AHXX) verified with a GPU: canvas 900 px, no footer on /lab, ESC → home 3.95 s, 0 console errors.
<!-- SECTION:NOTES:END -->
