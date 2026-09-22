# Brief — M-007 phase QA gate + TKT-52 record run (QA-tester) · TASK-48 (local slice)

**You are a fresh QA-tester subagent, SEPARATE from the implementers who built M-007.** Self-contained brief — no prior chat context. Your job: independently run the full quality suite over the finished `m-007-quality` branch, report PASS/FAIL/BLOCKED/NA per case, and produce the canonical record eval-run. Verify honestly; do NOT fix code (log findings). Read cited files yourself.

## Repo / environment
- Root: `/Volumes/E Drive/Dev/Code/Claude/Portfolio-clay/` — **everything on E Drive**. Branch `m-007-quality` (checked out). You may commit ONLY the evidence artifacts + gate report + a `.gitignore` hygiene line described below — no source/product code changes (if you find a defect, log it, don't fix it).
- **Host memory-tight. Run the full suite FOREGROUND with a stop-rule; check `uptime` first; `workers:1` (pinned); one Playwright/eval invocation at a time (:3000). NEVER a background Monitor (deadlocks on OOM).** Use `pnpm eval` / `pnpm run test:e2e` (they load `.env.tooling` → `PLAYWRIGHT_BROWSERS_PATH` on E Drive) — NEVER raw `pnpm exec playwright test`. If the eval stalls at 0% CPU / load spikes, reap procs, wait for calm, retry once; if still failing, report the environmental block with the partial evidence — do NOT loop or weaken anything.

## What M-007 changed (context for your gate)
TKT-49 perf (bundle levers + EXE-10 bundle-budget noModule fix), TKT-47 responsive (EVAL-008 broadened to 22 routes + essay-CTA 44px fix), TKT-48 a11y (EVAL-006/010 broadened, QA-003 heading fix), carry-forwards (crawler timeout→warn, TC-091 content-rules, CF-3 heading-order guard), QA-004 (/work heading), TKT-50 code (headers/analytics/predeploy). Deploy is HARD-STOPPED (no preview URL).

## Procedure
1. `uptime` → `pnpm typecheck` + `pnpm lint` + `pnpm build` (all must be green) → **full `pnpm eval --label eval-run-v1.0.0-rc`** (all 17 EVAL cases, local production build; this is TKT-52's canonical record run — persist to `evals/results/eval-run-v1.0.0-rc.json`) → **full `vitest run`** + note the e2e totals the eval produced.
2. Produce `docs/reports/M007-qa.md` with a per-case table: for every EVAL-001…017 and the M-007 TC cases (TC for TKT-47/48/49 + TC-091 + regressions of earlier phases), report **PASS / FAIL / BLOCKED / NA** with evidence (numbers, not adjectives).
3. **Known accepted-risks to CONFIRM (not re-litigate) — these are decisions, cite them, don't fail the gate on them:**
   - **EVAL-005 bundle** = 189.3 kB gz > 180 (informational). EXE-10 fixed the measurement (noModule excluded, 180 unchanged, still exits 1); EXE-11 provisional B2 keeps the approved cursor-spring; the Lighthouse *score* is verified at the Vercel preview (swiftshader unreliable here). Report the honest number; mark as accepted-risk pending Tushar, NOT a gate failure.
   - **EVAL-004 mobile Lighthouse** perf may be low under swiftshader/no-GPU (documented M-002/M-003/M-006) → verify at preview. Report measured + env caveat.
   - **EVAL-016 headers / EVAL-017 inspector** need a live deploy (TKT-50/51) → BLOCKED-on-preview, not FAIL. (EVAL-017 OG *tags* in the built HTML you CAN and should verify locally — do that; only the live inspector is deferred.)
   - Dev-only advisories: EXE-2 (extract-zip highs, allowlisted) + a new MODERATE `uuid` via `@lhci/cli` (below the high gate) → note for Stage 10.
4. **No threshold weakening (EV2).** If a genuinely NEW failure/regression appears (not one of the above accepted-risks), report it as a `QA-###` with evidence — do NOT hide it, do NOT weaken a threshold, do NOT fix code (that's a follow-up decision for the orchestrator).
5. **Eval-run hygiene (TKT-52 tidiness):** there are ~30 untracked transient `evals/results/eval-run-0.2.0-<sha>.json` per-commit dev runs cluttering the tree. Add a `.gitignore` rule to ignore the transient pattern `evals/results/eval-run-0.2.0-*.json` while KEEPING the deliberate artifacts tracked: `baseline-*.json` and the canonical `eval-run-v1.0.0-rc.json` (the `v1.0.0-rc` label differs from the `0.2.0-<sha>` pattern, so it's not caught — verify). Do NOT delete the untracked files (evidence history); just stop them cluttering future `git status`. Confirm `git status` is clean of the transient noise afterward.
6. Single verdict at the top of the report: **PASS / PASS-WITH-ACCEPTED-RISKS / FAIL**, with the release-blocker list (should be empty except the deploy hard-stops) and the accepted-risk register.

## Report + commit
- `docs/reports/M007-qa.md` (the gate report), `evals/results/eval-run-v1.0.0-rc.json` (canonical), `.gitignore` (hygiene line). Commit these with trailer `Co-Authored-By: <your actual session model> <noreply@anthropic.com>`.
- Report back concisely: the single verdict; typecheck/lint/build; full-eval pass/fail/blocked counts + the record file path; vitest + e2e totals; per-EVAL one-line status; any NEW QA-### (with evidence); confirmation the accepted-risks are as listed (no NEW blockers); eval-run hygiene done; any environmental blocks.
