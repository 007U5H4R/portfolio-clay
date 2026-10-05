# Brief — TSK-32 · `tests/unit/eval-020.test.ts` + `pnpm eval` wiring

**Ticket:** TSK-32 (Backlog `TASK-64.3`) · parent **TKT-69** (`TASK-64`) · M-009 · Task · P0 · sp:2 · **Depends on:** TSK-30 (paper tokens + codemod landed), TSK-31 (fonts landed).
**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign/` · **Branch:** `m-009-redesign` (verify; never `main`, never push).
**Model tier:** standard (Opus 5.5). **Co-Authored-By trailer:** your session's actual model.

## Objective
Make EVAL-020 (the paper token gate) a real, self-proving Vitest case that `pnpm eval` reports from actual output, then wrap TKT-69.

## Read first
1. `technical-plan.md` lines **860** (F1-5: Vitest cases match by file name), **866** (F1-11: tone *prop* names stay — the retired-name grep matches utility-prefix + token forms and `--color-<name>` only), **903–906** (S69.07–S69.09: contract + gates — follow exactly).
2. `evals/eval-cases.json` the `EVAL-020` entry (thresholds 13/13 · 13 · 0 · 0) and `scripts/eval.ts` ~line 626 (generic Vitest mapping — should need **no** change; confirm).
3. `test-cases.md` **TC-122, TC-123** (search `### TC-122`).
4. `docs/eval.md` "Layers → EVAL ids" + "Adding a new evaluation case".

## Scope
- `tests/unit/eval-020.test.ts` implementing S69.07 parts (1)–(5); factor the scanners as named functions inside the file so the fixture control uses **the same functions** as the real scan.
- `tests/fixtures/retired-tokens.fixture.txt` — the positive control (≥ 4 hits: `text-ink-3`, `bg-lavender/30`, `#FAF9FF`, `oklch(0.5 0.1 200)`, `var(--color-accent)`).
- **Known false positive:** `components/navigation/Header.tsx:17` has `React #185` inside a `//` comment — the hex regex matches it. Decide the rule deliberately: strip `//` line comments and `/* */` block comments before the literal scan (document why in the test), and add a comment-only line (e.g. `// see React #185`) to the fixture that must **not** count. Do **not** edit `Header.tsx` (TKT-71 rewrites it) and do **not** add path allow-list entries beyond `app/globals.css` + `lib/og.tsx`.
- The English-word allow-list the AC mentions: your retired-name regex is prefix-anchored (`bg-|text-|border-|…` + name, and `var(--color-<name>)` / `--color-<name>:`), so bare words like "surface" in copy never match — say so in a comment; if you need an explicit allow-list, keep it tiny and documented.
- `docs/eval.md` — EVAL-020 row/section: what it checks, how to run (`pnpm test -- eval-020`, `pnpm eval --only EVAL-020 --skip-build`), the comment-stripping rule.

## Gates
1. `pnpm test -- eval-020` green; then **mutation check**: temporarily add `className="text-ink"` to any component, run → must FAIL; revert (`git diff` clean for that file) — record both outputs in the report.
2. `pnpm eval --only EVAL-020 --skip-build` → results JSON has `EVAL-020` `status: "PASS"` (check with a `node -e` read of the written file's `cases[]`; quote the line).
3. S69.09 ticket wrap: `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build` · `pnpm test:e2e` full (counts; failures proven pre-existing or fixed) · `git diff --stat main..HEAD -- tests` reviewed for deleted specs (list any deletions — there must be none from M-009 commits) · `pnpm exec tsx scripts/bundle-budget.ts --route / --json` number.
4. Write `docs/reports/TKT-69.md` — the ticket roll-up: AC 1–6 each with evidence (pull TSK-30/31 numbers from `docs/reports/TSK-30.md` / `TSK-31.md`, re-verify the cheap ones), BUDGET before (TSK-30's report) / after, e2e counts, commits of TSK-30/31/32.

## Constraints
Everything on `/Volumes/E Drive` (temp `/Volumes/E Drive/Dev/.scratch/m009`). GateGuard may deny the first Edit/Write per file — state the facts and retry. Stage explicit paths only; do not stage `docs/ledger.md`, `docs/briefs/*`, `backlog/**`, or `evals/results/*` run files unless the repo already tracks that pattern (check `git ls-files evals/results | head`). One commit: `test(eval): EVAL-020 paper token gate with positive control (TKT-69)` + trailer.

## Output — `docs/reports/TSK-32.md` + `docs/reports/TKT-69.md` (commit both)
Final chat reply ≤ 8 lines: commit SHA, EVAL-020 status line, e2e counts, budget number, anything needing judgement.

- **Server scar (TSK-30):** Playwright reuses any live server on :3000 — after every `pnpm build`, kill any running `pnpm start`/`next start` and restart it, or Playwright tests the stale build. Restore any `docs/screenshots/**` PNGs that e2e runs churn (`git checkout -- docs/screenshots`) unless your task produces them.
- **Known pre-existing e2e failures on this branch (M-008 debris, 19):** `.glow-halo` overflow ×11, `featured.spec` vs ProductScene ×5, `tracer.spec` AVATAR_ALT ×4 — see `docs/reports/TSK-30.md` §4a. Report them as pre-existing; any *other* failure is yours to explain.
