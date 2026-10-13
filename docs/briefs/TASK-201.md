# TASK-201 brief: Experience timeline hover and What I Bring tool chips (cloud session)
Repo github.com/007U5H4R/portfolio-clay, branch `m013/xp-hover` (main + this brief). No one answers questions during the run; make the best call and record it.

## Work
1. **Experience timeline (PLAN §4.8):** `components/experience/CollageTimeline.tsx`, plus the CSS for `.ct-item`, `.ct-card`, `.ct-pin` and `.ct-logo`.
   - On `.ct-item:hover` and on `:focus-within:has(:focus-visible)`:
     - `.ct-card` lifts 3 px (±1);
     - the shadow crossfades through a pseudo-element's opacity (320/420 ms, `--ease-paper`);
     - `.ct-pin` gets `translate 0 1px` (180 ms);
     - `.ct-logo` rotates 0.6° toward upright.
   - The text stays static relative to the card. `xp-drift` is unchanged.
   - No touch behaviour. Under reduced motion, the shadow only.
2. **What I Bring tool chips** (Tushar, 2026-10-09: "chip lifts and tell the project"). This applies to the tool chips inside each stage's detail panel (`components/experience/WhatIBringJourney.tsx`, `data/what-i-bring.ts`).
   - On hover or keyboard focus, a chip lifts 2 px and shows the project where that tool was used, e.g. "→ RailCite".
   - **Pairings must come from `data/` only** (projects and experience). Never invent a pairing. A tool with no data-backed project lifts and shows no label.
   - The chips become focusable so keyboard users get the same label. On touch, the label shows on tap.
   - Add a unit test that every shown pairing exists in the data, and an e2e test that hover and focus show it.
3. Extend the EVAL-040 scope regex (`ct-item`, the chip class) and `eval-042.spec.ts`. EVAL-018 decoration counts must not change.

Commit with TASK-201. Screenshots go to `docs/screenshots/m-013/task-201/`.

## Setup
- **Stack:** Next.js 16, Tailwind v4, pnpm 11 (`corepack enable`), Vitest and Playwright.
- **Environment:** in every shell, run `export TMPDIR=/tmp PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/ms-playwright"`. Do not edit `.env.tooling`.
- **Install:** `pnpm install`, then `pnpm exec playwright install --with-deps chromium`. If the download is blocked, link the preinstalled Chromium, as earlier cloud runs did.
- **Before your final push:** run `git fetch origin && git merge origin/main`.

## Rules
- Follow the site's P1 interaction contract (decisions.md EXE-59..65; Design.md §14.10):
  - hover only under `(hover: hover) and (pointer: fine)`, each with a `:focus-visible` twin and a touch `:active` state;
  - shadows swap or crossfade by opacity;
  - no scale hovers and no infinite animations (TASK-143 scar);
  - reduced motion means no movement.
- Design.md tokens win. Every claim must exist in `data/`.
- Commits: imperative, with your TASK id, and **NO AI attribution**. Set the repo-local git identity to the one in recent history (`007U5H4R`), never `Claude <noreply@anthropic.com>`.
- Push only your branch. Never touch main or m-009-redesign, never deploy, and do not edit `backlog/`.
- Gates:
  - `pnpm typecheck`, `pnpm lint`, `pnpm tokens:check`, then `ALLOW_DEV_ROUTES=1 pnpm build`, then the full `pnpm test`;
  - the full `ALLOW_DEV_ROUTES=1 pnpm test:e2e --retries=0` at all 4 widths.
  - Re-run any failure alone with `--workers=1`; if it still fails, compare it against main in the same container and explain it.
  - Known pre-existing failures: EVAL-008 `/dev/artifacts` (TASK-178), EVAL-033 (TASK-173), EVAL-039 (flaky, TASK-191), and network or font failures specific to this container.
- Commit `docs/reports/<TASK>.md` last. Include what changed, the judgement calls, the gate counts, the screenshots and the limitations.
