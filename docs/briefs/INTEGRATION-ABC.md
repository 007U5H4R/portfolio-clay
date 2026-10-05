# Brief — Integration pass for the Phase A/B/C fan-out (post-merge fixes + full gate)

**Worktree:** `/Volumes/E Drive/Dev/Code/Claude/Portfolio-m009-integration/` · **Branch:** `m009/integration-ab` (verify). Contains Phase 0 + TKT-92 perf (via `m-009-redesign`) + 14 merged fan-out branches: TKT-75/76/77/78 (Phase A), TKT-80/81/82/83/84 (Phase B), TKT-86/87 + TSK-45/46/47 (Phase C). Never push, never touch `main`.
**Model:** Opus 5.5. **Co-Authored-By trailer:** your actual model. Tushar is AFK with delegated authority to the orchestrator (EXE-20): decide by plan/Design precedence, record decisions in your report.

## Read first
`/Volumes/E Drive/Dev/.scratch/m009/merge-notes.md` (every merge note), `decisions.md` EXE-15…20, `Design.md` §11, the per-ticket reports in `docs/reports/` (TKT-75, 76, 77, 78, 80, 81, 82, 83, 84, 86, 87, TSK-45, 46, 47, TKT-92).

## 1 · Post-merge fixes (small, mechanical — one commit each or grouped logically)
1. **`.hand-cite` 13 → 14 px** in the base CSS (the TSK-34 content-paper block of `app/globals.css`; EVAL-008 content floor). Leave the per-ticket 14 px overrides in place.
2. **TKT-81 `tests/e2e/case-study.spec.ts`** expects `ChapterNav` visible at `w390`; by design (Dev-09, TP14 `MediaGate`) it is absent below 1024 → assert count 0 below 1024 and visible ≥ 1024. Don't weaken anything else.
3. **`app/page.tsx`:** drop the unused `tone:` field (TKT-76 note) and the stale TKT-12 comment above `<FeaturedWork/>` (TKT-75 note); `components/projects/ProjectCard.tsx` comment mentioning the deleted `EditorialGrid` (TKT-80 note).
4. **EVAL-015 view transitions:** the `icon-{slug}` VT name was removed from cards/`/work` (TKT-75/80) while `CaseStudyHeader` may still carry it → make it consistent (the `project-{slug}` transition remains); run `tests/e2e/eval-015.spec.ts`.
5. **Design.md §11 reconcile:** add rows (next free Dev-25…) for the deviations the ticket reports list — e.g. TKT-75 metric selection by Design §7.1 not "measured only"; TKT-81 no taped header photo (opener shows the scene) + tags 12 px; TKT-83's five rows (its report lists them); TKT-84 no scene photos on thinking/essay + decoration counts 2/1; TKT-86 AC5 (no hero image) + 13 → 14 px lines; TKT-87 patent stamp "TP", award years terracotta; TSK-45 tilts held to ±0.9°, 14 px eyebrows; TSK-46 no taped portrait (caption kept), GitHub postcard row kept (S5 conditional). Disposition "Stage-7 default (delegated, EXE-20)". Keep §3.3 planned counts consistent or note the actuals.

## 2 · Full gate (through the lock: `"/Volumes/E Drive/Dev/.scratch/m009/heavy.sh" …`; no other agents are running now)
- `pnpm typecheck && pnpm lint && pnpm tokens:check && pnpm test && pnpm build` (all 13 routes static).
- **Workers trial (EXE-20):** change `playwright.config.ts` to `workers: Number(process.env.PW_WORKERS ?? 2)` and update its comment (M-003 history + EXE-20 trial). Run the FULL `pnpm test:e2e` (4 projects, fresh prod server) **twice**. Keep 2 only if both runs are fully green; if either run shows a failure that passes with `PW_WORKERS=1`, revert the default to 1 and say so. Report both runs' counts and durations.
- Any real failure (reproduces at 1 worker): diagnose root cause and fix (bounded — at most 3 fix rounds); never skip/delete a test or lower a threshold. Pay special attention to: the intermittent ChapterNav click → no scroll at `w1024` (Lenis path, TKT-83 note — trace in `/Volumes/E Drive/Dev/.scratch/m009/tkt83/results-run2/`), EVAL-007/010/015/018 across all routes, EVAL-008 text floors.
- Then `pnpm eval --label integration-abc-<sha>` (full) and quote the totals + any FAIL.
- `pnpm exec tsx scripts/bundle-budget.ts --route / --json` (≤ 180 kB) and for `/work`, `/about`.
- `tests/e2e/eval-018-parked.json` must be `[]` (TP12).

## Constraints
Everything on `/Volumes/E Drive`. GateGuard may deny the first Edit/Write per file — state the facts and retry. Stage explicit paths only; restore churned `docs/screenshots/**` you didn't produce. Commits on `m009/integration-ab` with the trailer.

## Output — `docs/reports/INTEGRATION-ABC.md` (commit it)
Fixes applied (with files), Design §11 rows added, full-gate numbers, both e2e runs (counts, duration, flakes), workers decision, eval totals, bundle numbers, remaining issues (with owner ticket: TKT-79 home assembly, TKT-85 Phase B gate, TKT-89 cleanup, TKT-90 QA, or Stage 8). Final chat reply ≤ 12 lines.
