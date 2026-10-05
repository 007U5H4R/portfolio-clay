# M-010 Track 2c / TASK-143 — Gummy Lab, the hidden game at `/lab`. Cloud-session brief (2026-10-05)

You are a cloud session on Tushar Pathak's portfolio (`007U5H4R/portfolio-clay`). Tushar delegated M-010 decisions to Claude (EXE-26 in `decisions.md`): don't stop to ask; decide and list decisions in your report.

## Hard rules
- **Branch `m010/t2c-gummy` only.** Commit and push to it. Never touch `main` or `m-009-redesign`, never open a PR into `main`, never deploy. Production is frozen.
- Commits: one per subtask, imperative subject ending `(TASK-143.N)`. No AI attribution lines. No secrets.
- **Isolation is the top constraint (EVAL-027):** no three.js / R3F / rapier bytes in any other route's first-load set — the game loads only on `/lab`, via a dynamic import. The secret-click detector on the site is tiny and dependency-free.
- `/lab` is hidden (S30): `<meta name="robots" content="noindex">`, NOT disallowed in `robots.txt`, 0 sitemap entries, 0 `a[href="/lab"]` anywhere.
- Stay in your lane: other tracks (T3 scene integration, T5 `/card`) run in parallel. Keep game styles in the route's own module; **don't edit `app/globals.css`, the theme module, or the toggle**. The header gets only the minimal click-detector hook on the name/monogram. Use role tokens (Design.md §13, D13); the site already has light + dark themes (`data-theme` on `<html>`).
- New dependencies are allowed only from the spec's stack (§3): `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`, `zustand` — add only what you use; respect `pnpm-workspace.yaml` (minimumReleaseAge). GSAP only if already installed.
- Don't edit `backlog/` files; Claude updates the board from your report.

## Asset already on the branch (TASK-143.1, done locally in Blender)
`public/lab/gummy.glb` (3,626 tris, plain GLB, 1 unit tall, +Y up, faces +Z): render mesh `GummyBear` (materials `GummyBody`, `GummyFace`), collider node `GummyCollider` (convex hull, use it for rapier), 15 morph targets in `extras.targetNames`: SquishVertical, StretchVertical, SquishHorizontal, BellyImpact, HeadWobbleLeft/Right, EarBounceLeft/Right, ArmLagLeft/Right, Happy, Surprised, Worried, Panic, Blink. Panic/Surprised open the mouth wide — keep their runtime weights ≤ 0.6. Generator: `scripts/blender/gummy.py`; details `docs/briefs/TASK-143-asset.md`. The translucent gummy look is your web shader's job (§14, §28). Don't regenerate the asset.

## Read (targeted)
`docs/specs/m-010/gummy-bear.md` by section: §1–3 (lines 1–114), §9–40 (287–1374), §41–51 (1375–1775), §54–55 (1831–end). Skip §4–8 and §52–53 (asset pipeline, done). `evaluation-plan.md` §9 rows EVAL-030 and EVAL-027. `decisions.md` S30, D13, EXE-26..30. `Design.md` §13 (T2c owns **Dev-155 … Dev-159**; 155–159 are used by the asset — continue as `Dev-155a…` letters or note new ones as T2c-D1…). `scripts/eval-cases.ts` (`DEFERRED_SPECS`), `scripts/bundle-budget.ts` (`--forbid` marker scan from the cursor track), `tests/e2e/fixtures.ts`, `playwright.config.ts`.

## Subtasks (spec §51 stages)
- **143.2** Secret 5-click detector on the name/monogram (≤ 3.5 s; 4 clicks or a slow sequence → nothing), `/lab` route, entry and exit transitions, ESC and "← Back to Portfolio" (§9–11, §36–37).
- **143.3** R3F world, gummy material + shader, physics (rapier with `GummyCollider`) and controls; WebGL-unavailable → a labelled fallback with the Back link (headless swiftshader) (§12–14, §27–29, §43).
- **143.4** Gameplay: survival rule, danger, scoring + combo, power-ups, expressions (morphs), audio (muted by default), particles; high score in localStorage only (§15–26, §30–35).
- **143.5** Mobile, accessibility, reduced motion (§40, still playable), performance (§39), `tests/e2e/eval-030.spec.ts` per the EVAL-030 row (incl. 0 console errors and 0 leaked animation loops across 3 enter/exit cycles), extend the EVAL-027 `--forbid` scan with a three.js marker, remove EVAL-030 from `DEFERRED_SPECS`, "M-010 T2c" section in `test-cases.md` (TC-T2c- rows), screenshots of `/lab` (intro, play, game over) light + dark at 390 and 1440 into `docs/screenshots/m-010/t2c/`.
Use test-driven development for the click detector, game state machine and scoring.

## Gate (exact counts in the report)
`pnpm install --frozen-lockfile` (after your dependency add, commit the lockfile) · `pnpm typecheck` · `pnpm lint` (0 errors) · `pnpm test` · `pnpm tsx scripts/eval-cases.ts --check-specs` · `pnpm build` · full `pnpm test:e2e`. Sandbox notes: set `PLAYWRIGHT_BROWSERS_PATH` and `TMPDIR=/tmp` (`.env.tooling` points at a Mac path); clear a stale `.next` if fonts fail. Tests needing outbound internet (YouTube/external hosts) fail identically on the base commit — record them with that evidence. Re-run timeout failures in isolation before reporting.

## Report
Commit `docs/reports/TASK-143.md` (≤ 45 lines): commits, subtask states, gate counts (with isolation re-runs), bundle evidence for isolation, decisions, anything deferred. Push it to `m010/t2c-gummy` as your **last** commit — that file is how Claude learns you're done.
