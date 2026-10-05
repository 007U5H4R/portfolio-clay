# Brief — TSK-38 · Remove the hero motion system + `ProductScene` + their tests; record the JS number

**Ticket:** TSK-38 (Backlog `TASK-68.3`) · parent **TKT-73** (`TASK-68`) · M-009 · Task · P0 · sp:1 · **Depends on:** TSK-37 (done — new hero no longer uses the motion system).
**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign/` · **Branch:** `m-009-redesign` (verify; never `main`, never push).
**Model tier:** cheap (Sonnet 5). **Co-Authored-By trailer:** your session's actual model.

## Objective
A delete-first diff that removes the M-008 hero motion system (the EXE-11 JS overage) with minimal stand-in swaps for its two remaining consumers, then records first-load JS on `/`.

## Read first
1. `technical-plan.md` lines **957–958** (S73.09–S73.10 — the exact delete list, edit list, greps, gates; follow exactly), **882** (F2 motion: what `lib/motion.ts` keeps).
2. `tickets.md` lines **1115** (TKT-73 AC 6), **1132–1135** (TSK-38).
3. `test-cases.md` **TC-143**.

## Scope
- Delete exactly the S73.09 files. Edit exactly: `lib/site.ts` (`avatarAlt` removed) + `tests/unit/site.test.ts`; `tests/unit/motion.test.tsx` (hero cases removed — keep the file and its non-hero cases); `components/about/AboutHero.tsx` (`AvatarStage` → temporary `<Illustration id="scene-about" placement="photo" …/>` with the sizes prop Design §6.4 implies); `components/projects/FeaturedWork.tsx` (`ProductScene` → the plain existing card rendering, no restyle); `app/globals.css` leftover `.hero-*` / `.glow-halo` / `hero-*` keyframes if still present **and** now unused (careful: TSK-37 may have added new `hero`-prefixed classes under its `/* TSK-37 · hero */` banner — keep those).
- `public/avatar/*`, `content/media/avatar/**`, `scripts/avatar*.ts` **stay** (TKT-89; OG still reads the avatar poster until TKT-78). `motion` stays a dependency.
- If a spec other than `avatar-edge.spec.ts` asserted the avatar/ProductScene (e.g. `about.spec.ts`, `featured.spec.ts`, `home.spec.ts`), update its assertion to the stand-in — never delete a spec; list each change.

## Gates
S73.09 grep → 0 lines (quote the command + empty output); `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build`; `pnpm test:e2e` full (counts; failures proven pre-existing or fixed); `pnpm exec tsx scripts/bundle-budget.ts --route / --json` → `firstLoadJsGzipKb` (expected < 180). Then S73.10 ticket wrap: `pnpm eval --only EVAL-001,EVAL-010,EVAL-013,EVAL-018,EVAL-019,EVAL-021 --skip-build` (report each status; EVAL-018 legacy FAILs expected until TKT-74 parks them); screenshots `docs/screenshots/m-009/tracer/hero-390.png` + `hero-1440.png` from a **prod build** (`pnpm start`), Playwright screenshot env per `HANDOFF.md` §7; write `docs/reports/TKT-73.md` roll-up (AC 1–7 with evidence from TSK-36/37 reports + yours; include the JS number and the Fraunces-axes outcome from `docs/reports/TSK-31.md`).

## Constraints
Everything on `/Volumes/E Drive`. GateGuard may deny the first Edit/Write per file — state the facts and retry. Stage explicit paths only (use `git rm` for deletions); never stage `docs/ledger.md`, `docs/briefs/*`, `backlog/**`. Keep the delete-only part its own commit: `refactor(hero): remove the M-008 hero motion system + ProductScene (TSK-38)`; the screenshots/report may be a second commit `docs(m-009): TKT-73 wrap — hero screenshots + report`. Trailer on both.

## Output — `docs/reports/TSK-38.md` + `docs/reports/TKT-73.md` (commit both)
Deleted/edited file list; grep result; e2e counts; JS number; eval statuses; commit SHA(s). Final chat reply ≤ 8 lines.

- **Server scar (TSK-30):** Playwright reuses any live server on :3000 — after every `pnpm build`, kill any running `pnpm start`/`next start` and restart it, or Playwright tests the stale build. Restore any `docs/screenshots/**` PNGs that e2e runs churn (`git checkout -- docs/screenshots`) unless your task produces them.
- **Known pre-existing e2e failures on this branch (M-008 debris, 19):** `.glow-halo` overflow ×11, `featured.spec` vs ProductScene ×5, `tracer.spec` AVATAR_ALT ×4 — see `docs/reports/TSK-30.md` §4a. Report them as pre-existing; any *other* failure is yours to explain.

- **TSK-37 note:** `tests/e2e/tracer.spec.ts` avatar/AVATAR_ALT/tile assertions now fail because the M-008 hero is gone — update them to the paper hero (poster img + alt from `lib/illustrations.ts`, CTAs) in your commit; never delete the spec.
