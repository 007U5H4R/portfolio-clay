# Brief — TSK-37 · Hero section + `HeroClip` (TP13) + `eval-019.spec.ts` + un-defer EVAL-019

**Ticket:** TSK-37 (Backlog `TASK-68.2`) · parent **TKT-73** (`TASK-68`) · M-009 · Task · P0 · sp:3 · **Depends on:** TSK-36 (done — manifest + assets), TKT-70 (done — primitives).
**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign/` · **Branch:** `m-009-redesign` (verify; never `main`, never push).
**Model tier:** most-capable (Fable 5.1). **Co-Authored-By trailer:** your session's actual model.

## Objective
The tracer's riskiest slice: the illustrated `/` hero whose poster is the LCP image in every mode, plus a one-shot clip mounted **only** in default mode that plays once and holds — proven by a 4-mode × 2-width Playwright matrix.

## Read first
1. `Design.md` **§5** (all of it: 5.1 layout, 5.2 markup per mode, 5.3 detection + lifecycle — esp. 5.3.4 "never re-decide", 5.4 states), **§6.3** hero alt, **§3.3** `/` hero row (count = 3), **§8** (draw-in on the h1 underline).
2. `decisions.md` **TP13** (line 396) and **D10** (371) — the state machine is fixed; don't redesign it.
3. `technical-plan.md` lines **878** (F2 hero bullet), **865** (F1-10 fixtures/projects), **951–954** (S73.05–S73.08 — your steps + gates; follow exactly).
4. `tickets.md` lines **1103–1119** (TKT-73 AC 2, 3, 5, 7), **1127–1130** (TSK-37).
5. `test-cases.md` **TC-139, TC-140, TC-141, TC-142**.
6. Existing: `components/hero/Hero.tsx` (current M-008 hero — you replace its render; the old motion files are deleted in TSK-38, not by you — if the new `Hero` no longer imports them that's fine, leave the files), `data/hero.ts`, `lib/illustrations.ts`, `components/paper/*`, `tests/e2e/fixtures.ts`, `tests/e2e/home.spec.ts`, `scripts/eval-cases.ts`, `eslint.config.mjs`.
7. Mockup: `docs/redesign-mockups/m-009/home.html` hero block (layout reference; copy comes from `data/hero.ts` per D7).

## Scope
- `components/hero/HeroClip.tsx` exactly per S73.05 / TP13, plus the ESLint `no-restricted-syntax` rule scoped to that file (`.currentTime =`, `.load(`, `loop`), `tests/unit/hero-clip.test.tsx`.
- `components/hero/Hero.tsx` (server) per S73.06; CSS under a `/* TSK-37 · hero */` banner in `app/globals.css` (tokens/derived only — EVAL-020 live).
- `tests/e2e/eval-019.spec.ts` (`@EVAL-019`) + `saveData` fixture in `tests/e2e/fixtures.ts` per S73.07; update `tests/e2e/home.spec.ts` hero assertions (avatar/tiles → poster/CTAs; no spec deleted).
- `scripts/eval-cases.ts` `DEFERRED_SPECS` → `{}` (EVAL-018 already removed by TSK-35); `docs/eval.md` EVAL-019 section.
- Leave `app/page.tsx` section order alone except what the hero import needs (TKT-74 assembles).

## Gates
- Prod build only for hero checks (never `next dev` — image-cache scar): `pnpm build && pnpm start` (background, :3000; stop after). `curl -s http://127.0.0.1:3000 | grep -c '<video'` → 0; prove the poster `img` carries `fetchpriority="high"` (adapt the S73.06 grep if attribute order differs); alt string count → 1.
- `pnpm test -- hero-clip` green; `pnpm test:e2e --project=w1440 --project=w390 tests/e2e/eval-019.spec.ts` green (all modes; report per-mode results and the measured `ended` time).
- Held-frame screenshot → `docs/screenshots/m-009/tracer/hero-end-1440.png`; compare visually to `/Volumes/E Drive/Dev/Code/Claude/Portfolio-illustration/animation/export/hero-end.webp` (Read both images) and describe the match in the report.
- `pnpm exec tsx scripts/eval-cases.ts --check-specs` OK; `pnpm eval --only EVAL-019,EVAL-021 --skip-build` → both `PASS`.
- `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build`; `pnpm test:e2e --project=w1440 --project=w390 tests/e2e/eval-018.spec.ts` → `/` hero unit count = 3 (other legacy-section hits on `/` may still fail — list them, don't fix them).
- Playwright env: `PLAYWRIGHT_BROWSERS_PATH="/Volumes/E Drive/Dev/.cache/ms-playwright" TMPDIR="/Volumes/E Drive/Dev/.scratch"` (already in `.env.tooling` for `pnpm test:e2e`).

## Constraints
Everything on `/Volumes/E Drive`. GateGuard may deny the first Edit/Write per file — state the facts and retry. Stage explicit paths only; never stage `docs/ledger.md`, `docs/briefs/*`, `backlog/**`. If the matrix is flaky (e.g. `ended` timing under load), diagnose (don't add retries or widen the 4 s bound) and report. Commits: `feat(hero): illustrated hero + HeroClip once-and-hold (TSK-37)` and `test(eval): EVAL-019 hero mode matrix (TSK-37)` (or one) + trailer.

## Output — `docs/reports/TSK-37.md` (commit it)
Per-mode × width matrix results; `ended` ms; SSR greps; hero EVAL-018 count; held-frame comparison note; gate outputs; commit SHA(s). Final chat reply ≤ 10 lines.

- **Server scar (TSK-30):** Playwright reuses any live server on :3000 — after every `pnpm build`, kill any running `pnpm start`/`next start` and restart it, or Playwright tests the stale build. Restore any `docs/screenshots/**` PNGs that e2e runs churn (`git checkout -- docs/screenshots`) unless your task produces them.
- **Known pre-existing e2e failures on this branch (M-008 debris, 19):** `.glow-halo` overflow ×11, `featured.spec` vs ProductScene ×5, `tracer.spec` AVATAR_ALT ×4 — see `docs/reports/TSK-30.md` §4a. Report them as pre-existing; any *other* failure is yours to explain.
