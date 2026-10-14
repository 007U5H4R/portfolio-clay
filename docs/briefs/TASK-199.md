# TASK-199 brief: restructure the Gummy Lab pinball table (cloud session)

You are working in a Claude cloud session on Tushar Pathak's portfolio. No one will answer questions during the run, so make the call that best serves his decisions below and record each call in your report.

## 1. Setup
- **Repo:** https://github.com/007U5H4R/portfolio-clay, branch `m013/pinball-layout`, which is `main` (production) plus this brief and the annotated screenshot.
- **Stack:** Next.js 16, React Three Fiber + `@react-three/rapier`, pnpm 11 (`corepack enable`), Vitest, Playwright.
- **Environment:** in every shell, run `export TMPDIR=/tmp PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/ms-playwright"`. Don't edit `.env.tooling`.
- **Install:** `pnpm install`, then `pnpm exec playwright install --with-deps chromium`.
- **Before the final push:** `git fetch origin && git merge origin/main`. Another cloud branch (`m013/lab-loader`, the loading screen) also touches `components/lab`. Keep your changes to the table (`lib/lab/arena.ts`, Machine, physics, scoring) and stay out of the loader and intro.

## 2. Read first
- `docs/redesign-mockups/m-013/pinball-layout-annotated.png`: Tushar's annotations on the current desktop table.
- `docs/reports/TASK-185.md`: how the current table was built.
- `decisions.md` EXE-66: the earlier pinball calls, including the phone-table clearance rule.
- `lib/lab/arena.ts`, `lib/lab/arena-clearance.ts`, `components/lab/Machine.tsx`, `components/lab/Arena.tsx`, `components/lab/BlackHole.tsx`, `lib/lab/engine.ts` (scoring), the gate and nudge code, and the headless Rapier harness `tests/unit/lab-sim.ts`, plus the sim tests (`lab-portal-sim`, `lab-wedge`).

## 3. Tushar's decisions (binding, 2026-10-12)
1. **Black hole moves INSIDE the table**, at the top-left of the playfield (the blue circle near the top-left wall). It's a sensor pocket the gummy can reach from the playfield. On entry the gummy spirals in, YOU_REALLY_FOUND_IT unlocks, and the game exits to the portfolio through the existing `onExit` path. Remove the outside-the-frame placement. Keep the "← Back to Portfolio" label/link next to it, still focusable and still exiting. It must stay a skill shot, reachable but not constant; prove it with the sim.
2. **The bumpers form a tighter diamond** (the red circles): top, bottom, and left and right moved in toward the centre. Keep a clearance of at least 1.5 gummy widths between bumpers (`arena-clearance`) so the gummy can't wedge.
3. **Four distinct bumpers, each with its own look and behaviour:**
   - **Pop:** the normal kick.
   - **Jet:** a stronger kick plus a ring flash.
   - **Thumper:** a heavy kick plus a short table shake (reuse the Nudge shake; none under reduced motion).
   - **Turbo:** a speed boost plus a short trail burst (pooled trail; no allocation).
   - Each gets distinct paper styling (cap shape, ring and colour from Design.md tokens). All score 100 unless a clear reason suggests otherwise; record it.
   - Unit-test each behaviour's impulse.
4. **Spinner:** move the rotating spinner at the top (black box) to just below the bumper diamond, horizontally centred (the red box).
5. **Remove the AI / DESIGN / PRODUCT / BUILD bricks entirely**, labels included. Replace them with **unlabeled trapezoidal slingshots** along the side walls (the blue trapezia): one on the left wall at mid-height and one on the right, just left of the shooter-lane wall. They behave as slingshots: angled kickers that score the standard sling value (30) and flash on hit.
   - Remove the target scoring and anything that only existed for the bricks (including target-hit counts in the end card, if present). Keep the score/combo store working.
   - Update the controls copy and hints if they mention targets.
6. **Phone table:** apply the same changes, but the phone keeps **2 bumpers**: choose two of the four types, e.g. pop + turbo, and record the choice. Keep the phone clearance rule of at least 1.5 gummy widths.
7. **Keep everything else:** the lane gate, Nudge, StallWatch, plunger, drain and audio. Performance is a hard gate (TASK-143): no infinite CSS animations, pooled effects, and reduced motion works.

## 4. Proof
- **Headless sim with 50 random launches on both tables:**
  - reaching the flippers at least 95% of the time;
  - no stillness longer than 2 s;
  - black-hole reachability;
  - no wedge anywhere around the new diamond or the slingshots.
  - Report the numbers before and after.
- **Gates:**
  - `pnpm typecheck`, `pnpm lint`, `pnpm tokens:check`, `ALLOW_DEV_ROUTES=1 pnpm build`, then the full `pnpm test`;
  - the FULL `ALLOW_DEV_ROUTES=1 pnpm test:e2e --retries=0` at all 4 widths;
  - re-run failures alone with `--workers=1` and explain each one;
  - update eval-030 assertions that the removed bricks or target scores make obsolete, and say which in the report;
  - known pre-existing failures: EVAL-008 `/dev/artifacts` (TASK-178), EVAL-033 (TASK-173), EVAL-039 flaky (TASK-191).
- **Screenshots** in `docs/screenshots/m-013/task-199/` (staged via `?debug`):
  - the full table at 1440 and 390, light and dark;
  - one shot per bumper type mid-hit;
  - the black hole entry;
  - the spinner.
  - Grade them yourself against the annotated image.

## 5. Commits, push, report
- **Commits:** imperative subjects with TASK-199. **No AI attribution** of any kind.
- **Push:** push only `m013/pinball-layout`. Never touch `main` or `m-009-redesign`, never deploy, and don't edit `backlog/`.
- **Report:** commit `docs/reports/TASK-199.md` last. Include what changed, the sim numbers, the judgement calls, gate counts, screenshots and limitations.
