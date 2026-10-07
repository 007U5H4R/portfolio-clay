---
id: TASK-134
title: Add opt-in Gemini TTS voice playback to Ask Tushky answers
status: Done
assignee:
  - '@claude-cloud'
created_date: '2026-09-29 13:22'
updated_date: '2026-10-05 12:54'
labels:
  - P2
  - m-009
  - cloud
dependencies: []
priority: medium
type: feature
ordinal: 184000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar 2026-09-29: add a Listen / Pause / Replay voice strip to each Tushky answer, spoken by Gemini TTS (gemini-3.8-flash-lite-tts) through a server-only route. The route recomputes the grounded answer (no arbitrary TTS), FAQ audio is pre-generated, and there is no autoplay. Cloud session. Specs: docs/redesign-mockups/m-009/tushar-2026-09-29/tushky-voice-*.md
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Merged via PR #8 (2026-10-05 18:05) to m-009-redesign; preview only. Its CI failures were EVAL-019 + EVAL-016 (fixed by TASK-138) and informational Lighthouse LCP. Voice stays silent until GEMINI_API_KEY is set in Vercel.
<!-- SECTION:NOTES:END -->
