# TASK-143 — Gummy Lab (`/lab`), M-010 Track 2c — report

**Branch** `m010/t2c-gummy` only. Not merged, no PR, not deployed. Commits (base `c66d12f`): `e4e3130` deps (.3) · `3373081` .2 · `5d31a85` .3 · `ea3801a` .4 · `1ef0184` + `1e85c1f` .5 · this report.

## Subtasks
- **143.1** asset: done earlier, untouched (`public/lab/gummy.glb`). **143.2** done: 5-click detector (TDD), `/lab` route, entry/exit overlays, ESC, Back link.
- **143.3** done: R3F + Rapier arena (GLB `GummyCollider` hull), gummy shader, drag/flick/squish/tap + keyboard, WebGL-off fallback. **143.4** done: engine, difficulty, spawner, power-ups, TP MODE, achievements, audio, particles, HUD/intro/pause/results, high score. **143.5** done: eval-030 spec, EVAL-027 3D scan, GLB test, TC-T2c rows, 12 screenshots (`docs/screenshots/m-010/t2c/`, `scripts/lab-screenshots.ts`).
- Note: state machine + store landed in the .3 commit (the scene needs them); engine/spawner/storage/audio in .4.

## Gate (counts)
`pnpm install --frozen-lockfile` ok · `typecheck` clean · `lint` 0 errors, 0 warnings · `pnpm test` **1019 passed, 4 skipped** (90 files + 1 skipped) · `eval-cases --check-specs` ok (EVAL-030 removed from `DEFERRED_SPECS`) · `pnpm build` ok (19 static routes).
- Full `test:e2e` (4 projects): 1508 passed, 46 failed, 1754 skipped. Isolation re-runs: eval-030 → 98 passed, 2 failed → both fixed (touch flick, Back link; pass in isolation); the other 38 failures → 7 remain, **the same 7 fail identically on base `c66d12f`** (built and run there): `portfolio-video` Campfire/Slag City ×(w390,w1440), `eval-011-dead-controls` w1440, `playground` live URLs w1440, `home-ask-tushky` w1024 (no outbound internet / pre-existing). The other 31 were load/timeouts and pass in isolation.
- Not re-run as a whole after the last two spec-only commits (no app code changed since the build).

## Isolation evidence (EVAL-027)
Home first-load 165.0 kB gz vs 164.1 on base (+0.9, ≤180). Three.js/R3F/Rapier/GLB markers exist only in two lazy chunks (+ the loader naming them); none appears in any route's first-load set, `/lab` included (`eval-027-cursor.test.ts`, with planted-marker proof). `/lab` first-load 157 kB gz; its lazy 3D chunks: three+R3F ≈1.0 MB raw, Rapier wasm ≈2.2 MB raw / ≈0.8 MB gz. `/lab`: noindex, not in robots Disallow, 0 sitemap, 0 `a[href="/lab"]`.

## Decisions (T2c-D1…)
1. No drei/Leva/GSAP (GSAP not installed): transitions are DOM/CSS, env via `RoomEnvironment`.
2. Entry is a **full document load** (`location.assign`), because a client route change keeps home's CSP and blocks Rapier's wasm; only `/lab` gets `'wasm-unsafe-eval'` (never `unsafe-eval`); CSP test updated.
3. Colours derive from paper tokens at runtime (1×1 canvas → sRGB→linear); no colour literals; lab CSS is a CSS module; `globals.css`/theme/toggle untouched.
4. Rotation locked; softness = 15 morphs + vertex/fragment shader; arena is one side-on screen (half-width 2.7 portrait / 5 landscape; simplified on mid/low tiers); intro/results are bare-backdrop product shots.
5. Rules: 1.2 s danger timer recovering 0.6/s; save bonus; same-target re-hit no combo for 2 s; combo cap x10; TP MODE = all four targets in one run (×1.5, +500); YOU REALLY FOUND IT = using the in-world portal.
6. Added keyboard play (← → Space, P, Esc) for a11y; audio synthesised, muted by default, state in memory only.
7. `?debug` exposes handles; `?debug=panel` shows the tuning panel (§47); nothing visible otherwise.
8. Outside the lane: type-only `ElementType` narrowing in `Prose`/`VisuallyHidden`/`Container` (R3F's JSX types broke them); eslint override `react-hooks/immutability` for `components/lab/**`; `SecretTrigger` in `Header`.
9. Exit uses history back only for a trigger entry with a portfolio referrer; otherwise returns to `/`.

## Deferred / caveats
Frame rate and real-GPU feel not profiled (sandbox has SwiftShader only; manual, TC-T2c-30). Portal exit and real-device touch checked manually only. Sandbox: Playwright needs `PLAYWRIGHT_BROWSERS_PATH=/tmp/pwb` (symlinks to the installed Chromium) and `TMPDIR=/tmp`; canvas specs launch SwiftShader flags, gameplay on w1440+w390 only. Console shows two library `warn`s (THREE.Clock, Rapier init), no errors.
