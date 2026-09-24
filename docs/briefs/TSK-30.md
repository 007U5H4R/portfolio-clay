# Brief — TSK-30 · Paper `@theme` + derived properties + grain + `AUTHORITATIVE` + token codemod

**Ticket:** TSK-30 (Backlog `TASK-64.1`) · parent **TKT-69** (`TASK-64`) · Milestone **M-009** · Task · P0 · sp:2
**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay-redesign/` · **Branch:** `m-009-redesign` (verify `git branch --show-current`; never `main`, never push).
**Model tier:** most-capable (Fable 5.1). **Co-Authored-By trailer:** your session's actual model.

## Objective
Swap the 13 clay colour tokens for the 13 paper tokens **in one atomic commit** (S12): `app/globals.css` `@theme`, the derived `:root` properties, the paper grain replacing the aurora, `scripts/tokens-check.ts` `AUTHORITATIVE`, and a codemod that renames every consumer so every legacy page keeps rendering and the gate stays 13/13. Colours change, shapes don't — **no component restyling**.

## Read first (exact sections only)
1. `technical-plan.md` lines **847–851** (F0 conventions), **853–870** (F1 facts — especially **F1-6** aurora is `body::before`, **F1-11** hotspots + "tone prop names stay"), **874** (F2 tokens bullet), **893–897** (S69.01–S69.04 — this is your step list and gates, follow it exactly).
2. `Design.md` **§2.1** (lines ~41–98): the 13 hex values in order, the `@theme` block, the derived `color-mix()` table, grain values. **§2.3** (lines ~131–135) for radius/shadow tokens. **§10** focus ring.
3. `tickets.md` lines **1013–1034** (TKT-69 AC + TSK-30 notes).
4. `test-cases.md` **TC-122, TC-123, TC-125** (search `### TC-122`).

## Steps (S69.01 → S69.04; gates in the plan)
- **S69.01** `scripts/tokens-check.ts` — `AUTHORITATIVE` = the 13 paper `--color-<name>` → hex pairs in §2.1 order. Also update the header comment's source reference to `Design.md §2.1` (DESIGN_DIRECTION.md is the clay source). Nothing else changes.
- **S69.02** `app/globals.css` — replace the 13 `--color-*` lines with the §2.1 block; add the `:root` derived block (every value `color-mix()` on `var(--color-*)` — no second literal); `body::before` → paper grain (fixed, `pointer-events:none`, `z-index:-1`, no animation) replacing aurora gradients + `aurora-drift`; delete `.glass`, `.glow-halo`, `hero-*` keyframes/classes and `.hero-highlight` **only if** that does not break the build — their consumers (Header glass, hero components) are removed in TKT-71/73; if a class still has a live consumer, **leave the class, note it in the report** (don't restyle components). `html` base → `@apply bg-paper text-navy`; focus ring per §10 (`outline` rust 2px, offset 3px, radius 4px); reduced-motion block keeps the global 1 ms rule, drops aurora/hero lines; add `--radius-paper`, `--radius-paper-sheet`, `--shadow-paper`, `--shadow-paper-hover`, `--shadow-sticky` to `@theme`; clay radius/shadow/gradient tokens stay (TKT-89 deletes). Then `pnpm tokens:check --write && pnpm tokens:check` → `13/13 tokens round-trip OK`.
- **S69.03** `scripts/codemod-tokens.ts` — the MAP, regex rules (a)–(d), longest-key-first, prints every `file:line old → new`, `--dry` mode, and the built-in self-test fixture exactly as S69.03 states. **Caution on rule (a):** `text-ink` must not match inside `text-ink-2`/`text-ink-3` (longest-first + the `(?=[\s"'`/:\]]|$)` lookahead handle it — verify with the self-test; add `text-ink-2 border-accent-deep` cases to the self-test). Also consider template-literal/`cn()` string pieces and CSS `--color-x` references inside `globals.css` itself (the derived block you write fresh).
- **S69.04** run it for real; read your own printed rewrite list for false positives (English words, `bg-white`, `text-white`, `tone="mint"` prop values, `data-tone`, keys in `tiers.ts` that are enum names). Update colour assertions in `tests/unit/{tiers,clay,ClayButton}.test.tsx` (rename, never delete). Run the S69.04 greps → 0.

## Gates (all before commit)
`pnpm tokens:check` 13/13 · `grep -cE '^\s*--color-[a-z0-9-]+:' app/globals.css` = 13 · `grep -c aurora app/globals.css` = 0 · S69.04 retired-name greps = 0 · `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm build`. Then `pnpm test:e2e` (full; uses `.env.tooling`, E-drive temp). If an e2e spec asserts a clay colour/class, update its assertion in the same commit; **no spec deleted**. If e2e failures are pre-existing/flaky and unrelated, prove it (run the failing spec on the pre-change tree via `git stash`) — don't paper over.
Record `pnpm exec tsx scripts/bundle-budget.ts --route / --json` `firstLoadJsGzipKb` **before** (on the untouched tree — a prod build already exists from preflight in `.next`) and after.

## Constraints
- Everything on `/Volumes/E Drive`; temp → `/Volumes/E Drive/Dev/.scratch/m009`.
- **Do not** touch `lib/og.tsx` hex tables (TKT-78), fonts (TSK-31), or add the eval-020 test (TSK-32).
- A GateGuard hook may deny the first Edit/Write per file asking for facts (importers, no duplicate, data shape, verbatim instruction) — state them briefly and retry.
- Stage explicit paths only (never `git add -A`); `git diff --stat` must show only token/codemod-touched files. One commit: `refactor(tokens): rename the 13 clay tokens to the paper palette (S12)` + Co-Authored-By trailer.
- If the retired-name grep cannot reach 0 without restyling a component, stop and report the exact hits instead of improvising.

## Output — `docs/reports/TSK-30.md`
Files changed (count + stat); the codemod's rewrite count (target ≈ 428 ± 30) and a false-positive review note; any rewrites you **reverted** and why; classes left in `globals.css` because of live consumers; all gate outputs (numbers, not "passed"); bundle-budget before/after; commit SHA; anything for the orchestrator's review (e.g. a visible colour change that looks wrong). Keep your final chat reply to ≤ 10 lines pointing at the report.
