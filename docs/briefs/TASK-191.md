# TASK-191 (+178, 182, 159) brief: CI and test hygiene (cloud session)
Repo github.com/007U5H4R/portfolio-clay, branch `m013/ci-hygiene`. No one answers questions during the run; make the best call and record it.

## Work
1. **TASK-191 (CI green).** The GitHub `eval` workflow (`.github/workflows/eval.yml`, 120-minute timeout) ends red on main. Earlier it failed on:
   - EVAL-039 smoothness ×3 under a 4× throttle;
   - EVAL-023 system theme flip;
   - the Lighthouse perf and LCP assertions, which fail on SwiftShader.

   Use `gh run list` and `gh run view --log` for the latest main runs to get the current failures, then make CI deterministic **without weakening what the tests prove**. For example:
   - mark the throttle smoothness tests CI-informational, with a clear reason, if they are hardware-bound;
   - fix real races;
   - make Lighthouse assertions in CI informational, matching the local eval harness that already marks EVAL-004 as informational on SwiftShader.

   Document every change in the report. Never delete a test.
2. **TASK-178.** `/dev/artifacts` has text under 14 px (EVAL-008 at all widths). Fix the dev page's text (raise it to 14 px, or mark true micro-labels with `data-micro-label` per EXE-7). Also check `/dev/thinking`, which flaked with 11–13 px spans.
3. **TASK-182.** The CI job used to fail at its Build step on release PRs. Confirm it is fixed (TASK-190 raised the timeout) from recent run logs, and say so in the report.
4. **TASK-159.** This is a stale "M-011 P3: paper cards, buttons and paper-cut icons" ticket. Compare its acceptance criterion with what shipped (P1/P2 cards and buttons) and state in the report whether it is done. Do not edit `backlog/`.

Commit with TASK-191 (and TASK-178 for the dev-page fix).

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
