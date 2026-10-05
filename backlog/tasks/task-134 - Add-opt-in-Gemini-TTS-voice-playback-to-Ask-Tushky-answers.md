---
id: TASK-134
title: Add opt-in Gemini TTS voice playback to Ask Tushky answers
status: In Progress
assignee:
  - '@claude-cloud'
created_date: '2026-09-29 13:22'
updated_date: '2026-09-29 13:30'
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
Cloud session started 2026-09-29 via claude.ai/code: Default env, portfolio-clay, cloud/task-134, Opus 5.5 High. https://claude.ai/code/session_01STVirYEr4n5BXdHBXAVKLv. The brief states that no live Gemini text path exists, the TTS route recomputes the answer, the rate limit is per-instance only (no KV) and Tushar adds GEMINI_API_KEY to Vercel himself. gemini-3.8-flash-lite-tts was verified on his key.
<!-- SECTION:NOTES:END -->
