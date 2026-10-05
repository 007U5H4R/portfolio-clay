# Brief — TSK-31 · Fonts: Fraunces + Inter + Caveat via `next/font/google`; Manrope removed

**Ticket:** TSK-31 (Backlog `TASK-64.2`) · parent **TKT-69** (`TASK-64`) · M-009 · Task · P0 · sp:1 · **Depends on:** TSK-30 (landed — paper tokens in `app/globals.css`).
**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign/` · **Branch:** `m-009-redesign` (verify; never `main`, never push).
**Model tier:** standard (Opus 5.5). **Co-Authored-By trailer:** your session's actual model.

## Objective
Swap the type system to Fraunces (display, variable with `opsz`/`SOFT` axes) + Inter (body/UI) + Caveat (hand), self-hosted by `next/font/google`; remove Manrope from the app (not from `lib/og.tsx` — TKT-78 owns OG fonts). Add the runtime-request guard + heading check to the smoke spec.

## Read first
1. `technical-plan.md` lines **875** (F2 fonts bullet — incl. the axes-rejected fallback), **899–901** (S69.05–S69.06: steps, contract, gates), F1-12 at line **867**.
2. `Design.md` **§2.2** (lines 99–130): the `@theme` font block verbatim, base rules, the role table (only the *base* rules are in scope here — per-role sizes are applied by later page tickets).
3. `tickets.md` lines **1019–1024** (TKT-69 AC 3–4) and **1036–1039** (TSK-31).
4. `test-cases.md` **TC-124** (search `### TC-124`).

## Scope
- `app/layout.tsx`: `Fraunces({ subsets:["latin"], weight:"variable", axes:["opsz","SOFT"], display:"swap", variable:"--font-fraunces" })`, `Inter({ subsets:["latin"], weight:["400","500","600"], display:"swap", variable:"--font-inter" })`, `Caveat({ subsets:["latin"], weight:["400","600"], display:"swap", variable:"--font-caveat" })`; `<html className>` = the three `.variable`s; Manrope loader + `--font-manrope` gone. Keep the existing self-hosting comment accurate.
- `app/globals.css`: `@theme` `--font-display / --font-body / --font-hand` per §2.2 verbatim; `body` Inter 16/1.6 navy antialiased; `h1–h4` Fraunces 500, `line-height 1.02`, `letter-spacing -.015em`, `text-wrap: balance`, a default `font-variation-settings: "opsz" 144, "SOFT" 30` on h1 (h2/h3 base values from the role table are fine); `.font-hand` utility = Caveat. Put your edits under a `/* TSK-31 · fonts */` comment banner. **Do not** change colour tokens.
- If any existing component references `font-manrope` / `var(--font-manrope)` → repoint to `font-display`/`font-body` (mechanical, no restyle).
- `tests/e2e/smoke.spec.ts` (append, S69.06): `page.on("request")` over `/` → 0 requests to `fonts\.(googleapis|gstatic)\.com`; `getComputedStyle(h1).fontFamily` contains "Fraunces" and `fontVariationSettings` contains `"opsz"`.
- **Fallback (only if `next build` rejects `axes`):** `weight:["500"]` static, drop `font-variation-settings`, adjust the smoke assertion, add a `Design.md` §11 row `Dev-18` stating it, and flag it in the report for an `EXE-n` entry (the orchestrator writes decisions.md). Never silent.

## Gates
`pnpm typecheck` · `pnpm lint` · `pnpm tokens:check` (13/13) · `pnpm test` · `pnpm build`; then `pnpm start` in background on :3000 and `curl -s http://127.0.0.1:3000 | grep -oE '/_next/static/media/[^"]+\.woff2' | sort -u | wc -l` ≥ 3 (stop the server after); `grep -rn -i manrope app components lib --include=*.ts --include=*.tsx --include=*.css` → only `lib/og.tsx`; `pnpm test:e2e --project=w1440 tests/e2e/smoke.spec.ts` green; then the full `pnpm test:e2e` (report pass/fail counts; any failure → prove whether it predates your change).
Bundle: `pnpm exec tsx scripts/bundle-budget.ts --route / --json` → `firstLoadJsGzipKb` (expected unchanged ± 1 kB).

## Constraints
Everything on `/Volumes/E Drive` (temp `/Volumes/E Drive/Dev/.scratch/m009`). GateGuard may deny the first Edit/Write per file — state the facts and retry. Stage explicit paths only; do not stage `docs/ledger.md`, `docs/briefs/*`, `backlog/**`. One commit: `feat(fonts): Fraunces + Inter + Caveat via next/font, Manrope removed (S13)` + trailer.

## Output — `docs/reports/TSK-31.md` (commit it)
Axes accepted or fallback taken (with the build log line); woff2 count; the Manrope grep result; smoke + full e2e counts; bundle number; commit SHA. Final chat reply ≤ 8 lines.

- **Server scar (TSK-30):** Playwright reuses any live server on :3000 — after every `pnpm build`, kill any running `pnpm start`/`next start` and restart it, or Playwright tests the stale build. Restore any `docs/screenshots/**` PNGs that e2e runs churn (`git checkout -- docs/screenshots`) unless your task produces them.
- **Known pre-existing e2e failures on this branch (M-008 debris, 19):** `.glow-halo` overflow ×11, `featured.spec` vs ProductScene ×5, `tracer.spec` AVATAR_ALT ×4 — see `docs/reports/TSK-30.md` §4a. Report them as pre-existing; any *other* failure is yours to explain.
