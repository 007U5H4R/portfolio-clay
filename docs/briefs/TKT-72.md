# Brief — TKT-72 · `BandFooter` on every route (S16) + `hero.tagline` rendered (S18 regression TC-135) + `FinalCTA` removed

**Ticket:** TKT-72 (Backlog `TASK-67`) · M-009 · Feature · P0 · sp:3 · **Depends on:** TKT-69, TKT-70 (done). TKT-71/73 have also landed — don't touch header/hero files.
**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign/` · **Branch:** `m-009-redesign` (verify; never `main`, never push).
**Model tier:** standard (Opus 5.5). **Co-Authored-By trailer:** your session's actual model.

## Objective
One closing CTA on every page — the terracotta band — with the previously unrendered `hero.tagline` finally shown once, in the © bar, as a sourced hand quote; no PII.

## Read first
1. `Design.md` **§4.2** (band markup, verbatim), **§2.1** (band contrast pairs + derived `--on-band*`/`--band-hatch`), **§3.3** band row (unit count 1 = `torn`), **§3.4** (quote rule: ≤ 240 chars + cite).
2. `decisions.md` **S16** (301), **S18** (311), **S5** (GitHub only when public — search `## S5`), **EXE-8** (search: real contact = email/LinkedIn; no phone/DOB/address).
3. `technical-plan.md` lines **858** (F1-3 tagline unused), **880** (F2 band), **1126** (E-20), **936–940** (S72.01–S72.05 — your steps + gates; follow exactly).
4. `tickets.md` lines **1091–1101** (TKT-72 description, AC 1–8, notes).
5. `test-cases.md` **TC-134, TC-135, TC-136, TC-137**.
6. Existing: `components/layout/Footer.tsx`, `components/home/FinalCTA.tsx`, `app/{layout,page}.tsx`, `lib/site.ts`, `data/hero.ts`, `data/projects.ts` (`links.repoPublic`), `resumeAction()` (grep), `components/paper/{TornEdge,Hand,DraftTag}.tsx`, `tests/unit/forbidden-strings.test.ts`, `tests/e2e/{layout,home}.spec.ts`, mockup `docs/redesign-mockups/m-009/home.html` band block.

## Scope
Per S72.01–S72.04: `lib/site.ts` `showLocation: false as boolean` (+ doc comment) + `tests/unit/site.test.ts`; `components/layout/BandFooter.tsx` (server; §4.2 verbatim; hiring line with `<DraftTag/>`; GitHub circle only when `site.github` **and** any `links.repoPublic`; résumé via `resumeAction()` incl. PB5 placeholder; tagline via `<Hand kind="quote" cite={hero.tagline.source}>` with the sr-only `Source:` sibling; location behind the flag; D8-fallback Playground link **not** added); `.band` CSS under a `/* TKT-72 · band */` banner (tokens/derived only — EVAL-020 live); swap `<Footer/>` → `<BandFooter/>` in `app/layout.tsx`; remove `FinalCTA` from `app/page.tsx`; `git rm` `components/home/FinalCTA.tsx` + `components/layout/Footer.tsx`; tests `tests/unit/{band-footer,contrast-pairs}.test.ts(x)`, `tests/e2e/{layout,home}.spec.ts` updates (FinalCTA assertions replaced by band assertions — no spec deleted).

## Gates
`pnpm test -- band-footer contrast-pairs site forbidden-strings` green (tagline exactly once in `[data-hand="quote"]` with sr-only Source; location flag false/true via module mock; GitHub conditional; the four contrast pairs computed from `AUTHORITATIVE` + `color-mix` percentages meet their thresholds — if a pair fails, **stop and report the numbers**; never lower a threshold); grep `FinalCTA\|layout/Footer` in `app components tests` → 0; Playwright: every `routes.json` static route + 404 has exactly one `footer`, `h2#band-h` starts with "Let's"; axe 0 critical/serious on `/` at 390/1440 with the band in view; `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build`; `pnpm test:e2e` full (counts); `pnpm eval --only EVAL-006,EVAL-008,EVAL-011,EVAL-013,EVAL-016,EVAL-018 --skip-build` (band unit = 1; list other statuses honestly); screenshots `docs/screenshots/m-009/band-390.png`, `band-1440.png` (prod build).

## Constraints
Never publish PII (email + LinkedIn only; no phone/DOB/address; "Bengaluru, India" stays behind the false flag). Everything on `/Volumes/E Drive`. GateGuard may deny the first Edit/Write per file — state the facts and retry. Stage explicit paths only; never stage `docs/ledger.md`, `docs/briefs/*`, `backlog/**`. Commits (1–2) + trailer, e.g. `feat(band): terracotta band footer on every route, tagline rendered (TKT-72)`.

## Output — `docs/reports/TKT-72.md` (commit it)
AC 1–8 each with evidence; contrast numbers; e2e counts; eval statuses; screenshots; commit SHA(s). Final chat reply ≤ 10 lines.

- **Server scar (TSK-30):** Playwright reuses any live server on :3000 — after every `pnpm build`, kill any running `pnpm start`/`next start` and restart it, or Playwright tests the stale build. Restore any `docs/screenshots/**` PNGs that e2e runs churn (`git checkout -- docs/screenshots`) unless your task produces them.
- **Known pre-existing e2e failures on this branch (M-008 debris, 19):** `.glow-halo` overflow ×11, `featured.spec` vs ProductScene ×5, `tracer.spec` AVATAR_ALT ×4 — see `docs/reports/TSK-30.md` §4a. Report them as pre-existing; any *other* failure is yours to explain.

- **Full-suite rule (TSK-34 scar):** run the FULL `pnpm test:e2e` (all four projects) on a freshly restarted prod server — never a subset — and diff the failure list against the current baseline: **2 known failures** (`eval-018 /about` @ w390 + w1440 → parked at TKT-74). Any other failure is yours. (The 19-failure list above is obsolete — cleared by TSK-38.)

- **Band contrast trap:** `DraftTag` defaults to `text-terracotta` — on the terracotta band that is invisible. Give it an on-band variant (e.g. `tone="onBand"` → note or ivory text + an `--on-band`-based border) and include that pair in `contrast-pairs.test.ts`; eval-008 checks micro-label contrast ≥ 4.5:1 against the resolved background.
