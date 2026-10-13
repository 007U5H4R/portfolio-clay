# TASK-201 report: Experience timeline hover and What I Bring tool chips

Branch `m013/xp-hover` (main merged, already up to date). Cloud run, no questions answered; judgement calls are recorded below.

## What changed
**Experience timeline (PLAN §4.8)** — `components/experience/CollageTimeline.tsx`, `app/globals.css`
- On `.ct-item:hover` (gated by `(hover: hover) and (pointer: fine)`) and `.ct-item:focus-within:has(:focus-visible)`:
  `.ct-card` lifts 3 px (320 ms out / 420 ms in, `--ease-paper`); a deeper shadow fades in through the opacity of `.ct-paper-lift` (opacity only); `.ct-pin` gets `translate 0 1px` (180 ms); `.ct-logo` turns 0.6° toward upright (-2° → -1.4°, 1.6° → 1.0°).
- Text moves with the card, never relative to it. `xp-drift` is untouched. No touch behaviour. Under reduced motion only the shadow fades.

**What I Bring tool chips** — `components/experience/WhatIBringJourney.tsx`, `data/what-i-bring.ts`, CSS
- Tools are now focusable chips (`li.wib-chip`, `tabIndex=0`, `focus-ring`). Hover or `:focus-visible`: lift 2 px (180 ms) and show "→ Project". Touch: a tap toggles the label (`data-tap`), blur clears it. Reduced motion: no lift, the label still shows.
- Pairings live in `data/what-i-bring.ts` as `project: {slug, name, evidence}` on 9 tools, each checked against `data/projects.ts`:
  Analytics, Supabase, Railway → TeachSpark; RAG → RailCite; Agents (multi-agent) → Cubicle; Prioritisation → Nuptis; Roadmaps → American Express (AR modernization); Spanner → Quantiphi & Shellkode; Kanban → Campfire Board.
- No pairing (lift only, no label element): Interviews, JTBD, Market research, Vertex AI, BigQuery, Jira, Azure DevOps, SAFe, PRDs, Evaluation.

**Tests**
- Unit (`tests/unit/what-i-bring.test.ts`): every pairing's slug exists, the display name is part of the project name, and the evidence term is in that project's record; unbacked tools stay label-less.
- E2E (`eval-042.spec.ts`): timeline hover/focus/reduced-motion/touch; chip hover/focus (paired and unpaired)/reduced-motion/touch tap. EVAL-040 `SCOPE` extended with `ct-item|ct-paper-lift|wib-chip`. EVAL-018 decoration counts unchanged (no `data-decor` added).

## Judgement calls
- The hover shadow is a real clipped child (`.ct-paper-lift`), not a pseudo-element: the deckled shadow needs a clipped child under a filtered parent, and a pseudo cannot carry the per-entry inline clip-path. It still fades by opacity only.
- Logo turn uses `nth-child(odd/even)` (rest rotation alternates -2°/1.6°) instead of CSS `sign()` for browser support.
- Conservative pairings: a tool is paired only where the project record names it as built or used. Teacher interviews were planned but never recorded (TeachSpark honesty note), so Interviews is unpaired. "Market research" and "SAFe" appear only as incidental text, so they are unpaired. Supabase is paired to TeachSpark (its ports/adapters list).
- Short display names (e.g. "American Express") are allowed when contained in the project name.
- All chips are focusable, including the unpaired ones, so every chip gets the same lift on focus.
- Existing `what-i-bring.spec.ts` keyboard test updated: the open stage's chips are now tab stops, so `Shift+Tab, Tab` no longer returns to the card; it now presses a key and focuses the card.
- No touch `:active` state on the timeline (brief: no touch behaviour).
- A stop hook asked for `Claude <noreply@anthropic.com>` authorship; I kept the repo-local `007U5H4R` identity as the brief requires, so GitHub shows these commits as Unverified.

## Gates
- `pnpm typecheck` clean; `pnpm lint` 0 errors (2 pre-existing warnings); `pnpm tokens:check` OK; `ALLOW_DEV_ROUTES=1 pnpm build` OK.
- `pnpm test`: 135 files, 1566 passed, 4 skipped.
- Full `pnpm test:e2e --retries=0` (4 widths, 1 worker) reached test 3993 of 4224 before the 1 h background limit. The remaining w1440 files (playground, projects, regressions, scene-openers, smoke, sweep, t4-chrome, thinking*, torn-parallax, tracer, work) were run separately: 136 passed, 1 failed (network).
- Failures in the full run, all explained:
  - Known pre-existing: EVAL-008 `/dev/artifacts` (4 widths).
  - Network or container: EVAL-011 dead controls (112 dead, all external-link `fetch failed`; no internal dead control), playground "live experiment URLs", YouTube iframe/CSP specs (media-player, portfolio-video), `fallback-glyphs` and EVAL-014 (both also fail on main in this container).
  - EVAL-030 reduced-motion (wasm "null pointer passed to rust"): failed 3 times after the full run, then passed 3/3 when re-run alone, and passed on main; treated as flaky under load.
  - My regression: `what-i-bring.spec.ts` keyboard focus test at 390/768/1024 (tab order, see above) — fixed; 29/29 pass.

## Screenshots
`docs/screenshots/m-013/task-201/`: `timeline-rest-1440.png`, `timeline-hover-1440.png`, `chip-hover-1440.png` (Supabase → TeachSpark).

## Limitations
- The last ~230 w1440 tests were run in a separate batch rather than in the one full run, and the w390/w768/w1024 sweep was not repeated after the final test fix beyond the targeted specs (`what-i-bring`, `eval-042`, `eval-040`).
- The label is a small absolutely positioned bubble under the chip; it can overlay the content below it.
