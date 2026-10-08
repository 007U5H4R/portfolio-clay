# TASK-185 brief: Gummy Lab as a paper-cut pinball machine (cloud session)

You are working in a Claude cloud session on Tushar Pathak's portfolio. No one can answer questions during the run. Make the call that best serves his spec, and record it in your report.

## 1. Setup
- **Repo and branch:** https://github.com/007U5H4R/portfolio-clay, branch `m013/gummy-pinball`. It is `main` (production, 403263d) plus one commit that adds the spec, the reference image and this brief.
- **Stack:** Next.js 16, Tailwind v4, React Three Fiber + `@react-three/rapier`, pnpm 11 (`corepack enable`), Vitest, Playwright.
- **Environment:** `.env.tooling` points `PLAYWRIGHT_BROWSERS_PATH` and `TMPDIR` at Tushar's Mac. In every shell, run `export TMPDIR=/tmp PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/ms-playwright"`. Don't edit `.env.tooling`.
- **Install:** `pnpm install`, then `pnpm exec playwright install --with-deps chromium`.
- **Sync before the final push:** `git fetch origin && git merge origin/main`. Another branch (`m012/interaction`, TASK-181 site-wide hover system) is in flight. It does not touch `/lab`, but it may touch shared CSS and tests.

## 2. Read first
- `docs/redesign-mockups/m-013/tushar-2026-10-08/gummy-pinball-spec.md` (34 sections, Tushar's words, the source of truth for this task) and `pinball-reference.png` (the primary visual direction: recreate its design language and composition, don't copy it literally).
- The lab code: `components/lab/` (Arena, GameScene, Gummy, Pickups, LabUi, gummy-controller, Effects, Particles, materials, fx) and `lib/lab/` (flippers, engine, session, store, state-machine, controls, audio, spawner, tiers, tokens).
- `Design.md` (tokens, the paper world, motion and reduced-motion rules), `decisions.md` (EXE-55 and EXE-57 explain the lab's history), `evals/eval-cases.json` (EVAL-030, 035–039) and `tests/e2e/eval-030*.spec.ts`, `tests/e2e/lab-helpers.ts`.

## 3. Facts that correct or settle the spec
1. **It is already pinball (TASK-172).** The gummy is the ball, two flippers sit either side of a central drain, and `lib/lab/flippers.ts` holds the flipper maths plus `StallWatch` (a stuck-gummy nudge that shipped yesterday; keep it). Spec §31 applies: keep the Rapier physics, collisions, scoring, timer, combo, game state, reset and audio. Rebuild the *body*, not the engine.
2. **Controls (supersedes today's mapping):**
   - Space = plunger charge/launch (spec §15). It no longer fires both flippers.
   - Left flipper: ← or A, and keep Z. Right flipper: → or D, and keep M.
   - P pause and Esc exit stay. Prevent default for Space and arrows only while the game is active (§30), never while focus is in a button or link.
   - **Touch must stay playable** (the site's standing rule, even though desktop is primary): hold left/right halves for the flippers as today, and press-and-hold a visible plunger control in the launch lane to charge, release to launch. Update `components/lab/controls-copy.tsx`.
3. **Launch force is real physics** (§15): MIN_FORCE/MAX_FORCE tuned so a 0% launch still clears the lane and a 100% launch reaches the top ramp. Unit-test the charge → force mapping (pure function in `lib/lab/`).
4. **Drain** (§22): use the game's existing drain/lives/end logic. When the game continues after a drain, the gummy returns to the launcher at 0% power. Don't invent a new end condition.
5. **Targets** (§19): AI 150, DESIGN 200, PRODUCT 250, BUILD 300. Bumpers 100. Feed them through the existing score/combo store.
6. **Exit** (§23): the black hole replaces the visible exit control, but it is a real link/button: keyboard focusable, accessible name "Back to Portfolio", same exit path as today (`onExit`, the return-path handling). Esc and the pause card's "Back to Portfolio" stay.
7. **Palette** (§4): use the site's Design.md tokens. The spec's hexes are approximations of them; where they differ, Design.md wins. Neon stays ≤ ~10% (§33). No glassmorphism.
8. **Typography:** HUD plaques and target labels use the site faces (Fraunces / Inter). Caveat only per Design.md §3.4 (a short label like "← Back to Portfolio" qualifies as `data-hand="cta"`).
9. **Performance is a hard gate (TASK-143 scar, EXE-55):** the lab once failed to boot because CSS animations starved WebGL. Trail and particles use a fixed-size pooled buffer (no per-frame allocation, no growing arrays, no DOM per particle). No infinite CSS animations around the canvas. Target 60 fps desktop; check mid-range mobile doesn't regress.
10. **Reduced motion:** no trail, no particles, no orbiting; lights change state without pulsing. Gameplay stays intact.
11. **Assets:** build the machine procedurally in three.js (layered extruded cardstock, paper textures already in `materials.ts`) or as small hand-authored textures committed to the repo. No new runtime dependencies and no third-party requests (the CSP is strict). Keep the lab's lazy chunk; report its gz size before and after.

## 4. Scope
- Everything in spec §2–§30, judged by the §34 success test.
- Out of scope: anything outside `/lab` and its entry, the intro screen's layout (redesigned in EXE-57, only restyle it if the new machine needs it to match), the music.

## 5. Gates (all required)
- `pnpm typecheck`, `pnpm lint`, `pnpm tokens:check`, `pnpm build` with `ALLOW_DEV_ROUTES=1`, then the full `pnpm test` (after the build, so bundle scans run).
- The FULL `ALLOW_DEV_ROUTES=1 pnpm test:e2e --retries=0` suite at w390, w768, w1024 and w1440. Re-run any failure alone with `--workers=1` and explain every one that remains. Never loosen an existing threshold to pass. If an EVAL-030/035–039 assertion is made obsolete by the new controls (e.g. Space = both flippers), update it to the new behaviour and say so in the report.
- New tests: charge → force mapping (unit), Space charge/release launches with stronger force when held longer (e2e via the lab's test hooks), targets/bumpers score their values (unit), the black hole is focusable and exits (e2e), the trail pool never grows (unit), reduced motion disables trail and particles (e2e).
- Screenshots in `docs/screenshots/m-013/task-185/`: the start state, charging at ~78%, mid-play with a trail, a bumper hit, and the black-hole hover, at 1440 and 390, light and dark themes. Grade them yourself against §34, iterate until every answer is yes, and list the answers in the report.

## 6. Commits, push, report
- Commit messages: imperative subjects that include TASK-185. **No AI attribution of any kind**: no `Co-Authored-By`, no "Generated with", no session links.
- Push only `m013/gummy-pinball`. Never push to or merge `main` or `m-009-redesign`. Never deploy. Don't edit `backlog/`.
- Commit `docs/reports/TASK-185.md` last: what changed, the §34 answers with screenshot references, the judgement calls, gate counts, the lab chunk size before/after, fps notes, known limitations and the commit list.
