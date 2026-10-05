# M-010 Track 2b / TASK-142 — Paper Trail cursor (desktop only). Cloud-session brief (2026-10-05)

You are a cloud session working on Tushar Pathak's portfolio (`007U5H4R/portfolio-clay`). Tushar delegated M-010 decisions to Claude (decision EXE-26 in `decisions.md`): don't stop to ask, take decisions and list them in your report.

## Hard rules
- **Branch `m010/t2b-cursor` only.** Commit and push to it. Never touch `main` or `m-009-redesign`, never open a PR into `main`, never deploy. Production is frozen.
- Commits: one per subtask, imperative subject ending `(TASK-142.N)`. No AI attribution lines (`Co-Authored-By`, "Generated with…").
- No secrets in code, logs or commits.
- Stay in your lane. Other tracks run in parallel on other branches: T2 dark mode + theme toggle (rewrites `app/globals.css` tokens and theme state) and T3 scene art. **Keep cursor styles out of `app/globals.css`**: put them in the cursor's own stylesheet/module, so the merge with T2 stays clean. Don't edit the theme system, hero, or scene art.
- Don't edit `backlog/` files. Claude updates the Campfire board locally from your report.

## Read (targeted, never a whole spec unless it says so)
- `docs/specs/m-010/cursor.md`, whole file (≈1,400 lines, it's your spec). Implementation order is §52; asset manifest §53; QA §49–51; trail asset checklist §71; cursor-in-dark-mode notes in `docs/specs/m-010/dark-mode.md` §58 only.
- `evaluation-plan.md`: the EVAL-027 and EVAL-028 rows in §9.
- `Design.md` §13 (paper-cut materials, dark palette, the Dev-id range table; T2b owns **Dev-150 … Dev-154**).
- `decisions.md`: S29, EV7–EV11, D13, EXE-26..28.
- `scripts/eval-cases.ts` (`DEFERRED_SPECS`), `tests/e2e/fixtures.ts`, `playwright.config.ts`.

## Subtasks (cursor.md §52 order; Campfire ids)
- **142.1** Audit current pointer/cursor CSS; write the trail asset manifest; make the trail art. If Higgsfield tools are available in this session, generate the paper-cut trail pieces (budget ≤ 30 credits, ≤ 2 regenerations each; style = the paper-cut home hero `content/media/illustrations/hero-banner.webp`). If they're not available, draw the pieces as small inline SVG paper cut-outs (torn edge, soft shadow) and say so in the report. Optimize per §71.
- **142.2** Precise custom cursor (tracks the pointer 1:1) with semantic hover labels.
- **142.3** Paper trail: left-button hold-and-drag only, distance-based spacing, velocity response, section-aware themes.
- **142.4** Exclusion zones + gating (EVAL-028): touch/coarse pointer → nothing mounts and the chunk is never requested; fine pointer mounts only after `load`, never under reduced motion or without JS; zones `input, textarea, select, button, video, iframe, [contenteditable], [data-no-trail]` (incl. the Ask drawer) keep the native cursor and never spawn trail nodes; ≤ 18 active nodes; transform/opacity only; no selection lock after release. EVAL-027: no cursor bytes in the home first-load set.
- **142.5** QA + tuning: write `tests/e2e/eval-028.spec.ts` per the EVAL-028 row and remove EVAL-028 from `DEFERRED_SPECS`. The theme fixture arrives with T2; until then, run the overflow checks with `document.documentElement.dataset.theme` set to `light` and to `dark` directly. Add an "M-010 T2b" section to `test-cases.md` (TC rows → EVAL ids). Screenshots of the cursor and trail at 1440 into `docs/screenshots/m-010/t2b/`.

Use test-driven development for the gating and spacing logic.

## Gate (exact counts in the report)
`pnpm install --frozen-lockfile` · `pnpm typecheck` · `pnpm lint` (0 errors) · `pnpm test` · `pnpm tsx scripts/eval-cases.ts --check-specs` · `pnpm build` · full `pnpm test:e2e`. All green before your final push. If a failure isn't yours (it fails the same way on the branch's starting commit `14d3785`), record that with the evidence instead of "fixing" it.

## Report
Commit `docs/reports/TASK-142.md` (≤ 45 lines): commits, subtask states, gate counts, credits spent or SVG fallback, decisions (Dev-150…154), anything deferred. Push it to `m010/t2b-cursor` as your **last** commit. That file is how Claude learns you're done.
