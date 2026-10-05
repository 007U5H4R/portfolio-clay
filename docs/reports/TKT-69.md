# Report — TKT-69 (`TASK-64`) · Paper tokens + fonts + codemod + EVAL-020 (ticket roll-up)

**Milestone:** M-009 · Phase 0 tracer · P0 · sp:5 · Branch `m-009-redesign` (not pushed).
**Tasks and commits:**
| Task | Backlog | Commit | Report |
|---|---|---|---|
| TSK-30 · `@theme` + derived properties + grain + `AUTHORITATIVE` + codemod | `TASK-64.1` | `a08d2ff` refactor(tokens): rename the 13 clay tokens to the paper palette (S12) | `docs/reports/TSK-30.md` |
| TSK-31 · Fraunces + Inter + Caveat via `next/font`; Manrope removed | `TASK-64.2` | `5ea0ca4` feat(fonts): Fraunces + Inter + Caveat via next/font, Manrope removed (S13) | `docs/reports/TSK-31.md` |
| TSK-32 · `eval-020.test.ts` + `pnpm eval` wiring + ticket wrap | `TASK-64.3` | the commit containing this report: test(eval): EVAL-020 paper token gate with positive control (TKT-69) | `docs/reports/TSK-32.md` |

"Re-verified" below means checked again on the TSK-32 tree (HEAD `5ea0ca4` plus the TSK-32 changes) during the wrap.

## Acceptance criteria
| AC | Criterion (tickets.md) | Evidence | Status |
|---|---|---|---|
| 1 | `tokens:check` 13/13 for exactly the 13 paper names; no other `--color-*`; `--write` is a no-op | **Re-verified:** `pnpm tokens:check` printed `13/13 tokens round-trip OK`. EVAL-020 part 2 found exactly the 13 names as a set. `pnpm tokens:check --write` followed by `git diff --stat app/globals.css` came back empty. TSK-30 had already shown byte-identical `--write` output (`cmp`) | PASS |
| 2 | 0 retired token/utility references in `app/ components/ lib/`; English-word allow-list documented; derived values are `color-mix()` only | **Re-verified:** EVAL-020 parts 3 and 4 found 0 hits. The mutation check (`text-ink` injected) made the test FAIL, and the fixture control caught 5 of 5 planted hits with 0 decoys. No English-word allow-list is needed because the regex is prefix-anchored; this is documented in the test and in `docs/eval.md`. `globals.css` has 27 `color-mix(` values, and its only literals are the 13 `@theme` oklch lines plus the pre-existing clay `--shadow-clay-*` / `--gradient-clay-volume` `rgba()` values (see note 1) | PASS (note 1) |
| 3 | Self-hosted `next/font` for all three families; zero Google Fonts requests; Fraunces `opsz`/`SOFT` or the documented fallback | TSK-31: `axes` accepted, so no Dev-18 fallback was needed. `/` preloads 3 woff2 files, 0 `fonts.googleapis/gstatic` references appear in the HTML, and the built CSS sets `font-variation-settings:"opsz" 144, "SOFT" 30` on h1. Positive control: an injected Google `<link>` was detected. **Re-verified** by the full e2e run: `smoke.spec.ts` "fonts are self-hosted and the h1 is Fraunces with opsz" passed at w1440 (§e2e) | PASS |
| 4 | `body` Inter 16/1.6 navy antialiased; headings Fraunces 500 with `text-wrap: balance`; `.font-hand` is Caveat | **Re-verified** in `app/globals.css`. `body` has `font-family: var(--font-body)`, `font-size: 1rem`, `line-height: 1.6` and `-webkit-font-smoothing: antialiased` (l.166–169). h1–h4 have `font-family: var(--font-display)` and `text-wrap: balance` (l.177–181). `--font-hand: var(--font-caveat)` is declared, and `.font-hand` is always emitted via `@source inline` (TSK-31) | PASS |
| 5 | `eval-020.test.ts` green and wired into `pnpm eval`; typecheck, lint, test and build green; Playwright suites pass or have their assertions updated; no test deleted | `pnpm eval --only EVAL-020 --skip-build` produced `EVAL-020` `status:"PASS"`, `details:"vitest eval-020 pass"` in the run JSON. typecheck 0 · lint 0 · tokens 13/13 · vitest 322 passed, 2 skipped · build OK. `git diff --stat main..HEAD -- tests` shows 11 files, all modified, **0 deleted**. `git log --diff-filter=D 1a3422f..HEAD -- tests` is empty. e2e: see §e2e | PASS, with 19 known pre-existing e2e failures (§e2e) |
| 6 | First-load JS on `/` measured before and after | See the Budget table below: **194.1 → 194.1 kB** gzip | PASS (recorded; gated at TKT-74) |

## Budget (`pnpm exec tsx scripts/bundle-budget.ts --route / --json`)
| | Before (TSK-30 preflight, `1a3422f`) | After TSK-30 | After TSK-31 | After TSK-32 (ticket end) |
|---|---|---|---|---|
| `firstLoadJsGzipKb` | 194.1 | 194.1 | 194.1 | **194.1** |
| `firstLoadJsRawKb` | 625.6 | 625.7 | 625.7 | 625.7 |
| chunks | 10 | 10 | — | 10 |

`overBudget: true` against the 180 kB budget on both sides. That was already the case before this ticket, and TKT-74 owns it (EV6). This ticket added no JS: fonts are CSS/woff2 and tokens are CSS.

## e2e
`pnpm test:e2e` ran the full suite: 4 projects, a fresh `webServer` on the new build, and nothing listening on :3000 beforehand. Result: **691 passed · 19 failed · 802 skipped** (10.4 min). These are the same totals as TSK-31.

**All 19 failures are pre-existing.** The run index and `line:col` were stripped from the failure titles, and the normalized list was compared with TSK-31's `tsk31-fails.norm` using `comm -3`, which printed **0 lines**. It is the same 19 tests: `.glow-halo` overflow ×11, `featured.spec` vs ProductScene ×5, and `tracer.spec` AVATAR_ALT ×4 (the M-008 debris; TSK-30 §4a proved them on `1a3422f`). TSK-32 adds no Playwright spec and changes no runtime code, so none of these can come from this task. The TSK-31 font guard (`smoke.spec.ts` "fonts are self-hosted …") passed at w1440.

**No test deleted:** `git diff --stat main..HEAD -- tests` lists 11 files, all modified with 0 deletions. `git log --diff-filter=D --name-only 1a3422f..HEAD -- tests` is empty. The e2e run's `docs/screenshots/**` churn was restored with `git checkout -- docs/screenshots`.

## Notes for the orchestrator
1. **`globals.css` still holds clay `rgba()` literals** in `--shadow-clay-rest/-hover/-press`, `--shadow-utility` and `--gradient-clay-volume` (l.106–110). EVAL-020 can't see them because `globals.css` is on the literal allow-list (by design: it is the token source). TSK-30 kept these tokens on purpose because consumers still use them until TKT-89. AC 2's "no second literal" holds for the new paper derived values but not for these clay leftovers. **TKT-89 should confirm they are gone**, for example with `grep -cE 'rgba?\(' app/globals.css` → 0. EVAL-020 does not enforce this.
2. **The EVAL-020 literal regex is wider than the plan's.** It uses `rgba?|hsla?`, because the planned `\b(rgb|hsl)\(` misses `rgba(`. It also scans `lib/**` (TC-123 step 4). Neither change added a hit on today's tree.
3. **`lib/motion.ts:141`** is a second `React #185` comment hit, beyond the `Header.tsx` one the brief named. Comment stripping handles both, and the allow-list is unchanged.
4. **Pre-existing e2e debris (19)** still needs owners: `.glow-halo` overflow → TKT-73, `featured.spec` drift → TKT-77, `tracer.spec` `AVATAR_ALT` drift → TKT-73/89. See TSK-30 §4a.
