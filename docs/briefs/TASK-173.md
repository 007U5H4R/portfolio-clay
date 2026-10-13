# TASK-173 brief: the tilt parallax sometimes freezes at 85 % (cloud session)
Repo github.com/007U5H4R/portfolio-clay, branch `m013/tilt-fix`. No one answers questions during the run; make the best call and record it.

## Context
- The phone tilt (device orientation) parallax sometimes freezes at 85 % after one burst of sensor events.
- EVAL-033 ("home, iOS-style: the chip shows outside the role=img scene, and a tap starts tilt parallax") fails at w390 and w768 on main.
- Read `lib/paper-world/motion.ts`, the tilt and gyro chip components (grep `tilt`, `deviceorientation`, `gyro`), `tests/e2e/eval-033.spec.ts`, and the related decisions.

## Work
1. **Find the root cause.** Reproduce it in a test (synthetic `deviceorientation` bursts) and identify why the value sticks; candidates are a clamp, a smoothing spring that never settles, or a listener removed after the first burst.
2. **Fix it** and add a regression test.
3. **Make EVAL-033 pass deterministically** at w390 and w768, or prove the remaining failure is a harness limitation and fix the harness. Do not weaken the assertion.
4. Do not edit `lib/paper-world/motion.ts` object-channel code beyond what the tilt fix needs, and keep the unit tests green.

Commit with TASK-173.

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
